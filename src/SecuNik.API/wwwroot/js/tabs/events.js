/**
 * SecuNik Events Tab - Fixed Version
 * Security events analysis and management
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

let dashboard = null;
let eventsData = [];
let filteredEvents = [];
let currentFilters = {
    severity: 'all',
    type: 'all',
    timeRange: 'all',
    search: ''
};
let currentSort = {
    field: 'timestamp',
    direction: 'desc'
};
let currentPage = 1;
let itemsPerPage = 25;

/**
 * Initialize events tab
 */
export function init(dashboardInstance) {
    dashboard = dashboardInstance;
    console.log('✅ Events tab initialized');

    // Render initial state if no analysis data
    if (!dashboard.state.currentAnalysis) {
        renderEmptyState();
    }
}

/**
 * Render events tab with analysis data
 */
export function render(analysis) {
    if (!analysis) {
        renderEmptyState();
        return;
    }

    console.log('📊 Rendering events tab with analysis data');

    // Extract events from analysis data
    const data = analysis.result;
    eventsData = data.technical?.securityEvents || data.Technical?.SecurityEvents || [];

    // Process and enhance events data
    eventsData = processEventsData(eventsData);
    filteredEvents = [...eventsData];

    // Render the events interface
    renderEventsInterface();

    // Apply initial filters and sorting
    applyFiltersAndSort();

    console.log(`✅ Events tab rendered with ${eventsData.length} events`);
}

/**
 * Render empty state when no analysis data
 */
function renderEmptyState() {
    const eventsTab = document.getElementById('eventsTab');
    if (!eventsTab) return;

    eventsTab.innerHTML = `
        <div class="empty-state">
            <div class="empty-content">
                <i data-feather="shield" width="64" height="64"></i>
                <h2>No Security Events</h2>
                <p>Upload and analyze a file to view security events and threats</p>
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
 * Render main events interface
 */
function renderEventsInterface() {
    const eventsTab = document.getElementById('eventsTab');
    if (!eventsTab) return;

    eventsTab.innerHTML = `
        <div class="events-container">
            <!-- Events Header -->
            <div class="section-header">
                <h2><i data-feather="shield-alert" aria-hidden="true"></i> Security Events</h2>
                <div class="header-actions">
                    <div class="events-summary">
                        <span class="total-events">${eventsData.length} Total Events</span>
                        <span class="critical-count">${getCriticalCount()} Critical</span>
                        <span class="high-count">${getHighCount()} High</span>
                    </div>
                    <button class="btn btn-secondary" id="exportEventsBtn">
                        <i data-feather="download"></i> Export
                    </button>
                    <button class="btn btn-primary" id="refreshEventsBtn">
                        <i data-feather="refresh-cw"></i> Refresh
                    </button>
                </div>
            </div>

            <!-- Events Controls -->
            <div class="events-controls">
                <div class="controls-row">
                    <!-- Search -->
                    <div class="control-group">
                        <label for="eventsSearch">Search Events:</label>
                        <div class="search-input-group">
                            <input type="text" id="eventsSearch" placeholder="Search events, IPs, users..." 
                                   value="${currentFilters.search}">
                            <button class="search-btn" id="searchEventsBtn">
                                <i data-feather="search"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Severity Filter -->
                    <div class="control-group">
                        <label for="severityFilter">Severity:</label>
                        <select id="severityFilter" value="${currentFilters.severity}">
                            <option value="all">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <!-- Type Filter -->
                    <div class="control-group">
                        <label for="typeFilter">Event Type:</label>
                        <select id="typeFilter" value="${currentFilters.type}">
                            <option value="all">All Types</option>
                            ${getUniqueEventTypes().map(type =>
        `<option value="${type}">${type}</option>`
    ).join('')}
                        </select>
                    </div>

                    <!-- Time Range Filter -->
                    <div class="control-group">
                        <label for="timeRangeFilter">Time Range:</label>
                        <select id="timeRangeFilter" value="${currentFilters.timeRange}">
                            <option value="all">All Time</option>
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                </div>

                <div class="controls-row">
                    <!-- Sort Options -->
                    <div class="control-group">
                        <label for="sortField">Sort By:</label>
                        <select id="sortField" value="${currentSort.field}">
                            <option value="timestamp">Timestamp</option>
                            <option value="severity">Severity</option>
                            <option value="type">Event Type</option>
                            <option value="source">Source</option>
                        </select>
                    </div>

                    <div class="control-group">
                        <label for="sortDirection">Order:</label>
                        <select id="sortDirection" value="${currentSort.direction}">
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>

                    <!-- Items Per Page -->
                    <div class="control-group">
                        <label for="itemsPerPage">Show:</label>
                        <select id="itemsPerPage" value="${itemsPerPage}">
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </select>
                    </div>

                    <!-- Clear Filters -->
                    <div class="control-group">
                        <button class="btn btn-outline" id="clearFiltersBtn">
                            <i data-feather="x"></i> Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <!-- Events Statistics -->
            <div class="events-stats" id="eventsStats">
                <!-- Will be populated by updateEventsStats() -->
            </div>

            <!-- Events Table Container -->
            <div class="events-table-container">
                <div class="table-header">
                    <h3>Events List</h3>
                    <div class="table-info">
                        <span id="eventsShowing">Showing 0 events</span>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    <table class="events-table" id="eventsTable">
                        <thead>
                            <tr>
                                <th class="sortable" data-field="timestamp">
                                    <i data-feather="clock" width="16" height="16"></i> Timestamp
                                    <i class="sort-icon" data-feather="chevron-down" width="12" height="12"></i>
                                </th>
                                <th class="sortable" data-field="severity">
                                    <i data-feather="alert-triangle" width="16" height="16"></i> Severity
                                    <i class="sort-icon" data-feather="chevron-down" width="12" height="12"></i>
                                </th>
                                <th class="sortable" data-field="type">
                                    <i data-feather="tag" width="16" height="16"></i> Type
                                    <i class="sort-icon" data-feather="chevron-down" width="12" height="12"></i>
                                </th>
                                <th>
                                    <i data-feather="file-text" width="16" height="16"></i> Description
                                </th>
                                <th class="sortable" data-field="source">
                                    <i data-feather="monitor" width="16" height="16"></i> Source
                                    <i class="sort-icon" data-feather="chevron-down" width="12" height="12"></i>
                                </th>
                                <th>
                                    <i data-feather="settings" width="16" height="16"></i> Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody id="eventsTableBody">
                            <!-- Table rows will be populated here -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination-container" id="paginationContainer">
                    <!-- Pagination will be rendered here -->
                </div>
            </div>

            <!-- Event Details Modal -->
            <div class="event-details-modal" id="eventDetailsModal" style="display: none;">
                <div class="modal-backdrop" onclick="closeEventDetails()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Event Details</h3>
                        <button class="modal-close" onclick="closeEventDetails()">
                            <i data-feather="x"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="eventDetailsContent">
                        <!-- Event details will be populated here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Setup event listeners
    setupEventsEventListeners();
}

/**
 * Process and enhance events data
 */
function processEventsData(events) {
    return events.map((event, index) => {
        // Ensure consistent structure
        const processedEvent = {
            id: event.id || index + 1,
            timestamp: event.timestamp || event.Timestamp || new Date().toISOString(),
            severity: (event.severity || event.Severity || 'low').toLowerCase(),
            type: event.type || event.Type || 'Unknown Event',
            description: event.description || event.Description || 'No description available',
            source: event.source || event.Source || event.sourceIP || event.SourceIP || 'Unknown',
            user: event.user || event.User || event.username || event.Username || 'Unknown',
            details: event.details || event.Details || {},
            ...event // Preserve any additional fields
        };

        // Add computed fields
        processedEvent.timestampObj = new Date(processedEvent.timestamp);
        processedEvent.formattedTime = formatTimestamp(processedEvent.timestamp);
        processedEvent.severityScore = getSeverityScore(processedEvent.severity);

        return processedEvent;
    }).sort((a, b) => b.timestampObj - a.timestampObj); // Default sort by timestamp desc
}

/**
 * Setup event listeners for events tab
 */
function setupEventsEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('eventsSearch');
    const searchBtn = document.getElementById('searchEventsBtn');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Filter controls
    const severityFilter = document.getElementById('severityFilter');
    const typeFilter = document.getElementById('typeFilter');
    const timeRangeFilter = document.getElementById('timeRangeFilter');

    if (severityFilter) {
        severityFilter.addEventListener('change', handleFilterChange);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', handleFilterChange);
    }
    if (timeRangeFilter) {
        timeRangeFilter.addEventListener('change', handleFilterChange);
    }

    // Sort controls
    const sortField = document.getElementById('sortField');
    const sortDirection = document.getElementById('sortDirection');

    if (sortField) {
        sortField.addEventListener('change', handleSortChange);
    }
    if (sortDirection) {
        sortDirection.addEventListener('change', handleSortChange);
    }

    // Items per page
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', handleItemsPerPageChange);
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Export events
    const exportBtn = document.getElementById('exportEventsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportEvents);
    }

    // Refresh events
    const refreshBtn = document.getElementById('refreshEventsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshEvents);
    }

    // Table sorting
    const sortableHeaders = document.querySelectorAll('.events-table th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-field');
            handleTableSort(field);
        });
    });
}

/**
 * Handle search functionality
 */
function handleSearch() {
    const searchInput = document.getElementById('eventsSearch');
    if (!searchInput) return;

    currentFilters.search = searchInput.value.trim().toLowerCase();
    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Handle filter changes
 */
function handleFilterChange() {
    const severityFilter = document.getElementById('severityFilter');
    const typeFilter = document.getElementById('typeFilter');
    const timeRangeFilter = document.getElementById('timeRangeFilter');

    if (severityFilter) currentFilters.severity = severityFilter.value;
    if (typeFilter) currentFilters.type = typeFilter.value;
    if (timeRangeFilter) currentFilters.timeRange = timeRangeFilter.value;

    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Handle sort changes
 */
function handleSortChange() {
    const sortField = document.getElementById('sortField');
    const sortDirection = document.getElementById('sortDirection');

    if (sortField) currentSort.field = sortField.value;
    if (sortDirection) currentSort.direction = sortDirection.value;

    applyFiltersAndSort();
}

/**
 * Handle items per page change
 */
function handleItemsPerPageChange() {
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (!itemsPerPageSelect) return;

    itemsPerPage = parseInt(itemsPerPageSelect.value);
    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Handle table header sorting
 */
function handleTableSort(field) {
    if (currentSort.field === field) {
        // Toggle direction if same field
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // New field, default to desc
        currentSort.field = field;
        currentSort.direction = 'desc';
    }

    // Update sort selects
    const sortField = document.getElementById('sortField');
    const sortDirection = document.getElementById('sortDirection');
    if (sortField) sortField.value = currentSort.field;
    if (sortDirection) sortDirection.value = currentSort.direction;

    applyFiltersAndSort();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    currentFilters = {
        severity: 'all',
        type: 'all',
        timeRange: 'all',
        search: ''
    };

    // Reset form controls
    const searchInput = document.getElementById('eventsSearch');
    const severityFilter = document.getElementById('severityFilter');
    const typeFilter = document.getElementById('typeFilter');
    const timeRangeFilter = document.getElementById('timeRangeFilter');

    if (searchInput) searchInput.value = '';
    if (severityFilter) severityFilter.value = 'all';
    if (typeFilter) typeFilter.value = 'all';
    if (timeRangeFilter) timeRangeFilter.value = 'all';

    currentPage = 1;
    applyFiltersAndSort();
}

/**
 * Apply filters and sorting
 */
function applyFiltersAndSort() {
    // Start with all events
    filteredEvents = [...eventsData];

    // Apply filters
    filteredEvents = filteredEvents.filter(event => {
        // Severity filter
        if (currentFilters.severity !== 'all' && event.severity !== currentFilters.severity) {
            return false;
        }

        // Type filter
        if (currentFilters.type !== 'all' && event.type !== currentFilters.type) {
            return false;
        }

        // Time range filter
        if (currentFilters.timeRange !== 'all') {
            const now = new Date();
            const eventTime = event.timestampObj;
            let cutoffTime;

            switch (currentFilters.timeRange) {
                case '1h':
                    cutoffTime = new Date(now.getTime() - (60 * 60 * 1000));
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
                default:
                    cutoffTime = null;
            }

            if (cutoffTime && eventTime < cutoffTime) {
                return false;
            }
        }

        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const searchFields = [
                event.type,
                event.description,
                event.source,
                event.user,
                JSON.stringify(event.details)
            ].join(' ').toLowerCase();

            if (!searchFields.includes(searchLower)) {
                return false;
            }
        }

        return true;
    });

    // Apply sorting
    filteredEvents.sort((a, b) => {
        let aValue = a[currentSort.field];
        let bValue = b[currentSort.field];

        // Handle special cases
        if (currentSort.field === 'timestamp') {
            aValue = a.timestampObj;
            bValue = b.timestampObj;
        } else if (currentSort.field === 'severity') {
            aValue = a.severityScore;
            bValue = b.severityScore;
        }

        // Convert to strings for comparison if needed
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
        }
        if (typeof bValue === 'string') {
            bValue = bValue.toLowerCase();
        }

        if (currentSort.direction === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });

    // Update display
    updateEventsStats();
    renderEventsTable();
    renderPagination();
}

/**
 * Update events statistics
 */
function updateEventsStats() {
    const statsContainer = document.getElementById('eventsStats');
    if (!statsContainer) return;

    const total = filteredEvents.length;
    const critical = filteredEvents.filter(e => e.severity === 'critical').length;
    const high = filteredEvents.filter(e => e.severity === 'high').length;
    const medium = filteredEvents.filter(e => e.severity === 'medium').length;
    const low = filteredEvents.filter(e => e.severity === 'low').length;

    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total Events</div>
            </div>
            <div class="stat-item critical">
                <div class="stat-value">${critical}</div>
                <div class="stat-label">Critical</div>
            </div>
            <div class="stat-item high">
                <div class="stat-value">${high}</div>
                <div class="stat-label">High</div>
            </div>
            <div class="stat-item medium">
                <div class="stat-value">${medium}</div>
                <div class="stat-label">Medium</div>
            </div>
            <div class="stat-item low">
                <div class="stat-value">${low}</div>
                <div class="stat-label">Low</div>
            </div>
        </div>
    `;
}

/**
 * Render events table
 */
function renderEventsTable() {
    const tbody = document.getElementById('eventsTableBody');
    const showingSpan = document.getElementById('eventsShowing');

    if (!tbody) return;

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageEvents = filteredEvents.slice(startIndex, endIndex);

    // Update showing text
    if (showingSpan) {
        showingSpan.textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, filteredEvents.length)} of ${filteredEvents.length} events`;
    }

    // Render table rows
    if (pageEvents.length === 0) {
        tbody.innerHTML = `
            <tr class="no-events">
                <td colspan="6">
                    <div class="no-events-content">
                        <i data-feather="search" width="32" height="32"></i>
                        <p>No events match your current filters</p>
                        <button class="btn btn-outline" onclick="clearAllFilters()">Clear Filters</button>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageEvents.map(event => `
            <tr class="event-row ${event.severity}" data-event-id="${event.id}">
                <td class="timestamp-cell">
                    <div class="timestamp-full">${event.formattedTime}</div>
                    <div class="timestamp-short">${formatTimestampShort(event.timestamp)}</div>
                </td>
                <td class="severity-cell">
                    <span class="severity-badge ${event.severity}">
                        <i data-feather="${getSeverityIcon(event.severity)}" width="12" height="12"></i>
                        ${event.severity.toUpperCase()}
                    </span>
                </td>
                <td class="type-cell">
                    <span class="event-type">${event.type}</span>
                </td>
                <td class="description-cell">
                    <div class="description-text" title="${event.description}">
                        ${truncateText(event.description, 100)}
                    </div>
                </td>
                <td class="source-cell">
                    <div class="source-info">
                        <div class="source-primary">${event.source}</div>
                        ${event.user !== 'Unknown' ? `<div class="source-user">User: ${event.user}</div>` : ''}
                    </div>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="showEventDetails(${event.id})" title="View Details">
                            <i data-feather="eye" width="14" height="14"></i>
                        </button>
                        <button class="btn-icon" onclick="createCaseFromEvent(${event.id})" title="Create Case">
                            <i data-feather="folder-plus" width="14" height="14"></i>
                        </button>
                        <button class="btn-icon" onclick="exportSingleEvent(${event.id})" title="Export">
                            <i data-feather="download" width="14" height="14"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Render pagination
 */
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    let paginationHTML = `
        <div class="pagination">
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="changePage(1)" title="First Page">
                <i data-feather="chevrons-left" width="14" height="14"></i>
            </button>
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="changePage(${currentPage - 1})" title="Previous Page">
                <i data-feather="chevron-left" width="14" height="14"></i>
            </button>
    `;

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }

    paginationHTML += `
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changePage(${currentPage + 1})" title="Next Page">
                <i data-feather="chevron-right" width="14" height="14"></i>
            </button>
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changePage(${totalPages})" title="Last Page">
                <i data-feather="chevrons-right" width="14" height="14"></i>
            </button>
        </div>
        <div class="pagination-info">
            Page ${currentPage} of ${totalPages}
        </div>
    `;

    container.innerHTML = paginationHTML;

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Export events to CSV
 */
function exportEvents() {
    try {
        const csvData = convertEventsToCSV(filteredEvents);
        downloadCSV(csvData, `secunik-events-${Date.now()}.csv`);
        dashboard?.showNotification('Events exported successfully', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        dashboard?.showNotification('Failed to export events', 'error');
    }
}

/**
 * Refresh events (re-render)
 */
function refreshEvents() {
    if (dashboard?.state.currentAnalysis) {
        render(dashboard.state.currentAnalysis);
        dashboard?.showNotification('Events refreshed', 'success');
    }
}

// Helper functions

function getCriticalCount() {
    return eventsData.filter(e => e.severity === 'critical').length;
}

function getHighCount() {
    return eventsData.filter(e => e.severity === 'high').length;
}

function getUniqueEventTypes() {
    const types = [...new Set(eventsData.map(e => e.type))];
    return types.filter(type => type && type !== 'Unknown Event').sort();
}

function getSeverityScore(severity) {
    const scores = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return scores[severity.toLowerCase()] || 0;
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
        return timestamp || 'Unknown';
    }
}

function formatTimestampShort(timestamp) {
    try {
        return new Date(timestamp).toLocaleTimeString();
    } catch {
        return 'Unknown';
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

function convertEventsToCSV(events) {
    const headers = ['Timestamp', 'Severity', 'Type', 'Description', 'Source', 'User'];
    const rows = events.map(event => [
        event.formattedTime,
        event.severity,
        event.type,
        event.description,
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

// Global functions for onclick handlers
window.changePage = function (page) {
    currentPage = page;
    renderEventsTable();
    renderPagination();
};

window.showEventDetails = function (eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('eventDetailsModal');
    const content = document.getElementById('eventDetailsContent');

    if (!modal || !content) return;

    content.innerHTML = `
        <div class="event-details">
            <div class="detail-section">
                <h4>Basic Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Event ID:</label>
                        <span>${event.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Timestamp:</label>
                        <span>${event.formattedTime}</span>
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
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Description</h4>
                <p>${event.description}</p>
            </div>
            
            ${Object.keys(event.details).length > 0 ? `
                <div class="detail-section">
                    <h4>Additional Details</h4>
                    <pre class="details-json">${JSON.stringify(event.details, null, 2)}</pre>
                </div>
            ` : ''}
            
            <div class="detail-actions">
                <button class="btn btn-primary" onclick="createCaseFromEvent(${event.id})">
                    <i data-feather="folder-plus"></i> Create Case
                </button>
                <button class="btn btn-secondary" onclick="exportSingleEvent(${event.id})">
                    <i data-feather="download"></i> Export Event
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
};

window.closeEventDetails = function () {
    const modal = document.getElementById('eventDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.createCaseFromEvent = function (eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    dashboard?.switchToTab('caseManagement');

    // Fill case form with event data
    setTimeout(() => {
        const titleField = document.getElementById('caseTitle');
        const severityField = document.getElementById('caseSeverity');
        const descriptionField = document.getElementById('caseDescription');

        if (titleField) {
            titleField.value = `Security Event: ${event.type}`;
        }

        if (severityField) {
            severityField.value = event.severity;
        }

        if (descriptionField) {
            descriptionField.value = `Case created from security event.\n\nEvent: ${event.type}\nTime: ${event.formattedTime}\nSource: ${event.source}\nDescription: ${event.description}`;
        }
    }, 100);
};

window.exportSingleEvent = function (eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    try {
        const csvData = convertEventsToCSV([event]);
        downloadCSV(csvData, `secunik-event-${eventId}-${Date.now()}.csv`);
        dashboard?.showNotification('Event exported successfully', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        dashboard?.showNotification('Failed to export event', 'error');
    }
};

window.clearAllFilters = clearAllFilters;

// Export functions
export { init, render };
