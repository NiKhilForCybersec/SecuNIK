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
    /// Basic parser for network capture files (.pcap/.pcapng)
    /// </summary>
    public class NetworkCaptureParser : IUniversalParser
    {
        private readonly ILogger<NetworkCaptureParser> _logger;
        private static readonly string[] Extensions = { ".pcap", ".pcapng" };

        public NetworkCaptureParser(ILogger<NetworkCaptureParser> logger)
        {
            _logger = logger;
        }

        public string SupportedFileType => "PCAP";
        public int Priority => 60;

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
                // Placeholder: just report that a capture file was processed
                findings.SecurityEvents.Add(new SecurityEvent
                {
                    Timestamp = DateTime.Now,
                    EventType = "pcap",
                    Description = "Network capture processed",
                    Severity = "Low"
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse network capture.");
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
                MimeType = "application/octet-stream"
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
