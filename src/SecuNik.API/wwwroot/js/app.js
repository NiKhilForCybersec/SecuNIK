/**
 * SecuNik Professional Dashboard - Fixed JavaScript Application
 * Advanced AI-powered cybersecurity analysis platform
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

import * as api from "./services/api.js";

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

            // Sidebar elements
            detailsSidebar: document.getElementById('detailsSidebar'),
            sidebarToggle: document.getElementById('sidebarToggle'),

            // Dashboard specific elements
            criticalEvents: document.getElementById('criticalEvents'),
            highEvents: document.getElementById('highEvents'),
            mediumEvents: document.getElementById('mediumEvents'),
            analysisScore: document.getElementById('analysisScore'),

            // Case management elements
            caseHistoryList: document.getElementById('caseHistoryList'),
            caseForm: document.getElementById('caseForm')
        };

        // Log missing elements for debugging
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element && key !== 'caseForm' && key !== 'caseHistoryList') {
                console.warn(`⚠️ Element not found: ${key}`);
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // File input handler
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }

        // Upload zone handlers
        if (this.elements.headerUploadZone) {
            this.setupDragAndDrop(this.elements.headerUploadZone);
        }

        // Tab navigation
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.getAttribute('data-tab') || tab.getAttribute('href')?.replace('#', '');
                if (tabName) {
                    this.switchToTab(tabName);
                }
            });
        });

        // Settings button
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => {
                this.switchToTab('settings');
            });
        }

        // Help button
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => {
                this.switchToTab('help');
            });
        }

        // Export button
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => {
                this.exportCurrentAnalysis();
            });
        }

        // Sidebar toggle
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                this.elements.fileInput?.click();
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const tabName = window.location.hash.replace('#', '') || 'dashboard';
            this.switchToTab(tabName, false);
        });
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop(element) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, this.handleDragEvent.bind(this), false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.classList.remove('drag-over');
            });
        });

        element.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileSelection(files);
        });
    }

    /**
     * Handle drag events
     */
    handleDragEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Handle file selection
     */
    async handleFileSelection(files) {
        if (!files || files.length === 0) return;

        const file = files[0];

        try {
            await this.processFile(file);
        } catch (error) {
            console.error('File processing failed:', error);
            this.showNotification('File processing failed: ' + error.message, 'error');
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

        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        this.state.isAnalyzing = true;
        this.state.currentFile = file;

        try {
            // Show loading state
            this.showLoadingState(file);

            // Create API instance and process file
            const apiInstance = new api.SecuNikAPI();
            const result = await apiInstance.uploadAndAnalyze(file, {
                enableAI: this.settings.aiMode !== 'disabled',
                analysisDepth: this.settings.analysisDepth,
                includeTimeline: this.settings.includeTimeline,
                generateExecutiveReport: this.settings.executiveSummary
            });

            // Store analysis result
            this.state.currentAnalysis = result;
            this.state.analysisCount++;

            // Update analysis counter
            if (this.elements.analysisCounter) {
                this.elements.analysisCounter.textContent = this.state.analysisCount;
            }

            // Initialize all tabs with the analysis data
            await this.initializeAllTabs(result);

            // Switch to dashboard to show results
            this.switchToTab('dashboard');

            // Save to history
            this.saveAnalysisHistory();

            console.log('✅ File processing completed successfully');
            this.showNotification(`Analysis completed for ${file.name}`, 'success');

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            this.showNotification('Analysis failed: ' + error.message, 'error');
        } finally {
            this.state.isAnalyzing = false;
            this.hideLoadingState();
        }
    }

    /**
     * Validate uploaded file
     */
    validateFile(file) {
        // Check file size
        if (file.size > this.config.maxFileSize) {
            const maxSizeMB = Math.round(this.config.maxFileSize / 1024 / 1024);
            this.showNotification(`File too large. Maximum size: ${maxSizeMB}MB`, 'error');
            return false;
        }

        // Check file extension
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.config.supportedFormats.includes(extension)) {
            this.showNotification(`Unsupported file format: ${extension}`, 'error');
            return false;
        }

        return true;
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

            // Case Management tab
            try {
                const caseManagementModule = await import('./tabs/caseManagement.js');
                if (caseManagementModule.init) {
                    caseManagementModule.init(this);
                    console.log('✅ Case Management tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize case management tab:', error);
            }

            // Other tabs can be initialized on-demand
            console.log('✅ All tabs initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize tabs:', error);
        }
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        // Set initial tab from URL hash
        const initialTab = window.location.hash.replace('#', '') || 'dashboard';
        this.switchToTab(initialTab, false);
    }

    /**
     * Switch to a specific tab
     */
    async switchToTab(tabName, updateHistory = true) {
        console.log(`🔄 Switching to tab: ${tabName}`);

        this.state.activeTab = tabName;

        // Update tab navigation
        this.elements.navTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName ||
                tab.getAttribute('href') === `#${tabName}`;
            tab.classList.toggle('active', isActive);
        });

        // Update tab sections
        this.elements.tabSections.forEach(section => {
            const isActive = section.id === `${tabName}Tab`;
            section.style.display = isActive ? 'block' : 'none';
        });

        // Render tab content
        await this.renderTabContent(tabName);

        // Update URL hash
        if (updateHistory) {
            window.history.pushState(null, null, `#${tabName}`);
        }
    }

    /**
     * Render tab content
     */
    async renderTabContent(tabName) {
        try {
            switch (tabName) {
                case 'dashboard':
                    const dashboardModule = await import('./tabs/dashboard.js');
                    if (dashboardModule.initTab && this.state.currentAnalysis) {
                        dashboardModule.initTab(this.state.currentAnalysis);
                    }
                    break;

                case 'events':
                    const eventsModule = await import('./tabs/events.js');
                    if (eventsModule.init) {
                        eventsModule.init(this);
                    }
                    if (eventsModule.render && this.state.currentAnalysis) {
                        eventsModule.render(this.state.currentAnalysis);
                    }
                    break;

                case 'iocs':
                    const iocsModule = await import('./tabs/iocs.js');
                    if (iocsModule.init) {
                        iocsModule.init(this);
                    }
                    if (iocsModule.render && this.state.currentAnalysis) {
                        iocsModule.render(this.state.currentAnalysis);
                    }
                    break;

                case 'timeline':
                    const timelineModule = await import('./tabs/timeline.js');
                    if (timelineModule.init) {
                        timelineModule.init(this);
                    }
                    if (timelineModule.render && this.state.currentAnalysis) {
                        timelineModule.render(this.state.currentAnalysis);
                    }
                    break;

                case 'caseManagement':
                    const caseManagementModule = await import('./tabs/caseManagement.js');
                    if (caseManagementModule.init) {
                        caseManagementModule.init(this);
                    }
                    if (caseManagementModule.render) {
                        caseManagementModule.render();
                    }
                    break;

                case 'settings':
                    const settingsModule = await import('./tabs/settings.js');
                    if (settingsModule.init) {
                        settingsModule.init(this);
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

    /**
     * Show loading state
     */
    showLoadingState(file) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingTitle = document.getElementById('loadingTitle');
        const loadingStatus = document.getElementById('loadingStatus');

        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }

        if (loadingTitle) {
            loadingTitle.textContent = `Analyzing ${file.name}...`;
        }

        if (loadingStatus) {
            loadingStatus.textContent = 'Initializing AI analysis engine...';
        }

        // Simulate progress updates
        this.simulateProgress();
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    /**
     * Simulate analysis progress
     */
    simulateProgress() {
        const progressSteps = [
            'Initializing AI analysis engine...',
            'Processing file structure...',
            'Extracting security events...',
            'Analyzing threat patterns...',
            'Generating IOCs...',
            'Building timeline...',
            'Performing AI correlation...',
            'Generating executive summary...',
            'Finalizing analysis...'
        ];

        let currentStep = 0;
        const loadingStatus = document.getElementById('loadingStatus');

        const updateProgress = () => {
            if (currentStep < progressSteps.length && this.state.isAnalyzing) {
                if (loadingStatus) {
                    loadingStatus.textContent = progressSteps[currentStep];
                }
                currentStep++;
                setTimeout(updateProgress, 1500);
            }
        };

        updateProgress();
    }

    /**
     * Show welcome state
     */
    showWelcomeState() {
        // Implementation depends on your welcome state UI
        console.log('📋 Showing welcome state');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) {
            console.log(`${type.toUpperCase()}: ${message}`);
            return;
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        container.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    /**
     * Check system health
     */
    async checkSystemHealth() {
        try {
            const health = await api.checkHealth();
            this.state.systemStatus = health.status || 'online';

            if (this.elements.systemStatus) {
                this.elements.systemStatus.textContent = this.state.systemStatus;
                this.elements.systemStatus.className = `status ${this.state.systemStatus}`;
            }

            console.log('✅ System health check completed:', health);
        } catch (error) {
            console.error('❌ System health check failed:', error);
            this.state.systemStatus = 'offline';

            if (this.elements.systemStatus) {
                this.elements.systemStatus.textContent = 'offline';
                this.elements.systemStatus.className = 'status offline';
            }
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('secunik-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('secunik-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * Load analysis history
     */
    loadAnalysisHistory() {
        try {
            const saved = localStorage.getItem('secunik-analysis-history');
            if (saved) {
                this.state.analysisHistory = JSON.parse(saved);
                this.state.analysisCount = this.state.analysisHistory.length;
            }
        } catch (error) {
            console.error('Failed to load analysis history:', error);
        }
    }

    /**
     * Save analysis history
     */
    saveAnalysisHistory() {
        if (!this.state.currentAnalysis) return;

        try {
            const historyItem = {
                id: Date.now(),
                fileName: this.state.currentFile?.name,
                timestamp: new Date().toISOString(),
                analysis: this.state.currentAnalysis
            };

            this.state.analysisHistory.unshift(historyItem);

            // Keep only last 50 analyses
            if (this.state.analysisHistory.length > 50) {
                this.state.analysisHistory = this.state.analysisHistory.slice(0, 50);
            }

            localStorage.setItem('secunik-analysis-history', JSON.stringify(this.state.analysisHistory));
        } catch (error) {
            console.error('Failed to save analysis history:', error);
        }
    }

    /**
     * Load cases
     */
    loadCases() {
        try {
            const saved = localStorage.getItem('secunik-cases');
            if (saved) {
                this.state.cases = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load cases:', error);
        }
    }

    /**
     * Save cases
     */
    saveCases() {
        try {
            localStorage.setItem('secunik-cases', JSON.stringify(this.state.cases));
        } catch (error) {
            console.error('Failed to save cases:', error);
        }
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        this.state.sidebarOpen = !this.state.sidebarOpen;

        if (this.elements.detailsSidebar) {
            this.elements.detailsSidebar.classList.toggle('collapsed', !this.state.sidebarOpen);
        }
    }

    /**
     * Export current analysis
     */
    exportCurrentAnalysis() {
        if (!this.state.currentAnalysis) {
            this.showNotification('No analysis to export', 'warning');
            return;
        }

        try {
            const blob = new Blob([JSON.stringify(this.state.currentAnalysis, null, 2)],
                { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `secunik-analysis-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Analysis exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed', 'error');
        }
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        // Basic animation setup
        console.log('🎨 Animations initialized');
    }

    /**
     * Setup responsive handlers
     */
    setupResponsiveHandlers() {
        // Mobile/responsive event handlers
        console.log('📱 Responsive handlers setup');
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Performance monitoring setup
        this.metrics.startTime = Date.now();
        console.log('📊 Performance monitoring active');
    }

    /**
     * Calculate analysis score
     */
    calculateAnalysisScore(data) {
        // Simplified scoring algorithm
        let score = 100;

        const events = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];
        const criticalEvents = events.filter(e =>
            (e.severity || e.Severity || '').toLowerCase() === 'critical'
        ).length;

        score -= criticalEvents * 10;
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Format timestamp
     */
    formatTimestamp(timestamp) {
        try {
            return new Date(timestamp).toLocaleString();
        } catch {
            return timestamp || 'Unknown';
        }
    }

    /**
     * Sanitize HTML
     */
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded, initializing dashboard...');
    window.secuNikDashboard = new SecuNikDashboard();
});

// Export for module use
export default SecuNikDashboard;