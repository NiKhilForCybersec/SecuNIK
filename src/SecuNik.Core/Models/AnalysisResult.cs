using System;
using System.Collections.Generic;
namespace SecuNik.Core.Models
{
    /// <summary>
    /// Complete analysis result containing technical findings, AI insights, and executive report
    /// </summary>
    public class AnalysisResult
    {
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public DateTime AnalysisTimestamp { get; set; }
        public TechnicalFindings Technical { get; set; } = new();
        public AIInsights AI { get; set; } = new();
        public ExecutiveReport Executive { get; set; } = new();
        public Timeline Timeline { get; set; } = new();
        public ForensicAnalysis? Forensics { get; set; }
    }

    /// <summary>
    /// Raw technical findings from file parsing
    /// </summary>
    public class TechnicalFindings
    {
        public Dictionary<string, object> RawData { get; set; } = new();
        public List<string> DetectedIOCs { get; set; } = new();
        public List<SecurityEvent> SecurityEvents { get; set; } = new();
        public FileMetadata Metadata { get; set; } = new();
        public string FileFormat { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
        public int TotalLines { get; set; }
        public Dictionary<string, int> IOCsByCategory { get; set; } = new();
        public Dictionary<string, int> EventsByType { get; set; } = new();
    }

    /// <summary>
    /// AI-generated insights and analysis
    /// </summary>
    public class AIInsights
    {
        public string AttackVector { get; set; } = string.Empty;
        public string ThreatAssessment { get; set; } = string.Empty;
        public int SeverityScore { get; set; }
        public List<string> RecommendedActions { get; set; } = new();
        public string BusinessImpact { get; set; } = string.Empty;
    }

    /// <summary>
    /// Executive-level summary and recommendations
    /// </summary>
    public class ExecutiveReport
    {
        public string Summary { get; set; } = string.Empty;
        public string KeyFindings { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = string.Empty;
        public string ImmediateActions { get; set; } = string.Empty;
        public string LongTermRecommendations { get; set; } = string.Empty;
    }

    /// <summary>
    /// Chronological timeline of security events
    /// </summary>
    public class Timeline
    {
        public List<TimelineEvent> Events { get; set; } = new();
        public DateTime FirstActivity { get; set; }
        public DateTime LastActivity { get; set; }
    }


    /// <summary>
    /// Timeline event for chronological reconstruction
    /// </summary>
    public class TimelineEvent
    {
        public DateTime Timestamp { get; set; }
        public string Event { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Confidence { get; set; } = string.Empty;
    }

    /// <summary>
    /// File metadata and characteristics
    /// </summary>
    public class FileMetadata
    {
        public long Size { get; set; }
        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }
        public string Hash { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
    }
}