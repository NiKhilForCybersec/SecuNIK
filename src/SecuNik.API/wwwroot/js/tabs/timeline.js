import { updateTimelineChart } from './dashboard.js';

let dashboard;

export function init(dash) {
    dashboard = dash;

    // Setup timeline controls
    const timelineBtns = document.querySelectorAll('.timeline-btn');
    timelineBtns.forEach(btn => {
        btn.addEventListener('click', handleTimelineFilter);
    });

    // Setup any additional timeline features
    setupTimelineTooltips();
    setupTimelineExport();
}

export function render(analysis) {
    if (!analysis) return;

    const events = analysis?.result?.technical?.securityEvents ||
        analysis?.result?.Technical?.SecurityEvents || [];

    updateTimelineChart(events);
    updateTimelineStats(events);
    renderTimelineDetails(events);
}

function handleTimelineFilter(event) {
    const period = event.target.getAttribute('data-period');

    // Update button states
    document.querySelectorAll('.timeline-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
    });

    event.target.classList.add('active');
    event.target.setAttribute('aria-checked', 'true');

    // Filter and update timeline
    if (dashboard?.state.currentAnalysis) {
        const events = dashboard.state.currentAnalysis.result.technical?.securityEvents ||
            dashboard.state.currentAnalysis.result.Technical?.SecurityEvents || [];
        const filteredEvents = filterEventsByPeriod(events, period);
        updateTimelineChart(filteredEvents);
        updateTimelineStats(filteredEvents);
        renderTimelineDetails(filteredEvents, period);
    }

    // Show notification for period change
    const periodLabels = {
        '1h': 'Last Hour',
        '6h': 'Last 6 Hours',
        '24h': 'Last 24 Hours',
        'all': 'All Events'
    };

    dashboard?.showNotification(
        `Timeline view changed to: ${periodLabels[period] || period}`,
        'info',
        2000
    );
}

function filterEventsByPeriod(events, period) {
    if (period === 'all') return events;

    const now = new Date();
    let cutoff;

    switch (period) {
        case '1h':
            cutoff = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case '6h':
            cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
            break;
        case '24h':
            cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        default:
            return events;
    }

    return events.filter(e => {
        const timestamp = e.timestamp || e.Timestamp;
        return timestamp && new Date(timestamp) >= cutoff;
    });
}

function updateTimelineStats(events) {
    const statsContainer = document.querySelector('.timeline-stats');
    if (!statsContainer) return;

    const stats = calculateTimelineStats(events);

    statsContainer.innerHTML = `
        <div class="timeline-stat">
            <span class="timeline-stat-value">${stats.total}</span>
            <span class="timeline-stat-label">Total Events</span>
        </div>
        <div class="timeline-stat">
            <span class="timeline-stat-value">${stats.critical}</span>
            <span class="timeline-stat-label">Critical</span>
        </div>
        <div class="timeline-stat">
            <span class="timeline-stat-value">${stats.high}</span>
            <span class="timeline-stat-label">High</span>
        </div>
        <div class="timeline-stat">
            <span class="timeline-stat-value">${stats.timeSpan}</span>
            <span class="timeline-stat-label">Time Span</span>
        </div>
    `;
}

function calculateTimelineStats(events) {
    const total = events.length;
    const critical = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'critical'
    ).length;
    const high = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'high'
    ).length;

    let timeSpan = 'N/A';
    if (events.length > 1) {
        const timestamps = events
            .map(e => new Date(e.timestamp || e.Timestamp))
            .filter(d => !isNaN(d))
            .sort((a, b) => a - b);

        if (timestamps.length > 1) {
            const span = timestamps[timestamps.length - 1] - timestamps[0];
            timeSpan = formatDuration(span);
        }
    }

    return { total, critical, high, timeSpan };
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

function renderTimelineDetails(events, period = 'all') {
    const detailsContainer = document.querySelector('.timeline-event-details');
    if (!detailsContainer) return;

    if (events.length === 0) {
        detailsContainer.innerHTML = `
            <div class="timeline-empty">
                <i data-feather="clock" width="48" height="48"></i>
                <p>No events found for the selected time period</p>
                <small>Try selecting a different time range or check if data is available</small>
            </div>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        return;
    }

    // Group events by hour for better visualization
    const groupedEvents = groupEventsByHour(events);
    const sortedHours = Object.keys(groupedEvents).sort().reverse(); // Most recent first

    detailsContainer.innerHTML = `
        <div class="timeline-details-header">
            <h4>Event Timeline Details</h4>
            <div class="timeline-summary">
                <span>${events.length} events</span>
                ${period !== 'all' ? `<span>• ${period.toUpperCase()} view</span>` : ''}
            </div>
        </div>
        <div class="timeline-details-list">
            ${sortedHours.slice(0, 24).map(hour => `
                <div class="timeline-hour-group">
                    <div class="timeline-hour-header">
                        <span class="timeline-hour-time">${hour}</span>
                        <span class="timeline-hour-count">${groupedEvents[hour].length} events</span>
                    </div>
                    <div class="timeline-hour-events">
                        ${groupedEvents[hour].slice(0, 5).map(event => `
                            <div class="timeline-event-item ${(event.severity || event.Severity || 'info').toLowerCase()}">
                                <div class="timeline-event-time">
                                    ${new Date(event.timestamp || event.Timestamp).toLocaleTimeString()}
                                </div>
                                <div class="timeline-event-content">
                                    <div class="timeline-event-type">
                                        ${dashboard?.sanitizeHTML(event.eventType || event.EventType || 'Unknown Event')}
                                    </div>
                                    <div class="timeline-event-desc">
                                        ${dashboard?.sanitizeHTML((event.description || event.Description || '').substring(0, 100))}
                                        ${(event.description || event.Description || '').length > 100 ? '...' : ''}
                                    </div>
                                </div>
                                <div class="timeline-event-severity ${(event.severity || event.Severity || 'info').toLowerCase()}">
                                    ${(event.severity || event.Severity || 'info').toUpperCase()}
                                </div>
                            </div>
                        `).join('')}
                        ${groupedEvents[hour].length > 5 ? `
                            <div class="timeline-more-events">
                                +${groupedEvents[hour].length - 5} more events
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function groupEventsByHour(events) {
    const grouped = {};

    events.forEach(event => {
        const timestamp = new Date(event.timestamp || event.Timestamp);
        if (isNaN(timestamp)) return;

        const hourKey = timestamp.toISOString().substring(0, 13) + ':00'; // YYYY-MM-DDTHH:00
        const displayKey = timestamp.toLocaleDateString() + ' ' +
            timestamp.getHours().toString().padStart(2, '0') + ':00';

        if (!grouped[displayKey]) {
            grouped[displayKey] = [];
        }
        grouped[displayKey].push(event);
    });

    return grouped;
}

function setupTimelineTooltips() {
    // Add event listeners for timeline bar tooltips
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('timeline-bar')) {
            showTimelineTooltip(e.target, e);
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('timeline-bar')) {
            hideTimelineTooltip();
        }
    });
}

function showTimelineTooltip(barElement, event) {
    const existingTooltip = document.querySelector('.timeline-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'timeline-tooltip';

    const title = barElement.getAttribute('title') || 'No data';
    tooltip.textContent = title;

    barElement.appendChild(tooltip);

    // Position tooltip
    const rect = barElement.getBoundingClientRect();
    tooltip.style.left = '50%';
    tooltip.style.bottom = '100%';
    tooltip.style.marginBottom = '5px';
}

function hideTimelineTooltip() {
    const tooltip = document.querySelector('.timeline-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function setupTimelineExport() {
    // Add export functionality for timeline data
    const exportBtn = document.getElementById('exportTimelineBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTimelineData);
    }
}

function exportTimelineData() {
    if (!dashboard?.state.currentAnalysis) {
        dashboard?.showNotification('No timeline data to export', 'warning');
        return;
    }

    try {
        const events = dashboard.state.currentAnalysis.result.technical?.securityEvents ||
            dashboard.state.currentAnalysis.result.Technical?.SecurityEvents || [];

        const timelineData = {
            exportedAt: new Date().toISOString(),
            analysisId: dashboard.state.currentAnalysis.analysisId,
            fileName: dashboard.state.currentFile?.name || 'unknown',
            totalEvents: events.length,
            timelineEvents: events.map(event => ({
                timestamp: event.timestamp || event.Timestamp,
                eventType: event.eventType || event.EventType,
                description: event.description || event.Description,
                severity: event.severity || event.Severity,
                source: event.source || event.Source || 'Unknown'
            }))
        };

        const csvData = convertTimelineToCSV(timelineData.timelineEvents);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-timeline-${dashboard.state.currentAnalysis.analysisId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification('Timeline data exported successfully', 'success');
    } catch (error) {
        console.error('Timeline export failed:', error);
        dashboard?.showNotification('Failed to export timeline data', 'error');
    }
}

function convertTimelineToCSV(events) {
    const headers = ['Timestamp', 'Event Type', 'Description', 'Severity', 'Source'];
    const rows = events.map(event => [
        event.timestamp || '',
        event.eventType || '',
        (event.description || '').replace(/"/g, '""'),
        event.severity || '',
        event.source || ''
    ]);

    return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
}

// Add CSS for timeline details if not already present
function injectTimelineDetailsCSS() {
    if (document.getElementById('timeline-details-css')) return;

    const style = document.createElement('style');
    style.id = 'timeline-details-css';
    style.textContent = `
        .timeline-details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-md);
            padding-bottom: var(--space-sm);
            border-bottom: 1px solid var(--border-secondary);
        }

        .timeline-summary {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .timeline-hour-group {
            margin-bottom: var(--space-lg);
        }

        .timeline-hour-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--space-sm);
            background: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            font-weight: 600;
            font-size: 13px;
        }

        .timeline-hour-time {
            color: var(--text-primary);
        }

        .timeline-hour-count {
            color: var(--text-accent);
            font-size: 11px;
        }

        .timeline-hour-events {
            margin-top: var(--space-sm);
            display: flex;
            flex-direction: column;
            gap: var(--space-xs);
        }

        .timeline-event-item {
            display: grid;
            grid-template-columns: 80px 1fr 60px;
            gap: var(--space-sm);
            padding: var(--space-sm);
            background: var(--bg-card);
            border-radius: var(--radius-sm);
            border-left: 3px solid var(--border-secondary);
            font-size: 12px;
        }

        .timeline-event-item.critical {
            border-left-color: var(--severity-critical);
        }

        .timeline-event-item.high {
            border-left-color: var(--severity-high);
        }

        .timeline-event-item.medium {
            border-left-color: var(--severity-medium);
        }

        .timeline-event-item.low {
            border-left-color: var(--severity-low);
        }

        .timeline-event-time {
            color: var(--text-muted);
            font-weight: 500;
        }

        .timeline-event-type {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--space-xs);
        }

        .timeline-event-desc {
            color: var(--text-secondary);
            line-height: 1.3;
        }

        .timeline-event-severity {
            text-align: center;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            align-self: center;
        }

        .timeline-more-events {
            text-align: center;
            padding: var(--space-sm);
            color: var(--text-muted);
            font-size: 11px;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}

// Initialize CSS when module loads
injectTimelineDetailsCSS();