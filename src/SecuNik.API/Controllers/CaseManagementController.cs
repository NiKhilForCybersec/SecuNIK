using Microsoft.AspNetCore.Mvc;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.API.Controllers;

/// <summary>
/// Manages incident cases for the dashboard.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CaseManagementController : ControllerBase
{
    private readonly ICaseManagementService _service;
    private readonly ILogger<CaseManagementController> _logger;

    public CaseManagementController(ICaseManagementService service, ILogger<CaseManagementController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Retrieve all cases.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CaseRecord>), 200)]
    public async Task<IActionResult> GetCases()
    {
        var cases = await _service.GetCasesAsync();
        return Ok(cases);
    }

    /// <summary>
    /// Retrieve a specific case by id.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CaseRecord), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCase(string id)
    {
        var record = await _service.GetCaseAsync(id);
        return record is null ? NotFound() : Ok(record);
    }

    /// <summary>
    /// Create a new case.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CaseRecord), 200)]
    public async Task<IActionResult> CreateCase([FromBody] CaseRecord record)
    {
        var created = await _service.CreateCaseAsync(record);
        return Ok(created);
    }
}
