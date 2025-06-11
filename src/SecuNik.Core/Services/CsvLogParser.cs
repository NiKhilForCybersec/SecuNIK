// Replace your CsvLogParser.cs with this updated version
// File: src/SecuNik.Core/Services/CsvLogParser.cs

using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using SecuNik.Core.Exceptions;
using CsvHelper;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Parser for CSV log files and plain text log files
    /// </summary>
    public class CsvLogParser : IUniversalParser
    {
        private readonly ILogger<CsvLogParser> _logger;

        // FIXED: Support multiple file types
        public string SupportedFileType => "CSV,LOG,TXT"; // Support multiple types
        public int Priority => 100;

        public CsvLogParser(ILogger<CsvLogParser> logger)
        {
            _logger = logger;
        }

        public async Task<bool> CanParseAsync(string filePath)
        {
            try
            {
                var extension = Path.GetExtension(filePath).ToLower();
                
                // FIXED: Support .log, .txt, and .csv files
                var supportedExtensions = new[] { ".csv", ".log", ".txt" };
                if (!supportedExtensions.Contains(extension))
                {
                    _logger.LogDebug("File extension {Extension} not supported", extension);
                    return false;
                }

                // Quick validation - check if file exists and is readable
                if (!File.Exists(filePath))
                {
                    _logger.LogWarning("File does not exist: {FilePath}", filePath);
                    return false;
                }

                // For CSV files, check if it has CSV structure
                if (extension == ".csv")
                {
                    using var reader = new StreamReader(filePath);
                    var firstLine = await reader.ReadLineAsync();
                    return firstLine?.Contains(',') == true;
                }

                // For .log and .txt files, just check if it's readable text
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error checking if file can be parsed: {FilePath}", filePath);
                return false;
            }
        }

        public async Task<TechnicalFindings> ParseAsync(string filePath)
        {
            _logger.LogInformation("Starting parsing for file: {FilePath}", filePath);

            var findings = new TechnicalFindings
            {
                RawData = new Dictionary<string, object>(),
                DetectedIOCs = new List<string>(),
                SecurityEvents = new List<SecurityEvent>(),
                Metadata = await GetFileMetadataAsync(filePath)
            };

            try
            {
                var extension = Path.GetExtension(filePath).ToLower();
                
                if (extension == ".csv")
                {
                    await ParseCsvFileAsync(filePath, findings);
                }
                else if (extension == ".log" || extension == ".txt")
                {
                    await ParseLogFileAsync(filePath, findings);
                }

                _logger.LogInformation("Found {SecurityEventCount} security events and {IOCCount} IOCs",
                    findings.SecurityEvents.Count, findings.DetectedIOCs.Count);

                return findings;
            }
            catch (Exception ex)
            {
                throw new FileParsingException(filePath, "Failed to parse file", ex);
            }
        }

        private async Task ParseCsvFileAsync(string filePath, TechnicalFindings findings)
        {
            using var reader = new StreamReader(filePath);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = csv.GetRecords<dynamic>().ToList();
            findings.RawData["records"] = records;
            findings.RawData["recordCount"] = records.Count;
            findings.RawData["fileType"] = "CSV";

            _logger.LogInformation("Parsed {RecordCount} CSV records", records.Count);

            // Analyze each record for security events and IOCs
            foreach (var record in records)
            {
                var recordDict = (IDictionary<string, object>)record;

                // Check if this record represents a security event
                if (IsSecurityEvent(recordDict))
                {
                    findings.SecurityEvents.Add(CreateSecurityEventFromRecord(recordDict));
                }

                // Extract IOCs from the record
                ExtractIOCs(recordDict, findings.DetectedIOCs);
            }
        }

        private async Task ParseLogFileAsync(string filePath, TechnicalFindings findings)
        {
            var lines = await File.ReadAllLinesAsync(filePath);
            findings.RawData["lines"] = lines;
            findings.RawData["lineCount"] = lines.Length;
            findings.RawData["fileType"] = "LOG";

            _logger.LogInformation("Parsed {LineCount} log lines", lines.Length);

            // Analyze each line for security events and IOCs
            for (int i = 0; i < lines.Length; i++)
            {
                var line = lines[i];
                if (string.IsNullOrWhiteSpace(line)) continue;

                // Check if this line represents a security event
                if (IsSecurityEventLine(line))
                {
                    findings.SecurityEvents.Add(CreateSecurityEventFromLine(line, i + 1));
                }

                // Extract IOCs from the line
                ExtractIOCsFromLine(line, findings.DetectedIOCs);
            }
        }

        private bool IsSecurityEvent(IDictionary<string, object> record)
        {
            var suspiciousKeywords = new[]
            {
                "failed", "error", "unauthorized", "blocked", "denied", "attack",
                "malware", "suspicious", "breach", "intrusion", "exploit", "vulnerability",
                "trojan", "virus", "scan", "escalation", "exfiltration", "alert", "warning"
            };

            return record.Values.Any(value =>
                value?.ToString()?.ToLower()
                    .Split(' ', ',', ';', ':', '\t')
                    .Any(word => suspiciousKeywords.Contains(word.Trim())) == true);
        }

        private bool IsSecurityEventLine(string line)
        {
            var suspiciousKeywords = new[]
            {
                "failed", "error", "unauthorized", "blocked", "denied", "attack",
                "malware", "suspicious", "breach", "intrusion", "exploit", "vulnerability",
                "trojan", "virus", "scan", "escalation", "exfiltration", "alert", "warning",
                "login", "authentication", "access", "permission", "firewall", "dropped"
            };

            var lowerLine = line.ToLower();
            return suspiciousKeywords.Any(keyword => lowerLine.Contains(keyword));
        }

        private SecurityEvent CreateSecurityEventFromRecord(IDictionary<string, object> record)
        {
            var secEvent = new SecurityEvent
            {
                Timestamp = ExtractTimestamp(record),
                EventType = ExtractEventType(record),
                Description = ExtractDescription(record),
                Severity = ExtractSeverity(record),
                Attributes = record.ToDictionary(kvp => kvp.Key, kvp => kvp.Value?.ToString() ?? "")
            };

            return secEvent;
        }

        private SecurityEvent CreateSecurityEventFromLine(string line, int lineNumber)
        {
            var secEvent = new SecurityEvent
            {
                Timestamp = ExtractTimestampFromLine(line),
                EventType = "Log Entry",
                Description = line.Length > 200 ? line.Substring(0, 200) + "..." : line,
                Severity = ExtractSeverityFromLine(line),
                Attributes = new Dictionary<string, string>
                {
                    ["LineNumber"] = lineNumber.ToString(),
                    ["FullLine"] = line
                }
            };

            return secEvent;
        }

        private DateTime ExtractTimestamp(IDictionary<string, object> record)
        {
            var timestampFields = new[] { "timestamp", "time", "date", "datetime", "created", "modified", "when" };

            foreach (var field in timestampFields)
            {
                var key = record.Keys.FirstOrDefault(k => k.ToLower().Contains(field));
                if (key != null && DateTime.TryParse(record[key]?.ToString(), out var timestamp))
                {
                    return timestamp;
                }
            }

            return DateTime.Now;
        }

        private DateTime ExtractTimestampFromLine(string line)
        {
            // Try to extract timestamp from common log formats
            var timestampPatterns = new[]
            {
                @"\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}", // 2024-01-01 12:00:00
                @"\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2}", // 01/01/2024 12:00:00
                @"\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}",   // Jan 1 12:00:00
            };

            foreach (var pattern in timestampPatterns)
            {
                var match = Regex.Match(line, pattern);
                if (match.Success && DateTime.TryParse(match.Value, out var timestamp))
                {
                    return timestamp;
                }
            }

            return DateTime.Now;
        }

        private string ExtractEventType(IDictionary<string, object> record)
        {
            var typeFields = new[] { "event_type", "type", "event", "category", "action" };

            foreach (var field in typeFields)
            {
                var key = record.Keys.FirstOrDefault(k => k.ToLower().Replace("_", "").Contains(field.Replace("_", "")));
                if (key != null && record[key] != null)
                {
                    return record[key].ToString() ?? "Unknown";
                }
            }

            return "Security Event";
        }

        private string ExtractDescription(IDictionary<string, object> record)
        {
            var descFields = new[] { "description", "message", "details", "summary", "info" };

            foreach (var field in descFields)
            {
                var key = record.Keys.FirstOrDefault(k => k.ToLower().Contains(field));
                if (key != null && record[key] != null)
                {
                    return record[key].ToString() ?? "";
                }
            }

            // If no description field, use first few fields
            return string.Join(", ", record.Values.Take(3).Select(v => v?.ToString()).Where(s => !string.IsNullOrEmpty(s)));
        }

        private string ExtractSeverity(IDictionary<string, object> record)
        {
            var severityFields = new[] { "severity", "level", "priority", "risk" };

            foreach (var field in severityFields)
            {
                var key = record.Keys.FirstOrDefault(k => k.ToLower().Contains(field));
                if (key != null && record[key] != null)
                {
                    var severity = record[key].ToString()?.ToLower();
                    return MapSeverity(severity);
                }
            }

            // Determine severity based on keywords in description
            var description = ExtractDescription(record).ToLower();
            return DetermineSeverityFromContent(description);
        }

        private string ExtractSeverityFromLine(string line)
        {
            var lowerLine = line.ToLower();
            return DetermineSeverityFromContent(lowerLine);
        }

        private string DetermineSeverityFromContent(string content)
        {
            if (content.Contains("critical") || content.Contains("fatal") || content.Contains("attack") || content.Contains("malware"))
                return "High";
            if (content.Contains("error") || content.Contains("failed") || content.Contains("blocked") || content.Contains("unauthorized"))
                return "Medium";
            if (content.Contains("warning") || content.Contains("alert"))
                return "Medium";
            return "Low";
        }

        private string MapSeverity(string severity)
        {
            return severity switch
            {
                "critical" or "high" or "4" or "3" => "High",
                "medium" or "moderate" or "2" => "Medium",
                "low" or "info" or "1" or "0" => "Low",
                _ => "Medium"
            };
        }

        private void ExtractIOCs(IDictionary<string, object> record, List<string> iocs)
        {
            foreach (var value in record.Values)
            {
                var str = value?.ToString();
                if (string.IsNullOrEmpty(str)) continue;
                ExtractIOCsFromText(str, iocs);
            }
        }

        private void ExtractIOCsFromLine(string line, List<string> iocs)
        {
            ExtractIOCsFromText(line, iocs);
        }

        private void ExtractIOCsFromText(string text, List<string> iocs)
        {
            // IP Address detection
            var ipMatches = Regex.Matches(text, @"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b");
            foreach (Match match in ipMatches)
            {
                if (IsValidIP(match.Value) && !iocs.Contains($"IP: {match.Value}"))
                {
                    iocs.Add($"IP: {match.Value}");
                }
            }

            // Domain detection
            var domainMatches = Regex.Matches(text, @"\b[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}\b");
            foreach (Match match in domainMatches)
            {
                if (!iocs.Contains($"Domain: {match.Value}"))
                {
                    iocs.Add($"Domain: {match.Value}");
                }
            }

            // Hash detection (MD5, SHA1, SHA256)
            var hashMatches = Regex.Matches(text, @"\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b");
            foreach (Match match in hashMatches)
            {
                if (!iocs.Contains($"Hash: {match.Value}"))
                {
                    iocs.Add($"Hash: {match.Value}");
                }
            }

            // Email detection
            var emailMatches = Regex.Matches(text, @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b");
            foreach (Match match in emailMatches)
            {
                if (!iocs.Contains($"Email: {match.Value}"))
                {
                    iocs.Add($"Email: {match.Value}");
                }
            }
        }

        private bool IsValidIP(string ip)
        {
            var parts = ip.Split('.');
            if (parts.Length != 4) return false;

            foreach (var part in parts)
            {
                if (!int.TryParse(part, out var num) || num < 0 || num > 255)
                    return false;
            }

            // Exclude common non-routable IPs
            if (ip.StartsWith("127.") || ip.StartsWith("0.") || ip == "255.255.255.255")
                return false;

            return true;
        }

        private async Task<FileMetadata> GetFileMetadataAsync(string filePath)
        {
            var fileInfo = new FileInfo(filePath);
            return new FileMetadata
            {
                Size = fileInfo.Length,
                Created = fileInfo.CreationTime,
                Modified = fileInfo.LastWriteTime,
                Hash = await ComputeFileHashAsync(filePath),
                MimeType = GetMimeType(filePath)
            };
        }

        private string GetMimeType(string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLower();
            return extension switch
            {
                ".csv" => "text/csv",
                ".log" => "text/plain",
                ".txt" => "text/plain",
                _ => "text/plain"
            };
        }

        private async Task<string> ComputeFileHashAsync(string filePath)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            using var stream = File.OpenRead(filePath);
            var hash = await Task.Run(() => sha256.ComputeHash(stream));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}