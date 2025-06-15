using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using Microsoft.Extensions.Logging;

namespace SecuNik.Core.Services;

/// <summary>
/// Simple threat intelligence service returning mocked data.
/// </summary>
public class ThreatIntelService : IThreatIntelService
{
    private readonly ILogger<ThreatIntelService> _logger;

    public ThreatIntelService(ILogger<ThreatIntelService> logger)
    {
        _logger = logger;
    }

    public async Task<List<ThreatIndicator>> GetLatestThreatsAsync()
    {
        await Task.CompletedTask;
        _logger.LogInformation("Retrieving latest threat indicators");
        return new List<ThreatIndicator>
        {
            new ThreatIndicator
            {
                Type = "IP",
                Value = "192.0.2.1",
                Description = "Known malicious IP address",
                LastSeen = DateTime.UtcNow.AddDays(-1),
                Source = "SecuNik"
            },
            new ThreatIndicator
            {
                Type = "Domain",
                Value = "malicious.example.com",
                Description = "Phishing domain observed in campaigns",
                LastSeen = DateTime.UtcNow.AddDays(-2),
                Source = "SecuNik"
            }
        };
    }
}
