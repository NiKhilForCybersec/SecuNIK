let dashboard = null;
let timelineData = [];
let filteredTimelineData = [];
let selectedTimeRange = 'all';
let selectedEventTypes = [];
let zoomLevel = 1;
let timelineChart = null;
let currentView = 'detailed'; // detailed, compact, heatmap

export function init(dashboardInstance) {
    dashboard = dashboardInstance;
    console.log('✅ Timeline tab initialized');
}

export function render(analysis) {
    const timelineTab = document.getElementById('timelineTab');
    if (!timelineTab) return;

    // Extract and process timeline data
    const data = analysis?.result || analysis;
    timelineData = processTimelineData(data);
    filteredTimelineData = [...timelineData];

    // Initialize filters
    selectedEventTypes = getUniqueEventTypes();

    timelineTab.innerHTML = `
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
        
        <div class="section-content">
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
                    <label for="timeRangeSelect">Time Range:</label>
                    <select id="timeRangeSelect" class="form-control">
                        <option value="all">All Time</option>
                        <option value="1h">Last Hour</option>
                        <option value="6h">Last 6 Hours</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                
                <div class="control-group" id="customRangeGroup" style="display: none;">
                    <label>Custom Range:</label>
                    <input type="datetime-local" id="startTime" class="form-control">
                    <span>to</span>
                    <input type="datetime-local" id="endTime" class="form-control">
                </div>
                
                <div class="control-group">
                    <label>Event Types:</label>
                    <div class="event-type-checkboxes">
                        ${getUniqueEventTypes().map(type => `
                            <label class="checkbox-label">
                                <input type="checkbox" value="${type}" checked> ${type}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="control-group">
                    <label for="severityFilter">Minimum Severity:</label>
                    <select id="severityFilter" class="form-control">
                        <option value="all">All Severities</option>
                        <option value="low">Low and above</option>
                        <option value="medium">Medium and above</option>
                        <option value="high">High and above</option>
                        <option value="critical">Critical only</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label for="timelineSearch">Search:</label>
                    <input type="text" id="timelineSearch" placeholder="Search events..." class="form-control">
                </div>
                
                <button class="btn btn-secondary" id="clearTimelineFiltersBtn">
                    <i data-feather="x"></i> Clear Filters
                </button>
            </div>
            
            <!-- Timeline Statistics -->
            <div class="timeline-stats">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon critical">
                            <i data-feather="alert-octagon"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${getSeverityCount('critical')}</div>
                            <div class="stat-label">Critical Events</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon high">
                            <i data-feather="alert-triangle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${getSeverityCount('high')}</div>
                            <div class="stat-label">High Priority</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i data-feather="activity"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${getEventDensity()}</div>
                            <div class="stat-label">Events/Hour</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i data-feather="clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${getAverageInterval()}</div>
                            <div class="stat-label">Avg Interval</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Timeline Visualization -->
            <div class="timeline-visualization">
                <div class="timeline-header">
                    <h3>Event Timeline</h3>
                    <div class="timeline-zoom">
                        <button class="zoom-btn" id="zoomOutBtn">
                            <i data-feather="zoom-out"></i>
                        </button>
                        <span class="zoom-level">${Math.round(zoomLevel * 100)}%</span>
                        <button class="zoom-btn" id="zoomInBtn">
                            <i data-feather="zoom-in"></i>
                        </button>
                        <button class="zoom-btn" id="resetZoomBtn">
                            <i data-feather="maximize"></i>
                        </button>
                    </div>
                </div>
                
                <div class="timeline-container" id="timelineContainer">
                    <div class="timeline-content" id="timelineContent">
                        ${renderTimelineView()}
                    </div>
                </div>
            </div>
            
            <!-- Timeline Legend -->
            <div class="timeline-legend">
                <h4>Legend</h4>
                <div class="legend-items">
                    <div class="legend-item">
                        <span class="legend-color critical"></span>
                        <span class="legend-label">Critical Events</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color high"></span>
                        <span class="legend-label">High Priority</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color medium"></span>
                        <span class="legend-label">Medium Priority</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color low"></span>
                        <span class="legend-label">Low Priority</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color info"></span>
                        <span class="legend-label">Information</span>
                    </div>
                </div>
            </div>
            
            <!-- Timeline Analysis -->
            <div class="timeline-analysis">
                <div class="analysis-grid">
                    <!-- Pattern Analysis -->
                    <div class="analysis-widget">
                        <div class="widget-header">
                            <h3><i data-feather="trending-up"></i> Pattern Analysis</h3>
                        </div>
                        <div class="widget-content">
                            ${renderPatternAnalysis()}
                        </div>
                    </div>
                    
                    <!-- Event Correlation -->
                    <div class="analysis-widget">
                        <div class="widget-header">
                            <h3><i data-feather="git-merge"></i> Event Correlations</h3>
                        </div>
                        <div class="widget-content">
                            ${renderEventCorrelations()}
                        </div>
                    </div>
                    
                    <!-- Anomaly Detection -->
                    <div class="analysis-widget">
                        <div class="widget-header">
                            <h3><i data-feather="alert-circle"></i> Anomaly Detection</h3>
                        </div>
                        <div class="widget-content">
                            ${renderAnomalyDetection()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Event Details Panel -->
            <div class="event-details-panel" id="eventDetailsPanel" style="display: none;">
                <div class="panel-header">
                    <h3>Event Details</h3>
                    <button class="panel-close" id="closeDetailsPanelBtn">
                        <i data-feather="x"></i>
                    </button>
                </div>
                <div class="panel-content" id="eventDetailsPanelContent">
                    <!-- Event details will be populated here -->
                </div>
            </div>
        </div>
    `;

    // Initialize event listeners
    setupTimelineEventListeners();

    // Apply initial filters
    applyTimelineFilters();

    // Replace feather icons
    feather.replace();

    console.log(`✅ Timeline tab rendered with ${timelineData.length} events`);
}

function setupTimelineEventListeners() {
    // Export and report buttons
    const exportBtn = document.getElementById('exportTimelineBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTimeline);
    }

    const generateReportBtn = document.getElementById('generateTimelineReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateTimelineReport);
    }

    const refreshBtn = document.getElementById('refreshTimelineBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (dashboard?.state?.currentAnalysis) {
                render(dashboard.state.currentAnalysis);
            }
        });
    }

    // View mode buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.closest('.view-btn').getAttribute('data-view');
            switchTimelineView(view);
        });
    });

    // Time range selector
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', handleTimeRangeChange);
    }

    // Custom range inputs
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    if (startTimeInput && endTimeInput) {
        startTimeInput.addEventListener('change', applyTimelineFilters);
        endTimeInput.addEventListener('change', applyTimelineFilters);
    }

    // Event type checkboxes
    const eventTypeCheckboxes = document.querySelectorAll('.event-type-checkboxes input[type="checkbox"]');
    eventTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleEventTypeFilter);
    });

    // Severity filter
    const severityFilter = document.getElementById('severityFilter');
    if (severityFilter) {
        severityFilter.addEventListener('change', applyTimelineFilters);
    }

    // Search input
    const searchInput = document.getElementById('timelineSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyTimelineFilters, 300));
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clearTimelineFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearTimelineFilters);
    }

    // Zoom controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => adjustZoom(1.25));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => adjustZoom(0.8));
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', () => resetZoom());

    // Close details panel
    const closeDetailsPanelBtn = document.getElementById('closeDetailsPanelBtn');
    if (closeDetailsPanelBtn) {
        closeDetailsPanelBtn.addEventListener('click', closeDetailsPanel);
    }
}

function processTimelineData(data) {
    const events = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];
    const iocs = data.technical?.detectedIOCs || data.Technical?.DetectedIOCs || [];

    const timeline = [];

    // Process security events
    events.forEach((event, index) => {
        timeline.push({
            id: `event-${index}`,
            type: 'security_event',
            timestamp: new Date(event.timestamp || event.Timestamp || Date.now()),
            title: event.eventType || event.EventType || 'Security Event',
            description: event.description || event.Description || '',
            severity: (event.severity || event.Severity || 'low').toLowerCase(),
            source: event.source || event.Source || 'Unknown',
            details: event.details || event.Details || {},
            category: 'Security',
            originalData: event
        });
    });

    // Process IOCs as timeline events
    iocs.forEach((ioc, index) => {
        // Simulate detection time for IOCs (would be real in production)
        const detectionTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);

        timeline.push({
            id: `ioc-${index}`,
            type: 'ioc_detection',
            timestamp: detectionTime,
            title: `IOC Detected: ${ioc.category || ioc.Category || 'Unknown'}`,
            description: `${ioc.value || ioc.Value || ''} - ${ioc.description || ioc.Description || ''}`,
            severity: (ioc.severity || ioc.Severity || 'medium').toLowerCase(),
            source: ioc.source || ioc.Source || 'IOC Engine',
            details: {
                value: ioc.value || ioc.Value,
                confidence: ioc.confidence || ioc.Confidence,
                threatType: ioc.threatType || ioc.ThreatType
            },
            category: 'IOC',
            originalData: ioc
        });
    });

    // Add system events (simulated)
    const systemEvents = generateSystemEvents();
    timeline.push(...systemEvents);

    // Sort by timestamp
    return timeline.sort((a, b) => a.timestamp - b.timestamp);
}

function generateSystemEvents() {
    const events = [];
    const eventTypes = ['System Start', 'Service Start', 'Login Attempt', 'File Access', 'Network Connection'];
    const now = new Date();

    // Generate some system events for demonstration
    for (let i = 0; i < 20; i++) {
        const eventTime = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        events.push({
            id: `system-${i}`,
            type: 'system_event',
            timestamp: eventTime,
            title: eventType,
            description: `System event: ${eventType}`,
            severity: Math.random() > 0.8 ? 'medium' : 'low',
            source: 'System',
            details: { eventId: 1000 + i },
            category: 'System',
            originalData: { synthetic: true }
        });
    }

    return events;
}

function handleTimeRangeChange(e) {
    selectedTimeRange = e.target.value;
    const customRangeGroup = document.getElementById('customRangeGroup');

    if (selectedTimeRange === 'custom') {
        customRangeGroup.style.display = 'flex';
        setDefaultCustomRange();
    } else {
        customRangeGroup.style.display = 'none';
    }

    applyTimelineFilters();
}

function setDefaultCustomRange() {
    const endTime = new Date();
    const startTime = new Date(endTime - 24 * 60 * 60 * 1000); // 24 hours ago

    const startInput = document.getElementById('startTime');
    const endInput = document.getElementById('endTime');

    if (startInput && endInput) {
        startInput.value = formatDateTimeLocal(startTime);
        endInput.value = formatDateTimeLocal(endTime);
    }
}

function handleEventTypeFilter() {
    const checkboxes = document.querySelectorAll('.event-type-checkboxes input[type="checkbox"]');
    selectedEventTypes = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    applyTimelineFilters();
}

function applyTimelineFilters() {
    const searchTerm = document.getElementById('timelineSearch')?.value.toLowerCase() || '';
    const severityFilter = document.getElementById('severityFilter')?.value || 'all';

    filteredTimelineData = timelineData.filter(event => {
        // Time range filter
        if (!isInTimeRange(event.timestamp)) {
            return false;
        }

        // Event type filter
        if (!selectedEventTypes.includes(event.category)) {
            return false;
        }

        // Severity filter
        if (!passesSeverityFilter(event.severity, severityFilter)) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const searchableText = [
                event.title,
                event.description,
                event.source,
                event.category
            ].join(' ').toLowerCase();

            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    updateTimelineView();
    updateTimelineStats();
}

function isInTimeRange(timestamp) {
    const now = new Date();

    switch (selectedTimeRange) {
        case 'all':
            return true;
        case '1h':
            return now - timestamp <= 60 * 60 * 1000;
        case '6h':
            return now - timestamp <= 6 * 60 * 60 * 1000;
        case '24h':
            return now - timestamp <= 24 * 60 * 60 * 1000;
        case '7d':
            return now - timestamp <= 7 * 24 * 60 * 60 * 1000;
        case '30d':
            return now - timestamp <= 30 * 24 * 60 * 60 * 1000;
        case 'custom':
            const startInput = document.getElementById('startTime');
            const endInput = document.getElementById('endTime');
            if (startInput && endInput && startInput.value && endInput.value) {
                const startTime = new Date(startInput.value);
                const endTime = new Date(endInput.value);
                return timestamp >= startTime && timestamp <= endTime;
            }
            return true;
        default:
            return true;
    }
}

function passesSeverityFilter(eventSeverity, filter) {
    if (filter === 'all') return true;

    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const eventLevel = severityLevels[eventSeverity] || 1;
    const filterLevel = severityLevels[filter] || 1;

    return eventLevel >= filterLevel;
}

function switchTimelineView(view) {
    currentView = view;

    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        }
    });

    updateTimelineView();
}

function updateTimelineView() {
    const timelineContent = document.getElementById('timelineContent');
    if (timelineContent) {
        timelineContent.innerHTML = renderTimelineView();

        // Re-attach event listeners for timeline items
        attachTimelineItemListeners();
    }

    updateZoomDisplay();
}

function renderTimelineView() {
    switch (currentView) {
        case 'detailed':
            return renderDetailedTimeline();
        case 'compact':
            return renderCompactTimeline();
        case 'heatmap':
            return renderHeatmapTimeline();
        default:
            return renderDetailedTimeline();
    }
}

function renderDetailedTimeline() {
    if (filteredTimelineData.length === 0) {
        return `
            <div class="timeline-empty">
                <i data-feather="clock"></i>
                <h3>No events found</h3>
                <p>Try adjusting your filters to see timeline events</p>
            </div>
        `;
    }

    const timelineHTML = filteredTimelineData.map((event, index) => {
        const relativeTime = getRelativeTime(event.timestamp);
        const absoluteTime = formatAbsoluteTime(event.timestamp);

        return `
            <div class="timeline-item ${event.severity}" data-event-id="${event.id}" onclick="showEventDetails('${event.id}')">
                <div class="timeline-marker">
                    <div class="marker-dot ${event.severity}"></div>
                    <div class="marker-line"></div>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4 class="event-title">${event.title}</h4>
                        <div class="event-meta">
                            <span class="event-time" title="${absoluteTime}">${relativeTime}</span>
                            <span class="event-severity ${event.severity}">${event.severity.toUpperCase()}</span>
                            <span class="event-category">${event.category}</span>
                        </div>
                    </div>
                    <div class="timeline-body">
                        <p class="event-description">${event.description}</p>
                        <div class="event-source">
                            <i data-feather="server"></i>
                            <span>Source: ${event.source}</span>
                        </div>
                    </div>
                    <div class="timeline-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); createCaseFromTimelineEvent('${event.id}')" title="Create Case">
                            <i data-feather="folder-plus"></i>
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); exportTimelineEvent('${event.id}')" title="Export Event">
                            <i data-feather="download"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `<div class="timeline-detailed" style="zoom: ${zoomLevel}">${timelineHTML}</div>`;
}

function renderCompactTimeline() {
    if (filteredTimelineData.length === 0) {
        return '<div class="timeline-empty">No events to display</div>';
    }

    const compactHTML = filteredTimelineData.map(event => {
        return `
            <div class="timeline-compact-item ${event.severity}" data-event-id="${event.id}" onclick="showEventDetails('${event.id}')">
                <div class="compact-marker ${event.severity}"></div>
                <div class="compact-content">
                    <span class="compact-time">${formatCompactTime(event.timestamp)}</span>
                    <span class="compact-title">${event.title}</span>
                    <span class="compact-severity ${event.severity}">${event.severity}</span>
                </div>
            </div>
        `;
    }).join('');

    return `<div class="timeline-compact" style="zoom: ${zoomLevel}">${compactHTML}</div>`;
}

function renderHeatmapTimeline() {
    if (filteredTimelineData.length === 0) {
        return '<div class="timeline-empty">No events to display</div>';
    }

    // Group events by hour
    const hourlyGroups = {};
    filteredTimelineData.forEach(event => {
        const hour = new Date(event.timestamp);
        hour.setMinutes(0, 0, 0);
        const hourKey = hour.toISOString();

        if (!hourlyGroups[hourKey]) {
            hourlyGroups[hourKey] = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
        }

        hourlyGroups[hourKey][event.severity]++;
        hourlyGroups[hourKey].total++;
    });

    const sortedGroups = Object.entries(hourlyGroups)
        .sort(([a], [b]) => new Date(a) - new Date(b));

    const maxCount = Math.max(...sortedGroups.map(([, counts]) => counts.total));

    const heatmapHTML = sortedGroups.map(([time, counts]) => {
        const intensity = counts.total / maxCount;
        const date = new Date(time);

        return `
            <div class="heatmap-cell" 
                 style="opacity: ${0.1 + intensity * 0.9}" 
                 data-time="${time}"
                 onclick="showHourDetails('${time}')"
                 title="${date.toLocaleString()}: ${counts.total} events">
                <div class="cell-label">${date.getHours()}:00</div>
                <div class="cell-count">${counts.total}</div>
            </div>
        `;
    }).join('');

    return `<div class="timeline-heatmap" style="zoom: ${zoomLevel}">${heatmapHTML}</div>`;
}

function attachTimelineItemListeners() {
    // Event listeners are attached via onclick attributes for simplicity
    // In a production app, you might want to use event delegation
}

function adjustZoom(factor) {
    zoomLevel = Math.max(0.25, Math.min(3, zoomLevel * factor));
    updateTimelineView();
}

function resetZoom() {
    zoomLevel = 1;
    updateTimelineView();
}

function updateZoomDisplay() {
    const zoomDisplay = document.querySelector('.zoom-level');
    if (zoomDisplay) {
        zoomDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
}

function clearTimelineFilters() {
    // Reset time range
    selectedTimeRange = 'all';
    document.getElementById('timeRangeSelect').value = 'all';

    // Reset custom range
    document.getElementById('customRangeGroup').style.display = 'none';

    // Reset event types
    selectedEventTypes = getUniqueEventTypes();
    document.querySelectorAll('.event-type-checkboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });

    // Reset severity
    document.getElementById('severityFilter').value = 'all';

    // Reset search
    document.getElementById('timelineSearch').value = '';

    applyTimelineFilters();
}

function updateTimelineStats() {
    // Update the stats display
    const criticalCount = document.querySelector('.stat-card .stat-value');
    if (criticalCount) {
        // Stats are rendered in the initial HTML, but could be updated here
    }
}

// Utility functions
function getUniqueEventTypes() {
    const types = new Set();
    timelineData.forEach(event => {
        types.add(event.category);
    });
    return Array.from(types).sort();
}

function getSeverityCount(severity) {
    return filteredTimelineData.filter(event => event.severity === severity).length;
}

function getEventDensity() {
    if (filteredTimelineData.length === 0) return '0';

    const timeSpan = getTimeSpanHours();
    const density = timeSpan > 0 ? filteredTimelineData.length / timeSpan : 0;

    return density.toFixed(1);
}

function getAverageInterval() {
    if (filteredTimelineData.length < 2) return 'N/A';

    const timestamps = filteredTimelineData.map(e => e.timestamp.getTime()).sort();
    const intervals = [];

    for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    return formatDuration(avgInterval);
}

function getTimeSpan() {
    if (timelineData.length === 0) return 'No data';

    const timestamps = timelineData.map(e => e.timestamp).sort();
    const span = timestamps[timestamps.length - 1] - timestamps[0];

    return formatDuration(span);
}

function getTimeSpanHours() {
    if (filteredTimelineData.length === 0) return 0;

    const timestamps = filteredTimelineData.map(e => e.timestamp).sort();
    const span = timestamps[timestamps.length - 1] - timestamps[0];

    return span / (1000 * 60 * 60); // Convert to hours
}

function getRelativeTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
}

function formatAbsoluteTime(timestamp) {
    return timestamp.toLocaleString();
}

function formatCompactTime(timestamp) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Analysis functions
function renderPatternAnalysis() {
    const patterns = analyzePatterns();

    return patterns.map(pattern => `
        <div class="pattern-item">
            <div class="pattern-header">
                <span class="pattern-name">${pattern.name}</span>
                <span class="pattern-confidence ${pattern.confidence >= 0.8 ? 'high' : pattern.confidence >= 0.6 ? 'medium' : 'low'}">
                    ${Math.round(pattern.confidence * 100)}%
                </span>
            </div>
            <div class="pattern-description">${pattern.description}</div>
            <div class="pattern-events">${pattern.eventCount} events match this pattern</div>
        </div>
    `).join('');
}

function renderEventCorrelations() {
    const correlations = findEventCorrelations();

    return correlations.map(correlation => `
        <div class="correlation-item">
            <div class="correlation-header">
                <span class="correlation-type">${correlation.type}</span>
                <span class="correlation-strength">${correlation.strength}</span>
            </div>
            <div class="correlation-description">${correlation.description}</div>
        </div>
    `).join('');
}

function renderAnomalyDetection() {
    const anomalies = detectAnomalies();

    return anomalies.map(anomaly => `
        <div class="anomaly-item ${anomaly.severity}">
            <div class="anomaly-header">
                <span class="anomaly-type">${anomaly.type}</span>
                <span class="anomaly-score">${anomaly.score.toFixed(2)}</span>
            </div>
            <div class="anomaly-description">${anomaly.description}</div>
        </div>
    `).join('');
}

function analyzePatterns() {
    // Simulate pattern analysis
    return [
        {
            name: 'Login Burst Pattern',
            confidence: 0.85,
            description: 'Multiple login attempts in short succession',
            eventCount: 12
        },
        {
            name: 'Service Restart Cycle',
            confidence: 0.72,
            description: 'Regular service restarts detected',
            eventCount: 8
        },
        {
            name: 'Network Spike Pattern',
            confidence: 0.68,
            description: 'Unusual network activity spikes',
            eventCount: 15
        }
    ];
}

function findEventCorrelations() {
    // Simulate correlation analysis
    return [
        {
            type: 'Temporal Correlation',
            strength: 'Strong',
            description: 'Failed logins followed by privilege escalation attempts'
        },
        {
            type: 'Source Correlation',
            strength: 'Medium',
            description: 'Multiple event types from same source IP'
        },
        {
            type: 'Sequence Correlation',
            strength: 'Weak',
            description: 'Service restarts preceding system errors'
        }
    ];
}

function detectAnomalies() {
    // Simulate anomaly detection
    return [
        {
            type: 'Volume Anomaly',
            severity: 'high',
            score: 0.89,
            description: 'Event volume 3x higher than baseline'
        },
        {
            type: 'Timing Anomaly',
            severity: 'medium',
            score: 0.65,
            description: 'Events occurring outside normal hours'
        },
        {
            type: 'Source Anomaly',
            severity: 'low',
            score: 0.45,
            description: 'New event sources detected'
        }
    ];
}

// Export functions
function exportTimeline() {
    if (!dashboard?.state?.currentAnalysis) {
        dashboard?.showNotification('No timeline data to export', 'warning');
        return;
    }

    try {
        const csvData = convertTimelineToCSV(filteredTimelineData);
        downloadCSV(csvData, `secunik-timeline-${Date.now()}.csv`);
        dashboard?.showNotification('Timeline exported successfully', 'success');
    } catch (error) {
        console.error('Timeline export failed:', error);
        dashboard?.showNotification('Failed to export timeline', 'error');
    }
}

function generateTimelineReport() {
    if (!dashboard?.state?.currentAnalysis) {
        dashboard?.showNotification('No timeline data for report', 'warning');
        return;
    }

    try {
        const report = generateTimelineReportData();
        const reportHTML = createTimelineReportHTML(report);
        downloadHTML(reportHTML, `secunik-timeline-report-${Date.now()}.html`);
        dashboard?.showNotification('Timeline report generated successfully', 'success');
    } catch (error) {
        console.error('Timeline report generation failed:', error);
        dashboard?.showNotification('Failed to generate timeline report', 'error');
    }
}

function convertTimelineToCSV(events) {
    const headers = ['Timestamp', 'Type', 'Category', 'Title', 'Description', 'Severity', 'Source'];
    const csvRows = [headers.join(',')];

    events.forEach(event => {
        const row = [
            `"${event.timestamp.toISOString()}"`,
            `"${event.type}"`,
            `"${event.category}"`,
            `"${event.title.replace(/"/g, '""')}"`,
            `"${event.description.replace(/"/g, '""')}"`,
            `"${event.severity.toUpperCase()}"`,
            `"${event.source}"`
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

function generateTimelineReportData() {
    return {
        summary: {
            totalEvents: filteredTimelineData.length,
            timeSpan: getTimeSpan(),
            criticalEvents: getSeverityCount('critical'),
            highEvents: getSeverityCount('high'),
            eventDensity: getEventDensity()
        },
        patterns: analyzePatterns(),
        correlations: findEventCorrelations(),
        anomalies: detectAnomalies(),
        events: filteredTimelineData.slice(0, 50) // Top 50 events
    };
}

function createTimelineReportHTML(report) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SecuNik Timeline Analysis Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
                .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
                .section { margin: 20px 0; }
                .event { border-left: 3px solid #ddd; padding: 10px; margin: 10px 0; }
                .critical { border-color: #dc3545; }
                .high { border-color: #fd7e14; }
                .medium { border-color: #ffc107; }
                .low { border-color: #28a745; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>SecuNik Timeline Analysis Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary">
                <h2>Summary</h2>
                <p><strong>Total Events:</strong> ${report.summary.totalEvents}</p>
                <p><strong>Time Span:</strong> ${report.summary.timeSpan}</p>
                <p><strong>Critical Events:</strong> ${report.summary.criticalEvents}</p>
                <p><strong>Event Density:</strong> ${report.summary.eventDensity} events/hour</p>
            </div>
            
            <div class="section">
                <h2>Key Events</h2>
                ${report.events.map(event => `
                    <div class="event ${event.severity}">
                        <h4>${event.title}</h4>
                        <p><strong>Time:</strong> ${event.timestamp.toLocaleString()}</p>
                        <p><strong>Severity:</strong> ${event.severity.toUpperCase()}</p>
                        <p>${event.description}</p>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;
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

function downloadHTML(htmlData, filename) {
    const blob = new Blob([htmlData], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Global functions for timeline interactions
window.showEventDetails = function (eventId) {
    const event = filteredTimelineData.find(e => e.id === eventId);
    if (!event) return;

    const detailsPanel = document.getElementById('eventDetailsPanel');
    const detailsContent = document.getElementById('eventDetailsPanelContent');

    if (detailsPanel && detailsContent) {
        detailsContent.innerHTML = `
            <div class="event-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Title:</label>
                            <span>${event.title}</span>
                        </div>
                        <div class="detail-item">
                            <label>Timestamp:</label>
                            <span>${event.timestamp.toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Severity:</label>
                            <span class="severity-badge ${event.severity}">${event.severity.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Category:</label>
                            <span>${event.category}</span>
                        </div>
                        <div class="detail-item">
                            <label>Source:</label>
                            <span>${event.source}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${event.description}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Additional Details</h4>
                    <pre class="detail-json">${JSON.stringify(event.details, null, 2)}</pre>
                </div>
            </div>
        `;

        detailsPanel.style.display = 'block';
    }
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

    dashboard?.switchToTab('case');

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
            descriptionField.value = `Case created from timeline event.\n\nEvent: ${event.title}\nTime: ${event.timestamp.toLocaleString()}\nDescription: ${event.description}`;
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

function closeDetailsPanel() {
    const detailsPanel = document.getElementById('eventDetailsPanel');
    if (detailsPanel) {
        detailsPanel.style.display = 'none';
    }
}