using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using SecuNik.Core.Exceptions;

namespace SecuNik.Core.Services
{
    /// <summary>
    /// Service that manages multiple parsers and routes files to appropriate parser
    /// </summary>
    public class UniversalParserService
    {
        private readonly List<IUniversalParser> _parsers;
        private readonly ILogger<UniversalParserService> _logger;

        public UniversalParserService(IEnumerable<IUniversalParser> parsers, ILogger<UniversalParserService> logger)
        {
            _parsers = parsers.OrderByDescending(p => p.Priority).ToList();
            _logger = logger;
        }

        public async Task<TechnicalFindings> ParseFileAsync(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"File not found: {filePath}");
            }

            _logger.LogInformation("Starting file parsing for: {FilePath}", filePath);

            foreach (var parser in _parsers)
            {
                try
                {
                    if (await parser.CanParseAsync(filePath))
                    {
                        _logger.LogInformation("Using parser {ParserType} for file {FilePath}",
                            parser.GetType().Name, filePath);

                        return await parser.ParseAsync(filePath);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Parser {ParserType} failed to parse {FilePath}",
                        parser.GetType().Name, filePath);
                    continue;
                }
            }

            var fileExtension = Path.GetExtension(filePath);
            throw new UnsupportedFileTypeException(filePath, fileExtension);
        }

        public async Task<string> DetectFileTypeAsync(string filePath)
        {
            foreach (var parser in _parsers)
            {
                if (await parser.CanParseAsync(filePath))
                {
                    return parser.SupportedFileType;
                }
            }

            return "Unknown";
        }

        public async Task<bool> CanProcessFileAsync(string filePath)
        {
            foreach (var parser in _parsers)
            {
                if (await parser.CanParseAsync(filePath))
                {
                    return true;
                }
            }
            return false;
        }

        public async Task<List<string>> GetSupportedFileTypesAsync()
        {
            return await Task.FromResult(_parsers.Select(p => p.SupportedFileType).Distinct().ToList());
        }
    }
}