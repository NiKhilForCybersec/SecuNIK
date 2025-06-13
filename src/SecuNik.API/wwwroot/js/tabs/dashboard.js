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
    const events = data.technical?.securityEvents || [];
    const iocs = data.technical?.detectedIOCs || [];

    updateQuickStats(events, iocs, data, elements, dashboard);
    updateRiskGauge(data, elements, dashboard);
    updateAISummary(data, elements, dashboard);
    updateTopThreats(events, elements, dashboard);
    updateTimelineChart(events, elements, dashboard);
    updateIOCCategories(iocs, elements, dashboard);
    updateAnalysisPerformanceMetrics(analysis.processingTime, elements, dashboard, analysis);
}

function updateQuickStats(events, iocs, data, el, dash) {
    const criticalEvents = events.filter(e => (e.severity || '').toLowerCase() === 'critical').length;
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
    if (el.gaugeFill) el.gaugeFill.style.width = `${riskScore}%`;
    if (el.riskLevelText) {
        el.riskLevelText.textContent = riskLevel;
        el.riskLevelText.className = `risk-level-value ${riskLevel.toLowerCase()}`;
    }
}

function updateAISummary(data, el, dash) {
    const summary = data.executiveSummary?.summary || data.aiInsights?.summary || 'No AI summary available';
    const confidence = data.aiInsights?.confidence || 0;

    if (el.aiSummary) el.aiSummary.innerHTML = `<p>${dash.sanitizeHTML(summary)}</p>`;
    if (el.aiConfidence) el.aiConfidence.textContent = `${Math.round(confidence * 100)}% confidence`;
}

function updateTopThreats(events, el, dash) {
    const threats = events
        .filter(e => e.severity && ['critical', 'high'].includes(e.severity.toLowerCase()))
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
            el.topThreats.innerHTML = threats.map(threat => `
                <div class="threat-item">
                    <div class="threat-severity ${threat.severity?.toLowerCase() || 'info'}"></div>
                    <div class="threat-content">
                        <div class="threat-title">${dash.sanitizeHTML(threat.eventType || threat.description || 'Unknown Threat')}</div>
                        <div class="threat-time">${dash.formatTimestamp(threat.timestamp)}</div>
                    </div>
                </div>
            `).join('');
        }
        feather.replace();
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
        feather.replace();
        return;
    }

    const timelineData = processTimelineData(events);
    renderSimpleTimeline(timelineData, el);
}

function processTimelineData(events) {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return events
        .filter(e => e.timestamp && new Date(e.timestamp) >= last24h)
        .map(e => ({
            timestamp: new Date(e.timestamp),
            severity: e.severity || 'info',
            type: e.eventType || 'Unknown',
            description: e.description || ''
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

    const timeline = hours.map(hour => {
        const hourEvents = data.filter(e =>
            e.timestamp.getHours() === hour.getHours() &&
            e.timestamp.getDate() === hour.getDate()
        );

        const critical = hourEvents.filter(e => e.severity === 'critical').length;
        const high = hourEvents.filter(e => e.severity === 'high').length;
        const total = hourEvents.length;

        return {
            hour: hour.getHours(),
            total,
            critical,
            high,
            height: Math.min((total / Math.max(...hours.map(h => data.filter(e => e.timestamp.getHours() === h.getHours()).length), 1)) * 100, 100)
        };
    });

    el.timelineChart.innerHTML = `
        <div class="timeline-bars">
            ${timeline.map(bar => `
                <div class="timeline-bar" style="height: ${bar.height}%" title="${bar.total} events at ${bar.hour}:00">
                    <div class="bar-segment critical" style="height: ${bar.critical ? (bar.critical / bar.total) * 100 : 0}%"></div>
                    <div class="bar-segment high" style="height: ${bar.high ? (bar.high / bar.total) * 100 : 0}%"></div>
                </div>
            `).join('')}
        </div>
        <div class="timeline-labels">
            ${timeline.filter((_, i) => i % 4 === 0).map(bar => `
                <span>${bar.hour}:00</span>
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
        feather.replace();
        return;
    }

    const categories = {};
    iocs.forEach(ioc => {
        const category = ioc.category || ioc.type || 'Unknown';
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

    dash.metrics = dash.metrics || { cpu: 0, memory: 0, analysisSpeed: 0 };

    dash.metrics.cpu = Math.min(30 + Math.random() * 40, 100);
    dash.metrics.memory = Math.min(40 + Math.random() * 30, 100);
    dash.metrics.analysisSpeed = Math.min((speed / 1024) / 10, 100);

    if (el.cpuFill) el.cpuFill.style.width = `${dash.metrics.cpu}%`;
    if (el.cpuValue) el.cpuValue.textContent = `${Math.round(dash.metrics.cpu)}%`;

    if (el.memoryFill) el.memoryFill.style.width = `${dash.metrics.memory}%`;
    if (el.memoryValue) el.memoryValue.textContent = `${Math.round(dash.metrics.memory)}%`;

    if (el.speedFill) el.speedFill.style.width = `${dash.metrics.analysisSpeed}%`;
    if (el.speedValue) el.speedValue.textContent = dash.formatSpeed(speed);

    const status = dash.metrics.cpu < 60 && dash.metrics.memory < 70 ? 'Optimal' :
        dash.metrics.cpu < 80 && dash.metrics.memory < 85 ? 'Good' : 'High Load';

    if (el.performanceStatus) {
        el.performanceStatus.textContent = status;
        el.performanceStatus.className = `performance-status ${status.toLowerCase().replace(' ', '-')}`;
    }
}

function getElements() {
    return {
        timelineChart: document.getElementById('timelineChart')
    };
}
