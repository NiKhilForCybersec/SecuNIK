let dashboard = null;
let currentPage = 1;
let eventsPerPage = 10;
let totalEvents = 0;
let filteredEvents = [];
let allEvents = [];
let sortField = 'timestamp';
let sortDirection = 'desc';
let selectedSeverities = ['critical', 'high', 'medium', 'low'];

export function init(dashboardInstance) {
    dashboard = dashboardInstance;
    console.log('✅ Events tab initialized');
}

export function render(analysis) {
    const eventsTab = document.getElementById('eventsTab');
    if (!eventsTab) return;

    // Extract events data
    const data = analysis?.result || analysis;
    allEvents = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];

    // Apply initial filters
    applyFilters();

    eventsTab.innerHTML = `
        <div class="section-header">
            <h2><i data-feather="alert-triangle" aria-hidden="true"></i> Security Events</h2>
            <div class="header-actions">
                <div class="events-summary">
                    <span class="total-count">${allEvents.length} Total Events</span>
                    <span class="critical-count">${getCriticalCount()} Critical</span>
                </div>
                <button class="btn btn-secondary" id="exportEventsBtn">
                    <i data-feather="download"></i> Export Events
                </button>
                <button class="btn btn-primary" id="refreshEventsBtn">
                    <i data-feather="refresh-cw"></i> Refresh
                </button>
            </div>
        </div>
        
        <div class="section-content">
            <!-- Filters Section -->
            <div class="events-filters">
                <div class="filter-group">
                    <label for="severityFilter">Severity:</label>
                    <div class="severity-checkboxes">
                        <label class="checkbox-label">
                            <input type="checkbox" value="critical" checked> Critical
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="high" checked> High
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="medium" checked> Medium
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="low" checked> Low
                        </label>
                    </div>
                </div>
                
                <div class="filter-group">
                    <label for="searchEvents">Search:</label>
                    <input type="text" id="searchEvents" placeholder="Search events..." class="form-control">
                </div>
                
                <div class="filter-group">
                    <label for="timeRangeFilter">Time Range:</label>
                    <select id="timeRangeFilter" class="form-control">
                        <option value="all">All Time</option>
                        <option value="1h">Last Hour</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="eventTypeFilter">Event Type:</label>
                    <select id="eventTypeFilter" class="form-control">
                        <option value="all">All Types</option>
                        ${getUniqueEventTypes().map(type =>
        `<option value="${type}">${type}</option>`
    ).join('')}
                    </select>
                </div>
                
                <button class="btn btn-secondary" id="clearFiltersBtn">
                    <i data-feather="x"></i> Clear Filters
                </button>
            </div>
            
            <!-- Events Statistics -->
            <div class="events-stats">
                <div class="stat-grid">
                    <div class="stat-item critical">
                        <div class="stat-value">${getSeverityCount('critical')}</div>
                        <div class="stat-label">Critical Events</div>
                    </div>
                    <div class="stat-item high">
                        <div class="stat-value">${getSeverityCount('high')}</div>
                        <div class="stat-label">High Severity</div>
                    </div>
                    <div class="stat-item medium">
                        <div class="stat-value">${getSeverityCount('medium')}</div>
                        <div class="stat-label">Medium Severity</div>
                    </div>
                    <div class="stat-item low">
                        <div class="stat-value">${getSeverityCount('low')}</div>
                        <div class="stat-label">Low Severity</div>
                    </div>
                </div>
            </div>
            
            <!-- Events Table -->
            <div class="events-table-container">
                <div class="table-controls">
                    <div class="pagination-info">
                        Showing ${getStartIndex()} - ${getEndIndex()} of ${filteredEvents.length} events
                    </div>
                    <div class="table-actions">
                        <select id="eventsPerPageSelect" class="form-control">
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </select>
                    </div>
                </div>
                
                <div class="events-table-wrapper">
                    <table class="events-table">
                        <thead>
                            <tr>
                                <th class="sortable" data-field="timestamp">
                                    <i data-feather="clock"></i> Time
                                    <span class="sort-indicator ${sortField === 'timestamp' ? sortDirection : ''}"></span>
                                </th>
                                <th class="sortable" data-field="severity">
                                    <i data-feather="alert-circle"></i> Severity
                                    <span class="sort-indicator ${sortField === 'severity' ? sortDirection : ''}"></span>
                                </th>
                                <th class="sortable" data-field="eventType">
                                    <i data-feather="tag"></i> Event Type
                                    <span class="sort-indicator ${sortField === 'eventType' ? sortDirection : ''}"></span>
                                </th>
                                <th class="sortable" data-field="source">
                                    <i data-feather="server"></i> Source
                                    <span class="sort-indicator ${sortField === 'source' ? sortDirection : ''}"></span>
                                </th>
                                <th>
                                    <i data-feather="file-text"></i> Description
                                </th>
                                <th>
                                    <i data-feather="tool"></i> Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody id="eventsTableBody">
                            ${renderEventsTable()}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="pagination-container">
                    ${renderPagination()}
                </div>
            </div>
            
            <!-- Event Timeline Chart -->
            <div class="events-timeline-section">
                <h3><i data-feather="bar-chart-2"></i> Event Timeline</h3>
                <div class="timeline-chart" id="eventsTimelineChart">
                    ${renderTimelineChart()}
                </div>
            </div>
        </div>
    `;

    // Initialize event listeners
    setupEventListeners();

    // Replace feather icons
    feather.replace();

    console.log(`✅ Events tab rendered with ${allEvents.length} events`);
}

function setupEventListeners() {
    // Export events button
    const exportBtn = document.getElementById('exportEventsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportEvents);
    }

    // Refresh events button
    const refreshBtn = document.getElementById('refreshEventsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (dashboard?.state?.currentAnalysis) {
                render(dashboard.state.currentAnalysis);
            }
        });
    }

    // Filter event listeners
    const severityCheckboxes = document.querySelectorAll('.severity-checkboxes input[type="checkbox"]');
    severityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleSeverityFilter);
    });

    const searchInput = document.getElementById('searchEvents');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    const timeRangeFilter = document.getElementById('timeRangeFilter');
    if (timeRangeFilter) {
        timeRangeFilter.addEventListener('change', handleTimeRangeFilter);
    }

    const eventTypeFilter = document.getElementById('eventTypeFilter');
    if (eventTypeFilter) {
        eventTypeFilter.addEventListener('change', handleEventTypeFilter);
    }

    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Events per page selector
    const eventsPerPageSelect = document.getElementById('eventsPerPageSelect');
    if (eventsPerPageSelect) {
        eventsPerPageSelect.value = eventsPerPage.toString();
        eventsPerPageSelect.addEventListener('change', handleEventsPerPageChange);
    }

    // Table sorting
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-field');
            handleSort(field);
        });
    });

    // Pagination buttons
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            handlePagination(action);
        });
    });
}

function handleSeverityFilter() {
    const checkboxes = document.querySelectorAll('.severity-checkboxes input[type="checkbox"]');
    selectedSeverities = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    applyFilters();
    updateTable();
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    applyFilters(searchTerm);
    updateTable();
}

function handleTimeRangeFilter(e) {
    const timeRange = e.target.value;
    applyFilters(null, timeRange);
    updateTable();
}

function handleEventTypeFilter(e) {
    const eventType = e.target.value;
    applyFilters(null, null, eventType);
    updateTable();
}

function clearAllFilters() {
    // Reset checkboxes
    const checkboxes = document.querySelectorAll('.severity-checkboxes input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = true);

    // Reset other filters
    document.getElementById('searchEvents').value = '';
    document.getElementById('timeRangeFilter').value = 'all';
    document.getElementById('eventTypeFilter').value = 'all';

    // Reset state
    selectedSeverities = ['critical', 'high', 'medium', 'low'];
    currentPage = 1;

    applyFilters();
    updateTable();
}

function handleEventsPerPageChange(e) {
    eventsPerPage = parseInt(e.target.value);
    currentPage = 1;
    updateTable();
}

function handleSort(field) {
    if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortField = field;
        sortDirection = 'desc';
    }

    sortEvents();
    updateTable();
    updateSortIndicators();
}

function handlePagination(action) {
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    switch (action) {
        case 'first':
            currentPage = 1;
            break;
        case 'prev':
            currentPage = Math.max(1, currentPage - 1);
            break;
        case 'next':
            currentPage = Math.min(totalPages, currentPage + 1);
            break;
        case 'last':
            currentPage = totalPages;
            break;
        default:
            const pageNum = parseInt(action);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                currentPage = pageNum;
            }
    }

    updateTable();
}

function applyFilters(searchTerm = null, timeRange = null, eventType = null) {
    // Get current filter values if not provided
    if (searchTerm === null) {
        const searchInput = document.getElementById('searchEvents');
        searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    }

    if (timeRange === null) {
        const timeRangeSelect = document.getElementById('timeRangeFilter');
        timeRange = timeRangeSelect ? timeRangeSelect.value : 'all';
    }

    if (eventType === null) {
        const eventTypeSelect = document.getElementById('eventTypeFilter');
        eventType = eventTypeSelect ? eventTypeSelect.value : 'all';
    }

    filteredEvents = allEvents.filter(event => {
        // Severity filter
        const eventSeverity = (event.severity || event.Severity || 'low').toLowerCase();
        if (!selectedSeverities.includes(eventSeverity)) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const searchableText = [
                event.description || event.Description || '',
                event.eventType || event.EventType || '',
                event.source || event.Source || '',
                event.details || event.Details || ''
            ].join(' ').toLowerCase();

            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }

        // Time range filter
        if (timeRange !== 'all') {
            const eventTime = new Date(event.timestamp || event.Timestamp || Date.now());
            const now = new Date();
            const timeRangeMs = getTimeRangeMs(timeRange);

            if (now - eventTime > timeRangeMs) {
                return false;
            }
        }

        // Event type filter
        if (eventType !== 'all') {
            const eventEventType = event.eventType || event.EventType || '';
            if (eventEventType !== eventType) {
                return false;
            }
        }

        return true;
    });

    // Reset to first page when filters change
    currentPage = 1;

    // Sort the filtered events
    sortEvents();
}

function sortEvents() {
    filteredEvents.sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
            case 'timestamp':
                aValue = new Date(a.timestamp || a.Timestamp || 0);
                bValue = new Date(b.timestamp || b.Timestamp || 0);
                break;
            case 'severity':
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                aValue = severityOrder[(a.severity || a.Severity || 'low').toLowerCase()] || 0;
                bValue = severityOrder[(b.severity || b.Severity || 'low').toLowerCase()] || 0;
                break;
            case 'eventType':
                aValue = (a.eventType || a.EventType || '').toLowerCase();
                bValue = (b.eventType || b.EventType || '').toLowerCase();
                break;
            case 'source':
                aValue = (a.source || a.Source || '').toLowerCase();
                bValue = (b.source || b.Source || '').toLowerCase();
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function updateTable() {
    const tableBody = document.getElementById('eventsTableBody');
    if (tableBody) {
        tableBody.innerHTML = renderEventsTable();
    }

    const paginationContainer = document.querySelector('.pagination-container');
    if (paginationContainer) {
        paginationContainer.innerHTML = renderPagination();
    }

    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${getStartIndex()} - ${getEndIndex()} of ${filteredEvents.length} events`;
    }

    // Re-attach pagination event listeners
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            handlePagination(action);
        });
    });

    feather.replace();
}

function updateSortIndicators() {
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        const indicator = header.querySelector('.sort-indicator');
        const field = header.getAttribute('data-field');

        if (field === sortField) {
            indicator.className = `sort-indicator ${sortDirection}`;
        } else {
            indicator.className = 'sort-indicator';
        }
    });
}

function renderEventsTable() {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const pageEvents = filteredEvents.slice(startIndex, endIndex);

    if (pageEvents.length === 0) {
        return `
            <tr>
                <td colspan="6" class="no-events">
                    <div class="empty-state">
                        <i data-feather="search"></i>
                        <h3>No events found</h3>
                        <p>Try adjusting your filters or search criteria</p>
                    </div>
                </td>
            </tr>
        `;
    }

    return pageEvents.map((event, index) => {
        const severity = (event.severity || event.Severity || 'low').toLowerCase();
        const timestamp = formatTimestamp(event.timestamp || event.Timestamp);
        const eventType = event.eventType || event.EventType || 'Unknown';
        const source = event.source || event.Source || 'Unknown';
        const description = truncateText(event.description || event.Description || 'No description', 60);
        const eventIndex = startIndex + index;

        return `
            <tr class="event-row ${severity}" data-event-index="${eventIndex}">
                <td class="timestamp-cell">
                    <div class="timestamp-wrapper">
                        <span class="timestamp">${timestamp}</span>
                        <span class="relative-time">${getRelativeTime(event.timestamp || event.Timestamp)}</span>
                    </div>
                </td>
                <td class="severity-cell">
                    <span class="severity-badge ${severity}">${severity.toUpperCase()}</span>
                </td>
                <td class="event-type-cell">
                    <span class="event-type" title="${eventType}">${eventType}</span>
                </td>
                <td class="source-cell">
                    <span class="source" title="${source}">${source}</span>
                </td>
                <td class="description-cell">
                    <span class="description" title="${event.description || event.Description || ''}">${description}</span>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="viewEventDetails(${eventIndex})" title="View Details">
                            <i data-feather="eye"></i>
                        </button>
                        <button class="btn-icon" onclick="createCaseFromEvent(${eventIndex})" title="Create Case">
                            <i data-feather="folder-plus"></i>
                        </button>
                        <button class="btn-icon" onclick="exportSingleEvent(${eventIndex})" title="Export Event">
                            <i data-feather="download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPagination() {
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    if (totalPages <= 1) return '';

    let paginationHTML = '<div class="pagination">';

    // First and Previous buttons
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                data-action="first" ${currentPage === 1 ? 'disabled' : ''}>
            <i data-feather="chevrons-left"></i>
        </button>
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                data-action="prev" ${currentPage === 1 ? 'disabled' : ''}>
            <i data-feather="chevron-left"></i>
        </button>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += '<button class="pagination-btn" data-action="1">1</button>';
        if (startPage > 2) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    data-action="${i}">${i}</button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
        paginationHTML += `<button class="pagination-btn" data-action="${totalPages}">${totalPages}</button>`;
    }

    // Next and Last buttons
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                data-action="next" ${currentPage === totalPages ? 'disabled' : ''}>
            <i data-feather="chevron-right"></i>
        </button>
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                data-action="last" ${currentPage === totalPages ? 'disabled' : ''}>
            <i data-feather="chevrons-right"></i>
        </button>
    `;

    paginationHTML += '</div>';
    return paginationHTML;
}

function renderTimelineChart() {
    if (allEvents.length === 0) {
        return '<div class="chart-placeholder">No events to display</div>';
    }

    // Group events by hour
    const hourlyGroups = {};
    allEvents.forEach(event => {
        const date = new Date(event.timestamp || event.Timestamp || Date.now());
        const hour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
        const hourKey = hour.toISOString();

        if (!hourlyGroups[hourKey]) {
            hourlyGroups[hourKey] = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
        }

        const severity = (event.severity || event.Severity || 'low').toLowerCase();
        hourlyGroups[hourKey][severity]++;
        hourlyGroups[hourKey].total++;
    });

    // Sort by time and take last 24 hours
    const sortedGroups = Object.entries(hourlyGroups)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-24);

    const maxCount = Math.max(...sortedGroups.map(([, counts]) => counts.total));

    return `
        <div class="timeline-chart-container">
            <div class="chart-legend">
                <span class="legend-item critical">Critical</span>
                <span class="legend-item high">High</span>
                <span class="legend-item medium">Medium</span>
                <span class="legend-item low">Low</span>
            </div>
            <div class="chart-bars">
                ${sortedGroups.map(([time, counts]) => {
        const hour = new Date(time).getHours();
        const height = (counts.total / maxCount) * 100;

        return `
                        <div class="chart-bar" style="height: ${height}%" 
                             title="${new Date(time).toLocaleString()}: ${counts.total} events">
                            <div class="bar-segments">
                                ${counts.critical > 0 ? `<div class="bar-segment critical" style="height: ${(counts.critical / counts.total) * 100}%"></div>` : ''}
                                ${counts.high > 0 ? `<div class="bar-segment high" style="height: ${(counts.high / counts.total) * 100}%"></div>` : ''}
                                ${counts.medium > 0 ? `<div class="bar-segment medium" style="height: ${(counts.medium / counts.total) * 100}%"></div>` : ''}
                                ${counts.low > 0 ? `<div class="bar-segment low" style="height: ${(counts.low / counts.total) * 100}%"></div>` : ''}
                            </div>
                            <div class="bar-label">${hour}:00</div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

// Utility functions
function getCriticalCount() {
    return allEvents.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'critical'
    ).length;
}

function getSeverityCount(severity) {
    return allEvents.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === severity
    ).length;
}

function getUniqueEventTypes() {
    const types = new Set();
    allEvents.forEach(event => {
        const type = event.eventType || event.EventType;
        if (type) types.add(type);
    });
    return Array.from(types).sort();
}

function getStartIndex() {
    return filteredEvents.length === 0 ? 0 : (currentPage - 1) * eventsPerPage + 1;
}

function getEndIndex() {
    return Math.min(currentPage * eventsPerPage, filteredEvents.length);
}

function getTimeRangeMs(timeRange) {
    const ranges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
    };
    return ranges[timeRange] || 0;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown';

    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch (error) {
        return 'Invalid Date';
    }
}

function getRelativeTime(timestamp) {
    if (!timestamp) return '';

    try {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return '';
    } catch (error) {
        return '';
    }
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

// Export functions
function exportEvents() {
    if (!dashboard?.state?.currentAnalysis) {
        dashboard?.showNotification('No events to export', 'warning');
        return;
    }

    try {
        const csvData = convertEventsToCSV(filteredEvents);
        downloadCSV(csvData, `secunik-events-${Date.now()}.csv`);
        dashboard?.showNotification('Events exported successfully', 'success');
    } catch (error) {
        console.error('Events export failed:', error);
        dashboard?.showNotification('Failed to export events', 'error');
    }
}

function convertEventsToCSV(events) {
    const headers = ['Timestamp', 'Severity', 'Event Type', 'Source', 'Description', 'Details'];
    const csvRows = [headers.join(',')];

    events.forEach(event => {
        const row = [
            `"${formatTimestamp(event.timestamp || event.Timestamp)}"`,
            `"${(event.severity || event.Severity || '').toUpperCase()}"`,
            `"${event.eventType || event.EventType || ''}"`,
            `"${event.source || event.Source || ''}"`,
            `"${(event.description || event.Description || '').replace(/"/g, '""')}"`,
            `"${(event.details || event.Details || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
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

// Global functions for button actions
window.viewEventDetails = function (eventIndex) {
    const event = filteredEvents[eventIndex];
    if (!event) return;

    const modal = createEventDetailsModal(event);
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    dashboard?.showNotification('Event details opened', 'info', 2000);
};

window.createCaseFromEvent = function (eventIndex) {
    const event = filteredEvents[eventIndex];
    if (!event) return;

    // Switch to case management tab and pre-fill form
    dashboard?.switchToTab('case');

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
            descriptionField.value = `Automated case creation from security event.\n\nEvent Details:\n${event.description || event.Description || 'No description available'}`;
        }
    }, 100);
};

window.exportSingleEvent = function (eventIndex) {
    const event = filteredEvents[eventIndex];
    if (!event) return;

    try {
        const csvData = convertEventsToCSV([event]);
        downloadCSV(csvData, `secunik-event-${eventIndex}-${Date.now()}.csv`);
        dashboard?.showNotification('Event exported successfully', 'success');
    } catch (error) {
        console.error('Single event export failed:', error);
        dashboard?.showNotification('Failed to export event', 'error');
    }
};

function createEventDetailsModal(event) {
    const modal = document.createElement('div');
    modal.className = 'event-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeEventModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Event Details</h3>
                <button class="modal-close" onclick="closeEventModal()">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="event-details">
                    <div class="detail-row">
                        <label>Timestamp:</label>
                        <span>${formatTimestamp(event.timestamp || event.Timestamp)}</span>
                    </div>
                    <div class="detail-row">
                        <label>Severity:</label>
                        <span class="severity-badge ${(event.severity || event.Severity || 'low').toLowerCase()}">
                            ${(event.severity || event.Severity || '').toUpperCase()}
                        </span>
                    </div>
                    <div class="detail-row">
                        <label>Event Type:</label>
                        <span>${event.eventType || event.EventType || 'Unknown'}</span>
                    </div>
                    <div class="detail-row">
                        <label>Source:</label>
                        <span>${event.source || event.Source || 'Unknown'}</span>
                    </div>
                    <div class="detail-row">
                        <label>Description:</label>
                        <span>${event.description || event.Description || 'No description'}</span>
                    </div>
                    ${event.details || event.Details ? `
                        <div class="detail-row">
                            <label>Details:</label>
                            <pre class="event-details-text">${event.details || event.Details}</pre>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeEventModal()">Close</button>
                <button class="btn btn-primary" onclick="createCaseFromEvent(${filteredEvents.indexOf(event)})">
                    Create Case
                </button>
            </div>
        </div>
    `;

    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: none;
        align-items: center;
        justify-content: center;
    `;

    return modal;
}

window.closeEventModal = function () {
    const modal = document.querySelector('.event-modal');
    if (modal) {
        modal.remove();
    }
};