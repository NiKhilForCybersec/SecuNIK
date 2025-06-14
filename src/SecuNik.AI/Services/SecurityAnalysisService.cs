
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.AI.Services
{
    /// <summary>
    /// AI-powered security analysis service
    /// </summary>
    public class SecurityAnalysisService : IAIAnalysisService
    {
        private readonly ILogger<SecurityAnalysisService> _logger;

        public SecurityAnalysisService(ILogger<SecurityAnalysisService> logger)
        {
            _logger = logger;
            _logger.LogInformation("Security Analysis service initialized successfully");
        }

        public async Task<bool> IsAvailableAsync()
        {
            await Task.CompletedTask;
            return true;
        }

        public async Task<AIInsights> GenerateInsightsAsync(TechnicalFindings findings)
        {
            await Task.CompletedTask;

            _logger.LogInformation("Generating AI insights for {SecurityEventCount} security events",
                findings.SecurityEvents.Count);

            var severityScore = CalculateSeverity(findings);

            return new AIInsights
            {
                AttackVector = DetermineAttackVector(findings.SecurityEvents),
                ThreatAssessment = GenerateThreatAssessment(findings),
                SeverityScore = severityScore,
                RecommendedActions = GenerateRecommendedActions(findings),
                BusinessImpact = GenerateBusinessImpact(severityScore)
            };
        }

        public async Task<ExecutiveReport> GenerateExecutiveReportAsync(TechnicalFindings findings, AIInsights insights)
        {
            await Task.CompletedTask;

            _logger.LogInformation("Generating executive report with severity score {SeverityScore}",
                insights.SeverityScore);

            return new ExecutiveReport
            {
                Summary = GenerateExecutiveSummary(findings, insights),
                KeyFindings = GenerateKeyFindings(findings, insights),
                RiskLevel = insights.SeverityScore > 7 ? "HIGH" :
                          insights.SeverityScore > 4 ? "MEDIUM" : "LOW",
                ImmediateActions = GenerateImmediateActions(insights),
                LongTermRecommendations = GenerateLongTermRecommendations(insights)
            };
        }

        private int CalculateSeverity(TechnicalFindings findings)
        {
            int score = 1;
            score += Math.Min(findings.SecurityEvents.Count / 5, 4);
            score += Math.Min(findings.DetectedIOCs.Count / 3, 3);

            var criticalEvents = findings.SecurityEvents.Count(e =>
                e.Severity.ToLower() == "critical" || e.Severity.ToLower() == "high");
            score += Math.Min(criticalEvents * 2, 5);

            return Math.Min(score, 10);
        }

        private string DetermineAttackVector(List<SecurityEvent> events)
        {
            if (!events.Any())
                return "No attack vectors identified - routine security monitoring";

            if (events.Any(e => e.Description.ToLower().Contains("malware")))
                return "Malware infection detected - endpoint compromise likely";

            if (events.Any(e => e.Description.ToLower().Contains("failed") &&
                               e.Description.ToLower().Contains("login")))
                return "Brute force authentication attack - credential compromise attempt";

            return "Multiple security events detected - comprehensive investigation required";
        }

        private string GenerateThreatAssessment(TechnicalFindings findings)
        {
            return $"Analysis identified {findings.SecurityEvents.Count} security events and {findings.DetectedIOCs.Count} indicators of compromise. " +
                   $"Confidence level: {(findings.SecurityEvents.Count > 20 ? "High" : findings.SecurityEvents.Count > 5 ? "Medium" : "Low")} based on evidence volume.";
        }

        private List<string> GenerateRecommendedActions(TechnicalFindings findings)
        {
            var actions = new List<string>();

            if (findings.SecurityEvents.Count > 0)
                actions.Add("Review and validate all detected security events");

            if (findings.DetectedIOCs.Count > 0)
                actions.Add("Cross-reference IOCs with threat intelligence");

            if (actions.Count == 0)
                actions.Add("Continue routine security monitoring");

            return actions;
        }

        private string GenerateBusinessImpact(int severityScore)
        {
            if (severityScore >= 8)
                return "Critical business impact - immediate executive attention required.";
            if (severityScore >= 6)
                return "High business impact - business continuity measures should be evaluated.";
            if (severityScore >= 4)
                return "Moderate business impact - requires monitoring to prevent escalation.";
            return "Low business impact - routine security monitoring sufficient.";
        }

        private string GenerateExecutiveSummary(TechnicalFindings findings, AIInsights insights)
        {
            return $"Security analysis completed revealing {insights.SeverityScore}/10 risk level. " +
                   $"{findings.SecurityEvents.Count} security events analyzed. " +
                   $"Immediate {(insights.SeverityScore > 6 ? "response" : "review")} recommended.";
        }

        private string GenerateKeyFindings(TechnicalFindings findings, AIInsights insights)
        {
            return $"• {findings.SecurityEvents.Count} security events detected\n" +
                   $"• {findings.DetectedIOCs.Count} indicators of compromise identified\n" +
                   $"• Primary attack vector: {insights.AttackVector}\n" +
                   $"• Threat severity: {insights.SeverityScore}/10";
        }

        private string GenerateImmediateActions(AIInsights insights)
        {
            return string.Join("; ", insights.RecommendedActions.Take(2));
        }

        private string GenerateLongTermRecommendations(AIInsights insights)
        {
            return "Implement comprehensive security monitoring framework and establish regular threat assessment procedures.";
        }
    }
}