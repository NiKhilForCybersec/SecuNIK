using System;
using System.Collections.Generic;
using System.Linq;
using SecuNik.Core.Models;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Groups normalized events to find correlations like repeated IPs or bursts of activity
    /// </summary>
    public class CorrelationEngine
    {
        public CorrelationInsights Correlate(IEnumerable<SecurityEvent> events)
        {
            var list = events.ToList();
            var insights = new CorrelationInsights();

            // Group by IP address if present
            var ipGroups = list
                .Where(e => e.Attributes.TryGetValue("ip", out _))
                .GroupBy(e => e.Attributes["ip"])
                .Where(g => g.Count() > 1);

            foreach (var g in ipGroups)
            {
                insights.Groups.Add(new CorrelatedGroup
                {
                    Key = $"IP:{g.Key}",
                    Events = g.ToList()
                });
            }

            // Group by minute timestamp buckets
            var timeGroups = list
                .GroupBy(e => new DateTime(e.Timestamp.Year, e.Timestamp.Month, e.Timestamp.Day, e.Timestamp.Hour, e.Timestamp.Minute, 0))
                .Where(g => g.Count() > 1);

            foreach (var g in timeGroups)
            {
                insights.Groups.Add(new CorrelatedGroup
                {
                    Key = $"TIME:{g.Key:O}",
                    Events = g.ToList()
                });
            }

            return insights;
        }
    }
}
