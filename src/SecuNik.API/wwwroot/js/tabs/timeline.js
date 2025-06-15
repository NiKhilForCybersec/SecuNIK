/**
 * SecuNik Timeline Tab - Fixed Version
 * Timeline analysis and visualization
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

let dashboard = null;
let timelineData = [];
let filteredTimelineData = [];
let selectedTimeRange = 'all';
let selectedEventTypes = [];
let zoomLevel = 1;
let currentView = 'detailed'; // detailed, compact, heatmap

/**
 * Initialize timeline tab
 */
export function init(dashboardInstance) {
    dashboard = dashboardInstance;
    console.log('✅ Timeline tab initialized');
}

/**
 * Render timeline tab with analysis data
 */
export function render(analysis) {
    if (!analysis) {
        renderEmptyState();
        return;
    }

    console.log('📊 Rendering timeline tab with analysis data');

    // Extract and process timeline data
    const data = analysis?.result || analysis;
    timelineData = processTimelineData(data);
    filteredTimelineData = [...timelineData];

    // Initialize filters
    selectedEventTypes = getUniqueEventTypes();

    renderTimelineInterface();
    setupTimelineEventListeners();

    console.log(`✅ Timeline rendered with ${timelineData.length} events`);
}

/**
 * Render empty state when no analysis data
 */
function renderEmptyState() {
    const timelineTab = document.getElementById('timelineTab');
    if (!timelineTab) return;

    timelineTab.innerHTML = `
        <div class="empty-state">
            <div class="empty-content">
                <i data-feather="clock" width="64" height="64"></i>
                <h2>No Timeline Data</h2>
                <p>Upload and analyze a file to view the timeline of events</p>
                <button class="btn btn-primary" onclick="document.getElementById('fileInput')?.click()">
                    <i data-feather="upload"></i> Upload File
                </button>
            </div>
        </div>
    `;

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Render main timeline interface
 */
function renderTimelineInterface() {
    const timelineTab = document.getElementById('timelineTab');
    if (!timelineTab) return;

    timelineTab.innerHTML = `
        <div class="timeline-container">
            <!-- Timeline Header -->
            <div class="section-header">
                <h2><i data-feather="clock" aria-hidden="true"></i> Timeline Analysis</h2>
                <div class="header-actions">
                    <div class="timeline-summary">
                        <span class="total-events">${timelineData.length} Timeline Events</span>
                        <span class="time-span">${getTimeSpan()}</span>
                    </div>
                    <button class="btn btn-secondary" id="exportTimelineBtn">
                        <i data-feather="download"></i> Export Timeline
                    </button>
                    <button class="btn btn-secondary" id="generateTimelineReportBtn">
                        <i data-feather="file-text"></i> Generate Report
                    </button>
                    <button class="btn btn-primary" id="refreshTimelineBtn">
                        <i data-feather="refresh-cw"></i> Refresh
                    </button>
                </div>
            </div>
            
            <!-- Timeline Controls -->
            <div class="timeline-controls">
                <div class="control-group">
                    <label>View Mode:</label>
                    <div class="view-mode-buttons">
                        <button class="view-btn active" data-view="detailed">
                            <i data-feather="list"></i> Detailed
                        </button>
                        <button class="view-btn" data-view="compact">
                            <i data-feather="minimize-2"></i> Compact
                        </button>
                        <button class="view-btn" data-view="heatmap">
                            <i data-feather="grid"></i> Heatmap
                        </button>
                    </div>
                </div>
                
                <div class="control-group">
                    <label for="timelineTimeRange">Time Range:</label>
                    <select id="timelineTimeRange">
                        <option value="all">All Time</option>
                        <option value="1h">Last Hour</option>
                        <option value="6h">Last 6 Hours</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label for="timelineEventTypes">Event Types:</label>
                    <select id="timelineEventTypes" multiple>
                        ${getUniqueEventTypes().map(type => `
                            <option value="${type}" selected>${type}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="control-group">
                    <label for="timelineZoom">Zoom Level:</label>
                    <input type="range" id="timelineZoom" min="1" max="10" value="${zoomLevel}" 
                           class="zoom-slider">
                    <span class="zoom-value">${zoomLevel}x</span>
                </div>
                
                <div class="control-group">
                    <button class="btn btn-outline" id="resetTimelineFilters">
                        <i data-feather="refresh-ccw"></i> Reset Filters
                    </button>
                </div>
            </div>

            <!-- Timeline Statistics -->
            <div class="timeline-stats" id="timelineStats">
                <!-- Will be populated by updateTimelineStats() -->
            </div>

            <!-- Timeline Visualization -->
            <div class="timeline-visualization" id="timelineVisualization">
                <!-- Timeline will be rendered here -->
            </div>

            <!-- Timeline Events List -->
            <div class="timeline-events-section">
                <div class="timeline-events-header">
                    <h3>Timeline Events</h3>
                    <div class="events-controls">
                        <span id="timelineEventsCount">0 events</span>
                        <button class="btn btn-outline btn-sm" id="expandAllEvents">
                            <i data-feather="chevrons-down"></i> Expand All
                        </button>
                        <button class="btn btn-outline btn-sm" id="collapseAllEvents">
                            <i data-feather="chevrons-up"></i> Collapse All
                        </button>
                    </div>
                </div>
                
                <div class="timeline-events-list" id="timelineEventsList">
                    <!-- Events will be rendered here -->
                </div>
            </div>

            <!-- Event Details Panel -->
            <div class="event-details-panel" id="eventDetailsPanel" style="display: none;">
                <div class="panel-header">
                    <h3>Event Details</h3>
                    <button class="panel-close" onclick="closeDetailsPanel()">
                        <i data-feather="x"></i>
                    </button>
                </div>
                <div class="panel-content" id="eventDetailsPanelContent">
                    <!-- Event details will be populated here -->
                </div>
            </div>
        </div>
    `;

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Update timeline display
    updateTimelineStats();
    renderTimelineVisualization();
    renderTimelineEventsList();
}

/**
 * Process timeline data from analysis
 */
function processTimelineData(data) {
    const events = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];
    const forensics = data.forensics || data.Forensics || {};
    const timeline = forensics.timeline || [];

    // Combine security events and forensic timeline
    let allEvents = [];

    // Process security events
    events.forEach((event, index) => {
        allEvents.push({
            id: `event_${index}`,
            timestamp: new Date(event.timestamp || event.Timestamp || Date.now()),
            title: event.type || event.Type || 'Security Event',
            description: event.description || event.Description || 'No description available',
            severity: (event.severity || event.Severity || 'low').toLowerCase(),
            type: 'security',
            source: event.source || event.Source || 'Unknown',
            user: event.user || event.User || 'Unknown',
            details: event
        });
    });

    // Process forensic timeline events
    timeline.forEach((event, index) => {
        allEvents.push({
            id: `forensic_${index}`,
            timestamp: new Date(event.timestamp || event.Timestamp || Date.now()),
            title: event.event || event.Event || 'Forensic Event',
            description: event.description || event.Description || 'Forensic timeline event',
            severity: event.importance === 'high' ? 'high' : 'medium',
            type: 'forensic',
            source: 'Forensic Analysis',
            user: 'System',
            details: event
        });
    });

    // Sort by timestamp
    allEvents.sort((a, b) => a.timestamp - b.timestamp);

    // Add sequence numbers and time gaps
    allEvents.forEach((event, index) => {
        event.sequence = index + 1;
        if (index > 0) {
            const prevEvent = allEvents[index - 1];
            event.timeSincePrevious = event.timestamp - prevEvent.timestamp;
        } else {
            event.timeSincePrevious = 0;
        }
    });

    return allEvents;
}

/**
 * Setup timeline event listeners
 */
function setupTimelineEventListeners() {
    // View mode buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.getAttribute('data-view');
            renderTimelineVisualization();
        });
    });

    // Time range filter
    const timeRangeSelect = document.getElementById('timelineTimeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', () => {
            selectedTimeRange = timeRangeSelect.value;
            applyTimelineFilters();
        });
    }

    // Event types filter
    const eventTypesSelect = document.getElementById('timelineEventTypes');
    if (eventTypesSelect) {
        eventTypesSelect.addEventListener('change', () => {
            selectedEventTypes = Array.from(eventTypesSelect.selectedOptions).map(option => option.value);
            applyTimelineFilters();
        });
    }

    // Zoom slider
    const zoomSlider = document.getElementById('timelineZoom');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            zoomLevel = parseInt(zoomSlider.value);
            document.querySelector('.zoom-value').textContent = `${zoomLevel}x`;
            renderTimelineVisualization();
        });
    }

    // Reset filters
    const resetBtn = document.getElementById('resetTimelineFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimelineFilters);
    }

    // Export timeline
    const exportBtn = document.getElementById('exportTimelineBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTimeline);
    }

    // Generate report
    const reportBtn = document.getElementById('generateTimelineReportBtn');
    if (reportBtn) {
        reportBtn.addEventListener('click', generateTimelineReport);
    }

    // Refresh timeline
    const refreshBtn = document.getElementById('refreshTimelineBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshTimeline);
    }

    // Expand/collapse all events
    const expandAllBtn = document.getElementById('expandAllEvents');
    const collapseAllBtn = document.getElementById('collapseAllEvents');

    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => toggleAllEvents(true));
    }
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => toggleAllEvents(false));
    }
}

/**
 * Apply timeline filters
 */
function applyTimelineFilters() {
    filteredTimelineData = [...timelineData];

    // Apply time range filter
    if (selectedTimeRange !== 'all') {
        const now = new Date();
        let cutoffTime;

        switch (selectedTimeRange) {
            case '1h':
                cutoffTime = new Date(now.getTime() - (60 * 60 * 1000));
                break;
            case '6h':
                cutoffTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
                break;
            case '24h':
                cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                break;
            case '7d':
                cutoffTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                break;
            case '30d':
                cutoffTime = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                break;
        }

        if (cutoffTime) {
            filteredTimelineData = filteredTimelineData.filter(event => event.timestamp >= cutoffTime);
        }
    }

    // Apply event types filter
    if (selectedEventTypes.length > 0) {
        filteredTimelineData = filteredTimelineData.filter(event =>
            selectedEventTypes.includes(event.title) || selectedEventTypes.includes(event.type)
        );
    }

    // Update display
    updateTimelineStats();
    renderTimelineVisualization();
    renderTimelineEventsList();
}

/**
 * Reset timeline filters
 */
function resetTimelineFilters() {
    selectedTimeRange = 'all';
    selectedEventTypes = getUniqueEventTypes();
    zoomLevel = 1;

    // Reset UI controls
    const timeRangeSelect = document.getElementById('timelineTimeRange');
    const eventTypesSelect = document.getElementById('timelineEventTypes');
    const zoomSlider = document.getElementById('timelineZoom');

    if (timeRangeSelect) timeRangeSelect.value = 'all';
    if (zoomSlider) {
        zoomSlider.value = '1';
        document.querySelector('.zoom-value').textContent = '1x';
    }
    if (eventTypesSelect) {
        Array.from(eventTypesSelect.options).forEach(option => option.selected = true);
    }

    applyTimelineFilters();
}

/**
 * Update timeline statistics
 */
function updateTimelineStats() {
    const statsContainer = document.getElementById('timelineStats');
    if (!statsContainer) return;

    const total = filteredTimelineData.length;
    const critical = filteredTimelineData.filter(e => e.severity === 'critical').length;
    const high = filteredTimelineData.filter(e => e.severity === 'high').length;
    const medium = filteredTimelineData.filter(e => e.severity === 'medium').length;
    const low = filteredTimelineData.filter(e => e.severity === 'low').length;

    const securityEvents = filteredTimelineData.filter(e => e.type === 'security').length;
    const forensicEvents = filteredTimelineData.filter(e => e.type === 'forensic').length;

    statsContainer.innerHTML = `
        <div class="timeline-stats-grid">
            <div class="stat-card">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total Events</div>
            </div>
            <div class="stat-card critical">
                <div class="stat-value">${critical}</div>
                <div class="stat-label">Critical</div>
            </div>
            <div class="stat-card high">
                <div class="stat-value">${high}</div>
                <div class="stat-label">High</div>
            </div>
            <div class="stat-card medium">
                <div class="stat-value">${medium}</div>
                <div class="stat-label">Medium</div>
            </div>
            <div class="stat-card low">
                <div class="stat-value">${low}</div>
                <div class="stat-label">Low</div>
            </div>
            <div class="stat-card info">
                <div class="stat-value">${securityEvents}</div>
                <div class="stat-label">Security Events</div>
            </div>
            <div class="stat-card info">
                <div class="stat-value">${forensicEvents}</div>
                <div class="stat-label">Forensic Events</div>
            </div>
        </div>
    `;

    // Update events count
    const eventsCount = document.getElementById('timelineEventsCount');
    if (eventsCount) {
        eventsCount.textContent = `${total} events`;
    }
}

/**
 * Render timeline visualization
 */
function renderTimelineVisualization() {
    const container = document.getElementById('timelineVisualization');
    if (!container) return;

    if (filteredTimelineData.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <i data-feather="clock" width="48" height="48"></i>
                <p>No timeline events to display</p>
            </div>
        `;
        return;
    }

    switch (currentView) {
        case 'detailed':
            renderDetailedTimeline(container);
            break;
        case 'compact':
            renderCompactTimeline(container);
            break;
        case 'heatmap':
            renderHeatmapTimeline(container);
            break;
        default:
            renderDetailedTimeline(container);
    }

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Render detailed timeline view
 */
function renderDetailedTimeline(container) {
    const timelineHtml = `
        <div class="detailed-timeline">
            <div class="timeline-axis">
                ${filteredTimelineData.map((event, index) => `
                    <div class="timeline-event ${event.severity} ${event.type}" 
                         data-event-id="${event.id}"
                         onclick="showEventDetails('${event.id}')">
                        <div class="timeline-marker">
                            <div class="marker-dot"></div>
                            <div class="marker-line ${index === filteredTimelineData.length - 1 ? 'last' : ''}"></div>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <div class="timeline-title">${event.title}</div>
                                <div class="timeline-timestamp">${formatTimestamp(event.timestamp)}</div>
                            </div>
                            <div class="timeline-body">
                                <div class="timeline-description">${truncateText(event.description, 150)}</div>
                                <div class="timeline-meta">
                                    <span class="severity-badge ${event.severity}">
                                        <i data-feather="${getSeverityIcon(event.severity)}" width="12" height="12"></i>
                                        ${event.severity.toUpperCase()}
                                    </span>
                                    <span class="event-source">Source: ${event.source}</span>
                                    ${event.user !== 'Unknown' ? `<span class="event-user">User: ${event.user}</span>` : ''}
                                </div>
                            </div>
                            <div class="timeline-actions">
                                <button class="btn-sm" onclick="event.stopPropagation(); showEventDetails('${event.id}')">
                                    <i data-feather="eye" width="12" height="12"></i> Details
                                </button>
                                <button class="btn-sm" onclick="event.stopPropagation(); createCaseFromTimelineEvent('${event.id}')">
                                    <i data-feather="folder-plus" width="12" height="12"></i> Create Case
                                </button>
                                <button class="btn-sm" onclick="event.stopPropagation(); exportTimelineEvent('${event.id}')">
                                    <i data-feather="download" width="12" height="12"></i> Export
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = timelineHtml;
}

/**
 * Render compact timeline view
 */
function renderCompactTimeline(container) {
    const timelineHtml = `
        <div class="compact-timeline">
            <div class="timeline-scale">
                ${generateTimeScale()}
            </div>
            <div class="timeline-bars">
                ${filteredTimelineData.map(event => `
                    <div class="timeline-bar ${event.severity}" 
                         data-event-id="${event.id}"
                         title="${event.title} - ${formatTimestamp(event.timestamp)}"
                         onclick="showEventDetails('${event.id}')">
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = timelineHtml;
}

/**
 * Render heatmap timeline view
 */
function renderHeatmapTimeline(container) {
    const heatmapData = generateHeatmapData();

    const heatmapHtml = `
        <div class="heatmap-timeline">
            <div class="heatmap-header">
                <h4>Activity Heatmap - Last 24 Hours</h4>
            </div>
            <div class="heatmap-grid">
                ${heatmapData.map((hourData, hour) => `
                    <div class="heatmap-cell ${getHeatmapIntensity(hourData.count)}" 
                         title="${hourData.count} events at ${hour}:00"
                         onclick="showHourDetails('${hourData.timestamp}')">
                        <div class="heatmap-hour">${hour}</div>
                        <div class="heatmap-count">${hourData.count}</div>
                    </div>
                `).join('')}
            </div>
            <div class="heatmap-legend">
                <span>Less</span>
                <div class="legend-scale">
                    <div class="legend-cell intensity-0"></div>
                    <div class="legend-cell intensity-1"></div>
                    <div class="legend-cell intensity-2"></div>
                    <div class="legend-cell intensity-3"></div>
                    <div class="legend-cell intensity-4"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    `;

    container.innerHTML = heatmapHtml;
}

/**
 * Render timeline events list
 */
function renderTimelineEventsList() {
    const container = document.getElementById('timelineEventsList');
    if (!container) return;

    if (filteredTimelineData.length === 0) {
        container.innerHTML = `
            <div class="no-events">
                <i data-feather="clock" width="32" height="32"></i>
                <p>No timeline events match your current filters</p>
                <button class="btn btn-outline" onclick="resetTimelineFilters()">Reset Filters</button>
            </div>
        `;
        return;
    }

    const eventsHtml = filteredTimelineData.map(event => `
        <div class="timeline-event-item ${event.severity}" data-event-id="${event.id}">
            <div class="event-item-header" onclick="toggleEventExpansion('${event.id}')">
                <div class="event-item-main">
                    <div class="event-item-title">${event.title}</div>
                    <div class="event-item-timestamp">${formatTimestamp(event.timestamp)}</div>
                </div>
                <div class="event-item-meta">
                    <span class="severity-badge ${event.severity}">
                        ${event.severity.toUpperCase()}
                    </span>
                    <button class="expand-btn">
                        <i data-feather="chevron-down" width="16" height="16"></i>
                    </button>
                </div>
            </div>
            <div class="event-item-details" style="display: none;">
                <div class="event-detail-content">
                    <p><strong>Description:</strong> ${event.description}</p>
                    <p><strong>Source:</strong> ${event.source}</p>
                    <p><strong>User:</strong> ${event.user}</p>
                    <p><strong>Type:</strong> ${event.type}</p>
                    ${event.timeSincePrevious > 0 ? `
                        <p><strong>Time since previous:</strong> ${formatDuration(event.timeSincePrevious)}</p>
                    ` : ''}
                </div>
                <div class="event-detail-actions">
                    <button class="btn btn-sm" onclick="showEventDetails('${event.id}')">
                        <i data-feather="eye" width="14" height="14"></i> Full Details
                    </button>
                    <button class="btn btn-sm" onclick="createCaseFromTimelineEvent('${event.id}')">
                        <i data-feather="folder-plus" width="14" height="14"></i> Create Case
                    </button>
                    <button class="btn btn-sm" onclick="exportTimelineEvent('${event.id}')">
                        <i data-feather="download" width="14" height="14"></i> Export
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = eventsHtml;

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Export timeline to CSV
 */
function exportTimeline() {
    try {
        const csvData = convertTimelineToCSV(filteredTimelineData);
        downloadCSV(csvData, `secunik-timeline-${Date.now()}.csv`);
        dashboard?.showNotification('Timeline exported successfully', 'success');
    } catch (error) {
        console.error('Timeline export failed:', error);
        dashboard?.showNotification('Failed to export timeline', 'error');
    }
}

/**
 * Generate timeline report
 */
function generateTimelineReport() {
    const reportData = {
        summary: {
            totalEvents: filteredTimelineData.length,
            timeSpan: getTimeSpan(),
            criticalEvents: filteredTimelineData.filter(e => e.severity === 'critical').length,
            highEvents: filteredTimelineData.filter(e => e.severity === 'high').length
        },
        events: filteredTimelineData
    };

    // Create and download report
    const reportContent = generateReportContent(reportData);
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secunik-timeline-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dashboard?.showNotification('Timeline report generated', 'success');
}

/**
 * Refresh timeline
 */
function refreshTimeline() {
    if (dashboard?.state.currentAnalysis) {
        render(dashboard.state.currentAnalysis);
        dashboard?.showNotification('Timeline refreshed', 'success');
    }
}

// Helper functions

function getUniqueEventTypes() {
    const types = [...new Set(timelineData.map(e => e.title))];
    return types.filter(type => type && type !== 'Unknown Event').sort();
}

function getTimeSpan() {
    if (filteredTimelineData.length === 0) return 'No data';

    const timestamps = filteredTimelineData.map(e => e.timestamp).sort((a, b) => a - b);
    const start = timestamps[0];
    const end = timestamps[timestamps.length - 1];

    const duration = end - start;
    return formatDuration(duration);
}

function getSeverityIcon(severity) {
    const icons = {
        'critical': 'alert-triangle',
        'high': 'alert-circle',
        'medium': 'info',
        'low': 'check-circle'
    };
    return icons[severity.toLowerCase()] || 'help-circle';
}

function formatTimestamp(timestamp) {
    try {
        return new Date(timestamp).toLocaleString();
    } catch {
        return 'Unknown time';
    }
}

function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function generateTimeScale() {
    if (filteredTimelineData.length === 0) return '';

    const timestamps = filteredTimelineData.map(e => e.timestamp).sort((a, b) => a - b);
    const start = timestamps[0];
    const end = timestamps[timestamps.length - 1];
    const duration = end - start;

    // Generate scale marks
    const scaleMarks = [];
    const numMarks = 10;

    for (let i = 0; i <= numMarks; i++) {
        const time = new Date(start.getTime() + (duration * i / numMarks));
        scaleMarks.push(`
            <div class="scale-mark">
                <div class="scale-line"></div>
                <div class="scale-label">${time.toLocaleTimeString()}</div>
            </div>
        `);
    }

    return scaleMarks.join('');
}

function generateHeatmapData() {
    const heatmapData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: 0,
        timestamp: new Date().setHours(hour, 0, 0, 0)
    }));

    const now = new Date();
    const last24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    filteredTimelineData.forEach(event => {
        if (event.timestamp >= last24h) {
            const hour = event.timestamp.getHours();
            heatmapData[hour].count++;
        }
    });

    return heatmapData;
}

function getHeatmapIntensity(count) {
    if (count === 0) return 'intensity-0';
    if (count <= 2) return 'intensity-1';
    if (count <= 5) return 'intensity-2';
    if (count <= 10) return 'intensity-3';
    return 'intensity-4';
}

function convertTimelineToCSV(events) {
    const headers = ['Timestamp', 'Title', 'Description', 'Severity', 'Type', 'Source', 'User'];
    const rows = events.map(event => [
        formatTimestamp(event.timestamp),
        event.title,
        event.description,
        event.severity,
        event.type,
        event.source,
        event.user
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    return csvContent;
}

function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateReportContent(data) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SecuNik Timeline Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; margin-bottom: 20px; }
                .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
                .event { border-left: 4px solid #ddd; padding: 10px; margin: 10px 0; }
                .critical { border-color: #ef4444; }
                .high { border-color: #f59e0b; }
                .medium { border-color: #3b82f6; }
                .low { border-color: #10b981; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>SecuNik Timeline Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary">
                <h2>Summary</h2>
                <p>Total Events: ${data.summary.totalEvents}</p>
                <p>Time Span: ${data.summary.timeSpan}</p>
                <p>Critical Events: ${data.summary.criticalEvents}</p>
                <p>High Priority Events: ${data.summary.highEvents}</p>
            </div>
            
            <div class="events">
                <h2>Timeline Events</h2>
                ${data.events.map(event => `
                    <div class="event ${event.severity}">
                        <h3>${event.title}</h3>
                        <p><strong>Time:</strong> ${formatTimestamp(event.timestamp)}</p>
                        <p><strong>Severity:</strong> ${event.severity.toUpperCase()}</p>
                        <p><strong>Description:</strong> ${event.description}</p>
                        <p><strong>Source:</strong> ${event.source}</p>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;
}

function toggleAllEvents(expand) {
    const eventItems = document.querySelectorAll('.timeline-event-item');
    eventItems.forEach(item => {
        const details = item.querySelector('.event-item-details');
        const expandBtn = item.querySelector('.expand-btn i');

        if (details && expandBtn) {
            details.style.display = expand ? 'block' : 'none';
            expandBtn.setAttribute('data-feather', expand ? 'chevron-up' : 'chevron-down');
        }
    });

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// Global functions for onclick handlers
window.showEventDetails = function (eventId) {
    const event = timelineData.find(e => e.id === eventId);
    if (!event) return;

    const detailsPanel = document.getElementById('eventDetailsPanel');
    const content = document.getElementById('eventDetailsPanelContent');

    if (!detailsPanel || !content) return;

    content.innerHTML = `
        <div class="event-full-details">
            <div class="detail-section">
                <h4>Basic Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Event ID:</label>
                        <span>${event.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Sequence:</label>
                        <span>#${event.sequence}</span>
                    </div>
                    <div class="detail-item">
                        <label>Timestamp:</label>
                        <span>${formatTimestamp(event.timestamp)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Severity:</label>
                        <span class="severity-badge ${event.severity}">${event.severity.toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <label>Type:</label>
                        <span>${event.type}</span>
                    </div>
                    <div class="detail-item">
                        <label>Source:</label>
                        <span>${event.source}</span>
                    </div>
                    <div class="detail-item">
                        <label>User:</label>
                        <span>${event.user}</span>
                    </div>
                    ${event.timeSincePrevious > 0 ? `
                        <div class="detail-item">
                            <label>Time since previous:</label>
                            <span>${formatDuration(event.timeSincePrevious)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Description</h4>
                <p>${event.description}</p>
            </div>
            
            ${Object.keys(event.details).length > 0 ? `
                <div class="detail-section">
                    <h4>Raw Event Data</h4>
                    <pre class="details-json">${JSON.stringify(event.details, null, 2)}</pre>
                </div>
            ` : ''}
            
            <div class="detail-actions">
                <button class="btn btn-primary" onclick="createCaseFromTimelineEvent('${event.id}')">
                    <i data-feather="folder-plus"></i> Create Case
                </button>
                <button class="btn btn-secondary" onclick="exportTimelineEvent('${event.id}')">
                    <i data-feather="download"></i> Export Event
                </button>
            </div>
        </div>
    `;

    detailsPanel.style.display = 'block';
};

window.showHourDetails = function (hourTime) {
    const hour = new Date(hourTime);
    const hourEvents = filteredTimelineData.filter(event => {
        const eventHour = new Date(event.timestamp);
        eventHour.setMinutes(0, 0, 0);
        return eventHour.getTime() === hour.getTime();
    });

    dashboard?.showNotification(`${hourEvents.length} events at ${hour.toLocaleString()}`, 'info');
};

window.createCaseFromTimelineEvent = function (eventId) {
    const event = filteredTimelineData.find(e => e.id === eventId);
    if (!event) return;

    dashboard?.switchToTab('caseManagement');

    setTimeout(() => {
        const titleField = document.getElementById('caseTitle');
        const severityField = document.getElementById('caseSeverity');
        const descriptionField = document.getElementById('caseDescription');

        if (titleField) {
            titleField.value = `Timeline Event: ${event.title}`;
        }

        if (severityField) {
            severityField.value = event.severity;
        }

        if (descriptionField) {
            descriptionField.value = `Case created from timeline event.\n\nEvent: ${event.title}\nTime: ${formatTimestamp(event.timestamp)}\nDescription: ${event.description}`;
        }
    }, 100);
};

window.exportTimelineEvent = function (eventId) {
    const event = filteredTimelineData.find(e => e.id === eventId);
    if (!event) return;

    try {
        const csvData = convertTimelineToCSV([event]);
        downloadCSV(csvData, `secunik-timeline-event-${Date.now()}.csv`);
        dashboard?.showNotification('Event exported successfully', 'success');
    } catch (error) {
        console.error('Event export failed:', error);
        dashboard?.showNotification('Failed to export event', 'error');
    }
};

window.toggleEventExpansion = function (eventId) {
    const eventItem = document.querySelector(`[data-event-id="${eventId}"]`);
    if (!eventItem) return;

    const details = eventItem.querySelector('.event-item-details');
    const expandBtn = eventItem.querySelector('.expand-btn i');

    if (details && expandBtn) {
        const isExpanded = details.style.display === 'block';
        details.style.display = isExpanded ? 'none' : 'block';
        expandBtn.setAttribute('data-feather', isExpanded ? 'chevron-down' : 'chevron-up');

        // Re-initialize Feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
};

function closeDetailsPanel() {
    const detailsPanel = document.getElementById('eventDetailsPanel');
    if (detailsPanel) {
        detailsPanel.style.display = 'none';
    }
}

window.resetTimelineFilters = resetTimelineFilters;

// Export functions
export { init, render };
