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
    /// Intelligent analysis service for generating insights and reports
    /// </summary>
    public class OpenAIAnalysisService : IAIAnalysisService
    {
        private readonly ILogger<OpenAIAnalysisService> _logger;

        public OpenAIAnalysisService(ILogger<OpenAIAnalysisService> logger)
        {
            _logger = logger;
            _logger.LogInformation("AI Analysis service initialized successfully");
        }

        public async Task<bool> IsAvailableAsync()
        {
            await Task.CompletedTask;
            return true; // Always available since it's rule-based
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

            // Base score on security events count
            score += Math.Min(findings.SecurityEvents.Count / 5, 4);

            // Add points for IOCs
            score += Math.Min(findings.DetectedIOCs.Count / 3, 3);

            // High severity events get priority
            var criticalEvents = findings.SecurityEvents.Count(e =>
                e.Severity.ToLower() == "critical" || e.Severity.ToLower() == "high");
            score += Math.Min(criticalEvents * 2, 5);

            // Specific attack patterns
            var malwareEvents = findings.SecurityEvents.Count(e =>
                e.Description.ToLower().Contains("malware") ||
                e.Description.ToLower().Contains("ransomware") ||
                e.Description.ToLower().Contains("trojan"));
            score += Math.Min(malwareEvents * 3, 6);

            return Math.Min(score, 10);
        }

        private string DetermineAttackVector(List<SecurityEvent> events)
        {
            if (!events.Any())
                return "No attack vectors identified - routine security monitoring";

            // Check for malware
            if (events.Any(e => e.Description.ToLower().Contains("malware") ||
                               e.Description.ToLower().Contains("trojan") ||
                               e.Description.ToLower().Contains("ransomware")))
                return "Malware infection detected - endpoint compromise likely";

            // Check for authentication attacks
            if (events.Any(e => e.Description.ToLower().Contains("failed") &&
                               e.Description.ToLower().Contains("login")))
                return "Brute force authentication attack - credential compromise attempt";

            // Check for network attacks
            if (events.Any(e => e.Description.ToLower().Contains("scan") ||
                               e.Description.ToLower().Contains("network")))
                return "Network reconnaissance activity - potential lateral movement";

            // Check for data exfiltration
            if (events.Any(e => e.Description.ToLower().Contains("exfiltration") ||
                               e.Description.ToLower().Contains("data transfer")))
                return "Data exfiltration detected - information theft in progress";

            // Check for privilege escalation
            if (events.Any(e => e.Description.ToLower().Contains("privilege") ||
                               e.Description.ToLower().Contains("escalation")))
                return "Privilege escalation attempt - unauthorized access elevation";

            return "Multiple security events detected - comprehensive investigation required";
        }

        private string GenerateThreatAssessment(TechnicalFindings findings)
        {
            var assessment = $"Analysis identified {findings.SecurityEvents.Count} security events and {findings.DetectedIOCs.Count} indicators of compromise. ";

            var highSeverityCount = findings.SecurityEvents.Count(e =>
                e.Severity.ToLower() == "high" || e.Severity.ToLower() == "critical");

            if (highSeverityCount > 0)
                assessment += $"{highSeverityCount} high-severity events require immediate attention. ";

            var confidence = findings.SecurityEvents.Count > 20 ? "High" :
                           findings.SecurityEvents.Count > 5 ? "Medium" : "Low";
            assessment += $"Confidence level: {confidence} based on evidence volume and correlation.";

            return assessment;
        }

        private List<string> GenerateRecommendedActions(TechnicalFindings findings)
        {
            var actions = new List<string>();

            // Always include basic actions
            if (findings.SecurityEvents.Count > 0)
                actions.Add("Review and validate all detected security events");

            // Malware-specific actions
            if (findings.SecurityEvents.Any(e => e.Description.ToLower().Contains("malware")))
            {
                actions.Add("Isolate affected systems immediately");
                actions.Add("Run comprehensive antimalware scan");
            }

            // IOC-specific actions
            if (findings.DetectedIOCs.Count > 0)
            {
                actions.Add("Block identified malicious IPs and domains");
                actions.Add("Cross-reference IOCs with threat intelligence");
            }

            // Authentication-specific actions
            if (findings.SecurityEvents.Any(e => e.Description.ToLower().Contains("failed login")))
            {
                actions.Add("Reset credentials for affected accounts");
                actions.Add("Enable additional authentication monitoring");
            }

            // Network-specific actions
            if (findings.SecurityEvents.Any(e => e.Description.ToLower().Contains("network")))
                actions.Add("Review network access logs and firewall rules");

            // Default action if none specific
            if (actions.Count == 1)
                actions.Add("Implement enhanced monitoring for similar events");

            return actions;
        }

        private string GenerateBusinessImpact(int severityScore)
        {
            if (severityScore >= 8)
                return "Critical business impact - potential for significant operational disruption, data loss, and regulatory consequences. Immediate executive attention required.";

            if (severityScore >= 6)
                return "High business impact - possible service interruption and data compromise. Business continuity measures should be evaluated.";

            if (severityScore >= 4)
                return "Moderate business impact - limited risk to operations but requires monitoring to prevent escalation.";

            return "Low business impact - routine security events that should be monitored as part of normal operations.";
        }

        private string GenerateExecutiveSummary(TechnicalFindings findings, AIInsights insights)
        {
            return $"Security analysis completed revealing {insights.SeverityScore}/10 risk level. " +
                   $"{findings.SecurityEvents.Count} security events analyzed with primary concern being {insights.AttackVector.ToLower()}. " +
                   $"Immediate {(insights.SeverityScore > 6 ? "response" : "review")} recommended.";
        }

        private string GenerateKeyFindings(TechnicalFindings findings, AIInsights insights)
        {
            var findings_list = new List<string>
            {
                $"• {findings.SecurityEvents.Count} security events detected across analyzed timeframe",
                $"• {findings.DetectedIOCs.Count} indicators of compromise identified",
                $"• Primary attack vector: {insights.AttackVector}",
                $"• Threat severity: {insights.SeverityScore}/10"
            };

            var criticalEvents = findings.SecurityEvents.Count(e =>
                e.Severity.ToLower() == "critical" || e.Severity.ToLower() == "high");
            if (criticalEvents > 0)
                findings_list.Add($"• {criticalEvents} high-priority events requiring immediate attention");

            return string.Join("\n", findings_list);
        }

        private string GenerateImmediateActions(AIInsights insights)
        {
            return string.Join("; ", insights.RecommendedActions.Take(3));
        }

        private string GenerateLongTermRecommendations(AIInsights insights)
        {
            var recommendations = "Implement comprehensive security monitoring framework and establish regular threat assessment procedures. ";

            if (insights.SeverityScore > 6)
                recommendations += "Consider upgrading incident response capabilities and security team training. ";

            recommendations += "Schedule quarterly security assessments and penetration testing.";

            return recommendations;
        }
    }
}