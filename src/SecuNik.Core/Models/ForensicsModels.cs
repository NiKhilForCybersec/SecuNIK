namespace SecuNik.Core.Models;

/// <summary>
/// Result of a digital forensic analysis.
/// </summary>
public class ForensicAnalysis
{
    public string CaseId { get; set; } = string.Empty;
    public DateTime AnalysisTimestamp { get; set; }
    public string EvidenceIntegrity { get; set; } = string.Empty;
    public List<string> ChainOfCustody { get; set; } = new();
    public List<string> KeyFindings { get; set; } = new();
    public int ArtifactCount { get; set; }
    public List<string> RecommendedActions { get; set; } = new();
}

/// <summary>
/// Represents a digital artifact extracted from evidence.
/// </summary>
public class DigitalArtifact
{
    public string Type { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Source { get; set; } = string.Empty;
    public string Hash { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
}
