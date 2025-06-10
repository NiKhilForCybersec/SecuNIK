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
    /// Parser for syslog formatted files
    /// </summary>
    public class SyslogParser : IUniversalParser
    {
        private readonly ILogger<SyslogParser> _logger;
        private static readonly Regex SyslogRegex = new Regex(@"^(?<month>\w{3})\s+(?<day>\d{1,2})\s+(?<time>\d{2}:\d{2}:\d{2})\s+(?<host>\S+)\s+(?<service>[^:]+):\s+(?<msg>.*)$",
            RegexOptions.Compiled);

        public SyslogParser(ILogger<SyslogParser> logger)
        {
            _logger = logger;
        }

        public string SupportedFileType => "SYSLOG";
        public int Priority => 65;

        public Task<bool> CanParseAsync(string filePath)
        {
            var ext = Path.GetExtension(filePath).ToLower();
            return Task.FromResult(ext == ".log" || ext == ".syslog" || ext == ".txt");
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
                    var m = SyslogRegex.Match(line);
                    if (!m.Success) continue;
                    DateTime.TryParse($"{m.Groups["month"].Value} {m.Groups["day"].Value} {DateTime.Now.Year} {m.Groups["time"].Value}", out var ts);
                    findings.SecurityEvents.Add(new SecurityEvent
                    {
                        Timestamp = ts,
                        EventType = m.Groups["service"].Value,
                        Description = m.Groups["msg"].Value,
                        Severity = "Low"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse syslog file.");
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
