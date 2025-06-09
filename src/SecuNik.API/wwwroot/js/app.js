// SecuNik Advanced Cybersecurity Platform - Main JavaScript with Enhanced Debugging

class SecuNikApp {
    constructor() {
        this.currentAnalysisResults = null; // Store analysis results for filtering
        this.currentFileInfo = null; // Store current file information
        this.initializeElements();
        this.setupEventListeners();
        this.checkSystemStatus();
        this.testAPIConnection(); // Add API connectivity test
    }

    initializeElements() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.chooseFilesBtn = document.getElementById('chooseFilesBtn');
        this.results = document.getElementById('results');
        this.systemStatus = document.getElementById('systemStatus');
    }

    setupEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFiles(e.target.files);
            }
        });

        // Choose files button
        this.chooseFilesBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Drag and drop events
        this.uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', this.handleTabClick.bind(this));
        });

        // Prevent default drag behaviors on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFiles(files);
        }
    }

    handleTabClick(e) {
        const tabName = e.target.dataset.tab;
        if (!tabName) return;

        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to clicked tab and corresponding content
        e.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    async handleFiles(files) {
        const file = files[0]; // Process first file

        console.log('=== FILE UPLOAD DEBUG ===');
        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });

        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        // Store file information for later use
        this.currentFileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };

        // Show results panel
        this.showResults();

        // Update file info immediately
        this.updateFileInfo(file);

        // Show loading states
        this.showLoadingStates();

        const startTime = performance.now();

        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            console.log('Sending request to /api/analysis/upload');
            console.log('FormData contents:', [...formData.entries()]);

            // Send to SecuNik API with better error handling
            const response = await fetch('/api/analysis/upload', {
                method: 'POST',
                body: formData
            });

            const endTime = performance.now();
            const processingTime = ((endTime - startTime) / 1000).toFixed(2);

            console.log('Response status:', response.status);
            console.log('Response statusText:', response.statusText);
            console.log('Response headers:', [...response.headers.entries()]);
            console.log('Processing time:', processingTime, 'seconds');

            if (!response.ok) {
                // Try to get error details from response
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorData = await response.text();
                    console.log('Error response body:', errorData);

                    // Try to parse as JSON
                    try {
                        const jsonError = JSON.parse(errorData);
                        errorMessage = jsonError.error || jsonError.message || errorMessage;
                        console.log('Parsed error JSON:', jsonError);
                    } catch (e) {
                        // If not JSON, use the text as error message
                        errorMessage = errorData || errorMessage;
                        console.log('Error response is not JSON, using text:', errorData);
                    }
                } catch (e) {
                    console.log('Could not read error response body:', e);
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Analysis result:', result);

            // Enhance result with file information and processing time
            result.fileInfo = {
                ...this.currentFileInfo,
                size: file.size,  // Ensure we always have the size
                name: file.name,
                type: file.type || 'application/octet-stream'
            };
            result.processingTime = `${processingTime}s`;
            result.fileSize = file.size;  // Also store at root level

            console.log('Enhanced result with file info:', {
                'result.fileSize': result.fileSize,
                'result.fileInfo': result.fileInfo,
                'originalFileSize': file.size
            });

            // Store results for filtering
            this.currentAnalysisResults = result;

            this.displayAnalysisResults(result);

        } catch (error) {
            console.error('Analysis error:', error);
            this.displayError(error.message);
        }
    }

    validateFile(file) {
        console.log('Validating file:', file.name);

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            console.log('File too large:', file.size, 'bytes (max:', maxSize, ')');
            this.showNotification('File too large. Maximum size is 50MB.', 'error');
            return false;
        }

        // Check file type - be more permissive for .log files
        const fileName = file.name.toLowerCase();
        const allowedExtensions = ['.csv', '.json', '.log', '.txt'];
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            console.log('Invalid file extension for:', file.name);
            this.showNotification(`Unsupported file type. File: ${file.name}. Please upload CSV, JSON, LOG, or TXT files.`, 'error');
            return false;
        }

        console.log('File validation passed for:', file.name);
        return true;
    }

    showResults() {
        this.results.classList.remove('hidden');
        this.results.scrollIntoView({ behavior: 'smooth' });
    }

    updateFileInfo(file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileType').textContent = file.type || 'Unknown';

        // Also update file size if there's an element for it
        const fileSizeElement = document.getElementById('fileSize');
        if (fileSizeElement) {
            fileSizeElement.textContent = this.formatFileSize(file.size);
        }

        console.log('Updated file info display:', {
            name: file.name,
            type: file.type,
            size: file.size,
            formattedSize: this.formatFileSize(file.size)
        });
    }

    showLoadingStates() {
        // Reset all metrics
        document.getElementById('eventCount').textContent = '-';
        document.getElementById('iocCount').textContent = '-';
        document.getElementById('riskScore').textContent = '-';

        // Show loading in all tabs
        const loadingHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>Analyzing...</span>
            </div>
        `;

        document.getElementById('threatsList').innerHTML = loadingHTML;
        document.getElementById('iocsList').innerHTML = loadingHTML;
        document.getElementById('timelineData').innerHTML = loadingHTML;
        document.getElementById('executiveReport').innerHTML = loadingHTML;
    }

    displayAnalysisResults(result) {
        const data = result.result || result;

        try {
            // Update overview metrics
            this.updateOverviewMetrics(data);

            // Update severity badge
            this.updateSeverityBadge(data);

            // Update individual tabs
            this.updateThreatsTab(data);
            this.updateIOCsTab(data);
            this.updateTimelineTab(data);
            this.updateExecutiveTab(data);

            this.showNotification('Analysis completed successfully!', 'success');

        } catch (error) {
            console.error('Error displaying results:', error);
            this.displayError('Error displaying analysis results');
        }
    }

    updateOverviewMetrics(data) {
        const technical = data.technical || {};
        const ai = data.ai || {};

        // Update basic metrics
        document.getElementById('eventCount').textContent =
            technical.securityEvents?.length || 0;
        document.getElementById('iocCount').textContent =
            technical.detectedIOCs?.length || 0;
        document.getElementById('riskScore').textContent =
            ai.severityScore || 'N/A';

        // Create enhanced overview content
        this.createEnhancedOverview(data);
    }

    createEnhancedOverview(data) {
        const technical = data.technical || {};
        const ai = data.ai || {};
        const executive = data.executive || {};

        // Get the overview tab content area
        const overviewContent = document.getElementById('overview');

        // Analyze IOCs by type
        const iocAnalysis = this.analyzeIOCs(technical.detectedIOCs || []);

        // Analyze threats by severity
        const threatAnalysis = this.analyzeThreats(technical.securityEvents || []);

        // Create enhanced overview HTML
        const enhancedHTML = `
            <div class="overview-enhanced">
                <!-- Quick Stats Grid -->
                <div class="quick-stats-grid">
                    <div class="stat-card critical">
                        <div class="stat-icon">🚨</div>
                        <div class="stat-info">
                            <div class="stat-number">${threatAnalysis.critical}</div>
                            <div class="stat-label">Critical Threats</div>
                        </div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-info">
                            <div class="stat-number">${threatAnalysis.high}</div>
                            <div class="stat-label">High Priority</div>
                        </div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <div class="stat-number">${iocAnalysis.uniqueDomains}</div>
                            <div class="stat-label">Unique Domains</div>
                        </div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon">🛡️</div>
                        <div class="stat-info">
                            <div class="stat-number">${this.calculateConfidenceScore(data)}%</div>
                            <div class="stat-label">Confidence</div>
                        </div>
                    </div>
                </div>

                <!-- File Intelligence -->
                <div class="intelligence-section">
                    <h3>📁 File Intelligence</h3>
                    <div class="intel-grid">
                        <div class="intel-item">
                            <span class="intel-label">File Size:</span>
                            <span class="intel-value">${this.getActualFileSize(data)}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">Lines Processed:</span>
                            <span class="intel-value">${technical.totalLines || technical.lineCount || this.estimateLines(data) || 'N/A'}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">Processing Time:</span>
                            <span class="intel-value">${data.processingTime || 'N/A'}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">Format:</span>
                            <span class="intel-value">${this.detectFileFormat(data)}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">File Name:</span>
                            <span class="intel-value">${data.fileInfo?.name || this.currentFileInfo?.name || 'Unknown'}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">Upload Time:</span>
                            <span class="intel-value">${new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                <!-- IOC Breakdown -->
                <div class="intelligence-section">
                    <h3>🎯 IOC Intelligence</h3>
                    <div class="ioc-breakdown">
                        <div class="ioc-type-card">
                            <div class="ioc-type-header">
                                <span class="ioc-icon">🌐</span>
                                <span class="ioc-type-name">IP Addresses</span>
                                <span class="ioc-count">${iocAnalysis.ips}</span>
                            </div>
                            <div class="ioc-risk ${this.getIPRiskLevel(iocAnalysis.ips)}">
                                ${this.getIPRiskDescription(iocAnalysis.ips)}
                            </div>
                        </div>
                        <div class="ioc-type-card">
                            <div class="ioc-type-header">
                                <span class="ioc-icon">🌍</span>
                                <span class="ioc-type-name">Domains</span>
                                <span class="ioc-count">${iocAnalysis.domains}</span>
                            </div>
                            <div class="ioc-risk ${this.getDomainRiskLevel(iocAnalysis.domains)}">
                                ${this.getDomainRiskDescription(iocAnalysis.domains)}
                            </div>
                        </div>
                        <div class="ioc-type-card">
                            <div class="ioc-type-header">
                                <span class="ioc-icon">📧</span>
                                <span class="ioc-type-name">Emails</span>
                                <span class="ioc-count">${iocAnalysis.emails}</span>
                            </div>
                            <div class="ioc-risk ${this.getEmailRiskLevel(iocAnalysis.emails)}">
                                ${this.getEmailRiskDescription(iocAnalysis.emails)}
                            </div>
                        </div>
                        <div class="ioc-type-card">
                            <div class="ioc-type-header">
                                <span class="ioc-icon">🔐</span>
                                <span class="ioc-type-name">Hashes</span>
                                <span class="ioc-count">${iocAnalysis.hashes}</span>
                            </div>
                            <div class="ioc-risk ${this.getHashRiskLevel(iocAnalysis.hashes)}">
                                ${this.getHashRiskDescription(iocAnalysis.hashes)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Threat Assessment -->
                <div class="intelligence-section">
                    <h3>⚡ Threat Assessment</h3>
                    <div class="threat-assessment">
                        <div class="assessment-item priority-critical">
                            <div class="assessment-label">Immediate Action Required:</div>
                            <div class="assessment-value">${this.getImmediateActions(data)}</div>
                        </div>
                        <div class="assessment-item priority-high">
                            <div class="assessment-label">Primary Attack Vectors:</div>
                            <div class="assessment-value">${this.getAttackVectors(technical.securityEvents || [])}</div>
                        </div>
                        <div class="assessment-item priority-medium">
                            <div class="assessment-label">Potential Impact:</div>
                            <div class="assessment-value">${ai.potentialImpact || executive.businessImpact || 'Data exfiltration, system compromise'}</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="intelligence-section">
                    <h3>⚡ Quick Actions</h3>
                    <div class="quick-actions">
                        <button class="action-btn primary" onclick="window.secuNikApp.exportAllIOCs()">
                            📤 Export All IOCs
                        </button>
                        <button class="action-btn secondary" onclick="window.secuNikApp.generateReport()">
                            📄 Generate Report
                        </button>
                        <button class="action-btn warning" onclick="window.secuNikApp.escalateToSOC()">
                            🚨 Escalate to SOC
                        </button>
                        <button class="action-btn info" onclick="window.secuNikApp.searchThreatIntel()">
                            🔍 Search Threat Intel
                        </button>
                    </div>
                </div>

                <!-- Timeline Summary -->
                <div class="intelligence-section">
                    <h3>⏰ Activity Timeline</h3>
                    <div class="timeline-summary">
                        ${this.createTimelineSummary(data.timeline?.events || [])}
                    </div>
                </div>

                <!-- Recommendations -->
                <div class="intelligence-section">
                    <h3>💡 Analyst Recommendations</h3>
                    <div class="recommendations">
                        ${this.generateRecommendations(data).map(rec => `
                            <div class="recommendation-item ${rec.priority}">
                                <div class="rec-icon">${rec.icon}</div>
                                <div class="rec-content">
                                    <div class="rec-title">${rec.title}</div>
                                    <div class="rec-description">${rec.description}</div>
                                </div>
                                <div class="rec-priority">${rec.priority.toUpperCase()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Replace the basic overview content
        overviewContent.innerHTML = enhancedHTML;
    }

    updateSeverityBadge(data) {
        const severityScore = data.ai?.severityScore || 5;
        const badge = document.getElementById('severityBadge');

        if (severityScore >= 7) {
            badge.textContent = 'High';
            badge.className = 'severity high';
        } else if (severityScore >= 4) {
            badge.textContent = 'Medium';
            badge.className = 'severity medium';
        } else {
            badge.textContent = 'Low';
            badge.className = 'severity low';
        }
    }

    updateThreatsTab(data) {
        const threats = data.technical?.securityEvents || [];
        const threatsList = document.getElementById('threatsList');

        if (threats.length > 0) {
            threatsList.innerHTML = threats.map(threat => `
                <div class="metric">
                    <span><strong>${threat.eventType}:</strong> ${threat.description}</span>
                    <span class="severity ${threat.severity.toLowerCase()}">${threat.severity}</span>
                </div>
            `).join('');
        } else {
            threatsList.innerHTML = '<p>No security threats detected in the uploaded file.</p>';
        }
    }

    // FIXED IOC Tab Update Function
    updateIOCsTab(data) {
        const iocs = data.technical?.detectedIOCs || [];
        const iocsList = document.getElementById('iocsList');

        if (iocs.length > 0) {
            // Categorize IOCs
            const categorizedIOCs = this.categorizeIOCs(iocs);

            // Create the IOC interface with filters and content
            iocsList.innerHTML = `
                <div class="ioc-filters">
                    <button class="ioc-filter-btn active" data-filter="all">All (${iocs.length})</button>
                    <button class="ioc-filter-btn" data-filter="ip">IPs (${categorizedIOCs.ips.length})</button>
                    <button class="ioc-filter-btn" data-filter="domain">Domains (${categorizedIOCs.domains.length})</button>
                    <button class="ioc-filter-btn" data-filter="email">Emails (${categorizedIOCs.emails.length})</button>
                    <button class="ioc-filter-btn" data-filter="hash">Hashes (${categorizedIOCs.hashes.length})</button>
                    <button class="ioc-filter-btn" data-filter="url">URLs (${categorizedIOCs.urls.length})</button>
                    <button class="ioc-filter-btn" data-filter="other">Other (${categorizedIOCs.other.length})</button>
                </div>
                <div class="ioc-content-wrapper">
                    <div class="ioc-category-content active" data-category="all">
                        ${this.renderAllIOCs(categorizedIOCs)}
                    </div>
                    <div class="ioc-category-content" data-category="ip">
                        ${this.renderIOCsByCategory(categorizedIOCs.ips)}
                    </div>
                    <div class="ioc-category-content" data-category="domain">
                        ${this.renderIOCsByCategory(categorizedIOCs.domains)}
                    </div>
                    <div class="ioc-category-content" data-category="email">
                        ${this.renderIOCsByCategory(categorizedIOCs.emails)}
                    </div>
                    <div class="ioc-category-content" data-category="hash">
                        ${this.renderIOCsByCategory(categorizedIOCs.hashes)}
                    </div>
                    <div class="ioc-category-content" data-category="url">
                        ${this.renderIOCsByCategory(categorizedIOCs.urls)}
                    </div>
                    <div class="ioc-category-content" data-category="other">
                        ${this.renderIOCsByCategory(categorizedIOCs.other)}
                    </div>
                </div>
            `;

            // Setup filter event listeners AFTER the HTML is created
            this.setupIOCFilters();
        } else {
            iocsList.innerHTML = '<p>No indicators of compromise found.</p>';
        }
    }

    categorizeIOCs(iocs) {
        const categorized = {
            ips: [],
            domains: [],
            emails: [],
            hashes: [],
            urls: [],
            other: []
        };

        iocs.forEach(ioc => {
            const lowerIOC = ioc.toLowerCase();

            if (lowerIOC.startsWith('ip:')) {
                categorized.ips.push({
                    type: 'IP Address',
                    value: ioc.substring(3).trim(),
                    original: ioc,
                    icon: '🌐',
                    color: 'ip'
                });
            } else if (lowerIOC.startsWith('domain:')) {
                categorized.domains.push({
                    type: 'Domain',
                    value: ioc.substring(7).trim(),
                    original: ioc,
                    icon: '🌍',
                    color: 'domain'
                });
            } else if (lowerIOC.startsWith('email:')) {
                categorized.emails.push({
                    type: 'Email',
                    value: ioc.substring(6).trim(),
                    original: ioc,
                    icon: '📧',
                    color: 'email'
                });
            } else if (lowerIOC.startsWith('hash:')) {
                const hashValue = ioc.substring(5).trim();
                const hashType = this.detectHashType(hashValue);
                categorized.hashes.push({
                    type: hashType,
                    value: hashValue,
                    original: ioc,
                    icon: '🔐',
                    color: 'hash'
                });
            } else if (lowerIOC.startsWith('url:')) {
                categorized.urls.push({
                    type: 'URL',
                    value: ioc.substring(4).trim(),
                    original: ioc,
                    icon: '🔗',
                    color: 'url'
                });
            } else {
                // Try to auto-detect type for uncategorized IOCs
                const detectedType = this.autoDetectIOCType(ioc);
                if (detectedType.category !== 'other') {
                    categorized[detectedType.category].push(detectedType);
                } else {
                    categorized.other.push({
                        type: 'Unknown',
                        value: ioc,
                        original: ioc,
                        icon: '❓',
                        color: 'other'
                    });
                }
            }
        });

        return categorized;
    }

    autoDetectIOCType(ioc) {
        // IP Address pattern
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)) {
            return {
                type: 'IP Address',
                value: ioc,
                original: ioc,
                icon: '🌐',
                color: 'ip',
                category: 'ips'
            };
        }

        // Email pattern
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ioc)) {
            return {
                type: 'Email',
                value: ioc,
                original: ioc,
                icon: '📧',
                color: 'email',
                category: 'emails'
            };
        }

        // Domain pattern
        if (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.?)+$/.test(ioc)) {
            return {
                type: 'Domain',
                value: ioc,
                original: ioc,
                icon: '🌍',
                color: 'domain',
                category: 'domains'
            };
        }

        // Hash patterns
        if (/^[a-fA-F0-9]{32}$/.test(ioc) || /^[a-fA-F0-9]{40}$/.test(ioc) || /^[a-fA-F0-9]{64}$/.test(ioc)) {
            return {
                type: this.detectHashType(ioc),
                value: ioc,
                original: ioc,
                icon: '🔐',
                color: 'hash',
                category: 'hashes'
            };
        }

        // URL pattern
        if (/^https?:\/\//.test(ioc)) {
            return {
                type: 'URL',
                value: ioc,
                original: ioc,
                icon: '🔗',
                color: 'url',
                category: 'urls'
            };
        }

        // Default to other
        return {
            type: 'Unknown',
            value: ioc,
            original: ioc,
            icon: '❓',
            color: 'other',
            category: 'other'
        };
    }

    detectHashType(hash) {
        if (hash.length === 32) return 'MD5 Hash';
        if (hash.length === 40) return 'SHA1 Hash';
        if (hash.length === 64) return 'SHA256 Hash';
        return 'Hash';
    }

    renderAllIOCs(categorizedIOCs) {
        const allIOCs = [
            ...categorizedIOCs.ips,
            ...categorizedIOCs.domains,
            ...categorizedIOCs.emails,
            ...categorizedIOCs.hashes,
            ...categorizedIOCs.urls,
            ...categorizedIOCs.other
        ];

        if (allIOCs.length === 0) {
            return '<div class="no-iocs">No IOCs found</div>';
        }

        return allIOCs.map(ioc => this.renderIOCItem(ioc)).join('');
    }

    renderIOCsByCategory(iocs) {
        if (iocs.length === 0) {
            return '<div class="no-iocs">No IOCs found in this category</div>';
        }

        return iocs.map(ioc => this.renderIOCItem(ioc)).join('');
    }

    renderIOCItem(ioc) {
        return `
            <div class="ioc-item ${ioc.color}">
                <div class="ioc-header">
                    <span class="ioc-icon">${ioc.icon}</span>
                    <span class="ioc-type">${ioc.type}</span>
                    <span class="ioc-status">Detected</span>
                </div>
                <div class="ioc-value" title="${ioc.value}">
                    ${ioc.value}
                </div>
                <div class="ioc-actions">
                    <button class="ioc-action-btn" onclick="navigator.clipboard.writeText('${ioc.value}').then(() => window.secuNikApp.showNotification('Copied to clipboard!', 'success'))">📋 Copy</button>
                    <button class="ioc-action-btn" onclick="window.secuNikApp.searchIOC('${ioc.value}')">🔍 Search</button>
                    <button class="ioc-action-btn" onclick="window.secuNikApp.exportIOC('${ioc.value}', '${ioc.type}')">📤 Export</button>
                </div>
            </div>
        `;
    }

    // FIXED IOC Filter Setup
    setupIOCFilters() {
        // Add event listeners to filter buttons
        document.querySelectorAll('.ioc-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterIOCs(filter);

                // Update active button
                document.querySelectorAll('.ioc-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    // NEW: IOC Filtering Function
    filterIOCs(filter) {
        // Hide all content sections
        document.querySelectorAll('.ioc-category-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show the selected content section
        const targetContent = document.querySelector(`[data-category="${filter}"]`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    getActualFileSize(data) {
        // Try multiple sources for file size
        let fileSize = 0;

        // 1. Check enhanced result data
        if (data.fileSize && data.fileSize > 0) {
            fileSize = data.fileSize;
        }
        // 2. Check file info from upload
        else if (data.fileInfo?.size && data.fileInfo.size > 0) {
            fileSize = data.fileInfo.size;
        }
        // 3. Check current file info stored during upload
        else if (this.currentFileInfo?.size && this.currentFileInfo.size > 0) {
            fileSize = this.currentFileInfo.size;
        }
        // 4. Check if we have it in the technical section
        else if (data.technical?.fileSize && data.technical.fileSize > 0) {
            fileSize = data.technical.fileSize;
        }
        // 5. Last resort - estimate from content
        else {
            const iocCount = data.technical?.detectedIOCs?.length || 0;
            const eventCount = data.technical?.securityEvents?.length || 0;
            if (iocCount > 0 || eventCount > 0) {
                // Rough estimate: each IOC/event represents ~100-200 bytes on average
                fileSize = Math.max(iocCount * 150, eventCount * 100, 1024); // At least 1KB
            }
        }

        console.log('File size sources:', {
            'data.fileSize': data.fileSize,
            'data.fileInfo?.size': data.fileInfo?.size,
            'this.currentFileInfo?.size': this.currentFileInfo?.size,
            'data.technical?.fileSize': data.technical?.fileSize,
            'calculated': fileSize
        });

        return this.formatFileSize(fileSize);
    }

    detectFileFormat(data) {
        const technical = data.technical || {};
        const fileInfo = data.fileInfo || this.currentFileInfo;

        // Check if backend provided format
        if (technical.fileFormat) {
            return technical.fileFormat;
        }

        // Detect from filename
        if (fileInfo?.name) {
            const fileName = fileInfo.name.toLowerCase();
            if (fileName.endsWith('.csv')) return 'CSV (Comma Separated Values)';
            if (fileName.endsWith('.log')) return 'LOG (System Log File)';
            if (fileName.endsWith('.txt')) return 'TXT (Plain Text)';
            if (fileName.endsWith('.json')) return 'JSON (JavaScript Object Notation)';
        }

        // Detect from MIME type
        if (fileInfo?.type) {
            if (fileInfo.type.includes('csv')) return 'CSV File';
            if (fileInfo.type.includes('text')) return 'Text File';
            if (fileInfo.type.includes('json')) return 'JSON File';
        }

        return 'Auto-detected';
    }

    estimateLines(data) {
        const technical = data.technical || {};
        const fileSize = data.fileSize || data.fileInfo?.size || 0;

        // If backend provided line count, use it
        if (technical.totalLines || technical.lineCount) {
            return technical.totalLines || technical.lineCount;
        }

        // Estimate based on IOCs and events found
        const iocCount = technical.detectedIOCs?.length || 0;
        const eventCount = technical.securityEvents?.length || 0;

        if (iocCount > 0 || eventCount > 0) {
            // Rough estimate: assume each IOC/event represents ~2-5 lines
            return Math.max(iocCount * 3, eventCount * 2, Math.floor(fileSize / 50));
        }

        // Rough estimate based on file size (assuming ~50 bytes per line average)
        if (fileSize > 0) {
            return Math.floor(fileSize / 50);
        }

        return 'N/A';
    }
    analyzeIOCs(iocs) {
        const analysis = {
            ips: 0,
            domains: 0,
            emails: 0,
            hashes: 0,
            urls: 0,
            uniqueDomains: 0
        };

        const domainSet = new Set();

        iocs.forEach(ioc => {
            const lowerIOC = ioc.toLowerCase();

            if (lowerIOC.startsWith('ip:') || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)) {
                analysis.ips++;
            } else if (lowerIOC.startsWith('domain:') || /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.?)+$/.test(ioc)) {
                analysis.domains++;
                const domain = lowerIOC.startsWith('domain:') ? ioc.substring(7).trim() : ioc;
                domainSet.add(domain);
            } else if (lowerIOC.startsWith('email:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ioc)) {
                analysis.emails++;
            } else if (lowerIOC.startsWith('hash:') || /^[a-fA-F0-9]{32,64}$/.test(ioc)) {
                analysis.hashes++;
            } else if (lowerIOC.startsWith('url:') || /^https?:\/\//.test(ioc)) {
                analysis.urls++;
            }
        });

        analysis.uniqueDomains = domainSet.size;
        return analysis;
    }

    analyzeThreats(threats) {
        const analysis = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        threats.forEach(threat => {
            const severity = threat.severity?.toLowerCase() || 'medium';
            if (analysis.hasOwnProperty(severity)) {
                analysis[severity]++;
            }
        });

        return analysis;
    }

    calculateConfidenceScore(data) {
        const technical = data.technical || {};
        const ai = data.ai || {};

        let score = 50; // Base score

        // Add points for IOCs found
        const iocCount = technical.detectedIOCs?.length || 0;
        score += Math.min(iocCount * 2, 30);

        // Add points for security events
        const eventCount = technical.securityEvents?.length || 0;
        score += Math.min(eventCount, 20);

        // Adjust based on AI severity
        const severity = ai.severityScore || 5;
        if (severity >= 8) score += 10;
        else if (severity >= 6) score += 5;

        return Math.min(score, 95);
    }

    getIPRiskLevel(count) {
        if (count > 20) return 'high';
        if (count > 5) return 'medium';
        return 'low';
    }

    getIPRiskDescription(count) {
        if (count > 20) return 'High volume indicates potential botnet or scanning activity';
        if (count > 5) return 'Moderate suspicious IP activity detected';
        if (count > 0) return 'Low-level IP activity observed';
        return 'No suspicious IPs detected';
    }

    getDomainRiskLevel(count) {
        if (count > 15) return 'high';
        if (count > 5) return 'medium';
        return 'low';
    }

    getDomainRiskDescription(count) {
        if (count > 15) return 'Multiple domains suggest C2 infrastructure';
        if (count > 5) return 'Several domains require investigation';
        if (count > 0) return 'Few domains identified for review';
        return 'No suspicious domains found';
    }

    getEmailRiskLevel(count) {
        if (count > 10) return 'high';
        if (count > 3) return 'medium';
        return 'low';
    }

    getEmailRiskDescription(count) {
        if (count > 10) return 'High email activity suggests phishing campaign';
        if (count > 3) return 'Multiple emails detected, investigate sources';
        if (count > 0) return 'Limited email indicators found';
        return 'No email indicators detected';
    }

    getHashRiskLevel(count) {
        if (count > 5) return 'high';
        if (count > 2) return 'medium';
        return 'low';
    }

    getHashRiskDescription(count) {
        if (count > 5) return 'Multiple file hashes indicate malware presence';
        if (count > 2) return 'Several file signatures require analysis';
        if (count > 0) return 'File hashes detected for verification';
        return 'No file hashes identified';
    }

    getImmediateActions(data) {
        const technical = data.technical || {};
        const threats = technical.securityEvents || [];
        const iocs = technical.detectedIOCs || [];

        const actions = [];

        if (threats.some(t => t.severity?.toLowerCase() === 'critical')) {
            actions.push('Isolate affected systems');
        }

        if (iocs.length > 50) {
            actions.push('Block all IOCs at firewall');
        }

        if (threats.some(t => t.eventType?.toLowerCase().includes('login'))) {
            actions.push('Reset compromised credentials');
        }

        if (actions.length === 0) {
            actions.push('Continue monitoring');
        }

        return actions.join(', ');
    }

    getAttackVectors(events) {
        const vectors = new Set();

        events.forEach(event => {
            const eventType = event.eventType?.toLowerCase() || '';
            const description = event.description?.toLowerCase() || '';

            if (eventType.includes('login') || description.includes('authentication')) {
                vectors.add('Credential compromise');
            }
            if (eventType.includes('network') || description.includes('connection')) {
                vectors.add('Network infiltration');
            }
            if (eventType.includes('file') || description.includes('malware')) {
                vectors.add('Malware execution');
            }
            if (eventType.includes('email') || description.includes('phishing')) {
                vectors.add('Phishing attack');
            }
        });

        return vectors.size > 0 ? Array.from(vectors).join(', ') : 'Multiple vectors identified';
    }

    createTimelineSummary(events) {
        if (events.length === 0) {
            return '<div class="timeline-item">No timeline events available</div>';
        }

        const sortedEvents = events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentEvents = sortedEvents.slice(0, 3);

        return recentEvents.map(event => `
            <div class="timeline-item">
                <div class="timeline-time">${this.formatTimestamp(event.timestamp)}</div>
                <div class="timeline-event">${event.event || event.description || 'Security event'}</div>
            </div>
        `).join('');
    }

    generateRecommendations(data) {
        const technical = data.technical || {};
        const ai = data.ai || {};
        const recommendations = [];

        const iocCount = technical.detectedIOCs?.length || 0;
        const eventCount = technical.securityEvents?.length || 0;
        const severity = ai.severityScore || 5;

        if (severity >= 8) {
            recommendations.push({
                priority: 'critical',
                icon: '🚨',
                title: 'Immediate Incident Response',
                description: 'Activate incident response team and contain the threat immediately'
            });
        }

        if (iocCount > 20) {
            recommendations.push({
                priority: 'high',
                icon: '🛡️',
                title: 'Deploy IOC Blocks',
                description: 'Implement all IOCs in security controls (firewall, DNS, endpoint)'
            });
        }

        if (eventCount > 10) {
            recommendations.push({
                priority: 'medium',
                icon: '🔍',
                title: 'Enhanced Monitoring',
                description: 'Increase logging verbosity and deploy additional detection rules'
            });
        }

        recommendations.push({
            priority: 'low',
            icon: '📚',
            title: 'Update Threat Intelligence',
            description: 'Share findings with threat intelligence feeds and security community'
        });

        return recommendations;
    }

    // Quick action functions
    exportAllIOCs() {
        if (!this.currentAnalysisResults) {
            this.showNotification('No analysis results available', 'error');
            return;
        }

        const iocs = this.currentAnalysisResults.technical?.detectedIOCs || [];
        const exportData = {
            export_time: new Date().toISOString(),
            source: 'SecuNik Analysis',
            ioc_count: iocs.length,
            iocs: iocs.map(ioc => ({
                indicator: ioc,
                type: this.autoDetectIOCType(ioc).type,
                confidence: 'High',
                tags: ['SecuNik', 'Automated']
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik_iocs_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification(`Exported ${iocs.length} IOCs successfully`, 'success');
    }

    generateReport() {
        if (!this.currentAnalysisResults) {
            this.showNotification('No analysis results available', 'error');
            return;
        }

        // Switch to executive tab to show the report
        const executiveTab = document.querySelector('[data-tab="executive"]');
        if (executiveTab) {
            executiveTab.click();
        }

        this.showNotification('Switched to Executive Report', 'info');
    }

    escalateToSOC() {
        const message = 'SecuNik Analysis requires SOC attention:\n\n' +
            `File: ${this.currentAnalysisResults?.fileName || 'Unknown'}\n` +
            `IOCs: ${this.currentAnalysisResults?.technical?.detectedIOCs?.length || 0}\n` +
            `Events: ${this.currentAnalysisResults?.technical?.securityEvents?.length || 0}\n` +
            `Severity: ${this.currentAnalysisResults?.ai?.severityScore || 'Unknown'}\n\n` +
            'Immediate review recommended.';

        // Copy to clipboard for easy sharing
        navigator.clipboard.writeText(message).then(() => {
            this.showNotification('Escalation details copied to clipboard', 'success');
        });
    }

    searchThreatIntel() {
        if (!this.currentAnalysisResults) {
            this.showNotification('No analysis results available', 'error');
            return;
        }

        const iocs = this.currentAnalysisResults.technical?.detectedIOCs || [];
        if (iocs.length > 0) {
            const firstIOC = iocs[0];
            this.searchIOC(firstIOC);
        } else {
            this.showNotification('No IOCs available for threat intelligence search', 'error');
        }
    }
    searchIOC(ioc) {
        // Open threat intelligence search in new tab
        const searchUrl = `https://www.virustotal.com/gui/search/${encodeURIComponent(ioc)}`;
        window.open(searchUrl, '_blank');
        this.showNotification(`Searching for IOC: ${ioc}`, 'info');
    }

    exportIOC(ioc, type) {
        // Create exportable IOC data
        const exportData = {
            indicator: ioc,
            type: type,
            detected_at: new Date().toISOString(),
            source: 'SecuNik Analysis',
            confidence: 'High'
        };

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ioc_${ioc.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification(`Exported IOC: ${ioc}`, 'success');
    }

    updateTimelineTab(data) {
        const timeline = data.timeline?.events || [];
        const timelineData = document.getElementById('timelineData');

        if (timeline.length > 0) {
            timelineData.innerHTML = timeline.map(event => `
                <div class="metric">
                    <span><strong>${new Date(event.timestamp).toLocaleString()}</strong></span>
                    <span class="metric-value">${event.event}</span>
                </div>
            `).join('');
        } else {
            timelineData.innerHTML = '<p>No timeline events available.</p>';
        }
    }

    updateExecutiveTab(data) {
        const executive = data.executive;
        const executiveReport = document.getElementById('executiveReport');

        if (executive) {
            executiveReport.innerHTML = `
                <div class="metric">
                    <span><strong>Executive Summary:</strong></span>
                    <span class="metric-value">${executive.summary}</span>
                </div>
                <div class="metric">
                    <span><strong>Risk Level:</strong></span>
                    <span class="severity ${executive.riskLevel.toLowerCase()}">${executive.riskLevel}</span>
                </div>
                <div class="metric">
                    <span><strong>Key Findings:</strong></span>
                    <span class="metric-value">${executive.keyFindings}</span>
                </div>
                <div class="metric">
                    <span><strong>Immediate Actions:</strong></span>
                    <span class="metric-value">${executive.immediateActions}</span>
                </div>
                <div class="metric">
                    <span><strong>Long-term Recommendations:</strong></span>
                    <span class="metric-value">${executive.longTermRecommendations || 'Implement enhanced security monitoring'}</span>
                </div>
            `;
        } else {
            executiveReport.innerHTML = '<p>Executive report not available.</p>';
        }
    }

    displayError(message) {
        this.showResults();

        this.results.innerHTML = `
            <div class="card">
                <div style="text-align: center; color: #ef4444; padding: 2rem;">
                    <h3>⚠️ Analysis Failed</h3>
                    <p style="margin-top: 1rem; color: #94a3b8;">${message}</p>
                    <button class="btn" onclick="location.reload()" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            </div>
        `;

        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Add notification styles if not already present
        this.addNotificationStyles();

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 1rem;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                word-wrap: break-word;
            }

            .notification.success {
                background: linear-gradient(45deg, #10b981, #059669);
                border: 1px solid #065f46;
            }

            .notification.error {
                background: linear-gradient(45deg, #ef4444, #dc2626);
                border: 1px solid #991b1b;
            }

            .notification.info {
                background: linear-gradient(45deg, #3b82f6, #2563eb);
                border: 1px solid #1e40af;
            }

            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .notification button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    async checkSystemStatus() {
        try {
            const response = await fetch('/health');
            if (response.ok) {
                const data = await response.json();
                this.systemStatus.textContent = 'System Online';
                console.log('SecuNik system status:', data);
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            this.systemStatus.textContent = 'System Offline';
            console.warn('Health check failed:', error);
        }
    }

    // API connectivity test function
    async testAPIConnection() {
        try {
            console.log('=== TESTING API CONNECTIVITY ===');

            // Test health endpoint first
            const healthResponse = await fetch('/api/analysis/health');
            console.log('Health check status:', healthResponse.status);

            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log('Health check data:', healthData);
            } else {
                console.log('Health check failed:', await healthResponse.text());
            }

            // Test supported types endpoint
            const typesResponse = await fetch('/api/analysis/supported-types');
            console.log('Supported types status:', typesResponse.status);

            if (typesResponse.ok) {
                const typesData = await typesResponse.json();
                console.log('Supported types:', typesData);
            } else {
                console.log('Supported types failed:', await typesResponse.text());
            }

        } catch (error) {
            console.error('API connectivity test failed:', error);
        }
    }

    // Utility method to format file size
    formatFileSize(bytes) {
        console.log('Formatting file size:', bytes, typeof bytes);

        if (!bytes || bytes === 0 || isNaN(bytes)) {
            console.log('Invalid file size, returning 0 Bytes');
            return '0 Bytes';
        }

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];

        console.log('Formatted file size:', formattedSize);
        return formattedSize;
    }

    // Utility method to format timestamp
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.secuNikApp = new SecuNikApp();
    console.log('SecuNik Advanced Cybersecurity Platform initialized');
});

// Global test function for manual testing
window.testAPI = async function () {
    if (window.secuNikApp) {
        await window.secuNikApp.testAPIConnection();
    } else {
        console.error('SecuNik app not initialized');
    }
};

// Global test upload function for manual testing
window.testUpload = async function () {
    try {
        const response = await fetch('/api/analysis/test-upload', {
            method: 'POST',
            body: new FormData() // Empty form data for testing
        });

        console.log('Test upload response:', response.status);
        const data = await response.json();
        console.log('Test upload data:', data);
    } catch (error) {
        console.error('Test upload failed:', error);
    }
};

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});