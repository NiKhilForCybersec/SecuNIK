using System;
using System.Collections.Generic;
using SecuNik.Core.Models;
using SecuNik.Core.Services;
using Xunit;

public class NormalizationAndCorrelationTests
{
    [Fact]
    public void Normalizer_StandardizesSourceAndTimestamp()
    {
        var events = new List<SecurityEvent>
        {
            new SecurityEvent { Timestamp = new DateTime(2024,1,1,0,0,0,DateTimeKind.Local), Source = "fw", Attributes = new Dictionary<string,string>{{"source_ip","1.2.3.4"}} }
        };
        var norm = new SimpleLogNormalizer();
        var result = norm.Normalize(events);
        var e = Assert.Single(result);
        Assert.Equal(DateTimeKind.Utc, e.Timestamp.Kind);
        Assert.Equal("FW", e.Source);
        Assert.Contains("ip", e.Attributes.Keys);
    }

    [Fact]
    public void CorrelationEngine_GroupsByIp()
    {
        var events = new List<SecurityEvent>
        {
            new SecurityEvent { Timestamp = DateTime.UtcNow, Attributes = new Dictionary<string,string>{{"ip","1.1.1.1"}} },
            new SecurityEvent { Timestamp = DateTime.UtcNow.AddSeconds(30), Attributes = new Dictionary<string,string>{{"ip","1.1.1.1"}} },
            new SecurityEvent { Timestamp = DateTime.UtcNow, Attributes = new Dictionary<string,string>{{"ip","2.2.2.2"}} }
        };
        var engine = new CorrelationEngine();
        var insights = engine.Correlate(events);
        Assert.Contains(insights.Groups, g => g.Key.StartsWith("IP:1.1.1.1"));
    }
}
