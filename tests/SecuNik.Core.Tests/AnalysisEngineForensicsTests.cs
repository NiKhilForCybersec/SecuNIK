using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using SecuNik.Core.Services;
using Xunit;

namespace SecuNik.Core.Tests;

public class AnalysisEngineForensicsTests
{
    private class StubParser : IUniversalParser
    {
        public string SupportedFileType => "log";
        public int Priority => 1;
        public Task<bool> CanParseAsync(string filePath) => Task.FromResult(true);
        public Task<TechnicalFindings> ParseAsync(string filePath)
        {
            var findings = new TechnicalFindings
            {
                SecurityEvents = new List<SecurityEvent>
                {
                    new SecurityEvent { Message = "test", Timestamp = DateTime.UtcNow }
                }
            };
            return Task.FromResult(findings);
        }
    }

    [Fact]
    public async Task AnalyzeFileAsync_IncludesForensics_WhenEnabled()
    {
        // Arrange
        var temp = Path.GetTempFileName();
        await File.WriteAllTextAsync(temp, "log");
        var parserService = new UniversalParserService(new List<IUniversalParser> { new StubParser() }, NullLogger<UniversalParserService>.Instance);
        var aiMock = new Mock<IAIAnalysisService>();
        aiMock.Setup(a => a.IsAvailableAsync()).ReturnsAsync(false);
        var forensicMock = new Mock<IForensicService>();
        forensicMock.Setup(f => f.PerformForensicAnalysisAsync(It.IsAny<TechnicalFindings>()))
                    .ReturnsAsync(new ForensicAnalysis { CaseId = "case" });

        var engine = new AnalysisEngine(parserService, aiMock.Object, forensicMock.Object, NullLogger<AnalysisEngine>.Instance);

        var request = new AnalysisRequest
        {
            FilePath = temp,
            OriginalFileName = "temp.log",
            Options = new AnalysisOptions { PerformForensicAnalysis = true, EnableAIAnalysis = false, GenerateExecutiveReport = false, IncludeTimeline = false }
        };

        // Act
        var result = await engine.AnalyzeFileAsync(request);

        // Assert
        result.Forensics.Should().NotBeNull();
        result.Forensics!.CaseId.Should().Be("case");

        File.Delete(temp);
    }
}
