using System;
using System.Collections.Generic;

namespace SecuNik.Core.Models
{
    public class SecurityFinding
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FindingType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "MEDIUM";
        public DateTime Timestamp { get; set; }
        public string Source { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class AIInsight
    {
        public string Summary { get; set; } = string.Empty;
        public string Severity { get; set; } = "MEDIUM";
        public string BusinessImpact { get; set; } = string.Empty;
        public List<string> Recommendations { get; set; } = new();
        public double ConfidenceScore { get; set; }
        public List<string> AttackVectors { get; set; } = new();
        public List<string> IOCs { get; set; } = new();
        public DateTime Timestamp { get; set; }
    }
}