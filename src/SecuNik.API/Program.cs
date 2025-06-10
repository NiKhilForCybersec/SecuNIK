using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Services;
using SecuNik.AI.Configuration;

namespace SecuNik.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container
            builder.Services.AddControllers();

            // Add CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            // Register SecuNik services
            builder.Services.AddScoped<IUniversalParser, CsvLogParser>();
            builder.Services.AddScoped<IUniversalParser, WindowsEventLogParser>();
            builder.Services.AddScoped<IUniversalParser, LinuxSessionLogParser>();
            builder.Services.AddScoped<IUniversalParser, WebServerLogParser>();
            builder.Services.AddScoped<IUniversalParser, NetworkCaptureParser>();
            builder.Services.AddScoped<IUniversalParser, SyslogParser>();
            builder.Services.AddScoped<IUniversalParser, FirewallLogParser>();
            builder.Services.AddScoped<IUniversalParser, DatabaseLogParser>();
            builder.Services.AddScoped<IUniversalParser, MailServerLogParser>();
            builder.Services.AddScoped<IUniversalParser, DnsLogParser>();
            builder.Services.AddScoped<UniversalParserService>();
            builder.Services.AddScoped<IAnalysisEngine, AnalysisEngine>();

            // Add AI services
            builder.Services.AddSecuNikAI();

            // Configure file upload
            builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 200 * 1024 * 1024; // 200MB
            });

            var app = builder.Build();

            // Configure static file serving
            app.UseDefaultFiles(); // Serves index.html by default
            app.UseStaticFiles();  // Serves files from wwwroot

            app.UseCors("AllowAll");
            app.UseAuthorization();
            app.MapControllers();

            // Health check endpoint
            app.MapGet("/api/health", () => new { 
                status = "Online", 
                service = "SecuNik Advanced Cybersecurity Platform",
                version = "v2.0-Professional",
                timestamp = DateTime.UtcNow 
            });

            // API status endpoint
            app.MapGet("/health", () => new { 
                status = "Online", 
                service = "SecuNik",
                timestamp = DateTime.UtcNow 
            });

            Console.WriteLine("🚀 SecuNik Advanced Platform starting...");
            Console.WriteLine("🎨 Frontend: http://localhost:5043");
            Console.WriteLine("🔌 API Endpoints: http://localhost:5043/api/");
            Console.WriteLine("💼 Professional cybersecurity analysis ready");

            app.Run();
        }
    }
}