using System.Threading.Tasks;
using SecuNik.Core.Models;

namespace SecuNik.Core.Interfaces
{
    public interface IAIAnalysisService
    {
        Task<AIInsights> GenerateInsightsAsync(TechnicalFindings findings);
        Task<ExecutiveReport> GenerateExecutiveReportAsync(TechnicalFindings findings, AIInsights insights);
        Task<bool> IsAvailableAsync();
    }
}