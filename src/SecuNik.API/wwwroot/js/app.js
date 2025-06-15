/**
 * SecuNik Professional Dashboard - Fixed JavaScript Application
 * Advanced AI-powered cybersecurity analysis platform
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

import Router from "./router.js";
import * as api from "./services/api.js";
import * as storage from "./services/storage.js";
import { init as initCaseManagementTab } from "./tabs/caseManagement.js";
import { exportIOCs, init as initIocsTab } from "./tabs/iocs.js";
import { init as initTimelineTab } from "./tabs/timeline.js";

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
            // Initialize core components first
            this.initializeElements();

            // Load settings and data
            this.loadSettings();
            this.loadAnalysisHistory();
            this.loadCases();

            // Setup event listeners
            this.setupEventListeners();

            // Check system health
            await this.checkSystemHealth();

            // Initialize UI components
            this.setupTabNavigation();
            this.initializeAnimations();
            this.setupResponsiveHandlers();
            this.setupPerformanceMonitoring();

            // Show welcome state initially
            this.showWelcomeState();

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
            this.elements.exportIOCsBtn.addEventListener('click', () => exportIOCs());
        }

        if (this.elements.shareAnalysisBtn) {
            this.elements.shareAnalysisBtn.addEventListener('click', () => this.shareAnalysis());
        }

        if (this.elements.newAnalysisBtn) {
            this.elements.newAnalysisBtn.addEventListener('click', () => this.startNewAnalysis());
        }

        // Initialize tab-specific listeners
        initCaseManagementTab(this);
        initTimelineTab(this);
        initIocsTab(this);

        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Prevent global drag events
        this.preventGlobalDrag();
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        this.router = new Router(this.elements.navTabs, this.elements.tabSections);
        this.router.init();
        this.elements.tabLinks.forEach(link => {
            link.addEventListener("click", () => {
                const tabName = link.getAttribute("data-tab-link");
                if (tabName) {
                    this.switchToTab(tabName);
                }
            });
        });
    }

    /**
     * Enhanced tab switching with proper content rendering
     */
    switchToTab(tabName) {
        console.log(`🔄 Switching to tab: ${tabName}`);

        this.state.activeTab = tabName;

        // Update navigation using router
        if (this.router) {
            this.router.switchTo(tabName);
        } else {
            // Fallback manual tab switching
            this.manualTabSwitch(tabName);
        }

        // Render tab content if analysis is available
        if (this.state.currentAnalysis) {
            this.renderTabContent(tabName);
        } else if (['settings', 'help'].includes(tabName)) {
            // These tabs work without analysis data
            this.renderTabContent(tabName);
        }

        // Update URL hash
        if (history.replaceState) {
            history.replaceState(null, '', `#${tabName}`);
        }

        // Track tab usage
        this.trackTabUsage(tabName);
    }

    /**
     * Manual tab switching fallback
     */
    manualTabSwitch(tabName) {
        // Update navigation tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update tab sections
        const tabSections = document.querySelectorAll('.tab-section');
        tabSections.forEach(section => {
            const isActive = section.id === `${tabName}Tab`;
            section.classList.toggle('active', isActive);
        });
    }

    /**
     * Render specific tab content
     */
    async renderTabContent(tabName) {
        try {
            const analysis = this.state.currentAnalysis;

            console.log(`📄 Rendering content for ${tabName} tab`);

            switch (tabName) {
                case 'dashboard':
                    const dashboardModule = await import('./tabs/dashboard.js');
                    if (dashboardModule.initTab && analysis) {
                        dashboardModule.initTab(analysis);
                    }
                    break;

                case 'events':
                    const eventsModule = await import('./tabs/events.js');
                    if (eventsModule.render && analysis) {
                        eventsModule.render(analysis);
                    } else if (eventsModule.init) {
                        eventsModule.init(this);
                    }
                    break;

                case 'iocs':
                    const iocsModule = await import('./tabs/iocs.js');
                    if (iocsModule.render && analysis) {
                        iocsModule.render(analysis);
                    } else if (iocsModule.init) {
                        iocsModule.init(this);
                    }
                    break;

                case 'timeline':
                    const timelineModule = await import('./tabs/timeline.js');
                    if (timelineModule.render && analysis) {
                        timelineModule.render(analysis);
                    } else if (timelineModule.init) {
                        timelineModule.init(this);
                    }
                    break;

                case 'executive':
                    const executiveModule = await import('./tabs/executive.js');
                    if (executiveModule.render && analysis) {
                        executiveModule.render(analysis);
                    } else if (executiveModule.init) {
                        executiveModule.init(this);
                    }
                    break;

                case 'threatIntel':
                    const threatIntelModule = await import('./tabs/threatIntel.js');
                    if (threatIntelModule.render && analysis) {
                        threatIntelModule.render(analysis);
                    } else if (threatIntelModule.initTab) {
                        threatIntelModule.initTab(analysis);
                    }
                    break;

                case 'forensics':
                    const forensicsModule = await import('./tabs/forensics.js');
                    if (forensicsModule.initTab && analysis) {
                        forensicsModule.initTab(analysis);
                    }
                    break;

                case 'fileDetails':
                    const fileDetailsModule = await import('./tabs/fileDetails.js');
                    if (fileDetailsModule.initTab && analysis) {
                        fileDetailsModule.initTab(analysis);
                    }
                    break;

                case 'recommendations':
                    const recommendationsModule = await import('./tabs/recommendations.js');
                    if (recommendationsModule.initTab && analysis) {
                        recommendationsModule.initTab(analysis);
                    }
                    break;

                case 'case':
                    const caseModule = await import('./tabs/caseManagement.js');
                    if (caseModule.render) {
                        caseModule.render();
                    } else if (caseModule.init) {
                        caseModule.init(this);
                    }
                    break;

                case 'settings':
                    const settingsModule = await import('./tabs/settings.js');
                    if (settingsModule.render) {
                        settingsModule.render();
                    } else if (settingsModule.initTab) {
                        settingsModule.initTab();
                    }
                    break;

                case 'help':
                    const helpModule = await import('./tabs/help.js');
                    if (helpModule.render) {
                        helpModule.render();
                    } else if (helpModule.initTab) {
                        helpModule.initTab();
                    }
                    break;

                default:
                    console.warn(`Unknown tab: ${tabName}`);
            }

            console.log(`✅ Content rendered for ${tabName} tab`);

        } catch (error) {
            console.error(`❌ Error rendering tab ${tabName}:`, error);
            this.showNotification(`Failed to load ${tabName} tab`, 'error');
        }
    }

    toggleSidebar() {
        this.state.sidebarOpen = !this.state.sidebarOpen;
        this.updateSidebarState();
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
            this.handleAnalysisError(error, file);
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
     * Enhanced file analysis method
     */
    async analyzeFile(file) {
        try {
            console.log('🔍 Starting file analysis...');

            // Show loading state
            this.showLoadingState(`Analyzing ${file.name}...`);

            // Create analysis options based on settings
            const options = {
                enableAI: this.settings.aiMode !== 'disabled',
                analysisDepth: this.settings.analysisDepth || 'standard',
                includeTimeline: this.settings.includeTimeline !== false,
                generateExecutiveReport: this.settings.executiveSummary !== false,
                confidenceThreshold: this.settings.confidenceThreshold || 0.8,
                enableForensics: this.settings.enableForensics !== false,
                timeoutMinutes: this.settings.analysisTimeout || 15
            };

            console.log('📋 Analysis options:', options);

            // Upload and analyze file using API
            const result = await api.uploadFile(file, options);

            // Add processing metadata
            result.processingTime = Date.now() - this.metrics.startTime;
            result.fileSize = file.size;
            result.analysisId = result.analysisId || `analysis_${Date.now()}`;

            // Handle successful analysis
            this.handleAnalysisComplete(result, file);

            // Hide loading state
            this.hideLoadingState();

            console.log('✅ File analysis completed successfully');

        } catch (error) {
            console.error('❌ File analysis failed:', error);
            this.handleAnalysisError(error, file);
            this.hideLoadingState();
            throw error;
        }
    }

    /**
     * Enhanced analysis completion handler
     */
    handleAnalysisComplete(result, file) {
        console.log('📊 Analysis completed successfully');

        // Update application state
        this.state.currentAnalysis = result;
        this.state.currentFile = {
            name: file.name,
            size: file.size,
            type: file.type || this.detectFileType(file.name),
            lastModified: file.lastModified
        };
        this.state.analysisCount++;
        this.state.isAnalyzing = false;

        // Add to analysis history
        this.state.analysisHistory.unshift({
            id: result.analysisId || Date.now(),
            filename: file.name,
            timestamp: new Date(),
            result: result,
            fileSize: file.size
        });

        // Limit history to 10 items
        if (this.state.analysisHistory.length > 10) {
            this.state.analysisHistory = this.state.analysisHistory.slice(0, 10);
        }

        // Hide welcome screen and show main interface
        this.showMainInterface();

        // Initialize all tabs with the analysis data
        this.initializeAllTabs(result);

        // Switch to dashboard tab by default
        this.switchToTab('dashboard');

        // Update performance metrics
        this.updatePerformanceMetrics(result);

        // Save analysis to localStorage
        this.saveAnalysisHistory();

        // Show success notification
        this.showNotification(
            `Analysis completed successfully for ${file.name}`,
            'success'
        );

        console.log('✅ Analysis integration completed');
    }

    /**
     * Initialize all tabs with analysis data
     */
    async initializeAllTabs(analysis) {
        try {
            console.log('🔄 Initializing all tabs with analysis data...');

            // Dashboard tab
            try {
                const dashboardModule = await import('./tabs/dashboard.js');
                if (dashboardModule.initTab) {
                    dashboardModule.initTab(analysis);
                    console.log('✅ Dashboard tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize dashboard tab:', error);
            }

            // Events tab
            try {
                const eventsModule = await import('./tabs/events.js');
                if (eventsModule.init) {
                    eventsModule.init(this);
                    console.log('✅ Events tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize events tab:', error);
            }

            // IOCs tab
            try {
                const iocsModule = await import('./tabs/iocs.js');
                if (iocsModule.init) {
                    iocsModule.init(this);
                    console.log('✅ IOCs tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize IOCs tab:', error);
            }

            // Timeline tab
            try {
                const timelineModule = await import('./tabs/timeline.js');
                if (timelineModule.init) {
                    timelineModule.init(this);
                    console.log('✅ Timeline tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize timeline tab:', error);
            }

            // Forensics tab
            try {
                const forensicsModule = await import('./tabs/forensics.js');
                if (forensicsModule.initTab) {
                    forensicsModule.initTab(analysis);
                    console.log('✅ Forensics tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize forensics tab:', error);
            }

            // Threat Intelligence tab
            try {
                const threatIntelModule = await import('./tabs/threatIntel.js');
                if (threatIntelModule.initTab) {
                    threatIntelModule.initTab(analysis);
                    console.log('✅ Threat Intelligence tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize threat intel tab:', error);
            }

            // Executive tab
            try {
                const executiveModule = await import('./tabs/executive.js');
                if (executiveModule.init) {
                    executiveModule.init(this);
                    console.log('✅ Executive tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize executive tab:', error);
            }

            // File Details tab
            try {
                const fileDetailsModule = await import('./tabs/fileDetails.js');
                if (fileDetailsModule.initTab) {
                    fileDetailsModule.initTab(analysis);
                    console.log('✅ File Details tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize file details tab:', error);
            }

            // Recommendations tab
            try {
                const recommendationsModule = await import('./tabs/recommendations.js');
                if (recommendationsModule.initTab) {
                    recommendationsModule.initTab(analysis);
                    console.log('✅ Recommendations tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize recommendations tab:', error);
            }

            // Case Management tab
            try {
                const caseModule = await import('./tabs/caseManagement.js');
                if (caseModule.init) {
                    caseModule.init(this);
                    console.log('✅ Case Management tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize case management tab:', error);
            }

            // Settings tab (doesn't need analysis data)
            try {
                const settingsModule = await import('./tabs/settings.js');
                if (settingsModule.initTab) {
                    settingsModule.initTab();
                    console.log('✅ Settings tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize settings tab:', error);
            }

            // Help tab (doesn't need analysis data)
            try {
                const helpModule = await import('./tabs/help.js');
                if (helpModule.initTab) {
                    helpModule.initTab();
                    console.log('✅ Help tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize help tab:', error);
            }

            console.log('✅ All tabs initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing tabs:', error);
            this.showNotification('Some tabs failed to initialize', 'warning');
        }
    }

    /**
     * Show main interface after analysis
     */
    showMainInterface() {
        // Hide welcome screen
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }

        // Show main navigation
        const mainNav = document.getElementById('mainNavigation');
        if (mainNav) {
            mainNav.style.display = 'block';
        }

        // Show tab content
        const tabContent = document.getElementById('tabContent');
        if (tabContent) {
            tabContent.style.display = 'block';
        }

        // Update analysis counter
        const analysisCounter = document.getElementById('analysisCounter');
        if (analysisCounter) {
            analysisCounter.textContent = this.state.analysisCount;
        }

        // Update system status
        const systemStatus = document.getElementById('systemStatus');
        if (systemStatus) {
            const span = systemStatus.querySelector('span');
            if (span) {
                span.textContent = 'Analysis Complete';
            }
            systemStatus.classList.add('analysis-complete');
        }
    }

    /**
     * Handle analysis errors properly
     */
    handleAnalysisError(error, file) {
        console.error('❌ Analysis error:', error);

        this.state.isAnalyzing = false;

        // Show detailed error notification
        const errorMessage = this.getErrorMessage(error);
        this.showNotification(
            `Analysis failed for ${file?.name || 'uploaded file'}: ${errorMessage}`,
            'error'
        );

        // Keep welcome screen visible
        this.showWelcomeState();
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(error) {
        if (error.message) {
            // Common error patterns
            if (error.message.includes('File size')) {
                return 'File too large (max 50MB)';
            } else if (error.message.includes('format')) {
                return 'Unsupported file format';
            } else if (error.message.includes('network')) {
                return 'Network connection error';
            } else if (error.message.includes('timeout')) {
                return 'Analysis timed out';
            }
            return error.message;
        }
        return 'Unknown error occurred';
    }

    /**
     * Enhanced loading state methods
     */
    showLoadingState(message = 'Processing...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingStatus = document.getElementById('loadingStatus');

        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            loadingOverlay.setAttribute('aria-hidden', 'false');
        }

        if (loadingStatus) {
            loadingStatus.textContent = message;
        }

        // Start progress simulation
        this.startLoadingProgress();
    }

    hideLoadingState() {
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            loadingOverlay.setAttribute('aria-hidden', 'true');
        }

        // Stop progress simulation
        this.stopLoadingProgress();
    }

    /**
     * Loading progress simulation
     */
    startLoadingProgress() {
        const loadingStatus = document.getElementById('loadingStatus');
        if (!loadingStatus) return;

        const steps = [
            'Validating file format...',
            'Parsing log data...',
            'Detecting security events...',
            'Running AI analysis...',
            'Identifying threats...',
            'Generating report...',
            'Finalizing results...'
        ];

        let currentStep = 0;
        this.loadingInterval = setInterval(() => {
            if (currentStep < steps.length) {
                loadingStatus.textContent = steps[currentStep];
                currentStep++;
            } else {
                loadingStatus.textContent = 'Almost complete...';
            }
        }, 2000);
    }

    stopLoadingProgress() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
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

    async shareAnalysis() {
        if (!this.state.currentAnalysis) {
            this.showNotification('No analysis to share', 'warning');
            return;
        }

        try {
            // Create shareable summary
            const result = this.state.currentAnalysis.result || {};
            const executive = result.executive || result.Executive || {};

            const shareData = {
                analysisId: this.state.currentAnalysis.analysisId,
                fileName: this.state.currentFile.name,
                timestamp: this.state.currentAnalysis.timestamp,
                riskScore: this.calculateRiskScore(result),
                summary: executive.summary || 'Analysis completed'
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

    /**
     * Start new analysis (reset state)
     */
    startNewAnalysis() {
        if (this.state.isAnalyzing) {
            this.showNotification('Please wait for current analysis to complete', 'warning');
            return;
        }

        // Reset current analysis state
        this.state.currentAnalysis = null;
        this.state.currentFile = null;
        this.state.isAnalyzing = false;

        // Show welcome screen
        this.showWelcomeState();

        // Clear any cached data
        this.clearTemporaryData();

        this.showNotification('Ready for new analysis', 'info');
        console.log('🆕 Ready for new analysis');
    }

    async exportAnalysis() {
        await this.generateReport();
    }

    /**
     * System health check
     */
    async checkSystemHealth() {
        try {
            const ok = await api.checkHealth(this.config.apiEndpoints);
            if (ok) {
                this.state.systemStatus = "online";
                this.updateSystemStatus("System Online", "online");
            } else {
                this.state.systemStatus = "degraded";
                this.updateSystemStatus("System Degraded", "degraded");
            }
        } catch (error) {
            this.state.systemStatus = "offline";
            this.updateSystemStatus("System Offline", "offline");
            console.warn("Health check failed:", error);
        }
    }

    updateSystemStatus(text, status) {
        if (this.elements.systemStatus) {
            const span = this.elements.systemStatus.querySelector('span');
            if (span) {
                span.textContent = text;
            }
            this.elements.systemStatus.className = `status-indicator ${status}`;
        }
    }

    updateAnalysisCounter() {
        if (this.elements.analysisCounter) {
            const span = this.elements.analysisCounter.querySelector('span');
            if (span) {
                const text = this.state.analysisCount === 1 ? '1 File Analyzed' : `${this.state.analysisCount} Files Analyzed`;
                span.textContent = text;
            }
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

    updatePerformanceMetrics(result) {
        if (result && result.processingTime) {
            this.metrics.analysisSpeed = result.processingTime;
        }

        // Update CPU and memory if available
        if (performance.memory) {
            this.metrics.memory = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
        }

        // Estimate CPU usage based on processing intensity
        if (result && result.processingTime && result.fileSize) {
            const intensity = Math.min(100, (result.processingTime / 1000) * 5);
            this.metrics.cpu = Math.max(10, Math.min(90, intensity));
        }

        // Update UI elements
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
                            exportIOCs();
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
            Object.assign(this.settings, storage.loadSettings());
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    saveSettings() {
        try {
            storage.saveSettings(this.settings);
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    /**
     * Load analysis history from localStorage
     */
    loadAnalysisHistory() {
        try {
            const saved = localStorage.getItem('secuNikAnalysisHistory');
            if (saved) {
                this.state.analysisHistory = JSON.parse(saved);
                console.log(`📚 Loaded ${this.state.analysisHistory.length} analysis records from history`);
            }
        } catch (error) {
            console.error('Failed to load analysis history:', error);
            this.state.analysisHistory = [];
        }
    }

    /**
     * Save analysis history to localStorage
     */
    saveAnalysisHistory() {
        try {
            const historyToSave = this.state.analysisHistory.map(item => ({
                id: item.id,
                filename: item.filename,
                timestamp: item.timestamp,
                fileSize: item.fileSize,
                // Don't save full result data to avoid localStorage size issues
                hasData: !!item.result
            }));

            localStorage.setItem('secuNikAnalysisHistory', JSON.stringify(historyToSave));
            console.log('✅ Analysis history saved');
        } catch (error) {
            console.error('Failed to save analysis history:', error);
        }
    }

    loadCases() {
        try {
            this.state.cases = storage.loadCases();
        } catch (error) {
            console.warn('Failed to load cases:', error);
        }
    }

    saveCases() {
        try {
            storage.saveCases(this.state.cases);
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
        const events = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];
        const iocs = data.technical?.detectedIOCs || data.Technical?.DetectedIOCs || [];

        let score = 0;

        // Base score from events
        events.forEach(event => {
            switch ((event.severity || event.Severity || '').toLowerCase()) {
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

    /**
     * Calculate analysis score (referenced in dashboard.js)
     */
    calculateAnalysisScore(data) {
        try {
            let score = 50; // Base score

            const events = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];
            const iocs = data.technical?.detectedIOCs || data.Technical?.DetectedIOCs || [];

            // Adjust score based on critical events
            const criticalEvents = events.filter(e =>
                (e.severity || e.Severity || '').toLowerCase() === 'critical'
            ).length;

            const highEvents = events.filter(e =>
                (e.severity || e.Severity || '').toLowerCase() === 'high'
            ).length;

            // Score increases with threat severity
            score += criticalEvents * 20;
            score += highEvents * 10;

            // Adjust score based on IOCs
            score += iocs.length * 5;

            // Adjust based on AI confidence if available
            const aiAnalysis = data.aiAnalysis || data.AIAnalysis || {};
            const confidence = aiAnalysis.confidence || aiAnalysis.Confidence || 0.5;

            // Higher confidence in threats increases score
            score = score * (0.5 + confidence);

            // Factor in event density (events per hour)
            if (events.length > 0) {
                const timeSpan = this.calculateTimeSpan(events);
                const eventsPerHour = events.length / Math.max(1, timeSpan);
                if (eventsPerHour > 10) {
                    score += 15; // High activity bonus
                }
            }

            return Math.min(100, Math.max(0, Math.round(score)));
        } catch (error) {
            console.error('Error calculating analysis score:', error);
            return 50; // Default score
        }
    }

    /**
     * Calculate time span of events
     */
    calculateTimeSpan(events) {
        try {
            const timestamps = events
                .map(e => new Date(e.timestamp || e.Timestamp))
                .filter(date => !isNaN(date))
                .sort((a, b) => a - b);

            if (timestamps.length < 2) return 1;

            const spanMs = timestamps[timestamps.length - 1] - timestamps[0];
            return Math.max(1, spanMs / (1000 * 60 * 60)); // Convert to hours
        } catch (error) {
            return 1;
        }
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
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Track tab usage for analytics
     */
    trackTabUsage(tabName) {
        try {
            // Store tab usage statistics
            const tabStats = JSON.parse(localStorage.getItem('secuNikTabStats') || '{}');
            tabStats[tabName] = (tabStats[tabName] || 0) + 1;
            localStorage.setItem('secuNikTabStats', JSON.stringify(tabStats));
        } catch (error) {
            // Ignore storage errors
        }
    }

    /**
     * Refresh dashboard data
     */
    refreshDashboard() {
        if (this.state.currentAnalysis && this.state.activeTab === 'dashboard') {
            console.log('🔄 Refreshing dashboard data...');
            this.renderTabContent('dashboard');
        }
    }

    /**
     * Clear temporary data
     */
    clearTemporaryData() {
        // Clear any temporary analysis data
        try {
            localStorage.removeItem('tempAnalysisData');
        } catch (error) {
            // Ignore storage errors
        }
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