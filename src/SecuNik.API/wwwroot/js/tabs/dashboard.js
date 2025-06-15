/**
 * SecuNik Dashboard Tab - Fixed Version
 * Main dashboard view with analytics and overview
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

let dashboard = null;
let currentAnalysis = null;
let realTimeMonitoringActive = false;
let performanceChart = null;
let riskGaugeChart = null;

/**
 * Initialize dashboard tab
 */
export function init(dashboardInstance) {
    dashboard = dashboardInstance;
    console.log('✅ Dashboard tab module initialized');
}

/**
 * Initialize dashboard tab with analysis data
 */
export function initTab(analysis) {
    if (!analysis) {
        console.log('📊 Initializing dashboard with welcome state');
        showWelcomeState();
        return;
    }

    console.log('📊 Initializing dashboard with analysis data');
    currentAnalysis = analysis;
    renderDashboard(analysis);
}

/**
 * Show welcome state when no analysis is available
 */
function showWelcomeState() {
    const dashboardTab = document.getElementById('dashboardTab');
    if (!dashboardTab) return;

    dashboardTab.innerHTML = `
        <div class="welcome-state">
            <div class="welcome-content">
                <div class="welcome-header">
                    <i data-feather="shield" width="64" height="64"></i>
                    <h1>Welcome to SecuNik Professional</h1>
                    <p>Advanced AI-powered cybersecurity analysis platform</p>
                </div>
                
                <div class="welcome-actions">
                    <div class="upload-card">
                        <i data-feather="upload" width="32" height="32"></i>
                        <h3>Upload Evidence</h3>
                        <p>Drag and drop your log files, network captures, or security artifacts to begin analysis</p>
                        <button class="btn btn-primary" onclick="document.getElementById('fileInput')?.click()">
                            <i data-feather="file-plus"></i> Select Files
                        </button>
                    </div>
                    
                    <div class="features-grid">
                        <div class="feature-card">
                            <i data-feather="cpu" width="24" height="24"></i>
                            <h4>AI-Powered Analysis</h4>
                            <p>Advanced machine learning algorithms analyze your security data</p>
                        </div>
                        
                        <div class="feature-card">
                            <i data-feather="search" width="24" height="24"></i>
                            <h4>IOC Detection</h4>
                            <p>Automatically detect indicators of compromise</p>
                        </div>
                        
                        <div class="feature-card">
                            <i data-feather="clock" width="24" height="24"></i>
                            <h4>Timeline Analysis</h4>
                            <p>Reconstruct event timelines for forensic investigation</p>
                        </div>
                        
                        <div class="feature-card">
                            <i data-feather="file-text" width="24" height="24"></i>
                            <h4>Executive Reports</h4>
                            <p>Generate comprehensive security reports</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Render main dashboard with analysis data
 */
function renderDashboard(analysis) {
    const dashboardTab = document.getElementById('dashboardTab');
    if (!dashboardTab) return;

    dashboardTab.innerHTML = `
        <div class="dashboard-container">
            <!-- Quick Stats Section -->
            <div class="quick-stats" id="quickStats">
                <div class="stat-card critical" id="criticalEventsCard">
                    <div class="stat-icon">
                        <i data-feather="alert-triangle" aria-hidden="true"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="criticalEvents">0</div>
                        <div class="stat-label">Critical Events</div>
                    </div>
                </div>
                
                <div class="stat-card warning" id="highEventsCard">
                    <div class="stat-icon">
                        <i data-feather="alert-circle" aria-hidden="true"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="highEvents">0</div>
                        <div class="stat-label">High Priority</div>
                    </div>
                </div>
                
                <div class="stat-card info" id="mediumEventsCard">
                    <div class="stat-icon">
                        <i data-feather="info" aria-hidden="true"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="mediumEvents">0</div>
                        <div class="stat-label">Medium Events</div>
                    </div>
                </div>
                
                <div class="stat-card success" id="analysisScoreCard">
                    <div class="stat-icon">
                        <i data-feather="check-circle" aria-hidden="true"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="analysisScore">--</div>
                        <div class="stat-label">Security Score</div>
                    </div>
                </div>
            </div>

            <!-- Main Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Risk Assessment Widget -->
                <div class="dashboard-widget">
                    <div class="widget-header">
                        <h3><i data-feather="gauge" aria-hidden="true"></i> Risk Assessment</h3>
                        <div class="widget-controls">
                            <button class="widget-action" title="Refresh">
                                <i data-feather="refresh-cw" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div id="riskGaugeContainer" class="risk-gauge-container">
                            <div class="risk-gauge" id="riskGauge">
                                <div class="gauge-chart" id="gaugeChart"></div>
                                <div class="gauge-center">
                                    <div class="gauge-value" id="gaugeValue">--</div>
                                    <div class="gauge-label">Risk Level</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Summary Widget -->
                <div class="dashboard-widget">
                    <div class="widget-header">
                        <h3><i data-feather="cpu" aria-hidden="true"></i> AI Analysis Summary</h3>
                        <div class="widget-controls">
                            <button class="widget-action" title="Expand">
                                <i data-feather="maximize-2" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div id="aiSummaryContent" class="ai-summary">
                            <div class="summary-text" id="summaryText">
                                <p>AI analysis will appear here once file processing is complete.</p>
                            </div>
                            <div class="confidence-indicator" id="confidenceIndicator">
                                <span class="confidence-label">Confidence:</span>
                                <div class="confidence-bar">
                                    <div class="confidence-fill" id="confidenceFill" style="width: 0%"></div>
                                </div>
                                <span class="confidence-value" id="confidenceValue">--</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Threats Widget -->
                <div class="dashboard-widget">
                    <div class="widget-header">
                        <h3><i data-feather="shield-off" aria-hidden="true"></i> Top Threats</h3>
                        <div class="widget-controls">
                            <button class="widget-action" title="View All">
                                <i data-feather="external-link" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div id="topThreatsContainer" class="threats-container">
                            <div class="placeholder-content">
                                <i data-feather="shield" width="32" height="32"></i>
                                <p>No threats detected</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timeline Overview Widget -->
                <div class="dashboard-widget wide">
                    <div class="widget-header">
                        <h3><i data-feather="activity" aria-hidden="true"></i> Activity Timeline</h3>
                        <div class="widget-controls">
                            <button class="widget-action" title="Full Timeline" onclick="dashboard?.switchToTab('timeline')">
                                <i data-feather="maximize-2" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div id="timelineChart" class="timeline-chart">
                            <div class="timeline-placeholder">
                                <i data-feather="clock" width="32" height="32"></i>
                                <p>Timeline will appear after analysis</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- IOC Categories Widget -->
                <div class="dashboard-widget">
                    <div class="widget-header">
                        <h3><i data-feather="target" aria-hidden="true"></i> IOC Categories</h3>
                        <div class="widget-controls">
                            <button class="widget-action" title="View All IOCs" onclick="dashboard?.switchToTab('iocs')">
                                <i data-feather="external-link" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div id="iocCategoriesContainer" class="ioc-categories">
                            <div class="placeholder-content">
                                <i data-feather="search" width="32" height="32"></i>
                                <p>No IOCs detected</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Performance Widget -->
                <div class="dashboard-widget">
                    <div class="widget-header">
                        <h3><i data-feather="monitor" aria-hidden="true"></i> System Performance</h3>
                        <div class="widget-controls">
                            <button class="widget-action" id="toggleMonitoring" title="Toggle Monitoring">
                                <i data-feather="play" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div class="metrics-list">
                            <div class="metric">
                                <div class="metric-label">CPU Usage</div>
                                <div class="metric-progress">
                                    <div class="metric-progress-bar info" id="cpuProgressBar" style="width: 0%"></div>
                                </div>
                                <div class="metric-value" id="cpuValue">0%</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Memory</div>
                                <div class="metric-progress">
                                    <div class="metric-progress-bar medium" id="memoryProgressBar" style="width: 0%"></div>
                                </div>
                                <div class="metric-value" id="memoryValue">0%</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Analysis Speed</div>
                                <div class="metric-progress">
                                    <div class="metric-progress-bar low" id="speedProgressBar" style="width: 0%"></div>
                                </div>
                                <div class="metric-value" id="speedValue">--</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Update dashboard with analysis data
    updateDashboard(analysis);

    // Setup event listeners
    setupDashboardEventListeners();
}

/**
 * Update dashboard with analysis data
 */
function updateDashboard(analysis) {
    if (!analysis || !analysis.result) {
        console.warn('No analysis data provided to dashboard');
        return;
    }

    console.log('📊 Updating dashboard with analysis data');

    const elements = {
        criticalEvents: document.getElementById('criticalEvents'),
        highEvents: document.getElementById('highEvents'),
        mediumEvents: document.getElementById('mediumEvents'),
        analysisScore: document.getElementById('analysisScore'),
        summaryText: document.getElementById('summaryText'),
        confidenceValue: document.getElementById('confidenceValue'),
        confidenceFill: document.getElementById('confidenceFill'),
        gaugeValue: document.getElementById('gaugeValue'),
        cpuValue: document.getElementById('cpuValue'),
        memoryValue: document.getElementById('memoryValue'),
        speedValue: document.getElementById('speedValue')
    };

    const data = analysis.result;
    // Handle both old and new data structure
    const events = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];
    const iocs = data.technical?.detectedIOCs || data.Technical?.DetectedIOCs || [];
    const aiAnalysis = data.aiAnalysis || data.AIAnalysis || {};

    // Update all dashboard sections
    updateQuickStats(events, elements);
    updateRiskGauge(data, elements);
    updateAISummary(aiAnalysis, elements);
    updateTopThreats(events);
    updateTimelineChart(events);
    updateIOCCategories(iocs);
    updatePerformanceMetrics(analysis.processingTime, elements);

    // Start real-time monitoring
    startRealTimeMonitoring();

    console.log('✅ Dashboard updated successfully');
}

/**
 * Update quick stats cards
 */
function updateQuickStats(events, elements) {
    const criticalEvents = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'critical'
    ).length;

    const highEvents = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'high'
    ).length;

    const mediumEvents = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'medium'
    ).length;

    // Calculate security score
    const totalEvents = events.length;
    let score = 100;
    if (totalEvents > 0) {
        score = Math.max(0, 100 - (criticalEvents * 20) - (highEvents * 10) - (mediumEvents * 5));
    }

    // Update with animation
    if (elements.criticalEvents) {
        animateNumber(elements.criticalEvents, criticalEvents);
    }
    if (elements.highEvents) {
        animateNumber(elements.highEvents, highEvents);
    }
    if (elements.mediumEvents) {
        animateNumber(elements.mediumEvents, mediumEvents);
    }
    if (elements.analysisScore) {
        animateNumber(elements.analysisScore, score, '%');
    }

    // Update card colors based on values
    updateStatCardColor('criticalEventsCard', criticalEvents > 0 ? 'critical' : 'success');
    updateStatCardColor('highEventsCard', highEvents > 0 ? 'warning' : 'success');
    updateStatCardColor('mediumEventsCard', mediumEvents > 0 ? 'info' : 'success');
    updateStatCardColor('analysisScoreCard', score < 50 ? 'critical' : score < 80 ? 'warning' : 'success');
}

/**
 * Update risk gauge
 */
function updateRiskGauge(data, elements) {
    const events = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];
    const criticalCount = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'critical'
    ).length;

    const highCount = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'high'
    ).length;

    // Calculate risk level (0-100)
    let riskLevel = 0;
    if (events.length > 0) {
        riskLevel = Math.min(100, (criticalCount * 25) + (highCount * 15));
    }

    if (elements.gaugeValue) {
        elements.gaugeValue.textContent = riskLevel;
    }

    // Update gauge visual
    updateGaugeChart(riskLevel);

    return riskLevel;
}

/**
 * Update AI summary section
 */
function updateAISummary(aiAnalysis, elements) {
    const summary = aiAnalysis.summary || 'Analysis completed. Review the security events and IOCs for detailed findings.';
    const confidence = aiAnalysis.confidence || 0.85;

    if (elements.summaryText) {
        elements.summaryText.innerHTML = `<p>${summary}</p>`;
    }

    if (elements.confidenceValue) {
        elements.confidenceValue.textContent = Math.round(confidence * 100) + '%';
    }

    if (elements.confidenceFill) {
        elements.confidenceFill.style.width = (confidence * 100) + '%';

        // Color based on confidence level
        if (confidence >= 0.8) {
            elements.confidenceFill.className = 'confidence-fill high';
        } else if (confidence >= 0.6) {
            elements.confidenceFill.className = 'confidence-fill medium';
        } else {
            elements.confidenceFill.className = 'confidence-fill low';
        }
    }
}

/**
 * Update top threats widget
 */
function updateTopThreats(events) {
    const container = document.getElementById('topThreatsContainer');
    if (!container) return;

    const criticalAndHighEvents = events
        .filter(e => ['critical', 'high'].includes((e.severity || e.Severity || '').toLowerCase()))
        .slice(0, 5);

    if (criticalAndHighEvents.length === 0) {
        container.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="shield-check" width="32" height="32"></i>
                <p>No high-priority threats detected</p>
            </div>
        `;
    } else {
        container.innerHTML = criticalAndHighEvents.map(event => `
            <div class="threat-item ${(event.severity || event.Severity || '').toLowerCase()}">
                <div class="threat-icon">
                    <i data-feather="${getSeverityIcon(event.severity || event.Severity)}" width="16" height="16"></i>
                </div>
                <div class="threat-content">
                    <div class="threat-title">${event.type || event.Type || 'Security Event'}</div>
                    <div class="threat-description">${event.description || event.Description || 'No description available'}</div>
                    <div class="threat-meta">
                        <span class="threat-time">${formatTimestamp(event.timestamp || event.Timestamp)}</span>
                        <span class="threat-severity ${(event.severity || event.Severity || '').toLowerCase()}">
                            ${(event.severity || event.Severity || 'Unknown').toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Update timeline chart widget
 */
function updateTimelineChart(events) {
    const container = document.getElementById('timelineChart');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `
            <div class="timeline-placeholder">
                <i data-feather="clock" width="32" height="32"></i>
                <p>No timeline data available</p>
            </div>
        `;
        return;
    }

    // Create simple timeline visualization
    const timelineData = processTimelineData(events);
    renderMiniTimeline(container, timelineData);
}

/**
 * Update IOC categories widget
 */
function updateIOCCategories(iocs) {
    const container = document.getElementById('iocCategoriesContainer');
    if (!container) return;

    if (iocs.length === 0) {
        container.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="search" width="32" height="32"></i>
                <p>No IOCs detected</p>
            </div>
        `;
        return;
    }

    // Group IOCs by type
    const categorized = groupIOCsByType(iocs);

    container.innerHTML = Object.entries(categorized).map(([type, count]) => `
        <div class="ioc-category">
            <div class="ioc-icon">
                <i data-feather="${getIOCIcon(type)}" width="16" height="16"></i>
            </div>
            <div class="ioc-content">
                <div class="ioc-type">${type.toUpperCase()}</div>
                <div class="ioc-count">${count} found</div>
            </div>
        </div>
    `).join('');

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Update performance metrics
 */
function updatePerformanceMetrics(processingTime, elements) {
    // Simulate performance metrics
    const cpu = Math.floor(Math.random() * 30) + 20; // 20-50%
    const memory = Math.floor(Math.random() * 40) + 30; // 30-70%
    const speed = processingTime ? Math.round(processingTime / 1000) : Math.floor(Math.random() * 5) + 2;

    if (elements.cpuValue) {
        elements.cpuValue.textContent = cpu + '%';
        const progressBar = document.getElementById('cpuProgressBar');
        if (progressBar) {
            progressBar.style.width = cpu + '%';
        }
    }

    if (elements.memoryValue) {
        elements.memoryValue.textContent = memory + '%';
        const progressBar = document.getElementById('memoryProgressBar');
        if (progressBar) {
            progressBar.style.width = memory + '%';
        }
    }

    if (elements.speedValue) {
        elements.speedValue.textContent = speed + 's';
        const progressBar = document.getElementById('speedProgressBar');
        if (progressBar) {
            const speedPercent = Math.min(100, (speed / 10) * 100);
            progressBar.style.width = speedPercent + '%';
        }
    }
}

/**
 * Setup dashboard event listeners
 */
function setupDashboardEventListeners() {
    // Toggle monitoring button
    const toggleBtn = document.getElementById('toggleMonitoring');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            realTimeMonitoringActive = !realTimeMonitoringActive;
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-feather', realTimeMonitoringActive ? 'pause' : 'play');
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
            }
        });
    }
}

/**
 * Start real-time monitoring
 */
function startRealTimeMonitoring() {
    if (realTimeMonitoringActive) return;

    realTimeMonitoringActive = true;

    setInterval(() => {
        if (!realTimeMonitoringActive) return;

        // Update performance metrics with new random values
        updatePerformanceMetrics(null, {
            cpuValue: document.getElementById('cpuValue'),
            memoryValue: document.getElementById('memoryValue'),
            speedValue: document.getElementById('speedValue')
        });
    }, 3000);
}

// Helper functions

function animateNumber(element, targetValue, suffix = '') {
    if (!element) return;

    const currentValue = parseInt(element.textContent) || 0;
    const increment = Math.ceil((targetValue - currentValue) / 10);
    let current = currentValue;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = current + suffix;
    }, 50);
}

function updateStatCardColor(cardId, colorClass) {
    const card = document.getElementById(cardId);
    if (!card) return;

    card.className = `stat-card ${colorClass}`;
}

function updateGaugeChart(value) {
    const gaugeChart = document.getElementById('gaugeChart');
    if (!gaugeChart) return;

    // Simple CSS-based gauge
    const percentage = (value / 100) * 180; // 180 degrees for semicircle
    gaugeChart.style.background = `conic-gradient(
        ${value < 30 ? '#10b981' : value < 70 ? '#f59e0b' : '#ef4444'} ${percentage}deg,
        #e5e7eb ${percentage}deg
    )`;
}

function getSeverityIcon(severity) {
    const icons = {
        'critical': 'alert-triangle',
        'high': 'alert-circle',
        'medium': 'info',
        'low': 'check-circle'
    };
    return icons[(severity || '').toLowerCase()] || 'help-circle';
}

function getIOCIcon(type) {
    const icons = {
        'ip': 'globe',
        'domain': 'link',
        'hash': 'hash',
        'email': 'mail',
        'url': 'external-link',
        'file': 'file'
    };
    return icons[type.toLowerCase()] || 'search';
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown time';
    try {
        return new Date(timestamp).toLocaleString();
    } catch {
        return timestamp;
    }
}

function processTimelineData(events) {
    return events.map(event => ({
        timestamp: new Date(event.timestamp || event.Timestamp || Date.now()),
        severity: (event.severity || event.Severity || 'low').toLowerCase(),
        type: event.type || event.Type || 'Unknown'
    })).sort((a, b) => a.timestamp - b.timestamp);
}

function renderMiniTimeline(container, timelineData) {
    const hours = 24;
    const now = new Date();
    const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));

    container.innerHTML = `
        <div class="mini-timeline">
            <div class="timeline-header">
                <span>Last 24 Hours Activity</span>
                <span>${timelineData.length} events</span>
            </div>
            <div class="timeline-bars">
                ${Array.from({ length: hours }, (_, i) => {
        const hourStart = new Date(startTime.getTime() + (i * 60 * 60 * 1000));
        const hourEnd = new Date(hourStart.getTime() + (60 * 60 * 1000));
        const hourEvents = timelineData.filter(e =>
            e.timestamp >= hourStart && e.timestamp < hourEnd
        );
        const height = Math.min(100, (hourEvents.length / Math.max(1, timelineData.length / hours)) * 100);

        return `
                        <div class="timeline-bar" style="height: ${height}%" 
                             title="${hourEvents.length} events at ${hourStart.getHours()}:00">
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

function groupIOCsByType(iocs) {
    const grouped = {};
    iocs.forEach(ioc => {
        const type = (ioc.type || ioc.Type || 'unknown').toLowerCase();
        grouped[type] = (grouped[type] || 0) + 1;
    });
    return grouped;
}

// Export functions
export { init, initTab };
