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
            activeTab: 'dashboard'
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
            await this.checkSystemHealth();
            this.initializeAnimations();
            this.setupResponsiveHandlers();
            this.setupTabNavigation();

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

            // Upload elements
            fileInput: document.getElementById('fileInput'),
            headerUploadZone: document.getElementById('headerUploadZone'),
            uploadArea: document.getElementById('uploadArea'),

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
            dashboardMain: document.getElementById('mainContent'),

            // Quick stats
            criticalEvents: document.getElementById('criticalEvents'),
            totalEvents: document.getElementById('totalEvents'),
            totalIOCs: document.getElementById('totalIOCs'),
            analysisScore: document.getElementById('analysisScore'),

            // Widgets
            riskGauge: document.getElementById('riskGauge'),
            gaugeFill: document.getElementById('gaugeFill'),
            gaugeValue: document.getElementById('gaugeValue'),
            aiSummary: document.getElementById('aiSummary'),
            aiConfidence: document.getElementById('aiConfidence'),
            topThreats: document.getElementById('topThreats'),
            threatCount: document.getElementById('threatCount'),
            timelineChart: document.getElementById('timelineChart'),

            // Performance metrics
            performanceStatus: document.getElementById('performanceStatus'),
            cpuFill: document.getElementById('cpuFill'),
            cpuValue: document.getElementById('cpuValue'),
            memoryFill: document.getElementById('memoryFill'),
            memoryValue: document.getElementById('memoryValue'),
            speedFill: document.getElementById('speedFill'),
            speedValue: document.getElementById('speedValue'),

            // IOC categories
            iocCategories: document.getElementById('iocCategories'),

            // Detailed content sections
            fileName: document.getElementById('fileNameDetail'),
            fileSize: document.getElementById('fileSizeDetail'),
            fileType: document.getElementById('fileTypeDetail'),
            processingTime: document.getElementById('processingTimeDetail'),
            fileHash: document.getElementById('fileHashDetail'),
            analysisId: document.getElementById('analysisIdDetail'),
            executiveContent: document.getElementById('executiveContentDetail'),
            detailedRiskScore: document.getElementById('detailedRiskScore'),
            detailedRiskLevel: document.getElementById('detailedRiskLevel'),
            riskBreakdown: document.getElementById('riskBreakdown'),
            iocCount: document.getElementById('iocCountBadge'),
            iocList: document.getElementById('iocListDetail'),
            eventCount: document.getElementById('eventCountBadge'),
            eventsList: document.getElementById('eventsListDetail'),
            timelineContainer: document.getElementById('timelineContainerDetail'),
            metadataGrid: document.getElementById('metadataGridDetail'),
            structureAnalysis: document.getElementById('structureAnalysisDetail'),
            entropyAnalysis: document.getElementById('entropyAnalysisDetail'),
            signaturesAnalysis: document.getElementById('signaturesAnalysisDetail'),
            recommendationsContent: document.getElementById('recommendationsContentDetail'),
            threatIntelContent: document.getElementById('threatIntelContentDetail'),

            // Modals
            settingsModal: document.getElementById('settingsModal'),
            helpModal: document.getElementById('helpModal'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingStatus: document.getElementById('loadingStatus'),

            // Action buttons
            generateReportBtn: document.getElementById('generateReportBtn'),
            exportIOCsBtn: document.getElementById('exportIOCsBtn'),
            shareAnalysisBtn: document.getElementById('shareAnalysisBtn'),
            newAnalysisBtn: document.getElementById('newAnalysisBtn')
        };

        console.log('📋 DOM elements initialized');
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        if (this.elements.navTabs) {
            this.elements.navTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const tabId = e.currentTarget.getAttribute('data-tab');
                    if (tabId) {
                        this.switchToTab(tabId);
                    }
                });
            });
        }
    }

    /**
     * Switch to the specified tab
     */
    switchToTab(tabId) {
        // Update active state on tabs
        this.elements.navTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Show the corresponding tab section
        this.elements.tabSections.forEach(section => {
            if (section.getAttribute('id') === `${tabId}Tab`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Update active tab in state
        this.state.activeTab = tabId;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // File upload events
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (this.elements.uploadArea) {
            this.elements.uploadArea.addEventListener('click', () => this.triggerFileInput());
            this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }

        if (this.elements.headerUploadZone) {
            this.elements.headerUploadZone.addEventListener('click', () => this.triggerFileInput());
            this.elements.headerUploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.headerUploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.elements.headerUploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // Navigation events
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showModal('settingsModal'));
        }

        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => this.showModal('helpModal'));
        }

        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Action button events
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

        // Modal events
        this.setupModalEvents();

        // Settings events
        this.setupSettingsEvents();

        // Sidebar section events
        this.setupSidebarEvents();

        // Filter events
        this.setupFilterEvents();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Global drag prevention
        this.preventGlobalDrag();

        console.log('⚡ Event listeners configured');
    }

    /**
     * Setup modal event handlers
     */
    setupModalEvents() {
        // Close modal buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    this.hideModal(modal.id);
                });
            }
        });
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');

            // Focus the modal for accessibility
            const focusableElement = modal.querySelector('button, input, select, textarea');
            if (focusableElement) {
                focusableElement.focus();
            }
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Setup settings event handlers
     */
    setupSettingsEvents() {
        // AI Mode selection
        const aiModeSelect = document.getElementById('aiModeSelect');
        if (aiModeSelect) {
            aiModeSelect.addEventListener('change', (e) => {
                this.settings.aiMode = e.target.value;
                this.saveSettings();
                this.showNotification('AI analysis mode updated', 'success');
            });
        }

        // Analysis depth
        const analysisDepthSelect = document.getElementById('analysisDepthSelect');
        if (analysisDepthSelect) {
            analysisDepthSelect.addEventListener('change', (e) => {
                this.settings.analysisDepth = e.target.value;
                this.saveSettings();
                this.showNotification('Analysis depth updated', 'success');
            });
        }

        // Include timeline toggle
        const includeTimelineToggle = document.getElementById('includeTimelineToggle');
        if (includeTimelineToggle) {
            includeTimelineToggle.addEventListener('change', (e) => {
                this.settings.includeTimeline = e.target.checked;
                this.saveSettings();
            });
        }

        // Theme selection
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.saveSettings();
                this.applyTheme(e.target.value);
            });
        }

        // Auto-collapse toggle
        const autoCollapseToggle = document.getElementById('autoCollapseToggle');
        if (autoCollapseToggle) {
            autoCollapseToggle.addEventListener('change', (e) => {
                this.settings.autoCollapse = e.target.checked;
                this.saveSettings();
            });
        }

        // Animations toggle
        const animationsToggle = document.getElementById('animationsToggle');
        if (animationsToggle) {
            animationsToggle.addEventListener('change', (e) => {
                this.settings.animations = e.target.checked;
                this.saveSettings();
                this.toggleAnimations(e.target.checked);
            });
        }

        // Export format
        const exportFormatSelect = document.getElementById('exportFormatSelect');
        if (exportFormatSelect) {
            exportFormatSelect.addEventListener('change', (e) => {
                this.settings.exportFormat = e.target.value;
                this.saveSettings();
            });
        }

        // Include raw data toggle
        const includeRawDataToggle = document.getElementById('includeRawDataToggle');
        if (includeRawDataToggle) {
            includeRawDataToggle.addEventListener('change', (e) => {
                this.settings.includeRawData = e.target.checked;
                this.saveSettings();
            });
        }

        // Confidence threshold
        const confidenceThreshold = document.getElementById('confidenceThreshold');
        const confidenceValue = document.getElementById('confidenceValue');
        if (confidenceThreshold && confidenceValue) {
            confidenceThreshold.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.settings.confidenceThreshold = value;
                confidenceValue.textContent = Math.round(value * 100) + '%';
                this.saveSettings();
            });
        }

        // Executive summary toggle
        const executiveSummaryToggle = document.getElementById('executiveSummaryToggle');
        if (executiveSummaryToggle) {
            executiveSummaryToggle.addEventListener('change', (e) => {
                this.settings.executiveSummary = e.target.checked;
                this.saveSettings();
            });
        }
    }

    /**
     * Setup sidebar event handlers
     */
    setupSidebarEvents() {
        // Section collapse buttons
        document.querySelectorAll('.section-collapse').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.details-section');
                if (section) {
                    const content = section.querySelector('.section-content');
                    if (content) {
                        const isCollapsed = content.classList.contains('collapsed');

                        if (isCollapsed) {
                            content.classList.remove('collapsed');
                            e.target.classList.remove('collapsed');
                        } else {
                            content.classList.add('collapsed');
                            e.target.classList.add('collapsed');
                        }
                    }
                }
            });
        });

        // Forensics tabs
        document.querySelectorAll('.forensic-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                if (tabName) {
                    this.switchForensicsTab(tabName);
                }
            });
        });

        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                if (tabName) {
                    this.switchSettingsTab(tabName);
                }
            });
        });
    }

    /**
     * Switch forensics tab
     */
    switchForensicsTab(tabName) {
        // Remove active class from all forensic tabs
        document.querySelectorAll('.forensic-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Add active class to clicked tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Show corresponding content
        document.querySelectorAll('.forensic-content').forEach(content => {
            content.classList.remove('active');
        });

        const activeContent = document.getElementById(`${tabName}Content`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }

    /**
     * Switch settings tab
     */
    switchSettingsTab(tabName) {
        // Remove active class from all settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Add active class to clicked tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Show corresponding content
        document.querySelectorAll('.settings-content').forEach(content => {
            content.classList.remove('active');
        });

        const activeContent = document.getElementById(`${tabName}Settings`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }

    /**
     * Setup filter event handlers
     */
    setupFilterEvents() {
        // IOC filters
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterIOCs(filter);

                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Event filters
        const severityFilter = document.getElementById('severityFilterDetail');
        const eventTypeFilter = document.getElementById('eventTypeFilterDetail');

        if (severityFilter) {
            severityFilter.addEventListener('change', (e) => {
                this.filterEvents({ severity: e.target.value });
            });
        }

        if (eventTypeFilter) {
            eventTypeFilter.addEventListener('change', (e) => {
                this.filterEvents({ type: e.target.value });
            });
        }

        // Timeline period buttons
        document.querySelectorAll('.timeline-btn[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.filterTimeline(period);

                // Update active state
                document.querySelectorAll('.timeline-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    /**
     * Filter IOCs by type
     */
    filterIOCs(filter) {
        if (!this.state.currentAnalysis) return;

        const iocs = this.state.currentAnalysis.technical?.detectedIOCs || [];
        let filteredIOCs = iocs;

        if (filter !== 'all') {
            filteredIOCs = iocs.filter(ioc => this.detectIOCType(ioc) === filter);
        }

        this.updateIOCsList(filteredIOCs);
    }

    /**
     * Filter events
     */
    filterEvents(filters) {
        if (!this.state.currentAnalysis) return;

        const events = this.state.currentAnalysis.technical?.securityEvents || [];
        let filteredEvents = events;

        if (filters.severity && filters.severity !== 'all') {
            filteredEvents = filteredEvents.filter(event =>
                (event.severity || 'medium').toLowerCase() === filters.severity
            );
        }

        if (filters.type && filters.type !== 'all') {
            filteredEvents = filteredEvents.filter(event =>
                event.eventType === filters.type
            );
        }

        this.updateEventsList(filteredEvents);
    }

    /**
     * Filter timeline
     */
    filterTimeline(period) {
        if (!this.state.currentAnalysis) return;

        const events = this.state.currentAnalysis.technical?.securityEvents || [];
        const now = new Date();
        let filteredEvents = events;

        if (period !== 'all') {
            const hours = {
                '1h': 1,
                '6h': 6,
                '24h': 24,
                '7d': 168
            }[period] || 24;

            const cutoff = new Date(now.getTime() - (hours * 60 * 60 * 1000));
            filteredEvents = events.filter(event =>
                new Date(event.timestamp) >= cutoff
            );
        }

        this.updateTimelineChart(filteredEvents);
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'o':
                        e.preventDefault();
                        this.triggerFileInput();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showModal('helpModal');
                        break;
                    case ',':
                        e.preventDefault();
                        this.showModal('settingsModal');
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
                    // Tab navigation shortcuts
                    case '1':
                        e.preventDefault();
                        this.switchToTab('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchToTab('details');
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

            // Toggle sidebar with 'Tab' key
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
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('secunik_dashboard_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
            this.applySettings();
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('secunik_dashboard_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    /**
     * Apply loaded settings to UI
     */
    applySettings() {
        // Apply AI mode
        const aiModeSelect = document.getElementById('aiModeSelect');
        if (aiModeSelect) aiModeSelect.value = this.settings.aiMode;

        // Apply analysis depth
        const analysisDepthSelect = document.getElementById('analysisDepthSelect');
        if (analysisDepthSelect) analysisDepthSelect.value = this.settings.analysisDepth;

        // Apply timeline setting
        const includeTimelineToggle = document.getElementById('includeTimelineToggle');
        if (includeTimelineToggle) includeTimelineToggle.checked = this.settings.includeTimeline;

        // Apply theme
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = this.settings.theme;

        // Apply auto-collapse
        const autoCollapseToggle = document.getElementById('autoCollapseToggle');
        if (autoCollapseToggle) autoCollapseToggle.checked = this.settings.autoCollapse;

        // Apply animations setting
        const animationsToggle = document.getElementById('animationsToggle');
        if (animationsToggle) animationsToggle.checked = this.settings.animations;

        // Apply export format
        const exportFormatSelect = document.getElementById('exportFormatSelect');
        if (exportFormatSelect) exportFormatSelect.value = this.settings.exportFormat;

        // Apply raw data setting
        const includeRawDataToggle = document.getElementById('includeRawDataToggle');
        if (includeRawDataToggle) includeRawDataToggle.checked = this.settings.includeRawData;

        // Apply confidence threshold
        const confidenceThreshold = document.getElementById('confidenceThreshold');
        const confidenceValue = document.getElementById('confidenceValue');
        if (confidenceThreshold && confidenceValue) {
            confidenceThreshold.value = this.settings.confidenceThreshold;
            confidenceValue.textContent = Math.round(this.settings.confidenceThreshold * 100) + '%';
        }

        // Apply executive summary setting
        const executiveSummaryToggle = document.getElementById('executiveSummaryToggle');
        if (executiveSummaryToggle) executiveSummaryToggle.checked = this.settings.executiveSummary;

        // Apply theme
        this.applyTheme(this.settings.theme);
        this.toggleAnimations(this.settings.animations);
    }

    /**
     * Load analysis history
     */
    loadAnalysisHistory() {
        try {
            const saved = localStorage.getItem('secunik_analysis_history');
            if (saved) {
                this.state.analysisHistory = JSON.parse(saved);
                this.state.analysisCount = this.state.analysisHistory.length;
                this.updateAnalysisCounter();
            }
        } catch (error) {
            console.warn('Failed to load analysis history:', error);
        }
    }

    /**
     * Save analysis history
     */
    saveAnalysisHistory() {
        try {
            // Only store the last 10 analyses to avoid bloating localStorage
            const historyToSave = this.state.analysisHistory.slice(-10);
            localStorage.setItem('secunik_analysis_history', JSON.stringify(historyToSave));
        } catch (error) {
            console.warn('Failed to save analysis history:', error);
        }
    }

    /**
     * Update analysis counter display
     */
    updateAnalysisCounter() {
        if (this.elements.analysisCounter) {
            this.elements.analysisCounter.textContent = this.state.analysisCount.toString();
        }
    }

    /**
     * Check system health
     */
    async checkSystemHealth() {
        try {
            const response = await fetch(this.config.apiEndpoints.health, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateSystemStatus('online', data);
                console.log('✅ System health check passed:', data);
                return true;
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            this.updateSystemStatus('offline', null);
            console.warn('❌ System health check failed:', error);
            this.showNotification('System connectivity issues detected', 'warning');
            return false;
        }
    }

    /**
     * Update system status display
     */
    updateSystemStatus(status, data) {
        this.state.systemStatus = status;

        if (this.elements.systemStatus) {
            const statusText = this.elements.systemStatus.querySelector('span');
            const statusDot = this.elements.systemStatus.querySelector('.status-dot');

            if (statusText) {
                statusText.textContent = status === 'online' ? 'System Online' : 'System Issues';
            }

            if (statusDot) {
                statusDot.style.background = status === 'online' ? 'var(--text-success)' : 'var(--text-error)';
            }
        }
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        if (!this.settings.animations) return;

        // Start system performance animation
        this.startPerformanceAnimation();

        // Start status indicator pulse
        this.startStatusAnimation();
    }

    /**
     * Start performance metrics animation
     */
    startPerformanceAnimation() {
        setInterval(() => {
            if (!this.state.isAnalyzing) {
                this.updatePerformanceMetrics();
            }
        }, 2000);
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        // Simulate realistic performance metrics
        this.metrics.cpu = Math.floor(Math.random() * 30) + 20; // 20-50%
        this.metrics.memory = Math.floor(Math.random() * 25) + 45; // 45-70%
        this.metrics.analysisSpeed = Math.floor(Math.random() * 500) + 100; // 100-600 KB/s

        this.updatePerformanceDisplay();
    }

    /**
     * Update performance display
     */
    updatePerformanceDisplay() {
        if (this.elements.cpuFill && this.elements.cpuValue) {
            this.elements.cpuFill.style.width = `${this.metrics.cpu}%`;
            this.elements.cpuValue.textContent = `${this.metrics.cpu}%`;
        }

        if (this.elements.memoryFill && this.elements.memoryValue) {
            this.elements.memoryFill.style.width = `${this.metrics.memory}%`;
            this.elements.memoryValue.textContent = `${this.metrics.memory}%`;
        }

        if (this.elements.speedFill && this.elements.speedValue) {
            const speedPercent = Math.min(100, (this.metrics.analysisSpeed / 1000) * 100);
            this.elements.speedFill.style.width = `${speedPercent}%`;
            this.elements.speedValue.textContent = `${this.formatSpeed(this.metrics.analysisSpeed)}`;
        }
    }

    /**
     * Start status indicator animation
     */
    startStatusAnimation() {
        const statusDots = document.querySelectorAll('.status-dot');
        statusDots.forEach(dot => {
            if (this.settings.animations) {
                dot.style.animation = 'pulse 2s infinite';
            }
        });
    }

    /**
     * Setup responsive handlers
     */
    setupResponsiveHandlers() {
        const mediaQuery = window.matchMedia('(max-width: 1024px)');

        const handleResponsive = (e) => {
            if (e.matches) {
                // Mobile/tablet view
                this.state.sidebarOpen = false;
                this.updateSidebarState();
            } else {
                // Desktop view
                this.state.sidebarOpen = true;
                this.updateSidebarState();
            }
        };

        mediaQuery.addListener(handleResponsive);
        handleResponsive(mediaQuery); // Check on init
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        this.state.sidebarOpen = !this.state.sidebarOpen;
        this.updateSidebarState();
    }

    /**
     * Update sidebar state
     */
    updateSidebarState() {
        const sidebar = this.elements.detailsSidebar;
        const main = this.elements.dashboardMain;

        if (sidebar) {
            if (this.state.sidebarOpen) {
                sidebar.classList.remove('collapsed');
            } else {
                sidebar.classList.add('collapsed');
            }
        }

        if (main) {
            if (this.state.sidebarOpen) {
                main.classList.remove('sidebar-collapsed');
            } else {
                main.classList.add('sidebar-collapsed');
            }
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
     * Detect file type from extension
     */
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

    /**
     * Show loading state
     */
    showLoadingState() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.add('show');
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.remove('show');
        }
    }

    /**
     * Show analysis progress
     */
    showAnalysisProgress() {
        if (this.elements.analysisProgress) {
            this.elements.analysisProgress.classList.add('show');
        }
    }

    /**
     * Hide analysis progress
     */
    hideAnalysisProgress() {
        if (this.elements.analysisProgress) {
            this.elements.analysisProgress.classList.remove('show');
        }
    }

    /**
     * Simulate progress during analysis
     */
    simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }

            this.updateProgress(progress);
        }, 500);

        // Store interval reference to clear it if needed
        this.progressInterval = interval;
    }

    /**
     * Update progress display
     */
    updateProgress(percentage) {
        const progress = Math.min(100, Math.max(0, percentage));

        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }

        if (this.elements.progressPercentage) {
            this.elements.progressPercentage.textContent = `${Math.round(progress)}%`;
        }

        // Update progress text based on stage
        if (this.elements.progressText) {
            if (progress < 25) {
                this.elements.progressText.textContent = 'Uploading file...';
            } else if (progress < 50) {
                this.elements.progressText.textContent = 'Analyzing structure...';
            } else if (progress < 75) {
                this.elements.progressText.textContent = 'Detecting threats...';
            } else if (progress < 95) {
                this.elements.progressText.textContent = 'Generating report...';
            } else {
                this.elements.progressText.textContent = 'Finalizing analysis...';
            }
        }
    }

    /**
     * Analyze file using API
     */
    async analyzeFile(file) {
        console.log('🔍 Starting comprehensive analysis for:', file.name);

        try {
            this.showLoadingState();
            this.showAnalysisProgress();
            this.simulateProgress();

            const formData = new FormData();
            formData.append('file', file);
            formData.append('EnableAIAnalysis', this.settings.aiMode !== 'rules-only');
            formData.append('GenerateExecutiveReport', this.settings.executiveSummary);
            formData.append('IncludeTimeline', this.settings.includeTimeline);
            formData.append('AnalysisDepth', this.settings.analysisDepth);

            const response = await fetch(this.config.apiEndpoints.upload, {
                method: 'POST',
                body: formData
            });

            const processingTime = Date.now() - this.metrics.startTime;

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.text();
                    const jsonError = JSON.parse(errorData);
                    errorMessage = jsonError.error || jsonError.message || errorMessage;
                } catch (e) {
                    errorMessage = errorData || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Analysis complete:', result);

            // Clear progress interval
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
            }

            // Ensure progress shows 100%
            this.updateProgress(100);

            // Process and display results
            await this.processAnalysisResults(result, processingTime);

            this.hideLoadingState();
            this.hideAnalysisProgress();
            this.showNotification('Analysis completed successfully!', 'success');

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
    }

    /**
     * Generate unique analysis ID
     */
    generateAnalysisId() {
        return 'AN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Show welcome state
     */
    showWelcomeState() {
        if (this.elements.welcomeState) {
            this.elements.welcomeState.classList.remove('hidden');
        }
        if (this.elements.analysisDashboard) {
            this.elements.analysisDashboard.classList.add('hidden');
        }
    }

    /**
     * Show analysis state
     */
    showAnalysisState() {
        if (this.elements.welcomeState) {
            this.elements.welcomeState.classList.add('hidden');
        }
        if (this.elements.analysisDashboard) {
            this.elements.analysisDashboard.classList.remove('hidden');
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

        // Update performance metrics with analysis data
        this.updateAnalysisPerformanceMetrics(analysis.processingTime);

        // Update IOC categories
        this.updateIOCCategories(iocs);
    }

    /**
     * Update all tabs with analysis data
     */
    async updateAllTabs(analysis) {
        // Update details tab
        this.updateDetailsTab(analysis);

        // Update executive tab
        this.updateExecutiveTab(analysis);

        // Update risk tab
        this.updateRiskTab(analysis);

        // Update IOCs tab
        this.updateIOCsTab(analysis);

        // Update events tab
        this.updateEventsTab(analysis);

        // Update forensics tab
        this.updateForensicsTab(analysis);
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
        const percentage = (riskScore / 10) * 100;

        if (this.elements.gaugeFill) {
            this.elements.gaugeFill.style.width = `${percentage}%`;

            // Update color based on risk level
            if (riskScore >= 8) {
                this.elements.gaugeFill.style.background = '#dc2626'; // Critical - Red
            } else if (riskScore >= 6) {
                this.elements.gaugeFill.style.background = '#ea580c'; // High - Orange
            } else if (riskScore >= 4) {
                this.elements.gaugeFill.style.background = '#d97706'; // Medium - Amber
            } else if (riskScore >= 2) {
                this.elements.gaugeFill.style.background = '#65a30d'; // Low - Yellow-green
            } else {
                this.elements.gaugeFill.style.background = '#16a34a'; // Minimal - Green
            }
        }

        if (this.elements.gaugeValue) {
            this.elements.gaugeValue.textContent = `${riskScore}/10`;
        }
    }

    /**
     * Update AI summary
     */
    updateAISummary(data) {
        if (this.elements.aiSummary) {
            const summaryHTML = this.generateAISummary(data.ai) || this.generateBasicSummary(data);
            this.elements.aiSummary.innerHTML = summaryHTML;
        }

        if (this.elements.aiConfidence && data.ai && data.ai.severityScore) {
            const confidence = Math.round(data.ai.severityScore * 100);
            this.elements.aiConfidence.textContent = `${confidence}%`;
        }
    }

    /**
     * Update top threats
     */
    updateTopThreats(events) {
        const threats = this.extractTopThreats(events);

        if (this.elements.threatCount) {
            this.elements.threatCount.textContent = threats.length.toString();
        }

        if (this.elements.topThreats) {
            if (threats.length === 0) {
                this.elements.topThreats.innerHTML = '<p class="no-threats">No significant threats detected</p>';
            } else {
                const threatsHTML = threats.slice(0, 5).map(threat => `
                    <div class="threat-item ${threat.severity.toLowerCase()}">
                        <div class="threat-icon">${this.getThreatIcon(threat.type)}</div>
                        <div class="threat-info">
                            <div class="threat-title">${threat.title}</div>
                            <div class="threat-severity">${threat.severity}</div>
                        </div>
                    </div>
                `).join('');

                this.elements.topThreats.innerHTML = threatsHTML;
            }
        }
    }

    /**
     * Update timeline chart
     */
    updateTimelineChart(events) {
        if (this.elements.timelineChart) {
            const timelineHTML = this.generateTimelineChart(events);
            this.elements.timelineChart.innerHTML = timelineHTML;
        }
    }

    /**
     * Update analysis performance metrics
     */
    updateAnalysisPerformanceMetrics(processingTime) {
        // Calculate metrics based on analysis
        this.metrics.cpu = this.calculateCPUUsage(processingTime);
        this.metrics.memory = this.calculateMemoryUsage();
        this.metrics.analysisSpeed = this.calculateAnalysisSpeed(processingTime);

        this.updatePerformanceDisplay();
    }

    /**
     * Update IOC categories
     */
    updateIOCCategories(iocs) {
        if (this.elements.iocCategories) {
            const categories = this.categorizeIOCs(iocs);
            const categoriesHTML = Object.entries(categories)
                .filter(([_, count]) => count > 0)
                .map(([category, count]) => `
                    <div class="ioc-category">
                        <span class="category-name">${this.formatCategoryName(category)}</span>
                        <span class="category-count">${count}</span>
                    </div>
                `).join('');

            this.elements.iocCategories.innerHTML = categoriesHTML || '<p>No IOCs detected</p>';
        }
    }

    /**
     * Update details tab
     */
    updateDetailsTab(analysis) {
        const { result, fileInfo, processingTime, analysisId } = analysis;

        // File information
        if (this.elements.fileName) this.elements.fileName.textContent = fileInfo.name;
        if (this.elements.fileSize) this.elements.fileSize.textContent = this.formatFileSize(fileInfo.size);
        if (this.elements.fileType) this.elements.fileType.textContent = fileInfo.type;
        if (this.elements.processingTime) this.elements.processingTime.textContent = this.formatDuration(processingTime);
        if (this.elements.analysisId) this.elements.analysisId.textContent = analysisId;

        // File hash if available
        if (this.elements.fileHash && result.technical?.metadata?.hash) {
            this.elements.fileHash.textContent = result.technical.metadata.hash;
        }
    }

    /**
     * Update executive tab
     */
    updateExecutiveTab(analysis) {
        if (this.elements.executiveContent) {
            const executiveHTML = this.generateExecutiveHTML(
                analysis.result.executive,
                analysis.result.ai
            );
            this.elements.executiveContent.innerHTML = executiveHTML;
        }
    }

    /**
     * Update risk tab
     */
    updateRiskTab(analysis) {
        const riskScore = this.calculateRiskScore(analysis.result);
        const riskLevel = this.getRiskLevel(riskScore);

        if (this.elements.detailedRiskScore) {
            this.elements.detailedRiskScore.textContent = `${riskScore}/10`;
        }

        if (this.elements.detailedRiskLevel) {
            this.elements.detailedRiskLevel.textContent = riskLevel;
            this.elements.detailedRiskLevel.className = `risk-level ${riskLevel.toLowerCase()}`;
        }

        if (this.elements.riskBreakdown) {
            const breakdownHTML = this.generateRiskBreakdown(analysis.result);
            this.elements.riskBreakdown.innerHTML = breakdownHTML;
        }
    }

    /**
     * Update IOCs tab
     */
    updateIOCsTab(analysis) {
        const iocs = analysis.result.technical?.detectedIOCs || [];

        if (this.elements.iocCount) {
            this.elements.iocCount.textContent = iocs.length.toString();
        }

        this.updateIOCsList(iocs);
    }

    /**
     * Update IOCs list
     */
    updateIOCsList(iocs) {
        if (this.elements.iocList) {
            if (iocs.length === 0) {
                this.elements.iocList.innerHTML = '<p class="no-iocs">No IOCs detected</p>';
            } else {
                const iocsHTML = iocs.map(ioc => {
                    const type = this.detectIOCType(ioc);
                    return `
                        <div class="ioc-item">
                            <div class="ioc-value">${ioc}</div>
                            <div class="ioc-type">${this.formatCategoryName(type)}</div>
                        </div>
                    `;
                }).join('');

                this.elements.iocList.innerHTML = iocsHTML;
            }
        }
    }

    /**
     * Update events tab
     */
    updateEventsTab(analysis) {
        const events = analysis.result.technical?.securityEvents || [];

        if (this.elements.eventCount) {
            this.elements.eventCount.textContent = events.length.toString();
        }

        this.updateEventsList(events);
    }

    /**
     * Update events list
     */
    updateEventsList(events) {
        if (this.elements.eventsList) {
            if (events.length === 0) {
                this.elements.eventsList.innerHTML = '<p class="no-events">No security events detected</p>';
            } else {
                const eventsHTML = events.map(event => `
                    <div class="event-item ${(event.severity || 'medium').toLowerCase()}">
                        <div class="event-header">
                            <span class="event-title">${event.event || event.eventType || 'Security Event'}</span>
                            <span class="event-severity">${event.severity || 'Medium'}</span>
                        </div>
                        ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                        <div class="event-meta">
                            <span class="event-time">${this.formatTimestamp(event.timestamp)}</span>
                            ${event.source ? `<span class="event-source">${event.source}</span>` : ''}
                        </div>
                    </div>
                `).join('');

                this.elements.eventsList.innerHTML = eventsHTML;
            }
        }
    }

    /**
     * Update forensics tab
     */
    updateForensicsTab(analysis) {
        const { result } = analysis;

        // Update metadata
        if (this.elements.metadataGrid) {
            const metadataHTML = this.generateMetadataGrid(
                result.technical?.metadata,
                analysis.fileInfo
            );
            this.elements.metadataGrid.innerHTML = metadataHTML;
        }

        // Update structure analysis
        if (this.elements.structureAnalysis) {
            const structureHTML = this.generateStructureAnalysis(result);
            this.elements.structureAnalysis.innerHTML = structureHTML;
        }

        // Update entropy analysis
        if (this.elements.entropyAnalysis) {
            const entropyHTML = this.generateEntropyAnalysis(result);
            this.elements.entropyAnalysis.innerHTML = entropyHTML;
        }

        // Update signatures analysis
        if (this.elements.signaturesAnalysis) {
            const signaturesHTML = this.generateSignaturesAnalysis(result);
            this.elements.signaturesAnalysis.innerHTML = signaturesHTML;
        }

        // Update recommendations
        if (this.elements.recommendationsContent) {
            const recommendations = result.ai?.recommendedActions ||
                result.executive?.recommendations ||
                this.generateBasicRecommendations(result);

            const recommendationsHTML = `
                <ul>
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            `;
            this.elements.recommendationsContent.innerHTML = recommendationsHTML;
        }

        // Update threat intelligence
        if (this.elements.threatIntelContent) {
            const events = result.technical?.securityEvents || [];
            const threatIntel = this.generateThreatIntelligence(events);

            if (threatIntel.length === 0) {
                this.elements.threatIntelContent.innerHTML = '<p>No threat intelligence available.</p>';
            } else {
                const intelHTML = threatIntel.map(intel => `
                    <div class="threat-intel-item">
                        <div class="intel-header">
                            <span class="intel-type">${intel.type}</span>
                            <span class="intel-confidence">${intel.confidence}% confidence</span>
                        </div>
                        <div class="intel-description">${intel.description}</div>
                        <div class="intel-source">${intel.source}</div>
                    </div>
                `).join('');

                this.elements.threatIntelContent.innerHTML = intelHTML;
            }
        }
    }

    /**
     * Action handlers
     */
    async generateReport() {
        if (!this.state.currentAnalysis) {
            this.showNotification('No analysis data available for report generation', 'warning');
            return;
        }

        try {
            const reportData = this.prepareReportData(this.state.currentAnalysis);
            const reportBlob = this.generateReportBlob(reportData);
            const filename = `SecuNik_Report_${this.state.currentAnalysis.analysisId}.${this.settings.exportFormat}`;
            this.downloadFile(reportBlob, filename);
            this.showNotification('Report generated successfully!', 'success');
        } catch (error) {
            console.error('Report generation failed:', error);
            this.showNotification('Failed to generate report: ' + error.message, 'error');
        }
    }

    async exportIOCs() {
        if (!this.state.currentAnalysis) {
            this.showNotification('No analysis data available for IOC export', 'warning');
            return;
        }

        const iocs = this.state.currentAnalysis.result.technical?.detectedIOCs || [];

        if (iocs.length === 0) {
            this.showNotification('No IOCs found to export', 'warning');
            return;
        }

        try {
            const iocData = this.prepareIOCData(iocs);
            const iocBlob = new Blob([JSON.stringify(iocData, null, 2)], { type: 'application/json' });

            const filename = `SecuNik_IOCs_${this.state.currentAnalysis.analysisId}.json`;
            this.downloadFile(iocBlob, filename);

            this.showNotification(`Exported ${iocs.length} IOCs successfully!`, 'success');
        } catch (error) {
            console.error('IOC export failed:', error);
            this.showNotification('Failed to export IOCs: ' + error.message, 'error');
        }
    }

    async shareAnalysis() {
        if (!this.state.currentAnalysis) {
            this.showNotification('No analysis data available for sharing', 'warning');
            return;
        }

        try {
            const shareData = {
                analysisId: this.state.currentAnalysis.analysisId,
                riskScore: this.calculateRiskScore(this.state.currentAnalysis.result),
                summary: {
                    eventCount: this.state.currentAnalysis.result.technical?.securityEvents?.length || 0,
                    iocCount: this.state.currentAnalysis.result.technical?.detectedIOCs?.length || 0
                }
            };

            const shareUrl = this.generateShareUrl(shareData);

            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);

            this.showNotification('Share URL copied to clipboard!', 'success');
        } catch (error) {
            console.error('Share failed:', error);
            this.showNotification('Failed to generate share URL: ' + error.message, 'error');
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

        // Show welcome state
        this.showWelcomeState();

        // Switch to dashboard tab
        this.switchToTab('dashboard');

        this.showNotification('Ready for new analysis', 'info');
    }

    /**
     * Utility methods
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
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

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    /**
     * Calculate analysis score from data
     */
    calculateAnalysisScore(data) {
        // Use AI-provided score if available
        if (data.ai && typeof data.ai.severityScore === 'number') {
            return Math.round(data.ai.severityScore * 10);
        }

        // Otherwise calculate from events
        const events = data.technical?.securityEvents || [];
        if (events.length === 0) return 0;

        // Calculate based on event severity
        const severityWeights = {
            'critical': 10,
            'high': 7,
            'medium': 4,
            'low': 1,
            'info': 0
        };

        const totalWeight = events.reduce((sum, event) => {
            const severity = (event.severity || 'medium').toLowerCase();
            return sum + (severityWeights[severity] || 4);
        }, 0);

        // Normalize to a score out of 100
        const normalizedScore = Math.min(100, Math.round((totalWeight / events.length) * 10));
        return normalizedScore;
    }

    /**
     * Calculate risk score from data
     */
    calculateRiskScore(data) {
        // Use AI-provided score if available
        if (data.ai && typeof data.ai.severityScore === 'number') {
            return Math.round(data.ai.severityScore * 10);
        }

        // Calculate based on events and IOCs
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        if (events.length === 0 && iocs.length === 0) return 0;

        // Severity distribution
        const severityCounts = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        };

        // Count severity levels
        events.forEach(event => {
            const severity = (event.severity || 'medium').toLowerCase();
            if (severityCounts[severity] !== undefined) {
                severityCounts[severity]++;
            }
        });

        // Calculate risk score (0-10)
        let score = 0;

        // Weight by severity
        score += severityCounts.critical * 2.5;
        score += severityCounts.high * 1.0;
        score += severityCounts.medium * 0.5;
        score += severityCounts.low * 0.1;

        // Add points for IOCs
        score += Math.min(2.5, iocs.length * 0.25);

        // Cap at 10
        return Math.min(10, Math.round(score));
    }

    /**
     * Get risk level description based on score
     */
    getRiskLevel(score) {
        if (score >= 8) return 'Critical';
        if (score >= 6) return 'High';
        if (score >= 4) return 'Medium';
        if (score >= 2) return 'Low';
        return 'Minimal';
    }

    /**
     * Calculate simulated CPU usage
     */
    calculateCPUUsage(processingTime) {
        // Simulate CPU usage based on processing time
        const baseCPU = 35; // Base CPU usage
        const timeFactor = Math.min(20, processingTime / 1000); // Cap at 20 seconds

        // Calculate based on time (longer time = higher usage)
        return Math.min(95, Math.round(baseCPU + timeFactor * 3));
    }

    /**
     * Calculate simulated memory usage
     */
    calculateMemoryUsage() {
        // Simulate memory usage based on file size and current analysis
        const baseMemory = 45; // Base memory usage

        if (!this.state.currentFile) return baseMemory;

        const sizeFactor = Math.min(30, this.state.currentFile.size / (1024 * 1024 * 10)); // Cap at 10MB

        // Calculate based on file size
        return Math.min(95, Math.round(baseMemory + sizeFactor * 1.5));
    }

    /**
     * Calculate analysis speed
     */
    calculateAnalysisSpeed(processingTime) {
        if (!this.state.currentFile || processingTime === 0) return 0;

        // Calculate events per second
        const fileSize = this.state.currentFile.size / 1024; // KB
        const timeInSeconds = processingTime / 1000;

        return Math.round(fileSize / timeInSeconds);
    }

    /**
     * Extract top threats from events
     */
    extractTopThreats(events) {
        if (!events || events.length === 0) return [];

        // Filter critical and high severity events
        const threats = events
            .filter(event =>
                (event.severity || '').toLowerCase() === 'critical' ||
                (event.severity || '').toLowerCase() === 'high'
            )
            .map(event => ({
                title: event.event || event.eventType || 'Security Event',
                severity: event.severity || 'High',
                type: event.eventType || 'unknown',
                timestamp: event.timestamp
            }));

        // Sort by severity (critical first)
        threats.sort((a, b) => {
            if (a.severity.toLowerCase() === 'critical' && b.severity.toLowerCase() !== 'critical') return -1;
            if (a.severity.toLowerCase() !== 'critical' && b.severity.toLowerCase() === 'critical') return 1;
            return 0;
        });

        return threats;
    }

    /**
     * Categorize IOCs by type
     */
    categorizeIOCs(iocs) {
        if (!iocs || iocs.length === 0) return {};

        const categories = {
            ip: 0,
            domain: 0,
            url: 0,
            email: 0,
            hash: 0,
            file: 0,
            other: 0
        };

        iocs.forEach(ioc => {
            const type = this.detectIOCType(ioc);
            if (categories[type] !== undefined) {
                categories[type]++;
            } else {
                categories.other++;
            }
        });

        return categories;
    }

    /**
     * Detect IOC type from value
     */
    detectIOCType(value) {
        if (!value) return 'other';

        // IP address
        if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)) {
            return 'ip';
        }

        // Domain
        if (/^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+$/.test(value)) {
            return 'domain';
        }

        // URL
        if (/^https?:\/\//.test(value)) {
            return 'url';
        }

        // Email
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            return 'email';
        }

        // Hash (MD5, SHA1, SHA256)
        if (/^[a-fA-F0-9]{32}$/.test(value) || /^[a-fA-F0-9]{40}$/.test(value) || /^[a-fA-F0-9]{64}$/.test(value)) {
            return 'hash';
        }

        // Filename or path
        if (/\.(exe|dll|sys|bat|ps1|vbs|js)$/i.test(value)) {
            return 'file';
        }

        return 'other';
    }

    /**
     * Format category name for display
     */
    formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    /**
     * Build timeline from security events
     */
    buildTimelineFromEvents(events) {
        if (!events || events.length === 0) return [];

        return events.map(event => ({
            timestamp: event.timestamp || new Date().toISOString(),
            event: event.event || event.eventType || 'Security Event',
            source: event.source || 'System',
            severity: event.severity || 'Medium'
        }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Generate threat icon based on type
     */
    getThreatIcon(type) {
        const icons = {
            'malware': '🦠',
            'intrusion': '🔓',
            'reconnaissance': '🔍',
            'unauthorized': '⚠️',
            'network': '🌐',
            'data': '📊',
            'authentication': '🔑',
            'privilege': '👑',
            'exploit': '💥',
            'phishing': '🎣'
        };

        return icons[type] || '⚠️';
    }

    /**
     * Generate HTML for the timeline chart
     */
    generateTimelineChart(events) {
        if (!events || events.length === 0) {
            return '<p class="no-timeline">No timeline data available</p>';
        }

        // Sort events by timestamp
        const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Get time range
        const firstTime = new Date(sortedEvents[0].timestamp);
        const lastTime = new Date(sortedEvents[sortedEvents.length - 1].timestamp);

        // If all events are within a short time window, extend the range
        if (lastTime - firstTime < 5000) {
            lastTime.setSeconds(lastTime.getSeconds() + 30);
        }

        // Create chart HTML
        let html = `<div class="timeline-chart-container">`;

        // Add time scale
        html += `<div class="timeline-scale">
                    <span class="timeline-start">${this.formatTime(firstTime)}</span>
                    <span class="timeline-end">${this.formatTime(lastTime)}</span>
                </div>`;

        // Add events markers
        html += `<div class="timeline-markers">`;

        sortedEvents.forEach(event => {
            const timestamp = new Date(event.timestamp);
            const position = ((timestamp - firstTime) / (lastTime - firstTime)) * 100;
            const severity = event.severity || 'medium';

            html += `<div class="timeline-marker ${severity.toLowerCase()}" 
                         style="left: ${position}%" 
                         title="${event.event}: ${this.formatTimestamp(event.timestamp)}">
                     </div>`;
        });

        html += `</div></div>`;

        return html;
    }

    /**
     * Generate AI summary HTML
     */
    generateAISummary(aiData) {
        if (!aiData) return null;

        let html = '';

        if (aiData.summary) {
            html += `<p>${aiData.summary}</p>`;
        }

        if (aiData.attackVector) {
            html += `<p><strong>Attack Vector:</strong> ${aiData.attackVector}</p>`;
        }

        if (aiData.severityScore) {
            html += `<p><strong>Severity:</strong> ${this.getRiskLevel(aiData.severityScore * 10)}</p>`;
        }

        return html || null;
    }

    /**
     * Generate basic summary when AI is not available
     */
    generateBasicSummary(data) {
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        const criticalEvents = events.filter(e =>
            (e.severity || '').toLowerCase() === 'critical'
        ).length;

        const highEvents = events.filter(e =>
            (e.severity || '').toLowerCase() === 'high'
        ).length;

        let html = '';

        if (events.length === 0 && iocs.length === 0) {
            html = '<p>No significant security issues detected in this file.</p>';
        } else {
            html = `<p>Analysis detected ${events.length} security events`;

            if (criticalEvents > 0 || highEvents > 0) {
                const threats = [];
                if (criticalEvents > 0) threats.push(`${criticalEvents} critical`);
                if (highEvents > 0) threats.push(`${highEvents} high severity`);

                html += ` including ${threats.join(' and ')} threats`;
            }

            if (iocs.length > 0) {
                html += ` and ${iocs.length} indicators of compromise`;
            }

            html += '.</p>';
        }

        const riskScore = this.calculateRiskScore(data);
        const riskLevel = this.getRiskLevel(riskScore);

        html += `<p><strong>Risk Level:</strong> ${riskLevel}</p>`;

        return html;
    }

    /**
     * Generate executive summary HTML
     */
    generateExecutiveHTML(executive, aiData) {
        if (!executive) return this.generateBasicExecutiveHTML({ ai: aiData });

        let html = '';

        if (executive.summary) {
            html += `<div class="executive-summary">
                        <h3>Executive Summary</h3>
                        <p>${executive.summary}</p>
                    </div>`;
        }

        if (executive.findings && executive.findings.length > 0) {
            html += `<div class="executive-findings">
                        <h3>Key Findings</h3>
                        <ul>`;

            executive.findings.forEach(finding => {
                html += `<li>${finding}</li>`;
            });

            html += `</ul>
                    </div>`;
        }

        if (executive.businessImpact) {
            html += `<div class="executive-impact">
                        <h3>Business Impact</h3>
                        <p>${executive.businessImpact}</p>
                    </div>`;
        }

        if (executive.recommendations && executive.recommendations.length > 0) {
            html += `<div class="executive-recommendations">
                        <h3>Recommendations</h3>
                        <ul>`;

            executive.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });

            html += `</ul>
                    </div>`;
        }

        return html;
    }

    /**
     * Generate basic executive summary when AI is not available
     */
    generateBasicExecutiveHTML(data) {
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        const riskScore = this.calculateRiskScore(data);
        const riskLevel = this.getRiskLevel(riskScore);

        let html = `<div class="executive-summary">
                        <h3>Executive Summary</h3>
                        <p>Security analysis of the provided file has been completed with a risk score of <strong>${riskScore}/10</strong> (${riskLevel} Risk).</p>`;

        if (events.length > 0 || iocs.length > 0) {
            html += `<p>The analysis identified ${events.length} security events and ${iocs.length} indicators of compromise.</p>`;
        } else {
            html += `<p>No significant security issues were detected in this file.</p>`;
        }

        html += `</div>`;

        // Add generic recommendations
        html += `<div class="executive-recommendations">
                    <h3>Recommendations</h3>
                    <ul>
                        <li>Review the detailed findings in the security assessment.</li>
                        <li>Validate any detected indicators of compromise against your environment.</li>
                        <li>Follow security best practices for handling similar files.</li>
                    </ul>
                </div>`;

        return html;
    }

    /**
     * Generate risk breakdown HTML
     */
    generateRiskBreakdown(data) {
        const events = data.technical?.securityEvents || [];
        const categories = {};

        // Count events by type
        events.forEach(event => {
            const type = event.eventType || 'Unknown';
            const severity = (event.severity || 'medium').toLowerCase();

            if (!categories[type]) {
                categories[type] = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
            }

            categories[type][severity]++;
            categories[type].total++;
        });

        if (Object.keys(categories).length === 0) {
            return '<p>No risk categories identified.</p>';
        }

        let html = `<div class="risk-breakdown-chart">`;

        // Sort categories by total events
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1].total - a[1].total);

        sortedCategories.forEach(([category, counts]) => {
            const total = counts.total;
            const percentCritical = Math.round((counts.critical / total) * 100) || 0;
            const percentHigh = Math.round((counts.high / total) * 100) || 0;
            const percentMedium = Math.round((counts.medium / total) * 100) || 0;
            const percentLow = Math.round((counts.low / total) * 100) || 0;

            html += `
                <div class="risk-category">
                    <div class="category-name">${category}</div>
                    <div class="category-bar">
                        <div class="bar-critical" style="width: ${percentCritical}%"></div>
                        <div class="bar-high" style="width: ${percentHigh}%"></div>
                        <div class="bar-medium" style="width: ${percentMedium}%"></div>
                        <div class="bar-low" style="width: ${percentLow}%"></div>
                    </div>
                    <div class="category-count">${total}</div>
                </div>
            `;
        });

        html += `</div>
                <div class="risk-legend">
                    <div class="legend-item"><span class="legend-color critical"></span> Critical</div>
                    <div class="legend-item"><span class="legend-color high"></span> High</div>
                    <div class="legend-item"><span class="legend-color medium"></span> Medium</div>
                    <div class="legend-item"><span class="legend-color low"></span> Low</div>
                </div>`;

        return html;
    }

    /**
     * Generate metadata grid HTML
     */
    generateMetadataGrid(metadata, fileInfo) {
        if (!metadata && !fileInfo) return '<p>No metadata available.</p>';

        const items = [];

        // File info
        if (fileInfo) {
            items.push({ label: 'File Name', value: fileInfo.name });
            items.push({ label: 'File Size', value: this.formatFileSize(fileInfo.size) });
            items.push({ label: 'File Type', value: fileInfo.type });
            items.push({ label: 'Last Modified', value: fileInfo.lastModified ? new Date(fileInfo.lastModified).toLocaleString() : 'Unknown' });
        }

        // Metadata
        if (metadata) {
            if (metadata.hash) items.push({ label: 'File Hash', value: metadata.hash });
            if (metadata.created) items.push({ label: 'Created', value: new Date(metadata.created).toLocaleString() });
            if (metadata.modified) items.push({ label: 'Modified', value: new Date(metadata.modified).toLocaleString() });
            if (metadata.accessed) items.push({ label: 'Accessed', value: new Date(metadata.accessed).toLocaleString() });
            if (metadata.owner) items.push({ label: 'Owner', value: metadata.owner });
            if (metadata.format) items.push({ label: 'Format', value: metadata.format });
            if (metadata.version) items.push({ label: 'Version', value: metadata.version });

            // Add all other metadata
            Object.entries(metadata)
                .filter(([key]) => !['hash', 'created', 'modified', 'accessed', 'owner', 'format', 'version'].includes(key))
                .forEach(([key, value]) => {
                    items.push({
                        label: key.charAt(0).toUpperCase() + key.slice(1),
                        value: typeof value === 'object' ? JSON.stringify(value) : value
                    });
                });
        }

        if (items.length === 0) {
            return '<p>No metadata available.</p>';
        }

        return `
            <div class="metadata-grid">
                ${items.map(item => `
                    <div class="metadata-item">
                        <div class="metadata-label">${item.label}</div>
                        <div class="metadata-value">${item.value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate structure analysis HTML
     */
    generateStructureAnalysis(data) {
        const structure = data.technical?.structure;

        if (!structure) return '<p>No structure analysis available.</p>';

        let html = '';

        if (structure.format) {
            html += `<p><strong>File Format:</strong> ${structure.format}</p>`;
        }

        if (structure.sections && structure.sections.length > 0) {
            html += `<h4>File Sections</h4>
                    <div class="structure-sections">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Offset</th>
                                </tr>
                            </thead>
                            <tbody>`;

            structure.sections.forEach(section => {
                html += `
                    <tr>
                        <td>${section.name}</td>
                        <td>${this.formatFileSize(section.size)}</td>
                        <td>0x${section.offset.toString(16).toUpperCase()}</td>
                    </tr>
                `;
            });

            html += `
                            </tbody>
                        </table>
                    </div>`;
        }

        if (structure.headers) {
            html += `<h4>Headers</h4>
                    <div class="structure-headers">`;

            Object.entries(structure.headers).forEach(([key, value]) => {
                html += `<div class="header-item">
                            <span class="header-key">${key}:</span>
                            <span class="header-value">${value}</span>
                        </div>`;
            });

            html += `</div>`;
        }

        return html || '<p>No structure analysis available.</p>';
    }

    /**
     * Generate entropy analysis HTML
     */
    generateEntropyAnalysis(data) {
        const entropy = data.technical?.entropy;

        if (!entropy) return '<p>No entropy analysis available.</p>';

        let html = '';

        if (entropy.overall) {
            const value = parseFloat(entropy.overall).toFixed(2);
            const percentage = Math.min(100, Math.round(value / 8 * 100));

            html += `
                <div class="entropy-overall">
                    <h4>Overall Entropy: ${value}/8</h4>
                    <div class="entropy-bar">
                        <div class="entropy-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="entropy-scale">
                        <span>0 (Predictable)</span>
                        <span>8 (Random)</span>
                    </div>
                </div>
            `;
        }

        if (entropy.sections && entropy.sections.length > 0) {
            html += `
                <h4>Entropy by Section</h4>
                <div class="entropy-sections">
                    ${entropy.sections.map(section => {
                const value = parseFloat(section.entropy).toFixed(2);
                const percentage = Math.min(100, Math.round(value / 8 * 100));

                return `
                            <div class="section-entropy">
                                <div class="section-name">${section.name}</div>
                                <div class="section-bar">
                                    <div class="section-fill" style="width: ${percentage}%" 
                                        title="${value}/8"></div>
                                </div>
                                <div class="section-value">${value}</div>
                            </div>
                        `;
            }).join('')}
                </div>
            `;
        }

        if (entropy.anomalies && entropy.anomalies.length > 0) {
            html += `
                <h4>Entropy Anomalies</h4>
                <ul class="entropy-anomalies">
                    ${entropy.anomalies.map(anomaly => `<li>${anomaly}</li>`).join('')}
                </ul>
            `;
        }

        return html || '<p>No entropy analysis available.</p>';
    }

    /**
     * Generate signatures analysis HTML
     */
    generateSignaturesAnalysis(data) {
        const signatures = data.technical?.signatures;

        if (!signatures || !signatures.length) return '<p>No signatures detected in this file.</p>';

        return `
            <div class="signatures-list">
                ${signatures.map(sig => `
                    <div class="signature-item ${(sig.severity || 'medium').toLowerCase()}">
                        <div class="signature-header">
                            <span class="signature-name">${sig.name}</span>
                            <span class="signature-severity">${sig.severity || 'Medium'}</span>
                        </div>
                        <div class="signature-description">${sig.description || 'No description available'}</div>
                        ${sig.matches ? `
                            <div class="signature-matches">
                                <span>Matches: ${sig.matches}</span>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate basic recommendations
     */
    generateBasicRecommendations(data) {
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        const recommendations = [];

        // Add default recommendations
        recommendations.push('Ensure your security software is up to date');

        if (events.some(e => (e.severity || '').toLowerCase() === 'critical')) {
            recommendations.push('Investigate critical security events immediately');
        }

        if (iocs.length > 0) {
            recommendations.push('Block detected indicators of compromise in security tools');
        }

        if (events.some(e => e.eventType === 'malware' || e.eventType === 'virus')) {
            recommendations.push('Run a full system scan to detect any malware presence');
        }

        if (events.some(e => e.eventType === 'network' || e.eventType === 'connection')) {
            recommendations.push('Review network connections and firewall rules');
        }

        // Add more generic recommendations
        recommendations.push('Document findings and maintain an incident response log');
        recommendations.push('Consider implementing additional security monitoring');

        return recommendations;
    }

    /**
     * Generate threat intelligence
     */
    generateThreatIntelligence(events) {
        if (!events || events.length === 0) return [];

        const threatIntel = [];

        // Extract critical and high events
        const significantEvents = events.filter(e =>
            (e.severity || '').toLowerCase() === 'critical' ||
            (e.severity || '').toLowerCase() === 'high'
        );

        if (significantEvents.length === 0) return [];

        // Generate threat intel items from significant events
        significantEvents.forEach(event => {
            // Only generate for events with enough context
            if (!event.eventType) return;

            const confidence = event.severity === 'critical' ? 85 : 70;

            threatIntel.push({
                type: this.getThreatIntelType(event.eventType),
                confidence,
                description: this.generateThreatIntelDescription(event),
                source: 'SecuNik Threat Intelligence'
            });
        });

        // Remove duplicates by combining similar items
        const uniqueIntel = [];
        const seen = new Set();

        threatIntel.forEach(intel => {
            const key = `${intel.type}:${intel.description}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueIntel.push(intel);
            }
        });

        return uniqueIntel;
    }

    /**
     * Get threat intelligence type
     */
    getThreatIntelType(eventType) {
        const typeMap = {
            'malware': 'Malware Detection',
            'virus': 'Malware Detection',
            'ransomware': 'Ransomware Indicator',
            'trojan': 'Malware Detection',
            'spyware': 'Malware Detection',
            'backdoor': 'Backdoor Activity',
            'exploit': 'Exploit Attempt',
            'intrusion': 'Intrusion Detection',
            'bruteforce': 'Brute Force Attack',
            'ddos': 'DDoS Activity',
            'scanning': 'Reconnaissance',
            'phishing': 'Phishing Attempt',
            'command': 'Command & Control',
            'network': 'Suspicious Network Activity',
            'authentication': 'Authentication Attack',
            'privilege': 'Privilege Escalation',
            'data': 'Data Exfiltration'
        };

        return typeMap[eventType] || 'Security Threat';
    }

    /**
     * Generate threat intelligence description
     */
    generateThreatIntelDescription(event) {
        const baseDescription = event.description || `Detected ${event.eventType} activity`;
        return baseDescription;
    }

    /**
     * Prepare report data
     */
    prepareReportData(analysis) {
        // Create a sanitized version with only necessary data
        const reportData = {
            analysisId: analysis.analysisId,
            timestamp: analysis.timestamp,
            fileInfo: {
                name: analysis.fileInfo.name,
                size: analysis.fileInfo.size,
                type: analysis.fileInfo.type
            },
            processingTime: analysis.processingTime,
            summary: {
                riskScore: this.calculateRiskScore(analysis.result),
                riskLevel: this.getRiskLevel(this.calculateRiskScore(analysis.result)),
                eventCount: analysis.result.technical?.securityEvents?.length || 0,
                iocCount: analysis.result.technical?.detectedIOCs?.length || 0
            }
        };

        // Include AI data if available
        if (analysis.result.ai) {
            reportData.ai = {
                summary: analysis.result.ai.summary,
                attackVector: analysis.result.ai.attackVector,
                severityScore: analysis.result.ai.severityScore,
                recommendedActions: analysis.result.ai.recommendedActions
            };
        }

        // Include executive summary if available
        if (analysis.result.executive) {
            reportData.executive = analysis.result.executive;
        }

        // Include technical data
        if (analysis.result.technical) {
            reportData.technical = {
                metadata: analysis.result.technical.metadata,
                securityEvents: analysis.result.technical.securityEvents,
                detectedIOCs: analysis.result.technical.detectedIOCs
            };

            // Only include raw data if specified in settings
            if (this.settings.includeRawData) {
                reportData.technical.rawData = analysis.result.technical.rawData;
            }
        }

        return reportData;
    }

    /**
     * Generate report blob
     */
    generateReportBlob(reportData) {
        const format = this.settings.exportFormat;

        switch (format) {
            case 'pdf':
                return this.generatePDFBlob(reportData);
            case 'html':
                return new Blob([this.generateHTMLReport(reportData)],
                    { type: 'text/html;charset=utf-8' });
            case 'json':
                return new Blob([JSON.stringify(reportData, null, 2)],
                    { type: 'application/json' });
            case 'csv':
                return this.generateCSVBlob(reportData);
            default:
                return new Blob([JSON.stringify(reportData, null, 2)],
                    { type: 'application/json' });
        }
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(reportData) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>SecuNik Security Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        h1, h2, h3 { color: #333; }
        .report-header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .risk-score { font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>SecuNik Security Analysis Report</h1>
        <p>Analysis ID: ${reportData.analysisId}</p>
        <p>Generated: ${new Date(reportData.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h2>File Information</h2>
        <table>
            <tr><th>File Name</th><td>${reportData.fileInfo.name}</td></tr>
            <tr><th>File Size</th><td>${this.formatFileSize(reportData.fileInfo.size)}</td></tr>
            <tr><th>File Type</th><td>${reportData.fileInfo.type}</td></tr>
            <tr><th>Processing Time</th><td>${(reportData.processingTime / 1000).toFixed(2)}s</td></tr>
        </table>
    </div>
    
    <div class="section">
        <h2>Risk Assessment</h2>
        <p class="risk-score">Risk Score: ${reportData.summary.riskScore}/10 (${reportData.summary.riskLevel})</p>
        <p>Total Security Events: ${reportData.summary.eventCount}</p>
        <p>Total IOCs Detected: ${reportData.summary.iocCount}</p>
    </div>
    
    ${reportData.executive ? `
    <div class="section">
        <h2>Executive Summary</h2>
        <p>${reportData.executive.summary || 'No executive summary available.'}</p>
        
        ${reportData.executive.findings ? `
        <h3>Key Findings</h3>
        <ul>
            ${reportData.executive.findings.map(finding => `<li>${finding}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${reportData.executive.businessImpact ? `
        <h3>Business Impact</h3>
        <p>${reportData.executive.businessImpact}</p>
        ` : ''}
        
        ${reportData.executive.recommendations ? `
        <h3>Recommendations</h3>
        <ul>
            ${reportData.executive.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
        ` : ''}
    </div>
    ` : ''}
    
    <div class="section">
        <h2>Analysis Details</h2>
        <p>For full interactive analysis, please use the SecuNik Dashboard.</p>
    </div>
</body>
</html>`;
    }

    /**
     * Prepare IOC data
     */
    prepareIOCData(iocs) {
        return {
            generatedAt: new Date().toISOString(),
            source: 'SecuNik Security Analysis Platform',
            iocs: iocs.map(ioc => ({
                indicator: ioc,
                type: this.detectIOCType(ioc),
                confidence: 'medium',
                source: 'SecuNik Analysis'
            }))
        };
    }

    /**
     * Generate share URL
     */
    generateShareUrl(shareData) {
        // In a real implementation, this would likely generate a unique URL or token
        // For now, just encode some basic data in the URL
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();

        params.set('id', shareData.analysisId);
        params.set('score', shareData.riskScore);
        params.set('events', shareData.summary.eventCount);
        params.set('iocs', shareData.summary.iocCount);

        return `${baseUrl}?share=${btoa(params.toString())}`;
    }

    /**
     * Download file
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Apply theme with support for dark mode
     */
    applyTheme(theme) {
        // Remove existing theme classes
        document.body.className = document.body.className
            .replace(/theme-\w+/g, '')
            .trim();

        // Add new theme class
        document.body.classList.add(`theme-${theme}`);

        // Update any theme-specific UI elements
        const isDark = theme === 'dark' || theme === 'midnight';

        // Set CSS variables for charts and visualizations
        document.documentElement.style.setProperty('--chart-primary',
            isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)');

        document.documentElement.style.setProperty('--chart-secondary',
            isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(124, 58, 237, 0.8)');

        // Store theme preference in local storage separate from other settings
        localStorage.setItem('secunik_theme', theme);
    }

    /**
     * Toggle animations across the application
     */
    toggleAnimations(enabled) {
        document.body.classList.toggle('no-animations', !enabled);

        if (!enabled) {
            // Immediately stop all existing animations
            document.querySelectorAll('[style*="animation"]').forEach(el => {
                el.style.animation = 'none';
                el.style.transition = 'none';
            });
        } else {
            // Restart status indicator animations
            this.startStatusAnimation();
        }
    }

    /**
     * Display a notification to the user
     */
    showNotification(message, type = 'info') {
        // Create container if it doesn't exist
        let notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.className = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            pointer-events: auto;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 8px;">${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
            </div>
            <button style="background: none; border: none; color: white; cursor: pointer; padding: 0; margin-left: 12px; font-size: 18px;" aria-label="Close notification">×</button>
        `;

        // Add click handler for close button
        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Add notification to container
        notificationContainer.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                this.hideNotification(notification);
            }
        }, 5000);
    }

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * Get notification color
     */
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