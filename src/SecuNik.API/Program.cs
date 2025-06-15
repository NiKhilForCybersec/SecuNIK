using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Services;
using SecuNik.Core.Models;
using SecuNik.AI.Configuration;
using System;

namespace SecuNik.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configure logging
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();
            builder.Logging.AddDebug();

            // Add services to the container
            builder.Services.AddControllers()
                .ConfigureApiBehaviorOptions(options =>
                {
                    options.SuppressModelStateInvalidFilter = false;
                });

            // Add API documentation
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "SecuNik Professional API",
                    Version = "v2.0",
                    Description = "Advanced Cybersecurity Analysis Platform API",
                    Contact = new Microsoft.OpenApi.Models.OpenApiContact
                    {
                        Name = "SecuNik Team",
                        Email = "support@secunik.com"
                    }
                });

                // Include XML comments if available
                var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (System.IO.File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }
            });

            // Add CORS with specific configuration
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("SecuNikCORS", policy =>
                {
                    policy.WithOrigins("http://localhost:5043", "https://localhost:7264")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });

                // Fallback policy for development
                options.AddPolicy("Development", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            // Configure JSON options
            builder.Services.ConfigureHttpJsonOptions(options =>
            {
                options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.SerializerOptions.WriteIndented = true;
            });

            // Register SecuNik Core services with proper lifetimes
            RegisterCoreServices(builder.Services);

            // Add AI services
            builder.Services.AddSecuNikAI();

            // Configure file upload
            builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 50 * 1024 * 1024; // 50MB
                options.ValueLengthLimit = int.MaxValue;
                options.ValueCountLimit = int.MaxValue;
                options.KeyLengthLimit = int.MaxValue;
            });

            // Configure application settings
            builder.Services.Configure<SecuNikSettings>(
                builder.Configuration.GetSection("SecuNik"));

            var app = builder.Build();

            // Configure the HTTP request pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SecuNik API v2.0");
                    c.RoutePrefix = "swagger";
                    c.DisplayRequestDuration();
                    c.EnableDeepLinking();
                });

                app.UseDeveloperExceptionPage();
                app.UseCors("Development");
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
                app.UseCors("SecuNikCORS");
            }

            // Security headers
            app.Use(async (context, next) =>
            {
                context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
                context.Response.Headers.Add("X-Frame-Options", "DENY");
                context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
                context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");

                await next();
            });

            // Configure static file serving with caching
            app.UseDefaultFiles(new DefaultFilesOptions
            {
                DefaultFileNames = new[] { "index.html" }
            });

            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    // Cache static files for 1 hour in development, 1 day in production
                    var cacheDuration = app.Environment.IsDevelopment() ? 3600 : 86400;
                    ctx.Context.Response.Headers.Add("Cache-Control", $"public,max-age={cacheDuration}");
                }
            });

            app.UseRouting();
            app.UseAuthorization();

            // Map API controllers
            app.MapControllers();

            // Health check endpoints
            app.MapGet("/api/health", () => new
            {
                status = "Online",
                service = "SecuNik Advanced Cybersecurity Platform",
                version = "v2.0-Professional",
                timestamp = DateTime.UtcNow,
                environment = app.Environment.EnvironmentName
            }).WithTags("Health");

            app.MapGet("/health", () => new
            {
                status = "Online",
                service = "SecuNik",
                timestamp = DateTime.UtcNow
            }).WithTags("Health");

            // API status endpoint with detailed information
            app.MapGet("/api/status", async (IServiceProvider services) =>
            {
                var logger = services.GetRequiredService<ILogger<Program>>();

                try
                {
                    var analysisEngine = services.GetRequiredService<IAnalysisEngine>();
                    var aiService = services.GetRequiredService<IAIAnalysisService>();

                    var supportedTypes = await analysisEngine.GetSupportedFileTypesAsync();
                    var aiAvailable = await aiService.IsAvailableAsync();

                    return Results.Ok(new
                    {
                        status = "Healthy",
                        timestamp = DateTime.UtcNow,
                        version = "2.0-Professional",
                        services = new
                        {
                            analysisEngine = "Available",
                            aiService = aiAvailable ? "Available" : "Limited",
                            supportedFileTypes = supportedTypes.Count
                        },
                        capabilities = new
                        {
                            fileAnalysis = true,
                            aiInsights = aiAvailable,
                            executiveReports = true,
                            timelineGeneration = true,
                            iocDetection = true,
                            forensicAnalysis = true
                        }
                    });
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Health check failed");
                    return Results.Problem("Service health check failed");
                }
            }).WithTags("Health");

            // Fallback route for SPA
            app.MapFallbackToFile("index.html");

            // Log startup information
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            var configuration = app.Services.GetRequiredService<IConfiguration>();

            logger.LogInformation("🚀 SecuNik Advanced Cybersecurity Platform starting...");
            logger.LogInformation("🎨 Frontend: http://localhost:5043");
            logger.LogInformation("🔌 API Endpoints: http://localhost:5043/api/");
            logger.LogInformation("📚 API Documentation: http://localhost:5043/swagger");
            logger.LogInformation("💼 Professional cybersecurity analysis ready");
            logger.LogInformation("🌍 Environment: {Environment}", app.Environment.EnvironmentName);

            // Log configuration status
            var enableAI = configuration.GetValue<bool>("SecuNik:EnableAI", true);
            var hasOpenAIKey = !string.IsNullOrEmpty(configuration["OpenAI:ApiKey"]);

            logger.LogInformation("🤖 AI Analysis: {Status}",
                enableAI && hasOpenAIKey ? "Enabled (OpenAI)" : "Enabled (Rule-based)");

            app.Run();
        }

        /// <summary>
        /// Register core SecuNik services
        /// </summary>
        private static void RegisterCoreServices(IServiceCollection services)
        {
            // Register all parser implementations
            services.AddScoped<IUniversalParser, CsvLogParser>();
            services.AddScoped<IUniversalParser, WindowsEventLogParser>();
            services.AddScoped<IUniversalParser, LinuxSessionLogParser>();
            services.AddScoped<IUniversalParser, WebServerLogParser>();
            services.AddScoped<IUniversalParser, NetworkCaptureParser>();
            services.AddScoped<IUniversalParser, SyslogParser>();
            services.AddScoped<IUniversalParser, FirewallLogParser>();
            services.AddScoped<IUniversalParser, DatabaseLogParser>();
            services.AddScoped<IUniversalParser, MailServerLogParser>();
            services.AddScoped<IUniversalParser, DnsLogParser>();

            // Register core services
            services.AddScoped<UniversalParserService>();
            services.AddScoped<IAnalysisEngine, AnalysisEngine>();

            // Register additional services
            services.AddScoped<IIOCDetectionService, IOCDetectionService>();
            services.AddScoped<ITimelineService, TimelineService>();
            services.AddScoped<IForensicService, ForensicService>();
            services.AddSingleton<ICaseManagementService, CaseManagementService>();
            services.AddSingleton<IThreatIntelService, ThreatIntelService>();
        }
    }

    /// <summary>
    /// Application configuration settings
    /// </summary>
    public class SecuNikSettings
    {
        public bool EnableAI { get; set; } = true;
        public bool EnableForensicAnalysis { get; set; } = true;
        public bool EnableExecutiveReports { get; set; } = true;
        public int MaxFileSize { get; set; } = 50 * 1024 * 1024; // 50MB
        public int MaxSecurityEvents { get; set; } = 10000;
        public int MaxIOCs { get; set; } = 1000;
        public string[] AllowedFileTypes { get; set; } = {
            "csv", "log", "txt", "evtx", "pcap", "json", "xml"
        };
        public TimeSpan AnalysisTimeout { get; set; } = TimeSpan.FromMinutes(10);
        public bool EnableDetailedLogging { get; set; } = false;
    }

    /// <summary>
    /// Interface for IOC detection service
    /// </summary>
    public interface IIOCDetectionService
    {
        Task<List<string>> DetectIOCsAsync(string content);
        Task<Dictionary<string, int>> CategorizeIOCsAsync(List<string> iocs);
    }

    /// <summary>
    /// Interface for timeline service
    /// </summary>
    public interface ITimelineService
    {
        Task<List<TimelineEvent>> GenerateTimelineAsync(List<SecurityEvent> events);
        Task<Dictionary<string, object>> AnalyzeTimelineAsync(List<TimelineEvent> timeline);
    }


    /// <summary>
    /// Basic IOC detection service implementation
    /// </summary>
    public class IOCDetectionService : IIOCDetectionService
    {
        private readonly ILogger<IOCDetectionService> _logger;

        public IOCDetectionService(ILogger<IOCDetectionService> logger)
        {
            _logger = logger;
        }

        public async Task<List<string>> DetectIOCsAsync(string content)
        {
            await Task.CompletedTask;
            var iocs = new List<string>();

            // IP address detection
            var ipPattern = @"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b";
            var ipMatches = System.Text.RegularExpressions.Regex.Matches(content, ipPattern);
            foreach (System.Text.RegularExpressions.Match match in ipMatches)
            {
                iocs.Add(match.Value);
            }

            // Domain detection
            var domainPattern = @"\b[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}\b";
            var domainMatches = System.Text.RegularExpressions.Regex.Matches(content, domainPattern);
            foreach (System.Text.RegularExpressions.Match match in domainMatches)
            {
                iocs.Add(match.Value);
            }

            // Hash detection (MD5, SHA1, SHA256)
            var hashPattern = @"\b[a-fA-F0-9]{32,64}\b";
            var hashMatches = System.Text.RegularExpressions.Regex.Matches(content, hashPattern);
            foreach (System.Text.RegularExpressions.Match match in hashMatches)
            {
                iocs.Add(match.Value);
            }

            return iocs.Distinct().ToList();
        }

        public async Task<Dictionary<string, int>> CategorizeIOCsAsync(List<string> iocs)
        {
            await Task.CompletedTask;
            var categories = new Dictionary<string, int>
            {
                ["IP Address"] = 0,
                ["Domain"] = 0,
                ["Hash"] = 0,
                ["Email"] = 0,
                ["URL"] = 0,
                ["Other"] = 0
            };

            foreach (var ioc in iocs)
            {
                if (System.Net.IPAddress.TryParse(ioc, out _))
                    categories["IP Address"]++;
                else if (ioc.Contains("@"))
                    categories["Email"]++;
                else if (ioc.StartsWith("http"))
                    categories["URL"]++;
                else if (System.Text.RegularExpressions.Regex.IsMatch(ioc, @"^[a-fA-F0-9]{32,64}$"))
                    categories["Hash"]++;
                else if (ioc.Contains("."))
                    categories["Domain"]++;
                else
                    categories["Other"]++;
            }

            return categories;
        }
    }

    /// <summary>
    /// Basic timeline service implementation
    /// </summary>
    public class TimelineService : ITimelineService
    {
        private readonly ILogger<TimelineService> _logger;

        public TimelineService(ILogger<TimelineService> logger)
        {
            _logger = logger;
        }

        public async Task<List<TimelineEvent>> GenerateTimelineAsync(List<SecurityEvent> events)
        {
            await Task.CompletedTask;

            return events.OrderBy(e => e.Timestamp)
                        .Select(e => new TimelineEvent
                        {
                            Timestamp = e.Timestamp,
                            Event = e.Description,
                            Source = e.EventType,
                            Confidence = e.Priority switch
                            {
                                SecurityEventPriority.Critical or SecurityEventPriority.High => "High",
                                SecurityEventPriority.Medium => "Medium",
                                _ => "Low"
                            }
                        })
                        .ToList();
        }

        public async Task<Dictionary<string, object>> AnalyzeTimelineAsync(List<TimelineEvent> timeline)
        {
            await Task.CompletedTask;

            if (!timeline.Any())
            {
                return new Dictionary<string, object>();
            }

            var analysis = new Dictionary<string, object>
            {
                ["TotalEvents"] = timeline.Count,
                ["FirstActivity"] = timeline.First().Timestamp,
                ["LastActivity"] = timeline.Last().Timestamp,
                ["Duration"] = timeline.Last().Timestamp - timeline.First().Timestamp,
                ["EventsByHour"] = timeline.GroupBy(e => e.Timestamp.Hour)
                                         .ToDictionary(g => g.Key.ToString(), g => g.Count()),
                ["TopSources"] = timeline.GroupBy(e => e.Source)
                                        .OrderByDescending(g => g.Count())
                                        .Take(5)
                                        .ToDictionary(g => g.Key, g => g.Count()),
                ["ConfidenceDistribution"] = timeline.GroupBy(e => e.Confidence)
                                                 .ToDictionary(g => g.Key, g => g.Count())
            };

            return analysis;
        }
    }

    /// <summary>
    /// Basic forensic service implementation
    /// </summary>
    public class ForensicService : IForensicService
    {
        private readonly ILogger<ForensicService> _logger;

        public ForensicService(ILogger<ForensicService> logger)
        {
            _logger = logger;
        }

        public async Task<ForensicAnalysis> PerformForensicAnalysisAsync(TechnicalFindings findings)
        {
            await Task.CompletedTask;

            return new ForensicAnalysis
            {
                CaseId = Guid.NewGuid().ToString("N")[..8],
                AnalysisTimestamp = DateTime.UtcNow,
                EvidenceIntegrity = "Verified",
                ChainOfCustody = new List<string> { "SecuNik Analysis Engine" },
                // Select key findings based on either numerical priority or textual severity.
                // Events labeled as "High" or "Critical" severity are included
                // even when their Priority field remains lower.
                KeyFindings = findings.SecurityEvents
                                       .Where(e =>
                                           e.Priority >= SecurityEventPriority.High ||
                                           string.Equals(e.Severity, "High", StringComparison.OrdinalIgnoreCase) ||
                                           string.Equals(e.Severity, "Critical", StringComparison.OrdinalIgnoreCase))
                                       .Select(e => e.Message)
                                       .Take(10)
                                       .ToList(),
                ArtifactCount = findings.DetectedIOCs.Count + findings.SecurityEvents.Count,
                RecommendedActions = new List<string>
                {
                    "Preserve all digital evidence",
                    "Document analysis findings",
                    "Coordinate with incident response team",
                    "Implement containment measures"
                }
            };
        }

        public async Task<List<DigitalArtifact>> ExtractDigitalArtifactsAsync(TechnicalFindings findings)
        {
            await Task.CompletedTask;
            var artifacts = new List<DigitalArtifact>();

            // Extract artifacts from security events
            foreach (var evt in findings.SecurityEvents.Take(100))
            {
                artifacts.Add(new DigitalArtifact
                {
                    Type = "SecurityEvent",
                    Value = evt.Message,
                    Timestamp = evt.Timestamp,
                    Source = evt.Source,
                    Hash = ComputeHash(evt.Message),
                    Metadata = evt.Properties
                });
            }

            // Extract IOC artifacts
            foreach (var ioc in findings.DetectedIOCs.Take(100))
            {
                artifacts.Add(new DigitalArtifact
                {
                    Type = "IOC",
                    Value = ioc,
                    Timestamp = DateTime.UtcNow,
                    Source = "IOC Detection",
                    Hash = ComputeHash(ioc),
                    Metadata = new Dictionary<string, object> { ["category"] = CategorizeIOC(ioc) }
                });
            }

            return artifacts;
        }

        private string ComputeHash(string input)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(input);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToHexString(hash)[..16]; // Take first 16 characters
        }

        private string CategorizeIOC(string ioc)
        {
            if (System.Net.IPAddress.TryParse(ioc, out _)) return "IP Address";
            if (ioc.Contains("@")) return "Email";
            if (ioc.StartsWith("http")) return "URL";
            if (System.Text.RegularExpressions.Regex.IsMatch(ioc, @"^[a-fA-F0-9]{32,64}$")) return "Hash";
            if (ioc.Contains(".")) return "Domain";
            return "Other";
        }
    }

}