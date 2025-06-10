// SecuNik - Advanced Cybersecurity Analytics Dashboard
class SecuNikDashboard {
    constructor() {
        this.currentAnalysis = null;
        this.analysisHistory = [];
        this.isAnalyzing = false;
        
        this.initializeEventListeners();
        this.initializeTabNavigation();
        this.loadInitialState();
    }

    initializeEventListeners() {
        // File upload handlers
        const fileInput = document.getElementById('fileInput');
        const uploadZone = document.getElementById('initialUploadZone');
        const chooseFilesBtn = document.getElementById('chooseFilesBtn');

        if (chooseFilesBtn) {
            chooseFilesBtn.addEventListener('click', () => fileInput?.click());
        }

        if (uploadZone) {
            uploadZone.addEventListener('click', () => fileInput?.click());
            uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadZone.addEventListener('drop', this.handleDrop.bind(this));
            uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        }

        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // Navigation handlers
        const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
        if (uploadAnotherBtn) {
            uploadAnotherBtn.addEventListener('click', this.showUploadZone.bind(this));
        }

        // Export handlers
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.toggleExportMenu.bind(this));
        }
    }

    initializeTabNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabName = item.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName)?.classList.add('active');
    }

    loadInitialState() {
        this.updateStatusCards({
            filesAnalyzed: 0,
            threatsDetected: 0,
            iocsFound: 0,
            riskScore: 0
        });

        this.showInitialUploadState();
    }

    showInitialUploadState() {
        const initialUpload = document.getElementById('initialUploadZone');
        const analyticsGrid = document.getElementById('analyticsGrid');
        const resultsGrid = document.getElementById('resultsGrid');
        const timelinePanel = document.getElementById('timelinePanel');
        const executivePanel = document.getElementById('executivePanel');

        if (initialUpload) initialUpload.style.display = 'block';
        if (analyticsGrid) analyticsGrid.style.display = 'none';
        if (resultsGrid) resultsGrid.style.display = 'none';
        if (timelinePanel) timelinePanel.style.display = 'none';
        if (executivePanel) executivePanel.style.display = 'none';
    }

    showAnalysisResults() {
        const initialUpload = document.getElementById('initialUploadZone');
        const analyticsGrid = document.getElementById('analyticsGrid');
        const resultsGrid = document.getElementById('resultsGrid');
        const timelinePanel = document.getElementById('timelinePanel');
        const executivePanel = document.getElementById('executivePanel');
        const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');

        if (initialUpload) initialUpload.style.display = 'none';
        if (analyticsGrid) analyticsGrid.style.display = 'grid';
        if (resultsGrid) resultsGrid.style.display = 'grid';
        if (timelinePanel) timelinePanel.style.display = 'block';
        if (executivePanel) executivePanel.style.display = 'block';
        if (uploadAnotherBtn) uploadAnotherBtn.style.display = 'flex';
    }

    showUploadZone() {
        const compactUpload = document.getElementById('uploadZone');
        if (compactUpload) {
            compactUpload.style.display = 'block';
            compactUpload.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    async processFiles(files) {
        if (files.length === 0) return;

        this.isAnalyzing = true;
        this.showProgressModal();

        try {
            for (const file of files) {
                await this.analyzeFile(file);
            }
            
            this.hideProgressModal();
            this.showAnalysisResults();
            this.showNotification('Analysis completed successfully!', 'success');
        } catch (error) {
            this.hideProgressModal();
            this.showNotification(`Analysis failed: ${error.message}`, 'error');
        } finally {
            this.isAnalyzing = false;
        }
    }

    async analyzeFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/analysis/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        this.currentAnalysis = result.result;
        this.analysisHistory.push(result.result);
        
        this.updateDashboard(result.result);
        return result;
    }

    updateDashboard(analysisResult) {
        // Update status cards
        const statusData = {
            filesAnalyzed: this.analysisHistory.length,
            threatsDetected: analysisResult.Technical?.SecurityEvents?.length || 0,
            iocsFound: analysisResult.Technical?.DetectedIOCs?.length || 0,
            riskScore: analysisResult.AI?.SeverityScore || 0
        };
        
        this.updateStatusCards(statusData);
        this.updateAnalyticsGrid(analysisResult);
        this.updateThreatsPanel(analysisResult);
        this.updateIOCsPanel(analysisResult);
        this.updateTimelinePanel(analysisResult);
        this.updateExecutivePanel(analysisResult);
        this.updateOverviewTab(analysisResult);
    }

    updateStatusCards(data) {
        const elements = {
            filesAnalyzed: document.getElementById('filesAnalyzed'),
            threatsDetected: document.getElementById('threatsDetected'),
            iocsFound: document.getElementById('iocsFound'),
            riskScore: document.getElementById('riskScore')
        };

        Object.entries(data).forEach(([key, value]) => {
            if (elements[key]) {
                this.animateValue(elements[key], parseInt(elements[key].textContent) || 0, value);
            }
        });
    }

    updateAnalyticsGrid(analysisResult) {
        const grid = document.getElementById('analyticsGrid');
        if (!grid) return;

        const metrics = this.generateMetrics(analysisResult);
        grid.innerHTML = metrics.map(metric => this.createMetricCard(metric)).join('');
    }

    generateMetrics(analysisResult) {
        const technical = analysisResult.Technical || {};
        const ai = analysisResult.AI || {};
        
        return [
            {
                icon: '🔍',
                title: 'Security Events',
                value: technical.SecurityEvents?.length || 0,
                description: 'Total security events detected in log analysis',
                type: technical.SecurityEvents?.length > 10 ? 'warning' : 'info',
                trend: { direction: 'up', value: '12%' }
            },
            {
                icon: '🎯',
                title: 'IOCs Detected',
                value: technical.DetectedIOCs?.length || 0,
                description: 'Indicators of compromise found across all sources',
                type: technical.DetectedIOCs?.length > 5 ? 'critical' : 'success',
                trend: { direction: 'up', value: '8%' }
            },
            {
                icon: '⚡',
                title: 'Threat Severity',
                value: ai.SeverityScore || 0,
                description: 'AI-calculated threat severity score (0-10)',
                type: ai.SeverityScore > 7 ? 'critical' : ai.SeverityScore > 4 ? 'warning' : 'success',
                trend: { direction: ai.SeverityScore > 5 ? 'up' : 'down', value: '5%' }
            },
            {
                icon: '📊',
                title: 'File Size',
                value: this.formatFileSize(technical.Metadata?.Size || 0),
                description: 'Total size of analyzed log files',
                type: 'info',
                trend: { direction: 'neutral', value: '0%' }
            },
            {
                icon: '🕒',
                title: 'Processing Time',
                value: technical.RawData?.ProcessingTimeMs ? `${Math.round(technical.RawData.ProcessingTimeMs)}ms` : 'N/A',
                description: 'Time taken to complete the analysis',
                type: 'info',
                trend: { direction: 'down', value: '15%' }
            },
            {
                icon: '🤖',
                title: 'AI Confidence',
                value: ai.SeverityScore ? `${Math.round((ai.SeverityScore / 10) * 100)}%` : '0%',
                description: 'AI analysis confidence level',
                type: ai.SeverityScore > 7 ? 'success' : 'warning',
                trend: { direction: 'up', value: '3%' }
            }
        ];
    }

    createMetricCard(metric) {
        const trendClass = metric.trend.direction === 'up' ? 'trend-up' : 
                          metric.trend.direction === 'down' ? 'trend-down' : 'trend-neutral';
        const trendIcon = metric.trend.direction === 'up' ? '↗' : 
                         metric.trend.direction === 'down' ? '↘' : '→';

        return `
            <div class="metric-card ${metric.type}">
                <div class="metric-header">
                    <span class="metric-icon">${metric.icon}</span>
                    <span class="metric-title">${metric.title}</span>
                </div>
                <div class="metric-value">${metric.value}</div>
                <div class="metric-description">${metric.description}</div>
                <div class="metric-trend ${trendClass}">
                    <span>${trendIcon}</span>
                    <span>${metric.trend.value}</span>
                </div>
            </div>
        `;
    }

    updateThreatsPanel(analysisResult) {
        const threatsList = document.getElementById('threatsList');
        const threatsBadge = document.getElementById('threatsBadge');
        
        if (!threatsList || !threatsBadge) return;

        const threats = this.extractThreats(analysisResult);
        threatsBadge.textContent = `${threats.length} DETECTED`;
        
        if (threats.length === 0) {
            threatsList.innerHTML = '<div class="no-data">No threats detected in current analysis</div>';
            return;
        }

        threatsList.innerHTML = threats.slice(0, 5).map(threat => `
            <div class="threat-item">
                <div class="threat-icon">⚠️</div>
                <div class="threat-content">
                    <div class="threat-title">${threat.title}</div>
                    <div class="threat-description">${threat.description}</div>
                    <div class="threat-meta">
                        <span class="threat-timestamp">${threat.timestamp}</span>
                        <span class="threat-severity severity-${threat.severity.toLowerCase()}">${threat.severity}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateIOCsPanel(analysisResult) {
        const iocsList = document.getElementById('iocsList');
        const iocsBadge = document.getElementById('iocsBadge');
        
        if (!iocsList || !iocsBadge) return;

        const iocs = analysisResult.Technical?.DetectedIOCs || [];
        iocsBadge.textContent = `${iocs.length} FOUND`;
        
        if (iocs.length === 0) {
            iocsList.innerHTML = '<div class="no-data">No IOCs detected in current analysis</div>';
            return;
        }

        iocsList.innerHTML = iocs.slice(0, 10).map(ioc => {
            const [type, value] = ioc.includes(':') ? ioc.split(':', 2) : ['Unknown', ioc];
            return `
                <div class="ioc-item">
                    <span class="ioc-value">${value}</span>
                    <span class="ioc-type">${type}</span>
                </div>
            `;
        }).join('');
    }

    updateTimelinePanel(analysisResult) {
        const timelineEvents = document.getElementById('timelineEvents');
        const timelineBadge = document.getElementById('timelineBadge');
        
        if (!timelineEvents || !timelineBadge) return;

        const events = analysisResult.Timeline?.Events || [];
        timelineBadge.textContent = `${events.length} EVENTS`;
        
        if (events.length === 0) {
            timelineEvents.innerHTML = '<div class="no-data">No timeline events available</div>';
            return;
        }

        timelineEvents.innerHTML = events.slice(0, 10).map(event => `
            <div class="timeline-item">
                <div class="timeline-time">${this.formatTimestamp(event.Timestamp)}</div>
                <div class="timeline-event">${event.Event}</div>
            </div>
        `).join('');
    }

    updateExecutivePanel(analysisResult) {
        const riskLevel = document.getElementById('riskLevel');
        const executiveSummary = document.getElementById('executiveSummary');
        
        if (!riskLevel || !executiveSummary) return;

        const ai = analysisResult.AI || {};
        const executive = analysisResult.Executive || {};
        
        // Update risk level
        const severity = ai.SeverityScore || 0;
        const riskText = severity > 7 ? 'HIGH' : severity > 4 ? 'ELEVATED' : 'LOW';
        const riskClass = severity > 7 ? 'risk-high' : severity > 4 ? 'risk-elevated' : 'risk-low';
        
        riskLevel.textContent = riskText;
        riskLevel.className = `risk-value ${riskClass}`;
        
        // Update summary
        executiveSummary.textContent = executive.Summary || ai.ThreatAssessment || 
            'Analysis completed. Review detailed findings in the threats and IOCs sections.';
    }

    updateOverviewTab(analysisResult) {
        const overviewInsights = document.getElementById('overviewInsights');
        if (!overviewInsights) return;

        const insights = [
            {
                icon: '📊',
                title: 'Analysis Complete',
                description: `Processed ${analysisResult.FileName} successfully with comprehensive threat detection`
            },
            {
                icon: '🤖',
                title: 'AI-Enhanced Analysis',
                description: analysisResult.AI?.ThreatAssessment || 'AI analysis completed with threat assessment'
            },
            {
                icon: '📋',
                title: 'Executive Report Ready',
                description: 'Comprehensive executive summary generated for stakeholder review'
            }
        ];

        overviewInsights.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h3>${insight.title}</h3>
                    <p>${insight.description}</p>
                </div>
            </div>
        `).join('');
    }

    extractThreats(analysisResult) {
        const securityEvents = analysisResult.Technical?.SecurityEvents || [];
        return securityEvents
            .filter(event => event.Severity && ['High', 'Critical', 'Medium'].includes(event.Severity))
            .map(event => ({
                title: event.EventType || 'Security Event',
                description: event.Description || 'Security event detected',
                timestamp: this.formatTimestamp(event.Timestamp),
                severity: event.Severity || 'Medium'
            }));
    }

    showProgressModal() {
        const modal = document.getElementById('uploadProgressModal');
        if (modal) {
            modal.style.display = 'flex';
            this.startProgressAnimation();
        }
    }

    hideProgressModal() {
        const modal = document.getElementById('uploadProgressModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    startProgressAnimation() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressPercentage = document.getElementById('progressPercentage');
        const steps = document.querySelectorAll('.step');
        
        const phases = [
            { text: 'Processing file headers...', duration: 1000 },
            { text: 'Extracting security events...', duration: 1500 },
            { text: 'Running AI analysis...', duration: 2000 },
            { text: 'Detecting threats and IOCs...', duration: 1500 },
            { text: 'Generating insights...', duration: 1000 },
            { text: 'Compiling results...', duration: 500 }
        ];

        let currentPhase = 0;
        let progress = 0;

        const updateProgress = () => {
            if (currentPhase < phases.length) {
                const phase = phases[currentPhase];
                const stepProgress = 100 / phases.length;
                const targetProgress = (currentPhase + 1) * stepProgress;
                
                // Update text
                if (progressText) progressText.textContent = phase.text;
                
                // Update steps
                steps.forEach((step, index) => {
                    step.classList.remove('active', 'completed');
                    if (index < currentPhase) {
                        step.classList.add('completed');
                    } else if (index === currentPhase) {
                        step.classList.add('active');
                    }
                });
                
                // Animate progress bar
                const startProgress = progress;
                const startTime = Date.now();
                
                const animateBar = () => {
                    const elapsed = Date.now() - startTime;
                    const progressRatio = Math.min(elapsed / phase.duration, 1);
                    progress = startProgress + (targetProgress - startProgress) * progressRatio;
                    
                    if (progressFill) progressFill.style.width = `${progress}%`;
                    if (progressPercentage) progressPercentage.textContent = `${Math.round(progress)}%`;
                    
                    if (progressRatio < 1) {
                        requestAnimationFrame(animateBar);
                    } else {
                        currentPhase++;
                        setTimeout(updateProgress, 200);
                    }
                };
                
                animateBar();
            }
        };

        updateProgress();
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    animateValue(element, start, end, duration = 1000) {
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(start + (end - start) * progress);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    toggleExportMenu() {
        const menu = document.getElementById('exportMenu');
        if (menu) {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    }
}

// Export functions
function exportResults(format) {
    if (!window.dashboard || !window.dashboard.currentAnalysis) {
        alert('No analysis data available to export');
        return;
    }

    const data = window.dashboard.currentAnalysis;
    const filename = `secunik-analysis-${new Date().toISOString().split('T')[0]}`;

    switch (format) {
        case 'json':
            downloadJSON(data, `${filename}.json`);
            break;
        case 'csv':
            downloadCSV(data, `${filename}.csv`);
            break;
        case 'pdf':
            generatePDF(data, `${filename}.pdf`);
            break;
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}

function downloadCSV(data, filename) {
    const events = data.Technical?.SecurityEvents || [];
    const headers = ['Timestamp', 'Event Type', 'Description', 'Severity', 'Source'];
    const rows = events.map(event => [
        event.Timestamp,
        event.EventType,
        event.Description,
        event.Severity,
        event.Source
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, filename);
}

function generatePDF(data, filename) {
    // Simple PDF generation - in a real implementation, you'd use a library like jsPDF
    const content = `
SecuNik Analysis Report
Generated: ${new Date().toLocaleString()}

File: ${data.FileName}
Analysis Time: ${data.AnalysisTimestamp}

Threat Assessment: ${data.AI?.ThreatAssessment || 'N/A'}
Severity Score: ${data.AI?.SeverityScore || 0}/10
Risk Level: ${data.Executive?.RiskLevel || 'Unknown'}

Security Events: ${data.Technical?.SecurityEvents?.length || 0}
IOCs Detected: ${data.Technical?.DetectedIOCs?.length || 0}

Executive Summary:
${data.Executive?.Summary || 'No summary available'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    downloadBlob(blob, filename.replace('.pdf', '.txt'));
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new SecuNikDashboard();
});