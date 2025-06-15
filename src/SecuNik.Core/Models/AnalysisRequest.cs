using System;
using System.Collections.Generic;

namespace SecuNik.Core.Models
{
    /// <summary>
    /// Request object for file analysis
    /// </summary>
    public class AnalysisRequest
    {
        public string FilePath { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public AnalysisOptions Options { get; set; } = new();
        public DateTime RequestTimestamp { get; set; } = DateTime.UtcNow;
        public string RequestId { get; set; } = Guid.NewGuid().ToString("N");
    }

}

