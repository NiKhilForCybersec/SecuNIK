using System.Collections.Generic;
using System.Threading.Tasks;
using SecuNik.Core.Models;

namespace SecuNik.Core.Interfaces
{
    public interface IAnalysisEngine
    {
        Task<AnalysisResult> AnalyzeFileAsync(AnalysisRequest request);
        Task<List<string>> GetSupportedFileTypesAsync();
        Task<bool> CanProcessFileAsync(string filePath);
    }
}