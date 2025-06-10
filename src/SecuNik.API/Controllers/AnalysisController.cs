using Microsoft.AspNetCore.Mvc;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using SecuNik.Core.Exceptions;
using SecuNik.Core.Services;
using System;
using System.IO;
using System.Threading.Tasks;

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
        private static readonly Dictionary<string, AnalysisResult> _sessions = new();

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
        public async Task<ActionResult<AnalysisResult>> UploadAndAnalyze(IFormFile file, [FromForm] AnalysisOptionsDto? options = null)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ErrorResponse("No file uploaded or file is empty"));
            }

            // Validate file size (200MB limit)
            const long maxFileSize = 200 * 1024 * 1024; // 200MB
            if (file.Length > maxFileSize)
            {
                return BadRequest(new ErrorResponse($"File size exceeds maximum limit of {maxFileSize / (1024 * 1024)}MB"));
            }

            var analysisId = Guid.NewGuid().ToString();
            string tempFilePath = null;

            try
            {
                _logger.LogInformation("Starting analysis {AnalysisId} for file: {FileName} ({FileSize} bytes)",
                    analysisId, file.FileName, file.Length);

                // Create a proper temp file with the original extension
                var originalExtension = Path.GetExtension(file.FileName);
                var tempFileName = $"secunik_{analysisId}{originalExtension}";
                tempFilePath = Path.Combine(_uploadPath, tempFileName);

                // Save uploaded file with proper extension
                using (var stream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation("File saved to: {TempFilePath}", tempFilePath);

                // Validate that we can process this file type
                if (!await _analysisEngine.CanProcessFileAsync(tempFilePath))
                {
                    var supportedTypes = await _analysisEngine.GetSupportedFileTypesAsync();
                    return BadRequest(new ErrorResponse($"Unsupported file type '{originalExtension}'. Supported types: {string.Join(", ", supportedTypes)}"));
                }

                // Create analysis request
                var request = new AnalysisRequest
                {
                    FilePath = tempFilePath,
                    OriginalFileName = file.FileName,
                    Options = new AnalysisOptions
                    {
                        EnableAIAnalysis = options?.EnableAIAnalysis ?? true,
                        GenerateExecutiveReport = options?.GenerateExecutiveReport ?? true,
                        IncludeTimeline = options?.IncludeTimeline ?? true,
                        MaxSecurityEvents = options?.MaxSecurityEvents ?? 10000,
                        FocusKeywords = options?.FocusKeywords ?? new List<string>()
                    }
                };

                // Perform analysis
                var result = await _analysisEngine.AnalyzeFileAsync(request);

                _logger.LogInformation("Analysis {AnalysisId} completed successfully. Found {SecurityEventCount} security events",
                    analysisId, result.Technical.SecurityEvents.Count);

                // Return successful result
                return Ok(new
                {
                    success = true,
                    analysisId = analysisId,
                    fileName = file.FileName,
                    timestamp = DateTime.UtcNow,
                    result = result
                });
            }
            catch (UnsupportedFileTypeException ex)
            {
                _logger.LogWarning("Unsupported file type for analysis {AnalysisId}: {FileName} - {Error}", 
                    analysisId, file.FileName, ex.Message);
                return BadRequest(new ErrorResponse($"Unsupported file type: {ex.FileType}"));
            }
            catch (FileParsingException ex)
            {
                _logger.LogError(ex, "File parsing failed for analysis {AnalysisId}: {FileName}", 
                    analysisId, file.FileName);
                return BadRequest(new ErrorResponse($"Failed to parse file: {ex.Message}"));
            }
            catch (AIAnalysisException ex)
            {
                _logger.LogError(ex, "AI analysis failed for analysis {AnalysisId}: {FileName}", 
                    analysisId, file.FileName);
                return StatusCode(500, new ErrorResponse("AI analysis failed - technical findings are available"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during analysis {AnalysisId}: {FileName}", 
                    analysisId, file.FileName);
                return StatusCode(500, new ErrorResponse($"An unexpected error occurred during analysis: {ex.Message}"));
            }
            finally
            {
                // Clean up temporary file
                if (!string.IsNullOrEmpty(tempFilePath) && System.IO.File.Exists(tempFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(tempFilePath);
                        _logger.LogDebug("Cleaned up temporary file: {TempFilePath}", tempFilePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete temporary file: {TempFilePath}", tempFilePath);
                    }
                }
            }
        }

        /// <summary>
        /// Upload multiple files and analyze them together
        /// </summary>
        [HttpPost("upload-multiple")]
        [ProducesResponseType(typeof(AnalysisResult), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<ActionResult<AnalysisResult>> UploadMultiple([FromForm] IFormFileCollection files, [FromForm] string? sessionId = null, [FromForm] AnalysisOptionsDto? options = null)
        {
            if (files == null || files.Count == 0)
                return BadRequest(new ErrorResponse("No files uploaded"));

            var analysisId = sessionId ?? Guid.NewGuid().ToString();
            var tempFiles = new List<string>();
            var requests = new List<AnalysisRequest>();

            try
            {
                foreach (var file in files)
                {
                    if (file.Length == 0) continue;

                    var ext = Path.GetExtension(file.FileName);
                    var tempName = $"secunik_{Guid.NewGuid()}{ext}";
                    var tempPath = Path.Combine(_uploadPath, tempName);
                    using (var stream = new FileStream(tempPath, FileMode.Create))
                        await file.CopyToAsync(stream);
                    tempFiles.Add(tempPath);

                    if (!await _analysisEngine.CanProcessFileAsync(tempPath))
                    {
                        Cleanup(tempFiles);
                        var supported = await _analysisEngine.GetSupportedFileTypesAsync();
                        return BadRequest(new ErrorResponse($"Unsupported file type '{ext}'. Supported types: {string.Join(", ", supported)}"));
                    }

                    requests.Add(new AnalysisRequest
                    {
                        FilePath = tempPath,
                        OriginalFileName = file.FileName,
                        Options = new AnalysisOptions
                        {
                            EnableAIAnalysis = options?.EnableAIAnalysis ?? true,
                            GenerateExecutiveReport = options?.GenerateExecutiveReport ?? true,
                            IncludeTimeline = options?.IncludeTimeline ?? true,
                            MaxSecurityEvents = options?.MaxSecurityEvents ?? 10000,
                            FocusKeywords = options?.FocusKeywords ?? new List<string>()
                        }
                    });
                }

                var result = await _analysisEngine.AnalyzeFilesAsync(requests);

                if (!string.IsNullOrWhiteSpace(sessionId))
                {
                    if (_sessions.ContainsKey(sessionId))
                    {
                        _sessions[sessionId] = AnalysisEngine.MergeResults(new[] { _sessions[sessionId], result });
                    }
                    else
                    {
                        _sessions[sessionId] = result;
                    }
                    result = _sessions[sessionId];
                }

                return Ok(new
                {
                    success = true,
                    analysisId = analysisId,
                    timestamp = DateTime.UtcNow,
                    result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during multi-file upload");
                return StatusCode(500, new ErrorResponse($"Failed to analyze files: {ex.Message}"));
            }
            finally
            {
                Cleanup(tempFiles);
            }
        }

        private void Cleanup(IEnumerable<string> files)
        {
            foreach (var path in files)
            {
                try
                {
                    if (System.IO.File.Exists(path))
                        System.IO.File.Delete(path);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete temporary file: {TempFilePath}", path);
                }
            }
        }

        /// <summary>
        /// Analyze a file by local path (for development/testing)
        /// </summary>
        [HttpPost("analyze-path")]
        [ProducesResponseType(typeof(AnalysisResult), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        public async Task<ActionResult<AnalysisResult>> AnalyzeFilePath([FromBody] AnalyzePathRequest request)
        {
            if (string.IsNullOrEmpty(request.FilePath))
            {
                return BadRequest(new ErrorResponse("File path is required"));
            }

            if (!System.IO.File.Exists(request.FilePath))
            {
                return NotFound(new ErrorResponse("File not found"));
            }

            try
            {
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
        [ProducesResponseType(typeof(List<string>), 200)]
        public async Task<ActionResult<List<string>>> GetSupportedFileTypes()
        {
            try
            {
                var supportedTypes = await _analysisEngine.GetSupportedFileTypesAsync();
                return Ok(new
                {
                    supportedTypes = supportedTypes,
                    description = "File extensions supported by SecuNik analysis engine",
                    maxFileSize = "200MB"
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