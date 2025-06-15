namespace SecuNik.Core.Models;

/// <summary>
/// Basic threat indicator returned by threat intelligence service.
/// </summary>
public class ThreatIndicator
{
    public string Type { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime LastSeen { get; set; }
    public string Source { get; set; } = string.Empty;
}
