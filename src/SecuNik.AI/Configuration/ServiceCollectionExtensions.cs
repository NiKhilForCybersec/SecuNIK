using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using SecuNik.Core.Interfaces;
using SecuNik.AI.Services;

namespace SecuNik.AI.Configuration
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddSecuNikAI(this IServiceCollection services)
        {
            services.AddHttpClient("OpenAI", (provider, client) =>
            {
                var configuration = provider.GetRequiredService<IConfiguration>();
                var apiKey = configuration["OpenAI:ApiKey"];
                client.BaseAddress = new Uri("https://api.openai.com/v1/");
                if (!string.IsNullOrEmpty(apiKey))
                {
                    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
                }
                client.DefaultRequestHeaders.Add("User-Agent", "SecuNIK-CyberSecurity-Platform/1.0");
            });

            // Register the AI analysis service
            services.AddScoped<IAIAnalysisService>(provider =>
            {
                var configuration = provider.GetRequiredService<IConfiguration>();

                // Check if OpenAI is configured and available
                var apiKey = configuration["OpenAI:ApiKey"];
                var enableAIStr = configuration["SecuNik:EnableAI"];
                var enableAI = enableAIStr != "false"; // Default to true unless explicitly set to false

                if (!string.IsNullOrEmpty(apiKey) && apiKey != "your-openai-api-key-here" && enableAI)
                {
                    try
                    {
                        // Get OpenAI configuration
                        var model = configuration["OpenAI:Model"] ?? "gpt-4o-mini";
                        var maxTokensStr = configuration["OpenAI:MaxTokens"];
                        var maxTokens = int.TryParse(maxTokensStr, out var tokens) ? tokens : 2000;
                        var temperatureStr = configuration["OpenAI:Temperature"];
                        var temperature = float.TryParse(temperatureStr, out var temp) ? temp : 0.3f;

                        // Try to create OpenAI service
                        var httpClientFactory = provider.GetRequiredService<IHttpClientFactory>();
                        var httpClient = httpClientFactory.CreateClient("OpenAI");
                        return new OpenAIIntelligenceService(httpClient, apiKey, model, maxTokens, temperature);
                    }
                    catch (Exception)
                    {
                        // Fall back to rule-based service if OpenAI fails
                    }
                }

                // Fallback to rule-based service
                return new SecurityAnalysisService(provider.GetRequiredService<ILogger<SecurityAnalysisService>>());
            });

            return services;
        }
    }
}