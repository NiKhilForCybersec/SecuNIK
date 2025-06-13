/**
 * SecuNik Professional Dashboard - JavaScript Application
 * Advanced AI-powered cybersecurity analysis platform
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

class SecuNikDashboard {
    constructor() {
        // Application state
        this.state = {
            isAnalyzing: false,
            currentAnalysis: null,
            analysisHistory: [],
            sidebarOpen: true,
            currentFile: null,
            systemStatus: 'online',
            analysisCount: 0,
            activeTab: 'dashboard',
            cases: []
        };

        // Configuration
        this.config = {
            maxFileSize: 50 * 1024 * 1024, // 50MB
            supportedFormats: [
                '.csv', '.json', '.log', '.txt', '.evtx', '.evt',
                '.wtmp', '.utmp', '.btmp', '.lastlog', '.pcap', '.pcapng',
                '.syslog', '.fwlog', '.dblog', '.maillog', '.dnslog'
            ],
            apiEndpoints: {
                upload: '/api/analysis/upload',
                health: '/api/analysis/health',
                supportedTypes: '/api/analysis/supported-types'
            },
            animations: {
                duration: 300,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }
        };

        // Settings
        this.settings = {
            aiMode: 'auto',
            analysisDepth: 'standard',
            includeTimeline: true,
            theme: 'professional',
            autoCollapse: false,
            animations: true,
            exportFormat: 'pdf',
            includeRawData: false,
            confidenceThreshold: 0.8,
            executiveSummary: true
        };

        // Performance metrics
        this.metrics = {
            cpu: 0,
            memory: 0,
            analysisSpeed: 0,
            startTime: null
        };

        // Initialize application
        this.init();
    }

    /**
     * Initialize the dashboard application
     */
    async init() {
        console.log('🚀 Initializing SecuNik Professional Dashboard v2.1...');

        try {
            this.initializeElements();
            this.setupEventListeners();
            this.loadSettings();
            this.loadAnalysisHistory();
            this.loadCases();
            await this.checkSystemHealth();
            this.initializeAnimations();
            this.setupResponsiveHandlers();
            this.setupTabNavigation();
            this.setupPerformanceMonitoring();

            console.log('✅ SecuNik Dashboard initialized successfully');
            this.showNotification('SecuNik Dashboard ready for analysis', 'success');
        } catch (error) {
            console.error('❌ Failed to initialize dashboard:', error);
            this.showNotification('Failed to initialize dashboard', 'error');
        }
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            // Tab navigation
            navTabs: document.querySelectorAll('.nav-tab'),
            tabSections: document.querySelectorAll('.tab-section'),
            tabLinks: document.querySelectorAll('[data-tab-link]'),

            // Upload elements
            fileInput: document.getElementById('fileInput'),
            headerUploadZone: document.getElementById('headerUploadZone'),

            // Progress elements
            analysisProgress: document.getElementById('analysisProgress'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            progressPercentage: document.getElementById('progressPercentage'),

            // Status elements
            systemStatus: document.getElementById('systemStatus'),
            analysisCounter: document.getElementById('analysisCounter'),

            // Button elements
            settingsBtn: document.getElementById('settingsBtn'),
            helpBtn: document.getElementById('helpBtn'),
            exportBtn: document.getElementById('exportBtn'),
            sidebarToggle: document.getElementById('sidebarToggle'),

            // Main content areas
            welcomeState: document.getElementById('welcomeScreen'),
            analysisDashboard: document.getElementById('tabContent'),
            detailsSidebar: document.getElementById('navSidebar'),
            mainContent: document.getElementById('main-content'),
            loadingOverlay: document.getElementById('loadingOverlay'),

            // Quick stats
            criticalEvents: document.getElementById('criticalEvents'),
            totalEvents: document.getElementById('totalEvents'),
            totalIOCs: document.getElementById('totalIOCs'),
            analysisScore: document.getElementById('analysisScore'),

            // Widgets
            riskGauge: document.getElementById('riskGauge'),
            gaugeFill: document.getElementById('gaugeFill'),
            gaugeValue: document.getElementById('gaugeValue'),
            riskLevelText: document.getElementById('riskLevelText'),
            aiSummary: document.getElementById('aiSummary'),
            aiConfidence: document.getElementById('aiConfidence'),
            topThreats: document.getElementById('topThreats'),
            threatCount: document.getElementById('threatCount'),
            timelineChart: document.getElementById('timelineChart'),
            iocCategories: document.getElementById('iocCategories'),
            performanceStatus: document.getElementById('performanceStatus'),
            cpuFill: document.getElementById('cpuFill'),
            cpuValue: document.getElementById('cpuValue'),
            memoryFill: document.getElementById('memoryFill'),
            memoryValue: document.getElementById('memoryValue'),
            speedFill: document.getElementById('speedFill'),
            speedValue: document.getElementById('speedValue'),

            // Case management
            caseForm: document.getElementById('caseForm'),
            caseTitle: document.getElementById('caseTitle'),
            caseSeverity: document.getElementById('caseSeverity'),
            caseAssignee: document.getElementById('caseAssignee'),
            caseDescription: document.getElementById('caseDescription'),
            createCaseBtn: document.getElementById('createCaseBtn'),
            exportCaseBtn: document.getElementById('exportCaseBtn'),
            caseHistoryList: document.getElementById('caseHistoryList'),
            refreshCasesBtn: document.getElementById('refreshCasesBtn'),

            // Quick actions
            generateReportBtn: document.getElementById('generateReportBtn'),
            exportIOCsBtn: document.getElementById('exportIOCsBtn'),
            shareAnalysisBtn: document.getElementById('shareAnalysisBtn'),
            newAnalysisBtn: document.getElementById('newAnalysisBtn')
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // File upload events
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (this.elements.headerUploadZone) {
            this.elements.headerUploadZone.addEventListener('click', () => this.triggerFileInput());
            this.elements.headerUploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.headerUploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.elements.headerUploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // Navigation events
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Action button events
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.switchToTab('settings'));
        }

        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => this.switchToTab('help'));
        }

        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportAnalysis());
        }

        // Quick action events
        if (this.elements.generateReportBtn) {
            this.elements.generateReportBtn.addEventListener('click', () => this.generateReport());
        }

        if (this.elements.exportIOCsBtn) {
            this.elements.exportIOCsBtn.addEventListener('click', () => this.exportIOCs());
        }

        if (this.elements.shareAnalysisBtn) {
            this.elements.shareAnalysisBtn.addEventListener('click', () => this.shareAnalysis());
        }

        if (this.elements.newAnalysisBtn) {
            this.elements.newAnalysisBtn.addEventListener('click', () => this.startNewAnalysis());
        }

        // Case management events
        if (this.elements.caseForm) {
            this.elements.caseForm.addEventListener('submit', (e) => this.handleCaseSubmit(e));
        }

        if (this.elements.exportCaseBtn) {
            this.elements.exportCaseBtn.addEventListener('click', () => this.exportCase());
        }

        if (this.elements.refreshCasesBtn) {
            this.elements.refreshCasesBtn.addEventListener('click', () => this.refreshCases());
        }

        if (this.elements.caseDescription) {
            this.elements.caseDescription.addEventListener('input', (e) => this.updateCharCounter(e));
        }

        // Timeline controls
        const timelineBtns = document.querySelectorAll('.timeline-btn');
        timelineBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTimelineFilter(e));
        });

        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Prevent global drag events
        this.preventGlobalDrag();
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        // Tab navigation
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    this.switchToTab(tabName);
                }
            });
        });

        // Tab links in widgets
        this.elements.tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabName = link.getAttribute('data-tab-link');
                if (tabName) {
                    this.switchToTab(tabName);
                }
            });
        });
    }

    /**
     * Switch to specified tab
     */
    switchToTab(tabName) {
        // Update state
        this.state.activeTab = tabName;

        // Update nav tabs
        this.elements.navTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update tab sections
        this.elements.tabSections.forEach(section => {
            const isActive = section.id === `${tabName}Tab`;
            section.classList.toggle('active', isActive);
        });

        // Update URL without navigation
        if (history.replaceState) {
            history.replaceState(null, '', `#${tabName}`);
        }

        console.log(`Switched to tab: ${tabName}`);
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        this.state.sidebarOpen = !this.state.sidebarOpen;
        this.updateSidebarState();
        this.saveSettings();
    }

    /**
     * Update sidebar state
     */
    updateSidebarState() {
        const sidebar = this.elements.detailsSidebar;
        const main = document.querySelector('.app-container');

        if (sidebar) {
            sidebar.classList.toggle('collapsed', !this.state.sidebarOpen);
        }

        if (main) {
            main.classList.toggle('sidebar-collapsed', !this.state.sidebarOpen);
        }
    }

    /**
     * File upload handlers
     */
    triggerFileInput() {
        if (this.elements.fileInput) {
            this.elements.fileInput.click();
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
        // Reset input
        event.target.value = '';
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.classList.remove('dragover');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');

        const file = event.dataTransfer.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    /**
     * Process uploaded file
     */
    async processFile(file) {
        console.log('📁 Processing file:', file.name);

        if (this.state.isAnalyzing) {
            this.showNotification('Analysis already in progress. Please wait.', 'warning');
            return;
        }

        if (!this.validateFile(file)) {
            return;
        }

        this.state.currentFile = {
            name: file.name,
            size: file.size,
            type: file.type || this.detectFileType(file.name),
            lastModified: file.lastModified
        };

        this.state.isAnalyzing = true;
        this.metrics.startTime = Date.now();

        try {
            await this.analyzeFile(file);
        } catch (error) {
            console.error('❌ File processing failed:', error);
            this.showNotification('File analysis failed: ' + error.message, 'error');
            this.showWelcomeState();
        } finally {
            this.state.isAnalyzing = false;
        }
    }

    /**
     * Validate file before processing
     */
    validateFile(file) {
        // Check file size
        if (file.size > this.config.maxFileSize) {
            this.showNotification(
                `File too large. Maximum size is ${this.formatFileSize(this.config.maxFileSize)}.`,
                'error'
            );
            return false;
        }

        // Check file type
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.config.supportedFormats.includes(extension)) {
            this.showNotification(
                `Unsupported file type: ${extension}. Supported formats: ${this.config.supportedFormats.join(', ')}`,
                'error'
            );
            return false;
        }

        return true;
    }

    /**
     * Analyze file using API
     */
    async analyzeFile(file) {
        console.log('🔍 Starting analysis for:', file.name);

        this.showLoadingState();
        this.showAnalysisProgress();

        try {
            // Start progress simulation
            this.simulateProgress();

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('options', JSON.stringify({
                aiMode: this.settings.aiMode,
                analysisDepth: this.settings.analysisDepth,
                includeTimeline: this.settings.includeTimeline,
                confidenceThreshold: this.settings.confidenceThreshold
            }));

            // Make API call
            const response = await fetch(this.config.apiEndpoints.upload, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const processingTime = Date.now() - this.metrics.startTime;

            // Clear progress interval
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
            }

            this.hideLoadingState();
            this.hideAnalysisProgress();

            await this.processAnalysisResults(result, processingTime);

            this.showNotification(`Analysis completed for ${file.name}`, 'success');

        } catch (error) {
            console.error('❌ Analysis failed:', error);

            // Clear progress interval
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
            }

            this.hideLoadingState();
            this.hideAnalysisProgress();
            this.showNotification('Analysis failed: ' + error.message, 'error');
            throw error;
        }
    }

    /**
     * Simulate progress during analysis
     */
    simulateProgress() {
        let progress = 0;
        const stages = [
            'Initializing AI analysis engine...',
            'Reading file structure...',
            'Parsing data content...',
            'Detecting security events...',
            'Analyzing threat patterns...',
            'Correlating indicators...',
            'Generating risk assessment...',
            'Creating executive summary...',
            'Finalizing results...'
        ];

        this.progressInterval = setInterval(() => {
            if (progress < 95) {
                progress += Math.random() * 10;
                progress = Math.min(progress, 95);

                const stageIndex = Math.floor((progress / 100) * stages.length);
                const stage = stages[stageIndex] || stages[stages.length - 1];

                this.updateProgress(progress, stage);
            }
        }, 500);
    }

    /**
     * Update progress bar
     */
    updateProgress(percentage, status) {
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${percentage}%`;
        }

        if (this.elements.progressPercentage) {
            this.elements.progressPercentage.textContent = `${Math.round(percentage)}%`;
        }

        if (this.elements.progressText) {
            this.elements.progressText.textContent = status;
        }

        if (this.elements.analysisProgress) {
            this.elements.analysisProgress.setAttribute('aria-valuenow', Math.round(percentage));
        }
    }

    /**
     * Process analysis results and update dashboard
     */
    async processAnalysisResults(result, processingTime) {
        console.log('📊 Processing analysis results...');

        // Store analysis data
        this.state.currentAnalysis = {
            result: result,
            fileInfo: this.state.currentFile,
            processingTime: processingTime,
            analysisId: this.generateAnalysisId(),
            timestamp: new Date().toISOString()
        };

        // Update analysis counter
        this.state.analysisCount++;
        this.updateAnalysisCounter();

        // Show analysis dashboard
        this.showAnalysisState();

        // Switch to dashboard tab first
        this.switchToTab('dashboard');

        // Update all dashboard components
        await this.updateDashboard(this.state.currentAnalysis);
        await this.updateAllTabs(this.state.currentAnalysis);

        // Store in history
        this.state.analysisHistory.push({
            id: this.state.currentAnalysis.analysisId,
            timestamp: this.state.currentAnalysis.timestamp,
            fileName: this.state.currentFile.name,
            riskScore: this.calculateRiskScore(result)
        });

        // Save history to localStorage
        this.saveAnalysisHistory();

        // Show export button
        if (this.elements.exportBtn) {
            this.elements.exportBtn.style.display = 'flex';
        }
    }

    /**
     * Update dashboard with analysis data
     */
    async updateDashboard(analysis) {
        const data = analysis.result;
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        // Update quick stats
        this.updateQuickStats(events, iocs, data);

        // Update risk gauge
        this.updateRiskGauge(data);

        // Update AI summary
        this.updateAISummary(data);

        // Update top threats
        this.updateTopThreats(events);

        // Update timeline
        this.updateTimelineChart(events);

        // Update IOC categories
        this.updateIOCCategories(iocs);

        // Update performance metrics
        this.updateAnalysisPerformanceMetrics(analysis.processingTime);
    }

    /**
     * Update quick stats
     */
    updateQuickStats(events, iocs, data) {
        const criticalEvents = events.filter(e =>
            (e.severity || '').toLowerCase() === 'critical'
        ).length;

        const analysisScore = this.calculateAnalysisScore(data);

        if (this.elements.criticalEvents) {
            this.elements.criticalEvents.textContent = criticalEvents.toString();
        }

        if (this.elements.totalEvents) {
            this.elements.totalEvents.textContent = events.length.toString();
        }

        if (this.elements.totalIOCs) {
            this.elements.totalIOCs.textContent = iocs.length.toString();
        }

        if (this.elements.analysisScore) {
            this.elements.analysisScore.textContent = analysisScore.toString();
        }
    }

    /**
     * Update risk gauge
     */
    updateRiskGauge(data) {
        const riskScore = this.calculateRiskScore(data);
        const riskLevel = this.getRiskLevel(riskScore);

        if (this.elements.gaugeValue) {
            this.elements.gaugeValue.textContent = riskScore;
        }

        if (this.elements.gaugeFill) {
            this.elements.gaugeFill.style.width = `${riskScore}%`;
        }

        if (this.elements.riskLevelText) {
            this.elements.riskLevelText.textContent = riskLevel;
            this.elements.riskLevelText.className = `risk-level-value ${riskLevel.toLowerCase()}`;
        }
    }

    /**
     * Update AI summary
     */
    updateAISummary(data) {
        const summary = data.executiveSummary?.summary || data.aiInsights?.summary || 'No AI summary available';
        const confidence = data.aiInsights?.confidence || 0;

        if (this.elements.aiSummary) {
            this.elements.aiSummary.innerHTML = `<p>${this.sanitizeHTML(summary)}</p>`;
        }

        if (this.elements.aiConfidence) {
            this.elements.aiConfidence.textContent = `${Math.round(confidence * 100)}% confidence`;
        }
    }

    /**
     * Update top threats
     */
    updateTopThreats(events) {
        const threats = events
            .filter(e => e.severity && ['critical', 'high'].includes(e.severity.toLowerCase()))
            .slice(0, 5);

        if (this.elements.topThreats) {
            if (threats.length === 0) {
                this.elements.topThreats.innerHTML = `
                    <div class="placeholder-content">
                        <i data-feather="shield" width="32" height="32"></i>
                        <p>No critical threats detected</p>
                    </div>
                `;
            } else {
                this.elements.topThreats.innerHTML = threats.map(threat => `
                    <div class="threat-item">
                        <div class="threat-severity ${threat.severity?.toLowerCase() || 'info'}"></div>
                        <div class="threat-content">
                            <div class="threat-title">${this.sanitizeHTML(threat.eventType || threat.description || 'Unknown Threat')}</div>
                            <div class="threat-time">${this.formatTimestamp(threat.timestamp)}</div>
                        </div>
                    </div>
                `).join('');
            }

            // Replace feather icons
            feather.replace();
        }

        if (this.elements.threatCount) {
            this.elements.threatCount.textContent = threats.length.toString();
        }
    }

    /**
     * Update timeline chart
     */
    updateTimelineChart(events) {
        if (!this.elements.timelineChart) return;

        if (events.length === 0) {
            this.elements.timelineChart.innerHTML = `
                <div class="placeholder-content">
                    <i data-feather="activity" width="32" height="32"></i>
                    <p>No events to display</p>
                </div>
            `;
            feather.replace();
            return;
        }

        // Simple timeline visualization
        const timelineData = this.processTimelineData(events);
        this.renderSimpleTimeline(timelineData);
    }

    /**
     * Process timeline data
     */
    processTimelineData(events) {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return events
            .filter(e => e.timestamp && new Date(e.timestamp) >= last24h)
            .map(e => ({
                timestamp: new Date(e.timestamp),
                severity: e.severity || 'info',
                type: e.eventType || 'Unknown',
                description: e.description || ''
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Render simple timeline
     */
    renderSimpleTimeline(data) {
        if (!this.elements.timelineChart) return;

        const hours = Array.from({ length: 24 }, (_, i) => {
            const hour = new Date();
            hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
            return hour;
        });

        const timeline = hours.map(hour => {
            const hourEvents = data.filter(e =>
                e.timestamp.getHours() === hour.getHours() &&
                e.timestamp.getDate() === hour.getDate()
            );

            const critical = hourEvents.filter(e => e.severity === 'critical').length;
            const high = hourEvents.filter(e => e.severity === 'high').length;
            const total = hourEvents.length;

            return {
                hour: hour.getHours(),
                total,
                critical,
                high,
                height: Math.min((total / Math.max(...hours.map(h => data.filter(e => e.timestamp.getHours() === h.getHours()).length), 1)) * 100, 100)
            };
        });

        this.elements.timelineChart.innerHTML = `
            <div class="timeline-bars">
                ${timeline.map(bar => `
                    <div class="timeline-bar" style="height: ${bar.height}%" title="${bar.total} events at ${bar.hour}:00">
                        <div class="bar-segment critical" style="height: ${bar.critical ? (bar.critical / bar.total) * 100 : 0}%"></div>
                        <div class="bar-segment high" style="height: ${bar.high ? (bar.high / bar.total) * 100 : 0}%"></div>
                    </div>
                `).join('')}
            </div>
            <div class="timeline-labels">
                ${timeline.filter((_, i) => i % 4 === 0).map(bar => `
                    <span>${bar.hour}:00</span>
                `).join('')}
            </div>
        `;
    }

    /**
     * Update IOC categories
     */
    updateIOCCategories(iocs) {
        if (!this.elements.iocCategories) return;

        if (iocs.length === 0) {
            this.elements.iocCategories.innerHTML = `
                <div class="placeholder-content">
                    <i data-feather="search" width="32" height="32"></i>
                    <p>No IOCs detected</p>
                </div>
            `;
            feather.replace();
            return;
        }

        const categories = {};
        iocs.forEach(ioc => {
            const category = ioc.category || ioc.type || 'Unknown';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category]++;
        });

        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        this.elements.iocCategories.innerHTML = `
            <div class="ioc-category-list">
                ${sortedCategories.map(([category, count]) => `
                    <div class="ioc-category-item">
                        <div class="category-name">${this.sanitizeHTML(category)}</div>
                        <div class="category-count">${count}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Update analysis performance metrics
     */
    updateAnalysisPerformanceMetrics(processingTime) {
        const speed = this.state.currentFile ? (this.state.currentFile.size / processingTime) * 1000 : 0;

        // Simulate performance metrics
        this.metrics.cpu = Math.min(30 + Math.random() * 40, 100);
        this.metrics.memory = Math.min(40 + Math.random() * 30, 100);
        this.metrics.analysisSpeed = Math.min((speed / 1024) / 10, 100); // Normalize to percentage

        if (this.elements.cpuFill) {
            this.elements.cpuFill.style.width = `${this.metrics.cpu}%`;
        }
        if (this.elements.cpuValue) {
            this.elements.cpuValue.textContent = `${Math.round(this.metrics.cpu)}%`;
        }

        if (this.elements.memoryFill) {
            this.elements.memoryFill.style.width = `${this.metrics.memory}%`;
        }
        if (this.elements.memoryValue) {
            this.elements.memoryValue.textContent = `${Math.round(this.metrics.memory)}%`;
        }

        if (this.elements.speedFill) {
            this.elements.speedFill.style.width = `${this.metrics.analysisSpeed}%`;
        }
        if (this.elements.speedValue) {
            this.elements.speedValue.textContent = this.formatSpeed(speed);
        }

        const status = this.metrics.cpu < 60 && this.metrics.memory < 70 ? 'Optimal' :
            this.metrics.cpu < 80 && this.metrics.memory < 85 ? 'Good' : 'High Load';

        if (this.elements.performanceStatus) {
            this.elements.performanceStatus.textContent = status;
            this.elements.performanceStatus.className = `performance-status ${status.toLowerCase().replace(' ', '-')}`;
        }
    }

    /**
     * Case Management Functions
     */
    handleCaseSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const caseData = {
            id: this.generateCaseId(),
            title: formData.get('caseTitle'),
            severity: formData.get('caseSeverity'),
            assignee: formData.get('caseAssignee') || 'Unassigned',
            description: formData.get('caseDescription'),
            status: 'open',
            createdAt: new Date().toISOString(),
            analysisId: this.state.currentAnalysis?.analysisId || null
        };

        if (this.validateCase(caseData)) {
            this.createCase(caseData);
        }
    }

    validateCase(caseData) {
        const errors = {};

        if (!caseData.title || caseData.title.trim().length < 3) {
            errors.title = 'Title must be at least 3 characters long';
        }

        if (!caseData.severity) {
            errors.severity = 'Severity is required';
        }

        if (!caseData.description || caseData.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters long';
        }

        this.displayValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    displayValidationErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // Display new errors
        Object.entries(errors).forEach(([field, message]) => {
            const errorElement = document.getElementById(`case${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
            if (errorElement) {
                errorElement.textContent = message;
            }
        });
    }

    createCase(caseData) {
        this.state.cases.push(caseData);
        this.saveCases();
        this.refreshCaseHistory();
        this.clearCaseForm();
        this.showNotification(`Case "${caseData.title}" created successfully`, 'success');
    }

    clearCaseForm() {
        if (this.elements.caseForm) {
            this.elements.caseForm.reset();
        }
        this.updateCharCounter({ target: { value: '' } });
    }

    refreshCases() {
        this.loadCases();
        this.refreshCaseHistory();
        this.showNotification('Cases refreshed', 'info');
    }

    refreshCaseHistory() {
        if (!this.elements.caseHistoryList) return;

        if (this.state.cases.length === 0) {
            this.elements.caseHistoryList.innerHTML = `
                <div class="placeholder-content">
                    <i data-feather="folder" width="32" height="32"></i>
                    <p>No cases found</p>
                </div>
            `;
        } else {
            const recentCases = this.state.cases
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10);

            this.elements.caseHistoryList.innerHTML = recentCases.map(case_ => `
                <div class="case-item" data-case-id="${case_.id}">
                    <div class="case-header">
                        <div class="case-title">${this.sanitizeHTML(case_.title)}</div>
                        <div class="case-severity ${case_.severity}">${case_.severity.toUpperCase()}</div>
                    </div>
                    <div class="case-meta">
                        <span>Assignee: ${this.sanitizeHTML(case_.assignee)}</span>
                        <span>Created: ${this.formatTimestamp(case_.createdAt)}</span>
                    </div>
                    <div class="case-status">Status: ${case_.status}</div>
                </div>
            `).join('');
        }

        feather.replace();
    }

    updateCharCounter(event) {
        const value = event.target.value;
        const maxLength = 1000;
        const counter = document.getElementById('descriptionCounter');

        if (counter) {
            counter.textContent = `${value.length}/${maxLength}`;
            counter.className = value.length > maxLength * 0.9 ? 'char-counter warning' : 'char-counter';
        }
    }

    exportCase() {
        if (this.state.cases.length === 0) {
            this.showNotification('No cases to export', 'warning');
            return;
        }

        try {
            const data = JSON.stringify(this.state.cases, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `secunik-cases-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Cases exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export cases', 'error');
        }
    }

    /**
     * Timeline filter handler
     */
    handleTimelineFilter(event) {
        const period = event.target.getAttribute('data-period');

        // Update active state
        document.querySelectorAll('.timeline-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-checked', 'false');
        });

        event.target.classList.add('active');
        event.target.setAttribute('aria-checked', 'true');

        // Filter timeline data if analysis exists
        if (this.state.currentAnalysis) {
            const events = this.state.currentAnalysis.result.technical?.securityEvents || [];
            const filteredEvents = this.filterEventsByPeriod(events, period);
            this.updateTimelineChart(filteredEvents);
        }
    }

    filterEventsByPeriod(events, period) {
        const now = new Date();
        let cutoff;

        switch (period) {
            case '1h':
                cutoff = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case '6h':
                cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                break;
            case '24h':
                cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            default:
                return events;
        }

        return events.filter(e => e.timestamp && new Date(e.timestamp) >= cutoff);
    }

    /**
     * Update all tabs with analysis data
     */
    async updateAllTabs(analysis) {
        // Placeholder for tab updates - implement as needed
        console.log('Updating all tabs with analysis data');
    }

    /**
     * Export and Action Functions
     */
    async generateReport() {
        if (!this.state.currentAnalysis) {
            this.showNotification('No analysis data to export', 'warning');
            return;
        }

        try {
            this.showNotification('Generating report...', 'info');

            const reportData = {
                analysis: this.state.currentAnalysis,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    version: '2.1.0',
                    format: this.settings.exportFormat
                }
            };

            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `secunik-report-${this.state.currentAnalysis.analysisId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Report generated successfully', 'success');
        } catch (error) {
            console.error('Report generation failed:', error);
            this.showNotification('Failed to generate report', 'error');
        }
    }

    async exportIOCs() {
        if (!this.state.currentAnalysis) {
            this.showNotification('No analysis data available', 'warning');
            return;
        }

        const iocs = this.state.currentAnalysis.result.technical?.detectedIOCs || [];

        if (iocs.length === 0) {
            this.showNotification('No IOCs found to export', 'warning');
            return;
        }

        try {
            const csvData = this.convertIOCsToCSV(iocs);
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `secunik-iocs-${this.state.currentAnalysis.analysisId}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('IOCs exported successfully', 'success');
        } catch (error) {
            console.error('IOC export failed:', error);
            this.showNotification('Failed to export IOCs', 'error');
        }
    }

    convertIOCsToCSV(iocs) {
        const headers = ['Type', 'Value', 'Category', 'Confidence', 'Description', 'First Seen'];
        const rows = iocs.map(ioc => [
            ioc.type || '',
            ioc.value || '',
            ioc.category || '',
            ioc.confidence || '',
            ioc.description || '',
            ioc.firstSeen || ''
        ]);

        return [headers, ...rows].map(row =>
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    async shareAnalysis() {
        if (!this.state.currentAnalysis) {
            this.showNotification('No analysis to share', 'warning');
            return;
        }

        try {
            // Create shareable summary
            const shareData = {
                analysisId: this.state.currentAnalysis.analysisId,
                fileName: this.state.currentFile.name,
                timestamp: this.state.currentAnalysis.timestamp,
                riskScore: this.calculateRiskScore(this.state.currentAnalysis.result),
                summary: this.state.currentAnalysis.result.executiveSummary?.summary || 'Analysis completed'
            };

            if (navigator.share) {
                await navigator.share({
                    title: 'SecuNik Analysis Results',
                    text: `Analysis of ${shareData.fileName} - Risk Score: ${shareData.riskScore}/100`,
                    url: `${window.location.origin}#analysis=${shareData.analysisId}`
                });
            } else {
                // Fallback to clipboard
                const shareText = `SecuNik Analysis Results\nFile: ${shareData.fileName}\nRisk Score: ${shareData.riskScore}/100\nAnalyzed: ${this.formatTimestamp(shareData.timestamp)}`;
                await navigator.clipboard.writeText(shareText);
                this.showNotification('Analysis summary copied to clipboard', 'success');
            }
        } catch (error) {
            console.error('Share failed:', error);
            this.showNotification('Failed to share analysis', 'error');
        }
    }

    startNewAnalysis() {
        if (this.state.isAnalyzing) {
            this.showNotification('Please wait for current analysis to complete', 'warning');
            return;
        }

        // Clear current analysis
        this.state.currentAnalysis = null;
        this.state.currentFile = null;

        // Hide export button
        if (this.elements.exportBtn) {
            this.elements.exportBtn.style.display = 'none';
        }

        // Show welcome state
        this.showWelcomeState();

        // Switch to dashboard tab
        this.switchToTab('dashboard');

        this.showNotification('Ready for new analysis', 'info');
    }

    async exportAnalysis() {
        await this.generateReport();
    }

    /**
     * System health check
     */
    async checkSystemHealth() {
        try {
            const response = await fetch(this.config.apiEndpoints.health, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                this.state.systemStatus = 'online';
                this.updateSystemStatus('System Online', 'online');
            } else {
                this.state.systemStatus = 'degraded';
                this.updateSystemStatus('System Degraded', 'degraded');
            }
        } catch (error) {
            this.state.systemStatus = 'offline';
            this.updateSystemStatus('System Offline', 'offline');
            console.warn('Health check failed:', error);
        }
    }

    updateSystemStatus(text, status) {
        if (this.elements.systemStatus) {
            this.elements.systemStatus.querySelector('span').textContent = text;
            this.elements.systemStatus.className = `status-indicator ${status}`;
        }
    }

    updateAnalysisCounter() {
        if (this.elements.analysisCounter) {
            const text = this.state.analysisCount === 1 ? '1 File Analyzed' : `${this.state.analysisCount} Files Analyzed`;
            this.elements.analysisCounter.querySelector('span').textContent = text;
        }
    }

    /**
     * Performance monitoring
     */
    setupPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000);
    }

    updatePerformanceMetrics() {
        // Simulate realistic metrics
        this.metrics.cpu = Math.max(0, this.metrics.cpu + (Math.random() - 0.5) * 10);
        this.metrics.memory = Math.max(0, this.metrics.memory + (Math.random() - 0.5) * 5);

        this.metrics.cpu = Math.min(100, this.metrics.cpu);
        this.metrics.memory = Math.min(100, this.metrics.memory);

        if (this.elements.cpuFill) {
            this.elements.cpuFill.style.width = `${this.metrics.cpu}%`;
        }
        if (this.elements.cpuValue) {
            this.elements.cpuValue.textContent = `${Math.round(this.metrics.cpu)}%`;
        }

        if (this.elements.memoryFill) {
            this.elements.memoryFill.style.width = `${this.metrics.memory}%`;
        }
        if (this.elements.memoryValue) {
            this.elements.memoryValue.textContent = `${Math.round(this.metrics.memory)}%`;
        }
    }

    /**
     * Responsive handlers
     */
    setupResponsiveHandlers() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        const handleResponsive = (e) => {
            if (e.matches) {
                // Mobile
                this.state.sidebarOpen = false;
                this.updateSidebarState();
            } else {
                // Desktop
                this.state.sidebarOpen = true;
                this.updateSidebarState();
            }
        };

        mediaQuery.addListener(handleResponsive);
        handleResponsive(mediaQuery);
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        if (!this.settings.animations) return;

        // Add entrance animations to elements
        const animatedElements = document.querySelectorAll('.dashboard-widget, .stat-card, .feature-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'u':
                        e.preventDefault();
                        this.triggerFileInput();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.startNewAnalysis();
                        break;
                    case 's':
                        e.preventDefault();
                        if (this.state.currentAnalysis) {
                            this.generateReport();
                        }
                        break;
                    case 'e':
                        e.preventDefault();
                        if (this.state.currentAnalysis) {
                            this.exportIOCs();
                        }
                        break;
                }
            }

            // Tab navigation shortcuts
            if (e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchToTab('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchToTab('fileDetails');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchToTab('executive');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchToTab('risk');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchToTab('iocs');
                        break;
                }
            }

            // Toggle sidebar with Tab + Alt
            if (e.key === 'Tab' && e.altKey) {
                e.preventDefault();
                this.toggleSidebar();
            }
        });
    }

    /**
     * Prevent global drag events
     */
    preventGlobalDrag() {
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    /**
     * State management
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('secunik_dashboard_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('secunik_dashboard_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    loadAnalysisHistory() {
        try {
            const saved = localStorage.getItem('secunik_analysis_history');
            if (saved) {
                this.state.analysisHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load analysis history:', error);
        }
    }

    saveAnalysisHistory() {
        try {
            localStorage.setItem('secunik_analysis_history', JSON.stringify(this.state.analysisHistory));
        } catch (error) {
            console.warn('Failed to save analysis history:', error);
        }
    }

    loadCases() {
        try {
            const saved = localStorage.getItem('secunik_cases');
            if (saved) {
                this.state.cases = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load cases:', error);
        }
    }

    saveCases() {
        try {
            localStorage.setItem('secunik_cases', JSON.stringify(this.state.cases));
        } catch (error) {
            console.warn('Failed to save cases:', error);
        }
    }

    /**
     * UI state management
     */
    showWelcomeState() {
        if (this.elements.welcomeState) {
            this.elements.welcomeState.style.display = 'flex';
        }
        if (this.elements.analysisDashboard) {
            this.elements.analysisDashboard.style.display = 'none';
        }
    }

    showAnalysisState() {
        if (this.elements.welcomeState) {
            this.elements.welcomeState.style.display = 'none';
        }
        if (this.elements.analysisDashboard) {
            this.elements.analysisDashboard.style.display = 'block';
        }
    }

    showLoadingState() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'flex';
            this.elements.loadingOverlay.setAttribute('aria-hidden', 'false');
        }
    }

    hideLoadingState() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'none';
            this.elements.loadingOverlay.setAttribute('aria-hidden', 'true');
        }
    }

    showAnalysisProgress() {
        if (this.elements.analysisProgress) {
            this.elements.analysisProgress.style.display = 'block';
        }
    }

    hideAnalysisProgress() {
        if (this.elements.analysisProgress) {
            this.elements.analysisProgress.style.display = 'none';
        }
    }

    /**
     * Utility functions
     */
    calculateRiskScore(data) {
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        let score = 0;

        // Base score from events
        events.forEach(event => {
            switch (event.severity?.toLowerCase()) {
                case 'critical': score += 25; break;
                case 'high': score += 15; break;
                case 'medium': score += 8; break;
                case 'low': score += 3; break;
                default: score += 1;
            }
        });

        // Add IOC score
        score += iocs.length * 5;

        // Normalize to 0-100
        return Math.min(Math.round(score), 100);
    }

    calculateAnalysisScore(data) {
        const riskScore = this.calculateRiskScore(data);
        return Math.max(0, 100 - riskScore);
    }

    getRiskLevel(score) {
        if (score >= 80) return 'Critical';
        if (score >= 60) return 'High';
        if (score >= 40) return 'Medium';
        if (score >= 20) return 'Low';
        return 'Minimal';
    }

    detectFileType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'evtx': 'Windows Event Log',
            'evt': 'Windows Event Log (Legacy)',
            'pcap': 'Network Packet Capture',
            'pcapng': 'Network Packet Capture (Next Gen)',
            'csv': 'Comma Separated Values',
            'json': 'JavaScript Object Notation',
            'log': 'System Log File',
            'txt': 'Text File',
            'syslog': 'System Log',
            'wtmp': 'Unix Login Log',
            'utmp': 'Unix User Log',
            'btmp': 'Unix Bad Login Log',
            'lastlog': 'Unix Last Login Log',
            'fwlog': 'Firewall Log',
            'dblog': 'Database Log',
            'maillog': 'Mail Server Log',
            'dnslog': 'DNS Server Log'
        };
        return typeMap[ext] || 'Unknown';
    }

    generateAnalysisId() {
        return 'AN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    generateCaseId() {
        return 'CASE-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Unknown';
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (error) {
            return timestamp.toString();
        }
    }

    formatSpeed(bytesPerSecond) {
        if (bytesPerSecond < 1024) {
            return `${Math.round(bytesPerSecond)} B/s`;
        } else if (bytesPerSecond < 1024 * 1024) {
            return `${Math.round(bytesPerSecond / 1024)} KB/s`;
        } else {
            return `${Math.round(bytesPerSecond / (1024 * 1024))} MB/s`;
        }
    }

    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Notification system
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer') || this.createNotificationContainer();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getNotificationIcon(type)}</div>
            <div class="notification-content">
                <div class="notification-message">${this.sanitizeHTML(message)}</div>
            </div>
            <button class="notification-close" aria-label="Close notification">×</button>
        `;

        notification.style.cssText = `
            background: var(--bg-card);
            border: 1px solid ${this.getNotificationColor(type)};
            border-left: 4px solid ${this.getNotificationColor(type)};
            border-radius: var(--radius-md);
            padding: var(--space-md);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-md);
            max-width: 400px;
            box-shadow: var(--shadow-lg);
            animation: slideInRight 0.3s ease-out;
            color: var(--text-primary);
            font-size: 14px;
            pointer-events: auto;
            position: relative;
            transform: translateX(100%);
            opacity: 0;
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        closeBtn.addEventListener('click', () => this.hideNotification(notification));

        container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => this.hideNotification(notification), duration);
        }

        return notification;
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
            display: flex;
            flex-direction: column;
        `;
        document.body.appendChild(container);
        return container;
    }

    hideNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.secuNikDashboard = new SecuNikDashboard();
    console.log('🚀 SecuNik Professional Dashboard v2.1 initialized');
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.secuNikDashboard) {
        window.secuNikDashboard.showNotification('An unexpected error occurred', 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.secuNikDashboard) {
        window.secuNikDashboard.showNotification('A system error occurred', 'error');
    }
    event.preventDefault();
});

// Export for global access
window.SecuNikDashboard = SecuNikDashboard;