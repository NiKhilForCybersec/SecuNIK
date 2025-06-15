/**
 * SecuNik Professional Dashboard - Fixed JavaScript Application
 * Advanced AI-powered cybersecurity analysis platform
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

import * as api from "./services/api.js";
import { init as initCaseManagementTab } from "./tabs/caseManagement.js";
import { init as initIocsTab } from "./tabs/iocs.js";
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

            // Sidebar elements
            detailsSidebar: document.getElementById('detailsSidebar'),
            sidebarToggle: document.getElementById('sidebarToggle')
        };
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // File input handlers
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Upload zone drag and drop
        if (this.elements.headerUploadZone) {
            this.elements.headerUploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.headerUploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.elements.headerUploadZone.addEventListener('drop', (e) => this.handleDrop(e));
            this.elements.headerUploadZone.addEventListener('click', () => this.triggerFileInput());
        }

        // Tab navigation
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    this.switchToTab(tabName);
                }
            });
        });

        // Tab links
        this.elements.tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = link.getAttribute('data-tab-link');
                if (tabName) {
                    this.switchToTab(tabName);
                }
            });
        });

        // Settings button
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.switchToTab('settings'));
        }

        // Help button
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => this.switchToTab('help'));
        }

        // Export button
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportCurrentAnalysis());
        }

        // Sidebar toggle
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('resize', () => this.handleWindowResize());
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('secunik_settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    /**
     * Load analysis history from localStorage
     */
    loadAnalysisHistory() {
        try {
            const savedHistory = localStorage.getItem('secunik_history');
            if (savedHistory) {
                this.state.analysisHistory = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.warn('Failed to load analysis history:', error);
        }
    }

    /**
     * Load cases from localStorage
     */
    loadCases() {
        try {
            const savedCases = localStorage.getItem('secunik_cases');
            if (savedCases) {
                this.state.cases = JSON.parse(savedCases);
            }
        } catch (error) {
            console.warn('Failed to load cases:', error);
        }
    }

    /**
     * Check system health
     */
    async checkSystemHealth() {
        try {
            const response = await api.checkHealth();
            this.state.systemStatus = response.status || 'online';

            if (this.elements.systemStatus) {
                const span = this.elements.systemStatus.querySelector('span');
                if (span) {
                    span.textContent = this.state.systemStatus;
                }
            }
        } catch (error) {
            console.warn('Health check failed:', error);
            this.state.systemStatus = 'offline';
        }
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        // Set initial active tab
        this.switchToTab(this.state.activeTab);
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        if (!this.settings.animations) return;

        // Add animation classes to elements
        const animatedElements = document.querySelectorAll('.stat-card, .chart-container, .table-container');
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('animate-fade-in');
        });
    }

    /**
     * Setup responsive handlers
     */
    setupResponsiveHandlers() {
        // Handle mobile view
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768;
            document.body.classList.toggle('mobile-view', isMobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000);
    }

    /**
     * Show welcome state
     */
    showWelcomeState() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainNav = document.getElementById('mainNavigation');
        const tabContent = document.getElementById('tabContent');

        if (welcomeScreen) welcomeScreen.style.display = 'flex';
        if (mainNav) mainNav.style.display = 'none';
        if (tabContent) tabContent.style.display = 'none';
    }

    /**
     * Show main interface
     */
    showMainInterface() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainNav = document.getElementById('mainNavigation');
        const tabContent = document.getElementById('tabContent');

        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (mainNav) mainNav.style.display = 'block';
        if (tabContent) tabContent.style.display = 'block';
    }

    /**
     * Switch to specified tab
     */
    async switchToTab(tabName) {
        if (this.state.activeTab === tabName) return;

        console.log(`🔄 Switching to ${tabName} tab...`);

        // Update active tab state
        this.state.activeTab = tabName;

        // Update navigation UI
        this.elements.navTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            tab.classList.toggle('active', isActive);
        });

        // Update tab sections
        this.elements.tabSections.forEach(section => {
            const isActive = section.id === `${tabName}Tab`;
            section.classList.toggle('active', isActive);
            section.style.display = isActive ? 'block' : 'none';
        });

        // Render tab content
        await this.renderTabContent(tabName);

        // Update URL hash
        window.location.hash = tabName;
    }

    /**
     * Render tab content
     */
    async renderTabContent(tabName) {
        try {
            switch (tabName) {
                case 'dashboard':
                    const dashboardModule = await import('./tabs/dashboard.js');
                    if (dashboardModule.initTab) {
                        dashboardModule.initTab(this.state.currentAnalysis);
                    }
                    break;

                case 'events':
                    const eventsModule = await import('./tabs/events.js');
                    if (eventsModule.init) {
                        eventsModule.init(this);
                    }
                    break;

                case 'iocs':
                    if (initIocsTab) {
                        initIocsTab(this);
                    }
                    break;

                case 'timeline':
                    if (initTimelineTab) {
                        initTimelineTab(this);
                    }
                    break;

                case 'caseManagement':
                    if (initCaseManagementTab) {
                        initCaseManagementTab(this);
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
            // Show progress
            this.showAnalysisProgress();

            // Upload and analyze file
            const result = await api.uploadAndAnalyze(file, {
                onProgress: (progress) => this.updateProgress(progress),
                settings: this.settings
            });

            // Handle successful analysis
            await this.handleAnalysisComplete(result, file);

        } catch (error) {
            console.error('Analysis failed:', error);
            this.handleAnalysisError(error, file);
        }
    }

    /**
     * Validate uploaded file
     */
    validateFile(file) {
        // Check file size
        if (file.size > this.config.maxFileSize) {
            this.showNotification(
                `File too large. Maximum size is ${this.config.maxFileSize / (1024 * 1024)}MB`,
                'error'
            );
            return false;
        }

        // Check file extension
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.config.supportedFormats.includes(extension)) {
            this.showNotification(
                `Unsupported file format. Supported formats: ${this.config.supportedFormats.join(', ')}`,
                'error'
            );
            return false;
        }

        return true;
    }

    /**
     * Show analysis progress
     */
    showAnalysisProgress() {
        if (this.elements.analysisProgress) {
            this.elements.analysisProgress.style.display = 'block';
        }
        this.updateProgress(0);
    }

    /**
     * Hide analysis progress
     */
    hideAnalysisProgress() {
        if (this.elements.analysisProgress) {
            this.elements.analysisProgress.style.display = 'none';
        }
    }

    /**
     * Update progress bar
     */
    updateProgress(percentage) {
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${percentage}%`;
        }
        if (this.elements.progressPercentage) {
            this.elements.progressPercentage.textContent = `${Math.round(percentage)}%`;
        }
    }

    /**
     * Handle analysis completion
     */
    async handleAnalysisComplete(result, file) {
        console.log('✅ Analysis completed successfully');

        // Hide progress
        this.hideAnalysisProgress();

        // Update state
        this.state.currentAnalysis = {
            ...result,
            filename: file.name,
            fileSize: file.size,
            uploadedAt: new Date(),
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

        // Show main interface
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
                if (initIocsTab) {
                    initIocsTab(this);
                    console.log('✅ IOCs tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize IOCs tab:', error);
            }

            // Timeline tab
            try {
                if (initTimelineTab) {
                    initTimelineTab(this);
                    console.log('✅ Timeline tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize timeline tab:', error);
            }

            // Case Management tab
            try {
                if (initCaseManagementTab) {
                    initCaseManagementTab(this);
                    console.log('✅ Case Management tab initialized');
                }
            } catch (error) {
                console.error('Failed to initialize case management tab:', error);
            }

        } catch (error) {
            console.error('❌ Failed to initialize tabs:', error);
        }
    }

    /**
     * Handle analysis errors
     */
    handleAnalysisError(error, file) {
        console.error('❌ Analysis error:', error);

        this.state.isAnalyzing = false;
        this.hideAnalysisProgress();

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
     * Update performance metrics
     */
    updatePerformanceMetrics(analysis = null) {
        // Simulate performance metrics
        this.metrics.cpu = Math.random() * 100;
        this.metrics.memory = Math.random() * 100;

        if (analysis) {
            this.metrics.analysisSpeed = analysis.processingTimeMs || 0;
        }

        // Update UI elements
        const cpuFill = document.getElementById('cpuFill');
        const cpuValue = document.getElementById('cpuValue');
        const memoryFill = document.getElementById('memoryFill');
        const memoryValue = document.getElementById('memoryValue');

        if (cpuFill) cpuFill.style.width = `${this.metrics.cpu}%`;
        if (cpuValue) cpuValue.textContent = `${Math.round(this.metrics.cpu)}%`;
        if (memoryFill) memoryFill.style.width = `${this.metrics.memory}%`;
        if (memoryValue) memoryValue.textContent = `${Math.round(this.metrics.memory)}%`;
    }

    /**
     * Save analysis history to localStorage
     */
    saveAnalysisHistory() {
        try {
            localStorage.setItem('secunik_history', JSON.stringify(this.state.analysisHistory));
        } catch (error) {
            console.warn('Failed to save analysis history:', error);
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
            const exportData = {
                analysis: this.state.currentAnalysis,
                exportedAt: new Date().toISOString(),
                version: '2.1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `secunik-analysis-${this.state.currentAnalysis.filename}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Analysis exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export analysis', 'error');
        }
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
        const main = document.querySelector('.app-container');

        if (sidebar) {
            sidebar.classList.toggle('collapsed', !this.state.sidebarOpen);
        }

        if (main) {
            main.classList.toggle('sidebar-collapsed', !this.state.sidebarOpen);
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'u':
                    event.preventDefault();
                    this.triggerFileInput();
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportCurrentAnalysis();
                    break;
                case '1':
                    event.preventDefault();
                    this.switchToTab('dashboard');
                    break;
                case '2':
                    event.preventDefault();
                    this.switchToTab('events');
                    break;
                case '3':
                    event.preventDefault();
                    this.switchToTab('iocs');
                    break;
            }
        }

        if (event.key === 'Escape') {
            // Close any open modals or overlays
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => modal.classList.remove('active'));
        }
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Update responsive layout
        this.setupResponsiveHandlers();

        // Recalculate charts if needed
        if (this.state.currentAnalysis) {
            setTimeout(() => {
                const event = new CustomEvent('resize-charts');
                document.dispatchEvent(event);
            }, 250);
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload() {
        // Save current state
        try {
            localStorage.setItem('secunik_state', JSON.stringify({
                activeTab: this.state.activeTab,
                sidebarOpen: this.state.sidebarOpen,
                settings: this.settings
            }));
        } catch (error) {
            console.warn('Failed to save state on unload:', error);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = this.createNotificationContainer();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 300px;
            max-width: 400px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            font-size: 14px;
            font-weight: 500;
        `;

        notification.innerHTML = `
            <span style="font-size: 16px;">${this.getNotificationIcon(type)}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                margin-left: 8px;
            ">×</button>
        `;

        container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    this.hideNotification(notification);
                }
            }, duration);
        }
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
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