namespace SecuNik.Core.Models;

/// <summary>
/// Simple incident case record for case management features.
/// </summary>
public class CaseRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public string Title { get; set; } = string.Empty;
    public string Severity { get; set; } = "low";
    public string Assignee { get; set; } = "Unassigned";
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "open";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
