using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging.Abstractions;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using SecuNik.Core.Services;
using Xunit;

public class MultiFileAnalysisTests
{
    private class FakeAI : IAIAnalysisService
    {
        public Task<bool> IsAvailableAsync() => Task.FromResult(true);
        public Task<AIInsights> GenerateInsightsAsync(TechnicalFindings findings)
        {
            return Task.FromResult(new AIInsights
            {
                SeverityScore = findings.SecurityEvents.Count
            });
        }
        public Task<ExecutiveReport> GenerateExecutiveReportAsync(TechnicalFindings f, AIInsights i)
        {
            return Task.FromResult(new ExecutiveReport { Summary = "ok" });
        }
    }

    [Fact]
    public void MergeResults_CombinesEvents()
    {
        var r1 = new AnalysisResult
        {
            Technical = new TechnicalFindings { SecurityEvents = new List<SecurityEvent> { new SecurityEvent() } },
            AI = new AIInsights { SeverityScore = 3 }
        };
        var r2 = new AnalysisResult
        {
            Technical = new TechnicalFindings { SecurityEvents = new List<SecurityEvent> { new SecurityEvent() } },
            AI = new AIInsights { SeverityScore = 5 }
        };

        var merged = AnalysisEngine.MergeResults(new[] { r1, r2 });
        Assert.Equal(2, merged.Technical.SecurityEvents.Count);
        Assert.Equal(5, merged.AI.SeverityScore);
    }

    [Fact]
    public async Task AnalyzeFilesAsync_ReturnsMergedResult()
    {
        var temp1 = Path.GetTempFileName() + ".syslog";
        var temp2 = Path.GetTempFileName() + ".syslog";
        await File.WriteAllTextAsync(temp1, "Jan 10 12:00:00 host sshd: login ok\n");
        await File.WriteAllTextAsync(temp2, "Jan 11 13:00:00 host sshd: login ok\n");

        var parsers = new List<IUniversalParser>
        {
            new SyslogParser(new NullLogger<SyslogParser>())
        };
        var parserService = new UniversalParserService(parsers, new NullLogger<UniversalParserService>());
        var engine = new AnalysisEngine(parserService, new FakeAI(), new SimpleLogNormalizer(), new CorrelationEngine(), new NullLogger<AnalysisEngine>());

        var requests = new[]
        {
            new AnalysisRequest { FilePath = temp1, Options = new AnalysisOptions { EnableAIAnalysis = false, GenerateExecutiveReport = false, IncludeTimeline = false } },
            new AnalysisRequest { FilePath = temp2, Options = new AnalysisOptions { EnableAIAnalysis = false, GenerateExecutiveReport = false, IncludeTimeline = false } }
        };

        var result = await engine.AnalyzeFilesAsync(requests);
        Assert.Equal(2, result.Technical.SecurityEvents.Count);

        File.Delete(temp1);
        File.Delete(temp2);
    }
}
