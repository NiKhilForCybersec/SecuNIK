using System;
using System.Collections.Generic;

namespace SecuNik.Core.Models
{
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


}
