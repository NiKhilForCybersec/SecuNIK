using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Simple parser for database server logs (MySQL, PostgreSQL, SQL Server)
    /// </summary>
    public class DatabaseLogParser : IUniversalParser
    {
        private readonly ILogger<DatabaseLogParser> _logger;
        private static readonly string[] Extensions = { ".dblog", ".log", ".txt" };

        public DatabaseLogParser(ILogger<DatabaseLogParser> logger)
        {
            _logger = logger;
        }

        public string SupportedFileType => "DB";
        public int Priority => 50;

        public Task<bool> CanParseAsync(string filePath)
        {
            var ext = Path.GetExtension(filePath).ToLower();
            return Task.FromResult(Array.Exists(Extensions, e => e == ext));
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
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    var severity = line.Contains("error", StringComparison.OrdinalIgnoreCase) ? "Medium" : "Low";
                    findings.SecurityEvents.Add(new SecurityEvent
                    {
                        Timestamp = DateTime.Now,
                        EventType = "database",
                        Description = line.Trim(),
                        Severity = severity,
                        Priority = SecurityEvent.GetPriorityFromSeverity(severity)
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse database log.");
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
