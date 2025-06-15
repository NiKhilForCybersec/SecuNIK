// Enhanced API Service for SecuNik Frontend
class SecuNikAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.endpoints = {
            upload: '/api/analysis/upload',
            analyzePath: '/api/analysis/analyze-path',
            supportedTypes: '/api/analysis/supported-types',
            health: '/api/analysis/health',
            canProcess: '/api/analysis/can-process'
        };
        this.defaultHeaders = {
            'Accept': 'application/json'
        };
    }

    // Upload and analyze file
    async uploadFile(file, options = {}) {
        try {
            if (!file) {
                throw new Error('No file provided');
            }

            // Validate file size (50MB limit)
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error(`File size (${this.formatFileSize(file.size)}) exceeds maximum limit of 50MB`);
            }

            const formData = new FormData();
            formData.append('file', file);

            // Add analysis options if provided
            if (options && Object.keys(options).length > 0) {
                formData.append('options', JSON.stringify(options));
            }

            const response = await fetch(this.baseURL + this.endpoints.upload, {
                method: 'POST',
                body: formData,
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    // Analyze file from path (for testing/admin)
    async analyzeFilePath(filePath, options = {}) {
        try {
            const response = await fetch(this.baseURL + this.endpoints.analyzePath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.defaultHeaders
                },
                body: JSON.stringify({
                    filePath: filePath,
                    options: options
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Analysis failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File path analysis error:', error);
            throw error;
        }
    }

    // Get supported file types
    async getSupportedFileTypes() {
        try {
            const response = await fetch(this.baseURL + this.endpoints.supportedTypes, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                throw new Error(`Failed to get supported types: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get supported types error:', error);
            throw error;
        }
    }

    // Health check
    async checkHealth() {
        try {
            const response = await fetch(this.baseURL + this.endpoints.health, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            return {
                isHealthy: response.ok,
                data: response.ok ? await response.json() : null
            };
        } catch (error) {
            console.error('Health check error:', error);
            return {
                isHealthy: false,
                data: null
            };
        }
    }

    // Check if file can be processed
    async canProcessFile(filePath) {
        try {
            const response = await fetch(this.baseURL + this.endpoints.canProcess, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.defaultHeaders
                },
                body: JSON.stringify({
                    filePath: filePath
                })
            });

            if (!response.ok) {
                return false;
            }

            const result = await response.json();
            return result.canProcess || false;
        } catch (error) {
            console.error('Can process file error:', error);
            return false;
        }
    }

    // Utility: Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Utility: Validate file type
    isValidFileType(file, supportedTypes = []) {
        if (!file || !file.name) return false;

        const extension = file.name.split('.').pop().toLowerCase();
        const commonSupportedTypes = ['csv', 'log', 'txt', 'evtx', 'pcap'];

        const typesToCheck = supportedTypes.length > 0 ? supportedTypes : commonSupportedTypes;
        return typesToCheck.includes(extension);
    }

    // Utility: Get file extension
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    // Utility: Generate analysis options
    createAnalysisOptions({
        enableAI = true,
        generateExecutiveReport = true,
        includeTimeline = true,
        performForensicAnalysis = true,
        generateIOCList = true,
        maxSecurityEvents = 10000,
        maxIOCs = 1000,
        focusKeywords = [],
        excludePatterns = [],
        minimumEventPriority = 'Low',
        deepInspection = false
    } = {}) {
        return {
            enableAIAnalysis: enableAI,
            generateExecutiveReport,
            includeTimeline,
            performForensicAnalysis,
            generateIOCList,
            maxSecurityEvents,
            maxIOCs,
            focusKeywords,
            excludePatterns,
            minimumEventPriority,
            deepInspection
        };
    }
}

// Enhanced File Upload Handler
class FileUploadHandler {
    constructor(api) {
        this.api = api;
        this.uploadZones = [];
        this.activeUploads = new Map();
        this.supportedTypes = [];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB

        this.init();
    }

    async init() {
        // Get supported file types
        try {
            const typesData = await this.api.getSupportedFileTypes();
            this.supportedTypes = typesData.supportedTypes || [];
        } catch (error) {
            console.warn('Could not fetch supported file types:', error);
        }

        // Initialize upload zones
        this.initializeUploadZones();
    }

    initializeUploadZones() {
        // Find all upload zones
        const zones = document.querySelectorAll('.upload-zone, .upload-zone-header');

        zones.forEach(zone => {
            this.setupUploadZone(zone);
        });
    }

    setupUploadZone(zone) {
        // File input handling
        const fileInput = zone.querySelector('input[type="file"]') ||
            document.querySelector('#fileInput');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }

        // Drag and drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('dragover');
            }
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');

            const files = Array.from(e.dataTransfer.files);
            this.handleFileSelect(files);
        });

        // Click to upload
        zone.addEventListener('click', (e) => {
            if (e.target.closest('button')) return; // Don't trigger on buttons

            if (fileInput) {
                fileInput.click();
            }
        });

        this.uploadZones.push(zone);
    }

    async handleFileSelect(files) {
        if (!files || files.length === 0) return;

        const file = files[0]; // Take first file

        try {
            // Validate file
            this.validateFile(file);

            // Show loading state
            this.showUploadProgress(file);

            // Create analysis options
            const options = this.api.createAnalysisOptions({
                enableAI: true,
                generateExecutiveReport: true,
                includeTimeline: true
            });

            // Upload and analyze
            const result = await this.api.uploadFile(file, options);

            // Handle successful analysis
            this.handleAnalysisSuccess(result, file);

        } catch (error) {
            this.handleAnalysisError(error, file);
        } finally {
            this.hideUploadProgress();
        }
    }

    validateFile(file) {
        // Check if file exists
        if (!file) {
            throw new Error('No file selected');
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            throw new Error(`File size (${this.api.formatFileSize(file.size)}) exceeds maximum limit of ${this.api.formatFileSize(this.maxFileSize)}`);
        }

        // Check file type
        if (this.supportedTypes.length > 0 && !this.api.isValidFileType(file, this.supportedTypes)) {
            const extension = this.api.getFileExtension(file.name);
            throw new Error(`File type '.${extension}' is not supported. Supported types: ${this.supportedTypes.join(', ')}`);
        }
    }

    showUploadProgress(file) {
        // Create or show loading overlay
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Analyzing ${file.name}...</div>
                    <div class="loading-progress">
                        <div class="loading-progress-bar" style="width: 0%"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        overlay.style.display = 'flex';

        // Simulate progress
        this.simulateProgress();
    }

    simulateProgress() {
        const progressBar = document.querySelector('.loading-progress-bar');
        if (!progressBar) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;

            progressBar.style.width = `${progress}%`;

            if (progress >= 90) {
                clearInterval(interval);
            }
        }, 200);

        // Store interval to clear later
        this.progressInterval = interval;
    }

    hideUploadProgress() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            // Complete progress bar
            const progressBar = overlay.querySelector('.loading-progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }

            // Hide after brief delay
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }

        // Clear progress interval
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    handleAnalysisSuccess(result, file) {
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

        // Trigger dashboard update (if dashboard exists)
        if (window.secuNikDashboard) {
            window.secuNikDashboard.handleAnalysisComplete(result, file);
        }

        // Show success notification
        this.showNotification(
            'Analysis Complete',
            `Successfully analyzed ${file.name}`,
            'success'
        );
    }

    handleAnalysisError(error, file) {
        console.error('Analysis error:', error);

        this.showNotification(
            'Analysis Failed',
            error.message || 'An error occurred during analysis',
            'error'
        );
    }

    showNotification(title, message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <svg width="20" height="20" data-feather="${iconMap[type] || 'info'}"></svg>
            </div>
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <svg width="16" height="16" data-feather="x"></svg>
            </button>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Add to container
        container.appendChild(notification);

        // Replace feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Enhanced Application Initialization
class SecuNikApp {
    constructor() {
        this.api = new SecuNikAPI();
        this.uploadHandler = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Check API health
            const health = await this.api.checkHealth();
            if (!health.isHealthy) {
                console.warn('API health check failed');
            }

            // Initialize upload handler
            this.uploadHandler = new FileUploadHandler(this.api);

            // Initialize other components
            this.initializeNavigation();
            this.initializeFeatherIcons();

            this.isInitialized = true;
            console.log('SecuNik application initialized successfully');

        } catch (error) {
            console.error('Failed to initialize SecuNik application:', error);
        }
    }

    initializeNavigation() {
        // Tab switching functionality
        const tabButtons = document.querySelectorAll('.nav-tab');
        const tabSections = document.querySelectorAll('.tab-section');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // Update button states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update section visibility
                tabSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${targetTab}Tab`) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }

    initializeFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    // Get API instance
    getAPI() {
        return this.api;
    }

    // Get upload handler instance
    getUploadHandler() {
        return this.uploadHandler;
    }
}

// Export for global access
window.SecuNikAPI = SecuNikAPI;
window.FileUploadHandler = FileUploadHandler;
window.SecuNikApp = SecuNikApp;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.secuNikApp = new SecuNikApp();
    window.secuNikApp.init();
});

// Export functions for backwards compatibility
export async function uploadFile(file, settings, endpoints) {
    const api = new SecuNikAPI();
    return await api.uploadFile(file, settings);
}

export async function checkHealth(endpoints) {
    const api = new SecuNikAPI();
    const health = await api.checkHealth();
    return health.isHealthy;
}