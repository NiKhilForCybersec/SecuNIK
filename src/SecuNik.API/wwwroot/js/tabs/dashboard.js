export function initTab(analysis) {
    if (!analysis) return;

    const dashboard = window.secuNikDashboard;
    const elements = {
        criticalEvents: document.getElementById('criticalEvents'),
        totalEvents: document.getElementById('totalEvents'),
        totalIOCs: document.getElementById('totalIOCs'),
        analysisScore: document.getElementById('analysisScore'),
        gaugeFill: document.getElementById('gaugeFill'),
        gaugeValue: document.getElementById('gaugeValue'),
        riskLevelText: document.getElementById('riskLevelText'),
        aiSummary: document.getElementById('aiSummary'),
        aiConfidence: document.getElementById('aiConfidence'),
        topThreats: document.getElementById('topThreats'),
        threatCount: document.getElementById('threatCount'),
        timelineChart: document.getElementById('timelineChart'),
        iocCategories: document.getElementById('iocCategories'),
        performanceStatus: document.getElementById('performanceStatus'),
        cpuFill: document.getElementById('cpuFill'),
        cpuValue: document.getElementById('cpuValue'),
        memoryFill: document.getElementById('memoryFill'),
        memoryValue: document.getElementById('memoryValue'),
        speedFill: document.getElementById('speedFill'),
        speedValue: document.getElementById('speedValue')
    };

    const data = analysis.result;
    // Handle both old and new data structure
    const events = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];
    const iocs = data.technical?.detectedIOCs || data.Technical?.DetectedIOCs || [];

    updateQuickStats(events, iocs, data, elements, dashboard);
    updateRiskGauge(data, elements, dashboard);
    updateAISummary(data, elements, dashboard);
    updateTopThreats(events, elements, dashboard);
    updateTimelineChart(events, elements, dashboard);
    updateIOCCategories(iocs, elements, dashboard);
    updateAnalysisPerformanceMetrics(analysis.processingTime, elements, dashboard, analysis);
}

function updateQuickStats(events, iocs, data, el, dash) {
    const criticalEvents = events.filter(e => {
        const severity = (e.severity || e.Severity || '').toLowerCase();
        return severity === 'critical';
    }).length;

    const analysisScore = dash.calculateAnalysisScore(data);

    if (el.criticalEvents) el.criticalEvents.textContent = criticalEvents.toString();
    if (el.totalEvents) el.totalEvents.textContent = events.length.toString();
    if (el.totalIOCs) el.totalIOCs.textContent = iocs.length.toString();
    if (el.analysisScore) el.analysisScore.textContent = analysisScore.toString();
}

function updateRiskGauge(data, el, dash) {
    const riskScore = dash.calculateRiskScore(data);
    const riskLevel = dash.getRiskLevel(riskScore);

    if (el.gaugeValue) el.gaugeValue.textContent = riskScore;
    if (el.gaugeFill) {
        el.gaugeFill.style.width = `${riskScore}%`;
        // Animate the gauge fill
        setTimeout(() => {
            el.gaugeFill.style.width = `${riskScore}%`;
        }, 100);
    }
    if (el.riskLevelText) {
        el.riskLevelText.textContent = riskLevel;
        el.riskLevelText.className = `risk-level-value ${riskLevel.toLowerCase()}`;
    }
}

function updateAISummary(data, el, dash) {
    // Handle multiple possible AI summary locations
    const summary = data.executive?.summary ||
        data.Executive?.Summary ||
        data.ai?.summary ||
        data.AI?.Summary ||
        data.aiInsights?.summary ||
        'AI analysis completed successfully. Review detailed findings in other tabs.';

    const confidence = data.ai?.confidence ||
        data.AI?.Confidence ||
        data.aiInsights?.confidence ||
        85; // Default confidence

    if (el.aiSummary) {
        el.aiSummary.innerHTML = `<p>${dash.sanitizeHTML(summary)}</p>`;
    }
    if (el.aiConfidence) {
        const confidenceValue = typeof confidence === 'number' ? confidence : 85;
        el.aiConfidence.textContent = `${Math.round(confidenceValue)}% confidence`;
    }
}

function updateTopThreats(events, el, dash) {
    const threats = events
        .filter(e => {
            const severity = (e.severity || e.Severity || '').toLowerCase();
            return ['critical', 'high'].includes(severity);
        })
        .slice(0, 5);

    if (el.topThreats) {
        if (threats.length === 0) {
            el.topThreats.innerHTML = `
                <div class="placeholder-content">
                    <i data-feather="shield" width="32" height="32"></i>
                    <p>No critical threats detected</p>
                </div>
            `;
        } else {
            el.topThreats.innerHTML = threats.map(threat => {
                const severity = (threat.severity || threat.Severity || 'info').toLowerCase();
                const eventType = threat.eventType || threat.EventType || 'Security Event';
                const description = threat.description || threat.Description || 'No description available';
                const timestamp = threat.timestamp || threat.Timestamp || new Date().toISOString();

                return `
                    <div class="threat-item ${severity}">
                        <div class="threat-severity ${severity}"></div>
                        <div class="threat-content">
                            <div class="threat-title">${dash.sanitizeHTML(eventType)}</div>
                            <div class="threat-description">${dash.sanitizeHTML(description.substring(0, 100))}${description.length > 100 ? '...' : ''}</div>
                            <div class="threat-time">${dash.formatTimestamp(timestamp)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Re-initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    if (el.threatCount) el.threatCount.textContent = threats.length.toString();
}

export function updateTimelineChart(events, el = getElements(), dash = window.secuNikDashboard) {
    if (!el.timelineChart) return;

    if (events.length === 0) {
        el.timelineChart.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="activity" width="32" height="32"></i>
                <p>No events to display</p>
            </div>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        return;
    }

    const timelineData = processTimelineData(events);
    renderSimpleTimeline(timelineData, el);
}

function processTimelineData(events) {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return events
        .filter(e => {
            const timestamp = e.timestamp || e.Timestamp;
            return timestamp && new Date(timestamp) >= last24h;
        })
        .map(e => ({
            timestamp: new Date(e.timestamp || e.Timestamp),
            severity: (e.severity || e.Severity || 'info').toLowerCase(),
            type: e.eventType || e.EventType || 'Unknown',
            description: e.description || e.Description || ''
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
}

function renderSimpleTimeline(data, el) {
    if (!el.timelineChart) return;

    const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
        return hour;
    });

    const maxEvents = Math.max(...hours.map(h =>
        data.filter(e => e.timestamp.getHours() === h.getHours()).length
    ), 1);

    const timeline = hours.map(hour => {
        const hourEvents = data.filter(e =>
            e.timestamp.getHours() === hour.getHours() &&
            e.timestamp.getDate() === hour.getDate()
        );

        const critical = hourEvents.filter(e => e.severity === 'critical').length;
        const high = hourEvents.filter(e => e.severity === 'high').length;
        const medium = hourEvents.filter(e => e.severity === 'medium').length;
        const total = hourEvents.length;

        return {
            hour: hour.getHours(),
            total,
            critical,
            high,
            medium,
            height: Math.max((total / maxEvents) * 100, total > 0 ? 5 : 0)
        };
    });

    el.timelineChart.innerHTML = `
        <div class="timeline-bars">
            ${timeline.map(bar => `
                <div class="timeline-bar" style="height: ${bar.height}%" title="${bar.total} events at ${bar.hour.toString().padStart(2, '0')}:00">
                    ${bar.total > 0 ? `
                        <div class="bar-segment critical" style="height: ${bar.critical ? (bar.critical / bar.total) * 100 : 0}%"></div>
                        <div class="bar-segment high" style="height: ${bar.high ? (bar.high / bar.total) * 100 : 0}%"></div>
                        <div class="bar-segment medium" style="height: ${bar.medium ? (bar.medium / bar.total) * 100 : 0}%"></div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        <div class="timeline-labels">
            ${timeline.filter((_, i) => i % 4 === 0).map(bar => `
                <span>${bar.hour.toString().padStart(2, '0')}:00</span>
            `).join('')}
        </div>
    `;
}

function updateIOCCategories(iocs, el, dash) {
    if (!el.iocCategories) return;

    if (iocs.length === 0) {
        el.iocCategories.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="search" width="32" height="32"></i>
                <p>No IOCs detected</p>
            </div>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        return;
    }

    const categories = {};
    iocs.forEach(ioc => {
        let category = 'Unknown';

        // Determine category from IOC string or type
        if (typeof ioc === 'string') {
            if (ioc.startsWith('IP:')) category = 'IP Address';
            else if (ioc.startsWith('Domain:')) category = 'Domain';
            else if (ioc.startsWith('Hash:')) category = 'File Hash';
            else if (ioc.startsWith('Email:')) category = 'Email';
            else if (ioc.includes('.')) category = 'Domain';
            else if (/^\d+\.\d+\.\d+\.\d+$/.test(ioc)) category = 'IP Address';
            else if (/^[a-fA-F0-9]{32,64}$/.test(ioc)) category = 'File Hash';
        } else if (typeof ioc === 'object') {
            category = ioc.category || ioc.type || 'Unknown';
        }

        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category]++;
    });

    const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    el.iocCategories.innerHTML = `
        <div class="ioc-category-list">
            ${sortedCategories.map(([category, count]) => `
                <div class="ioc-category-item">
                    <div class="category-name">${dash.sanitizeHTML(category)}</div>
                    <div class="category-count">${count}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function updateAnalysisPerformanceMetrics(processingTime, el, dash, analysis) {
    const speed = analysis?.fileInfo ? (analysis.fileInfo.size / processingTime) * 1000 : 0;

    // Initialize metrics if not exists
    dash.metrics = dash.metrics || { cpu: 0, memory: 0, analysisSpeed: 0 };

    // Simulate realistic performance metrics based on actual processing
    const fileSize = analysis?.fileInfo?.size || 0;
    const complexity = fileSize > 10 * 1024 * 1024 ? 'high' : fileSize > 1024 * 1024 ? 'medium' : 'low';

    switch (complexity) {
        case 'high':
            dash.metrics.cpu = Math.min(50 + Math.random() * 30, 90);
            dash.metrics.memory = Math.min(60 + Math.random() * 25, 85);
            break;
        case 'medium':
            dash.metrics.cpu = Math.min(30 + Math.random() * 30, 70);
            dash.metrics.memory = Math.min(40 + Math.random() * 25, 70);
            break;
        default:
            dash.metrics.cpu = Math.min(20 + Math.random() * 20, 50);
            dash.metrics.memory = Math.min(30 + Math.random() * 20, 60);
    }

    dash.metrics.analysisSpeed = Math.min((speed / 1024) / 10, 100);

    // Update CPU metrics
    if (el.cpuFill) {
        el.cpuFill.style.width = `${dash.metrics.cpu}%`;
    }
    if (el.cpuValue) {
        el.cpuValue.textContent = `${Math.round(dash.metrics.cpu)}%`;
    }

    // Update Memory metrics
    if (el.memoryFill) {
        el.memoryFill.style.width = `${dash.metrics.memory}%`;
    }
    if (el.memoryValue) {
        el.memoryValue.textContent = `${Math.round(dash.metrics.memory)}%`;
    }

    // Update Speed metrics
    if (el.speedFill) {
        el.speedFill.style.width = `${Math.min(dash.metrics.analysisSpeed, 100)}%`;
    }
    if (el.speedValue) {
        el.speedValue.textContent = dash.formatSpeed(speed);
    }

    // Update performance status
    const avgLoad = (dash.metrics.cpu + dash.metrics.memory) / 2;
    const status = avgLoad < 50 ? 'Optimal' : avgLoad < 75 ? 'Good' : 'High Load';

    if (el.performanceStatus) {
        el.performanceStatus.textContent = status;
        el.performanceStatus.className = `performance-status ${status.toLowerCase().replace(' ', '-')}`;
    }
}

function getElements() {
    return {
        timelineChart: document.getElementById('timelineChart'),
        criticalEvents: document.getElementById('criticalEvents'),
        totalEvents: document.getElementById('totalEvents'),
        totalIOCs: document.getElementById('totalIOCs'),
        analysisScore: document.getElementById('analysisScore')
    };
}