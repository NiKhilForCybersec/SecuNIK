using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.AI.Services
{
    /// <summary>
    /// OpenAI-powered cybersecurity analysis service
    /// </summary>
    public class OpenAIIntelligenceService : IAIAnalysisService, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly string _model;
        private readonly int _maxTokens;
        private readonly float _temperature;
        private readonly string _apiKey;
        private bool _disposed;

        public OpenAIIntelligenceService(
            string apiKey,
            string model = "gpt-4o-mini",
            int maxTokens = 2000,
            float temperature = 0.3f)
        {
            _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
            _model = model;
            _maxTokens = maxTokens;
            _temperature = temperature;

            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new Uri("https://api.openai.com/v1/");
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "SecuNIK-CyberSecurity-Platform/1.0");
        }

        public async Task<bool> IsAvailableAsync()
        {
            try
            {
                var testRequest = new
                {
                    model = _model,
                    messages = new[]
                    {
                        new { role = "system", content = "Test" },
                        new { role = "user", content = "Hello" }
                    },
                    max_tokens = 5,
                    temperature = 0.1f
                };

                var json = JsonSerializer.Serialize(testRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("chat/completions", content);
                return response.IsSuccessStatusCode;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<AIInsights> GenerateInsightsAsync(TechnicalFindings findings)
        {
            try
            {
                var prompt = BuildAnalysisPrompt(findings);

                var requestBody = new
                {
                    model = _model,
                    messages = new[]
                    {
                        new { role = "system", content = "You are a senior cybersecurity analyst with expertise in threat detection, incident response, and risk assessment. Provide professional, actionable security analysis." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = _maxTokens,
                    temperature = _temperature
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("chat/completions", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var responseData = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    var aiResponse = responseData.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                    return ParseAIResponse(aiResponse!, findings);
                }
                else
                {
                    return GenerateFallbackInsights(findings);
                }
            }
            catch (Exception)
            {
                return GenerateFallbackInsights(findings);
            }
        }

        public async Task<ExecutiveReport> GenerateExecutiveReportAsync(TechnicalFindings findings, AIInsights insights)
        {
            try
            {
                var prompt = BuildExecutiveReportPrompt(findings, insights);

                var requestBody = new
                {
                    model = _model,
                    messages = new[]
                    {
                        new { role = "system", content = "You are a cybersecurity executive consultant preparing reports for C-level executives. Focus on business impact, risk management, and strategic recommendations. Keep technical details minimal and emphasize business consequences." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = _maxTokens,
                    temperature = _temperature
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("chat/completions", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var responseData = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    var aiResponse = responseData.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                    return ParseExecutiveResponse(aiResponse!, insights);
                }
                else
                {
                    return GenerateFallbackExecutiveReport(findings, insights);
                }
            }
            catch (Exception)
            {
                return GenerateFallbackExecutiveReport(findings, insights);
            }
        }

        private string BuildAnalysisPrompt(TechnicalFindings findings)
        {
            var prompt = $@"
CYBERSECURITY ANALYSIS REQUEST

FILE METADATA:
- Security Events: {findings.SecurityEvents.Count}
- IOCs Detected: {findings.DetectedIOCs.Count}
- File Size: {findings.Metadata.Size} bytes

SECURITY EVENTS SUMMARY:
";

            var sampleEvents = findings.SecurityEvents.Take(10).ToList();
            foreach (var evt in sampleEvents)
            {
                prompt += $"- {evt.Timestamp:yyyy-MM-dd HH:mm:ss} | {evt.Severity} | {evt.EventType} | {evt.Description}\n";
            }

            if (findings.SecurityEvents.Count > 10)
            {
                prompt += $"... and {findings.SecurityEvents.Count - 10} more events\n";
            }

            prompt += $@"
DETECTED IOCS:
{string.Join(", ", findings.DetectedIOCs.Take(20))}
{(findings.DetectedIOCs.Count > 20 ? $"... and {findings.DetectedIOCs.Count - 20} more IOCs" : "")}

ANALYSIS REQUIREMENTS:
Please provide a professional cybersecurity analysis in this JSON format:
{{
    ""attack_vector"": ""Primary attack method identified"",
    ""threat_assessment"": ""Detailed threat analysis with confidence level"",
    ""severity_score"": 1-10,
    ""recommended_actions"": [""action1"", ""action2"", ""action3""],
    ""business_impact"": ""Business risk assessment""
}}

Focus on:
1. Identifying the primary attack vector or threat type
2. Assessing the severity and confidence level
3. Providing actionable security recommendations
4. Evaluating business impact and urgency
";

            return prompt;
        }

        private string BuildExecutiveReportPrompt(TechnicalFindings findings, AIInsights insights)
        {
            return $@"
EXECUTIVE CYBERSECURITY BRIEFING REQUEST

ANALYSIS OVERVIEW:
- Threat Severity: {insights.SeverityScore}/10
- Primary Attack Vector: {insights.AttackVector}
- Security Events: {findings.SecurityEvents.Count}
- IOCs Identified: {findings.DetectedIOCs.Count}

AI ASSESSMENT:
{insights.ThreatAssessment}

BUSINESS IMPACT:
{insights.BusinessImpact}

Please generate an executive-level cybersecurity report in this JSON format:
{{
    ""summary"": ""2-3 sentence executive summary"",
    ""key_findings"": ""Bulleted list of critical findings"",
    ""risk_level"": ""HIGH/MEDIUM/LOW"",
    ""immediate_actions"": ""Urgent actions for next 24-48 hours"",
    ""long_term_recommendations"": ""Strategic recommendations for improving security posture""
}}

Requirements:
- Write for C-level executives (minimal technical jargon)
- Focus on business impact and risk management
- Provide clear, actionable recommendations
- Emphasize urgency and resource requirements
";
        }

        private AIInsights ParseAIResponse(string response, TechnicalFindings findings)
        {
            try
            {
                var jsonStart = response.IndexOf('{');
                var jsonEnd = response.LastIndexOf('}');

                if (jsonStart >= 0 && jsonEnd > jsonStart)
                {
                    var jsonContent = response.Substring(jsonStart, jsonEnd - jsonStart + 1);
                    var parsed = JsonSerializer.Deserialize<JsonElement>(jsonContent);

                    return new AIInsights
                    {
                        AttackVector = GetJsonString(parsed, "attack_vector") ?? "Unknown attack vector",
                        ThreatAssessment = GetJsonString(parsed, "threat_assessment") ?? "Analysis completed",
                        SeverityScore = GetJsonInt(parsed, "severity_score") ?? CalculateFallbackSeverity(findings),
                        RecommendedActions = GetJsonStringArray(parsed, "recommended_actions") ?? new List<string> { "Review security events", "Monitor for additional threats" },
                        BusinessImpact = GetJsonString(parsed, "business_impact") ?? "Impact assessment pending"
                    };
                }
            }
            catch (Exception)
            {
                // Fall through to fallback
            }

            return GenerateFallbackInsights(findings);
        }

        private ExecutiveReport ParseExecutiveResponse(string response, AIInsights insights)
        {
            try
            {
                var jsonStart = response.IndexOf('{');
                var jsonEnd = response.LastIndexOf('}');

                if (jsonStart >= 0 && jsonEnd > jsonStart)
                {
                    var jsonContent = response.Substring(jsonStart, jsonEnd - jsonStart + 1);
                    var parsed = JsonSerializer.Deserialize<JsonElement>(jsonContent);

                    return new ExecutiveReport
                    {
                        Summary = GetJsonString(parsed, "summary") ?? "Executive analysis completed",
                        KeyFindings = GetJsonString(parsed, "key_findings") ?? "Key findings documented",
                        RiskLevel = GetJsonString(parsed, "risk_level") ?? DetermineRiskLevel(insights.SeverityScore),
                        ImmediateActions = GetJsonString(parsed, "immediate_actions") ?? "Review recommended actions",
                        LongTermRecommendations = GetJsonString(parsed, "long_term_recommendations") ?? "Implement security improvements"
                    };
                }
            }
            catch (Exception)
            {
                // Fall through to fallback
            }

            return GenerateFallbackExecutiveReport(null, insights);
        }

        private AIInsights GenerateFallbackInsights(TechnicalFindings findings)
        {
            var severity = CalculateFallbackSeverity(findings);

            return new AIInsights
            {
                AttackVector = findings.SecurityEvents.Any(e => e.Description.ToLower().Contains("malware"))
                    ? "Malware detection - endpoint security breach"
                    : "Security events detected - investigation required",
                ThreatAssessment = $"Automated analysis identified {findings.SecurityEvents.Count} security events. Manual review recommended.",
                SeverityScore = severity,
                RecommendedActions = new List<string>
                {
                    "Review detected security events",
                    "Validate IOCs against threat intelligence",
                    "Implement additional monitoring"
                },
                BusinessImpact = severity > 7 ? "High business impact - immediate response required" :
                               severity > 4 ? "Moderate business impact - timely response needed" :
                               "Low business impact - routine monitoring"
            };
        }

        private ExecutiveReport GenerateFallbackExecutiveReport(TechnicalFindings? findings, AIInsights insights)
        {
            return new ExecutiveReport
            {
                Summary = $"Cybersecurity analysis completed with {insights.SeverityScore}/10 severity rating. Immediate attention {(insights.SeverityScore > 6 ? "required" : "recommended")}.",
                KeyFindings = $"• Threat severity: {insights.SeverityScore}/10\n• Primary concern: {insights.AttackVector}\n• Response urgency: {(insights.SeverityScore > 7 ? "HIGH" : insights.SeverityScore > 4 ? "MEDIUM" : "LOW")}",
                RiskLevel = DetermineRiskLevel(insights.SeverityScore),
                ImmediateActions = string.Join("; ", insights.RecommendedActions.Take(2)),
                LongTermRecommendations = "Implement comprehensive security monitoring and establish regular threat assessment procedures."
            };
        }

        private int CalculateFallbackSeverity(TechnicalFindings findings)
        {
            int score = 1;
            score += Math.Min(findings.SecurityEvents.Count / 5, 4);
            score += Math.Min(findings.DetectedIOCs.Count / 3, 3);

            var criticalEvents = findings.SecurityEvents.Count(e =>
                e.Severity.ToLower() == "critical" || e.Severity.ToLower() == "high");
            score += Math.Min(criticalEvents * 2, 4);

            return Math.Min(score, 10);
        }

        private string DetermineRiskLevel(int severityScore)
        {
            return severityScore > 7 ? "HIGH" : severityScore > 4 ? "MEDIUM" : "LOW";
        }

        private string? GetJsonString(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.String
                ? prop.GetString() : null;
        }

        private int? GetJsonInt(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.Number
                ? prop.GetInt32() : null;
        }

        private List<string>? GetJsonStringArray(JsonElement element, string propertyName)
        {
            if (element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                return prop.EnumerateArray()
                    .Where(item => item.ValueKind == JsonValueKind.String)
                    .Select(item => item.GetString()!)
                    .ToList();
            }
            return null;
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _httpClient?.Dispose();
                }

                _disposed = true;
            }
        }

        void IDisposable.Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
