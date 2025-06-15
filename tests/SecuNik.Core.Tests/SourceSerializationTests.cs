using System.Text.Json;
using FluentAssertions;
using SecuNik.Core.Models;
using Xunit;

namespace SecuNik.Core.Tests;

public class SourceSerializationTests
{
    [Fact]
    public void SecurityEvent_SerializesAndDeserializesSource()
    {
        var evt = new SecurityEvent
        {
            Timestamp = DateTime.UtcNow,
            EventType = "Test",
            Source = "UnitTest"
        };

        var json = JsonSerializer.Serialize(evt);
        var back = JsonSerializer.Deserialize<SecurityEvent>(json);

        back.Should().NotBeNull();
        back!.Source.Should().Be("UnitTest");
    }
}
