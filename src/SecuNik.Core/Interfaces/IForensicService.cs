using System.Collections.Generic;
using System.Threading.Tasks;
using SecuNik.Core.Models;

namespace SecuNik.Core.Interfaces;

/// <summary>
/// Provides forensic analysis capabilities.
/// </summary>
public interface IForensicService
{
    Task<ForensicAnalysis> PerformForensicAnalysisAsync(TechnicalFindings findings);
    Task<List<DigitalArtifact>> ExtractDigitalArtifactsAsync(TechnicalFindings findings);
}
