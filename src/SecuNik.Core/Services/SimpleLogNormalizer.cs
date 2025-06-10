using System;
using System.Collections.Generic;
using System.Linq;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Default implementation that normalizes timestamps and common attribute names
    /// </summary>
    public class SimpleLogNormalizer : ILogNormalizer
    {
        public IEnumerable<SecurityEvent> Normalize(IEnumerable<SecurityEvent> events)
        {
            foreach (var e in events)
            {
                // Normalize timestamp to UTC
                if (e.Timestamp.Kind == DateTimeKind.Unspecified)
                    e.Timestamp = DateTime.SpecifyKind(e.Timestamp, DateTimeKind.Utc);
                else
                    e.Timestamp = e.Timestamp.ToUniversalTime();

                // Standardize source label
                e.Source = e.Source.Trim().ToUpperInvariant();

                // Map common attribute names
                var normalized = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                foreach (var kvp in e.Attributes)
                {
                    var key = kvp.Key.ToLowerInvariant();
                    if (key is "src" or "source_ip" or "ip") key = "ip";
                    normalized[key] = kvp.Value;
                }
                e.Attributes = normalized;

                yield return e;
            }
        }
    }
}
