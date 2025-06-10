using System.Collections.Generic;
using SecuNik.Core.Models;

namespace SecuNik.Core.Interfaces
{
    /// <summary>
    /// Normalizes raw security events to a consistent schema
    /// </summary>
    public interface ILogNormalizer
    {
        IEnumerable<SecurityEvent> Normalize(IEnumerable<SecurityEvent> events);
    }
}
