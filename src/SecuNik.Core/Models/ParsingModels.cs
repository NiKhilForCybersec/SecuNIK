using System.Collections.Generic;
namespace SecuNik.Core.Models
{

    /// <summary>
    /// Supported file types for parsing
    /// </summary>
    public enum SupportedFileType
    {
        Unknown,
        CSV,
        JSON,
        PlainText,
        WindowsEventLog,
        NetworkCapture
    }

    /// <summary>
    /// IOC (Indicator of Compromise) types
    /// </summary>
    public enum IOCType
    {
        IPAddress,
        Domain,
        URL,
        FileHash,
        Email,
        Registry,
        Process,
        Service
    }

    /// <summary>
    /// Security event severity levels
    /// </summary>
    public enum SecuritySeverity
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }
}
