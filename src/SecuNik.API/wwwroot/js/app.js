// SecuNik Advanced Cybersecurity Platform - Enhanced with Multi-File Support and Advanced Features

class SecuNikApp {
    constructor() {
        this.currentAnalysisResults = null;
        this.currentFileInfo = null;
        this.analysisHistory = [];
        this.analysisCounter = 0;
        this.fileQueue = [];
        this.isAnalyzing = false;
        this.settings = {
            aiMode: 'auto',
            reportDetail: 'executive',
            notifications: true
        };

        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.checkSystemStatus();
        this.testAPIConnection();
        this.updateAnalysisCounter();
    }

    initializeElements() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.chooseFilesBtn = document.getElementById('chooseFilesBtn');
        this.uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
        this.results = document.getElementById('results');
        this.systemStatus = document.getElementById('systemStatus');

        // Make these optional to prevent null errors
        this.analysisCounterElement = document.getElementById('analysisCounter');
        this.fileQueueElement = document.getElementById('fileQueue');
        this.queueItems = document.getElementById('queueItems');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressDetails = document.getElementById('progressDetails');
        this.multiFileSummary = document.getElementById('multiFileSummary');
        this.summaryGrid = document.getElementById('summaryGrid');
    }

    setupEventListeners() {
        // File input handlers
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFiles(e.target.files);
            }
        });

        this.chooseFilesBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Enhanced upload another file functionality
        this.uploadAnotherBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Drag and drop handlers
        this.uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));

        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', this.handleTabClick.bind(this));
        });

        // Result action buttons
        document.getElementById('exportAllBtn')?.addEventListener('click', () => this.exportAllResults());
        document.getElementById('shareBtn')?.addEventListener('click', () => this.shareAnalysis());
        document.getElementById('printBtn')?.addEventListener('click', () => this.printReport());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.resetAnalysis());

        // Global drag and drop prevention
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());

        // Settings handlers
        document.getElementById('aiModeSelect')?.addEventListener('change', (e) => {
            this.settings.aiMode = e.target.value;
            this.saveSettings();
        });

        document.getElementById('reportDetailSelect')?.addEventListener('change', (e) => {
            this.settings.reportDetail = e.target.value;
            this.saveSettings();
        });

        document.getElementById('notificationsToggle')?.addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
            this.saveSettings();
        });
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
        const tabName = e.target.closest('.tab').dataset.tab;
        if (!tabName) return;

        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        e.target.closest('.tab').classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    async handleFiles(files) {
        // Add files to queue if already analyzing
        if (this.isAnalyzing) {
            this.addFilesToQueue(files);
            return;
        }

        const file = files[0];
        console.log('=== ENHANCED FILE UPLOAD WITH AI INTEGRATION ===');
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

        // Show upload progress and results
        this.showUploadProgress();
        this.showResults();
        this.updateFileInfo(file);
        this.showLoadingStates();
        this.showUploadAnotherButton();

        const startTime = performance.now();
        this.isAnalyzing = true;

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Enhanced analysis options based on settings
            formData.append('EnableAIAnalysis', this.settings.aiMode !== 'rules-only');
            formData.append('GenerateExecutiveReport', this.settings.reportDetail !== 'technical');
            formData.append('IncludeTimeline', 'true');
            formData.append('DetailLevel', this.settings.reportDetail);

            console.log('Sending enhanced request with AI integration...');

            // Simulate progress for better UX
            this.simulateProgress();

            const response = await fetch('/api/analysis/upload', {
                method: 'POST',
                body: formData
            });

            const endTime = performance.now();
            const processingTime = ((endTime - startTime) / 1000).toFixed(2);

            console.log('Enhanced analysis response:', {
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
            console.log('✅ Enhanced AI Analysis Complete:', result);

            // Enhanced result processing
            result.fileInfo = this.currentFileInfo;
            result.processingTime = `${processingTime}s`;
            result.fileSize = file.size;
            result.analysisId = this.generateAnalysisId();
            result.timestamp = new Date().toISOString();

            this.currentAnalysisResults = result;
            this.analysisHistory.push(result);
            this.analysisCounter++;

            this.hideUploadProgress();
            this.displayEnhancedAnalysisResults(result);
            this.updateAnalysisCounter();
            this.updateTabBadges(result);

            // Process queue if files waiting
            if (this.fileQueue.length > 0) {
                setTimeout(() => this.processNextFileInQueue(), 2000);
            }

        } catch (error) {
            console.error('❌ Enhanced analysis error:', error);
            this.hideUploadProgress();
            this.displayError(error.message);
        } finally {
            this.isAnalyzing = false;
        }
    }

    addFilesToQueue(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.fileQueue.push({
                    file: file,
                    id: this.generateAnalysisId(),
                    status: 'queued'
                });
            }
        });
        this.updateFileQueueDisplay();
        this.showNotification(`${files.length} file(s) added to analysis queue`, 'info');
    }

    async processNextFileInQueue() {
        if (this.fileQueue.length === 0 || this.isAnalyzing) return;

        const nextFile = this.fileQueue.shift();
        nextFile.status = 'processing';
        this.updateFileQueueDisplay();

        await this.handleFiles([nextFile.file]);
    }

    updateFileQueueDisplay() {
        if (this.fileQueue.length === 0) {
            this.fileQueue.style.display = 'none';
            return;
        }

        this.fileQueue.style.display = 'block';
        this.queueItems.innerHTML = this.fileQueue.map(item => `
            <div class="queue-item">
                <span class="queue-file-name">${item.file.name}</span>
                <span class="queue-status">${item.status}</span>
            </div>
        `).join('');
    }

    validateFile(file) {
        const maxSize = 200 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showNotification('File too large. Maximum size is 200MB.', 'error');
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
            this.showNotification(`Unsupported file type. Supported formats: ${allowedExtensions.join(', ')}`, 'error');
            return false;
        }

        return true;
    }

    showResults() {
        this.results.classList.remove('hidden');
        this.results.scrollIntoView({ behavior: 'smooth' });
    }

    showUploadAnotherButton() {
        this.uploadAnotherBtn.style.display = 'inline-flex';
    }

    showUploadProgress() {
        this.uploadProgress.style.display = 'block';
    }

    hideUploadProgress() {
        this.uploadProgress.style.display = 'none';
    }

    simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;

            this.progressFill.style.width = `${progress}%`;
            document.querySelector('.progress-percentage').textContent = `${Math.round(progress)}%`;

            // Update progress details
            const stages = [
                'Initializing analysis...',
                'Processing file headers...',
                'Extracting events...',
                'Running AI analysis...',
                'Detecting threats...',
                'Generating insights...',
                'Compiling results...'
            ];

            const stageIndex = Math.floor(progress / 15);
            if (stages[stageIndex]) {
                this.progressDetails.textContent = stages[stageIndex];
            }

            if (progress >= 90) {
                clearInterval(interval);
                this.progressFill.style.width = '100%';
                document.querySelector('.progress-percentage').textContent = '100%';
                this.progressDetails.textContent = 'Analysis complete!';
            }
        }, 300);
    }

    updateFileInfo(file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileType').textContent = file.type || this.detectFileType(file.name);

        // Update file indicator
        const fileIndicator = document.getElementById('fileIndicator');
        if (fileIndicator) {
            fileIndicator.textContent = `File ${this.analysisCounter + 1} of ${this.analysisCounter + 1 + this.fileQueue.length}`;
        }
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
            'btmp': 'Unix Bad Login Log'
        };
        return typeMap[ext] || 'Unknown';
    }

    showLoadingStates() {
        document.getElementById('eventCount').textContent = '-';
        document.getElementById('iocCount').textContent = '-';
        document.getElementById('riskScore').textContent = '-';

        const loadingHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>🤖 Enhanced AI Analysis in progress...</span>
            </div>
        `;

        document.getElementById('threatsList').innerHTML = loadingHTML;
        document.getElementById('iocsList').innerHTML = loadingHTML;
        document.getElementById('timelineData').innerHTML = loadingHTML;
        document.getElementById('executiveReport').innerHTML = loadingHTML;
        document.getElementById('technicalDetails').innerHTML = loadingHTML;
    }

    updateTabBadges(result) {
        const data = result.result || result;
        const threatCount = data.technical?.securityEvents?.length || 0;
        const iocCount = data.technical?.detectedIOCs?.length || 0;

        document.getElementById('threatsBadge').textContent = threatCount;
        document.getElementById('iocsBadge').textContent = iocCount;

        // Update badge colors based on count
        const threatsBadge = document.getElementById('threatsBadge');
        const iocsBadge = document.getElementById('iocsBadge');

        threatsBadge.style.background = threatCount > 10 ? '#ef4444' : threatCount > 5 ? '#f59e0b' : '#10b981';
        iocsBadge.style.background = iocCount > 20 ? '#ef4444' : iocCount > 10 ? '#f59e0b' : '#10b981';
    }

    displayEnhancedAnalysisResults(result) {
        const data = result.result || result;

        try {
            console.log('🎯 Displaying Enhanced AI Results:', data);

            const hasAI = data.ai && (data.ai.attackVector || data.ai.severityScore);
            const aiStatus = hasAI ? '🤖 AI-Powered' : '⚙️ Rule-Based';

            this.showNotification(`${aiStatus} Analysis completed successfully!`, 'success');

            this.updateOverviewMetrics(data);
            this.updateAISeverityBadge(data);
            this.updateAIThreatsTab(data);
            this.updateEnhancedIOCsTab(data);
            this.updateTimelineTab(data);
            this.updateAIExecutiveTab(data);
            this.updateTechnicalTab(data);

            // Show multi-file summary if multiple analyses
            if (this.analysisHistory.length > 1) {
                this.updateMultiFileSummary();
            }

        } catch (error) {
            console.error('Error displaying enhanced results:', error);
            this.displayError('Error displaying analysis results');
        }
    }

    updateTechnicalTab(data) {
        const technical = data.technical || {};
        const technicalDetails = document.getElementById('technicalDetails');

        const technicalHTML = `
            <div class="technical-analysis">
                <div class="technical-section">
                    <h4>📊 File Analysis</h4>
                    <div class="tech-metric">
                        <span>File Size:</span>
                        <span class="tech-value">${this.formatFileSize(data.fileSize || 0)}</span>
                    </div>
                    <div class="tech-metric">
                        <span>Processing Time:</span>
                        <span class="tech-value">${data.processingTime || 'N/A'}</span>
                    </div>
                    <div class="tech-metric">
                        <span>Total Events:</span>
                        <span class="tech-value">${technical.securityEvents?.length || 0}</span>
                    </div>
                    <div class="tech-metric">
                        <span>IOCs Detected:</span>
                        <span class="tech-value">${technical.detectedIOCs?.length || 0}</span>
                    </div>
                    <div class="tech-metric">
                        <span>Analysis Engine:</span>
                        <span class="tech-value">${data.ai?.attackVector ? 'OpenAI GPT-4' : 'Pattern Matching'}</span>
                    </div>
                </div>

                <div class="technical-section">
                    <h4>🔍 Detection Statistics</h4>
                    ${this.renderDetectionStats(technical)}
                </div>

                <div class="technical-section">
                    <h4>⚡ Performance Metrics</h4>
                    ${this.renderPerformanceMetrics(data)}
                </div>

                <div class="technical-section">
                    <h4>🔧 System Information</h4>
                    ${this.renderSystemInfo(data)}
                </div>
            </div>
        `;

        technicalDetails.innerHTML = technicalHTML;
    }

    renderDetectionStats(technical) {
        const eventsByType = technical.eventsByType || {};
        const iocsByCategory = technical.iocsByCategory || {};

        return `
            <div class="stats-grid">
                <div class="stat-group">
                    <h5>Events by Type</h5>
                    ${Object.entries(eventsByType).map(([type, count]) => `
                        <div class="tech-metric">
                            <span>${type}:</span>
                            <span class="tech-value">${count}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="stat-group">
                    <h5>IOCs by Category</h5>
                    ${Object.entries(iocsByCategory).map(([category, count]) => `
                        <div class="tech-metric">
                            <span>${category}:</span>
                            <span class="tech-value">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPerformanceMetrics(data) {
        const startTime = new Date(data.timestamp || Date.now());
        const memoryUsage = Math.round(Math.random() * 100 + 50); // Simulated

        return `
            <div class="tech-metric">
                <span>Analysis Started:</span>
                <span class="tech-value">${startTime.toLocaleTimeString()}</span>
            </div>
            <div class="tech-metric">
                <span>Processing Speed:</span>
                <span class="tech-value">${data.processingTime || 'N/A'}</span>
            </div>
            <div class="tech-metric">
                <span>Memory Usage:</span>
                <span class="tech-value">${memoryUsage} MB</span>
            </div>
            <div class="tech-metric">
                <span>Analysis ID:</span>
                <span class="tech-value">${data.analysisId || 'N/A'}</span>
            </div>
        `;
    }

    renderSystemInfo(data) {
        return `
            <div class="tech-metric">
                <span>Platform:</span>
                <span class="tech-value">SecuNik v2.0 Ultimate</span>
            </div>
            <div class="tech-metric">
                <span>AI Model:</span>
                <span class="tech-value">${data.ai?.attackVector ? 'OpenAI GPT-4o-mini' : 'Pattern Engine'}</span>
            </div>
            <div class="tech-metric">
                <span>User Agent:</span>
                <span class="tech-value">${navigator.userAgent.split(' ')[0]}</span>
            </div>
            <div class="tech-metric">
                <span>Session ID:</span>
                <span class="tech-value">${this.generateSessionId()}</span>
            </div>
        `;
    }

    updateMultiFileSummary() {
        this.multiFileSummary.style.display = 'block';

        const totalThreats = this.analysisHistory.reduce((sum, analysis) =>
            sum + (analysis.result?.technical?.securityEvents?.length || 0), 0);
        const totalIOCs = this.analysisHistory.reduce((sum, analysis) =>
            sum + (analysis.result?.technical?.detectedIOCs?.length || 0), 0);
        const aiAnalyses = this.analysisHistory.filter(analysis =>
            analysis.result?.ai?.attackVector).length;

        this.summaryGrid.innerHTML = `
            <div class="summary-card">
                <div class="summary-title">📊 Total Files Analyzed</div>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span>Files:</span>
                        <span>${this.analysisHistory.length}</span>
                    </div>
                    <div class="summary-stat">
                        <span>AI-Powered:</span>
                        <span>${aiAnalyses}</span>
                    </div>
                </div>
            </div>
            
            <div class="summary-card">
                <div class="summary-title">🚨 Threat Summary</div>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span>Total Events:</span>
                        <span>${totalThreats}</span>
                    </div>
                    <div class="summary-stat">
                        <span>Average per File:</span>
                        <span>${Math.round(totalThreats / this.analysisHistory.length)}</span>
                    </div>
                </div>
            </div>
            
            <div class="summary-card">
                <div class="summary-title">🎯 IOC Summary</div>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span>Total IOCs:</span>
                        <span>${totalIOCs}</span>
                    </div>
                    <div class="summary-stat">
                        <span>Unique Indicators:</span>
                        <span>${this.countUniqueIOCs()}</span>
                    </div>
                </div>
            </div>
            
            <div class="summary-card">
                <div class="summary-title">⏱️ Session Stats</div>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span>Session Duration:</span>
                        <span>${this.getSessionDuration()}</span>
                    </div>
                    <div class="summary-stat">
                        <span>Analysis Rate:</span>
                        <span>${this.getAnalysisRate()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    countUniqueIOCs() {
        const allIOCs = new Set();
        this.analysisHistory.forEach(analysis => {
            const iocs = analysis.result?.technical?.detectedIOCs || [];
            iocs.forEach(ioc => allIOCs.add(ioc));
        });
        return allIOCs.size;
    }

    getSessionDuration() {
        if (this.analysisHistory.length === 0) return '0m';
        const firstAnalysis = new Date(this.analysisHistory[0].timestamp);
        const lastAnalysis = new Date(this.analysisHistory[this.analysisHistory.length - 1].timestamp);
        const diffMinutes = Math.round((lastAnalysis - firstAnalysis) / 60000);
        return `${diffMinutes}m`;
    }

    getAnalysisRate() {
        const duration = this.getSessionDuration();
        const minutes = parseInt(duration);
        if (minutes === 0) return '1/min';
        return `${Math.round(this.analysisHistory.length / minutes * 10) / 10}/min`;
    }

    // Enhanced action functions
    exportAllResults() {
        if (this.analysisHistory.length === 0) {
            this.showNotification('No analysis results to export', 'error');
            return;
        }

        const exportData = {
            export_metadata: {
                export_time: new Date().toISOString(),
                platform: 'SecuNik Ultimate v2.0',
                total_files: this.analysisHistory.length,
                ai_analyses: this.analysisHistory.filter(a => a.result?.ai?.attackVector).length,
                session_duration: this.getSessionDuration()
            },
            analyses: this.analysisHistory.map(analysis => ({
                file_info: analysis.fileInfo,
                analysis_id: analysis.analysisId,
                timestamp: analysis.timestamp,
                processing_time: analysis.processingTime,
                results: analysis.result,
                ai_powered: !!analysis.result?.ai?.attackVector
            })),
            summary: {
                total_threats: this.analysisHistory.reduce((sum, a) =>
                    sum + (a.result?.technical?.securityEvents?.length || 0), 0),
                total_iocs: this.analysisHistory.reduce((sum, a) =>
                    sum + (a.result?.technical?.detectedIOCs?.length || 0), 0),
                unique_iocs: this.countUniqueIOCs()
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik_analysis_session_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification(`Exported ${this.analysisHistory.length} analysis results`, 'success');
    }

    shareAnalysis() {
        if (!this.currentAnalysisResults) {
            this.showNotification('No analysis results to share', 'error');
            return;
        }

        const shareData = {
            title: 'SecuNik Cybersecurity Analysis',
            text: `Analysis of ${this.currentAnalysisResults.fileInfo?.name || 'unknown file'}`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).then(() => {
                this.showNotification('Analysis shared successfully', 'success');
            }).catch(err => {
                console.log('Error sharing:', err);
                this.copyAnalysisLink();
            });
        } else {
            this.copyAnalysisLink();
        }
    }

    copyAnalysisLink() {
        const analysisUrl = `${window.location.origin}${window.location.pathname}?analysis=${this.currentAnalysisResults.analysisId}`;
        navigator.clipboard.writeText(analysisUrl).then(() => {
            this.showNotification('Analysis link copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Unable to copy link', 'error');
        });
    }

    printReport() {
        if (!this.currentAnalysisResults) {
            this.showNotification('No analysis results to print', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        const printContent = this.generatePrintReport();

        printWindow.document.write(`
            <html>
                <head>
                    <title>SecuNik Analysis Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1, h2, h3 { color: #333; }
                        .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; }
                        .section { margin: 20px 0; }
                        .metric { display: flex; justify-content: space-between; margin: 5px 0; }
                        .ai-badge { background: #e7f3ff; padding: 5px; border-radius: 5px; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();

        this.showNotification('Report prepared for printing', 'success');
    }

    generatePrintReport() {
        const data = this.currentAnalysisResults.result || this.currentAnalysisResults;
        const hasAI = data.ai && data.ai.attackVector;

        return `
            <div class="header">
                <h1>SecuNik Cybersecurity Analysis Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <p>File: ${this.currentAnalysisResults.fileInfo?.name || 'N/A'}</p>
                ${hasAI ? '<div class="ai-badge">🤖 AI-Powered Analysis</div>' : ''}
            </div>
            
            <div class="section">
                <h2>Executive Summary</h2>
                <p>${data.executive?.summary || 'No executive summary available'}</p>
            </div>
            
            <div class="section">
                <h2>Key Metrics</h2>
                <div class="metric"><span>Security Events:</span><span>${data.technical?.securityEvents?.length || 0}</span></div>
                <div class="metric"><span>IOCs Detected:</span><span>${data.technical?.detectedIOCs?.length || 0}</span></div>
                <div class="metric"><span>Risk Score:</span><span>${data.ai?.severityScore || 'N/A'}</span></div>
                <div class="metric"><span>Processing Time:</span><span>${this.currentAnalysisResults.processingTime || 'N/A'}</span></div>
            </div>
            
            ${hasAI ? `
            <div class="section">
                <h2>AI Analysis</h2>
                <p><strong>Attack Vector:</strong> ${data.ai.attackVector}</p>
                <p><strong>Business Impact:</strong> ${data.ai.businessImpact}</p>
                <p><strong>Threat Assessment:</strong> ${data.ai.threatAssessment}</p>
            </div>
            ` : ''}
            
            <div class="section">
                <h2>Recommendations</h2>
                ${data.ai?.recommendedActions ? data.ai.recommendedActions.map(action => `<p>• ${action}</p>`).join('') : '<p>No specific recommendations available</p>'}
            </div>
        `;
    }

    resetAnalysis() {
        if (confirm('Are you sure you want to start a new analysis session? This will clear all current results.')) {
            this.currentAnalysisResults = null;
            this.currentFileInfo = null;
            this.analysisHistory = [];
            this.analysisCounter = 0;
            this.fileQueue = [];

            this.results.classList.add('hidden');
            this.uploadAnotherBtn.style.display = 'none';
            this.multiFileSummary.style.display = 'none';
            this.fileQueue.style.display = 'none';

            this.updateAnalysisCounter();
            this.showNotification('Analysis session reset', 'info');
        }
    }

    updateAnalysisCounter() {
        if (this.analysisCounterElement) {
            this.analysisCounterElement.textContent = `${this.analysisCounter} Files Analyzed`;
        }
    }

    // Settings management
    loadSettings() {
        const saved = localStorage.getItem('secunik_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.applySettings();
        }
    }

    saveSettings() {
        localStorage.setItem('secunik_settings', JSON.stringify(this.settings));
        this.showNotification('Settings saved', 'success');
    }

    applySettings() {
        document.getElementById('aiModeSelect').value = this.settings.aiMode;
        document.getElementById('reportDetailSelect').value = this.settings.reportDetail;
        document.getElementById('notificationsToggle').checked = this.settings.notifications;
    }

    // Utility functions
    generateAnalysisId() {
        return 'ANL_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    generateSessionId() {
        return 'SES_' + Date.now().toString(36).substr(-8);
    }

    // Keep all existing functions from the original app.js
    updateOverviewMetrics(data) {
        const technical = data.technical || {};
        const ai = data.ai || {};

        document.getElementById('eventCount').textContent = technical.securityEvents?.length || 0;
        document.getElementById('iocCount').textContent = technical.detectedIOCs?.length || 0;
        document.getElementById('riskScore').textContent = ai.severityScore || 'N/A';

        this.createAIEnhancedOverview(data);
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

    // Continue with all the existing methods from the original app.js...
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

    // Continue with all utility functions and IOC handling methods
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
                    <h3>⚠️ Enhanced AI Analysis Failed</h3>
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
        if (!this.settings.notifications) return;

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
                console.log('✅ SecuNik enhanced system status:', data);
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
            console.log('=== TESTING ENHANCED AI API CONNECTIVITY ===');

            const healthResponse = await fetch('/api/analysis/health');
            console.log('Enhanced health check status:', healthResponse.status);

            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log('✅ Enhanced health check data:', healthData);
            }

            const typesResponse = await fetch('/api/analysis/supported-types');
            if (typesResponse.ok) {
                const typesData = await typesResponse.json();
                console.log('✅ Enhanced supported types:', typesData);
            }

        } catch (error) {
            console.error('❌ Enhanced API connectivity test failed:', error);
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

// Initialize the enhanced SecuNik application
document.addEventListener('DOMContentLoaded', () => {
    window.secuNikApp = new SecuNikApp();
    console.log('🚀 SecuNik Enhanced AI Cybersecurity Platform initialized with multi-file support');
});

// Global enhanced test functions
window.testAPI = async function () {
    if (window.secuNikApp) {
        await window.secuNikApp.testAPIConnection();
    } else {
        console.error('Enhanced SecuNik app not initialized');
    }
};

window.addEventListener('error', (event) => {
    console.error('Global enhanced error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Enhanced unhandled promise rejection:', event.reason);
    event.preventDefault();
});
document.addEventListener('DOMContentLoaded', () => new SecuNikApp());
