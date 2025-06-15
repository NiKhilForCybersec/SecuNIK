using System;
using System.Collections.Generic;

namespace SecuNik.Core.Models
{
    /// <summary>
    /// Request object for file analysis
    /// </summary>
    public class AnalysisRequest
    {
        public string FilePath { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public AnalysisOptions Options { get; set; } = new();
        public DateTime RequestTimestamp { get; set; } = DateTime.UtcNow;
        public string RequestId { get; set; } = Guid.NewGuid().ToString("N");
    }

    /// <summary>
    /// Configuration options for analysis
    /// </summary>
    public class AnalysisOptions
    {
        public bool EnableAIAnalysis { get; set; } = true;
        public bool GenerateExecutiveReport { get; set; } = true;
        public bool IncludeTimeline { get; set; } = true;
        public bool PerformForensicAnalysis { get; set; } = true;
        public bool GenerateIOCList { get; set; } = true;
        public int MaxSecurityEvents { get; set; } = 10000;
        public int MaxIOCs { get; set; } = 1000;
        public List<string> FocusKeywords { get; set; } = new();
        public List<string> ExcludePatterns { get; set; } = new();
        public SecurityEventPriority MinimumEventPriority { get; set; } = SecurityEventPriority.Low;
        public bool DeepInspection { get; set; } = false;
        public TimeSpan? TimeRangeStart { get; set; }
        public TimeSpan? TimeRangeEnd { get; set; }
    }

    /// <summary>
    /// Security event priority levels
    /// </summary>
    public enum SecurityEventPriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }

    /// <summary>
    /// Security event model
    /// </summary>
    public class SecurityEvent
    {
        public string EventId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public SecurityEventPriority Priority { get; set; } = SecurityEventPriority.Low;
        public Dictionary<string, object> Properties { get; set; } = new();
        public List<string> AssociatedIOCs { get; set; } = new();
        public string Category { get; set; } = string.Empty;
        public string SubCategory { get; set; } = string.Empty;
        public bool IsMalicious { get; set; } = false;
        public double ConfidenceScore { get; set; } = 0.0;
    }

    /// <summary>
    /// File metadata information
    /// </summary>
    public class FileMetadata
    {
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime FileCreated { get; set; }
        public DateTime FileModified { get; set; }
        public string FileHash { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public string Encoding { get; set; } = string.Empty;
        public int LineCount { get; set; }
        public Dictionary<string, object> AdditionalProperties { get; set; } = new();
    }

    /// <summary>
    /// Timeline event for chronological analysis
    /// </summary>
    public class TimelineEvent
    {
        public DateTime Timestamp { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public SecurityEventPriority Priority { get; set; } = SecurityEventPriority.Low;
        public Dictionary<string, object> Details { get; set; } = new();
        public List<string> RelatedIOCs { get; set; } = new();
        public string Category { get; set; } = string.Empty;
    }
}