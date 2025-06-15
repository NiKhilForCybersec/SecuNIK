using Microsoft.AspNetCore.Mvc;
using SecuNik.Core.Models;
using SecuNik.API;

namespace SecuNik.API.Controllers;

/// <summary>
/// Provides forensic analysis operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ForensicsController : ControllerBase
{
    private readonly IForensicService _service;
    private readonly ILogger<ForensicsController> _logger;

    public ForensicsController(IForensicService service, ILogger<ForensicsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Perform forensic analysis on technical findings.
    /// </summary>
    [HttpPost("analyze")]
    [ProducesResponseType(typeof(ForensicAnalysis), 200)]
    public async Task<IActionResult> Analyze([FromBody] TechnicalFindings findings)
    {
        var result = await _service.PerformForensicAnalysisAsync(findings);
        return Ok(result);
    }

    /// <summary>
    /// Extract digital artifacts from findings.
    /// </summary>
    [HttpPost("artifacts")]
    [ProducesResponseType(typeof(IEnumerable<DigitalArtifact>), 200)]
    public async Task<IActionResult> ExtractArtifacts([FromBody] TechnicalFindings findings)
    {
        var artifacts = await _service.ExtractDigitalArtifactsAsync(findings);
        return Ok(artifacts);
    }
}
