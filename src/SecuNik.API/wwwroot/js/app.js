// SecuNik - Advanced Professional Cybersecurity Dashboard with Full Backend Integration
class SecuNikAdvancedDashboard {
    constructor() {
        this.currentAnalysis = null;
        this.analysisHistory = [];
        this.isAnalyzing = false;
        this.currentSessionId = null;
        this.activeTab = 'dashboard';
        this.searchTerm = '';
        this.filters = {
            severity: 'all',
            eventType: 'all',
            timeRange: 'all'
        };

        // Real-time update intervals
        this.metricsUpdateInterval = null;
        this.threatIntelUpdateInterval = null;

        this.initializeEventListeners();
        this.initializeTabNavigation();
        this.loadInitialState();
        this.startRealtimeUpdates();
        this.initializeBackendIntegration();
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

        // Close modals on click outside
        document.addEventListener('click', this.handleDocumentClick.bind(this));
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
        this.activeTab = tabName;

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

        // Load tab-specific content if analysis exists
        if (this.currentAnalysis) {
            this.loadTabContent(tabName);
        }
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'overview':
                this.populateOverviewTab();
                break;
            case 'threats':
                this.populateThreatsTab();
                break;
            case 'iocs':
                this.populateIOCsTab();
                break;
            case 'timeline':
                this.populateTimelineTab();
                break;
            case 'executive':
                this.populateExecutiveTab();
                break;
            case 'cases':
                this.populateCasesTab();
                break;
            case 'dashboard':
                this.updateDashboardWithResults();
                break;
        }
    }

    loadInitialState() {
        this.showInitialUploadState();
        this.initializeAdvancedFeatures();
        this.loadDashboardMetrics();
    }

    showInitialUploadState() {
        const elements = [
            'analysisStatus', 'realtimeGrid', 'featureGrid',
            'metricsGrid', 'chartsContainer', 'analysisResults'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });

        const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
        if (uploadAnotherBtn) uploadAnotherBtn.style.display = 'none';
    }

    showAdvancedDashboard() {
        const elements = [
            'analysisStatus', 'realtimeGrid', 'featureGrid',
            'metricsGrid', 'chartsContainer', 'analysisResults'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = id === 'analysisResults' ? 'grid' :
                id === 'realtimeGrid' || id === 'featureGrid' || id === 'metricsGrid' ? 'grid' :
                    id === 'chartsContainer' ? 'grid' : 'flex';
        });

        const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
        if (uploadAnotherBtn) uploadAnotherBtn.style.display = 'flex';

        // Show queue items
        document.querySelectorAll('.queue-item').forEach(item => {
            item.style.display = 'flex';
        });
    }

    initializeAdvancedFeatures() {
        // Initialize feature cards with default values
        this.updateFeatureCard('threatIntelCount', 0, 'threatIntelBadge', 'SCANNING');
        this.updateFeatureCard('behaviorAnomalies', 0, 'behaviorBadge', 'LEARNING');
        this.updateFeatureCard('networkConnections', 0, 'networkBadge', 'MONITORING');
        this.updateFeatureCard('malwareDetected', 0, 'malwareBadge', 'SCANNING');
        this.updateFeatureCard('dataTransfers', 0, 'dlpBadge', 'PROTECTED');
        this.updateFeatureCard('complianceScore', 100, 'complianceBadge', 'COMPLIANT');

        // Initialize metrics
        this.updateMetric('totalEvents', 0, 'eventsChange', 0);
        this.updateMetric('processingSpeed', 0, 'speedChange', 0);
        this.updateMetric('accuracy', 98.5, 'accuracyChange', 2.1);
        this.updateMetric('responseTime', 150, 'responseChange', -5.2);
        this.updateMetric('blockedThreats', 0, 'blockedChange', 0);
        this.updateMetric('uptime', 99.9, 'uptimeChange', 0.1);
    }

    initializeBackendIntegration() {
        this.loadDashboardMetrics();
        this.loadThreatIntelligence();

        // Set up periodic updates every 30 seconds
        this.metricsUpdateInterval = setInterval(() => {
            this.loadDashboardMetrics();
        }, 30000);

        this.threatIntelUpdateInterval = setInterval(() => {
            this.loadThreatIntelligence();
        }, 60000);
    }

    async loadDashboardMetrics() {
        try {
            const response = await fetch('/api/analysis/dashboard-metrics');
            if (response.ok) {
                const data = await response.json();
                this.updateDashboardWithBackendData(data);
            }
        } catch (error) {
            console.warn('Failed to load dashboard metrics:', error);
        }
    }

    async loadThreatIntelligence() {
        try {
            const response = await fetch('/api/analysis/threat-intel');
            if (response.ok) {
                const data = await response.json();
                this.updateThreatIntelligenceDisplay(data);
            }
        } catch (error) {
            console.warn('Failed to load threat intelligence:', error);
        }
    }

    updateDashboardWithBackendData(data) {
        if (data.realtimeMetrics) {
            const metrics = data.realtimeMetrics;

            this.updateRealtimeCard('activeThreats', metrics.activeThreats || 0);
            this.updateRealtimeCard('eventsProcessed', metrics.eventsProcessed || 0);
            this.updateRealtimeCard('iocsDetected', metrics.iocsDetected || 0);
            this.updateRealtimeCard('riskScore', metrics.riskScore || 0);
            this.updateRealtimeCard('filesAnalyzed', metrics.filesAnalyzed || 0);
            this.updateRealtimeCard('aiConfidence', Math.round(metrics.aiConfidence || 95) + '%');
        }

        if (data.systemPerformance) {
            this.updateSystemPerformance(data.systemPerformance);
        }
    }

    updateThreatIntelligenceDisplay(data) {
        console.log('Updated threat intelligence:', data.totalIndicators, 'indicators');
    }

    startRealtimeUpdates() {
        setInterval(() => {
            if (this.currentAnalysis) {
                this.updateRealtimeMetrics();
            }
        }, 5000);
    }

    updateRealtimeMetrics() {
        if (!this.currentAnalysis) return;

        const technical = this.currentAnalysis.Technical || {};
        const ai = this.currentAnalysis.AI || {};
        const dashboard = this.currentAnalysis.Dashboard || {};

        const threats = this.extractThreats();
        const activeThreats = dashboard.activeThreats || threats.length;
        const eventsProcessed = dashboard.eventsProcessed || technical.SecurityEvents?.length || 0;
        const iocsDetected = dashboard.iocsDetected || technical.DetectedIOCs?.length || 0;
        const riskScore = dashboard.riskScore || ai.SeverityScore || 0;
        const filesAnalyzed = dashboard.filesAnalyzed || 1;
        const aiConfidence = dashboard.aiConfidence || ai.ConfidenceScore || 95;

        this.updateRealtimeCard('activeThreats', activeThreats);
        this.updateRealtimeCard('eventsProcessed', eventsProcessed.toLocaleString());
        this.updateRealtimeCard('iocsDetected', iocsDetected);
        this.updateRealtimeCard('riskScore', riskScore);
        this.updateRealtimeCard('filesAnalyzed', filesAnalyzed);
        this.updateRealtimeCard('aiConfidence', Math.round(aiConfidence) + '%');
    }

    updateRealtimeCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = typeof value === 'number' ? value.toLocaleString() : value;
        }
    }

    updateSystemPerformance(performance) {
        const memoryElements = document.querySelectorAll('[data-metric="memory"]');
        const cpuElements = document.querySelectorAll('[data-metric="cpu"]');

        memoryElements.forEach(el => {
            if (el) el.textContent = `${performance.memoryUsageGB?.toFixed(1) || '2.1'}GB`;
        });

        cpuElements.forEach(el => {
            if (el) el.textContent = `${Math.round(performance.cpuUsagePercent || 15)}%`;
        });
    }

    // FILE UPLOAD HANDLERS
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

        console.log('🔍 DEBUG: Starting file processing...', files);
        this.isAnalyzing = true;
        this.showProgressModal();

        try {
            if (files.length === 1) {
                console.log('🔍 DEBUG: Analyzing single file...');
                await this.analyzeFile(files[0]);
            } else {
                console.log('🔍 DEBUG: Analyzing multiple files...');
                await this.analyzeMultipleFiles(files);
            }

            console.log('🔍 DEBUG: Analysis completed. Result:', this.currentAnalysis);

            this.hideProgressModal();
            this.showAdvancedDashboard();
            this.updateDashboardWithResults();
            this.loadTabContent(this.activeTab);
            this.showNotification(`Analysis completed successfully! Found ${this.currentAnalysis?.Technical?.SecurityEvents?.length || 0} security events.`, 'success');
        } catch (error) {
            console.error('🔍 DEBUG: Analysis error:', error);
            this.hideProgressModal();
            this.showNotification(`Analysis failed: ${error.message}`, 'error');
        } finally {
            this.isAnalyzing = false;
        }
    }

    async analyzeFile(file) {
        console.log('🔍 DEBUG: Sending file to backend...', file.name);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('enableAIAnalysis', 'true');
        formData.append('generateExecutiveReport', 'true');
        formData.append('includeTimeline', 'true');

        const response = await fetch('/api/analysis/upload', {
            method: 'POST',
            body: formData
        });

        console.log('🔍 DEBUG: Backend response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('🔍 DEBUG: Backend error:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('🔍 DEBUG: Backend result:', result);

        // FIXED: Use capital R to match C# property name
        this.currentAnalysis = result.Result;
        this.analysisHistory.push(result.Result);

        return result;
    }

    async analyzeMultipleFiles(files) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('enableAIAnalysis', 'true');
        formData.append('generateExecutiveReport', 'true');
        formData.append('includeTimeline', 'true');

        const response = await fetch('/api/analysis/upload-multiple', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        // FIXED: Use capital R to match C# property name
        this.currentAnalysis = result.Result;
        this.analysisHistory.push(result.Result);

        return result;
    }

    // TAB POPULATION METHODS
    populateOverviewTab() {
        if (!this.currentAnalysis) return;

        const technical = this.currentAnalysis.Technical || {};
        const ai = this.currentAnalysis.AI || {};
        const dashboard = this.currentAnalysis.Dashboard || {};
        const performance = this.currentAnalysis.Performance || {};

        // Update file ID and basic info
        this.updateElement('overviewFileId', this.generateFileId());
        this.updateElement('fileNameDetail', this.currentAnalysis.FileName || 'Unknown');
        this.updateElement('fileTypeDetail', this.currentAnalysis.FileType || 'Unknown');
        this.updateElement('fileSizeDetail', this.formatFileSize(technical.Metadata?.Size || 0));
        this.updateElement('processingTimeDetail', `${Math.round(performance.ProcessingTimeMs || 0)}ms`);
        this.updateElement('analysisEngineDetail', 'SecuNik Professional v2.0');
        this.updateElement('aiModelDetail', ai.ModelUsed || 'SecurityAnalysisService');

        // Update summary cards
        this.updateElement('summaryEvents', technical.SecurityEvents?.length || 0);
        this.updateElement('summaryIOCs', technical.DetectedIOCs?.length || 0);
        this.updateElement('summaryThreats', this.extractThreats().length);
        this.updateElement('summaryRiskScore', `${ai.SeverityScore || 0}/10`);

        // Update AI insights
        this.updateElement('attackVectorContent', ai.AttackVector || 'No specific attack vector identified.');
        this.updateElement('threatAssessmentContent', ai.ThreatAssessment || 'Threat assessment completed.');
        this.updateElement('businessImpactContent', ai.BusinessImpact || 'Business impact assessment completed.');

        // Update recommended actions
        const actionsList = document.getElementById('recommendedActionsList');
        if (actionsList && ai.RecommendedActions?.length) {
            actionsList.innerHTML = ai.RecommendedActions
                .map(action => `<li>${action}</li>`)
                .join('');
        }
    }

    populateThreatsTab() {
        const container = document.getElementById('detailedThreatsList');
        if (!container || !this.currentAnalysis) return;

        const threats = this.extractThreats();

        if (threats.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">🛡️</div>
                    <h3>No Threats Detected</h3>
                    <p>The analysis did not identify any high-priority security threats in the processed files.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="threats-summary">
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-number">${threats.length}</span>
                        <span class="stat-label">Total Threats</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${threats.filter(t => t.severity === 'Critical').length}</span>
                        <span class="stat-label">Critical</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${threats.filter(t => t.severity === 'High').length}</span>
                        <span class="stat-label">High</span>
                    </div>
                </div>
            </div>
            <div class="threats-list">
                ${threats.map(threat => this.createThreatCard(threat)).join('')}
            </div>
        `;
    }

    populateIOCsTab() {
        const container = document.getElementById('detailedIocsList');
        if (!container || !this.currentAnalysis) return;

        const iocs = this.currentAnalysis.Technical?.DetectedIOCs || [];
        const iocsByCategory = this.categorizeIOCs(iocs);

        if (iocs.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">🎯</div>
                    <h3>No IOCs Detected</h3>
                    <p>No indicators of compromise were found in the analyzed files.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="iocs-summary">
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-number">${iocs.length}</span>
                        <span class="stat-label">Total IOCs</span>
                    </div>
                    ${Object.entries(iocsByCategory).map(([category, items]) => `
                        <div class="stat-item">
                            <span class="stat-number">${items.length}</span>
                            <span class="stat-label">${category}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="iocs-categories">
                ${Object.entries(iocsByCategory).map(([category, items]) =>
            this.createIOCCategory(category, items)
        ).join('')}
            </div>
        `;
    }

    populateTimelineTab() {
        const container = document.getElementById('detailedTimeline');
        if (!container || !this.currentAnalysis) return;

        const timeline = this.currentAnalysis.Timeline || {};
        const events = timeline.Events || [];

        if (events.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">⏰</div>
                    <h3>No Timeline Data</h3>
                    <p>No timeline events could be reconstructed from the analyzed files.</p>
                </div>
            `;
            return;
        }

        const sortedEvents = events.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

        container.innerHTML = `
            <div class="timeline-summary">
                <div class="timeline-stats">
                    <div class="stat-item">
                        <span class="stat-label">First Activity</span>
                        <span class="stat-value">${this.formatDateTime(timeline.FirstActivity)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Last Activity</span>
                        <span class="stat-value">${this.formatDateTime(timeline.LastActivity)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Events</span>
                        <span class="stat-value">${events.length}</span>
                    </div>
                </div>
            </div>
            <div class="timeline-container">
                ${sortedEvents.map(event => this.createTimelineEvent(event)).join('')}
            </div>
        `;
    }

    populateExecutiveTab() {
        const container = document.getElementById('detailedExecutiveReport');
        if (!container || !this.currentAnalysis) return;

        const executive = this.currentAnalysis.Executive || {};
        const ai = this.currentAnalysis.AI || {};

        container.innerHTML = `
            <div class="executive-header">
                <div class="risk-assessment">
                    <div class="risk-level ${executive.RiskLevel?.toLowerCase() || 'medium'}">${executive.RiskLevel || 'MEDIUM'}</div>
                    <div class="risk-score">${ai.SeverityScore || 0}/10</div>
                </div>
            </div>
            
            <div class="executive-section">
                <h3>📋 Executive Summary</h3>
                <div class="executive-content">
                    ${executive.Summary || 'Executive summary not available.'}
                </div>
            </div>
            
            <div class="executive-section">
                <h3>🔍 Key Findings</h3>
                <div class="executive-content">
                    <pre>${executive.KeyFindings || 'No key findings available.'}</pre>
                </div>
            </div>
            
            <div class="executive-section">
                <h3>⚡ Immediate Actions</h3>
                <div class="executive-content">
                    ${executive.ImmediateActions || 'No immediate actions required.'}
                </div>
            </div>
            
            <div class="executive-section">
                <h3>📈 Long-term Recommendations</h3>
                <div class="executive-content">
                    ${executive.LongTermRecommendations || 'No long-term recommendations available.'}
                </div>
            </div>
            
            <div class="executive-section">
                <h3>💼 Business Impact</h3>
                <div class="executive-content">
                    ${ai.BusinessImpact || 'Business impact assessment not available.'}
                </div>
            </div>
        `;
    }

    populateCasesTab() {
        const container = document.getElementById('casesList');
        if (!container) return;

        const cases = this.analysisHistory;

        if (cases.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">📁</div>
                    <h3>No Cases Available</h3>
                    <p>No analysis cases have been created yet. Upload files to start building your case history.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="cases-header">
                <h3>Analysis Case History</h3>
                <div class="cases-stats">
                    <span class="stat-item">${cases.length} Cases</span>
                    <span class="stat-item">${cases.reduce((sum, c) => sum + (c.Technical?.SecurityEvents?.length || 0), 0)} Total Events</span>
                </div>
            </div>
            <div class="cases-list">
                ${cases.map((caseItem, index) => this.createCaseCard(caseItem, index)).join('')}
            </div>
        `;
    }

    // HELPER METHODS FOR CREATING UI COMPONENTS
    createThreatCard(threat) {
        const severityClass = threat.severity?.toLowerCase() || 'medium';
        return `
            <div class="threat-card ${severityClass}">
                <div class="threat-header">
                    <div class="threat-severity">${threat.severity || 'Medium'}</div>
                    <div class="threat-timestamp">${threat.timestamp}</div>
                </div>
                <div class="threat-title">${threat.title}</div>
                <div class="threat-description">${threat.description}</div>
                <div class="threat-actions">
                    <button class="btn-sm">Investigate</button>
                    <button class="btn-sm">Mark Resolved</button>
                </div>
            </div>
        `;
    }

    createIOCCategory(category, items) {
        return `
            <div class="ioc-category">
                <div class="category-header">
                    <h4>${category} (${items.length})</h4>
                </div>
                <div class="ioc-items">
                    ${items.map(ioc => `
                        <div class="ioc-item">
                            <code>${ioc}</code>
                            <div class="ioc-actions">
                                <button class="btn-xs">Block</button>
                                <button class="btn-xs">Investigate</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createTimelineEvent(event) {
        return `
            <div class="timeline-event">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-time">${this.formatDateTime(event.Timestamp)}</div>
                    <div class="timeline-event-text">${event.Event}</div>
                    <div class="timeline-source">Source: ${event.Source}</div>
                </div>
            </div>
        `;
    }

    createCaseCard(caseItem, index) {
        const ai = caseItem.AI || {};
        return `
            <div class="case-card" onclick="window.dashboard.loadCase(${index})">
                <div class="case-header">
                    <div class="case-id">Case #${String(index + 1).padStart(3, '0')}</div>
                    <div class="case-risk ${ai.SeverityScore > 7 ? 'high' : ai.SeverityScore > 4 ? 'medium' : 'low'}">
                        ${ai.SeverityScore || 0}/10
                    </div>
                </div>
                <div class="case-file">${caseItem.FileName}</div>
                <div class="case-summary">${caseItem.Technical?.SecurityEvents?.length || 0} events, ${caseItem.Technical?.DetectedIOCs?.length || 0} IOCs</div>
                <div class="case-timestamp">${this.formatDateTime(caseItem.AnalysisTimestamp)}</div>
            </div>
        `;
    }

    // DASHBOARD UPDATE METHODS
    updateDashboardWithResults() {
        if (!this.currentAnalysis) return;

        // Update file ID
        const fileId = document.getElementById('fileId');
        if (fileId) {
            fileId.textContent = this.generateFileId();
        }

        // Update threats panel
        this.updateThreatsPanel();

        // Update executive summary
        this.updateExecutiveSummary();

        // Update real-time metrics
        this.updateRealtimeMetrics();

        // Update advanced features
        this.updateAdvancedFeatures();

        // Update metrics
        this.updateMetricsWithData();
    }

    updateAdvancedFeatures() {
        if (!this.currentAnalysis) return;

        const technical = this.currentAnalysis.Technical || {};
        const dashboard = this.currentAnalysis.Dashboard || {};
        const securityEvents = technical.SecurityEvents || [];

        const threats = this.extractThreats();
        const threatCount = dashboard.threatIntelCount || threats.length;
        const behaviorAnomalies = dashboard.behaviorAnomalies || this.countBehaviorAnomalies(securityEvents);
        const networkConnections = dashboard.networkConnections || this.countNetworkEvents(securityEvents);
        const malwareDetected = dashboard.malwareDetected || this.countMalwareEvents(securityEvents);
        const dataTransfers = dashboard.dataTransfers || this.countDataTransfers(securityEvents);
        const complianceScore = dashboard.complianceScore || this.calculateComplianceScore();

        this.updateFeatureCard('threatIntelCount', threatCount, 'threatIntelBadge',
            threatCount > 0 ? 'THREATS FOUND' : 'CLEAR');
        this.updateFeatureCard('behaviorAnomalies', behaviorAnomalies, 'behaviorBadge',
            behaviorAnomalies > 0 ? 'ANOMALIES DETECTED' : 'NORMAL');
        this.updateFeatureCard('networkConnections', networkConnections, 'networkBadge', 'ANALYZED');
        this.updateFeatureCard('malwareDetected', malwareDetected, 'malwareBadge',
            malwareDetected > 0 ? 'MALWARE FOUND' : 'CLEAN');
        this.updateFeatureCard('dataTransfers', dataTransfers, 'dlpBadge',
            dataTransfers > 0 ? 'SUSPICIOUS' : 'PROTECTED');
        this.updateFeatureCard('complianceScore', Math.round(complianceScore), 'complianceBadge',
            complianceScore >= 90 ? 'COMPLIANT' : 'REVIEW NEEDED');
    }

    updateMetricsWithData() {
        if (!this.currentAnalysis) return;

        const technical = this.currentAnalysis.Technical || {};
        const dashboard = this.currentAnalysis.Dashboard || {};
        const securityEvents = technical.SecurityEvents || [];

        const totalEvents = dashboard.totalEvents || securityEvents.length;
        const processingSpeed = dashboard.processingSpeed || Math.round(securityEvents.length / 2.5);
        const accuracy = dashboard.detectionAccuracy || 98.5;
        const responseTime = dashboard.responseTime || (120 + Math.random() * 60);
        const blockedThreats = dashboard.threatsBlocked || this.extractThreats().length;

        this.updateMetric('totalEvents', totalEvents, 'eventsChange', 15.3);
        this.updateMetric('processingSpeed', processingSpeed, 'speedChange', 8.7);
        this.updateMetric('accuracy', accuracy, 'accuracyChange', 2.1);
        this.updateMetric('responseTime', Math.round(responseTime), 'responseChange', -5.2);
        this.updateMetric('blockedThreats', blockedThreats, 'blockedChange', 12.4);
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
            'Advanced professional analysis completed. Security assessment shows comprehensive threat landscape evaluation.';
    }

    // UTILITY METHODS
    extractThreats() {
        if (!this.currentAnalysis?.Technical?.SecurityEvents) return [];

        return this.currentAnalysis.Technical.SecurityEvents
            .filter(event => event.Severity && ['High', 'Critical', 'Medium'].includes(event.Severity))
            .map(event => ({
                title: event.EventType || 'Security Event',
                description: this.truncateText(event.Description || 'Security event detected', 80),
                timestamp: this.formatDateTime(event.Timestamp),
                severity: event.Severity || 'Medium'
            }));
    }

    categorizeIOCs(iocs) {
        const categories = {
            'IP Addresses': [],
            'Domains': [],
            'Hashes': [],
            'Emails': [],
            'Other': []
        };

        iocs.forEach(ioc => {
            if (ioc.startsWith('IP:')) {
                categories['IP Addresses'].push(ioc.substring(4));
            } else if (ioc.startsWith('Domain:')) {
                categories['Domains'].push(ioc.substring(8));
            } else if (ioc.startsWith('Hash:')) {
                categories['Hashes'].push(ioc.substring(6));
            } else if (ioc.startsWith('Email:')) {
                categories['Emails'].push(ioc.substring(7));
            } else {
                categories['Other'].push(ioc);
            }
        });

        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });

        return categories;
    }

    countBehaviorAnomalies(events) {
        return events.filter(e =>
            e.Description?.toLowerCase().includes('anomal') ||
            e.Description?.toLowerCase().includes('unusual') ||
            e.Description?.toLowerCase().includes('suspicious')).length;
    }

    countNetworkEvents(events) {
        return events.filter(e =>
            e.EventType?.toLowerCase().includes('network') ||
            e.EventType?.toLowerCase().includes('connection')).length;
    }

    countMalwareEvents(events) {
        return events.filter(e =>
            e.Description?.toLowerCase().includes('malware') ||
            e.Description?.toLowerCase().includes('virus') ||
            e.Description?.toLowerCase().includes('trojan')).length;
    }

    countDataTransfers(events) {
        return events.filter(e =>
            e.Description?.toLowerCase().includes('transfer') ||
            e.Description?.toLowerCase().includes('exfil') ||
            e.Description?.toLowerCase().includes('upload')).length;
    }

    calculateComplianceScore() {
        if (!this.currentAnalysis?.AI?.SeverityScore) return 100;
        return Math.max(100 - (this.currentAnalysis.AI.SeverityScore * 5), 70);
    }

    updateFeatureCard(valueId, value, badgeId, badgeText) {
        const valueElement = document.getElementById(valueId);
        const badgeElement = document.getElementById(badgeId);

        if (valueElement) {
            if (valueId === 'complianceScore') {
                valueElement.textContent = value + '%';
            } else {
                valueElement.textContent = value.toLocaleString();
            }
        }

        if (badgeElement) {
            badgeElement.textContent = badgeText;
        }
    }

    updateMetric(valueId, value, changeId, changeValue) {
        const valueElement = document.getElementById(valueId);
        const changeElement = document.getElementById(changeId);

        if (valueElement) {
            if (valueId === 'accuracy' || valueId === 'uptime') {
                valueElement.textContent = value + '%';
            } else if (valueId === 'responseTime') {
                valueElement.textContent = Math.round(value) + 'ms';
            } else {
                valueElement.textContent = value.toLocaleString();
            }
        }

        if (changeElement && changeValue !== 0) {
            const sign = changeValue > 0 ? '+' : '';
            changeElement.textContent = sign + changeValue + '%';
            changeElement.className = changeValue > 0 ? 'metric-change change-positive' : 'metric-change change-negative';
        }
    }

    updateElement(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = content;
        }
    }

    generateFileId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    formatDateTime(dateTime) {
        if (!dateTime) return 'Unknown';
        const date = new Date(dateTime);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }

    truncateText(text, maxLength) {
        if (!text) return 'No description available';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // PROGRESS MODAL METHODS
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

                if (progressText) progressText.textContent = phase.text;

                steps.forEach((step, index) => {
                    step.classList.remove('active', 'completed');
                    if (index < currentPhase) {
                        step.classList.add('completed');
                    } else if (index === currentPhase) {
                        step.classList.add('active');
                    }
                });

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

    // NOTIFICATION SYSTEM
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

    // EXPORT FUNCTIONALITY
    toggleExportMenu() {
        const menu = document.getElementById('exportMenu');
        if (menu) {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    }

    // CASE MANAGEMENT
    loadCase(index) {
        if (index >= 0 && index < this.analysisHistory.length) {
            this.currentAnalysis = this.analysisHistory[index];
            this.updateDashboardWithResults();
            this.loadTabContent(this.activeTab);
            this.showNotification(`Loaded case #${index + 1}`, 'info');
        }
    }

    // MISC HANDLERS
    showUploadZone() {
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleDocumentClick(e) {
        const exportMenu = document.getElementById('exportMenu');
        const exportBtn = document.getElementById('exportBtn');
        if (exportMenu && !exportBtn?.contains(e.target)) {
            exportMenu.style.display = 'none';
        }
    }

    // CLEANUP
    destroy() {
        if (this.metricsUpdateInterval) {
            clearInterval(this.metricsUpdateInterval);
        }
        if (this.threatIntelUpdateInterval) {
            clearInterval(this.threatIntelUpdateInterval);
        }
    }
}

// EXPORT FUNCTIONS (Global)
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
            generateAdvancedReport(data, `${filename}.txt`);
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
        event.Description?.replace(/"/g, '""'),
        event.Severity,
        event.Source
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, filename);
}

function generateAdvancedReport(data, filename) {
    const content = `
SecuNik Advanced Cybersecurity Analysis Report
Generated: ${new Date().toLocaleString()}
===========================================

FILE INFORMATION:
File Name: ${data.FileName}
File Type: ${data.FileType}
Analysis Time: ${data.AnalysisTimestamp}

EXECUTIVE SUMMARY:
Risk Level: ${data.Executive?.RiskLevel || 'Unknown'}
Threat Assessment: ${data.AI?.ThreatAssessment || 'N/A'}
Severity Score: ${data.AI?.SeverityScore || 0}/10
Business Impact: ${data.AI?.BusinessImpact || 'Assessment pending'}

TECHNICAL FINDINGS:
Security Events: ${data.Technical?.SecurityEvents?.length || 0}
IOCs Detected: ${data.Technical?.DetectedIOCs?.length || 0}
File Format: ${data.Technical?.FileFormat || 'Unknown'}

AI INSIGHTS:
Attack Vector: ${data.AI?.AttackVector || 'Not identified'}
Recommended Actions:
${data.AI?.RecommendedActions?.map(action => `• ${action}`).join('\n') || 'None specified'}

EXECUTIVE REPORT:
Summary: ${data.Executive?.Summary || 'No summary available'}
Key Findings:
${data.Executive?.KeyFindings || 'No key findings'}

Immediate Actions: ${data.Executive?.ImmediateActions || 'No immediate actions required'}
Long-term Recommendations: ${data.Executive?.LongTermRecommendations || 'No recommendations'}

TIMELINE ANALYSIS:
First Activity: ${data.Timeline?.FirstActivity || 'Unknown'}
Last Activity: ${data.Timeline?.LastActivity || 'Unknown'}
Timeline Events: ${data.Timeline?.Events?.length || 0}

Generated by SecuNik Advanced Cybersecurity Platform v2.0
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    downloadBlob(blob, filename);
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

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new SecuNikAdvancedDashboard();
});