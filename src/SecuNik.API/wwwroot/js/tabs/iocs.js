/**
 * SecuNik IOCs Tab - Fixed Version
 * Indicators of Compromise analysis and management
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

let dashboard = null;
let iocsData = [];
let filteredIOCs = [];
let currentFilters = {
    type: 'all',
    confidence: 'all',
    source: 'all',
    search: ''
};
let currentSort = {
    field: 'confidence',
    direction: 'desc'
};
let currentPage = 1;
let itemsPerPage = 25;

/**
 * Initialize IOCs tab
 */
export function init(dashboardInstance) {
    dashboard = dashboardInstance;
    console.log('✅ IOCs tab initialized');

    // Render initial state if no analysis data
    if (!dashboard.state.currentAnalysis) {
        renderEmptyState();
    }
}

/**
 * Render IOCs tab with analysis data
 */
export function render(analysis) {
    if (!analysis) {
        renderEmptyState();
        return;
    }

    console.log('📊 Rendering IOCs tab with analysis data');

    // Extract IOCs from analysis data
    const data = analysis.result;
    iocsData = data.technical?.detectedIOCs || data.Technical?.DetectedIOCs || [];

    // Process and enhance IOCs data
    iocsData = processIOCsData(iocsData);
    filteredIOCs = [...iocsData];

    // Render the IOCs interface
    renderIOCsInterface();

    // Apply initial filters and sorting
    applyFiltersAndSort();

    console.log(`✅ IOCs tab rendered with ${iocsData.length} IOCs`);
}

/**
 * Render empty state when no analysis data
 */
function renderEmptyState() {
    const iocsTab = document.getElementById('iocsTab');
    if (!iocsTab) return;

    iocsTab.innerHTML = `
        <div class="empty-state">
            <div class="empty-content">
                <i data-feather="target" width="64" height="64"></i>
                <h2>No IOCs Detected</h2>
                <p>Upload and analyze a file to detect indicators of compromise</p>
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
 * Render main IOCs interface
 */
function renderIOCsInterface() {
    const iocsTab = document.getElementById('iocsTab');
    if (!iocsTab) return;

    iocsTab.innerHTML = `
        <div class="iocs-container">
            <!-- IOCs Header -->
            <div class="section-header">
                <h2><i data-feather="target" aria-hidden="true"></i> Indicators of Compromise</h2>
                <div class="header-actions">
                    <div class="iocs-summary">
                        <span class="total-iocs">${iocsData.length} Total IOCs</span>
                        <span class="high-confidence">${getHighConfidenceCount()} High Confidence</span>
                        <span class="unique-types">${getUniqueTypesCount()} Types</span>
                    </div>
                    <button class="btn btn-secondary" id="exportIOCsBtn">
                        <i data-feather="download"></i> Export IOCs
                    </button>
                    <button class="btn btn-secondary" id="generateIOCReportBtn">
                        <i data-feather="file-text"></i> Generate Report
                    </button>
                    <button class="btn btn-primary" id="refreshIOCsBtn">
                        <i data-feather="refresh-cw"></i> Refresh
                    </button>
                </div>
            </div>

            <!-- IOCs Controls -->
            <div class="iocs-controls">
                <div class="controls-row">
                    <!-- Search -->
                    <div class="control-group">
                        <label for="iocsSearch">Search IOCs:</label>
                        <div class="search-input-group">
                            <input type="text" id="iocsSearch" placeholder="Search IOCs, IPs, domains..." 
                                   value="${currentFilters.search}">
                            <button class="search-btn" id="searchIOCsBtn">
                                <i data-feather="search"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Type Filter -->
                    <div class="control-group">
                        <label for="typeFilter">IOC Type:</label>
                        <select id="typeFilter" value="${currentFilters.type}">
                            <option value="all">All Types</option>
                            ${getUniqueIOCTypes().map(type =>
        `<option value="${type}">${type.toUpperCase()}</option>`
    ).join('')}
                        </select>
                    </div>

                    <!-- Confidence Filter -->
                    <div class="control-group">
                        <label for="confidenceFilter">Confidence:</label>
                        <select id="confidenceFilter" value="${currentFilters.confidence}">
                            <option value="all">All Confidence</option>
                            <option value="high">High (80%+)</option>
                            <option value="medium">Medium (60-79%)</option>
                            <option value="low">Low (<60%)</option>
                        </select>
                    </div>

                    <!-- Source Filter -->
                    <div class="control-group">
                        <label for="sourceFilter">Source:</label>
                        <select id="sourceFilter" value="${currentFilters.source}">
                            <option value="all">All Sources</option>
                            ${getUniqueSources().map(source =>
        `<option value="${source}">${source}</option>`
    ).join('')}
                        </select>
                    </div>
                </div>

                <div class="controls-row">
                    <!-- Sort Options -->
                    <div class="control-group">
                        <label for="sortField">Sort By:</label>
                        <select id="sortField" value="${currentSort.field}">
                            <option value="confidence">Confidence</option>
                            <option value="type">Type</option>
                            <option value="value">Value</option>
                            <option value="firstSeen">First Seen</option>
                            <option value="lastSeen">Last Seen</option>
                        </select>
                    </div>

                    <div class="control-group">
                        <label for="sortDirection">Order:</label>
                        <select id="sortDirection" value="${currentSort.direction}">
                            <option value="desc">Highest First</option>
                            <option value="asc">Lowest First</option>
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
                        <button class="btn btn-outline" id="clearIOCFiltersBtn">
                            <i data-feather="x"></i> Clear Filters
                        </button>
                    </div>

                    <!-- Bulk Actions -->
                    <div class="control-group">
                        <button class="btn btn-outline" id="selectAllIOCsBtn">
                            <i data-feather="check-square"></i> Select All
                        </button>
                        <button class="btn btn-outline" id="bulkExportBtn" disabled>
                            <i data-feather="download"></i> Export Selected
                        </button>
                    </div>
                </div>
            </div>

            <!-- IOCs Statistics -->
            <div class="iocs-stats" id="iocsStats">
                <!-- Will be populated by updateIOCsStats() -->
            </div>

            <!-- IOCs Categories Overview -->
            <div class="iocs-categories-section">
                <h3>IOC Categories Overview</h3>
                <div class="iocs-categories-grid" id="iocsCategoriesGrid">
                    <!-- Will be populated by renderCategoriesOverview() -->
                </div>
            </div>

            <!-- IOCs Table Container -->
            <div class="iocs-table-container">
                <div class="table-header">
                    <h3>IOCs List</h3>
                    <div class="table-info">
                        <span id="iocsShowing">Showing 0 IOCs</span>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    <table class="iocs-table" id="iocsTable">
                        <thead>
                            <tr>
                                <th class="select-column">
                                    <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll()">
                                </th>
                                <th class="sortable" data-field="type">
                                    <i data-feather="tag" width="16" height="16"></i> Type
                                    <i class="sort-icon" data-feather="chevron-down" width="12" height="12"></i>
                                </th>
                                <th class="sortable" data-field="value">
                                    <i data-feather="search" width="16" height="16"></i> Value
                                    <i class="sort-icon" data-feather="chevron-down" width="12" height="12"></i>
                                </th>
                                <th class="sortable" data-field="confidence">
                                    <i data-feather="trending-up" width="16" height="16"></i> Confidence
                                    <i class="sort-icon" data-feather="chevron-down" width="12" height="12"></i>
                                </th>
                                <th class="sortable" data-field="firstSeen">
                                    <i data-feather="clock" width="16" height="16"></i> First Seen
                                    <i class="sort-icon" data-feather="chevron-down" width="12" height="12"></i>
                                </th>
                                <th>
                                    <i data-feather="database" width="16" height="16"></i> Source
                                </th>
                                <th>
                                    <i data-feather="alert-triangle" width="16" height="16"></i> Threat Level
                                </th>
                                <th>
                                    <i data-feather="settings" width="16" height="16"></i> Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody id="iocsTableBody">
                            <!-- Table rows will be populated here -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination-container" id="iocsPaginationContainer">
                    <!-- Pagination will be rendered here -->
                </div>
            </div>

            <!-- IOC Details Modal -->
            <div class="ioc-details-modal" id="iocDetailsModal" style="display: none;">
                <div class="modal-backdrop" onclick="closeIOCDetails()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>IOC Details</h3>
                        <button class="modal-close" onclick="closeIOCDetails()">
                            <i data-feather="x"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="iocDetailsContent">
                        <!-- IOC details will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Threat Intelligence Panel -->
            <div class="threat-intel-panel" id="threatIntelPanel" style="display: none;">
                <div class="panel-header">
                    <h3>Threat Intelligence</h3>
                    <button class="panel-close" onclick="closeThreatIntelPanel()">
                        <i data-feather="x"></i>
                    </button>
                </div>
                <div class="panel-content" id="threatIntelContent">
                    <!-- Threat intel will be populated here -->
                </div>
            </div>
        </div>
    `;

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Setup event listeners
    setupIOCsEventListeners();
}

/**
 * Process and enhance IOCs data
 */
function processIOCsData(iocs) {
    return iocs.map((ioc, index) => {
        // Ensure consistent structure
        const processedIOC = {
            id: ioc.id || index + 1,
            type: (ioc.type || ioc.Type || 'unknown').toLowerCase(),
            value: ioc.value || ioc.Value || 'Unknown',
            confidence: parseFloat(ioc.confidence || ioc.Confidence || 0),
            firstSeen: ioc.firstSeen || ioc.FirstSeen || ioc.timestamp || new Date().toISOString(),
            lastSeen: ioc.lastSeen || ioc.LastSeen || ioc.timestamp || new Date().toISOString(),
            source: ioc.source || ioc.Source || 'SecuNik Analysis Engine',
            description: ioc.description || ioc.Description || '',
            tags: ioc.tags || ioc.Tags || [],
            threatLevel: ioc.threatLevel || ioc.ThreatLevel || calculateThreatLevel(ioc.confidence || 0),
            references: ioc.references || ioc.References || [],
            context: ioc.context || ioc.Context || {},
            ...ioc // Preserve any additional fields
        };

        // Add computed fields
        processedIOC.firstSeenObj = new Date(processedIOC.firstSeen);
        processedIOC.lastSeenObj = new Date(processedIOC.lastSeen);
        processedIOC.formattedFirstSeen = formatTimestamp(processedIOC.firstSeen);
        processedIOC.formattedLastSeen = formatTimestamp(processedIOC.lastSeen);
        processedIOC.confidenceLevel = getConfidenceLevel(processedIOC.confidence);
        processedIOC.typeIcon = getTypeIcon(processedIOC.type);

        return processedIOC;
    }).sort((a, b) => b.confidence - a.confidence); // Default sort by confidence desc
}

/**
 * Setup event listeners for IOCs tab
 */
function setupIOCsEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('iocsSearch');
    const searchBtn = document.getElementById('searchIOCsBtn');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleIOCSearch, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleIOCSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleIOCSearch);
    }

    // Filter controls
    const typeFilter = document.getElementById('typeFilter');
    const confidenceFilter = document.getElementById('confidenceFilter');
    const sourceFilter = document.getElementById('sourceFilter');

    if (typeFilter) {
        typeFilter.addEventListener('change', handleIOCFilterChange);
    }
    if (confidenceFilter) {
        confidenceFilter.addEventListener('change', handleIOCFilterChange);
    }
    if (sourceFilter) {
        sourceFilter.addEventListener('change', handleIOCFilterChange);
    }

    // Sort controls
    const sortField = document.getElementById('sortField');
    const sortDirection = document.getElementById('sortDirection');

    if (sortField) {
        sortField.addEventListener('change', handleIOCSortChange);
    }
    if (sortDirection) {
        sortDirection.addEventListener('change', handleIOCSortChange);
    }

    // Items per page
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', handleIOCItemsPerPageChange);
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clearIOCFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllIOCFilters);
    }

    // Bulk actions
    const selectAllBtn = document.getElementById('selectAllIOCsBtn');
    const bulkExportBtn = document.getElementById('bulkExportBtn');

    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllIOCs);
    }
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', bulkExportIOCs);
    }

    // Export and report buttons
    const exportBtn = document.getElementById('exportIOCsBtn');
    const reportBtn = document.getElementById('generateIOCReportBtn');
    const refreshBtn = document.getElementById('refreshIOCsBtn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportIOCs);
    }
    if (reportBtn) {
        reportBtn.addEventListener('click', generateIOCReport);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshIOCs);
    }

    // Table sorting
    const sortableHeaders = document.querySelectorAll('.iocs-table th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-field');
            handleIOCTableSort(field);
        });
    });
}

/**
 * Handle IOC search functionality
 */
function handleIOCSearch() {
    const searchInput = document.getElementById('iocsSearch');
    if (!searchInput) return;

    currentFilters.search = searchInput.value.trim().toLowerCase();
    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Handle IOC filter changes
 */
function handleIOCFilterChange() {
    const typeFilter = document.getElementById('typeFilter');
    const confidenceFilter = document.getElementById('confidenceFilter');
    const sourceFilter = document.getElementById('sourceFilter');

    if (typeFilter) currentFilters.type = typeFilter.value;
    if (confidenceFilter) currentFilters.confidence = confidenceFilter.value;
    if (sourceFilter) currentFilters.source = sourceFilter.value;

    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Handle IOC sort changes
 */
function handleIOCSortChange() {
    const sortField = document.getElementById('sortField');
    const sortDirection = document.getElementById('sortDirection');

    if (sortField) currentSort.field = sortField.value;
    if (sortDirection) currentSort.direction = sortDirection.value;

    applyFiltersAndSort();
}

/**
 * Handle IOC items per page change
 */
function handleIOCItemsPerPageChange() {
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (!itemsPerPageSelect) return;

    itemsPerPage = parseInt(itemsPerPageSelect.value);
    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Handle IOC table header sorting
 */
function handleIOCTableSort(field) {
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
 * Clear all IOC filters
 */
function clearAllIOCFilters() {
    currentFilters = {
        type: 'all',
        confidence: 'all',
        source: 'all',
        search: ''
    };

    // Reset form controls
    const searchInput = document.getElementById('iocsSearch');
    const typeFilter = document.getElementById('typeFilter');
    const confidenceFilter = document.getElementById('confidenceFilter');
    const sourceFilter = document.getElementById('sourceFilter');

    if (searchInput) searchInput.value = '';
    if (typeFilter) typeFilter.value = 'all';
    if (confidenceFilter) confidenceFilter.value = 'all';
    if (sourceFilter) sourceFilter.value = 'all';

    currentPage = 1;
    applyFiltersAndSort();
}

/**
 * Apply filters and sorting to IOCs
 */
function applyFiltersAndSort() {
    // Start with all IOCs
    filteredIOCs = [...iocsData];

    // Apply filters
    filteredIOCs = filteredIOCs.filter(ioc => {
        // Type filter
        if (currentFilters.type !== 'all' && ioc.type !== currentFilters.type) {
            return false;
        }

        // Confidence filter
        if (currentFilters.confidence !== 'all') {
            const confidence = ioc.confidence * 100;
            switch (currentFilters.confidence) {
                case 'high':
                    if (confidence < 80) return false;
                    break;
                case 'medium':
                    if (confidence < 60 || confidence >= 80) return false;
                    break;
                case 'low':
                    if (confidence >= 60) return false;
                    break;
            }
        }

        // Source filter
        if (currentFilters.source !== 'all' && ioc.source !== currentFilters.source) {
            return false;
        }

        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const searchFields = [
                ioc.value,
                ioc.type,
                ioc.source,
                ioc.description,
                ...(ioc.tags || [])
            ].join(' ').toLowerCase();

            if (!searchFields.includes(searchLower)) {
                return false;
            }
        }

        return true;
    });

    // Apply sorting
    filteredIOCs.sort((a, b) => {
        let aValue = a[currentSort.field];
        let bValue = b[currentSort.field];

        // Handle special cases
        if (currentSort.field === 'firstSeen' || currentSort.field === 'lastSeen') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (currentSort.direction === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });

    // Update display
    updateIOCsStats();
    renderCategoriesOverview();
    renderIOCsTable();
    renderIOCsPagination();
}

/**
 * Update IOCs statistics
 */
function updateIOCsStats() {
    const statsContainer = document.getElementById('iocsStats');
    if (!statsContainer) return;

    const total = filteredIOCs.length;
    const highConfidence = filteredIOCs.filter(ioc => ioc.confidence >= 0.8).length;
    const mediumConfidence = filteredIOCs.filter(ioc => ioc.confidence >= 0.6 && ioc.confidence < 0.8).length;
    const lowConfidence = filteredIOCs.filter(ioc => ioc.confidence < 0.6).length;

    const typeBreakdown = getTypeBreakdown(filteredIOCs);

    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total IOCs</div>
            </div>
            <div class="stat-item high">
                <div class="stat-value">${highConfidence}</div>
                <div class="stat-label">High Confidence</div>
            </div>
            <div class="stat-item medium">
                <div class="stat-value">${mediumConfidence}</div>
                <div class="stat-label">Medium Confidence</div>
            </div>
            <div class="stat-item low">
                <div class="stat-value">${lowConfidence}</div>
                <div class="stat-label">Low Confidence</div>
            </div>
            ${Object.entries(typeBreakdown).slice(0, 3).map(([type, count]) => `
                <div class="stat-item info">
                    <div class="stat-value">${count}</div>
                    <div class="stat-label">${type.toUpperCase()}</div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Render categories overview
 */
function renderCategoriesOverview() {
    const container = document.getElementById('iocsCategoriesGrid');
    if (!container) return;

    const typeBreakdown = getTypeBreakdown(filteredIOCs);
    const categories = Object.entries(typeBreakdown).map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? Math.round((count / filteredIOCs.length) * 100) : 0,
        highConfidence: filteredIOCs.filter(ioc => ioc.type === type && ioc.confidence >= 0.8).length
    }));

    container.innerHTML = categories.map(category => `
        <div class="category-card" onclick="filterByType('${category.type}')">
            <div class="category-header">
                <div class="category-icon">
                    <i data-feather="${getTypeIcon(category.type)}" width="24" height="24"></i>
                </div>
                <div class="category-info">
                    <div class="category-name">${category.type.toUpperCase()}</div>
                    <div class="category-count">${category.count} IOCs</div>
                </div>
            </div>
            <div class="category-details">
                <div class="category-percentage">${category.percentage}% of total</div>
                <div class="category-confidence">${category.highConfidence} high confidence</div>
            </div>
            <div class="category-progress">
                <div class="progress-bar" style="width: ${category.percentage}%"></div>
            </div>
        </div>
    `).join('');

    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Render IOCs table
 */
function renderIOCsTable() {
    const tbody = document.getElementById('iocsTableBody');
    const showingSpan = document.getElementById('iocsShowing');

    if (!tbody) return;

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageIOCs = filteredIOCs.slice(startIndex, endIndex);

    // Update showing text
    if (showingSpan) {
        showingSpan.textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, filteredIOCs.length)} of ${filteredIOCs.length} IOCs`;
    }

    // Render table rows
    if (pageIOCs.length === 0) {
        tbody.innerHTML = `
            <tr class="no-iocs">
                <td colspan="8">
                    <div class="no-iocs-content">
                        <i data-feather="search" width="32" height="32"></i>
                        <p>No IOCs match your current filters</p>
                        <button class="btn btn-outline" onclick="clearAllIOCFilters()">Clear Filters</button>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageIOCs.map(ioc => `
            <tr class="ioc-row ${ioc.confidenceLevel}" data-ioc-id="${ioc.id}">
                <td class="select-cell">
                    <input type="checkbox" class="ioc-checkbox" value="${ioc.id}" onchange="updateBulkActions()">
                </td>
                <td class="type-cell">
                    <div class="ioc-type">
                        <i data-feather="${ioc.typeIcon}" width="16" height="16"></i>
                        <span>${ioc.type.toUpperCase()}</span>
                    </div>
                </td>
                <td class="value-cell">
                    <div class="ioc-value" title="${ioc.value}">
                        <span class="value-text">${truncateText(ioc.value, 40)}</span>
                        ${ioc.value.length > 40 ? `<button class="expand-value" onclick="showFullValue('${ioc.id}')"><i data-feather="maximize-2" width="12" height="12"></i></button>` : ''}
                    </div>
                </td>
                <td class="confidence-cell">
                    <div class="confidence-display">
                        <div class="confidence-bar">
                            <div class="confidence-fill ${ioc.confidenceLevel}" style="width: ${ioc.confidence * 100}%"></div>
                        </div>
                        <span class="confidence-text">${Math.round(ioc.confidence * 100)}%</span>
                    </div>
                </td>
                <td class="timestamp-cell">
                    <div class="timestamp-display">
                        <div class="timestamp-primary">${ioc.formattedFirstSeen}</div>
                        ${ioc.lastSeen !== ioc.firstSeen ? `<div class="timestamp-secondary">Last: ${ioc.formattedLastSeen}</div>` : ''}
                    </div>
                </td>
                <td class="source-cell">
                    <div class="source-info">
                        <span class="source-name">${truncateText(ioc.source, 20)}</span>
                    </div>
                </td>
                <td class="threat-level-cell">
                    <span class="threat-level-badge ${ioc.threatLevel}">
                        ${ioc.threatLevel.toUpperCase()}
                    </span>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="showIOCDetails(${ioc.id})" title="View Details">
                            <i data-feather="eye" width="14" height="14"></i>
                        </button>
                        <button class="btn-icon" onclick="lookupThreatIntel(${ioc.id})" title="Threat Intel">
                            <i data-feather="search" width="14" height="14"></i>
                        </button>
                        <button class="btn-icon" onclick="createCaseFromIOC(${ioc.id})" title="Create Case">
                            <i data-feather="folder-plus" width="14" height="14"></i>
                        </button>
                        <button class="btn-icon" onclick="exportSingleIOC(${ioc.id})" title="Export">
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
 * Render IOCs pagination
 */
function renderIOCsPagination() {
    const container = document.getElementById('iocsPaginationContainer');
    if (!container) return;

    const totalPages = Math.ceil(filteredIOCs.length / itemsPerPage);

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
                    onclick="changeIOCPage(1)" title="First Page">
                <i data-feather="chevrons-left" width="14" height="14"></i>
            </button>
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="changeIOCPage(${currentPage - 1})" title="Previous Page">
                <i data-feather="chevron-left" width="14" height="14"></i>
            </button>
    `;

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changeIOCPage(${i})">${i}</button>
        `;
    }

    paginationHTML += `
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changeIOCPage(${currentPage + 1})" title="Next Page">
                <i data-feather="chevron-right" width="14" height="14"></i>
            </button>
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changeIOCPage(${totalPages})" title="Last Page">
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
 * Export IOCs to various formats
 */
function exportIOCs() {
    try {
        const csvData = convertIOCsToCSV(filteredIOCs);
        downloadCSV(csvData, `secunik-iocs-${Date.now()}.csv`);
        dashboard?.showNotification('IOCs exported successfully', 'success');
    } catch (error) {
        console.error('IOC export failed:', error);
        dashboard?.showNotification('Failed to export IOCs', 'error');
    }
}

/**
 * Generate IOC report
 */
function generateIOCReport() {
    const reportData = {
        summary: {
            totalIOCs: filteredIOCs.length,
            highConfidence: filteredIOCs.filter(ioc => ioc.confidence >= 0.8).length,
            typeBreakdown: getTypeBreakdown(filteredIOCs),
            sources: getUniqueSources().length
        },
        iocs: filteredIOCs
    };

    // Create and download report
    const reportContent = generateIOCReportContent(reportData);
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secunik-ioc-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dashboard?.showNotification('IOC report generated', 'success');
}

/**
 * Refresh IOCs
 */
function refreshIOCs() {
    if (dashboard?.state.currentAnalysis) {
        render(dashboard.state.currentAnalysis);
        dashboard?.showNotification('IOCs refreshed', 'success');
    }
}

// Helper functions

function getHighConfidenceCount() {
    return iocsData.filter(ioc => ioc.confidence >= 0.8).length;
}

function getUniqueTypesCount() {
    return new Set(iocsData.map(ioc => ioc.type)).size;
}

function getUniqueIOCTypes() {
    const types = [...new Set(iocsData.map(ioc => ioc.type))];
    return types.filter(type => type && type !== 'unknown').sort();
}

function getUniqueSources() {
    const sources = [...new Set(iocsData.map(ioc => ioc.source))];
    return sources.filter(source => source && source !== 'Unknown').sort();
}

function getTypeBreakdown(iocs) {
    const breakdown = {};
    iocs.forEach(ioc => {
        breakdown[ioc.type] = (breakdown[ioc.type] || 0) + 1;
    });
    return Object.fromEntries(
        Object.entries(breakdown).sort(([, a], [, b]) => b - a)
    );
}

function calculateThreatLevel(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
}

function getConfidenceLevel(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
}

function getTypeIcon(type) {
    const icons = {
        'ip': 'globe',
        'domain': 'link',
        'url': 'external-link',
        'hash': 'hash',
        'email': 'mail',
        'file': 'file',
        'registry': 'database',
        'mutex': 'lock',
        'process': 'cpu'
    };
    return icons[type.toLowerCase()] || 'search';
}

function formatTimestamp(timestamp) {
    try {
        return new Date(timestamp).toLocaleString();
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

function convertIOCsToCSV(iocs) {
    const headers = ['Type', 'Value', 'Confidence', 'Threat Level', 'First Seen', 'Last Seen', 'Source', 'Description'];
    const rows = iocs.map(ioc => [
        ioc.type,
        ioc.value,
        Math.round(ioc.confidence * 100) + '%',
        ioc.threatLevel,
        ioc.formattedFirstSeen,
        ioc.formattedLastSeen,
        ioc.source,
        ioc.description
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

function generateIOCReportContent(data) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SecuNik IOC Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; margin-bottom: 20px; }
                .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
                .ioc { border-left: 4px solid #ddd; padding: 10px; margin: 10px 0; }
                .high { border-color: #ef4444; }
                .medium { border-color: #f59e0b; }
                .low { border-color: #10b981; }
                .type-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>SecuNik IOC Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary">
                <h2>Summary</h2>
                <p>Total IOCs: ${data.summary.totalIOCs}</p>
                <p>High Confidence IOCs: ${data.summary.highConfidence}</p>
                <p>Unique Sources: ${data.summary.sources}</p>
                
                <h3>Type Breakdown</h3>
                <div class="type-breakdown">
                    ${Object.entries(data.summary.typeBreakdown).map(([type, count]) => `
                        <div><strong>${type.toUpperCase()}:</strong> ${count}</div>
                    `).join('')}
                </div>
            </div>
            
            <div class="iocs">
                <h2>IOCs</h2>
                ${data.iocs.map(ioc => `
                    <div class="ioc ${ioc.confidenceLevel}">
                        <h3>${ioc.type.toUpperCase()}: ${ioc.value}</h3>
                        <p><strong>Confidence:</strong> ${Math.round(ioc.confidence * 100)}%</p>
                        <p><strong>Threat Level:</strong> ${ioc.threatLevel.toUpperCase()}</p>
                        <p><strong>First Seen:</strong> ${ioc.formattedFirstSeen}</p>
                        <p><strong>Source:</strong> ${ioc.source}</p>
                        ${ioc.description ? `<p><strong>Description:</strong> ${ioc.description}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;
}

// Global functions for onclick handlers
window.changeIOCPage = function (page) {
    currentPage = page;
    renderIOCsTable();
    renderIOCsPagination();
};

window.toggleSelectAll = function () {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const iocCheckboxes = document.querySelectorAll('.ioc-checkbox');

    iocCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    updateBulkActions();
};

window.updateBulkActions = function () {
    const selectedCheckboxes = document.querySelectorAll('.ioc-checkbox:checked');
    const bulkExportBtn = document.getElementById('bulkExportBtn');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');

    if (bulkExportBtn) {
        bulkExportBtn.disabled = selectedCheckboxes.length === 0;
    }

    if (selectAllCheckbox) {
        const allCheckboxes = document.querySelectorAll('.ioc-checkbox');
        selectAllCheckbox.checked = selectedCheckboxes.length === allCheckboxes.length && allCheckboxes.length > 0;
        selectAllCheckbox.indeterminate = selectedCheckboxes.length > 0 && selectedCheckboxes.length < allCheckboxes.length;
    }
};

window.selectAllIOCs = function () {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = true;
        toggleSelectAll();
    }
};

window.bulkExportIOCs = function () {
    const selectedCheckboxes = document.querySelectorAll('.ioc-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
    const selectedIOCs = filteredIOCs.filter(ioc => selectedIds.includes(ioc.id));

    try {
        const csvData = convertIOCsToCSV(selectedIOCs);
        downloadCSV(csvData, `secunik-selected-iocs-${Date.now()}.csv`);
        dashboard?.showNotification(`${selectedIOCs.length} IOCs exported`, 'success');
    } catch (error) {
        console.error('Bulk export failed:', error);
        dashboard?.showNotification('Failed to export selected IOCs', 'error');
    }
};

window.filterByType = function (type) {
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.value = type;
        handleIOCFilterChange();
    }
};

window.showIOCDetails = function (iocId) {
    const ioc = iocsData.find(i => i.id === iocId);
    if (!ioc) return;

    const modal = document.getElementById('iocDetailsModal');
    const content = document.getElementById('iocDetailsContent');

    if (!modal || !content) return;

    content.innerHTML = `
        <div class="ioc-details">
            <div class="detail-section">
                <h4>Basic Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>IOC ID:</label>
                        <span>${ioc.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Type:</label>
                        <span class="ioc-type">
                            <i data-feather="${ioc.typeIcon}" width="16" height="16"></i>
                            ${ioc.type.toUpperCase()}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Value:</label>
                        <span class="ioc-value-full">${ioc.value}</span>
                    </div>
                    <div class="detail-item">
                        <label>Confidence:</label>
                        <div class="confidence-display">
                            <div class="confidence-bar">
                                <div class="confidence-fill ${ioc.confidenceLevel}" style="width: ${ioc.confidence * 100}%"></div>
                            </div>
                            <span>${Math.round(ioc.confidence * 100)}%</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <label>Threat Level:</label>
                        <span class="threat-level-badge ${ioc.threatLevel}">${ioc.threatLevel.toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <label>First Seen:</label>
                        <span>${ioc.formattedFirstSeen}</span>
                    </div>
                    <div class="detail-item">
                        <label>Last Seen:</label>
                        <span>${ioc.formattedLastSeen}</span>
                    </div>
                    <div class="detail-item">
                        <label>Source:</label>
                        <span>${ioc.source}</span>
                    </div>
                </div>
            </div>
            
            ${ioc.description ? `
                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${ioc.description}</p>
                </div>
            ` : ''}
            
            ${ioc.tags && ioc.tags.length > 0 ? `
                <div class="detail-section">
                    <h4>Tags</h4>
                    <div class="tags-container">
                        ${ioc.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${Object.keys(ioc.context).length > 0 ? `
                <div class="detail-section">
                    <h4>Context</h4>
                    <pre class="context-json">${JSON.stringify(ioc.context, null, 2)}</pre>
                </div>
            ` : ''}
            
            <div class="detail-actions">
                <button class="btn btn-primary" onclick="lookupThreatIntel(${ioc.id})">
                    <i data-feather="search"></i> Threat Intelligence
                </button>
                <button class="btn btn-secondary" onclick="createCaseFromIOC(${ioc.id})">
                    <i data-feather="folder-plus"></i> Create Case
                </button>
                <button class="btn btn-secondary" onclick="exportSingleIOC(${ioc.id})">
                    <i data-feather="download"></i> Export IOC
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

window.closeIOCDetails = function () {
    const modal = document.getElementById('iocDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.lookupThreatIntel = function (iocId) {
    const ioc = iocsData.find(i => i.id === iocId);
    if (!ioc) return;

    const panel = document.getElementById('threatIntelPanel');
    const content = document.getElementById('threatIntelContent');

    if (!panel || !content) return;

    // Show loading state
    content.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Looking up threat intelligence for ${ioc.value}...</p>
        </div>
    `;

    panel.style.display = 'block';

    // Simulate threat intel lookup
    setTimeout(() => {
        content.innerHTML = `
            <div class="threat-intel-results">
                <div class="intel-section">
                    <h4>IOC: ${ioc.value}</h4>
                    <p><strong>Type:</strong> ${ioc.type.toUpperCase()}</p>
                </div>
                
                <div class="intel-section">
                    <h4>Threat Intelligence Sources</h4>
                    <div class="intel-sources">
                        <div class="intel-source">
                            <div class="source-name">SecuNik Intelligence</div>
                            <div class="source-status available">Available</div>
                            <div class="source-info">Confidence: ${Math.round(ioc.confidence * 100)}%</div>
                        </div>
                        <div class="intel-source">
                            <div class="source-name">External Feeds</div>
                            <div class="source-status limited">Limited</div>
                            <div class="source-info">No additional data available</div>
                        </div>
                    </div>
                </div>
                
                <div class="intel-section">
                    <h4>Analysis</h4>
                    <p>This IOC was detected with ${Math.round(ioc.confidence * 100)}% confidence by the SecuNik analysis engine. 
                    The threat level is assessed as <strong>${ioc.threatLevel.toUpperCase()}</strong>.</p>
                    
                    ${ioc.confidence >= 0.8 ? `
                        <div class="intel-warning">
                            <i data-feather="alert-triangle" width="16" height="16"></i>
                            <strong>High Confidence Detection:</strong> This IOC should be investigated immediately.
                        </div>
                    ` : ''}
                </div>
                
                <div class="intel-actions">
                    <button class="btn btn-primary" onclick="createCaseFromIOC(${ioc.id})">
                        <i data-feather="folder-plus"></i> Create Investigation Case
                    </button>
                    <button class="btn btn-secondary" onclick="exportSingleIOC(${ioc.id})">
                        <i data-feather="download"></i> Export IOC Data
                    </button>
                </div>
            </div>
        `;

        // Re-initialize Feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }, 2000);
};

window.closeThreatIntelPanel = function () {
    const panel = document.getElementById('threatIntelPanel');
    if (panel) {
        panel.style.display = 'none';
    }
};

window.createCaseFromIOC = function (iocId) {
    const ioc = iocsData.find(i => i.id === iocId);
    if (!ioc) return;

    dashboard?.switchToTab('caseManagement');

    setTimeout(() => {
        const titleField = document.getElementById('caseTitle');
        const severityField = document.getElementById('caseSeverity');
        const descriptionField = document.getElementById('caseDescription');

        if (titleField) {
            titleField.value = `IOC Investigation: ${ioc.type.toUpperCase()} - ${ioc.value}`;
        }

        if (severityField) {
            severityField.value = ioc.threatLevel;
        }

        if (descriptionField) {
            descriptionField.value = `Case created from IOC detection.\n\nIOC Type: ${ioc.type.toUpperCase()}\nValue: ${ioc.value}\nConfidence: ${Math.round(ioc.confidence * 100)}%\nThreat Level: ${ioc.threatLevel.toUpperCase()}\nFirst Seen: ${ioc.formattedFirstSeen}\nSource: ${ioc.source}\n\n${ioc.description || 'No additional description available.'}`;
        }
    }, 100);
};

window.exportSingleIOC = function (iocId) {
    const ioc = iocsData.find(i => i.id === iocId);
    if (!ioc) return;

    try {
        const csvData = convertIOCsToCSV([ioc]);
        downloadCSV(csvData, `secunik-ioc-${iocId}-${Date.now()}.csv`);
        dashboard?.showNotification('IOC exported successfully', 'success');
    } catch (error) {
        console.error('IOC export failed:', error);
        dashboard?.showNotification('Failed to export IOC', 'error');
    }
};

window.showFullValue = function (iocId) {
    const ioc = iocsData.find(i => i.id === iocId);
    if (!ioc) return;

    alert(`Full IOC Value:\n\n${ioc.value}`);
};

window.clearAllIOCFilters = clearAllIOCFilters;

// Export functions
export { init, render };
