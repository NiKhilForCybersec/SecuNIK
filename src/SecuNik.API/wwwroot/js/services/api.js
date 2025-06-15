/**
 * SecuNik API Service
 * Handles all API communication with the .NET backend
 */

class SecuNikAPI {
    constructor() {
        // Determine API base URL. If the dashboard is opened directly from the
        // filesystem, window.location.origin will be "null" and API calls will
        // fail. Default to the local development server in that case.
        const origin = window.location.origin;
        if (!origin || origin === 'null' || origin.startsWith('file://')) {
            this.baseURL = 'http://localhost:5043';
        } else {
            this.baseURL = origin;
        }
        this.endpoints = {
            upload: '/api/analysis/upload',
            analyzePath: '/api/analysis/analyze-path',
            supportedTypes: '/api/analysis/supported-types',
            health: '/api/analysis/health',
            canProcess: '/api/analysis/can-process',
            threatIntelLatest: '/api/threatintel/latest'
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
                status: response.status,
                data: response.ok ? await response.json() : null
            };
        } catch (error) {
            console.error('Health check error:', error);
            return {
                isHealthy: false,
                status: 0,
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

    // Retrieve latest threat intelligence
    async getLatestThreatIntel() {
        try {
            const response = await fetch(this.baseURL + this.endpoints.threatIntelLatest, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                throw new Error(`Failed to get threat intel: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Threat intel fetch error:', error);
            throw error;
        }
    }

    // Upload with progress tracking
    async uploadAndAnalyze(file, options = {}) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();

            formData.append('file', file);
            if (options.settings) {
                formData.append('options', JSON.stringify(options.settings));
            }

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && options.onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    options.onProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.error || `Upload failed: ${xhr.status}`));
                    } catch (e) {
                        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                    }
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timeout'));
            });

            xhr.open('POST', this.baseURL + this.endpoints.upload);
            xhr.timeout = 300000; // 5 minutes
            xhr.send(formData);
        });
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
        const commonSupportedTypes = ['csv', 'log', 'txt', 'evtx', 'evt', 'pcap', 'pcapng', 'json'];

        const typesToCheck = supportedTypes.length > 0 ? supportedTypes : commonSupportedTypes;
        return typesToCheck.includes(extension);
    }

    // Utility: Get file extension
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    // Create analysis options
    createAnalysisOptions(settings = {}) {
        return {
            enableAI: settings.enableAI !== false,
            analysisDepth: settings.analysisDepth || 'standard',
            includeTimeline: settings.includeTimeline !== false,
            generateExecutiveReport: settings.generateExecutiveReport !== false,
            confidenceThreshold: settings.confidenceThreshold || 0.8,
            enableForensics: settings.enableForensics !== false,
            timeoutMinutes: settings.timeoutMinutes || 15,
            ...settings
        };
    }
}

// File Upload Handler
class FileUploadHandler {
    constructor(apiInstance) {
        this.api = apiInstance || new SecuNikAPI();
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.supportedTypes = ['csv', 'log', 'txt', 'evtx', 'evt', 'pcap', 'pcapng', 'json'];
        this.isUploading = false;
    }

    // Handle file selection
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
        this.isUploading = true;
        console.log(`Starting upload: ${file.name}`);

        // Show progress UI if it exists
        const progressElement = document.getElementById('analysisProgress');
        if (progressElement) {
            progressElement.style.display = 'block';
        }
    }

    hideUploadProgress() {
        this.isUploading = false;

        // Hide progress UI if it exists
        const progressElement = document.getElementById('analysisProgress');
        if (progressElement) {
            progressElement.style.display = 'none';
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
        // Use existing notification system if available
        if (window.secuNikDashboard && window.secuNikDashboard.showNotification) {
            window.secuNikDashboard.showNotification(`${title}: ${message}`, type);
            return;
        }

        // Fallback notification
        console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    }
}

// Export functions for backwards compatibility and module imports
export async function uploadFile(file, settings = {}) {
    const api = new SecuNikAPI();
    return await api.uploadFile(file, settings);
}

export async function uploadAndAnalyze(file, options = {}) {
    const api = new SecuNikAPI();
    return await api.uploadAndAnalyze(file, options);
}

export async function checkHealth() {
    const api = new SecuNikAPI();
    const health = await api.checkHealth();
    return health;
}

export async function getLatestThreatIntel() {
    const api = new SecuNikAPI();
    return await api.getLatestThreatIntel();
}

export async function getSupportedFileTypes() {
    const api = new SecuNikAPI();
    return await api.getSupportedFileTypes();
}

// Export classes
export { FileUploadHandler, SecuNikAPI };

// Global access for non-module environments
if (typeof window !== 'undefined') {
    window.SecuNikAPI = SecuNikAPI;
    window.FileUploadHandler = FileUploadHandler;
}