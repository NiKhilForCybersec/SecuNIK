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

    // The following models previously existed here but were duplicates of
    // types defined in <see cref="AnalysisResult"/>. They have been removed to
    // avoid type conflicts. Use the models from <c>AnalysisResult.cs</c> for
    // parsed security events, file metadata and timeline entries.
}