using System.Collections.Generic;
using Microsoft.Extensions.Logging.Abstractions;
using SecuNik.AI.Services;
using SecuNik.Core.Models;
using Xunit;

public class SecurityAnalysisServiceTests
{
    [Fact]
    public async Task GenerateInsightsAsync_ComputesSeverityAndVector()
    {
        var service = new SecurityAnalysisService(new NullLogger<SecurityAnalysisService>());
        var findings = new TechnicalFindings
        {
            SecurityEvents = new List<SecurityEvent>
            {
                new SecurityEvent { Description = "malware detected", Severity = "high" },
                new SecurityEvent { Description = "failed login", Severity = "medium" },
                new SecurityEvent { Description = "normal" , Severity = "low" },
                new SecurityEvent { Description = "malware found", Severity = "critical" },
                new SecurityEvent { Description = "other" , Severity = "medium" },
                new SecurityEvent { Description = "login ok" , Severity = "low" }
            },
            DetectedIOCs = new List<string> { "ioc1", "ioc2", "ioc3" }
        };

        var insights = await service.GenerateInsightsAsync(findings);

        Assert.Equal(7, insights.SeverityScore);
        Assert.Contains("Malware", insights.AttackVector);
    }

    [Fact]
    public async Task GenerateExecutiveReportAsync_HighSeverity_YieldsHighRiskLevel()
    {
        var service = new SecurityAnalysisService(new NullLogger<SecurityAnalysisService>());
        var report = await service.GenerateExecutiveReportAsync(new TechnicalFindings(), new AIInsights { SeverityScore = 8, RecommendedActions = new List<string>{"a"} });
        Assert.Equal("HIGH", report.RiskLevel);
    }
}
