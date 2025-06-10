using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Basic parser for Windows Event Log files (.evtx/.evt)
    /// </summary>
    public class WindowsEventLogParser : IUniversalParser
    {
        private readonly ILogger<WindowsEventLogParser> _logger;

        public WindowsEventLogParser(ILogger<WindowsEventLogParser> logger)
        {
            _logger = logger;
        }

        public string SupportedFileType => "EVTX,EVT";
        public int Priority => 90;

        public Task<bool> CanParseAsync(string filePath)
        {
            var ext = Path.GetExtension(filePath).ToLower();
            return Task.FromResult(ext == ".evtx" || ext == ".evt");
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
                // Attempt to load as XML
                var doc = XDocument.Load(filePath);
                var events = doc.Descendants("Event");
                foreach (var evt in events)
                {
                    var time = evt.Descendants("TimeCreated").FirstOrDefault()?.Attribute("SystemTime")?.Value;
                    DateTime.TryParse(time, out var ts);
                    var id = evt.Descendants("EventID").FirstOrDefault()?.Value ?? "";
                    var msg = evt.Descendants("Data").FirstOrDefault()?.Value ?? "Windows event";

                    findings.SecurityEvents.Add(new SecurityEvent
                    {
                        Timestamp = ts,
                        EventType = id,
                        Description = msg,
                        Severity = "Medium"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse Windows event log as XML. Returning empty findings.");
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
                MimeType = "application/xml"
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
