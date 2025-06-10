using System;
using System.Collections.Generic;

namespace SecuNik.Core.Models
{
    /// <summary>
    /// Result from correlating security events
    /// </summary>
    public class CorrelationInsights
    {
        public List<CorrelatedGroup> Groups { get; set; } = new();
    }

    public class CorrelatedGroup
    {
        public string Key { get; set; } = string.Empty;
        public List<SecurityEvent> Events { get; set; } = new();
    }
}
