using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using System.Linq;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Main analysis engine that orchestrates the complete analysis workflow
    /// </summary>
    public class AnalysisEngine : IAnalysisEngine
    {
        private readonly UniversalParserService _parserService;
        private readonly IAIAnalysisService _aiService;
        private readonly ILogger<AnalysisEngine> _logger;
        private readonly ILogNormalizer _normalizer;
        private readonly CorrelationEngine _correlationEngine;


        // Now properly inject the AI service
        public AnalysisEngine(
            UniversalParserService parserService,
            IAIAnalysisService aiService,
            ILogNormalizer normalizer,
            CorrelationEngine correlationEngine,
            ILogger<AnalysisEngine> logger)
        {
            _parserService = parserService;
            _aiService = aiService;
            _normalizer = normalizer;
            _correlationEngine = correlationEngine;
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

                _logger.LogInformation("Analysis completed successfully for: {FilePath}", request.FilePath);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Analysis failed for file: {FilePath}", request.FilePath);
                throw;
            }
        }

        public async Task<AnalysisResult> AnalyzeFilesAsync(IEnumerable<AnalysisRequest> files)
        {
            var technicalResults = new List<TechnicalFindings>();
            var names = new List<string>();

            foreach (var req in files)
            {
                names.Add(req.OriginalFileName ?? Path.GetFileName(req.FilePath));
                var findings = await _parserService.ParseFileAsync(req.FilePath);
                technicalResults.Add(findings);
            }

            var merged = MergeTechnicalFindings(technicalResults);
            merged.SecurityEvents = _normalizer.Normalize(merged.SecurityEvents).ToList();

            var result = new AnalysisResult
            {
                FileName = string.Join(", ", names),
                FileType = string.Join(", ", technicalResults.Select(t => t.FileFormat).Distinct()),
                AnalysisTimestamp = DateTime.UtcNow,
                Technical = merged,
                Timeline = BuildTimelineStatic(merged)
            };

            result.Correlation = _correlationEngine.Correlate(result.Technical.SecurityEvents);

            var firstOptions = files.First().Options;
            if (firstOptions.EnableAIAnalysis)
            {
                if (await _aiService.IsAvailableAsync())
                    result.AI = await _aiService.GenerateInsightsAsync(result.Technical);
                else
                    result.AI = CreateBasicInsights(result.Technical);
            }

            if (firstOptions.GenerateExecutiveReport)
            {
                if (await _aiService.IsAvailableAsync())
                    result.Executive = await _aiService.GenerateExecutiveReportAsync(result.Technical, result.AI);
                else
                    result.Executive = CreateBasicExecutiveReport(result.AI);
            }

            return result;
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

        public static AnalysisResult MergeResults(IEnumerable<AnalysisResult> results)
        {
            var list = results.ToList();
            if (!list.Any()) return new AnalysisResult();

            var merged = new AnalysisResult
            {
                FileName = string.Join(", ", list.Select(r => r.FileName)),
                FileType = string.Join(", ", list.Select(r => r.FileType).Distinct()),
                AnalysisTimestamp = DateTime.UtcNow
            };

            foreach (var result in list)
            {
                foreach (var kvp in result.Technical.RawData)
                    merged.Technical.RawData[kvp.Key] = kvp.Value;

                merged.Technical.DetectedIOCs.AddRange(result.Technical.DetectedIOCs);
                merged.Technical.SecurityEvents.AddRange(result.Technical.SecurityEvents);
                merged.Technical.TotalLines += result.Technical.TotalLines;

                foreach (var kvp in result.Technical.IOCsByCategory)
                    merged.Technical.IOCsByCategory[kvp.Key] = merged.Technical.IOCsByCategory.GetValueOrDefault(kvp.Key) + kvp.Value;

                foreach (var kvp in result.Technical.EventsByType)
                    merged.Technical.EventsByType[kvp.Key] = merged.Technical.EventsByType.GetValueOrDefault(kvp.Key) + kvp.Value;

                if (result.AI != null)
                {
                    if (result.AI.SeverityScore > merged.AI.SeverityScore)
                    {
                        merged.AI.AttackVector = result.AI.AttackVector;
                        merged.AI.ThreatAssessment = result.AI.ThreatAssessment;
                        merged.AI.SeverityScore = result.AI.SeverityScore;
                        merged.AI.BusinessImpact = result.AI.BusinessImpact;
                    }
                    merged.AI.RecommendedActions.AddRange(result.AI.RecommendedActions);
                }

                if (!string.IsNullOrWhiteSpace(result.Executive.Summary))
                {
                    if (!string.IsNullOrEmpty(merged.Executive.Summary))
                        merged.Executive.Summary += "\n";
                    merged.Executive.Summary += result.Executive.Summary;
                }

                merged.Executive.KeyFindings += string.IsNullOrEmpty(merged.Executive.KeyFindings)
                    ? result.Executive.KeyFindings
                    : "\n" + result.Executive.KeyFindings;
            }

            merged.Timeline = BuildTimelineStatic(merged.Technical);

            return merged;
        }

        private static Timeline BuildTimelineStatic(TechnicalFindings findings)
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

        private static TechnicalFindings MergeTechnicalFindings(IEnumerable<TechnicalFindings> findings)
        {
            var list = findings.ToList();
            var merged = new TechnicalFindings();

            foreach (var f in list)
            {
                foreach (var kvp in f.RawData)
                    merged.RawData[kvp.Key] = kvp.Value;
                merged.DetectedIOCs.AddRange(f.DetectedIOCs);
                merged.SecurityEvents.AddRange(f.SecurityEvents);
                merged.TotalLines += f.TotalLines;

                foreach (var kvp in f.IOCsByCategory)
                    merged.IOCsByCategory[kvp.Key] = merged.IOCsByCategory.GetValueOrDefault(kvp.Key) + kvp.Value;
                foreach (var kvp in f.EventsByType)
                    merged.EventsByType[kvp.Key] = merged.EventsByType.GetValueOrDefault(kvp.Key) + kvp.Value;
            }

            return merged;
        }
    }
}