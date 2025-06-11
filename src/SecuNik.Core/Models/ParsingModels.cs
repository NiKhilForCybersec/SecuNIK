// File: src\SecuNik.Core\Models\ParsingModels.cs
using System.Collections.Generic;

namespace SecuNik.Core.Models
{
    /// <summary>
    /// Request model for file analysis
    /// </summary>
    public class AnalysisRequest
    {
        public string FilePath { get; set; } = string.Empty;
        public string? OriginalFileName { get; set; }
        public AnalysisOptions Options { get; set; } = new();
    }

    /// <summary>
    /// Analysis configuration options
    /// </summary>
    public class AnalysisOptions
    {
        public bool EnableAIAnalysis { get; set; } = true;
        public bool GenerateExecutiveReport { get; set; } = true;
        public bool IncludeTimeline { get; set; } = true;
        public int MaxSecurityEvents { get; set; } = 10000;
        public List<string> FocusKeywords { get; set; } = new();
    }

    /// <summary>
    /// Supported file types for parsing
    /// </summary>
    public enum SupportedFileType
    {
        Unknown,
        CSV,
        JSON,
        PlainText,
        WindowsEventLog,
        NetworkCapture
    }

    /// <summary>
    /// IOC (Indicator of Compromise) types
    /// </summary>
    public enum IOCType
    {
        IPAddress,
        Domain,
        URL,
        FileHash,
        Email,
        Registry,
        Process,
        Service
    }

    /// <summary>
    /// Security event severity levels
    /// </summary>
    public enum SecuritySeverity
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }
}