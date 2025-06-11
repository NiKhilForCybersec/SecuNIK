using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using SecuNik.API.Controllers;
using SecuNik.Core.Interfaces;
using Xunit;
using Microsoft.AspNetCore.Mvc;

public class HealthEndpointTests
{
    [Fact]
    public void Health_ReturnsStatus()
    {
        var engineMock = new Mock<IAnalysisEngine>();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string>()).Build();
        var controller = new AnalysisController(engineMock.Object, new NullLogger<AnalysisController>(), config);

        var result = controller.Health();

        var ok = Assert.IsType<OkObjectResult>(result);
        var statusProp = ok.Value!.GetType().GetProperty("status");
        var status = statusProp?.GetValue(ok.Value)?.ToString();
        Assert.Equal("Healthy", status);
    }
}
