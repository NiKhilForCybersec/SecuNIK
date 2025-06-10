using System;
using System.Collections.Generic;

namespace SecuNik.Core.Models
{
    /// <summary>
    /// Complete analysis result containing technical findings, AI insights, and executive report
    /// </summary>
    public class AnalysisResult
    {
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public DateTime AnalysisTimestamp { get; set; }
        public TechnicalFindings Technical { get; set; } = new();
        public AIInsights AI { get; set; } = new();
        public ExecutiveReport Executive { get; set; } = new();
        public Timeline Timeline { get; set; } = new();
        public CorrelationInsights Correlation { get; set; } = new();
        
        // NEW: Advanced dashboard metrics
        public DashboardMetrics Dashboard { get; set; } = new();
        public SystemPerformance Performance { get; set; } = new();
        public ComplianceAssessment Compliance { get; set; } = new();
        public ThreatIntelligence ThreatIntel { get; set; } = new();
    }

    /// <summary>
    /// Raw technical findings from file parsing
    /// </summary>
    public class TechnicalFindings
    {
        public Dictionary<string, object> RawData { get; set; } = new();
        public List<string> DetectedIOCs { get; set; } = new();
        public List<SecurityEvent> SecurityEvents { get; set; } = new();
        public FileMetadata Metadata { get; set; } = new();
        public string FileFormat { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
        public int TotalLines { get; set; }
        public Dictionary<string, int> IOCsByCategory { get; set; } = new();
        public Dictionary<string, int> EventsByType { get; set; } = new();
        
        // NEW: Enhanced technical metrics
        public NetworkForensics NetworkAnalysis { get; set; } = new();
        public MalwareAnalysis MalwareFindings { get; set; } = new();
        public BehavioralAnalysis BehaviorFindings { get; set; } = new();
        public DataExfiltrationAnalysis ExfiltrationFindings { get; set; } = new();
    }

    /// <summary>
    /// AI-generated insights and analysis
    /// </summary>
    public class AIInsights
    {
        public string AttackVector { get; set; } = string.Empty;
        public string ThreatAssessment { get; set; } = string.Empty;
        public int SeverityScore { get; set; }
        public List<string> RecommendedActions { get; set; } = new();
        public string BusinessImpact { get; set; } = string.Empty;
        
        // NEW: Enhanced AI metrics
        public double ConfidenceScore { get; set; } = 0.0;
        public string ModelUsed { get; set; } = "SecurityAnalysisService";
        public DateTime AnalysisTimestamp { get; set; } = DateTime.UtcNow;
        public List<string> DetectedPatterns { get; set; } = new();
        public Dictionary<string, double> RiskFactors { get; set; } = new();
    }

    /// <summary>
    /// Executive-level summary and recommendations
    /// </summary>
    public class ExecutiveReport
    {
        public string Summary { get; set; } = string.Empty;
        public string KeyFindings { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = string.Empty;
        public string ImmediateActions { get; set; } = string.Empty;
        public string LongTermRecommendations { get; set; } = string.Empty;
        
        // NEW: Executive dashboard metrics
        public BusinessImpactAssessment BusinessImpact { get; set; } = new();
        public ComplianceStatus ComplianceStatus { get; set; } = new();
        public ResourceRequirements ResourceNeeds { get; set; } = new();
    }

    /// <summary>
    /// NEW: Dashboard-specific metrics for real-time monitoring
    /// </summary>
    public class DashboardMetrics
    {
        public int ActiveThreats { get; set; } = 0;
        public int EventsProcessed { get; set; } = 0;
        public int IOCsDetected { get; set; } = 0;
        public int RiskScore { get; set; } = 0;
        public int FilesAnalyzed { get; set; } = 0;
        public double AIConfidence { get; set; } = 0.0;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        // Feature-specific metrics
        public int ThreatIntelCount { get; set; } = 0;
        public int BehaviorAnomalies { get; set; } = 0;
        public int NetworkConnections { get; set; } = 0;
        public int MalwareDetected { get; set; } = 0;
        public int DataTransfers { get; set; } = 0;
        public double ComplianceScore { get; set; } = 100.0;
        
        // Performance metrics
        public int TotalEvents { get; set; } = 0;
        public double ProcessingSpeed { get; set; } = 0.0; // Events per second
        public double DetectionAccuracy { get; set; } = 98.5;
        public double ResponseTime { get; set; } = 150.0; // Milliseconds
        public int ThreatsBlocked { get; set; } = 0;
        public double SystemUptime { get; set; } = 99.9;
    }

    /// <summary>
    /// NEW: System performance metrics
    /// </summary>
    public class SystemPerformance
    {
        public double MemoryUsageGB { get; set; } = 0.0;
        public double CPUUsagePercent { get; set; } = 0.0;
        public double ProcessingTimeMs { get; set; } = 0.0;
        public int ConcurrentAnalyses { get; set; } = 0;
        public DateTime LastHealthCheck { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Online";
    }

    /// <summary>
    /// NEW: Compliance assessment results
    /// </summary>
    public class ComplianceAssessment
    {
        public double OverallScore { get; set; } = 100.0;
        public Dictionary<string, ComplianceFramework> Frameworks { get; set; } = new();
        public List<ComplianceViolation> Violations { get; set; } = new();
        public DateTime LastAssessment { get; set; } = DateTime.UtcNow;
    }

    public class ComplianceFramework
    {
        public string Name { get; set; } = string.Empty;
        public double Score { get; set; } = 100.0;
        public string Status { get; set; } = "Compliant";
        public List<string> Requirements { get; set; } = new();
        public List<string> Violations { get; set; } = new();
    }

    public class ComplianceViolation
    {
        public string Framework { get; set; } = string.Empty;
        public string Requirement { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "Medium";
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// NEW: Threat intelligence data
    /// </summary>
    public class ThreatIntelligence
    {
        public List<ThreatFeed> ActiveFeeds { get; set; } = new();
        public List<ThreatIndicator> Indicators { get; set; } = new();
        public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
        public int TotalIndicators { get; set; } = 0;
    }

    public class ThreatFeed
    {
        public string Name { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Active";
        public int IndicatorCount { get; set; } = 0;
    }

    public class ThreatIndicator
    {
        public string Type { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Severity { get; set; } = "Medium";
        public string Source { get; set; } = string.Empty;
        public DateTime FirstSeen { get; set; } = DateTime.UtcNow;
        public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// NEW: Network forensics analysis
    /// </summary>
    public class NetworkForensics
    {
        public int TotalConnections { get; set; } = 0;
        public int SuspiciousConnections { get; set; } = 0;
        public List<NetworkConnection> Connections { get; set; } = new();
        public List<string> SuspiciousIPs { get; set; } = new();
        public Dictionary<string, int> ProtocolDistribution { get; set; } = new();
    }

    public class NetworkConnection
    {
        public string SourceIP { get; set; } = string.Empty;
        public string DestinationIP { get; set; } = string.Empty;
        public int SourcePort { get; set; } = 0;
        public int DestinationPort { get; set; } = 0;
        public string Protocol { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Normal";
    }

    /// <summary>
    /// NEW: Malware analysis results
    /// </summary>
    public class MalwareAnalysis
    {
        public int TotalSamples { get; set; } = 0;
        public int MaliciousSamples { get; set; } = 0;
        public List<MalwareSample> Samples { get; set; } = new();
        public Dictionary<string, int> MalwareTypes { get; set; } = new();
        public DateTime LastScan { get; set; } = DateTime.UtcNow;
    }

    public class MalwareSample
    {
        public string Hash { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Family { get; set; } = string.Empty;
        public string Severity { get; set; } = "Medium";
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
        public List<string> Signatures { get; set; } = new();
    }

    /// <summary>
    /// NEW: Behavioral analysis results
    /// </summary>
    public class BehavioralAnalysis
    {
        public int TotalBehaviors { get; set; } = 0;
        public int AnomalousBehaviors { get; set; } = 0;
        public List<BehaviorPattern> Patterns { get; set; } = new();
        public double BaselineDeviation { get; set; } = 0.0;
        public DateTime AnalysisTime { get; set; } = DateTime.UtcNow;
    }

    public class BehaviorPattern
    {
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double AnomalyScore { get; set; } = 0.0;
        public DateTime FirstObserved { get; set; } = DateTime.UtcNow;
        public DateTime LastObserved { get; set; } = DateTime.UtcNow;
        public int Frequency { get; set; } = 0;
    }

    /// <summary>
    /// NEW: Data exfiltration analysis
    /// </summary>
    public class DataExfiltrationAnalysis
    {
        public int TotalTransfers { get; set; } = 0;
        public int SuspiciousTransfers { get; set; } = 0;
        public List<DataTransfer> Transfers { get; set; } = new();
        public long TotalBytesTransferred { get; set; } = 0;
        public DateTime LastAnalysis { get; set; } = DateTime.UtcNow;
    }

    public class DataTransfer
    {
        public string Source { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public long BytesTransferred { get; set; } = 0;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Protocol { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = "Low";
    }

    /// <summary>
    /// NEW: Business impact assessment
    /// </summary>
    public class BusinessImpactAssessment
    {
        public string OverallImpact { get; set; } = "Low";
        public double FinancialRisk { get; set; } = 0.0;
        public double OperationalRisk { get; set; } = 0.0;
        public double ReputationalRisk { get; set; } = 0.0;
        public List<string> AffectedSystems { get; set; } = new();
        public List<string> AffectedProcesses { get; set; } = new();
    }

    /// <summary>
    /// NEW: Compliance status
    /// </summary>
    public class ComplianceStatus
    {
        public string OverallStatus { get; set; } = "Compliant";
        public Dictionary<string, string> FrameworkStatus { get; set; } = new();
        public List<string> RequiredActions { get; set; } = new();
        public DateTime NextReview { get; set; } = DateTime.UtcNow.AddDays(30);
    }

    /// <summary>
    /// NEW: Resource requirements
    /// </summary>
    public class ResourceRequirements
    {
        public List<string> ImmediateResources { get; set; } = new();
        public List<string> LongTermResources { get; set; } = new();
        public double EstimatedCost { get; set; } = 0.0;
        public int EstimatedHours { get; set; } = 0;
        public List<string> SkillsRequired { get; set; } = new();
    }

    /// <summary>
    /// Chronological timeline of security events
    /// </summary>
    public class Timeline
    {
        public List<TimelineEvent> Events { get; set; } = new();
        public DateTime FirstActivity { get; set; }
        public DateTime LastActivity { get; set; }
    }

    /// <summary>
    /// Individual security event detected in logs
    /// </summary>
    public class SecurityEvent
    {
        public DateTime Timestamp { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public Dictionary<string, string> Attributes { get; set; } = new();
        
        // NEW: Enhanced event properties
        public string Category { get; set; } = string.Empty;
        public double RiskScore { get; set; } = 0.0;
        public bool IsCorrelated { get; set; } = false;
        public List<string> RelatedEvents { get; set; } = new();
    }

    /// <summary>
    /// Timeline event for chronological reconstruction
    /// </summary>
    public class TimelineEvent
    {
        public DateTime Timestamp { get; set; }
        public string Event { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Confidence { get; set; } = string.Empty;
    }

    /// <summary>
    /// File metadata and characteristics
    /// </summary>
    public class FileMetadata
    {
        public long Size { get; set; }
        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }
        public string Hash { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
    }
}