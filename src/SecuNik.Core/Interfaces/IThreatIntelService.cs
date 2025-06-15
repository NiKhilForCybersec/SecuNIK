using SecuNik.Core.Models;

namespace SecuNik.Core.Interfaces;

public interface IThreatIntelService
{
    Task<List<ThreatIndicator>> GetLatestThreatsAsync();
}
