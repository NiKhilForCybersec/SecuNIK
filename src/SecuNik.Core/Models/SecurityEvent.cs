namespace SecuNik.Core.Models;

/// <summary>
/// Generic security event detected during log or file analysis.
/// </summary>
public class SecurityEvent
{
    /// <summary>Unique identifier for the event.</summary>
    public string EventId { get; set; } = Guid.NewGuid().ToString("N");

    /// <summary>Time the event occurred.</summary>
    public DateTime Timestamp { get; set; }

    /// <summary>High level event type or name.</summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>System or component that generated the event.</summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>Brief message describing the event.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Detailed description of the event.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Textual severity for basic parsers.</summary>
    public string Severity { get; set; } = string.Empty;

    /// <summary>Priority level used in AI analysis.</summary>
    public SecurityEventPriority Priority { get; set; } = SecurityEventPriority.Low;

    /// <summary>Arbitrary key/value properties extracted from the source.</summary>
    public Dictionary<string, object> Properties { get; set; } = new();

    /// <summary>String based attributes captured from logs.</summary>
    public Dictionary<string, string> Attributes { get; set; } = new();

    /// <summary>Indicators of compromise linked to the event.</summary>
    public List<string> AssociatedIOCs { get; set; } = new();

    /// <summary>Logical category of the event.</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>More specific classification.</summary>
    public string SubCategory { get; set; } = string.Empty;

    /// <summary>Flag indicating malicious activity.</summary>
    public bool IsMalicious { get; set; }

    /// <summary>Confidence score assigned by analysis engines.</summary>
    public double ConfidenceScore { get; set; }

    /// <summary>
    /// Helper to map textual severity values to a priority level.
    /// </summary>
    public static SecurityEventPriority GetPriorityFromSeverity(string? severity)
    {
        return severity?.Trim().ToLower() switch
        {
            "critical" or "4" => SecurityEventPriority.Critical,
            "high" or "3" => SecurityEventPriority.High,
            "medium" or "2" => SecurityEventPriority.Medium,
            "low" or "info" or "informational" or "1" or "0" => SecurityEventPriority.Low,
            _ => SecurityEventPriority.Medium
        };
    }
}

/// <summary>
/// Priority levels for security events.
/// </summary>
public enum SecurityEventPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}
