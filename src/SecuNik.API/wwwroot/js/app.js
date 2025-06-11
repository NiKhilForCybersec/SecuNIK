// SecuNik Professional Widget Dashboard - Comprehensive JavaScript Application
// Enhanced with AI integration, advanced analytics, and professional cybersecurity features

class SecuNikWidgetApp {
    constructor() {
        this.currentAnalysisResults = null;
        this.currentFileInfo = null;
        this.analysisHistory = [];
        this.analysisCounter = 0;
        this.isAnalyzing = false;
        this.widgets = new Map();
        this.animationIntervals = [];
        this.performanceMetrics = {
            cpuUsage: 0,
            memoryUsage: 0,
            analysisSpeed: 0
        };

        this.settings = {
            aiMode: 'auto',
            reportDetail: 'executive',
            notifications: true,
            autoRefresh: true,
            theme: 'professional',
            enableAI: true,
            fallbackToBasicAnalysis: true
        };

        this.securityPatterns = {
            'Critical': ['malware', 'ransomware', 'trojan', 'exploit', 'breach'],
            'High': ['failed login', 'unauthorized', 'privilege escalation', 'suspicious'],
            'Medium': ['error', 'warning', 'blocked', 'denied'],
            'Low': ['info', 'debug', 'notice']
        };

        this.iocPatterns = {
            ip: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
            domain: /\b[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}\b/g,
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            hash: /\b[a-fA-F0-9]{32,64}\b/g,
            url: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g
        };

        this.initializeApp();
    }

    async initializeApp() {
        console.log('🚀 Initializing SecuNik Professional Widget Dashboard v2.0...');

        this.initializeElements();
        this.setupEventListeners();
        this.initializeWidgets();
        this.loadSettings();
        await this.checkSystemStatus();
        await this.testAPIConnection();
        this.startSystemAnimations();
        this.setupAdvancedFeatures();

        console.log('✅ SecuNik Widget Dashboard fully initialized with AI capabilities');
    }

    initializeElements() {
        // Core upload elements
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.chooseFilesBtn = document.getElementById('chooseFilesBtn');
        this.uploadAnotherBtn = document.getElementById('uploadAnotherBtn');

        // Progress and queue elements
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressDetails = document.getElementById('progressDetails');

        // Navigation and status elements
        this.analysisCounter = document.getElementById('analysisCounter');
        this.systemStatus = document.getElementById('systemStatus');
        this.helpBtn = document.getElementById('helpBtn');
        this.settingsBtn = document.getElementById('settingsBtn');

        // Dashboard elements
        this.widgetsDashboard = document.getElementById('widgetsDashboard');
        this.emptyState = document.getElementById('emptyState');

        // Modal elements
        this.helpModal = document.getElementById('helpModal');
        this.settingsModal = document.getElementById('settingsModal');

        console.log('📋 UI elements initialized');
    }

    setupEventListeners() {
        // File upload handlers
        this.fileInput?.addEventListener('change', (e) => this.handleFileSelection(e));
        this.chooseFilesBtn?.addEventListener('click', () => this.triggerFileInput());
        this.uploadAnotherBtn?.addEventListener('click', () => this.triggerFileInput());

        // Enhanced drag and drop handlers
        this.uploadZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone?.addEventListener('drop', (e) => this.handleDrop(e));
        // Remove auto-click on upload zone to prevent accidental re-uploads

        // Navigation handlers
        this.helpBtn?.addEventListener('click', () => this.showModal('helpModal'));
        this.settingsBtn?.addEventListener('click', () => this.showModal('settingsModal'));

        // Modal management
        this.setupModalHandlers();
        this.setupSettingsHandlers();

        // Global drag prevention
        this.preventGlobalDrag();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('⚡ Event listeners configured');
    }

    initializeWidgets() {
        // Security Events Widget
        this.widgets.set('securityEvents', {
            element: document.getElementById('securityEventsWidget'),
            counter: document.getElementById('securityEventsCount'),
            status: document.getElementById('eventsStatus'),
            change: document.getElementById('eventsChange'),
            type: 'metric',
            priority: 1
        });

        // IOCs Widget
        this.widgets.set('iocs', {
            element: document.getElementById('iocsWidget'),
            counter: document.getElementById('iocsCount'),
            status: document.getElementById('iocsStatus'),
            change: document.getElementById('iocsChange'),
            type: 'metric',
            priority: 2
        });

        // Risk Score Widget
        this.widgets.set('riskScore', {
            element: document.getElementById('riskScoreWidget'),
            counter: document.getElementById('riskScoreValue'),
            status: document.getElementById('riskStatus'),
            change: document.getElementById('riskChange'),
            type: 'metric',
            priority: 3
        });

        // AI Confidence Widget
        this.widgets.set('aiConfidence', {
            element: document.getElementById('aiConfidenceWidget'),
            counter: document.getElementById('aiConfidenceValue'),
            status: document.getElementById('aiStatus'),
            change: document.getElementById('aiChange'),
            type: 'metric',
            priority: 4
        });

        // File Status Widget
        this.widgets.set('fileStatus', {
            element: document.getElementById('fileStatusWidget'),
            indicator: document.getElementById('fileStatusIndicator'),
            title: document.getElementById('fileStatusTitle'),
            description: document.getElementById('fileStatusDescription'),
            badge: document.getElementById('fileStatusBadge'),
            type: 'status',
            priority: 5
        });

        // Threat Intelligence Widget
        this.widgets.set('threatIntel', {
            element: document.getElementById('threatIntelWidget'),
            list: document.getElementById('threatIntelList'),
            status: document.getElementById('threatIntelStatus'),
            type: 'list',
            priority: 6
        });

        // Timeline Widget
        this.widgets.set('timeline', {
            element: document.getElementById('timelineWidget'),
            list: document.getElementById('timelineList'),
            status: document.getElementById('timelineStatus'),
            type: 'list',
            priority: 7
        });

        // Performance Widget
        this.widgets.set('performance', {
            element: document.getElementById('performanceWidget'),
            status: document.getElementById('performanceStatus'),
            cpu: document.getElementById('cpuUsage'),
            memory: document.getElementById('memoryUsage'),
            speed: document.getElementById('analysisSpeed'),
            cpuProgress: document.getElementById('cpuProgress'),
            memoryProgress: document.getElementById('memoryProgress'),
            speedProgress: document.getElementById('speedProgress'),
            type: 'progress',
            priority: 8
        });

        // Executive Summary Widget
        this.widgets.set('executiveSummary', {
            element: document.getElementById('executiveSummaryWidget'),
            content: document.getElementById('executiveSummaryContent'),
            status: document.getElementById('executiveStatus'),
            type: 'content',
            priority: 9
        });

        // Compliance Widget
        this.widgets.set('compliance', {
            element: document.getElementById('complianceWidget'),
            score: document.getElementById('complianceScore'),
            status: document.getElementById('complianceStatus'),
            change: document.getElementById('complianceChange'),
            type: 'metric',
            priority: 10
        });

        // Processing Time Widget
        this.widgets.set('processingTime', {
            element: document.getElementById('processingTimeWidget'),
            value: document.getElementById('processingTimeValue'),
            status: document.getElementById('processingStatus'),
            change: document.getElementById('processingChange'),
            type: 'metric',
            priority: 11
        });

        console.log(`🎛️ ${this.widgets.size} widgets initialized`);
    }

    setupModalHandlers() {
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
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'flex') {
                        this.hideModal(modal.id);
                    }
                });
            }
        });
    }

    setupSettingsHandlers() {
        const aiModeSelect = document.getElementById('aiModeSelect');
        const reportDetailSelect = document.getElementById('reportDetailSelect');
        const notificationsToggle = document.getElementById('notificationsToggle');

        aiModeSelect?.addEventListener('change', (e) => {
            this.settings.aiMode = e.target.value;
            this.saveSettings();
            this.showNotification('AI analysis mode updated', 'success');
            this.updateAIModeStatus();
        });

        reportDetailSelect?.addEventListener('change', (e) => {
            this.settings.reportDetail = e.target.value;
            this.saveSettings();
            this.showNotification('Report detail level updated', 'success');
        });

        notificationsToggle?.addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
            this.saveSettings();
            this.showNotification('Notification settings updated', 'success');
        });
    }

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
                        this.resetAnalysis();
                        break;
                }
            }
        });
    }

    preventGlobalDrag() {
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    setupAdvancedFeatures() {
        // Setup right-click context menus for widgets
        this.widgets.forEach((widget, key) => {
            if (widget.element) {
                widget.element.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showWidgetContextMenu(e, key);
                });
            }
        });

        // Setup widget refresh functionality
        this.setupWidgetRefresh();

        // Initialize performance monitoring
        this.initializePerformanceMonitoring();
    }

    // File Upload Handlers
    triggerFileInput() {
        if (this.fileInput) {
            this.fileInput.click();
        }
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
        // Reset file input
        event.target.value = '';
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadZone?.classList.add('dragover');
        this.showDragFeedback(true);
    }

    handleDragLeave(event) {
        event.preventDefault();
        if (!this.uploadZone?.contains(event.relatedTarget)) {
            this.uploadZone?.classList.remove('dragover');
            this.showDragFeedback(false);
        }
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadZone?.classList.remove('dragover');
        this.showDragFeedback(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    showDragFeedback(show) {
        if (show) {
            this.uploadZone?.classList.add('drag-active');
        } else {
            this.uploadZone?.classList.remove('drag-active');
        }
    }

    async processFile(file) {
        console.log('📁 Processing file:', file.name);

        if (this.isAnalyzing) {
            this.showNotification('Analysis already in progress. Please wait.', 'warning');
            return;
        }

        if (!this.validateFile(file)) {
            return;
        }

        this.currentFileInfo = {
            name: file.name,
            size: file.size,
            type: file.type || this.detectFileType(file.name),
            lastModified: file.lastModified
        };

        this.isAnalyzing = true;
        await this.analyzeFile(file);
        this.isAnalyzing = false;
    }

    validateFile(file) {
        // Size validation
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            this.showNotification('File too large. Maximum size is 50MB.', 'error');
            return false;
        }

        // Type validation
        const validExtensions = [
            '.csv', '.json', '.log', '.txt', '.evtx', '.evt',
            '.wtmp', '.utmp', '.btmp', '.lastlog', '.pcap', '.pcapng',
            '.syslog', '.fwlog', '.dblog', '.maillog', '.dnslog'
        ];

        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!validExtensions.includes(extension)) {
            this.showNotification(`Unsupported file type: ${extension}. Supported formats: ${validExtensions.join(', ')}`, 'error');
            return false;
        }

        return true;
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

    async analyzeFile(file) {
        console.log('🔍 Starting comprehensive analysis for:', file.name);

        try {
            this.prepareAnalysisUI();
            this.showUploadProgress();
            this.updateFileStatusWidget('analyzing', file.name);
            this.simulateProgress();

            const formData = new FormData();
            formData.append('file', file);
            formData.append('EnableAIAnalysis', this.settings.aiMode !== 'rules-only');
            formData.append('GenerateExecutiveReport', this.settings.reportDetail !== 'technical');
            formData.append('IncludeTimeline', 'true');
            formData.append('DetailLevel', this.settings.reportDetail);

            const startTime = Date.now();

            const response = await fetch('/api/analysis/upload', {
                method: 'POST',
                body: formData
            });

            const processingTime = Date.now() - startTime;

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

            // Enhanced result processing
            result.fileInfo = this.currentFileInfo;
            result.processingTime = `${(processingTime / 1000).toFixed(2)}s`;
            result.fileSize = file.size;
            result.analysisId = this.generateAnalysisId();
            result.timestamp = new Date().toISOString();

            this.hideUploadProgress();
            this.displayComprehensiveResults(result, processingTime);
            this.updateAnalysisCounter();

            this.currentAnalysisResults = result;
            this.analysisHistory.push(result);
            this.analysisCounter++;

            this.showNotification('Analysis completed successfully!', 'success');

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            this.hideUploadProgress();
            this.showAnalysisError(error.message);
            this.showNotification('Analysis failed: ' + error.message, 'error');
        }
    }

    prepareAnalysisUI() {
        this.showWidgets();
        this.hideEmptyState();
        this.resetAllWidgets();
    }

    displayComprehensiveResults(result, processingTime) {
        console.log('📊 Displaying comprehensive analysis results');

        const data = result.result || result;
        const hasAI = data.ai && (data.ai.attackVector || data.ai.severityScore);

        // Update all widgets with comprehensive data
        this.updateSecurityEventsWidget(data);
        this.updateIOCsWidget(data);
        this.updateRiskScoreWidget(data);
        this.updateAIConfidenceWidget(data, hasAI);
        this.updateFileStatusWidget('complete', this.currentFileInfo?.name || 'Unknown');
        this.updateThreatIntelWidget(data);
        this.updateTimelineWidget(data);
        this.updatePerformanceWidget(processingTime);
        this.updateExecutiveSummaryWidget(data, hasAI);
        this.updateComplianceWidget(data);
        this.updateProcessingTimeWidget(processingTime);

        // Store comprehensive analysis data
        this.storeAnalysisData(data, processingTime);

        // Note: Upload another button functionality disabled for single upload mode
    }

    // Comprehensive Widget Update Methods
    updateSecurityEventsWidget(data) {
        const widget = this.widgets.get('securityEvents');
        if (!widget?.element) return;

        const events = data.technical?.securityEvents || [];
        const eventCount = events.length;
        const severity = this.calculateEventSeverity(events);
        const trend = this.calculateEventTrend(events);

        if (widget.counter) {
            widget.counter.textContent = eventCount;
            this.animateCounter(widget.counter, 0, eventCount, 1000);
        }

        if (widget.status) {
            widget.status.textContent = severity;
            widget.status.className = 'widget-badge ' + severity.toLowerCase();
        }

        if (widget.change) {
            const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '📊';
            widget.change.innerHTML = `<span>${trendIcon}</span><span>+${eventCount}</span>`;
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    updateIOCsWidget(data) {
        const widget = this.widgets.get('iocs');
        if (!widget?.element) return;

        const iocs = data.technical?.detectedIOCs || [];
        const iocCount = iocs.length;
        const categorized = this.categorizeIOCs(iocs);

        if (widget.counter) {
            widget.counter.textContent = iocCount;
            this.animateCounter(widget.counter, 0, iocCount, 1000);
        }

        if (widget.status) {
            const status = iocCount > 0 ? 'Detected' : 'None';
            widget.status.textContent = status;
            widget.status.className = `widget-badge ${iocCount > 0 ? 'info' : 'success'}`;
        }

        if (widget.change) {
            widget.change.innerHTML = `<span>🔍</span><span>Analyzed</span>`;
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);

        // Store IOC data for detailed view
        widget.element.setAttribute('data-iocs', JSON.stringify(categorized));
    }

    updateRiskScoreWidget(data) {
        const widget = this.widgets.get('riskScore');
        if (!widget?.element) return;

        const riskScore = data.ai?.severityScore || this.calculateRiskScore(data);
        const riskLevel = this.getRiskLevel(riskScore);
        const riskColor = this.getRiskColor(riskLevel);

        if (widget.counter) {
            widget.counter.textContent = riskScore;
            widget.counter.style.color = riskColor;
            this.animateCounter(widget.counter, 0, riskScore, 1500);
        }

        if (widget.status) {
            widget.status.textContent = riskLevel;
            widget.status.className = 'widget-badge ' + riskLevel.toLowerCase();
        }

        if (widget.change) {
            widget.change.innerHTML = `<span>📊</span><span>Calculated</span>`;
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    updateAIConfidenceWidget(data, hasAI) {
        const widget = this.widgets.get('aiConfidence');
        if (!widget?.element) return;

        const confidence = hasAI ? this.calculateAIConfidence(data) : this.calculateRuleConfidence(data);
        const confidencePercent = Math.round(confidence * 100);

        if (widget.counter) {
            widget.counter.textContent = `${confidencePercent}%`;
            this.animateCounter(widget.counter, 0, confidencePercent, 1200);
        }

        if (widget.status) {
            widget.status.textContent = hasAI ? 'AI' : 'Rules';
            widget.status.className = `widget-badge ${hasAI ? 'success' : 'info'}`;
        }

        if (widget.change) {
            const level = confidencePercent >= 90 ? 'High' : confidencePercent >= 70 ? 'Medium' : 'Low';
            widget.change.innerHTML = `<span>✨</span><span>${level}</span>`;
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    updateFileStatusWidget(status, fileName) {
        const widget = this.widgets.get('fileStatus');
        if (!widget?.element) return;

        const statusConfig = {
            analyzing: {
                icon: '🔄',
                title: 'Analysis in Progress',
                description: `Processing ${fileName} with AI-enhanced detection`,
                badge: 'Processing',
                class: 'info'
            },
            complete: {
                icon: '✅',
                title: 'Analysis Complete',
                description: `Successfully analyzed ${fileName} - ${this.getAnalysisSummary()}`,
                badge: 'Complete',
                class: 'success'
            },
            error: {
                icon: '❌',
                title: 'Analysis Failed',
                description: `Failed to analyze ${fileName} - check file format`,
                badge: 'Error',
                class: 'error'
            }
        };

        const config = statusConfig[status] || statusConfig.complete;

        if (widget.indicator) {
            widget.indicator.innerHTML = `<span>${config.icon}</span>`;
            if (status === 'analyzing') {
                widget.indicator.classList.add('spinning');
            } else {
                widget.indicator.classList.remove('spinning');
            }
        }

        if (widget.title) widget.title.textContent = config.title;
        if (widget.description) widget.description.textContent = config.description;
        if (widget.badge) {
            widget.badge.textContent = config.badge;
            widget.badge.className = 'widget-badge ' + config.class;
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    updateThreatIntelWidget(data) {
        const widget = this.widgets.get('threatIntel');
        if (!widget?.element || !widget.list) return;

        const events = data.technical?.securityEvents || [];
        const threats = this.extractThreatIntelligence(events);
        const threatCount = threats.length;

        if (widget.status) {
            widget.status.textContent = threatCount > 0 ? `${threatCount} Threats` : 'No Threats';
            widget.status.className = `widget-badge ${threatCount > 0 ? 'error' : 'success'}`;
        }

        if (threats.length > 0) {
            widget.list.innerHTML = threats.slice(0, 5).map(threat => `
                <div class="threat-intel-item" data-severity="${threat.severity.toLowerCase()}">
                    <div class="threat-icon">${this.getThreatIcon(threat.type)}</div>
                    <div class="threat-content">
                        <div class="threat-title">${threat.title}</div>
                        <div class="threat-description">${this.truncateText(threat.description, 80)}</div>
                        <div class="threat-metadata">
                            <span class="threat-time">${this.formatTime(threat.timestamp)}</span>
                            <span class="threat-source">${threat.source}</span>
                        </div>
                    </div>
                    <div class="threat-severity severity-${threat.severity.toLowerCase()}">${threat.severity}</div>
                </div>
            `).join('');
        } else {
            widget.list.innerHTML = '<div class="no-threats">No security threats detected</div>';
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    updateTimelineWidget(data) {
        const widget = this.widgets.get('timeline');
        if (!widget?.element || !widget.list) return;

        const events = data.timeline?.events || this.buildTimelineFromEvents(data.technical?.securityEvents || []);
        const eventCount = events.length;

        if (widget.status) {
            widget.status.textContent = `${eventCount} Events`;
            widget.status.className = 'widget-badge info';
        }

        if (events.length > 0) {
            widget.list.innerHTML = events.slice(0, 6).map((event, index) => `
                <div class="timeline-event-item" style="animation-delay: ${index * 100}ms">
                    <div class="timeline-timestamp">${this.formatTimestamp(event.timestamp)}</div>
                    <div class="timeline-event-content">
                        <div class="timeline-event-title">${event.event || event.eventType || 'System Event'}</div>
                        <div class="timeline-event-source">${event.source || 'System'}</div>
                        <div class="timeline-event-confidence">${event.confidence || 'High'} confidence</div>
                    </div>
                </div>
            `).join('');
        } else {
            widget.list.innerHTML = '<div class="no-events">No timeline events available</div>';
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    updatePerformanceWidget(processingTime) {
        const widget = this.widgets.get('performance');
        if (!widget?.element) return;

        // Calculate performance metrics
        const cpuUsage = this.calculateCPUUsage(processingTime);
        const memoryUsage = this.calculateMemoryUsage();
        const analysisSpeed = this.calculateAnalysisSpeed(processingTime);

        // Update display values
        if (widget.cpu) {
            widget.cpu.textContent = `${cpuUsage}%`;
            this.animateCounter(widget.cpu, 0, cpuUsage, 800);
        }
        if (widget.memory) {
            widget.memory.textContent = `${memoryUsage}%`;
            this.animateCounter(widget.memory, 0, memoryUsage, 900);
        }
        if (widget.speed) {
            widget.speed.textContent = `${analysisSpeed}/s`;
        }

        // Update progress bars
        if (widget.cpuProgress) {
            this.animateProgressBar(widget.cpuProgress, cpuUsage);
        }
        if (widget.memoryProgress) {
            this.animateProgressBar(widget.memoryProgress, memoryUsage);
        }
        if (widget.speedProgress) {
            this.animateProgressBar(widget.speedProgress, Math.min(analysisSpeed * 10, 100));
        }

        if (widget.status) {
            widget.status.textContent = 'Optimal';
            widget.status.className = 'widget-badge success';
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);

        // Store metrics for trending
        this.performanceMetrics = { cpuUsage, memoryUsage, analysisSpeed };
    }

    updateExecutiveSummaryWidget(data, hasAI) {
        const widget = this.widgets.get('executiveSummary');
        if (!widget?.element || !widget.content) return;

        if (hasAI && (data.executive?.summary || data.ai?.businessImpact)) {
            const aiSummary = this.generateAIExecutiveSummary(data);
            widget.content.innerHTML = aiSummary;
            if (widget.status) {
                widget.status.textContent = 'AI Generated';
                widget.status.className = 'widget-badge success';
            }
        } else {
            const basicSummary = this.generateBasicExecutiveSummary(data);
            widget.content.innerHTML = basicSummary;
            if (widget.status) {
                widget.status.textContent = 'Rule-Based';
                widget.status.className = 'widget-badge info';
            }
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    updateComplianceWidget(data) {
        const widget = this.widgets.get('compliance');
        if (!widget?.element) return;

        const complianceScore = this.calculateComplianceScore(data);
        const complianceStatus = this.getComplianceStatus(complianceScore);

        if (widget.score) {
            widget.score.textContent = `${complianceScore}%`;
            this.animateCounter(widget.score, 0, complianceScore, 1300);
        }

        if (widget.status) {
            widget.status.textContent = complianceStatus;
            widget.status.className = `widget-badge ${this.getComplianceClass(complianceScore)}`;
        }

        if (widget.change) {
            widget.change.innerHTML = `<span>📋</span><span>Assessed</span>`;
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    updateProcessingTimeWidget(processingTime) {
        const widget = this.widgets.get('processingTime');
        if (!widget?.element) return;

        const seconds = Math.round(processingTime / 1000 * 10) / 10;
        const timeStatus = this.getProcessingTimeStatus(seconds);

        if (widget.value) {
            widget.value.textContent = seconds;
            this.animateCounter(widget.value, 0, seconds, 800);
        }

        if (widget.status) {
            widget.status.textContent = timeStatus;
            widget.status.className = `widget-badge ${this.getTimeStatusClass(seconds)}`;
        }

        if (widget.change) {
            widget.change.innerHTML = `<span>🚀</span><span>${timeStatus}</span>`;
        }

        widget.element.style.display = 'block';
        this.addWidgetAnimation(widget.element);
    }

    // Progress and Animation Methods
    showUploadProgress() {
        if (this.uploadProgress) {
            this.uploadProgress.style.display = 'block';
        }
    }

    hideUploadProgress() {
        if (this.uploadProgress) {
            this.uploadProgress.style.display = 'none';
        }
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
    }

    simulateProgress() {
        let progress = 0;
        const stages = [
            'Initializing AI analysis engine...',
            'Parsing file structure and headers...',
            'Extracting security events and patterns...',
            'Running advanced threat detection...',
            'Analyzing with machine learning models...',
            'Correlating indicators of compromise...',
            'Generating threat intelligence insights...',
            'Compiling executive summary...',
            'Finalizing comprehensive report...'
        ];

        const interval = setInterval(() => {
            progress += Math.random() * 12 + 3;
            if (progress > 95) progress = 95;

            if (this.progressFill) {
                this.progressFill.style.width = `${progress}%`;
            }

            const stageIndex = Math.floor(progress / 12);
            if (this.progressDetails && stages[stageIndex]) {
                this.progressDetails.textContent = stages[stageIndex];
            }

            if (progress >= 95) {
                clearInterval(interval);
                setTimeout(() => {
                    if (this.progressFill) this.progressFill.style.width = '100%';
                    if (this.progressDetails) this.progressDetails.textContent = 'Analysis complete!';
                }, 500);
            }
        }, 200);
    }

    animateCounter(element, start, end, duration) {
        if (!element) return;

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * this.easeOutCubic(progress));

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = end;
            }
        };

        requestAnimationFrame(animate);
    }

    animateProgressBar(element, targetWidth) {
        if (!element) return;

        element.style.transition = 'width 1s ease-out';
        element.style.width = `${targetWidth}%`;
    }

    addWidgetAnimation(element) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    startSystemAnimations() {
        // Animate system status indicators
        setInterval(() => {
            if (this.isAnalyzing) {
                this.updatePerformanceMetrics();
            }
        }, 2000);

        // Pulse animation for active elements
        setInterval(() => {
            document.querySelectorAll('.status-dot').forEach(dot => {
                dot.style.animation = 'pulse 2s infinite';
            });
        }, 1000);
    }

    updatePerformanceMetrics() {
        if (!this.isAnalyzing) return;

        const widget = this.widgets.get('performance');
        if (!widget) return;

        // Simulate realistic performance fluctuations during analysis
        const cpuVariation = Math.random() * 10 - 5;
        const memoryVariation = Math.random() * 8 - 4;

        const newCpu = Math.max(0, Math.min(100, this.performanceMetrics.cpuUsage + cpuVariation));
        const newMemory = Math.max(0, Math.min(100, this.performanceMetrics.memoryUsage + memoryVariation));

        if (widget.cpu) widget.cpu.textContent = `${Math.round(newCpu)}%`;
        if (widget.memory) widget.memory.textContent = `${Math.round(newMemory)}%`;
        if (widget.cpuProgress) widget.cpuProgress.style.width = `${newCpu}%`;
        if (widget.memoryProgress) widget.memoryProgress.style.width = `${newMemory}%`;

        this.performanceMetrics.cpuUsage = newCpu;
        this.performanceMetrics.memoryUsage = newMemory;
    }

    // Widget Management
    showWidgets() {
        this.widgets.forEach((widget, key) => {
            if (widget.element) {
                widget.element.style.display = 'block';
            }
        });
    }

    hideEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }

    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'block';
        }

        // Hide upload another button when showing empty state
        if (this.uploadAnotherBtn) {
            this.uploadAnotherBtn.style.display = 'none';
        }

        this.resetAllWidgets();
    }

    resetAllWidgets() {
        this.widgets.forEach((widget, key) => {
            if (widget.element) {
                widget.element.style.display = 'none';
            }
        });
    }

    setupWidgetRefresh() {
        this.widgets.forEach((widget, key) => {
            if (widget.element) {
                // Add refresh button to widget headers
                const header = widget.element.querySelector('.widget-header');
                if (header && !header.querySelector('.widget-refresh')) {
                    const refreshBtn = document.createElement('button');
                    refreshBtn.className = 'widget-refresh';
                    refreshBtn.innerHTML = '🔄';
                    refreshBtn.title = 'Refresh widget';
                    refreshBtn.addEventListener('click', () => this.refreshWidget(key));
                    header.appendChild(refreshBtn);
                }
            }
        });
    }

    refreshWidget(widgetKey) {
        if (this.currentAnalysisResults) {
            switch (widgetKey) {
                case 'securityEvents':
                    this.updateSecurityEventsWidget(this.currentAnalysisResults.result || this.currentAnalysisResults);
                    break;
                case 'iocs':
                    this.updateIOCsWidget(this.currentAnalysisResults.result || this.currentAnalysisResults);
                    break;
                case 'riskScore':
                    this.updateRiskScoreWidget(this.currentAnalysisResults.result || this.currentAnalysisResults);
                    break;
                // Add more widget refresh handlers as needed
            }
            this.showNotification(`${widgetKey} widget refreshed`, 'info');
        }
    }

    showWidgetContextMenu(event, widgetKey) {
        // Create context menu for widget actions
        const contextMenu = document.createElement('div');
        contextMenu.className = 'widget-context-menu';
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.zIndex = '1000';

        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="window.secuNikApp.refreshWidget('${widgetKey}')">🔄 Refresh</div>
            <div class="context-menu-item" onclick="window.secuNikApp.exportWidget('${widgetKey}')">📤 Export</div>
            <div class="context-menu-item" onclick="window.secuNikApp.minimizeWidget('${widgetKey}')">➖ Minimize</div>
        `;

        document.body.appendChild(contextMenu);

        // Remove context menu on click outside
        setTimeout(() => {
            document.addEventListener('click', () => {
                if (contextMenu.parentNode) {
                    contextMenu.remove();
                }
            }, { once: true });
        }, 100);
    }

    exportWidget(widgetKey) {
        const widget = this.widgets.get(widgetKey);
        if (!widget || !this.currentAnalysisResults) return;

        const data = this.currentAnalysisResults.result || this.currentAnalysisResults;
        let exportData = {};

        switch (widgetKey) {
            case 'securityEvents':
                exportData = {
                    widget: 'Security Events',
                    events: data.technical?.securityEvents || [],
                    count: data.technical?.securityEvents?.length || 0,
                    exportTime: new Date().toISOString()
                };
                break;
            case 'iocs':
                exportData = {
                    widget: 'Indicators of Compromise',
                    iocs: data.technical?.detectedIOCs || [],
                    categorized: this.categorizeIOCs(data.technical?.detectedIOCs || []),
                    exportTime: new Date().toISOString()
                };
                break;
            // Add more widget export handlers
        }

        this.downloadJSON(exportData, `secunik-${widgetKey}-export.json`);
        this.showNotification(`${widgetKey} widget data exported`, 'success');
    }

    minimizeWidget(widgetKey) {
        const widget = this.widgets.get(widgetKey);
        if (!widget?.element) return;

        const content = widget.element.querySelector('.widget-content, .metric-value, .status-content');
        if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Settings Management
    loadSettings() {
        const saved = localStorage.getItem('secunik_widget_settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('secunik_widget_settings', JSON.stringify(this.settings));
    }

    applySettings() {
        const aiModeSelect = document.getElementById('aiModeSelect');
        const reportDetailSelect = document.getElementById('reportDetailSelect');
        const notificationsToggle = document.getElementById('notificationsToggle');

        if (aiModeSelect) aiModeSelect.value = this.settings.aiMode;
        if (reportDetailSelect) reportDetailSelect.value = this.settings.reportDetail;
        if (notificationsToggle) notificationsToggle.checked = this.settings.notifications;
    }

    updateAIModeStatus() {
        // Update UI elements based on AI mode
        const aiIndicators = document.querySelectorAll('.ai-indicator');
        aiIndicators.forEach(indicator => {
            indicator.style.display = this.settings.aiMode === 'ai-only' ? 'block' : 'none';
        });
    }

    initializePerformanceMonitoring() {
        // Initial performance metrics
        this.performanceMetrics = {
            cpuUsage: Math.floor(Math.random() * 20 + 10),
            memoryUsage: Math.floor(Math.random() * 30 + 20),
            analysisSpeed: 0
        };
    }

    // API Methods
    async checkSystemStatus() {
        try {
            const response = await fetch('/health');
            if (response.ok) {
                const data = await response.json();
                if (this.systemStatus) {
                    this.systemStatus.textContent = 'System Online';
                }
                console.log('✅ System health check passed:', data);
                return true;
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            if (this.systemStatus) {
                this.systemStatus.textContent = 'System Issues';
            }
            console.warn('❌ System health check failed:', error);
            return false;
        }
    }

    async testAPIConnection() {
        try {
            console.log('🔗 Testing API connectivity...');

            const healthResponse = await fetch('/api/analysis/health');
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log('✅ API health check:', healthData);
            }

            const typesResponse = await fetch('/api/analysis/supported-types');
            if (typesResponse.ok) {
                const typesData = await typesResponse.json();
                console.log('✅ Supported file types:', typesData);
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ API connection test failed:', error);
            return false;
        }
    }

    updateAnalysisCounter() {
        if (this.analysisCounter) {
            this.analysisCounter.textContent = `${this.analysisCounter} Files Analyzed`;
        }
    }

    // Calculation and Analysis Methods
    calculateEventSeverity(events) {
        const criticalCount = events.filter(e => e.severity?.toLowerCase() === 'critical').length;
        const highCount = events.filter(e => e.severity?.toLowerCase() === 'high').length;

        if (criticalCount > 0) return 'Critical';
        if (highCount > 3) return 'High';
        if (events.length > 10) return 'Medium';
        return 'Low';
    }

    calculateEventTrend(events) {
        // Simple trend calculation based on event timestamps
        if (events.length < 2) return 0;

        const recent = events.filter(e => {
            const eventTime = new Date(e.timestamp);
            const now = new Date();
            return (now - eventTime) < (24 * 60 * 60 * 1000); // Last 24 hours
        });

        return recent.length / events.length > 0.5 ? 1 : -1;
    }

    calculateRiskScore(data) {
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        let score = 1;

        // Event-based scoring
        score += Math.min(events.length / 5, 4);

        // IOC-based scoring  
        score += Math.min(iocs.length / 3, 3);

        // Severity-based scoring
        const criticalEvents = events.filter(e => e.severity?.toLowerCase() === 'critical').length;
        const highEvents = events.filter(e => e.severity?.toLowerCase() === 'high').length;
        score += Math.min(criticalEvents * 2 + highEvents, 3);

        return Math.min(Math.round(score), 10);
    }

    getRiskLevel(score) {
        if (score >= 8) return 'Critical';
        if (score >= 6) return 'High';
        if (score >= 4) return 'Medium';
        return 'Low';
    }

    getRiskColor(level) {
        const colors = {
            'Critical': '#ef4444',
            'High': '#f59e0b',
            'Medium': '#3b82f6',
            'Low': '#10b981'
        };
        return colors[level] || '#6b7280';
    }

    calculateAIConfidence(data) {
        if (data.ai?.attackVector && data.ai?.severityScore) {
            return 0.95; // High confidence for AI analysis
        }
        return 0.85;
    }

    calculateRuleConfidence(data) {
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        if (events.length > 20 && iocs.length > 10) return 0.80;
        if (events.length > 10 && iocs.length > 5) return 0.70;
        return 0.60;
    }

    calculateCPUUsage(processingTime) {
        // Simulate CPU usage based on processing complexity
        const baseUsage = 15;
        const processingFactor = Math.min(processingTime / 1000 / 10, 20);
        return Math.round(baseUsage + processingFactor + Math.random() * 10);
    }

    calculateMemoryUsage() {
        // Simulate memory usage
        return Math.round(25 + Math.random() * 35);
    }

    calculateAnalysisSpeed(processingTime) {
        // Events per second
        const eventsCount = this.currentAnalysisResults?.result?.technical?.securityEvents?.length || 0;
        return Math.round(eventsCount / (processingTime / 1000));
    }

    calculateComplianceScore(data) {
        const events = data.technical?.securityEvents || [];
        const iocs = data.technical?.detectedIOCs || [];

        let score = 100;

        // Deduct points for security issues
        score -= Math.min(events.length * 2, 40);
        score -= Math.min(iocs.length * 3, 30);

        // Deduct more for critical events
        const criticalEvents = events.filter(e => e.severity?.toLowerCase() === 'critical').length;
        score -= criticalEvents * 10;

        return Math.max(score, 0);
    }

    getComplianceStatus(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        if (score >= 60) return 'Poor';
        return 'Critical';
    }

    getComplianceClass(score) {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    }

    getProcessingTimeStatus(seconds) {
        if (seconds < 3) return 'Excellent';
        if (seconds < 8) return 'Good';
        if (seconds < 15) return 'Average';
        return 'Slow';
    }

    getTimeStatusClass(seconds) {
        if (seconds < 8) return 'success';
        if (seconds < 15) return 'warning';
        return 'error';
    }

    // Data Processing Methods
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
            if (this.iocPatterns.ip.test(ioc)) {
                categorized.ips.push(ioc);
            } else if (this.iocPatterns.domain.test(ioc)) {
                categorized.domains.push(ioc);
            } else if (this.iocPatterns.email.test(ioc)) {
                categorized.emails.push(ioc);
            } else if (this.iocPatterns.hash.test(ioc)) {
                categorized.hashes.push(ioc);
            } else if (this.iocPatterns.url.test(ioc)) {
                categorized.urls.push(ioc);
            } else {
                categorized.other.push(ioc);
            }
        });

        return categorized;
    }

    extractThreatIntelligence(events) {
        return events.slice(0, 10).map(event => ({
            title: event.eventType || 'Security Event',
            description: event.description || 'No description available',
            severity: event.severity || 'Medium',
            type: this.classifyThreatType(event),
            timestamp: event.timestamp || new Date(),
            source: event.source || 'System'
        }));
    }

    classifyThreatType(event) {
        const description = (event.description || '').toLowerCase();

        if (description.includes('malware') || description.includes('virus')) return 'malware';
        if (description.includes('login') || description.includes('authentication')) return 'auth';
        if (description.includes('network') || description.includes('connection')) return 'network';
        if (description.includes('file') || description.includes('execution')) return 'execution';
        return 'general';
    }

    getThreatIcon(type) {
        const icons = {
            malware: '🦠',
            auth: '🔐',
            network: '🌐',
            execution: '⚡',
            general: '⚠️'
        };
        return icons[type] || '⚠️';
    }

    buildTimelineFromEvents(events) {
        return events
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map(event => ({
                timestamp: event.timestamp,
                event: event.eventType || 'Security Event',
                source: event.source || 'System',
                confidence: 'High'
            }));
    }

    getAnalysisSummary() {
        if (!this.currentAnalysisResults) return 'Analysis completed';

        const data = this.currentAnalysisResults.result || this.currentAnalysisResults;
        const events = data.technical?.securityEvents?.length || 0;
        const iocs = data.technical?.detectedIOCs?.length || 0;

        return `${events} events, ${iocs} IOCs detected`;
    }

    generateAIExecutiveSummary(data) {
        const ai = data.ai || {};
        const executive = data.executive || {};

        return `
            <div class="ai-executive-summary">
                <div class="ai-summary-section">
                    <h4>🤖 AI Analysis Summary</h4>
                    <p>${executive.summary || ai.businessImpact || 'AI-powered analysis completed with comprehensive threat assessment.'}</p>
                </div>
                
                <div class="ai-summary-section">
                    <h4>🎯 Key Findings</h4>
                    <p>${executive.keyFindings || 'Security events analyzed and threat patterns identified.'}</p>
                </div>
                
                <div class="ai-summary-section">
                    <h4>⚠️ Risk Assessment</h4>
                    <div class="risk-level ${(executive.riskLevel || 'medium').toLowerCase()}">${executive.riskLevel || 'MEDIUM'}</div>
                    <p>${ai.threatAssessment || 'Threat level assessed based on detected indicators.'}</p>
                </div>
                
                <div class="ai-summary-section">
                    <h4>🚀 Recommended Actions</h4>
                    <ul class="action-list">
                        ${(ai.recommendedActions || ['Review security events', 'Monitor for additional threats']).map(action =>
            `<li>${action}</li>`
        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    generateBasicExecutiveSummary(data) {
        const events = data.technical?.securityEvents?.length || 0;
        const iocs = data.technical?.detectedIOCs?.length || 0;
        const riskScore = this.calculateRiskScore(data);

        return `
            <div class="basic-executive-summary">
                <div class="summary-section">
                    <h4>📊 Analysis Summary</h4>
                    <p>Completed security analysis using rule-based detection. ${events} security events and ${iocs} indicators of compromise were identified.</p>
                </div>
                
                <div class="summary-section">
                    <h4>📈 Risk Assessment</h4>
                    <div class="risk-score">Risk Score: ${riskScore}/10</div>
                    <p>Risk level determined based on event count and severity patterns.</p>
                </div>
                
                <div class="summary-section">
                    <h4>💡 Recommendations</h4>
                    <ul>
                        <li>Review detected security events for false positives</li>
                        <li>Cross-reference IOCs with threat intelligence</li>
                        <li>Consider enabling AI analysis for enhanced insights</li>
                    </ul>
                </div>
            </div>
        `;
    }

    storeAnalysisData(data, processingTime) {
        const analysisData = {
            id: this.generateAnalysisId(),
            timestamp: new Date().toISOString(),
            fileInfo: this.currentFileInfo,
            processingTime: processingTime,
            data: data,
            widgets: this.captureWidgetStates()
        };

        this.analysisHistory.push(analysisData);

        // Store in localStorage for persistence
        try {
            localStorage.setItem('secunik_analysis_history', JSON.stringify(this.analysisHistory.slice(-10))); // Keep last 10
        } catch (e) {
            console.warn('Failed to store analysis history:', e);
        }
    }

    captureWidgetStates() {
        const states = {};
        this.widgets.forEach((widget, key) => {
            if (widget.element) {
                states[key] = {
                    visible: widget.element.style.display !== 'none',
                    content: widget.element.innerHTML
                };
            }
        });
        return states;
    }

    // Error Handling
    showAnalysisError(message) {
        this.hideUploadProgress();
        this.showEmptyState();

        if (this.emptyState) {
            this.emptyState.innerHTML = `
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-title">Analysis Failed</div>
                <div class="empty-state-description">
                    ${message}
                    <br><br>
                    Please check your file format and try again.
                </div>
                <div class="error-actions">
                    <button class="btn primary" onclick="location.reload()">Try Again</button>
                    <button class="btn secondary" onclick="window.secuNikApp.showModal('helpModal')">Get Help</button>
                </div>
            `;
        }

        // Hide upload another button on error
        if (this.uploadAnotherBtn) {
            this.uploadAnotherBtn.style.display = 'none';
        }
    }

    resetAnalysis() {
        if (confirm('Reset analysis and clear all data? This action cannot be undone.')) {
            this.currentAnalysisResults = null;
            this.currentFileInfo = null;
            this.isAnalyzing = false;

            this.showEmptyState();
            this.hideUploadProgress();

            // Hide upload another button
            if (this.uploadAnotherBtn) {
                this.uploadAnotherBtn.style.display = 'none';
            }

            this.showNotification('Analysis reset successfully', 'info');
        }
    }

    // Utility Methods
    generateAnalysisId() {
        return 'ANL_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    truncateText(text, maxLength) {
        if (!text) return 'No description available';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        if (!this.settings.notifications) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Add styles if not present
        this.addNotificationStyles();

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
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
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                transition: opacity 0.3s ease;
            }
            
            .notification.success {
                background: linear-gradient(45deg, #10b981, #059669);
                border: 1px solid #065f46;
            }
            
            .notification.error {
                background: linear-gradient(45deg, #ef4444, #dc2626);
                border: 1px solid #991b1b;
            }
            
            .notification.warning {
                background: linear-gradient(45deg, #f59e0b, #d97706);
                border: 1px solid #92400e;
            }
            
            .notification.info {
                background: linear-gradient(45deg, #3b82f6, #2563eb);
                border: 1px solid #1e40af;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .notification-close {
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
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            @keyframes slideInRight {
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
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.secuNikApp = new SecuNikWidgetApp();
    console.log('🚀 SecuNik Professional Widget Dashboard v2.0 fully loaded');
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.secuNikApp) {
        window.secuNikApp.showNotification('An unexpected error occurred', 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.secuNikApp) {
        window.secuNikApp.showNotification('A system error occurred', 'error');
    }
    event.preventDefault();
});

// Export for global access
window.SecuNikWidgetApp = SecuNikWidgetApp;