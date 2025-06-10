// SecuNik - Functional Cybersecurity Dashboard
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
        const uploadZone = document.getElementById('uploadZone');
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
        this.showInitialUploadState();
    }

    showInitialUploadState() {
        const analysisStatus = document.getElementById('analysisStatus');
        const aiInsights = document.getElementById('aiInsights');
        const analysisResults = document.getElementById('analysisResults');
        const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');

        if (analysisStatus) analysisStatus.style.display = 'none';
        if (aiInsights) aiInsights.style.display = 'none';
        if (analysisResults) analysisResults.style.display = 'none';
        if (uploadAnotherBtn) uploadAnotherBtn.style.display = 'none';
    }

    showAnalysisResults() {
        const analysisStatus = document.getElementById('analysisStatus');
        const aiInsights = document.getElementById('aiInsights');
        const analysisResults = document.getElementById('analysisResults');
        const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
        const queueItems = document.querySelectorAll('.queue-item');

        if (analysisStatus) analysisStatus.style.display = 'flex';
        if (aiInsights) aiInsights.style.display = 'grid';
        if (analysisResults) analysisResults.style.display = 'grid';
        if (uploadAnotherBtn) uploadAnotherBtn.style.display = 'flex';
        
        // Show queue items
        queueItems.forEach(item => {
            item.style.display = 'flex';
        });
    }

    showUploadZone() {
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.background = 'rgba(0, 212, 170, 0.05)';
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--border-accent)';
        e.currentTarget.style.background = 'var(--bg-card)';
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--border-accent)';
        e.currentTarget.style.background = 'var(--bg-card)';
        
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
            this.updateDashboardWithResults();
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
        
        return result;
    }

    updateDashboardWithResults() {
        if (!this.currentAnalysis) return;

        // Update file ID
        const fileId = document.getElementById('fileId');
        if (fileId) {
            fileId.textContent = this.generateFileId();
        }

        // Update threats
        this.updateThreatsPanel();

        // Update executive summary
        this.updateExecutiveSummary();

        // Update AI insights with real data
        this.updateAIInsights();
    }

    updateThreatsPanel() {
        const threatsContent = document.getElementById('threatsContent');
        const threatsBadge = document.getElementById('threatsBadge');
        
        if (!threatsContent || !this.currentAnalysis) return;

        const threats = this.extractThreats();
        
        if (threatsBadge) {
            threatsBadge.textContent = threats.length > 0 ? 'DETECTED' : 'NONE';
            threatsBadge.className = threats.length > 0 ? 'panel-badge' : 'panel-badge specified';
        }

        if (threats.length === 0) {
            threatsContent.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No threats detected in current analysis</div>';
            return;
        }

        threatsContent.innerHTML = threats.slice(0, 5).map(threat => `
            <div class="threat-item">
                <div class="threat-icon">⚠️</div>
                <div class="threat-content">
                    <div class="threat-title">${threat.title}</div>
                    <div class="threat-description">${threat.description}</div>
                    <div class="threat-meta">
                        <span class="threat-timestamp">${threat.timestamp}</span>
                        <span class="threat-status status-suggested">DETECTED</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateExecutiveSummary() {
        const summaryText = document.getElementById('executiveSummaryText');
        if (!summaryText || !this.currentAnalysis) return;

        const ai = this.currentAnalysis.AI || {};
        const executive = this.currentAnalysis.Executive || {};
        
        summaryText.textContent = executive.Summary || ai.ThreatAssessment || 
            'Analysis completed. Security assessment shows normal activity patterns with no immediate threats detected.';
    }

    updateAIInsights() {
        const aiInsights = document.getElementById('aiInsights');
        if (!aiInsights || !this.currentAnalysis) return;

        const technical = this.currentAnalysis.Technical || {};
        const ai = this.currentAnalysis.AI || {};
        
        const insights = [
            {
                icon: '📊',
                title: 'Bulk Log Correlation',
                description: `Analyzed ${technical.SecurityEvents?.length || 0} security events to correlate breach intelligence and patterns`,
                type: 'info'
            },
            {
                icon: ai.SeverityScore > 7 ? '🚨' : ai.SeverityScore > 4 ? '⚠️' : '✅',
                title: ai.SeverityScore > 7 ? 'Critical Threats Detected' : ai.SeverityScore > 4 ? 'Moderate Risk Pattern' : 'Security Status Normal',
                description: ai.ThreatAssessment || 'AI analysis completed with threat assessment',
                type: ai.SeverityScore > 7 ? 'danger' : ai.SeverityScore > 4 ? 'warning' : 'success'
            },
            {
                icon: '📋',
                title: 'Executive Summary Available',
                description: 'An AI-generated organizational impact summary is ready for stakeholder review',
                type: 'success'
            }
        ];

        aiInsights.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
            </div>
        `).join('');
    }

    extractThreats() {
        if (!this.currentAnalysis?.Technical?.SecurityEvents) return [];

        return this.currentAnalysis.Technical.SecurityEvents
            .filter(event => event.Severity && ['High', 'Critical', 'Medium'].includes(event.Severity))
            .map(event => ({
                title: event.EventType || 'Security Event',
                description: this.truncateText(event.Description || 'Security event detected', 80),
                timestamp: this.formatTimestamp(event.Timestamp),
                severity: event.Severity || 'Medium'
            }));
    }

    generateFileId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
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

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' | ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    truncateText(text, maxLength) {
        if (!text) return 'No description available';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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