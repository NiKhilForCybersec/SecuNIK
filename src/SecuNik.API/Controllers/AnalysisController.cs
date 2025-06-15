using Microsoft.AspNetCore.Mvc;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using SecuNik.Core.Exceptions;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace SecuNik.API.Controllers
{
    /// <summary>
    /// Main controller for file analysis operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AnalysisController : ControllerBase
    {
        private readonly IAnalysisEngine _analysisEngine;
        private readonly ILogger<AnalysisController> _logger;
        private readonly string _uploadPath;

        public AnalysisController(IAnalysisEngine analysisEngine, ILogger<AnalysisController> logger, IConfiguration configuration)
        {
            _analysisEngine = analysisEngine;
            _logger = logger;
            _uploadPath = configuration["FileUpload:Path"] ?? Path.Combine(Path.GetTempPath(), "SecuNik");

            // Ensure upload directory exists
            Directory.CreateDirectory(_uploadPath);
        }

        /// <summary>
        /// Upload and analyze a file
        /// </summary>
        [HttpPost("upload")]
        [ProducesResponseType(typeof(AnalysisResult), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<ActionResult<AnalysisResult>> UploadAndAnalyze(IFormFile file, [FromForm] string? options = null)
        {
            try
            {
                // Validate file
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new ErrorResponse("No file provided or file is empty"));
                }

                // Check file size (50MB limit)
                if (file.Length > 50 * 1024 * 1024)
                {
                    return BadRequest(new ErrorResponse("File size exceeds 50MB limit"));
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(_uploadPath, fileName);

                // Save uploaded file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation("File uploaded: {FileName} ({Size} bytes)", file.FileName, file.Length);

                // Parse analysis options
                var analysisOptions = new AnalysisOptions();
                if (!string.IsNullOrEmpty(options))
                {
                    try
                    {
                        var optionsDto = System.Text.Json.JsonSerializer.Deserialize<AnalysisOptionsDto>(options);
                        if (optionsDto != null)
                        {
                            analysisOptions.EnableAIAnalysis = optionsDto.EnableAIAnalysis;
                            analysisOptions.GenerateExecutiveReport = optionsDto.GenerateExecutiveReport;
                            analysisOptions.IncludeTimeline = optionsDto.IncludeTimeline;
                            analysisOptions.MaxSecurityEvents = optionsDto.MaxSecurityEvents;
                            analysisOptions.FocusKeywords = optionsDto.FocusKeywords;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning("Failed to parse analysis options: {Error}", ex.Message);
                    }
                }

                // Create analysis request
                var analysisRequest = new AnalysisRequest
                {
                    FilePath = filePath,
                    OriginalFileName = file.FileName,
                    Options = analysisOptions
                };

                // Perform analysis
                var result = await _analysisEngine.AnalyzeFileAsync(analysisRequest);

                // Clean up uploaded file
                try
                {
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Failed to delete temporary file: {Error}", ex.Message);
                }

                return Ok(result);
            }
            catch (UnsupportedFileTypeException ex)
            {
                return BadRequest(new ErrorResponse($"Unsupported file type: {ex.FileType}"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing file: {FileName}", file?.FileName);
                return StatusCode(500, new ErrorResponse($"An error occurred during analysis: {ex.Message}"));
            }
        }

        /// <summary>
        /// Analyze file from path (for testing/admin use)
        /// </summary>
        [HttpPost("analyze-path")]
        [ProducesResponseType(typeof(AnalysisResult), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<ActionResult<AnalysisResult>> AnalyzePath([FromBody] AnalyzePathRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.FilePath))
                {
                    return BadRequest(new ErrorResponse("File path is required"));
                }

                if (!System.IO.File.Exists(request.FilePath))
                {
                    return BadRequest(new ErrorResponse("File not found"));
                }

                var analysisRequest = new AnalysisRequest
                {
                    FilePath = request.FilePath,
                    OriginalFileName = Path.GetFileName(request.FilePath),
                    Options = request.Options ?? new AnalysisOptions()
                };

                var result = await _analysisEngine.AnalyzeFileAsync(analysisRequest);
                return Ok(result);
            }
            catch (UnsupportedFileTypeException ex)
            {
                return BadRequest(new ErrorResponse($"Unsupported file type: {ex.FileType}"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing file: {FilePath}", request.FilePath);
                return StatusCode(500, new ErrorResponse($"An error occurred during analysis: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get supported file types
        /// </summary>
        [HttpGet("supported-types")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<ActionResult> GetSupportedFileTypes()
        {
            try
            {
                var supportedTypes = await _analysisEngine.GetSupportedFileTypesAsync();
                return Ok(new
                {
                    supportedTypes = supportedTypes,
                    description = "File extensions supported by SecuNik analysis engine",
                    maxFileSize = "50MB",
                    supportedFormats = new[]
                    {
                        "Windows Event Logs (.evtx)",
                        "CSV Log Files (.csv)",
                        "Plain Text Logs (.log, .txt)",
                        "Network Captures (.pcap)",
                        "Firewall Logs",
                        "Database Logs",
                        "Web Server Logs",
                        "DNS Logs",
                        "Mail Server Logs",
                        "Syslog Files"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supported file types");
                return StatusCode(500, new ErrorResponse("Failed to retrieve supported file types"));
            }
        }

        /// <summary>
        /// Health check for the analysis service
        /// </summary>
        [HttpGet("health")]
        [ProducesResponseType(typeof(HealthResponse), 200)]
        public IActionResult Health()
        {
            return Ok(new HealthResponse
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "2.0-Professional",
                ServiceName = "SecuNik Analysis API"
            });
        }

        /// <summary>
        /// Check if a specific file can be processed
        /// </summary>
        [HttpPost("can-process")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<ActionResult> CanProcessFile([FromBody] CanProcessRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.FilePath))
                {
                    return BadRequest(new ErrorResponse("File path is required"));
                }

                var canProcess = await _analysisEngine.CanProcessFileAsync(request.FilePath);
                return Ok(new
                {
                    canProcess = canProcess,
                    filePath = request.FilePath,
                    message = canProcess ? "File can be processed" : "File type not supported"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking file compatibility: {FilePath}", request.FilePath);
                return StatusCode(500, new ErrorResponse("Failed to check file compatibility"));
            }
        }
    }

    // DTOs for API requests/responses
    public class AnalysisOptionsDto
    {
        public bool EnableAIAnalysis { get; set; } = true;
        public bool GenerateExecutiveReport { get; set; } = true;
        public bool IncludeTimeline { get; set; } = true;
        public int MaxSecurityEvents { get; set; } = 10000;
        public List<string> FocusKeywords { get; set; } = new();
    }

    public class AnalyzePathRequest
    {
        public string FilePath { get; set; } = string.Empty;
        public AnalysisOptions? Options { get; set; }
    }

    public class CanProcessRequest
    {
        public string FilePath { get; set; } = string.Empty;
    }

    public class ErrorResponse
    {
        public string Error { get; set; }
        public DateTime Timestamp { get; set; }
        public string RequestId { get; set; }

        public ErrorResponse(string error)
        {
            Error = error;
            Timestamp = DateTime.UtcNow;
            RequestId = Guid.NewGuid().ToString("N")[..8];
        }
    }

    public class HealthResponse
    {
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Version { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
    }
}