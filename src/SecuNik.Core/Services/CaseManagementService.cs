using System.Collections.Concurrent;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using Microsoft.Extensions.Logging;

namespace SecuNik.Core.Services;

/// <summary>
/// In-memory implementation of case management service.
/// </summary>
public class CaseManagementService : ICaseManagementService
{
    private readonly ConcurrentDictionary<string, CaseRecord> _cases = new();
    private readonly ILogger<CaseManagementService> _logger;

    public CaseManagementService(ILogger<CaseManagementService> logger)
    {
        _logger = logger;
    }

    public Task<CaseRecord> CreateCaseAsync(CaseRecord record)
    {
        record.Id = string.IsNullOrWhiteSpace(record.Id) ? Guid.NewGuid().ToString("N")[..8] : record.Id;
        record.CreatedAt = record.CreatedAt == default ? DateTime.UtcNow : record.CreatedAt;
        _cases[record.Id] = record;
        _logger.LogInformation("Case created: {Id}", record.Id);
        return Task.FromResult(record);
    }

    public Task<CaseRecord?> GetCaseAsync(string id)
    {
        _cases.TryGetValue(id, out var record);
        return Task.FromResult(record);
    }

    public Task<List<CaseRecord>> GetCasesAsync()
    {
        var list = _cases.Values.OrderByDescending(c => c.CreatedAt).ToList();
        return Task.FromResult(list);
    }
}
