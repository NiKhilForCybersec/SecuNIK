using Microsoft.AspNetCore.Mvc;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.API.Controllers;

/// <summary>
/// Provides threat intelligence data to the frontend.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ThreatIntelController : ControllerBase
{
    private readonly IThreatIntelService _service;
    private readonly ILogger<ThreatIntelController> _logger;

    public ThreatIntelController(IThreatIntelService service, ILogger<ThreatIntelController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Retrieve latest threat indicators.
    /// </summary>
    [HttpGet("latest")]
    [ProducesResponseType(typeof(IEnumerable<ThreatIndicator>), 200)]
    public async Task<IActionResult> GetLatest()
    {
        var data = await _service.GetLatestThreatsAsync();
        return Ok(data);
    }
}
