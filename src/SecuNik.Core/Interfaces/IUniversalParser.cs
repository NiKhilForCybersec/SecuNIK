using System.Threading.Tasks;
using SecuNik.Core.Models;

namespace SecuNik.Core.Interfaces
{
    public interface IUniversalParser
    {
        Task<bool> CanParseAsync(string filePath);
        Task<TechnicalFindings> ParseAsync(string filePath);
        string SupportedFileType { get; }
        int Priority { get; }
    }
}