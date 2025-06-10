using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using SecuNik.Core.Exceptions;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Ultimate service that manages multiple parsers and routes files to appropriate parser
    /// Enterprise-grade with performance monitoring, file type detection, and analytics
    /// </summary>
    public class UniversalParserService
    {
        private readonly List<IUniversalParser> _parsers;
        private readonly ILogger<UniversalParserService> _logger;

        // Enterprise analytics
        private readonly Dictionary<string, int> _parserUsageStats = new();
        private readonly Dictionary<string, TimeSpan> _parserPerformanceStats = new();

        public UniversalParserService(IEnumerable<IUniversalParser> parsers, ILogger<UniversalParserService> logger)
        {
            _parsers = parsers.OrderByDescending(p => p.Priority).ToList();
            _logger = logger;

            _logger.LogInformation("🚀 Ultimate UniversalParserService initialized with {ParserCount} parsers", _parsers.Count);
            LogAvailableParsers();
        }

        public async Task<TechnicalFindings> ParseFileAsync(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"File not found: {filePath}");
            }

            var fileName = Path.GetFileName(filePath);
            var fileSize = new FileInfo(filePath).Length;
            var stopwatch = Stopwatch.StartNew();

            _logger.LogInformation("🔍 Starting ultimate file parsing for: {FileName} ({FileSize})", fileName, FormatFileSize(fileSize));

            // Enterprise feature: Validate file before processing
            await ValidateFileAsync(filePath);

            // Enterprise feature: Detect actual file type (not just extension)
            var detectedFileType = await DetectActualFileTypeAsync(filePath);
            _logger.LogInformation("📋 File type detection: {FileType}", detectedFileType);

            IUniversalParser? selectedParser = null;
            TechnicalFindings? result = null;
            Exception? lastException = null;

            foreach (var parser in _parsers)
            {
                try
                {
                    if (await parser.CanParseAsync(filePath))
                    {
                        selectedParser = parser;
                        var parserName = parser.GetType().Name;

                        _logger.LogInformation("⚡ Using {ParserName} (Priority: {Priority}) for {FileName}",
                            parserName, parser.Priority, fileName);

                        var parserStopwatch = Stopwatch.StartNew();
                        result = await parser.ParseAsync(filePath);
                        parserStopwatch.Stop();

                        // Enterprise analytics: Track parser performance
                        UpdateParserStats(parserName, parserStopwatch.Elapsed);

                        // Enterprise feature: Enhance result with metadata
                        await EnhanceResultWithMetadata(result, filePath, detectedFileType, parserName, parserStopwatch.Elapsed);

                        break;
                    }
                }
                catch (Exception ex)
                {
                    lastException = ex;
                    _logger.LogWarning(ex, "⚠️ Parser {ParserType} failed to parse {FileName}",
                        parser.GetType().Name, fileName);
                    continue;
                }
            }

            stopwatch.Stop();

            if (result == null)
            {
                var fileExtension = Path.GetExtension(filePath);
                _logger.LogError("❌ No parser could handle {FileName} (Extension: {Extension}, Type: {FileType})",
                    fileName, fileExtension, detectedFileType);

                // Enterprise feature: Create comprehensive error report
                throw new UnsupportedFileTypeException(filePath, fileExtension);
            }

            _logger.LogInformation("✅ Ultimate parsing completed in {Duration}ms using {ParserName}: {EventCount} events, {IOCCount} IOCs",
                stopwatch.ElapsedMilliseconds, selectedParser?.GetType().Name,
                result.SecurityEvents.Count, result.DetectedIOCs.Count);

            return result;
        }

        public async Task<string> DetectFileTypeAsync(string filePath)
        {
            // Enterprise feature: Multi-layered file type detection
            var detections = new List<string>();

            // Method 1: Extension-based detection
            foreach (var parser in _parsers)
            {
                if (await parser.CanParseAsync(filePath))
                {
                    detections.Add($"Parser:{parser.SupportedFileType}");
                    break;
                }
            }

            // Method 2: Content-based heuristics
            var heuristicType = await DetectByContentHeuristics(filePath);
            if (!string.IsNullOrEmpty(heuristicType))
            {
                detections.Add($"Heuristic:{heuristicType}");
            }

            var result = detections.Any() ? string.Join("|", detections) : "Unknown";
            _logger.LogDebug("🔍 File type detection for {FileName}: {Result}", Path.GetFileName(filePath), result);

            return result;
        }

        public async Task<bool> CanProcessFileAsync(string filePath)
        {
            try
            {
                // Enterprise validation: Check file accessibility and validity
                if (!File.Exists(filePath))
                    return false;

                var fileInfo = new FileInfo(filePath);
                if (fileInfo.Length == 0)
                {
                    _logger.LogWarning("⚠️ Empty file detected: {FileName}", fileInfo.Name);
                    return false;
                }

                // Check if any parser can handle it
                foreach (var parser in _parsers)
                {
                    if (await parser.CanParseAsync(filePath))
                    {
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "⚠️ Error checking file processability: {FilePath}", filePath);
                return false;
            }
        }

        public async Task<List<string>> GetSupportedFileTypesAsync()
        {
            var supportedTypes = new List<string>();

            foreach (var parser in _parsers)
            {
                var types = parser.SupportedFileType.Split(',')
                    .Select(t => t.Trim())
                    .Where(t => !string.IsNullOrEmpty(t));
                supportedTypes.AddRange(types);
            }

            var result = supportedTypes.Distinct().OrderBy(t => t).ToList();

            _logger.LogDebug("📋 Supported file types: {Types}", string.Join(", ", result));
            return await Task.FromResult(result);
        }

        // Enterprise feature: Parser performance analytics
        public async Task<Dictionary<string, object>> GetAnalyticsAsync()
        {
            return await Task.FromResult(new Dictionary<string, object>
            {
                ["TotalParsers"] = _parsers.Count,
                ["ParserUsageStats"] = new Dictionary<string, int>(_parserUsageStats),
                ["ParserPerformanceStats"] = _parserPerformanceStats.ToDictionary(
                    kvp => kvp.Key,
                    kvp => $"{kvp.Value.TotalMilliseconds:F2}ms avg"
                ),
                ["RegisteredParsers"] = _parsers.Select(p => new
                {
                    Name = p.GetType().Name,
                    Priority = p.Priority,
                    SupportedTypes = p.SupportedFileType
                }).ToList()
            });
        }

        // Enterprise feature: Validate files before processing
        private async Task ValidateFileAsync(string filePath)
        {
            var fileInfo = new FileInfo(filePath);

            // Check file size limits (configurable for enterprise)
            const long maxFileSize = 1024L * 1024 * 1024; // 1GB limit
            if (fileInfo.Length > maxFileSize)
            {
                throw new InvalidOperationException($"File too large: {FormatFileSize(fileInfo.Length)}. Maximum supported: {FormatFileSize(maxFileSize)}");
            }

            // Check file accessibility
            try
            {
                using var stream = File.OpenRead(filePath);
                var buffer = new byte[1];
                await stream.ReadAsync(buffer, 0, 1);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"File not accessible: {ex.Message}");
            }
        }

        // Enterprise feature: Enhanced file type detection (without external dependencies)
        private async Task<string> DetectActualFileTypeAsync(string filePath)
        {
            try
            {
                // Simple but effective file type detection
                var extension = Path.GetExtension(filePath).ToLower();
                var contentType = await DetectByContentHeuristics(filePath);

                return !string.IsNullOrEmpty(contentType) ? contentType : extension;
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "File type detection failed for {FileName}", Path.GetFileName(filePath));
                return Path.GetExtension(filePath).ToLower();
            }
        }

        // Enterprise feature: Content-based heuristics
        private async Task<string> DetectByContentHeuristics(string filePath)
        {
            try
            {
                using var stream = File.OpenRead(filePath);
                var buffer = new byte[512];
                var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);

                if (bytesRead == 0) return "Empty";

                var header = System.Text.Encoding.ASCII.GetString(buffer, 0, Math.Min(100, bytesRead));

                // Windows Event Log signatures
                if (header.StartsWith("ELF") || (bytesRead >= 8 &&
                    buffer[0] == 0x45 && buffer[1] == 0x4C && buffer[2] == 0x46 && buffer[3] == 0x46))
                    return "WindowsEventLog";

                // CSV detection
                if (header.Contains(",") && (header.Contains("\"") || header.Split('\n').Length > 1))
                    return "CSV";

                // JSON detection
                var trimmedHeader = header.TrimStart();
                if (trimmedHeader.StartsWith("{") || trimmedHeader.StartsWith("["))
                    return "JSON";

                // XML detection
                if (trimmedHeader.StartsWith("<?xml") || trimmedHeader.StartsWith("<"))
                    return "XML";

                // Log file patterns
                if (System.Text.RegularExpressions.Regex.IsMatch(header, @"\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}"))
                    return "LogFile";

                // Binary detection
                var nullBytes = buffer.Take(bytesRead).Count(b => b == 0);
                if (nullBytes > bytesRead * 0.3) // More than 30% null bytes suggests binary
                    return "Binary";

                return "Text";
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Content heuristics failed for {FileName}", Path.GetFileName(filePath));
                return "Unknown";
            }
        }

        // Enterprise feature: Enhance results with metadata
        private async Task EnhanceResultWithMetadata(TechnicalFindings result, string filePath,
            string detectedFileType, string parserUsed, TimeSpan processingTime)
        {
            // Add enterprise metadata
            result.RawData["ParserUsed"] = parserUsed;
            result.RawData["ProcessingTimeMs"] = processingTime.TotalMilliseconds;
            result.RawData["DetectedFileType"] = detectedFileType;
            result.RawData["ProcessingTimestamp"] = DateTime.UtcNow;
            result.RawData["FileValidation"] = "Passed";

            // Add file characteristics
            var fileInfo = new FileInfo(filePath);
            result.RawData["OriginalFileSize"] = fileInfo.Length;
            result.RawData["FileCreated"] = fileInfo.CreationTime;
            result.RawData["FileModified"] = fileInfo.LastWriteTime;

            // Add processing metadata
            result.RawData["SecuNikVersion"] = "2.0-Ultimate";
            result.RawData["AnalysisEngine"] = "Ultimate";

            await Task.CompletedTask;
        }

        // Enterprise analytics
        private void UpdateParserStats(string parserName, TimeSpan elapsed)
        {
            // Update usage statistics
            _parserUsageStats[parserName] = _parserUsageStats.GetValueOrDefault(parserName, 0) + 1;

            // Update performance statistics (running average)
            if (_parserPerformanceStats.ContainsKey(parserName))
            {
                var currentAvg = _parserPerformanceStats[parserName];
                var newAvg = TimeSpan.FromMilliseconds((currentAvg.TotalMilliseconds + elapsed.TotalMilliseconds) / 2);
                _parserPerformanceStats[parserName] = newAvg;
            }
            else
            {
                _parserPerformanceStats[parserName] = elapsed;
            }
        }

        private void LogAvailableParsers()
        {
            _logger.LogInformation("📋 Available parsers (by priority):");
            foreach (var parser in _parsers)
            {
                _logger.LogInformation("  • {ParserName} (Priority: {Priority}) - Supports: {SupportedTypes}",
                    parser.GetType().Name, parser.Priority, parser.SupportedFileType);
            }
        }

        private static string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }
}