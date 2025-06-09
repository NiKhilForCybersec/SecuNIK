using Microsoft.Extensions.DependencyInjection;
using SecuNik.Core.Interfaces;
using SecuNik.AI.Services;

namespace SecuNik.AI.Configuration
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddSecuNikAI(this IServiceCollection services)
        {
            // Register the NEW service with unique name
            services.AddScoped<IAIAnalysisService, SecurityAnalysisService>();

            return services;
        }
    }
}