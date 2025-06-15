using SecuNik.Core.Models;

namespace SecuNik.Core.Interfaces;

public interface ICaseManagementService
{
    Task<List<CaseRecord>> GetCasesAsync();
    Task<CaseRecord?> GetCaseAsync(string id);
    Task<CaseRecord> CreateCaseAsync(CaseRecord record);
}
