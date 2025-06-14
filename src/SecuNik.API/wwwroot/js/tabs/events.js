export function init(data) {
    setupEventFiltering();
    setupEventSearch();
    setupEventSorting();
    setupEventExport();
}

export function render(analysis) {
    if (!analysis) return;

    const events = analysis.result?.technical?.securityEvents ||
        analysis.result?.Technical?.SecurityEvents || [];

    renderEventsTable(events);
    updateEventStats(events);
    renderEventChart(events);
}

function renderEventsTable(events) {
    const container = document.getElementById('eventsTableContainer') ||
        document.querySelector('.events-table-container');

    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="shield" width="48" height="48"></i>
                <h3>No Security Events</h3>
                <p>No security events were detected in the analysis</p>
            </div>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        return;
    }

    const severityCounts = calculateSeverityCounts(events);
    const eventTypes = getUniqueEventTypes(events);

    container.innerHTML = `
        <div class="events-header">
            <div class="events-title">
                <h3>Security Events (${events.length})</h3>
                <div class="events-summary">
                    <span class="severity-badge critical">${severityCounts.critical} Critical</span>
                    <span class="severity-badge high">${severityCounts.high} High</span>
                    <span class="severity-badge medium">${severityCounts.medium} Medium</span>
                    <span class="severity-badge low">${severityCounts.low} Low</span>
                </div>
            </div>
            <div class="events-controls">
                <input type="text" id="eventSearch" placeholder="Search events..." class="event-search">
                <select id="severityFilter" class="event-filter">
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select id="typeFilter" class="event-filter">
                    <option value="">All Types</option>
                    ${eventTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
                <button class="btn btn-secondary" id="exportEventsBtn">
                    <i data-feather="download"></i> Export
                </button>
            </div>
        </div>
        
        <div class="events-table-wrapper">
            <table class="events-table">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="timestamp">
                            Timestamp <i data-feather="chevron-up"></i>
                        </th>
                        <th class="sortable" data-sort="severity">
                            Severity <i data-feather="chevron-up"></i>
                        </th>
                        <th class="sortable" data-sort="eventType">
                            Type <i data-feather="chevron-up"></i>
                        </th>
                        <th>Description</th>
                        <th>Source</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="eventsTableBody">
                    ${events.map((event, index) => createEventRow(event, index)).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="events-pagination" id="eventsPagination">
            ${createPagination(events.length)}
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Setup event handlers for new elements
    setupTableEventHandlers();
}

function createEventRow(event, index) {
    const timestamp = event.timestamp || event.Timestamp;
    const severity = (event.severity || event.Severity || 'unknown').toLowerCase();
    const eventType = event.eventType || event.EventType || 'Unknown';
    const description = event.description || event.Description || 'No description available';
    const source = event.source || event.Source || 'Unknown';

    const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : 'Unknown';
    const truncatedDesc = description.length > 100 ?
        description.substring(0, 100) + '...' :
        description;

    return `
        <tr class="event-row" data-severity="${severity}" data-type="${eventType}" data-index="${index}">
            <td class="event-timestamp" title="${formattedTime}">
                <div class="timestamp-display">
                    <div class="time-main">${formattedTime.split(' ')[1] || ''}</div>
                    <div class="time-date">${formattedTime.split(' ')[0] || ''}</div>
                </div>
            </td>
            <td class="event-severity">
                <span class="severity-badge ${severity}">${severity.toUpperCase()}</span>
            </td>
            <td class="event-type">
                <span class="type-badge">${sanitizeHTML(eventType)}</span>
            </td>
            <td class="event-description" title="${sanitizeHTML(description)}">
                ${sanitizeHTML(truncatedDesc)}
            </td>
            <td class="event-source">
                ${sanitizeHTML(source)}
            </td>
            <td class="event-actions">
                <button class="btn-icon" title="View details" onclick="viewEventDetails(${index})">
                    <i data-feather="eye"></i>
                </button>
                <button class="btn-icon" title="Create case" onclick="createCaseFromEvent(${index})">
                    <i data-feather="folder-plus"></i>
                </button>
                <button class="btn-icon" title="Copy event" onclick="copyEvent(${index})">
                    <i data-feather="copy"></i>
                </button>
            </td>
        </tr>
    `;
}

function updateEventStats(events) {
    const statsContainer = document.querySelector('.events-stats');
    if (!statsContainer) return;

    const stats = calculateEventStats(events);

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon"><i data-feather="alert-circle"></i></div>
            <div class="stat-content">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Events</div>
            </div>
        </div>
        <div class="stat-card critical">
            <div class="stat-icon"><i data-feather="alert-octagon"></i></div>
            <div class="stat-content">
                <div class="stat-value">${stats.critical}</div>
                <div class="stat-label">Critical</div>
            </div>
        </div>
        <div class="stat-card warning">
            <div class="stat-icon"><i data-feather="alert-triangle"></i></div>
            <div class="stat-content">
                <div class="stat-value">${stats.high}</div>
                <div class="stat-label">High Severity</div>
            </div>
        </div>
        <div class="stat-card info">
            <div class="stat-icon"><i data-feather="info"></i></div>
            <div class="stat-content">
                <div class="stat-value">${Object.keys(stats.types).length}</div>
                <div class="stat-label">Event Types</div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function renderEventChart(events) {
    const chartContainer = document.querySelector('.events-chart');
    if (!chartContainer) return;

    const chartData = processEventChartData(events);

    chartContainer.innerHTML = `
        <div class="chart-header">
            <h4>Events Over Time</h4>
            <div class="chart-controls">
                <select id="chartPeriod" class="chart-filter">
                    <option value="hour">Last 24 Hours</option>
                    <option value="day">Last 7 Days</option>
                    <option value="week">Last 4 Weeks</option>
                </select>
            </div>
        </div>
        <div class="chart-content">
            ${renderSimpleBarChart(chartData)}
        </div>
    `;
}

function processEventChartData(events) {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Group events by hour for the last 24 hours
    const hourlyData = {};

    for (let i = 0; i < 24; i++) {
        const hour = new Date(last24h.getTime() + i * 60 * 60 * 1000);
        const hourKey = hour.getHours();
        hourlyData[hourKey] = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    }

    events.forEach(event => {
        const timestamp = new Date(event.timestamp || event.Timestamp);
        if (timestamp >= last24h) {
            const hour = timestamp.getHours();
            const severity = (event.severity || event.Severity || 'low').toLowerCase();

            if (hourlyData[hour]) {
                hourlyData[hour][severity] = (hourlyData[hour][severity] || 0) + 1;
                hourlyData[hour].total++;
            }
        }
    });

    return hourlyData;
}

function renderSimpleBarChart(data) {
    const maxValue = Math.max(...Object.values(data).map(d => d.total), 1);

    return `
        <div class="simple-bar-chart">
            ${Object.entries(data).map(([hour, counts]) => `
                <div class="chart-bar-group">
                    <div class="chart-bar" style="height: ${(counts.total / maxValue) * 100}%">
                        <div class="bar-segment critical" style="height: ${counts.critical ? (counts.critical / counts.total) * 100 : 0}%"></div>
                        <div class="bar-segment high" style="height: ${counts.high ? (counts.high / counts.total) * 100 : 0}%"></div>
                        <div class="bar-segment medium" style="height: ${counts.medium ? (counts.medium / counts.total) * 100 : 0}%"></div>
                        <div class="bar-segment low" style="height: ${counts.low ? (counts.low / counts.total) * 100 : 0}%"></div>
                    </div>
                    <div class="chart-label">${hour.toString().padStart(2, '0')}:00</div>
                </div>
            `).join('')}
        </div>
    `;
}

function setupEventFiltering() {
    document.addEventListener('change', (e) => {
        if (e.target.id === 'severityFilter' || e.target.id === 'typeFilter') {
            filterEvents();
        }
    });
}

function setupEventSearch() {
    document.addEventListener('input', (e) => {
        if (e.target.id === 'eventSearch') {
            searchEvents(e.target.value);
        }
    });
}

function setupEventSorting() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.sortable')) {
            const sortField = e.target.closest('.sortable').dataset.sort;
            sortEvents(sortField);
        }
    });
}

function setupEventExport() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'exportEventsBtn' || e.target.closest('#exportEventsBtn')) {
            exportEvents();
        }
    });
}

function setupTableEventHandlers() {
    // Event handlers are set up via onclick attributes in createEventRow
    // This function can be used for additional event handling if needed
}

function filterEvents() {
    const severityFilter = document.getElementById('severityFilter')?.value;
    const typeFilter = document.getElementById('typeFilter')?.value;
    const rows = document.querySelectorAll('.event-row');

    rows.forEach(row => {
        const severity = row.dataset.severity;
        const type = row.dataset.type;

        const severityMatch = !severityFilter || severity === severityFilter;
        const typeMatch = !typeFilter || type === typeFilter;

        if (severityMatch && typeMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    updateVisibleEventCount();
}

function searchEvents(searchTerm) {
    const rows = document.querySelectorAll('.event-row');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (!term || text.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    updateVisibleEventCount();
}

function sortEvents(field) {
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('.event-row'));
    const isAscending = tbody.dataset.sortDirection !== 'asc';

    rows.sort((a, b) => {
        let aVal, bVal;

        switch (field) {
            case 'timestamp':
                aVal = new Date(a.querySelector('.event-timestamp').title);
                bVal = new Date(b.querySelector('.event-timestamp').title);
                break;
            case 'severity':
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                aVal = severityOrder[a.dataset.severity] || 0;
                bVal = severityOrder[b.dataset.severity] || 0;
                break;
            case 'eventType':
                aVal = a.dataset.type.toLowerCase();
                bVal = b.dataset.type.toLowerCase();
                break;
            default:
                return 0;
        }

        if (aVal < bVal) return isAscending ? -1 : 1;
        if (aVal > bVal) return isAscending ? 1 : -1;
        return 0;
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
    tbody.dataset.sortDirection = isAscending ? 'asc' : 'desc';

    // Update sort indicators
    document.querySelectorAll('.sortable i').forEach(icon => {
        icon.setAttribute('data-feather', 'chevron-up');
    });

    const currentSortIcon = document.querySelector(`[data-sort="${field}"] i`);
    if (currentSortIcon) {
        currentSortIcon.setAttribute('data-feather', isAscending ? 'chevron-up' : 'chevron-down');
    }

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function exportEvents() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) {
        dashboard?.showNotification('No events to export', 'warning');
        return;
    }

    try {
        const events = dashboard.state.currentAnalysis.result?.technical?.securityEvents ||
            dashboard.state.currentAnalysis.result?.Technical?.SecurityEvents || [];

        const csvData = convertEventsToCSV(events);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-events-${dashboard.state.currentAnalysis.analysisId}.csv`;
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification(`Exported ${events.length} events successfully`, 'success');
    } catch (error) {
        console.error('Events export failed:', error);
        window.secuNikDashboard?.showNotification('Failed to export events', 'error');
    }
}

function convertEventsToCSV(events) {
    const headers = ['Timestamp', 'Severity', 'Event Type', 'Description', 'Source'];
    const rows = events.map(event => [
        event.timestamp || event.Timestamp || '',
        event.severity || event.Severity || '',
        event.eventType || event.EventType || '',
        (event.description || event.Description || '').replace(/"/g, '""'),
        event.source || event.Source || ''
    ]);

    return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
}

function calculateSeverityCounts(events) {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };

    events.forEach(event => {
        const severity = (event.severity || event.Severity || 'low').toLowerCase();
        if (counts.hasOwnProperty(severity)) {
            counts[severity]++;
        }
    });

    return counts;
}

function calculateEventStats(events) {
    const stats = {
        total: events.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        types: {}
    };

    events.forEach(event => {
        const severity = (event.severity || event.Severity || 'low').toLowerCase();
        const eventType = event.eventType || event.EventType || 'Unknown';

        if (stats.hasOwnProperty(severity)) {
            stats[severity]++;
        }

        stats.types[eventType] = (stats.types[eventType] || 0) + 1;
    });

    return stats;
}

function getUniqueEventTypes(events) {
    const types = new Set();
    events.forEach(event => {
        const eventType = event.eventType || event.EventType || 'Unknown';
        types.add(eventType);
    });
    return Array.from(types).sort();
}

function updateVisibleEventCount() {
    const visibleRows = document.querySelectorAll('.event-row:not([style*="display: none"])');
    const totalRows = document.querySelectorAll('.event-row');

    const countDisplay = document.querySelector('.events-visible-count');
    if (countDisplay) {
        countDisplay.textContent = `Showing ${visibleRows.length} of ${totalRows.length} events`;
    }
}

function createPagination(totalEvents) {
    const eventsPerPage = 50;
    const totalPages = Math.ceil(totalEvents / eventsPerPage);

    if (totalPages <= 1) return '';

    return `
        <div class="pagination-info">
            Showing events 1-${Math.min(eventsPerPage, totalEvents)} of ${totalEvents}
        </div>
        <div class="pagination-controls">
            <button class="btn btn-secondary" id="prevPage" disabled>
                <i data-feather="chevron-left"></i> Previous
            </button>
            <span class="pagination-numbers">
                Page 1 of ${totalPages}
            </span>
            <button class="btn btn-secondary" id="nextPage" ${totalPages <= 1 ? 'disabled' : ''}>
                Next <i data-feather="chevron-right"></i>
            </button>
        </div>
    `;
}

function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Global functions for event actions
window.viewEventDetails = function (eventIndex) {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) return;

    const events = dashboard.state.currentAnalysis.result?.technical?.securityEvents ||
        dashboard.state.currentAnalysis.result?.Technical?.SecurityEvents || [];

    const event = events[eventIndex];
    if (!event) return;

    const detailsModal = createEventDetailsModal(event, eventIndex);
    document.body.appendChild(detailsModal);

    // Show modal
    detailsModal.style.display = 'flex';

    dashboard?.showNotification('Event details opened', 'info', 2000);
};

window.createCaseFromEvent = function (eventIndex) {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) return;

    const events = dashboard.state.currentAnalysis.result?.technical?.securityEvents ||
        dashboard.state.currentAnalysis.result?.Technical?.SecurityEvents || [];

    const event = events[eventIndex];
    if (!event) return;

    // Switch to case management tab and pre-fill form
    dashboard.switchToTab('case');

    setTimeout(() => {
        const titleField = document.getElementById('caseTitle');
        const severityField = document.getElementById('caseSeverity');
        const descriptionField = document.getElementById('caseDescription');

        if (titleField) {
            titleField.value = `Security Event: ${event.eventType || event.EventType || 'Unknown'}`;
        }

        if (severityField) {
            const severity = (event.severity || event.Severity || 'medium').toLowerCase();
            severityField.value = severity;
        }

        if (descriptionField) {
            const description = `Automated case creation from security event analysis.

Event Details:
- Type: ${event.eventType || event.EventType || 'Unknown'}
- Timestamp: ${event.timestamp || event.Timestamp || 'Unknown'}
- Source: ${event.source || event.Source || 'Unknown'}
- Description: ${event.description || event.Description || 'No description available'}`;

            descriptionField.value = description;
        }

        dashboard?.showNotification('Case form pre-filled from event', 'success');
    }, 100);
};

window.copyEvent = async function (eventIndex) {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) return;

    const events = dashboard.state.currentAnalysis.result?.technical?.securityEvents ||
        dashboard.state.currentAnalysis.result?.Technical?.SecurityEvents || [];

    const event = events[eventIndex];
    if (!event) return;

    const eventText = `Security Event:
Timestamp: ${event.timestamp || event.Timestamp || 'Unknown'}
Type: ${event.eventType || event.EventType || 'Unknown'}
Severity: ${event.severity || event.Severity || 'Unknown'}
Source: ${event.source || event.Source || 'Unknown'}
Description: ${event.description || event.Description || 'No description available'}`;

    try {
        await navigator.clipboard.writeText(eventText);
        dashboard?.showNotification('Event copied to clipboard', 'success', 2000);
    } catch (error) {
        console.error('Copy failed:', error);
        dashboard?.showNotification('Failed to copy event', 'error');
    }
};

function createEventDetailsModal(event, eventIndex) {
    const modal = document.createElement('div');
    modal.className = 'event-details-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    const severity = (event.severity || event.Severity || 'unknown').toLowerCase();

    modal.innerHTML = `
        <div class="modal-content" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: var(--space-xl); max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); border-bottom: 1px solid var(--border-secondary); padding-bottom: var(--space-md);">
                <h3>Security Event Details</h3>
                <button class="modal-close" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 24px;">&times;</button>
            </div>
            <div class="modal-body">
                <div class="event-detail-grid" style="display: grid; gap: var(--space-md);">
                    <div class="detail-row">
                        <strong>Event Index:</strong> #${eventIndex + 1}
                    </div>
                    <div class="detail-row">
                        <strong>Timestamp:</strong> ${event.timestamp || event.Timestamp || 'Unknown'}
                    </div>
                    <div class="detail-row">
                        <strong>Severity:</strong> 
                        <span class="severity-badge ${severity}">${severity.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Event Type:</strong> ${sanitizeHTML(event.eventType || event.EventType || 'Unknown')}
                    </div>
                    <div class="detail-row">
                        <strong>Source:</strong> ${sanitizeHTML(event.source || event.Source || 'Unknown')}
                    </div>
                    <div class="detail-row">
                        <strong>Description:</strong>
                        <div style="margin-top: var(--space-sm); padding: var(--space-md); background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; white-space: pre-wrap;">${sanitizeHTML(event.description || event.Description || 'No description available')}</div>
                    </div>
                    ${event.attributes || event.Attributes ? `
                        <div class="detail-row">
                            <strong>Additional Attributes:</strong>
                            <div style="margin-top: var(--space-sm); padding: var(--space-md); background: var(--bg-tertiary); border-radius: var(--radius-sm);">
                                <pre style="margin: 0; font-size: 12px; overflow-x: auto;">${JSON.stringify(event.attributes || event.Attributes, null, 2)}</pre>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer" style="margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-secondary); display: flex; gap: var(--space-md); justify-content: flex-end;">
                <button class="btn btn-secondary modal-close">Close</button>
                <button class="btn btn-secondary" onclick="copyEvent(${eventIndex}); this.closest('.event-details-modal').remove();">
                    <i data-feather="copy"></i> Copy Event
                </button>
                <button class="btn btn-primary" onclick="createCaseFromEvent(${eventIndex}); this.closest('.event-details-modal').remove();">
                    <i data-feather="folder-plus"></i> Create Case
                </button>
            </div>
        </div>
    `;

    // Add close event listeners
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.remove();
        });
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });

    return modal;
}