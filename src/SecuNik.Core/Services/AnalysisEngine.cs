using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Main analysis engine that orchestrates the complete analysis workflow
    /// </summary>
    public class AnalysisEngine : IAnalysisEngine
    {
        private readonly UniversalParserService _parserService;
        private readonly IAIAnalysisService _aiService;
        private readonly IForensicService _forensicService;
        private readonly ILogger<AnalysisEngine> _logger;

        // Now properly inject the AI service
        public AnalysisEngine(
            UniversalParserService parserService,
            IAIAnalysisService aiService,
            IForensicService forensicService,
            ILogger<AnalysisEngine> logger)
        {
            _parserService = parserService;
            _aiService = aiService;
            _forensicService = forensicService;
            _logger = logger;
        }

        public async Task<AnalysisResult> AnalyzeFileAsync(AnalysisRequest request)
        {
            _logger.LogInformation("Starting comprehensive analysis for: {FilePath}", request.FilePath);

            var result = new AnalysisResult
            {
                FileName = request.OriginalFileName ?? Path.GetFileName(request.FilePath),
                FileType = await _parserService.DetectFileTypeAsync(request.FilePath),
                AnalysisTimestamp = DateTime.UtcNow
            };

            try
            {
                // Step 1: Parse the file and extract technical findings
                _logger.LogInformation("Step 1: Parsing file for technical findings");
                result.Technical = await _parserService.ParseFileAsync(request.FilePath);

                // Step 2: Generate AI insights (now using the real AI service)
                if (request.Options.EnableAIAnalysis && await _aiService.IsAvailableAsync())
                {
                    _logger.LogInformation("Step 2: Generating AI insights");
                    result.AI = await _aiService.GenerateInsightsAsync(result.Technical);
                }
                else
                {
                    _logger.LogInformation("Step 2: Using basic insights (AI disabled or unavailable)");
                    result.AI = CreateBasicInsights(result.Technical);
                }

                // Step 3: Generate executive report
                if (request.Options.GenerateExecutiveReport)
                {
                    _logger.LogInformation("Step 3: Generating executive report");
                    if (await _aiService.IsAvailableAsync())
                    {
                        result.Executive = await _aiService.GenerateExecutiveReportAsync(result.Technical, result.AI);
                    }
                    else
                    {
                        result.Executive = CreateBasicExecutiveReport(result.AI);
                    }
                }

                // Step 4: Build timeline (if enabled)
                if (request.Options.IncludeTimeline)
                {
                    _logger.LogInformation("Step 4: Building event timeline");
                    result.Timeline = BuildTimeline(result.Technical);
                }

                // Step 5: Perform forensic analysis
                if (request.Options.PerformForensicAnalysis)
                {
                    _logger.LogInformation("Step 5: Performing forensic analysis");
                    result.Forensics = await _forensicService.PerformForensicAnalysisAsync(result.Technical);
                }

                _logger.LogInformation("Analysis completed successfully for: {FilePath}", request.FilePath);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Analysis failed for file: {FilePath}", request.FilePath);
                throw;
            }
        }

        public async Task<List<string>> GetSupportedFileTypesAsync()
        {
            return await _parserService.GetSupportedFileTypesAsync();
        }

        public async Task<bool> CanProcessFileAsync(string filePath)
        {
            return await _parserService.CanProcessFileAsync(filePath);
        }

        // Fallback methods for when AI is not available
        private AIInsights CreateBasicInsights(TechnicalFindings findings)
        {
            var severityScore = CalculateBasicSeverity(findings);

            return new AIInsights
            {
                AttackVector = findings.SecurityEvents.Count > 0 ?
                    "Multiple security events detected - manual review recommended" :
                    "No obvious attack vectors identified in current analysis",
                ThreatAssessment = $"Analysis found {findings.SecurityEvents.Count} security events and {findings.DetectedIOCs.Count} indicators of compromise",
                SeverityScore = severityScore,
                RecommendedActions = GenerateBasicActions(findings),
                BusinessImpact = severityScore > 7 ? "High potential business impact - immediate attention required" :
                               severityScore > 4 ? "Moderate business impact - review recommended" :
                               "Low business impact - routine monitoring sufficient"
            };
        }

        private int CalculateBasicSeverity(TechnicalFindings findings)
        {
            int score = 1;
            score += Math.Min(findings.SecurityEvents.Count / 10, 3);
            score += Math.Min(findings.DetectedIOCs.Count / 5, 2);
            var highSeverityEvents = findings.SecurityEvents.Count(e =>
                e.Severity.ToLower() == "high" || e.Severity.ToLower() == "critical");
            score += Math.Min(highSeverityEvents * 2, 4);
            return Math.Min(score, 10);
        }

        private List<string> GenerateBasicActions(TechnicalFindings findings)
        {
            var actions = new List<string>();

            if (findings.SecurityEvents.Count > 0)
            {
                actions.Add("Review all detected security events for false positives");
                actions.Add("Investigate source systems for additional evidence");
            }

            if (findings.DetectedIOCs.Count > 0)
            {
                actions.Add("Cross-reference detected IOCs with threat intelligence feeds");
                actions.Add("Block identified malicious IPs and domains");
            }

            if (findings.SecurityEvents.Any(e => e.Severity.ToLower() == "critical"))
            {
                actions.Add("Immediate incident response team activation required");
            }

            if (actions.Count == 0)
            {
                actions.Add("Continue routine security monitoring");
                actions.Add("Schedule regular security assessments");
            }

            return actions;
        }

        private ExecutiveReport CreateBasicExecutiveReport(AIInsights insights)
        {
            return new ExecutiveReport
            {
                Summary = $"Security analysis completed with risk score of {insights.SeverityScore}/10",
                KeyFindings = insights.ThreatAssessment,
                RiskLevel = insights.SeverityScore > 7 ? "HIGH" :
                          insights.SeverityScore > 4 ? "MEDIUM" : "LOW",
                ImmediateActions = string.Join("; ", insights.RecommendedActions.Take(2)),
                LongTermRecommendations = "Implement enhanced security monitoring and establish regular forensic analysis procedures"
            };
        }

        private Timeline BuildTimeline(TechnicalFindings findings)
        {
            var events = findings.SecurityEvents
                .Select(se => new TimelineEvent
                {
                    Timestamp = se.Timestamp,
                    Event = se.Description,
                    Source = se.EventType,
                    Confidence = "High"
                })
                .OrderBy(e => e.Timestamp)
                .ToList();

            if (!events.Any())
            {
                events.Add(new TimelineEvent
                {
                    Timestamp = findings.Metadata.Created,
                    Event = "Evidence file created",
                    Source = "File System",
                    Confidence = "High"
                });
            }

            return new Timeline
            {
                Events = events,
                FirstActivity = events.Any() ? events.Min(e => e.Timestamp) : DateTime.MinValue,
                LastActivity = events.Any() ? events.Max(e => e.Timestamp) : DateTime.MinValue
            };
        }
    }
}