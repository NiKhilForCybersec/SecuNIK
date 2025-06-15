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
                LongTermRecommendations = GenerateLongTermRecommendations(findings, insights)
            };
        }

        private int CalculateSeverity(TechnicalFindings findings)
        {
            var score = 0;

            // Base score from number of security events
            score += Math.Min(findings.SecurityEvents.Count / 10, 3);

            // IOC-based scoring
            score += Math.Min(findings.DetectedIOCs.Count / 5, 2);

            // High-priority event scoring
            var criticalEvents = findings.SecurityEvents.Count(e => e.Priority == SecurityEventPriority.Critical);
            var highEvents = findings.SecurityEvents.Count(e => e.Priority == SecurityEventPriority.High);

            score += criticalEvents * 2;
            score += highEvents;

            // Malicious activity indicators
            var maliciousEvents = findings.SecurityEvents.Count(e => e.IsMalicious);
            score += maliciousEvents;

            // Cap at 10
            return Math.Min(score, 10);
        }

        private string DetermineAttackVector(List<SecurityEvent> events)
        {
            var vectors = new Dictionary<string, int>();

            foreach (var evt in events)
            {
                var vector = ClassifyAttackVector(evt);
                vectors[vector] = vectors.GetValueOrDefault(vector, 0) + 1;
            }

            if (!vectors.Any()) return "Unknown";

            var primaryVector = vectors.OrderByDescending(v => v.Value).First().Key;

            if (vectors.Count > 1)
            {
                var secondaryVectors = vectors.Where(v => v.Key != primaryVector && v.Value > 0)
                    .OrderByDescending(v => v.Value)
                    .Take(2)
                    .Select(v => v.Key);

                if (secondaryVectors.Any())
                {
                    return $"{primaryVector} (with {string.Join(", ", secondaryVectors)})";
                }
            }

            return primaryVector;
        }

        private string ClassifyAttackVector(SecurityEvent evt)
        {
            var message = evt.Message.ToLower();
            var category = evt.Category.ToLower();

            if (message.Contains("login") || message.Contains("authentication") || category.Contains("auth"))
                return "Authentication Attack";

            if (message.Contains("network") || message.Contains("connection") || category.Contains("network"))
                return "Network Intrusion";

            if (message.Contains("malware") || message.Contains("virus") || message.Contains("trojan"))
                return "Malware";

            if (message.Contains("privilege") || message.Contains("escalation") || message.Contains("admin"))
                return "Privilege Escalation";

            if (message.Contains("data") || message.Contains("exfiltration") || message.Contains("transfer"))
                return "Data Exfiltration";

            if (message.Contains("denial") || message.Contains("dos") || message.Contains("flood"))
                return "Denial of Service";

            if (message.Contains("injection") || message.Contains("sql") || message.Contains("xss"))
                return "Code Injection";

            return "General Security Event";
        }

        private string GenerateThreatAssessment(TechnicalFindings findings)
        {
            var criticalCount = findings.SecurityEvents.Count(e => e.Priority == SecurityEventPriority.Critical);
            var highCount = findings.SecurityEvents.Count(e => e.Priority == SecurityEventPriority.High);
            var maliciousCount = findings.SecurityEvents.Count(e => e.IsMalicious);
            var iocCount = findings.DetectedIOCs.Count;

            if (criticalCount > 5 || maliciousCount > 3)
            {
                return "CRITICAL THREAT DETECTED: Multiple high-severity security events indicate an active threat. " +
                       "Immediate containment and incident response procedures should be initiated.";
            }

            if (criticalCount > 0 || highCount > 10 || iocCount > 20)
            {
                return "HIGH THREAT LEVEL: Significant security concerns identified that require immediate attention. " +
                       "Enhanced monitoring and security measures should be implemented.";
            }

            if (highCount > 0 || iocCount > 5)
            {
                return "MODERATE THREAT LEVEL: Some security events detected that warrant investigation. " +
                       "Review and validate findings to determine appropriate response.";
            }

            return "LOW THREAT LEVEL: Minimal security concerns detected. Continue standard monitoring procedures.";
        }

        private List<string> GenerateRecommendedActions(TechnicalFindings findings)
        {
            var actions = new List<string>();

            var criticalEvents = findings.SecurityEvents.Count(e => e.Priority == SecurityEventPriority.Critical);
            var maliciousEvents = findings.SecurityEvents.Count(e => e.IsMalicious);
            var iocCount = findings.DetectedIOCs.Count;

            if (criticalEvents > 0 || maliciousEvents > 0)
            {
                actions.Add("Activate incident response team immediately");
                actions.Add("Isolate affected systems from the network");
                actions.Add("Preserve forensic evidence for investigation");
                actions.Add("Notify relevant stakeholders and authorities");
            }

            if (iocCount > 10)
            {
                actions.Add("Block identified IOCs in security systems");
                actions.Add("Scan all systems for IOC presence");
                actions.Add("Update threat intelligence feeds");
            }

            if (findings.SecurityEvents.Any(e => e.Category.ToLower().Contains("auth")))
            {
                actions.Add("Review and strengthen authentication mechanisms");
                actions.Add("Implement multi-factor authentication");
                actions.Add("Audit user access permissions");
            }

            if (findings.SecurityEvents.Any(e => e.Category.ToLower().Contains("network")))
            {
                actions.Add("Review network segmentation controls");
                actions.Add("Enhance network monitoring capabilities");
                actions.Add("Update firewall rules and configurations");
            }

            // Default recommendations
            if (!actions.Any())
            {
                actions.Add("Continue regular security monitoring");
                actions.Add("Review and update security policies");
                actions.Add("Conduct security awareness training");
                actions.Add("Perform regular vulnerability assessments");
            }

            return actions;
        }

        private string GenerateBusinessImpact(int severityScore)
        {
            return severityScore switch
            {
                >= 8 => "SEVERE: Potential for significant business disruption, data loss, regulatory penalties, and reputational damage. Executive leadership should be notified immediately.",
                >= 6 => "HIGH: Risk of operational disruption and potential data compromise. Business continuity plans should be reviewed and activated as needed.",
                >= 4 => "MODERATE: Some business risk present with potential for service degradation. Monitor situation closely and prepare contingency plans.",
                >= 2 => "LOW: Minimal immediate business impact, but continued vigilance required to prevent escalation.",
                _ => "MINIMAL: Very low business risk. Maintain standard security posture and monitoring."
            };
        }

        private string GenerateExecutiveSummary(TechnicalFindings findings, AIInsights insights)
        {
            var totalEvents = findings.SecurityEvents.Count;
            var criticalEvents = findings.SecurityEvents.Count(e => e.Priority == SecurityEventPriority.Critical);
            var iocCount = findings.DetectedIOCs.Count;

            // Use an existing property, e.g., 'Name', or fallback to "the provided file" if not available
            var fileName = findings.Metadata.GetType().GetProperty("Name") != null
                ? findings.Metadata.GetType().GetProperty("Name").GetValue(findings.Metadata)?.ToString()
                : "the provided file";
            return $"Security analysis of {fileName} identified {totalEvents} security events, " +
                   $"including {criticalEvents} critical incidents. {iocCount} indicators of compromise were detected. " +
                   $"Primary attack vector appears to be {insights.AttackVector}. " +
                   $"Overall risk assessment: {insights.ThreatAssessment.Split(':')[0]}";
        }

        private string GenerateKeyFindings(TechnicalFindings findings, AIInsights insights)
        {
            var findings_list = new List<string>();

            var eventsByType = findings.EventsByType.OrderByDescending(e => e.Value).Take(3);
            foreach (var eventType in eventsByType)
            {
                findings_list.Add($"• {eventType.Value} {eventType.Key} events detected");
            }

            var iocsByCategory = findings.IOCsByCategory.OrderByDescending(i => i.Value).Take(3);
            foreach (var iocCategory in iocsByCategory)
            {
                findings_list.Add($"• {iocCategory.Value} {iocCategory.Key} IOCs identified");
            }

            findings_list.Add($"• Primary attack vector: {insights.AttackVector}");
            findings_list.Add($"• Severity score: {insights.SeverityScore}/10");

            return string.Join("\n", findings_list);
        }

        private string GenerateImmediateActions(AIInsights insights)
        {
            return string.Join("; ", insights.RecommendedActions.Take(3));
        }

        private string GenerateLongTermRecommendations(TechnicalFindings findings, AIInsights insights)
        {
            var recommendations = new List<string>
            {
                "Implement comprehensive security monitoring and alerting",
                "Establish regular security assessments and penetration testing",
                "Develop and maintain incident response procedures",
                "Enhance employee security awareness training programs",
                "Review and update security policies and procedures regularly"
            };

            if (findings.SecurityEvents.Any(e => e.Category.ToLower().Contains("network")))
            {
                recommendations.Add("Strengthen network segmentation and access controls");
            }

            if (findings.DetectedIOCs.Count > 20)
            {
                recommendations.Add("Implement advanced threat intelligence and hunting capabilities");
            }

            return string.Join("; ", recommendations.Take(4));
        }
    }
}