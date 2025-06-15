using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Parser for common web server logs (Apache/Nginx/IIS)
    /// </summary>
    public class WebServerLogParser : IUniversalParser
    {
        private readonly ILogger<WebServerLogParser> _logger;
        private static readonly Regex LogRegex = new Regex("^(?<ip>\\S+) \\S+ \\S+ \\[(?<time>[^\\]]+)\\] \"(?<method>\\S+) (?<url>\\S+).*\" (?<status>\\d{3})",
            RegexOptions.Compiled);

        public WebServerLogParser(ILogger<WebServerLogParser> logger)
        {
            _logger = logger;
        }

        public string SupportedFileType => "WEBLOG";
        public int Priority => 70;

        public Task<bool> CanParseAsync(string filePath)
        {
            var ext = Path.GetExtension(filePath).ToLower();
            if (ext != ".log" && ext != ".txt") return Task.FromResult(false);
            return Task.FromResult(true);
        }

        public async Task<TechnicalFindings> ParseAsync(string filePath)
        {
            var findings = new TechnicalFindings
            {
                RawData = new Dictionary<string, object>(),
                DetectedIOCs = new List<string>(),
                SecurityEvents = new List<SecurityEvent>(),
                Metadata = await GetFileMetadataAsync(filePath)
            };

            try
            {
                var lines = await File.ReadAllLinesAsync(filePath);
                foreach (var line in lines)
                {
                    var match = LogRegex.Match(line);
                    if (!match.Success) continue;
                    DateTime.TryParse(match.Groups["time"].Value.Split(' ')[0], out var ts);
                    var ip = match.Groups["ip"].Value;
                    const string severity = "Low";
                    findings.SecurityEvents.Add(new SecurityEvent
                    {
                        Timestamp = ts,
                        EventType = "http",
                        Description = line.Trim(),
                        Severity = severity,
                        Priority = SecurityEvent.GetPriorityFromSeverity(severity),
                        Attributes = new Dictionary<string, string>
                        {
                            ["ip"] = ip,
                            ["url"] = match.Groups["url"].Value,
                            ["status"] = match.Groups["status"].Value
                        }
                    });
                    if (!findings.DetectedIOCs.Contains($"IP: {ip}"))
                        findings.DetectedIOCs.Add($"IP: {ip}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse web server log.");
            }

            return findings;
        }

        private async Task<FileMetadata> GetFileMetadataAsync(string filePath)
        {
            var fileInfo = new FileInfo(filePath);
            return await Task.FromResult(new FileMetadata
            {
                Size = fileInfo.Length,
                Created = fileInfo.CreationTime,
                Modified = fileInfo.LastWriteTime,
                Hash = await ComputeFileHashAsync(filePath),
                MimeType = "text/plain"
            });
        }

        private async Task<string> ComputeFileHashAsync(string filePath)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            await using var stream = File.OpenRead(filePath);
            var hash = await Task.Run(() => sha256.ComputeHash(stream));
            return BitConverter.ToString(hash).Replace("-", string.Empty).ToLower();
        }
    }
}
