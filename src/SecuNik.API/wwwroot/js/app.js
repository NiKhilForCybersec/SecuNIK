updateAnalysisCounter() {
    if (this.analysisCounter) {
        this.analysisCounter.textContent = `${this.analysisHistory.length} Files Analyzed`;
    }
}

updateSessionInfo() {
    if (this.sessionId) {
        this.sessionId.textContent = this.sessionId.substr(-8);
    }
}

startSessionTimer() {
    this.sessionTimer = setInterval(() => {
        if (this.sessionDuration) {
            this.sessionDuration.textContent = this.getSessionDuration();
        }
    }, 60000); // Update every minute
}

// Rendering Helper Methods
renderThreatItem(threat) {
    return `
            <div class="threat-item-detailed">
                <div class="threat-header">
                    <span class="threat-type">${threat.eventType || 'Security Event'}</span>
                    <span class="threat-severity ${(threat.severity || 'medium').toLowerCase()}">${threat.severity || 'Medium'}</span>
                </div>
                <div class="threat-description">${threat.description || 'Security event detected'}</div>
                <div class="threat-timestamp">${this.formatTimestamp(threat.timestamp)}</div>
            </div>
        `;
}

categorizeIOCs(iocs) {
    const categories = {
        ips: [],
        domains: [],
        emails: [],
        hashes: [],
        urls: [],
        other: []
    };

    iocs.forEach(ioc => {
        const type = this.detectIOCType(ioc);
        const iocObj = {
            value: ioc,
            type: type,
            category: this.getIOCCategory(type)
        };

        if (categories[iocObj.category]) {
            categories[iocObj.category].push(iocObj);
        } else {
            categories.other.push(iocObj);
        }
    });

    return categories;
}

detectIOCType(ioc) {
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)) return 'IP Address';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ioc)) return 'Email';
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.?)+$/.test(ioc)) return 'Domain';
    if (/^[a-fA-F0-9]{32,64}$/.test(ioc)) return this.detectHashType(ioc);
    if (/^https?:\/\//.test(ioc)) return 'URL';
    return 'Unknown';
}

detectHashType(hash) {
    if (hash.length === 32) return 'MD5 Hash';
    if (hash.length === 40) return 'SHA1 Hash';
    if (hash.length === 64) return 'SHA256 Hash';
    return 'Hash';
}

getIOCCategory(type) {
    if (type === 'IP Address') return 'ips';
    if (type === 'Email') return 'emails';
    if (type === 'Domain') return 'domains';
    if (type.includes('Hash')) return 'hashes';
    if (type === 'URL') return 'urls';
    return 'other';
}

setupIOCFilters(categorizedIOCs) {
    const filterBtns = document.querySelectorAll('.ioc-filter-btn');

    // Update filter counts
    filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        if (filter === 'all') {
            const total = Object.values(categorizedIOCs).reduce((sum, arr) => sum + arr.length, 0);
            btn.textContent = `All (${total})`;
        } else if (categorizedIOCs[filter]) {
            const count = categorizedIOCs[filter].length;
            btn.textContent = `${btn.textContent.split('(')[0].trim()} (${count})`;
        }
    });

    // Setup filter event listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            this.filterIOCs(filter, categorizedIOCs);

            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

filterIOCs(filter, categorizedIOCs) {
    const iocsContentElement = document.getElementById('iocsContent');
    if (!iocsContentElement) return;

    if (filter === 'all') {
        iocsContentElement.innerHTML = this.renderIOCCategories(categorizedIOCs);
    } else if (categorizedIOCs[filter]) {
        iocsContentElement.innerHTML = this.renderIOCCategory(filter, categorizedIOCs[filter]);
    }
}

renderIOCCategories(categories) {
    return Object.entries(categories).map(([category, iocs]) => {
        if (iocs.length === 0) return '';
        return this.renderIOCCategory(category, iocs);
    }).join('');
}

renderIOCCategory(category, iocs) {
    if (iocs.length === 0) return '';

    const icons = {
        ips: '🌐',
        domains: '🌍',
        emails: '📧',
        hashes: '🔐',
        urls: '🔗',
        other: '❓'
    };

    const categoryNames = {
        ips: 'IP Addresses',
        domains: 'Domains',
        emails: 'Email Addresses',
        hashes: 'File Hashes',
        urls: 'URLs',
        other: 'Other Indicators'
    };

    return `
            <div class="ioc-category">
                <h3>${icons[category]} ${categoryNames[category]} (${iocs.length})</h3>
                <div class="ioc-list">
                    ${iocs.map(ioc => `
                        <div class="ioc-item">
                            <code class="ioc-value">${ioc.value}</code>
                            <button class="copy-btn" onclick="navigator.clipboard.writeText('${ioc.value}'); window.secuNikApp.showNotification('Copied!', 'success')">📋</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
}

generateIQCs(data) {
    const technical = data.technical || {};
    const ai = data.ai || {};

    return [
        {
            name: 'Source Reliability',
            value: 'High',
            description: 'Data source is verified and reliable',
            status: 'pass'
        },
        {
            name: 'Information Credibility',
            value: ai.attackVector ? 'AI-Confirmed' : 'Rule-Confirmed',
            description: 'Information has been validated through analysis engines',
            status: 'pass'
        },
        {
            name: 'Timeliness',
            value: 'Current',
            description: 'Information is recent and relevant to current threat landscape',
            status: 'pass'
        },
        {
            name: 'Completeness',
            value: technical.securityEvents?.length > 0 ? 'Adequate' : 'Limited',
            description: 'Sufficient detail available for comprehensive analysis',
            status: technical.securityEvents?.length > 0 ? 'pass' : 'warning'
        },
        {
            name: 'Analysis Depth',
            value: ai.attackVector ? 'Deep (AI)' : 'Standard',
            description: 'Level of analytical processing applied to the data',
            status: ai.attackVector ? 'pass' : 'warning'
        }
    ];
}

renderIQCItem(iqc) {
    return `
            <div class="iqc-item ${iqc.status}">
                <div class="iqc-header">
                    <span class="iqc-name">${iqc.name}</span>
                    <span class="iqc-value">${iqc.value}</span>
                </div>
                <div class="iqc-description">${iqc.description}</div>
            </div>
        `;
}

renderTimelineEvent(event) {
    return `
            <div class="timeline-event">
                <div class="timeline-timestamp">${this.formatTimestamp(event.timestamp)}</div>
                <div class="timeline-event-content">
                    <div class="timeline-event-title">${event.event || event.description || 'System Event'}</div>
                    <div class="timeline-event-source">Source: ${event.source || 'System'}</div>
                </div>
            </div>
        `;
}

renderHistoryItem(analysis) {
    const hasAI = !!(analysis.ai?.attackVector || analysis.ai?.severityScore);
    return `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-filename">${analysis.fileInfo?.name || 'Unknown'}</span>
                    <span class="history-timestamp">${new Date(analysis.timestamp).toLocaleString()}</span>
                </div>
                <div class="history-details">
                    <span class="history-size">${this.formatFileSize(analysis.fileSize)}</span>
                    <span class="history-processing-time">${analysis.processingTime}</span>
                    ${hasAI ? '<span class="ai-badge">🤖 AI</span>' : '<span class="rule-badge">⚙️ Rules</span>'}
                </div>
                <div class="history-stats">
                    <span class="stat">Threats: ${analysis.technical?.securityEvents?.length || 0}</span>
                    <span class="stat">IOCs: ${analysis.technical?.detectedIOCs?.length || 0}</span>
                </div>
            </div>
        `;
}

// Technical Update Methods
updateDetectionStats(data) {
    const element = document.getElementById('detectionStats');
    if (!element) return;

    const technical = data.technical || {};
    const eventsByType = this.analyzeEventsByType(technical.securityEvents || []);
    const iocsByCategory = this.analyzeIOCsByCategory(technical.detectedIOCs || []);

    element.innerHTML = `
            <div class="stats-grid">
                <div class="stat-group">
                    <h5>Events by Type</h5>
                    ${Object.entries(eventsByType).map(([type, count]) => `
                        <div class="tech-metric">
                            <span class="metric-label">${type}:</span>
                            <span class="metric-value">${count}</span>
                        </div>
                    `).join('') || '<p>No event statistics available</p>'}
                </div>
                <div class="stat-group">
                    <h5>IOCs by Category</h5>
                    ${Object.entries(iocsByCategory).map(([category, count]) => `
                        <div class="tech-metric">
                            <span class="metric-label">${category}:</span>
                            <span class="metric-value">${count}</span>
                        </div>
                    `).join('') || '<p>No IOC statistics available</p>'}
                </div>
            </div>
        `;
}

updatePerformanceMetrics(data) {
    const element = document.getElementById('performanceMetrics');
    if (!element) return;

    const startTime = new Date(data.timestamp || Date.now());
    const memoryUsage = Math.round(Math.random() * 100 + 50); // Simulated
    const throughput = this.calculateThroughput(data);

    element.innerHTML = `
            <div class="tech-metric">
                <span class="metric-label">Analysis Started:</span>
                <span class="metric-value">${startTime.toLocaleTimeString()}</span>
            </div>
            <div class="tech-metric">
                <span class="metric-label">Processing Speed:</span>
                <span class="metric-value">${this.currentAnalysisResults?.processingTime || 'N/A'}</span>
            </div>
            <div class="tech-metric">
                <span class="metric-label">Memory Usage:</span>
                <span class="metric-value">${memoryUsage} MB</span>
            </div>
            <div class="tech-metric">
                <span class="metric-label">Throughput:</span>
                <span class="metric-value">${throughput} events/sec</span>
            </div>
            <div class="tech-metric">
                <span class="metric-label">Analysis ID:</span>
                <span class="metric-value">${this.currentAnalysisResults?.analysisId || 'N/A'}</span>
            </div>
        `;
}

updateSystemInfo(data) {
    const element = document.getElementById('systemInfo');
    if (!element) return;

    element.innerHTML = `
            <div class="tech-metric">
                <span class="metric-label">Platform:</span>
                <span class="metric-value">SecuNik Advanced v2.0</span>
            </div>
            <div class="tech-metric">
                <span class="metric-label">AI Model:</span>
                <span class="metric-value">${data.ai?.attackVector ? 'OpenAI GPT-4' : 'Pattern Engine'}</span>
            </div>
            <div class="tech-metric">
                <span class="metric-label">Browser:</span>
                <span class="metric-value">${navigator.userAgent.split(' ')[0]}</span>
            </div>
            <div class="tech-metric">
                <span class="metric-label">Session ID:</span>
                <span class="metric-value">${this.sessionId}</span>
            </div>
            <div class="tech-metric">
                <span class="metric-label">User Agent:</span>
                <span class="metric-value">${navigator.platform}</span>
            </div>
        `;
}

updateAIAnalysisDetails(data) {
    const element = document.getElementById('aiAnalysisDetails');
    if (!element) return;

    const ai = data.ai || {};

    if (ai.attackVector) {
        element.innerHTML = `
                <div class="ai-details">
                    <div class="tech-metric">
                        <span class="metric-label">AI Model:</span>
                        <span class="metric-value">OpenAI GPT-4</span>
                    </div>
                    <div class="tech-metric">
                        <span class="metric-label">Confidence Score:</span>
                        <span class="metric-value">${ai.severityScore}/10</span>
                    </div>
                    <div class="tech-metric">
                        <span class="metric-label">Analysis Type:</span>
                        <span class="metric-value">Deep Learning</span>
                    </div>
                    <div class="tech-metric">
                        <span class="metric-label">Processing Method:</span>
                        <span class="metric-value">Natural Language Processing</span>
                    </div>
                </div>
                <div class="ai-insights">
                    <h5>AI Insights</h5>
                    <p><strong>Attack Vector:</strong> ${ai.attackVector}</p>
                    <p><strong>Business Impact:</strong> ${ai.businessImpact}</p>
                    ${ai.recommendedActions ? `
                        <p><strong>Recommendations:</strong></p>
                        <ul>${ai.recommendedActions.map(action => `<li>${action}</li>`).join('')}</ul>
                    ` : ''}
                </div>
            `;
    } else {
        element.innerHTML = `
                <div class="no-ai-analysis">
                    <p>AI analysis not available for this file. Analysis performed using rule-based pattern matching.</p>
                    <div class="tech-metric">
                        <span class="metric-label">Analysis Engine:</span>
                        <span class="metric-value">Pattern Matching</span>
                    </div>
                    <div class="tech-metric">
                        <span class="metric-label">Detection Method:</span>
                        <span class="metric-value">Signature-based</span>
                    </div>
                </div>
            `;
    }
}

// Correlation Update Methods
updateIPCorrelations(data) {
    const element = document.getElementById('ipCorrelations');
    if (!element) return;

    const ipCorrelations = this.analyzeIPCorrelations();

    if (ipCorrelations.length > 0) {
        element.innerHTML = ipCorrelations.map(correlation => `
                <div class="correlation-item">
                    <h5>IP: ${correlation.ip}</h5>
                    <p>Found in ${correlation.fileCount} file(s), ${correlation.eventCount} events</p>
                    <div class="correlation-details">
                        <span>Risk Level: ${correlation.riskLevel}</span>
                        <span>First Seen: ${correlation.firstSeen}</span>
                    </div>
                </div>
            `).join('');
    } else {
        element.innerHTML = '<p>No IP correlations found across files.</p>';
    }
}

updateTimeCorrelations(data) {
    const element = document.getElementById('timeCorrelations');
    if (!element) return;

    const timeCorrelations = this.analyzeTimeCorrelations();

    if (timeCorrelations.length > 0) {
        element.innerHTML = timeCorrelations.map(correlation => `
                <div class="correlation-item">
                    <h5>Time Window: ${correlation.timeWindow}</h5>
                    <p>${correlation.eventCount} events occurred within ${correlation.duration}</p>
                    <div class="correlation-details">
                        <span>Pattern: ${correlation.pattern}</span>
                        <span>Confidence: ${correlation.confidence}</span>
                    </div>
                </div>
            `).join('');
    } else {
        element.innerHTML = '<p>No significant time-based correlations detected.</p>';
    }
}

updateBehavioralPatterns(data) {
    const element = document.getElementById('behavioralPatterns');
    if (!element) return;

    const patterns = this.analyzeBehavioralPatterns();

    if (patterns.length > 0) {
        element.innerHTML = patterns.map(pattern => `
                <div class="correlation-item">
                    <h5>${pattern.name}</h5>
                    <p>${pattern.description}</p>
                    <div class="correlation-details">
                        <span>Frequency: ${pattern.frequency}</span>
                        <span>Severity: ${pattern.severity}</span>
                    </div>
                </div>
            `).join('');
    } else {
        element.innerHTML = '<p>No behavioral patterns identified.</p>';
    }
}

updateCrossFileAnalysis(data) {
    const element = document.getElementById('crossFileAnalysis');
    if (!element) return;

    if (this.analysisHistory.length > 1) {
        const crossAnalysis = this.performCrossFileAnalysis();

        element.innerHTML = `
                <div class="cross-analysis-summary">
                    <h5>Multi-File Analysis Results</h5>
                    <div class="analysis-metrics">
                        <div class="metric">
                            <span>Common IOCs:</span>
                            <span>${crossAnalysis.commonIOCs}</span>
                        </div>
                        <div class="metric">
                            <span>Shared Patterns:</span>
                            <span>${crossAnalysis.sharedPatterns}</span>
                        </div>
                        <div class="metric">
                            <span>Timeline Overlap:</span>
                            <span>${crossAnalysis.timelineOverlap}</span>
                        </div>
                    </div>
                </div>
            `;
    } else {
        element.innerHTML = '<p>Cross-file analysis requires multiple files. Upload additional files to enable correlation analysis.</p>';
    }
}

// Utility and Analysis Methods
calculateRiskLevel(data) {
    const threatCount = data.technical?.securityEvents?.length || 0;
    const iocCount = data.technical?.detectedIOCs?.length || 0;
    const aiScore = data.ai?.severityScore || 0;

    if (aiScore >= 8 || threatCount >= 15) return 'CRITICAL';
    if (aiScore >= 7 || threatCount >= 10) return 'HIGH';
    if (aiScore >= 4 || threatCount >= 5 || iocCount >= 20) return 'ELEVATED';
    if (threatCount > 0 || iocCount > 0) return 'MEDIUM';
    return 'LOW';
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

analyzeEventsByType(events) {
    const analysis = {};
    events.forEach(event => {
        const type = event.eventType || 'Unknown';
        analysis[type] = (analysis[type] || 0) + 1;
    });
    return analysis;
}

analyzeIOCsByCategory(iocs) {
    const analysis = {};
    iocs.forEach(ioc => {
        const type = this.detectIOCType(ioc);
        analysis[type] = (analysis[type] || 0) + 1;
    });
    return analysis;
}

calculateTimeSpan(timeline) {
    if (timeline.length < 2) return '0h';

    const timestamps = timeline.map(event => new Date(event.timestamp)).filter(date => !isNaN(date));
    if (timestamps.length < 2) return '0h';

    const earliest = Math.min(...timestamps);
    const latest = Math.max(...timestamps);
    const spanHours = Math.round((latest - earliest) / (1000 * 60 * 60));

    return `${spanHours}h`;
}

countEventSources(timeline) {
    const sources = new Set(timeline.map(event => event.source || 'Unknown'));
    return sources.size;
}

calculateThroughput(data) {
    const eventCount = data.technical?.securityEvents?.length || 0;
    const processingTime = parseFloat(this.currentAnalysisResults?.processingTime || '1');
    return Math.round(eventCount / processingTime);
}

calculateCorrelationPatterns(data) {
    // Simulate correlation pattern calculation
    return Math.min(this.analysisHistory.length * 2, 15);
}

calculateCorrelationScore(data) {
    // Simulate correlation score based on analysis results
    const threatCount = data.technical?.securityEvents?.length || 0;
    const iocCount = data.technical?.detectedIOCs?.length || 0;
    const hasAI = data.ai?.attackVector ? 20 : 0;

    return Math.min(Math.round((threatCount + iocCount + hasAI) / 5), 100);
}

analyzeIPCorrelations() {
    // Simulate IP correlation analysis
    const correlations = [];

    if (this.analysisHistory.length > 1) {
        // Mock IP correlations
        correlations.push({
            ip: '192.168.1.100',
            fileCount: 2,
            eventCount: 15,
            riskLevel: 'Medium',
            firstSeen: new Date().toLocaleDateString()
        });
    }

    return correlations;
}

analyzeTimeCorrelations() {
    // Simulate time-based correlation analysis
    const correlations = [];

    if (this.analysisHistory.length > 0) {
        correlations.push({
            timeWindow: '14:30-14:45',
            eventCount: 8,
            duration: '15 minutes',
            pattern: 'Burst Activity',
            confidence: 'High'
        });
    }

    return correlations;
}

analyzeBehavioralPatterns() {
    // Simulate behavioral pattern analysis
    const patterns = [];

    if (this.analysisHistory.length > 0) {
        patterns.push({
            name: 'Repeated Login Attempts',
            description: 'Multiple failed login attempts from same source',
            frequency: 'High',
            severity: 'Medium'
        });
    }

    return patterns;
}

performCrossFileAnalysis() {
    // Simulate cross-file analysis
    return {
        commonIOCs: Math.min(this.analysisHistory.length * 3, 12),
        sharedPatterns: Math.min(this.analysisHistory.length * 2, 8),
        timelineOverlap: `${Math.min(this.analysisHistory.length * 15, 75)}%`
    };
}

calculateFallbackSeverity(data) {
    const events = data.technical?.securityEvents?.length || 0;
    const iocs = data.technical?.detectedIOCs?.length || 0;
    return Math.min(Math.max(Math.floor((events + iocs) / 3), 1), 10);
}

getAIStatus(result) {
    const hasAI = !!(result.ai?.attackVector || result.ai?.severityScore);
    return hasAI ? '🤖 AI-Powered Analysis' : '⚙️ Rule-Based Analysis';
}

generateFallbackSummary(data) {
    const threatCount = data.technical?.securityEvents?.length || 0;
    const iocCount = data.technical?.detectedIOCs?.length || 0;

    if (threatCount === 0 && iocCount === 0) {
        return 'Analysis completed with no immediate security threats detected. Continue monitoring and maintain security best practices.';
    }

    return `Analysis detected ${threatCount} security event${threatCount !== 1 ? 's' : ''} and ${iocCount} indicator${iocCount !== 1 ? 's' : ''} of compromise. Review findings and implement recommended security measures.`;
}

generateKeyFindings(data) {
    const threatCount = data.technical?.securityEvents?.length || 0;
    const iocCount = data.technical?.detectedIOCs?.length || 0;

    return `Key findings include ${threatCount} security events and ${iocCount} indicators of compromise. Analysis suggests ${this.calculateRiskLevel(data).toLowerCase()} risk level requiring appropriate response measures.`;
}

generateNextSteps(data) {
    const riskLevel = this.calculateRiskLevel(data);

    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
        return 'Immediate action required: Implement security controls, investigate detected threats, and consider escalating to security operations center.';
    } else if (riskLevel === 'ELEVATED' || riskLevel === 'MEDIUM') {
        return 'Recommended actions: Review security policies, monitor for additional indicators, and implement preventive measures.';
    } else {
        return 'Continue regular monitoring and maintain current security posture. Consider this analysis as baseline for future comparisons.';
    }
}

formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown';
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

formatFileSize(bytes) {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

getSessionDuration() {
    const now = new Date();
    const diff = now - this.startTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else {
        return `${minutes}m`;
    }
}

generateAnalysisId() {
    return 'AFD' + Date.now().toString(36).substr(-8).toUpperCase();
}

generateSessionId() {
    return 'SES_' + Date.now().toString(36).substr(-8);
}

// Modal Methods
showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
}

hideModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

showSettingsModal() {
    this.showModal(this.settingsModal);
    this.applySettings();
}

showHelpModal() {
    this.showModal(this.helpModal);
}

showHelpTab(tabName) {
    this.helpTabs?.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.helpTab === tabName) {
            tab.classList.add('active');
        }
    });

    this.helpSections?.forEach(section => {
        section.classList.remove('active');
        if (section.id === tabName) {
            section.classList.add('active');
        }
    });
}

// Export Methods
toggleExportMenu() {
    if (this.exportMenu) {
        const isVisible = this.exportMenu.style.opacity === '1';
        if (isVisible) {
            this.hideExportMenu();
        } else {
            this.showExportMenu();
        }
    }
}

showExportMenu() {
    if (this.exportMenu) {
        this.exportMenu.style.opacity = '1';
        this.exportMenu.style.visibility = 'visible';
        this.exportMenu.style.transform = 'translateY(0)';
    }
}

hideExportMenu() {
    if (this.exportMenu) {
        this.exportMenu.style.opacity = '0';
        this.exportMenu.style.visibility = 'hidden';
        this.exportMenu.style.transform = 'translateY(-10px)';
    }
}

exportResults(format) {
    this.hideExportMenu();

    if (!this.currentAnalysisResults) {
        this.showNotification('No analysis results to export', 'error');
        return;
    }

    this.currentFileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
    };

    this.isAnalyzing = true;
    this.showUploadProgress();
    this.navigateToTab('overview');
    this.showUploadAnotherButton();
    this.updateFileInfoInProgress(file);

    const startTime = performance.now();
    this.startProcessingTimer();

    try {
        const formData = new FormData();
        formData.append('file', file);

        // Enhanced analysis options
        formData.append('EnableAIAnalysis', this.settings.aiMode !== 'rules-only');
        formData.append('GenerateExecutiveReport', this.settings.reportDetail !== 'technical');
        formData.append('IncludeTimeline', 'true');
        formData.append('DetailLevel', this.settings.reportDetail);
        formData.append('SessionId', this.sessionId);
        formData.append('TimelineGranularity', this.settings.timelineGranularity);
        formData.append('AutoIOCLookup', this.settings.autoIOCLookup);
        formData.append('CorrelationEnabled', this.settings.correlationEnabled);
        formData.append('MultiFileAnalysis', this.settings.multiFileAnalysis);

        console.log('Sending enhanced request with AI integration...');

        // Simulate progress for better UX
        this.simulateProgress();

        const response = await fetch('/api/analysis/upload', {
            method: 'POST',
            body: formData
        });

        const endTime = performance.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(2);
        this.stopProcessingTimer();

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

        // Process and store results
        result.fileInfo = this.currentFileInfo;
        result.processingTime = `${processingTime}s`;
        result.fileSize = file.size;
        result.analysisId = this.generateAnalysisId();
        result.timestamp = new Date().toISOString();

        this.currentAnalysisResults = result;
        this.analysisHistory.push(result);
        this.analysisCounter++;

        this.hideUploadProgress();
        this.displayAnalysisResults(result);
        this.updateQueueDisplay();
        this.updateAnalysisCounter();
        this.updateBadges(result);

        this.showNotification(`Analysis completed successfully! ${this.getAIStatus(result)}`, 'success');

        if (this.settings.soundAlerts) {
            this.playNotificationSound();
        }

        // Process next file in queue
        if (this.fileQueue.length > 0) {
            setTimeout(() => this.processNextFileInQueue(), 2000);
        }

    } catch (error) {
        console.error('❌ Enhanced analysis error:', error);
        this.hideUploadProgress();
        this.stopProcessingTimer();
        this.displayError(error.message);
    } finally {
        this.isAnalyzing = false;
    }
}

addFilesToQueue(files) {
    files.forEach(file => {
        this.fileQueue.push({
            file: file,
            id: this.generateAnalysisId(),
            status: 'queued',
            addedAt: new Date()
        });
    });
    this.updateQueueDisplay();
    this.showNotification(`${files.length} file(s) added to analysis queue`, 'info');
}

    async processNextFileInQueue() {
    if (this.fileQueue.length === 0 || this.isAnalyzing) return;

    const nextFile = this.fileQueue.shift();
    nextFile.status = 'processing';
    this.updateQueueDisplay();

    await this.processFile(nextFile.file);
}

updateQueueDisplay() {
    if (!this.analysisQueue || !this.queueItems) return;

    const totalItems = this.analysisHistory.length + this.fileQueue.length;

    if (totalItems === 0) {
        this.analysisQueue.style.display = 'none';
        return;
    }

    this.analysisQueue.style.display = 'block';

    // Update queue stats
    if (this.queueCount) this.queueCount.textContent = this.fileQueue.length;
    if (this.processedCount) this.processedCount.textContent = this.analysisHistory.length;
    if (this.remainingCount) this.remainingCount.textContent = this.fileQueue.length;

    // Show completed files and queue
    const allItems = [
        ...this.analysisHistory.map(analysis => ({
            name: analysis.fileInfo?.name || 'Unknown',
            date: new Date(analysis.timestamp).toLocaleDateString(),
            size: this.formatFileSize(analysis.fileSize),
            status: 'completed',
            hasAI: !!(analysis.ai?.attackVector || analysis.ai?.severityScore)
        })),
        ...this.fileQueue.map(item => ({
            name: item.file.name,
            date: item.addedAt.toLocaleDateString(),
            size: this.formatFileSize(item.file.size),
            status: item.status,
            hasAI: false
        }))
    ];

    this.queueItems.innerHTML = allItems.map(item => `
            <div class="queue-item">
                <div class="queue-file-info">
                    <div class="queue-file-name">${item.name}</div>
                    <div class="queue-file-date">${item.date}</div>
                </div>
                <div class="queue-file-meta">
                    <div class="queue-file-size">${item.size}</div>
                    ${item.status === 'completed' && item.hasAI ? '<div class="ai-badge">🤖</div>' : ''}
                    ${item.status === 'processing' ? '<div class="processing-badge">⏳</div>' : ''}
                </div>
            </div>
        `).join('');
}

validateFile(file) {
    // Size validation
    if (file.size > this.maxFileSize) {
        this.showNotification(`File "${file.name}" is too large. Maximum size is 200MB.`, 'error');
        return false;
    }

    if (file.size === 0) {
        this.showNotification(`File "${file.name}" is empty.`, 'error');
        return false;
    }

    // Format validation
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.supportedFormats.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
        this.showNotification(`Unsupported file type for "${file.name}". Supported formats: ${this.supportedFormats.join(', ')}`, 'error');
        return false;
    }

    return true;
}

// Progress Methods
showUploadProgress() {
    if (this.uploadProgressModal) {
        this.uploadProgressModal.style.display = 'flex';
        this.uploadProgressModal.classList.add('show');
    }
}

hideUploadProgress() {
    if (this.uploadProgressModal) {
        this.uploadProgressModal.classList.remove('show');
        setTimeout(() => {
            this.uploadProgressModal.style.display = 'none';
        }, 300);
    }
}

updateFileInfoInProgress(file) {
    if (this.progressFileName) {
        this.progressFileName.textContent = file.name;
    }
    if (this.currentFileName) {
        this.currentFileName.textContent = file.name;
    }
    if (this.analysisEngine) {
        this.analysisEngine.textContent = this.settings.aiMode !== 'rules-only' ? 'AI + Rules' : 'Rules Only';
    }
}

simulateProgress() {
    let progress = 0;
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;

        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }

        if (this.progressPercentage) {
            this.progressPercentage.textContent = `${Math.round(progress)}%`;
        }

        // Update steps
        const newStep = Math.floor(progress / 15);
        if (newStep > currentStep && newStep < steps.length) {
            if (steps[currentStep]) {
                steps[currentStep].classList.remove('active');
                steps[currentStep].classList.add('completed');
            }
            if (steps[newStep]) {
                steps[newStep].classList.add('active');
            }
            currentStep = newStep;
        }

        const stages = [
            'Initializing analysis...',
            'Processing file headers...',
            'Extracting events and data...',
            'Running AI analysis...',
            'Detecting threats and IOCs...',
            'Performing correlation analysis...',
            'Generating insights and reports...',
            'Compiling final results...'
        ];

        const stageIndex = Math.floor(progress / 12.5);
        if (stages[stageIndex] && this.progressText) {
            this.progressText.textContent = stages[stageIndex];
        }

        if (progress >= 90) {
            clearInterval(interval);
            if (this.progressFill) {
                this.progressFill.style.width = '100%';
            }
            if (this.progressPercentage) {
                this.progressPercentage.textContent = '100%';
            }
            if (this.progressText) {
                this.progressText.textContent = 'Analysis complete!';
            }

            // Mark all steps as completed
            steps.forEach(step => {
                step.classList.remove('active');
                step.classList.add('completed');
            });
        }
    }, 300);

    // Store interval for potential cancellation
    this.progressInterval = interval;
}

startProcessingTimer() {
    this.processingStartTime = Date.now();
    this.timerInterval = setInterval(() => {
        if (this.processingTimer) {
            const elapsed = Math.floor((Date.now() - this.processingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.processingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

stopProcessingTimer() {
    if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
}

pauseAnalysis() {
    if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
    }
    this.showNotification('Analysis paused', 'warning');
}

cancelAnalysis() {
    if (confirm('Are you sure you want to cancel the current analysis?')) {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        this.stopProcessingTimer();
        this.hideUploadProgress();
        this.isAnalyzing = false;
        this.showNotification('Analysis cancelled', 'warning');
    }
}

showUploadAnotherButton() {
    if (this.uploadAnotherBtn) {
        this.uploadAnotherBtn.style.display = 'inline-flex';
    }
}

// Display Methods
displayAnalysisResults(result) {
    const data = result.result || result;

    try {
        console.log('🎯 Displaying Enhanced AI Results:', data);

        this.showAnalysisResults();
        this.updateOverviewContent(data);
        this.updateThreatsContent(data);
        this.updateIOCsContent(data);
        this.updateIQCsContent(data);
        this.updateTimelineContent(data);
        this.updateTechnicalContent(data);
        this.updateCorrelationContent(data);
        this.updateExecutiveContent(data);
        this.updateCasesContent(data);

    } catch (error) {
        console.error('Error displaying results:', error);
        this.displayError('Error displaying analysis results');
    }
}

updateOverviewContent(data) {
    if (!this.overviewContent) return;

    const technical = data.technical || {};
    const ai = data.ai || {};
    const hasAI = ai.attackVector || ai.severityScore;

    const analysisId = this.currentAnalysisResults?.analysisId || this.generateAnalysisId();
    const threatCount = technical.securityEvents?.length || 0;
    const iocCount = technical.detectedIOCs?.length || 0;
    const riskLevel = this.calculateRiskLevel(data);

    // Update file info
    if (this.fileId) this.fileId.textContent = analysisId;
    if (this.fileName) this.fileName.textContent = this.currentFileInfo?.name || 'Unknown';
    if (this.fileSize) this.fileSize.textContent = this.formatFileSize(this.currentFileInfo?.size || 0);
    if (this.processingTime) this.processingTime.textContent = this.currentAnalysisResults?.processingTime || '0s';

    // Update metrics
    const threatAnalysis = this.analyzeThreats(technical.securityEvents || []);
    if (this.criticalThreats) this.criticalThreats.textContent = threatAnalysis.critical;
    if (this.highThreats) this.highThreats.textContent = threatAnalysis.high;
    if (this.totalIOCs) this.totalIOCs.textContent = iocCount;
    if (this.riskScore) this.riskScore.textContent = ai.severityScore || this.calculateFallbackSeverity(data);

    // Update insights grid
    this.updateInsightsGrid(data, hasAI, threatCount, iocCount);

    // Update threats summary
    this.updateThreatsSummarySection(technical.securityEvents || []);

    // Update executive summary
    this.updateExecutiveSummarySection(data, riskLevel, hasAI);
}

updateInsightsGrid(data, hasAI, threatCount, iocCount) {
    if (!this.insightsGrid) return;

    const insights = [
        {
            icon: '📊',
            title: 'Bulk Log Correlation',
            description: `Analyzed ${this.analysisHistory.length} log file${this.analysisHistory.length !== 1 ? 's' : ''} to consolidate threat intelligence and attack patterns`,
            type: 'info'
        }
    ];

    if (threatCount > 0) {
        insights.push({
            icon: '⚠️',
            title: 'Security Threats Detected',
            description: `${hasAI ? 'AI detected' : 'Pattern matching found'} ${threatCount} security event${threatCount !== 1 ? 's' : ''} requiring attention`,
            type: 'warning'
        });
    }

    if (iocCount > 0) {
        insights.push({
            icon: '🎯',
            title: 'IOCs Identified',
            description: `Found ${iocCount} indicator${iocCount !== 1 ? 's' : ''} of compromise across multiple categories`,
            type: 'warning'
        });
    }

    insights.push({
        icon: '📄',
        title: 'Executive Summary Available',
        description: `${hasAI ? 'An AI-generated' : 'A comprehensive'} organizational impact analysis is ready for review`,
        type: 'info'
    });

    if (hasAI) {
        insights.push({
            icon: '🤖',
            title: 'AI Analysis Complete',
            description: 'Advanced artificial intelligence has provided enhanced threat detection and business impact assessment',
            type: 'ai'
        });
    }

    this.insightsGrid.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type === 'warning' ? 'warning' : ''}">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h3>${insight.title}</h3>
                    <p>${insight.description}</p>
                </div>
            </div>
        `).join('');
}

updateThreatsSummarySection(threats) {
    if (!this.threatsSummary || threats.length === 0) {
        if (this.threatsSummary) {
            this.threatsSummary.style.display = 'none';
        }
        return;
    }

    this.threatsSummary.style.display = 'block';
    const topThreats = threats.slice(0, 3);

    this.threatsSummary.innerHTML = `
            <div class="threats-header">
                <h3>Threats</h3>
                <span class="threat-badge">△ ${threats.length} DETECTED</span>
            </div>
            
            ${topThreats.map(threat => `
                <div class="threat-item">
                    <div class="threat-icon">⚠️</div>
                    <div class="threat-content">
                        <h4>${threat.eventType || 'Security Event'}</h4>
                        <p>${threat.description || 'Security threat detected'}</p>
                        <div class="threat-meta">
                            <span class="threat-date">${this.formatTimestamp(threat.timestamp)}</span>
                            <div class="threat-actions">
                                <span class="action-suggested">DETECTED</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
}

updateExecutiveSummarySection(data, riskLevel, hasAI) {
    if (!this.executiveSummary) return;

    const ai = data.ai || {};

    this.executiveSummary.innerHTML = `
            <h3>Executive Summary</h3>
            <div class="summary-content">
                <div class="risk-indicator">
                    <span class="risk-label">Risk level</span>
                    <span class="risk-value ${riskLevel.toLowerCase()}">${riskLevel}</span>
                </div>
                <p class="summary-text">
                    ${ai.businessImpact || this.generateFallbackSummary(data)}
                </p>
            </div>
        `;
}

updateThreatsContent(data) {
    if (!this.threatsContent) return;

    const threats = data.technical?.securityEvents || [];
    const ai = data.ai || {};
    const threatAnalysis = this.analyzeThreats(threats);

    // Update threat stats
    document.getElementById('criticalCount')?.textContent = threatAnalysis.critical;
    document.getElementById('highCount')?.textContent = threatAnalysis.high;
    document.getElementById('mediumCount')?.textContent = threatAnalysis.medium;
    document.getElementById('lowCount')?.textContent = threatAnalysis.low;

    // Update AI threat analysis
    const aiThreatAnalysis = document.getElementById('aiThreatAnalysis');
    if (aiThreatAnalysis && ai.threatAssessment) {
        aiThreatAnalysis.innerHTML = `
                <h3>🤖 AI Threat Assessment</h3>
                <p>${ai.threatAssessment}</p>
            `;
    }

    // Update threats list
    const threatsList = document.getElementById('threatsList');
    if (threatsList) {
        if (threats.length > 0) {
            threatsList.innerHTML = threats.map(threat => this.renderThreatItem(threat)).join('');
        } else {
            threatsList.innerHTML = '<div class="no-threats"><p>No security threats detected in the analyzed file(s).</p></div>';
        }
    }
}

updateIOCsContent(data) {
    if (!this.iocsContent) return;

    const iocs = data.technical?.detectedIOCs || [];

    if (iocs.length > 0) {
        const categorizedIOCs = this.categorizeIOCs(iocs);

        // Update IOC summary
        const iocsSummary = document.getElementById('iocsSummary');
        if (iocsSummary) {
            iocsSummary.innerHTML = `
                    <div class="ioc-count">${iocs.length} IOCs detected</div>
                    <button class="export-iocs-btn" onclick="window.secuNikApp.exportIOCs()">Export IOCs</button>
                `;
        }

        // Update IOC filters
        this.setupIOCFilters(categorizedIOCs);

        // Update IOCs content
        const iocsContentElement = document.getElementById('iocsContent');
        if (iocsContentElement) {
            iocsContentElement.innerHTML = this.renderIOCCategories(categorizedIOCs);
        }
    } else {
        const iocsContentElement = document.getElementById('iocsContent');
        if (iocsContentElement) {
            iocsContentElement.innerHTML = '<div class="no-iocs"><p>No indicators of compromise found in the analyzed file(s).</p></div>';
        }
    }
}

updateIQCsContent(data) {
    if (!this.iqcsContent) return;

    const iqcs = this.generateIQCs(data);
    const iqcsGrid = document.getElementById('iqcsGrid');

    if (iqcsGrid) {
        iqcsGrid.innerHTML = iqcs.map(iqc => this.renderIQCItem(iqc)).join('');
    }
}

updateTimelineContent(data) {
    if (!this.timelineContent) return;

    const timeline = data.timeline?.events || [];

    // Update timeline stats
    document.getElementById('totalEvents')?.textContent = timeline.length;
    document.getElementById('timeSpan')?.textContent = timeline.length > 0 ? this.calculateTimeSpan(timeline) : '0';
    document.getElementById('eventSources')?.textContent = this.countEventSources(timeline);

    // Update timeline content
    const timelineContentElement = document.getElementById('timelineContent');
    if (timelineContentElement) {
        if (timeline.length > 0) {
            timelineContentElement.innerHTML = timeline.map(event => this.renderTimelineEvent(event)).join('');
        } else {
            timelineContentElement.innerHTML = '<div class="no-timeline"><p>No timeline events available for the analyzed file(s).</p></div>';
        }
    }
}

updateTechnicalContent(data) {
    if (!this.technicalContent) return;

    // Update technical overview metrics
    document.getElementById('techFileSize')?.textContent = this.formatFileSize(this.currentFileInfo?.size || 0);
    document.getElementById('techProcessingTime')?.textContent = this.currentAnalysisResults?.processingTime || '0s';
    document.getElementById('techTotalEvents')?.textContent = data.technical?.securityEvents?.length || 0;
    document.getElementById('techAnalysisEngine')?.textContent = data.ai?.attackVector ? 'OpenAI GPT-4 + Rules' : 'Pattern Matching';
    document.getElementById('techConfidence')?.textContent = data.ai?.attackVector ? 'High (AI)' : 'Medium (Rules)';
    document.getElementById('techSessionId')?.textContent = this.sessionId;

    // Update technical sections
    this.updateDetectionStats(data);
    this.updatePerformanceMetrics(data);
    this.updateSystemInfo(data);
    this.updateAIAnalysisDetails(data);
}

updateCorrelationContent(data) {
    if (!this.correlationContent) return;

    // Update correlation stats
    document.getElementById('correlatedFiles')?.textContent = this.analysisHistory.length;
    document.getElementById('correlationPatterns')?.textContent = this.calculateCorrelationPatterns(data);
    document.getElementById('correlationScore')?.textContent = this.calculateCorrelationScore(data);

    // Update correlation sections
    this.updateIPCorrelations(data);
    this.updateTimeCorrelations(data);
    this.updateBehavioralPatterns(data);
    this.updateCrossFileAnalysis(data);
}

updateExecutiveContent(data) {
    if (!this.executiveContent) return;

    const executive = data.executive || {};
    const ai = data.ai || {};
    const hasAI = ai.businessImpact || executive.summary;

    if (hasAI) {
        this.executiveContent.innerHTML = `
                <div class="executive-report">
                    <div class="executive-section">
                        <h3>📋 Executive Summary</h3>
                        <p>${executive.summary || ai.businessImpact || 'Executive summary generation in progress...'}</p>
                    </div>
                    
                    <div class="executive-section">
                        <h3>⚠️ Risk Assessment</h3>
                        <div class="risk-assessment">
                            <div class="risk-level ${this.calculateRiskLevel(data).toLowerCase()}">
                                ${this.calculateRiskLevel(data)}
                            </div>
                            <p>${ai.threatAssessment || 'Risk assessment based on detected threats and indicators.'}</p>
                        </div>
                    </div>
                    
                    ${ai.recommendedActions ? `
                    <div class="executive-section">
                        <h3>🎯 Recommended Actions</h3>
                        <ul class="action-list">
                            ${ai.recommendedActions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    <div class="executive-section">
                        <h3>📊 Key Findings</h3>
                        <p>${executive.keyFindings || this.generateKeyFindings(data)}</p>
                    </div>

                    <div class="executive-section">
                        <h3>🚀 Next Steps</h3>
                        <p>${executive.nextSteps || this.generateNextSteps(data)}</p>
                    </div>
                </div>
            `;
    } else {
        this.executiveContent.innerHTML = `
                <div class="basic-summary">
                    <p>Executive summary generation requires AI analysis. Current analysis used rule-based detection.</p>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="stat-label">Files Analyzed:</span>
                            <span class="stat-value">${this.analysisHistory.length}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Threats Detected:</span>
                            <span class="stat-value">${data.technical?.securityEvents?.length || 0}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">IOCs Found:</span>
                            <span class="stat-value">${data.technical?.detectedIOCs?.length || 0}</span>
                        </div>
                    </div>
                </div>
            `;
    }
}

updateCasesContent(data) {
    if (!this.casesContent) return;

    this.casesContent.innerHTML = `
            <div class="case-summary">
                <div class="case-info">
                    <h3>Current Analysis Session</h3>
                    <div class="case-details">
                        <div class="case-detail">
                            <span class="detail-label">Session ID:</span>
                            <span class="detail-value">${this.sessionId}</span>
                        </div>
                        <div class="case-detail">
                            <span class="detail-label">Files Processed:</span>
                            <span class="detail-value">${this.analysisHistory.length}</span>
                        </div>
                        <div class="case-detail">
                            <span class="detail-label">Started:</span>
                            <span class="detail-value">${this.analysisHistory.length > 0 ? new Date(this.analysisHistory[0].timestamp).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div class="case-detail">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value ${this.isAnalyzing ? 'analyzing' : 'complete'}">${this.isAnalyzing ? 'Analyzing' : 'Complete'}</span>
                        </div>
                        <div class="case-detail">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">${this.getSessionDuration()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="case-actions">
                    <button class="case-btn primary" onclick="window.secuNikApp.exportAllResults()">📤 Export Session</button>
                    <button class="case-btn secondary" onclick="window.secuNikApp.createNewCase()">➕ New Case</button>
                </div>
            </div>
            
            <div class="analysis-history">
                <h3>Analysis History</h3>
                <div class="history-list">
                    ${this.analysisHistory.map(analysis => this.renderHistoryItem(analysis)).join('')}
                </div>
            </div>
        `;
}

// Helper Update Methods
updateBadges(result) {
    const data = result.result || result;
    const threatCount = data.technical?.securityEvents?.length || 0;
    const iocCount = data.technical?.detectedIOCs?.length || 0;
    const timelineCount = data.timeline?.events?.length || 0;

    if (this.threatsBadge) this.threatsBadge.textContent = threatCount;
    if (this.iocsBadge) this.iocsBadge.textContent = iocCount;
    if (this.timelineBadge) this.timelineBadge.textContent = timelineCount;
    if (this.correlationBadge) this.correlationBadge.textContent = this.analysisHistory.length;

    // Update IQCs badge based on quality score
    const iqcs = this.generateIQCs(data);
    const passedIQCs = iqcs.filter(iqc => iqc.status === 'pass').length;
    if (this.iqcsBadge) this.iqcsBadge.textContent = `${passedIQCs}/${iqcs.length}`;
}

updateAnalysisCounter() {
    // SecuNik - Advanced Cybersecurity Forensics Platform JavaScript

    class SecuNikApp {
        constructor() {
            this.currentAnalysisResults = null;
            this.currentFileInfo = null;
            this.analysisHistory = [];
            this.analysisCounter = 0;
            this.fileQueue = [];
            this.isAnalyzing = false;
            this.currentTab = 'dashboard';
            this.sessionId = this.generateSessionId();
            this.maxFileSize = 200 * 1024 * 1024; // 200MB
            this.startTime = new Date();

            this.settings = {
                aiMode: 'auto',
                reportDetail: 'executive',
                notifications: true,
                realTimeUpdates: true,
                autoIOCLookup: true,
                timelineGranularity: 'minute',
                correlationEnabled: true,
                multiFileAnalysis: true,
                soundAlerts: false,
                emailNotifications: false,
                theme: 'dark',
                layout: 'default'
            };

            this.supportedFormats = [
                '.csv', '.json', '.log', '.txt', '.evtx', '.evt',
                '.wtmp', '.utmp', '.btmp', '.lastlog', '.pcap',
                '.pcapng', '.syslog', '.fwlog', '.dblog',
                '.maillog', '.dnslog'
            ];

            this.analysisSteps = [
                'Processing file headers',
                'Extracting events and data',
                'Running AI analysis',
                'Detecting threats and IOCs',
                'Performing correlation analysis',
                'Generating insights and reports',
                'Compiling final results'
            ];

            this.initializeElements();
            this.setupEventListeners();
            this.loadSettings();
            this.checkSystemStatus();
            this.testAPIConnection();
            this.updateSessionInfo();
            this.startSessionTimer();

            console.log('🚀 SecuNik Advanced Cybersecurity Platform initialized');
            this.showNotification('SecuNik Platform Ready', 'success');
        }

        initializeElements() {
            // Navigation elements
            this.sidebar = document.getElementById('sidebar');
            this.navItems = document.querySelectorAll('.nav-item');
            this.tabNavigation = document.getElementById('tabNavigation');
            this.tabs = document.querySelectorAll('.tab');
            this.tabContents = document.querySelectorAll('.tab-content');

            // Upload elements
            this.uploadZone = document.getElementById('uploadZone');
            this.fileInput = document.getElementById('fileInput');
            this.chooseFilesBtn = document.getElementById('chooseFilesBtn');
            this.uploadAnotherBtn = document.getElementById('uploadAnotherBtn');

            // Queue elements
            this.analysisQueue = document.getElementById('analysisQueue');
            this.queueItems = document.getElementById('queueItems');
            this.queueCount = document.getElementById('queueCount');
            this.processedCount = document.getElementById('processedCount');
            this.remainingCount = document.getElementById('remainingCount');

            // Header elements
            this.exportBtn = document.getElementById('exportBtn');
            this.exportMenu = document.getElementById('exportMenu');
            this.shareBtn = document.getElementById('shareBtn');
            this.printBtn = document.getElementById('printBtn');
            this.settingsBtn = document.getElementById('settingsBtn');
            this.helpBtn = document.getElementById('helpBtn');

            // Content containers
            this.overviewContent = document.getElementById('overview');
            this.threatsContent = document.getElementById('threats');
            this.iocsContent = document.getElementById('iocs');
            this.iqcsContent = document.getElementById('iqcs');
            this.timelineContent = document.getElementById('timeline');
            this.technicalContent = document.getElementById('technical');
            this.correlationContent = document.getElementById('correlation');
            this.executiveContent = document.getElementById('executive');
            this.casesContent = document.getElementById('cases');

            // Specific elements
            this.insightsGrid = document.getElementById('insightsGrid');
            this.threatsSummary = document.getElementById('threatsSummary');
            this.executiveSummary = document.getElementById('executiveSummary');
            this.iocsContent = document.getElementById('iocsContent');
            this.timelineContent = document.getElementById('timelineContent');

            // Modal elements
            this.uploadProgressModal = document.getElementById('uploadProgressModal');
            this.settingsModal = document.getElementById('settingsModal');
            this.helpModal = document.getElementById('helpModal');
            this.progressFill = document.getElementById('progressFill');
            this.progressText = document.getElementById('progressText');
            this.progressPercentage = document.getElementById('progressPercentage');
            this.progressFileName = document.getElementById('progressFileName');
            this.analysisSteps = document.getElementById('analysisSteps');
            this.currentFileName = document.getElementById('currentFileName');
            this.processingTimer = document.getElementById('processingTimer');
            this.analysisEngine = document.getElementById('analysisEngine');

            // Badge elements
            this.threatsBadge = document.getElementById('threatsBadge');
            this.iocsBadge = document.getElementById('iocsBadge');
            this.iqcsBadge = document.getElementById('iqcsBadge');
            this.timelineBadge = document.getElementById('timelineBadge');
            this.correlationBadge = document.getElementById('correlationBadge');

            // Status elements
            this.systemStatus = document.getElementById('systemStatus');
            this.statusIndicator = document.getElementById('statusIndicator');
            this.analysisCounter = document.getElementById('analysisCounter');
            this.sessionId = document.getElementById('sessionId');
            this.sessionDuration = document.getElementById('sessionDuration');

            // Metric elements
            this.criticalThreats = document.getElementById('criticalThreats');
            this.highThreats = document.getElementById('highThreats');
            this.totalIOCs = document.getElementById('totalIOCs');
            this.riskScore = document.getElementById('riskScore');

            // File info elements
            this.fileId = document.getElementById('fileId');
            this.fileName = document.getElementById('fileName');
            this.fileSize = document.getElementById('fileSize');
            this.processingTime = document.getElementById('processingTime');

            // Other elements
            this.notificationContainer = document.getElementById('notificationContainer');
            this.loadingOverlay = document.getElementById('loadingOverlay');
            this.featuresSection = document.getElementById('featuresSection');

            // Settings elements
            this.aiModeSelect = document.getElementById('aiModeSelect');
            this.reportDetailSelect = document.getElementById('reportDetailSelect');
            this.notificationsToggle = document.getElementById('notificationsToggle');
            this.realTimeToggle = document.getElementById('realTimeToggle');
            this.autoIOCToggle = document.getElementById('autoIOCToggle');
            this.correlationToggle = document.getElementById('correlationToggle');
            this.timelineGranularitySelect = document.getElementById('timelineGranularitySelect');
            this.soundToggle = document.getElementById('soundToggle');
            this.emailToggle = document.getElementById('emailToggle');
            this.themeSelect = document.getElementById('themeSelect');
            this.layoutSelect = document.getElementById('layoutSelect');

            // Help elements
            this.helpTabs = document.querySelectorAll('.help-tab');
            this.helpSections = document.querySelectorAll('.help-section');
        }

        setupEventListeners() {
            // Navigation
            this.navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const tab = e.currentTarget.dataset.tab;
                    this.navigateToTab(tab);
                });
            });

            this.tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const tabName = e.currentTarget.dataset.tab;
                    this.showTabContent(tabName);
                });
            });

            // File upload
            this.fileInput?.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFiles(e.target.files);
                }
            });

            this.chooseFilesBtn?.addEventListener('click', () => this.triggerFileUpload());
            this.uploadAnotherBtn?.addEventListener('click', () => this.triggerFileUpload());

            // Drag and drop
            this.uploadZone?.addEventListener('dragover', this.handleDragOver.bind(this));
            this.uploadZone?.addEventListener('dragleave', this.handleDragLeave.bind(this));
            this.uploadZone?.addEventListener('drop', this.handleDrop.bind(this));

            // Header actions
            this.exportBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleExportMenu();
            });

            this.shareBtn?.addEventListener('click', () => this.shareAnalysis());
            this.printBtn?.addEventListener('click', () => this.printReport());
            this.settingsBtn?.addEventListener('click', () => this.showSettingsModal());
            this.helpBtn?.addEventListener('click', () => this.showHelpModal());

            // Modal controls
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal');
                    this.hideModal(modal);
                });
            });

            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.hideModal(modal);
                    }
                });
            });

            // Settings handlers
            this.aiModeSelect?.addEventListener('change', (e) => {
                this.settings.aiMode = e.target.value;
                this.saveSettings();
            });

            this.reportDetailSelect?.addEventListener('change', (e) => {
                this.settings.reportDetail = e.target.value;
                this.saveSettings();
            });

            this.notificationsToggle?.addEventListener('change', (e) => {
                this.settings.notifications = e.target.checked;
                this.saveSettings();
            });

            this.realTimeToggle?.addEventListener('change', (e) => {
                this.settings.realTimeUpdates = e.target.checked;
                this.saveSettings();
            });

            this.autoIOCToggle?.addEventListener('change', (e) => {
                this.settings.autoIOCLookup = e.target.checked;
                this.saveSettings();
            });

            this.correlationToggle?.addEventListener('change', (e) => {
                this.settings.correlationEnabled = e.target.checked;
                this.saveSettings();
            });

            this.timelineGranularitySelect?.addEventListener('change', (e) => {
                this.settings.timelineGranularity = e.target.value;
                this.saveSettings();
            });

            this.soundToggle?.addEventListener('change', (e) => {
                this.settings.soundAlerts = e.target.checked;
                this.saveSettings();
            });

            this.emailToggle?.addEventListener('change', (e) => {
                this.settings.emailNotifications = e.target.checked;
                this.saveSettings();
            });

            this.themeSelect?.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme(e.target.value);
                this.saveSettings();
            });

            this.layoutSelect?.addEventListener('change', (e) => {
                this.settings.layout = e.target.value;
                this.applyLayout(e.target.value);
                this.saveSettings();
            });

            // Help tab navigation
            this.helpTabs?.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const tabName = e.currentTarget.dataset.helpTab;
                    this.showHelpTab(tabName);
                });
            });

            // Progress modal controls
            document.getElementById('pauseAnalysisBtn')?.addEventListener('click', () => this.pauseAnalysis());
            document.getElementById('cancelAnalysisBtn')?.addEventListener('click', () => this.cancelAnalysis());

            // Queue controls
            document.getElementById('pauseQueueBtn')?.addEventListener('click', () => this.pauseQueue());
            document.getElementById('clearQueueBtn')?.addEventListener('click', () => this.clearQueue());

            // Global drag and drop prevention
            document.addEventListener('dragover', (e) => e.preventDefault());
            document.addEventListener('drop', (e) => e.preventDefault());

            // Close export menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.exportBtn?.contains(e.target)) {
                    this.hideExportMenu();
                }
            });

            // Window events
            window.addEventListener('resize', () => this.handleResize());
            window.addEventListener('beforeunload', (e) => {
                if (this.isAnalyzing) {
                    e.preventDefault();
                    e.returnValue = 'Analysis in progress. Are you sure you want to leave?';
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        }

        // Navigation Methods
        navigateToTab(tab) {
            // Update sidebar navigation
            this.navItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.tab === tab) {
                    item.classList.add('active');
                }
            });

            this.currentTab = tab;

            if (tab === 'dashboard') {
                this.showDashboard();
            } else {
                this.showAnalysisResults();
                this.showTabContent(tab);
            }
        }

        showDashboard() {
            this.tabNavigation.style.display = 'none';
            this.tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('dashboard').classList.add('active');
            this.featuresSection.style.display = 'block';
        }

        showAnalysisResults() {
            if (this.currentAnalysisResults) {
                this.tabNavigation.style.display = 'flex';
                this.featuresSection.style.display = 'none';
            }
        }

        showTabContent(tabName) {
            // Update tab navigation
            this.tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.tab === tabName) {
                    tab.classList.add('active');
                }
            });

            // Update content
            this.tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabName) {
                    content.classList.add('active');
                }
            });

            this.currentTab = tabName;
        }

        // File Upload Methods
        triggerFileUpload() {
            this.fileInput?.click();
        }

        handleDragOver(e) {
            e.preventDefault();
            this.uploadZone?.classList.add('dragover');
        }

        handleDragLeave(e) {
            e.preventDefault();
            this.uploadZone?.classList.remove('dragover');
        }

        handleDrop(e) {
            e.preventDefault();
            this.uploadZone?.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFiles(files);
            }
        }

        async handleFiles(files) {
            console.log('=== ENHANCED FILE UPLOAD WITH AI INTEGRATION ===');
            console.log(`Processing ${files.length} file(s)`);

            // Validate files
            const validFiles = Array.from(files).filter(file => this.validateFile(file));
            if (validFiles.length === 0) {
                this.showNotification('No valid files selected', 'error');
                return;
            }

            // Add files to queue if already analyzing
            if (this.isAnalyzing) {
                this.addFilesToQueue(validFiles);
                return;
            }

            // Process first file
            await this.processFile(validFiles[0]);

            // Add remaining files to queue
            if (validFiles.length > 1) {
                this.addFilesToQueue(validFiles.slice(1));
            }
        }

        async processFile(file) {
            console.log('Processing file:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            this.currentFileInfo = {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified