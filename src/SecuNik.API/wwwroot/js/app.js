// SecuNik Advanced Cybersecurity Platform - Enhanced with OpenAI Integration

class SecuNikApp {
    constructor() {
        this.currentAnalysisResults = null;
        this.currentFileInfo = null;
        this.initializeElements();
        this.setupEventListeners();
        this.checkSystemStatus();
        this.testAPIConnection();
    }

    initializeElements() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.chooseFilesBtn = document.getElementById('chooseFilesBtn');
        this.results = document.getElementById('results');
        this.systemStatus = document.getElementById('systemStatus');
    }

    setupEventListeners() {
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFiles(e.target.files);
            }
        });

        this.chooseFilesBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', this.handleTabClick.bind(this));
        });

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

        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        e.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    async handleFiles(files) {
        const file = files[0];

        console.log('=== FILE UPLOAD WITH OPENAI INTEGRATION ===');
        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        if (!this.validateFile(file)) {
            return;
        }

        this.currentFileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };

        this.showResults();
        this.updateFileInfo(file);
        this.showLoadingStates();

        const startTime = performance.now();

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Add OpenAI analysis options
            formData.append('EnableAIAnalysis', 'true');
            formData.append('GenerateExecutiveReport', 'true');
            formData.append('IncludeTimeline', 'true');

            console.log('Sending request with OpenAI integration enabled...');

            const response = await fetch('/api/analysis/upload', {
                method: 'POST',
                body: formData
            });

            const endTime = performance.now();
            const processingTime = ((endTime - startTime) / 1000).toFixed(2);

            console.log('Analysis response:', {
                status: response.status,
                processingTime: processingTime + 's'
            });

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
            console.log('✅ OpenAI Analysis Complete:', result);

            // Enhanced result processing for OpenAI integration
            result.fileInfo = this.currentFileInfo;
            result.processingTime = `${processingTime}s`;
            result.fileSize = file.size;

            this.currentAnalysisResults = result;
            this.displayEnhancedAnalysisResults(result);

        } catch (error) {
            console.error('❌ Analysis error:', error);
            this.displayError(error.message);
        }
    }

    validateFile(file) {
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showNotification('File too large. Maximum size is 50MB.', 'error');
            return false;
        }

        const fileName = file.name.toLowerCase();
        const allowedExtensions = [
            '.csv', '.json', '.log', '.txt', '.evtx', '.evt',
            '.wtmp', '.utmp', '.btmp', '.lastlog', '.pcap',
            '.pcapng', '.syslog', '.fwlog', '.dblog',
            '.maillog', '.dnslog'
        ];
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            this.showNotification(`Unsupported file type.`, 'error');
            return false;
        }

        return true;
    }

    showResults() {
        this.results.classList.remove('hidden');
        this.results.scrollIntoView({ behavior: 'smooth' });
    }

    updateFileInfo(file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileType').textContent = file.type || 'Unknown';
    }

    showLoadingStates() {
        document.getElementById('eventCount').textContent = '-';
        document.getElementById('iocCount').textContent = '-';
        document.getElementById('riskScore').textContent = '-';

        const loadingHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>🤖 AI Analysis in progress...</span>
            </div>
        `;

        document.getElementById('threatsList').innerHTML = loadingHTML;
        document.getElementById('iocsList').innerHTML = loadingHTML;
        document.getElementById('timelineData').innerHTML = loadingHTML;
        document.getElementById('executiveReport').innerHTML = loadingHTML;
    }

    displayEnhancedAnalysisResults(result) {
        const data = result.result || result;

        try {
            console.log('🎯 Displaying AI-Enhanced Results:', data);

            // Check if we have AI insights
            const hasAI = data.ai && (data.ai.attackVector || data.ai.severityScore);
            const aiStatus = hasAI ? '🤖 AI-Powered' : '⚙️ Rule-Based';

            this.showNotification(`${aiStatus} Analysis completed successfully!`, 'success');

            this.updateOverviewMetrics(data);
            this.updateAISeverityBadge(data);
            this.updateAIThreatsTab(data);
            this.updateEnhancedIOCsTab(data);
            this.updateTimelineTab(data);
            this.updateAIExecutiveTab(data);

        } catch (error) {
            console.error('Error displaying results:', error);
            this.displayError('Error displaying analysis results');
        }
    }

    updateOverviewMetrics(data) {
        const technical = data.technical || {};
        const ai = data.ai || {};

        document.getElementById('eventCount').textContent = technical.securityEvents?.length || 0;
        document.getElementById('iocCount').textContent = technical.detectedIOCs?.length || 0;
        document.getElementById('riskScore').textContent = ai.severityScore || 'N/A';

        this.createAIEnhancedOverview(data);
    }

    createAIEnhancedOverview(data) {
        const technical = data.technical || {};
        const ai = data.ai || {};
        const executive = data.executive || {};

        const overviewContent = document.getElementById('overview');
        const iocAnalysis = this.analyzeIOCs(technical.detectedIOCs || []);
        const threatAnalysis = this.analyzeThreats(technical.securityEvents || []);

        const hasAI = ai.attackVector || ai.severityScore;
        const aiIndicator = hasAI ? '🤖 AI-Powered Analysis' : '⚙️ Rule-Based Analysis';
        const aiColor = hasAI ? '#00ff9d' : '#94a3b8';

        const enhancedHTML = `
            <div class="overview-enhanced">
                <!-- AI Status Banner -->
                <div class="ai-status-banner" style="background: rgba(0, 255, 157, 0.1); border: 1px solid rgba(0, 255, 157, 0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: center;">
                    <div style="color: ${aiColor}; font-weight: 600; font-size: 1.1rem;">${aiIndicator}</div>
                    ${hasAI ? '<div style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.25rem;">Advanced threat intelligence and recommendations generated</div>' : '<div style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.25rem;">Pattern-based analysis completed</div>'}
                </div>

                <!-- Quick Stats Grid -->
                <div class="quick-stats-grid">
                    <div class="stat-card ${threatAnalysis.critical > 0 ? 'critical' : 'info'}">
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
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <div class="stat-number">${iocAnalysis.uniqueDomains}</div>
                            <div class="stat-label">Unique IOCs</div>
                        </div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon">🛡️</div>
                        <div class="stat-info">
                            <div class="stat-number">${ai.severityScore || this.calculateFallbackSeverity(data)}</div>
                            <div class="stat-label">Risk Score</div>
                        </div>
                    </div>
                </div>

                <!-- AI Insights Section -->
                ${hasAI ? `
                <div class="intelligence-section ai-insights">
                    <h3>🤖 AI Threat Intelligence</h3>
                    <div class="ai-insights-grid">
                        <div class="ai-insight-card">
                            <div class="ai-insight-header">
                                <span class="ai-insight-icon">🎯</span>
                                <span class="ai-insight-title">Attack Vector</span>
                            </div>
                            <div class="ai-insight-content">${ai.attackVector || 'Analysis pending'}</div>
                        </div>
                        <div class="ai-insight-card">
                            <div class="ai-insight-header">
                                <span class="ai-insight-icon">📊</span>
                                <span class="ai-insight-title">Threat Assessment</span>
                            </div>
                            <div class="ai-insight-content">${ai.threatAssessment || 'Assessment in progress'}</div>
                        </div>
                        <div class="ai-insight-card">
                            <div class="ai-insight-header">
                                <span class="ai-insight-icon">💼</span>
                                <span class="ai-insight-title">Business Impact</span>
                            </div>
                            <div class="ai-insight-content">${ai.businessImpact || 'Impact evaluation pending'}</div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- File Intelligence -->
                <div class="intelligence-section">
                    <h3>📁 File Intelligence</h3>
                    <div class="intel-grid">
                        <div class="intel-item">
                            <span class="intel-label">File Size:</span>
                            <span class="intel-value">${this.formatFileSize(data.fileSize || this.currentFileInfo?.size || 0)}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">Processing Time:</span>
                            <span class="intel-value">${data.processingTime || 'N/A'}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">Analysis Engine:</span>
                            <span class="intel-value">${hasAI ? 'OpenAI GPT-4' : 'Pattern Matching'}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">File Name:</span>
                            <span class="intel-value">${data.fileInfo?.name || this.currentFileInfo?.name || 'Unknown'}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">Confidence:</span>
                            <span class="intel-value">${hasAI ? 'High (AI)' : 'Medium (Rules)'}</span>
                        </div>
                        <div class="intel-item">
                            <span class="intel-label">Upload Time:</span>
                            <span class="intel-value">${new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                <!-- AI Recommendations -->
                ${hasAI && ai.recommendedActions ? `
                <div class="intelligence-section">
                    <h3>💡 AI Recommendations</h3>
                    <div class="recommendations">
                        ${ai.recommendedActions.map((action, index) => `
                            <div class="recommendation-item ${this.getRecommendationPriority(index)}">
                                <div class="rec-icon">${this.getRecommendationIcon(index)}</div>
                                <div class="rec-content">
                                    <div class="rec-title">Action ${index + 1}</div>
                                    <div class="rec-description">${action}</div>
                                </div>
                                <div class="rec-priority">${this.getRecommendationPriority(index).toUpperCase()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Quick Actions -->
                <div class="intelligence-section">
                    <h3>⚡ Quick Actions</h3>
                    <div class="quick-actions">
                        <button class="action-btn primary" onclick="window.secuNikApp.exportAllIOCs()">
                            📤 Export IOCs
                        </button>
                        <button class="action-btn secondary" onclick="window.secuNikApp.generateReport()">
                            📄 View Report
                        </button>
                        ${hasAI ? `
                        <button class="action-btn warning" onclick="window.secuNikApp.escalateToSOC()">
                            🚨 Escalate
                        </button>
                        <button class="action-btn info" onclick="window.secuNikApp.showAIDetails()">
                            🤖 AI Details
                        </button>
                        ` : `
                        <button class="action-btn info" onclick="window.secuNikApp.enableAI()">
                            🤖 Enable AI
                        </button>
                        `}
                    </div>
                </div>
            </div>
        `;

        overviewContent.innerHTML = enhancedHTML;
    }

    updateAISeverityBadge(data) {
        const severityScore = data.ai?.severityScore || data.technical?.securityEvents?.length || 3;
        const badge = document.getElementById('severityBadge');

        if (severityScore >= 7) {
            badge.textContent = 'High Risk';
            badge.className = 'severity high';
        } else if (severityScore >= 4) {
            badge.textContent = 'Medium Risk';
            badge.className = 'severity medium';
        } else {
            badge.textContent = 'Low Risk';
            badge.className = 'severity low';
        }
    }

    updateAIThreatsTab(data) {
        const threats = data.technical?.securityEvents || [];
        const ai = data.ai || {};
        const threatsList = document.getElementById('threatsList');

        if (threats.length > 0) {
            const aiInsight = ai.attackVector ? `
                <div class="ai-threat-insight">
                    <div class="ai-insight-header">🤖 AI Analysis:</div>
                    <div class="ai-insight-text">${ai.attackVector}</div>
                </div>
            ` : '';

            threatsList.innerHTML = `
                ${aiInsight}
                <div class="threats-list">
                    ${threats.map(threat => `
                        <div class="threat-item">
                            <div class="threat-header">
                                <span class="threat-type">${threat.eventType}</span>
                                <span class="severity ${threat.severity.toLowerCase()}">${threat.severity}</span>
                            </div>
                            <div class="threat-description">${threat.description}</div>
                            <div class="threat-timestamp">${this.formatTimestamp(threat.timestamp)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            threatsList.innerHTML = '<p>No security threats detected in the uploaded file.</p>';
        }
    }

    updateAIExecutiveTab(data) {
        const executive = data.executive || {};
        const ai = data.ai || {};
        const executiveReport = document.getElementById('executiveReport');

        const hasAI = executive.summary || ai.businessImpact;

        if (hasAI) {
            executiveReport.innerHTML = `
                <div class="executive-report-ai">
                    <div class="executive-header">
                        <h3>🤖 AI-Generated Executive Summary</h3>
                        <div class="ai-badge">Powered by OpenAI</div>
                    </div>
                    
                    <div class="executive-section">
                        <h4>📋 Executive Summary</h4>
                        <div class="executive-content">${executive.summary || 'Executive summary generation in progress...'}</div>
                    </div>

                    <div class="executive-section">
                        <h4>🎯 Key Findings</h4>
                        <div class="executive-content">${executive.keyFindings || 'Key findings analysis pending...'}</div>
                    </div>

                    <div class="executive-section">
                        <h4>⚠️ Risk Assessment</h4>
                        <div class="risk-level ${(executive.riskLevel || 'medium').toLowerCase()}">${executive.riskLevel || 'MEDIUM'}</div>
                        <div class="executive-content">${ai.businessImpact || 'Business impact assessment in progress...'}</div>
                    </div>

                    <div class="executive-section">
                        <h4>🚀 Immediate Actions</h4>
                        <div class="executive-content">${executive.immediateActions || 'Action items being generated...'}</div>
                    </div>

                    <div class="executive-section">
                        <h4>📈 Long-term Recommendations</h4>
                        <div class="executive-content">${executive.longTermRecommendations || 'Strategic recommendations being prepared...'}</div>
                    </div>
                </div>
            `;
        } else {
            executiveReport.innerHTML = `
                <div class="executive-report-basic">
                    <h3>📊 Basic Analysis Report</h3>
                    <p>Executive report generation requires AI analysis. Enable OpenAI integration for advanced reporting capabilities.</p>
                    <button class="action-btn primary" onclick="window.secuNikApp.enableAI()">
                        🤖 Enable AI Analysis
                    </button>
                </div>
            `;
        }
    }

    // Enhanced IOC tab with better AI integration
    updateEnhancedIOCsTab(data) {
        const iocs = data.technical?.detectedIOCs || [];
        const iocsList = document.getElementById('iocsList');

        if (iocs.length > 0) {
            const categorizedIOCs = this.categorizeIOCs(iocs);

            iocsList.innerHTML = `
                <div class="ioc-ai-header">
                    <div class="ioc-summary">
                        <span class="ioc-count-badge">${iocs.length} IOCs Detected</span>
                        <span class="ioc-ai-badge">🤖 AI-Enhanced Detection</span>
                    </div>
                </div>
                
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

            this.setupIOCFilters();
        } else {
            iocsList.innerHTML = '<p>No indicators of compromise found.</p>';
        }
    }

    // AI-specific utility functions
    calculateFallbackSeverity(data) {
        const events = data.technical?.securityEvents?.length || 0;
        const iocs = data.technical?.detectedIOCs?.length || 0;
        return Math.min(Math.max(Math.floor((events + iocs) / 3), 1), 10);
    }

    getRecommendationPriority(index) {
        const priorities = ['critical', 'high', 'medium', 'low'];
        return priorities[index] || 'low';
    }

    getRecommendationIcon(index) {
        const icons = ['🚨', '⚠️', '💡', '📋'];
        return icons[index] || '📋';
    }

    // AI-specific action functions
    showAIDetails() {
        if (!this.currentAnalysisResults?.ai) {
            this.showNotification('No AI analysis data available', 'error');
            return;
        }

        const ai = this.currentAnalysisResults.ai;
        const details = `
🤖 AI Analysis Details:

Severity Score: ${ai.severityScore}/10
Attack Vector: ${ai.attackVector}
Business Impact: ${ai.businessImpact}

Recommended Actions:
${ai.recommendedActions?.map((action, i) => `${i + 1}. ${action}`).join('\n') || 'None specified'}

Threat Assessment:
${ai.threatAssessment}
        `.trim();

        navigator.clipboard.writeText(details).then(() => {
            this.showNotification('AI analysis details copied to clipboard', 'success');
        });
    }

    enableAI() {
        this.showNotification('AI analysis is configured via OpenAI API key. Check server configuration.', 'info');
        console.log('💡 To enable AI: Ensure OpenAI API key is set in user secrets');
    }

    // Keep all existing functions from the original file
    categorizeIOCs(iocs) {
        const categorized = {
            ips: [], domains: [], emails: [], hashes: [], urls: [], other: []
        };

        iocs.forEach(ioc => {
            const lowerIOC = ioc.toLowerCase();
            if (lowerIOC.startsWith('ip:')) {
                categorized.ips.push({
                    type: 'IP Address', value: ioc.substring(3).trim(),
                    original: ioc, icon: '🌐', color: 'ip'
                });
            } else if (lowerIOC.startsWith('domain:')) {
                categorized.domains.push({
                    type: 'Domain', value: ioc.substring(7).trim(),
                    original: ioc, icon: '🌍', color: 'domain'
                });
            } else if (lowerIOC.startsWith('email:')) {
                categorized.emails.push({
                    type: 'Email', value: ioc.substring(6).trim(),
                    original: ioc, icon: '📧', color: 'email'
                });
            } else if (lowerIOC.startsWith('hash:')) {
                const hashValue = ioc.substring(5).trim();
                categorized.hashes.push({
                    type: this.detectHashType(hashValue), value: hashValue,
                    original: ioc, icon: '🔐', color: 'hash'
                });
            } else if (lowerIOC.startsWith('url:')) {
                categorized.urls.push({
                    type: 'URL', value: ioc.substring(4).trim(),
                    original: ioc, icon: '🔗', color: 'url'
                });
            } else {
                const detectedType = this.autoDetectIOCType(ioc);
                if (detectedType.category !== 'other') {
                    categorized[detectedType.category].push(detectedType);
                } else {
                    categorized.other.push({
                        type: 'Unknown', value: ioc, original: ioc,
                        icon: '❓', color: 'other'
                    });
                }
            }
        });

        return categorized;
    }

    autoDetectIOCType(ioc) {
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)) {
            return { type: 'IP Address', value: ioc, original: ioc, icon: '🌐', color: 'ip', category: 'ips' };
        }
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ioc)) {
            return { type: 'Email', value: ioc, original: ioc, icon: '📧', color: 'email', category: 'emails' };
        }
        if (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.?)+$/.test(ioc)) {
            return { type: 'Domain', value: ioc, original: ioc, icon: '🌍', color: 'domain', category: 'domains' };
        }
        if (/^[a-fA-F0-9]{32,64}$/.test(ioc)) {
            return { type: this.detectHashType(ioc), value: ioc, original: ioc, icon: '🔐', color: 'hash', category: 'hashes' };
        }
        if (/^https?:\/\//.test(ioc)) {
            return { type: 'URL', value: ioc, original: ioc, icon: '🔗', color: 'url', category: 'urls' };
        }
        return { type: 'Unknown', value: ioc, original: ioc, icon: '❓', color: 'other', category: 'other' };
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
                    <span class="ioc-status">🤖 AI Detected</span>
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

    setupIOCFilters() {
        document.querySelectorAll('.ioc-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterIOCs(filter);
                document.querySelectorAll('.ioc-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    filterIOCs(filter) {
        document.querySelectorAll('.ioc-category-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetContent = document.querySelector(`[data-category="${filter}"]`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    analyzeIOCs(iocs) {
        const analysis = { ips: 0, domains: 0, emails: 0, hashes: 0, urls: 0, uniqueDomains: 0 };
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
        const analysis = { critical: 0, high: 0, medium: 0, low: 0 };
        threats.forEach(threat => {
            const severity = threat.severity?.toLowerCase() || 'medium';
            if (analysis.hasOwnProperty(severity)) {
                analysis[severity]++;
            }
        });
        return analysis;
    }

    updateTimelineTab(data) {
        const timeline = data.timeline?.events || [];
        const timelineData = document.getElementById('timelineData');

        if (timeline.length > 0) {
            timelineData.innerHTML = `
                <div class="timeline-ai-header">
                    <h4>🤖 AI-Enhanced Timeline Reconstruction</h4>
                </div>
                ${timeline.map(event => `
                    <div class="timeline-event-item">
                        <div class="timeline-timestamp">${this.formatTimestamp(event.timestamp)}</div>
                        <div class="timeline-event-content">
                            <div class="timeline-event-title">${event.event || event.description}</div>
                            <div class="timeline-event-source">Source: ${event.source || 'System'}</div>
                        </div>
                    </div>
                `).join('')}
            `;
        } else {
            timelineData.innerHTML = '<p>No timeline events available.</p>';
        }
    }

    // Action functions
    exportAllIOCs() {
        if (!this.currentAnalysisResults) {
            this.showNotification('No analysis results available', 'error');
            return;
        }

        const iocs = this.currentAnalysisResults.technical?.detectedIOCs || [];
        const exportData = {
            export_time: new Date().toISOString(),
            source: 'SecuNik AI Analysis',
            ai_powered: !!this.currentAnalysisResults.ai?.attackVector,
            ioc_count: iocs.length,
            iocs: iocs.map(ioc => ({
                indicator: ioc,
                type: this.autoDetectIOCType(ioc).type,
                confidence: 'High',
                tags: ['SecuNik', 'AI-Detected']
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik_ai_iocs_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification(`Exported ${iocs.length} AI-detected IOCs successfully`, 'success');
    }

    generateReport() {
        const executiveTab = document.querySelector('[data-tab="executive"]');
        if (executiveTab) {
            executiveTab.click();
        }
        this.showNotification('Viewing AI-Generated Executive Report', 'info');
    }

    escalateToSOC() {
        const ai = this.currentAnalysisResults?.ai || {};
        const message = `🚨 SecuNik AI Analysis - SOC Escalation Required\n\n` +
            `File: ${this.currentAnalysisResults?.fileName || 'Unknown'}\n` +
            `AI Risk Score: ${ai.severityScore || 'Unknown'}/10\n` +
            `Attack Vector: ${ai.attackVector || 'Not determined'}\n` +
            `IOCs: ${this.currentAnalysisResults?.technical?.detectedIOCs?.length || 0}\n` +
            `Events: ${this.currentAnalysisResults?.technical?.securityEvents?.length || 0}\n\n` +
            `Business Impact: ${ai.businessImpact || 'Assessment pending'}\n\n` +
            `Immediate Actions Required:\n${ai.recommendedActions?.map(a => `• ${a}`).join('\n') || 'See full report'}\n\n` +
            `Generated by SecuNik AI Platform`;

        navigator.clipboard.writeText(message).then(() => {
            this.showNotification('AI escalation details copied to clipboard', 'success');
        });
    }

    searchIOC(ioc) {
        const searchUrl = `https://www.virustotal.com/gui/search/${encodeURIComponent(ioc)}`;
        window.open(searchUrl, '_blank');
        this.showNotification(`Searching threat intelligence for: ${ioc}`, 'info');
    }

    exportIOC(ioc, type) {
        const exportData = {
            indicator: ioc,
            type: type,
            detected_at: new Date().toISOString(),
            source: 'SecuNik AI Analysis',
            confidence: 'High',
            ai_generated: true
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_ioc_${ioc.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification(`Exported AI-detected IOC: ${ioc}`, 'success');
    }

    displayError(message) {
        this.showResults();
        this.results.innerHTML = `
            <div class="card">
                <div style="text-align: center; color: #ef4444; padding: 2rem;">
                    <h3>⚠️ AI Analysis Failed</h3>
                    <p style="margin-top: 1rem; color: #94a3b8;">${message}</p>
                    <div style="margin-top: 1.5rem;">
                        <button class="btn" onclick="location.reload()" style="margin-right: 1rem;">
                            Try Again
                        </button>
                        <button class="action-btn secondary" onclick="window.secuNikApp.enableAI()">
                            🤖 Check AI Setup
                        </button>
                    </div>
                </div>
            </div>
        `;
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        this.addNotificationStyles();
        document.body.appendChild(notification);

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
                position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
                border-radius: 8px; color: white; font-weight: 600; z-index: 1000;
                display: flex; align-items: center; gap: 1rem; animation: slideIn 0.3s ease;
                max-width: 400px; word-wrap: break-word;
            }
            .notification.success { background: linear-gradient(45deg, #10b981, #059669); border: 1px solid #065f46; }
            .notification.error { background: linear-gradient(45deg, #ef4444, #dc2626); border: 1px solid #991b1b; }
            .notification.info { background: linear-gradient(45deg, #3b82f6, #2563eb); border: 1px solid #1e40af; }
            .notification button { background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;
        document.head.appendChild(styles);
    }

    async checkSystemStatus() {
        try {
            const response = await fetch('/health');
            if (response.ok) {
                const data = await response.json();
                this.systemStatus.textContent = 'System Online';
                console.log('✅ SecuNik system status:', data);
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            this.systemStatus.textContent = 'System Offline';
            console.warn('❌ Health check failed:', error);
        }
    }

    async testAPIConnection() {
        try {
            console.log('=== TESTING AI-ENHANCED API CONNECTIVITY ===');

            const healthResponse = await fetch('/api/analysis/health');
            console.log('Health check status:', healthResponse.status);

            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log('✅ Health check data:', healthData);
            }

            const typesResponse = await fetch('/api/analysis/supported-types');
            if (typesResponse.ok) {
                const typesData = await typesResponse.json();
                console.log('✅ Supported types:', typesData);
            }

        } catch (error) {
            console.error('❌ API connectivity test failed:', error);
        }
    }

    formatFileSize(bytes) {
        if (!bytes || bytes === 0 || isNaN(bytes)) {
            return '0 Bytes';
        }
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
}

// Initialize the AI-enhanced SecuNik application
document.addEventListener('DOMContentLoaded', () => {
    window.secuNikApp = new SecuNikApp();
    console.log('🚀 SecuNik AI-Enhanced Cybersecurity Platform initialized');
});

// Global test functions
window.testAPI = async function () {
    if (window.secuNikApp) {
        await window.secuNikApp.testAPIConnection();
    } else {
        console.error('SecuNik app not initialized');
    }
};

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});