/**
 * SecuNik API Service Module - Fixed Version
 * Handles all API communications and file operations
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

/**
 * Main API service class for SecuNik
 */
class SecuNikAPI {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.endpoints = {
            upload: '/api/analysis/upload',
            health: '/api/analysis/health',
            supportedTypes: '/api/analysis/supported-types',
            threatIntel: '/api/threat-intel/latest',
            status: '/api/analysis/status'
        };

        this.timeout = 300000; // 5 minutes
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    /**
     * Get base URL for API calls
     */
    getBaseURL() {
        // Use current origin for API calls
        return window.location.origin;
    }

    /**
     * Upload and analyze file
     */
    async uploadAndAnalyze(file, options = {}) {
        console.log('🚀 Starting file upload and analysis:', file.name);

        try {
            // Validate file first
            this.validateFile(file);

            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // Add analysis options
            const analysisOptions = this.createAnalysisOptions(options);
            formData.append('options', JSON.stringify(analysisOptions));

            // Upload with progress tracking
            const result = await this.uploadWithProgress(formData, options.onProgress);

            console.log('✅ Upload and analysis completed successfully');
            return result;

        } catch (error) {
            console.error('❌ Upload and analysis failed:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Upload file with progress tracking
     */
    async uploadWithProgress(formData, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Setup progress tracking
            if (onProgress && xhr.upload) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        onProgress(percentComplete, 'upload');
                    }
                });
            }

            // Setup response handlers
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (parseError) {
                            reject(new Error('Invalid response format'));
                        }
                    } else {
                        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                    }
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error during upload'));
            };

            xhr.ontimeout = () => {
                reject(new Error('Upload timeout'));
            };

            // Configure request
            xhr.timeout = this.timeout;
            xhr.open('POST', `${this.baseURL}${this.endpoints.upload}`, true);

            // Send request
            xhr.send(formData);
        });
    }

    /**
     * Simple file upload (for compatibility)
     */
    async uploadFile(file, settings = {}) {
        return await this.uploadAndAnalyze(file, settings);
    }

    /**
     * Check system health
     */
    async checkHealth() {
        try {
            console.log('🔍 Checking system health...');

            const response = await this.makeRequest('GET', this.endpoints.health);

            console.log('✅ Health check completed:', response);
            return response;

        } catch (error) {
            console.error('❌ Health check failed:', error);

            // Return mock health data for development
            return {
                status: 'limited',
                timestamp: new Date().toISOString(),
                services: {
                    api: 'online',
                    analysis: 'limited',
                    ai: 'offline'
                },
                capabilities: {
                    fileAnalysis: true,
                    aiInsights: false,
                    executiveReports: true,
                    timelineGeneration: true,
                    iocDetection: true,
                    forensicAnalysis: true
                },
                supportedFileTypes: 12
            };
        }
    }

    /**
     * Get supported file types
     */
    async getSupportedFileTypes() {
        try {
            const response = await this.makeRequest('GET', this.endpoints.supportedTypes);
            return response.types || [];
        } catch (error) {
            console.error('Failed to get supported file types:', error);

            // Return default supported types
            return [
                'csv', 'json', 'log', 'txt', 'evtx', 'evt',
                'pcap', 'pcapng', 'syslog', 'wtmp', 'utmp', 'btmp'
            ];
        }
    }

    /**
     * Get latest threat intelligence
     */
    async getLatestThreatIntel() {
        try {
            const response = await this.makeRequest('GET', this.endpoints.threatIntel);
            return response;
        } catch (error) {
            console.error('Failed to get threat intel:', error);

            // Return mock threat intel data
            return {
                feeds: [],
                lastUpdated: new Date().toISOString(),
                status: 'limited'
            };
        }
    }

    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(method, endpoint, data = null, retryCount = 0) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const options = {
                method: method,
                headers: {
                    'Accept': 'application/json',
                },
                timeout: this.timeout
            };

            if (data) {
                if (data instanceof FormData) {
                    options.body = data;
                } else {
                    options.headers['Content-Type'] = 'application/json';
                    options.body = JSON.stringify(data);
                }
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }

        } catch (error) {
            console.error(`Request failed (attempt ${retryCount + 1}):`, error);

            // Retry logic
            if (retryCount < this.maxRetries && this.shouldRetry(error)) {
                console.log(`Retrying request in ${this.retryDelay}ms...`);
                await this.delay(this.retryDelay);
                return this.makeRequest(method, endpoint, data, retryCount + 1);
            }

            throw error;
        }
    }

    /**
     * Check if error should trigger retry
     */
    shouldRetry(error) {
        const retryableErrors = [
            'NetworkError',
            'TimeoutError',
            'fetch error'
        ];

        return retryableErrors.some(errorType =>
            error.message.toLowerCase().includes(errorType.toLowerCase())
        );
    }

    /**
     * Delay helper for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Validate file before upload
     */
    validateFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`File size (${this.formatFileSize(file.size)}) exceeds maximum limit of ${this.formatFileSize(maxSize)}`);
        }

        // Check if file has content
        if (file.size === 0) {
            throw new Error('File is empty');
        }

        // Basic file type validation
        const extension = this.getFileExtension(file.name);
        if (!extension) {
            throw new Error('File must have an extension');
        }

        return true;
    }

    /**
     * Check if file type is valid
     */
    isValidFileType(file, supportedTypes = []) {
        const extension = this.getFileExtension(file.name);

        // Default supported types if none provided
        const defaultSupportedTypes = [
            'csv', 'json', 'log', 'txt', 'evtx', 'evt',
            'pcap', 'pcapng', 'syslog', 'wtmp', 'utmp', 'btmp',
            'lastlog', 'fwlog', 'dblog', 'maillog', 'dnslog'
        ];

        const typesToCheck = supportedTypes.length > 0 ? supportedTypes : defaultSupportedTypes;
        return typesToCheck.includes(extension);
    }

    /**
     * Get file extension
     */
    getFileExtension(filename) {
        if (!filename || typeof filename !== 'string') {
            return '';
        }
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Create analysis options
     */
    createAnalysisOptions(settings = {}) {
        return {
            enableAI: settings.enableAI !== false,
            analysisDepth: settings.analysisDepth || 'standard',
            includeTimeline: settings.includeTimeline !== false,
            generateExecutiveReport: settings.generateExecutiveReport !== false,
            confidenceThreshold: settings.confidenceThreshold || 0.8,
            enableForensics: settings.enableForensics !== false,
            timeoutMinutes: settings.timeoutMinutes || 15,
            includeNetworkAnalysis: settings.includeNetworkAnalysis || false,
            enableThreatIntel: settings.enableThreatIntel !== false,
            generateIOCs: settings.generateIOCs !== false,
            ...settings
        };
    }

    /**
     * Handle and standardize errors
     */
    handleError(error) {
        console.error('API Error:', error);

        // Create standardized error object
        const standardError = new Error();

        if (error.message) {
            standardError.message = error.message;
        } else if (typeof error === 'string') {
            standardError.message = error;
        } else {
            standardError.message = 'An unknown error occurred';
        }

        // Add error code if available
        if (error.code) {
            standardError.code = error.code;
        }

        // Add status if available
        if (error.status) {
            standardError.status = error.status;
        }

        return standardError;
    }

    /**
     * Generate mock analysis data (for development/testing)
     */
    generateMockAnalysis(file) {
        const mockData = {
            id: Date.now(),
            fileName: file.name,
            fileSize: file.size,
            timestamp: new Date().toISOString(),
            processingTime: Math.random() * 5000 + 1000, // 1-6 seconds
            result: {
                technical: {
                    securityEvents: this.generateMockEvents(),
                    detectedIOCs: this.generateMockIOCs(),
                    networkAnalysis: this.generateMockNetworkData(),
                    fileMetadata: {
                        name: file.name,
                        size: file.size,
                        type: file.type || 'application/octet-stream',
                        lastModified: file.lastModified
                    }
                },
                aiAnalysis: {
                    summary: 'Mock analysis completed. This is development data.',
                    confidence: 0.85,
                    riskScore: Math.floor(Math.random() * 100),
                    recommendations: [
                        'Review critical security events',
                        'Investigate suspicious network connections',
                        'Monitor detected IOCs'
                    ]
                },
                forensics: {
                    artifactsFound: Math.floor(Math.random() * 10) + 1,
                    evidenceIntegrity: 'verified',
                    timeline: this.generateMockTimeline()
                }
            }
        };

        return mockData;
    }

    /**
     * Generate mock security events
     */
    generateMockEvents() {
        const eventTypes = ['Login Attempt', 'File Access', 'Network Connection', 'Process Execution', 'Registry Change'];
        const severities = ['low', 'medium', 'high', 'critical'];

        const events = [];
        const eventCount = Math.floor(Math.random() * 20) + 5;

        for (let i = 0; i < eventCount; i++) {
            events.push({
                id: i + 1,
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                severity: severities[Math.floor(Math.random() * severities.length)],
                description: `Mock security event ${i + 1}`,
                source: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                user: `user${Math.floor(Math.random() * 10) + 1}`
            });
        }

        return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Generate mock IOCs
     */
    generateMockIOCs() {
        const iocTypes = ['ip', 'domain', 'hash', 'email', 'url'];
        const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25'];
        const domains = ['suspicious.example.com', 'malware.test.org', 'phishing.sample.net'];

        const iocs = [];
        const iocCount = Math.floor(Math.random() * 10) + 3;

        for (let i = 0; i < iocCount; i++) {
            const type = iocTypes[Math.floor(Math.random() * iocTypes.length)];
            let value;

            switch (type) {
                case 'ip':
                    value = ips[Math.floor(Math.random() * ips.length)];
                    break;
                case 'domain':
                    value = domains[Math.floor(Math.random() * domains.length)];
                    break;
                case 'hash':
                    value = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                    break;
                case 'email':
                    value = `suspicious${i}@example.com`;
                    break;
                case 'url':
                    value = `http://malicious${i}.example.com/path`;
                    break;
                default:
                    value = `mock_ioc_${i}`;
            }

            iocs.push({
                id: i + 1,
                type: type,
                value: value,
                confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
                firstSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                source: 'SecuNik Analysis Engine'
            });
        }

        return iocs;
    }

    /**
     * Generate mock network data
     */
    generateMockNetworkData() {
        return {
            connections: Math.floor(Math.random() * 100) + 10,
            protocols: ['TCP', 'UDP', 'ICMP'],
            ports: [80, 443, 22, 21, 25, 53],
            bandwidth: Math.floor(Math.random() * 1000) + 100
        };
    }

    /**
     * Generate mock timeline
     */
    generateMockTimeline() {
        const events = [];
        const eventCount = Math.floor(Math.random() * 15) + 5;

        for (let i = 0; i < eventCount; i++) {
            events.push({
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                event: `Timeline event ${i + 1}`,
                type: 'system',
                importance: Math.random() > 0.7 ? 'high' : 'normal'
            });
        }

        return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
}

/**
 * File Upload Handler
 */
class FileUploadHandler {
    constructor(apiInstance) {
        this.api = apiInstance || new SecuNikAPI();
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.supportedTypes = [];
        this.isUploading = false;
    }

    /**
     * Initialize with supported file types
     */
    async init() {
        try {
            this.supportedTypes = await this.api.getSupportedFileTypes();
        } catch (error) {
            console.error('Failed to load supported file types:', error);
            // Use default types
            this.supportedTypes = ['csv', 'json', 'log', 'txt', 'evtx', 'evt', 'pcap', 'pcapng'];
        }
    }

    /**
     * Handle file selection
     */
    async handleFileSelect(files, options = {}) {
        if (!files || files.length === 0) {
            throw new Error('No files selected');
        }

        if (this.isUploading) {
            throw new Error('Upload already in progress');
        }

        const file = files[0]; // Take first file
        this.isUploading = true;

        try {
            // Validate file
            this.validateFile(file);

            // Show progress if callback provided
            if (options.onProgress) {
                options.onProgress(0, 'starting');
            }

            // Upload and analyze
            const result = await this.api.uploadAndAnalyze(file, options);

            if (options.onProgress) {
                options.onProgress(100, 'complete');
            }

            return result;

        } catch (error) {
            if (options.onError) {
                options.onError(error);
            }
            throw error;
        } finally {
            this.isUploading = false;
        }
    }

    /**
     * Validate file
     */
    validateFile(file) {
        // Check if file exists
        if (!file) {
            throw new Error('No file selected');
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            throw new Error(`File size (${this.api.formatFileSize(file.size)}) exceeds maximum limit of ${this.api.formatFileSize(this.maxFileSize)}`);
        }

        // Check file type if we have supported types
        if (this.supportedTypes.length > 0 && !this.api.isValidFileType(file, this.supportedTypes)) {
            const extension = this.api.getFileExtension(file.name);
            throw new Error(`File type '.${extension}' is not supported. Supported types: ${this.supportedTypes.join(', ')}`);
        }

        return true;
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
    return await api.checkHealth();
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