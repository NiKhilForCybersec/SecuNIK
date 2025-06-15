using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SecuNik.AI.Configuration;
using SecuNik.AI.Services;
using SecuNik.Core.Interfaces;
using Microsoft.Extensions.Logging;
using Xunit;

namespace SecuNik.AI.Tests;

public class ServiceCollectionExtensionsTests
{
    [Fact]
    public void AddSecuNikAI_NoApiKey_ResolvesSecurityAnalysisService()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string>())
            .Build();

        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddLogging();
        services.AddSecuNikAI();

        using var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<IAIAnalysisService>();

        Assert.IsType<SecurityAnalysisService>(service);
    }
}
