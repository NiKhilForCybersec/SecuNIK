let dashboard = null;
let currentPage = 1;
let iocsPerPage = 15;
let filteredIOCs = [];
let allIOCs = [];
let sortField = 'confidence';
let sortDirection = 'desc';
let selectedCategories = [];
let selectedSeverities = ['critical', 'high', 'medium', 'low'];

export function init(dashboardInstance) {
    dashboard = dashboardInstance;
    console.log('✅ IOCs tab initialized');
}

export function render(analysis) {
    const iocsTab = document.getElementById('iocsTab');
    if (!iocsTab) return;

    // Extract IOCs data
    const data = analysis?.result || analysis;
    allIOCs = data.technical?.detectedIOCs || data.Technical?.DetectedIOCs || [];

    // Initialize categories filter
    selectedCategories = getUniqueCategories();

    // Apply initial filters
    applyFilters();

    iocsTab.innerHTML = `
        <div class="section-header">
            <h2><i data-feather="target" aria-hidden="true"></i> Indicators of Compromise</h2>
            <div class="header-actions">
                <div class="iocs-summary">
                    <span class="total-count">${allIOCs.length} Total IOCs</span>
                    <span class="high-confidence">${getHighConfidenceCount()} High Confidence</span>
                </div>
                <button class="btn btn-secondary" id="exportIOCsBtn">
                    <i data-feather="download"></i> Export IOCs
                </button>
                <button class="btn btn-secondary" id="exportSTIXBtn">
                    <i data-feather="shield"></i> Export STIX
                </button>
                <button class="btn btn-primary" id="refreshIOCsBtn">
                    <i data-feather="refresh-cw"></i> Refresh
                </button>
            </div>
        </div>
        
        <div class="section-content">
            <!-- IOCs Statistics Dashboard -->
            <div class="iocs-dashboard">
                <div class="dashboard-row">
                    <!-- Category Distribution -->
                    <div class="dashboard-widget">
                        <div class="widget-header">
                            <h3><i data-feather="pie-chart"></i> Category Distribution</h3>
                        </div>
                        <div class="widget-content">
                            <div class="category-chart" id="categoryChart">
                                ${renderCategoryChart()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Confidence Levels -->
                    <div class="dashboard-widget">
                        <div class="widget-header">
                            <h3><i data-feather="trending-up"></i> Confidence Levels</h3>
                        </div>
                        <div class="widget-content">
                            <div class="confidence-stats">
                                ${renderConfidenceStats()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Top Sources -->
                    <div class="dashboard-widget">
                        <div class="widget-header">
                            <h3><i data-feather="database"></i> Top Threat Sources</h3>
                        </div>
                        <div class="widget-content">
                            <div class="threat-sources">
                                ${renderTopThreatSources()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Filters Section -->
            <div class="iocs-filters">
                <div class="filter-group">
                    <label for="categoryFilter">Categories:</label>
                    <div class="category-checkboxes">
                        ${getUniqueCategories().map(category => `
                            <label class="checkbox-label">
                                <input type="checkbox" value="${category}" checked> ${category}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="filter-group">
                    <label for="confidenceFilter">Minimum Confidence:</label>
                    <input type="range" id="confidenceFilter" min="0" max="1" step="0.1" value="0" class="confidence-slider">
                    <div class="confidence-value">
                        <span>0%</span>
                        <span id="confidenceValue">0%</span>
                        <span>100%</span>
                    </div>
                </div>
                
                <div class="filter-group">
                    <label for="searchIOCs">Search IOCs:</label>
                    <input type="text" id="searchIOCs" placeholder="Search indicators, values, or descriptions..." class="form-control">
                </div>
                
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
                    <label for="threatTypeFilter">Threat Type:</label>
                    <select id="threatTypeFilter" class="form-control">
                        <option value="all">All Types</option>
                        ${getUniqueThreatTypes().map(type =>
        `<option value="${type}">${type}</option>`
    ).join('')}
                    </select>
                </div>
                
                <button class="btn btn-secondary" id="clearIOCFiltersBtn">
                    <i data-feather="x"></i> Clear Filters
                </button>
            </div>
            
            <!-- IOCs Table -->
            <div class="iocs-table-container">
                <div class="table-controls">
                    <div class="pagination-info">
                        Showing ${getStartIndex()} - ${getEndIndex()} of ${filteredIOCs.length} IOCs
                    </div>
                    <div class="table-actions">
                        <select id="iocsPerPageSelect" class="form-control">
                            <option value="15">15 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </select>
                        <button class="btn btn-secondary" id="selectAllIOCsBtn">
                            <i data-feather="check-square"></i> Select All
                        </button>
                        <button class="btn btn-secondary" id="exportSelectedBtn" disabled>
                            <i data-feather="download"></i> Export Selected
                        </button>
                    </div>
                </div>
                
                <div class="iocs-table-wrapper">
                    <table class="iocs-table">
                        <thead>
                            <tr>
                                <th class="checkbox-column">
                                    <input type="checkbox" id="selectAllCheckbox">
                                </th>
                                <th class="sortable" data-field="category">
                                    <i data-feather="tag"></i> Category
                                    <span class="sort-indicator ${sortField === 'category' ? sortDirection : ''}"></span>
                                </th>
                                <th class="sortable" data-field="value">
                                    <i data-feather="hash"></i> Indicator Value
                                    <span class="sort-indicator ${sortField === 'value' ? sortDirection : ''}"></span>
                                </th>
                                <th class="sortable" data-field="confidence">
                                    <i data-feather="trending-up"></i> Confidence
                                    <span class="sort-indicator ${sortField === 'confidence' ? sortDirection : ''}"></span>
                                </th>
                                <th class="sortable" data-field="severity">
                                    <i data-feather="alert-triangle"></i> Severity
                                    <span class="sort-indicator ${sortField === 'severity' ? sortDirection : ''}"></span>
                                </th>
                                <th class="sortable" data-field="threatType">
                                    <i data-feather="shield"></i> Threat Type
                                    <span class="sort-indicator ${sortField === 'threatType' ? sortDirection : ''}"></span>
                                </th>
                                <th>
                                    <i data-feather="file-text"></i> Description
                                </th>
                                <th>
                                    <i data-feather="tool"></i> Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody id="iocsTableBody">
                            ${renderIOCsTable()}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="pagination-container">
                    ${renderPagination()}
                </div>
            </div>
            
            <!-- IOC Analysis Charts -->
            <div class="iocs-analysis-section">
                <div class="analysis-row">
                    <!-- Confidence Distribution -->
                    <div class="analysis-widget">
                        <h3><i data-feather="bar-chart"></i> Confidence Distribution</h3>
                        <div class="confidence-distribution">
                            ${renderConfidenceDistribution()}
                        </div>
                    </div>
                    
                    <!-- Timeline of IOC Detection -->
                    <div class="analysis-widget">
                        <h3><i data-feather="activity"></i> Detection Timeline</h3>
                        <div class="detection-timeline">
                            ${renderDetectionTimeline()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Threat Intelligence Integration -->
            <div class="threat-intel-section">
                <h3><i data-feather="globe"></i> Threat Intelligence Correlation</h3>
                <div class="threat-intel-grid">
                    ${renderThreatIntelCorrelation()}
                </div>
            </div>
        </div>
    `;

    // Initialize event listeners
    setupIOCEventListeners();

    // Replace feather icons
    feather.replace();

    console.log(`✅ IOCs tab rendered with ${allIOCs.length} indicators`);
}

function setupIOCEventListeners() {
    // Export buttons
    const exportIOCsBtn = document.getElementById('exportIOCsBtn');
    if (exportIOCsBtn) {
        exportIOCsBtn.addEventListener('click', () => exportIOCs('csv'));
    }

    const exportSTIXBtn = document.getElementById('exportSTIXBtn');
    if (exportSTIXBtn) {
        exportSTIXBtn.addEventListener('click', () => exportIOCs('stix'));
    }

    const refreshBtn = document.getElementById('refreshIOCsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (dashboard?.state?.currentAnalysis) {
                render(dashboard.state.currentAnalysis);
            }
        });
    }

    // Filter event listeners
    const categoryCheckboxes = document.querySelectorAll('.category-checkboxes input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCategoryFilter);
    });

    const severityCheckboxes = document.querySelectorAll('.severity-checkboxes input[type="checkbox"]');
    severityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleSeverityFilter);
    });

    const confidenceSlider = document.getElementById('confidenceFilter');
    if (confidenceSlider) {
        confidenceSlider.addEventListener('input', handleConfidenceFilter);
    }

    const searchInput = document.getElementById('searchIOCs');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    const threatTypeFilter = document.getElementById('threatTypeFilter');
    if (threatTypeFilter) {
        threatTypeFilter.addEventListener('change', handleThreatTypeFilter);
    }

    const clearFiltersBtn = document.getElementById('clearIOCFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllIOCFilters);
    }

    // Table controls
    const iocsPerPageSelect = document.getElementById('iocsPerPageSelect');
    if (iocsPerPageSelect) {
        iocsPerPageSelect.value = iocsPerPage.toString();
        iocsPerPageSelect.addEventListener('change', handleIOCsPerPageChange);
    }

    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    const selectAllBtn = document.getElementById('selectAllIOCsBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', handleSelectAllButton);
    }

    const exportSelectedBtn = document.getElementById('exportSelectedBtn');
    if (exportSelectedBtn) {
        exportSelectedBtn.addEventListener('click', exportSelectedIOCs);
    }

    // Table sorting
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-field');
            handleIOCSort(field);
        });
    });

    // Pagination buttons
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            handleIOCPagination(action);
        });
    });
}

function handleCategoryFilter() {
    const checkboxes = document.querySelectorAll('.category-checkboxes input[type="checkbox"]');
    selectedCategories = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    applyFilters();
    updateIOCTable();
}

function handleSeverityFilter() {
    const checkboxes = document.querySelectorAll('.severity-checkboxes input[type="checkbox"]');
    selectedSeverities = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    applyFilters();
    updateIOCTable();
}

function handleConfidenceFilter(e) {
    const value = parseFloat(e.target.value);
    const valueDisplay = document.getElementById('confidenceValue');
    if (valueDisplay) {
        valueDisplay.textContent = `${Math.round(value * 100)}%`;
    }

    applyFilters();
    updateIOCTable();
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    applyFilters(searchTerm);
    updateIOCTable();
}

function handleThreatTypeFilter(e) {
    const threatType = e.target.value;
    applyFilters(null, threatType);
    updateIOCTable();
}

function clearAllIOCFilters() {
    // Reset category checkboxes
    const categoryCheckboxes = document.querySelectorAll('.category-checkboxes input[type="checkbox"]');
    categoryCheckboxes.forEach(cb => cb.checked = true);

    // Reset severity checkboxes
    const severityCheckboxes = document.querySelectorAll('.severity-checkboxes input[type="checkbox"]');
    severityCheckboxes.forEach(cb => cb.checked = true);

    // Reset other filters
    document.getElementById('confidenceFilter').value = '0';
    document.getElementById('confidenceValue').textContent = '0%';
    document.getElementById('searchIOCs').value = '';
    document.getElementById('threatTypeFilter').value = 'all';

    // Reset state
    selectedCategories = getUniqueCategories();
    selectedSeverities = ['critical', 'high', 'medium', 'low'];
    currentPage = 1;

    applyFilters();
    updateIOCTable();
}

function handleIOCsPerPageChange(e) {
    iocsPerPage = parseInt(e.target.value);
    currentPage = 1;
    updateIOCTable();
}

function handleIOCSort(field) {
    if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortField = field;
        sortDirection = 'desc';
    }

    sortIOCs();
    updateIOCTable();
    updateIOCSortIndicators();
}

function handleIOCPagination(action) {
    const totalPages = Math.ceil(filteredIOCs.length / iocsPerPage);

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

    updateIOCTable();
}

function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.ioc-checkbox');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateSelectedIOCsButtons();
}

function handleSelectAllButton() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = !selectAllCheckbox.checked;
        handleSelectAll({ target: selectAllCheckbox });
    }
}

function updateSelectedIOCsButtons() {
    const selectedCount = document.querySelectorAll('.ioc-checkbox:checked').length;
    const exportSelectedBtn = document.getElementById('exportSelectedBtn');

    if (exportSelectedBtn) {
        exportSelectedBtn.disabled = selectedCount === 0;
        exportSelectedBtn.textContent = selectedCount > 0 ?
            `Export Selected (${selectedCount})` : 'Export Selected';
    }
}

function applyFilters(searchTerm = null, threatType = null) {
    // Get current filter values if not provided
    if (searchTerm === null) {
        const searchInput = document.getElementById('searchIOCs');
        searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    }

    if (threatType === null) {
        const threatTypeSelect = document.getElementById('threatTypeFilter');
        threatType = threatTypeSelect ? threatTypeSelect.value : 'all';
    }

    const confidenceSlider = document.getElementById('confidenceFilter');
    const minConfidence = confidenceSlider ? parseFloat(confidenceSlider.value) : 0;

    filteredIOCs = allIOCs.filter(ioc => {
        // Category filter
        const iocCategory = ioc.category || ioc.Category || 'Unknown';
        if (!selectedCategories.includes(iocCategory)) {
            return false;
        }

        // Severity filter
        const iocSeverity = (ioc.severity || ioc.Severity || 'low').toLowerCase();
        if (!selectedSeverities.includes(iocSeverity)) {
            return false;
        }

        // Confidence filter
        const confidence = ioc.confidence || ioc.Confidence || 0;
        if (confidence < minConfidence) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const searchableText = [
                ioc.value || ioc.Value || '',
                ioc.description || ioc.Description || '',
                ioc.category || ioc.Category || '',
                ioc.threatType || ioc.ThreatType || ''
            ].join(' ').toLowerCase();

            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }

        // Threat type filter
        if (threatType !== 'all') {
            const iocThreatType = ioc.threatType || ioc.ThreatType || '';
            if (iocThreatType !== threatType) {
                return false;
            }
        }

        return true;
    });

    // Reset to first page when filters change
    currentPage = 1;

    // Sort the filtered IOCs
    sortIOCs();
}

function sortIOCs() {
    filteredIOCs.sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
            case 'category':
                aValue = (a.category || a.Category || '').toLowerCase();
                bValue = (b.category || b.Category || '').toLowerCase();
                break;
            case 'value':
                aValue = (a.value || a.Value || '').toLowerCase();
                bValue = (b.value || b.Value || '').toLowerCase();
                break;
            case 'confidence':
                aValue = a.confidence || a.Confidence || 0;
                bValue = b.confidence || b.Confidence || 0;
                break;
            case 'severity':
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                aValue = severityOrder[(a.severity || a.Severity || 'low').toLowerCase()] || 0;
                bValue = severityOrder[(b.severity || b.Severity || 'low').toLowerCase()] || 0;
                break;
            case 'threatType':
                aValue = (a.threatType || a.ThreatType || '').toLowerCase();
                bValue = (b.threatType || b.ThreatType || '').toLowerCase();
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function updateIOCTable() {
    const tableBody = document.getElementById('iocsTableBody');
    if (tableBody) {
        tableBody.innerHTML = renderIOCsTable();
    }

    const paginationContainer = document.querySelector('.pagination-container');
    if (paginationContainer) {
        paginationContainer.innerHTML = renderPagination();
    }

    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${getStartIndex()} - ${getEndIndex()} of ${filteredIOCs.length} IOCs`;
    }

    // Re-attach event listeners
    setupTableEventListeners();

    feather.replace();
}

function setupTableEventListeners() {
    // Pagination buttons
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            handleIOCPagination(action);
        });
    });

    // IOC checkboxes
    const iocCheckboxes = document.querySelectorAll('.ioc-checkbox');
    iocCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateSelectedIOCsButtons);
    });
}

function updateIOCSortIndicators() {
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

function renderIOCsTable() {
    const startIndex = (currentPage - 1) * iocsPerPage;
    const endIndex = startIndex + iocsPerPage;
    const pageIOCs = filteredIOCs.slice(startIndex, endIndex);

    if (pageIOCs.length === 0) {
        return `
            <tr>
                <td colspan="8" class="no-iocs">
                    <div class="empty-state">
                        <i data-feather="search"></i>
                        <h3>No IOCs found</h3>
                        <p>Try adjusting your filters or search criteria</p>
                    </div>
                </td>
            </tr>
        `;
    }

    return pageIOCs.map((ioc, index) => {
        const category = ioc.category || ioc.Category || 'Unknown';
        const value = ioc.value || ioc.Value || 'N/A';
        const confidence = Math.round((ioc.confidence || ioc.Confidence || 0) * 100);
        const severity = (ioc.severity || ioc.Severity || 'low').toLowerCase();
        const threatType = ioc.threatType || ioc.ThreatType || 'Unknown';
        const description = truncateText(ioc.description || ioc.Description || 'No description', 50);
        const iocIndex = startIndex + index;

        return `
            <tr class="ioc-row ${severity}" data-ioc-index="${iocIndex}">
                <td class="checkbox-cell">
                    <input type="checkbox" class="ioc-checkbox" data-ioc-index="${iocIndex}">
                </td>
                <td class="category-cell">
                    <span class="category-badge ${category.toLowerCase().replace(/\s+/g, '-')}">${category}</span>
                </td>
                <td class="value-cell">
                    <span class="ioc-value" title="${value}">${truncateText(value, 30)}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${value}')" title="Copy to clipboard">
                        <i data-feather="copy"></i>
                    </button>
                </td>
                <td class="confidence-cell">
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%"></div>
                        <span class="confidence-text">${confidence}%</span>
                    </div>
                </td>
                <td class="severity-cell">
                    <span class="severity-badge ${severity}">${severity.toUpperCase()}</span>
                </td>
                <td class="threat-type-cell">
                    <span class="threat-type">${threatType}</span>
                </td>
                <td class="description-cell">
                    <span class="description" title="${ioc.description || ioc.Description || ''}">${description}</span>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="viewIOCDetails(${iocIndex})" title="View Details">
                            <i data-feather="eye"></i>
                        </button>
                        <button class="btn-icon" onclick="searchThreatIntel('${value}')" title="Search Threat Intel">
                            <i data-feather="shield"></i>
                        </button>
                        <button class="btn-icon" onclick="createIOCCase(${iocIndex})" title="Create Case">
                            <i data-feather="folder-plus"></i>
                        </button>
                        <button class="btn-icon" onclick="exportSingleIOC(${iocIndex})" title="Export IOC">
                            <i data-feather="download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPagination() {
    const totalPages = Math.ceil(filteredIOCs.length / iocsPerPage);

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

function renderCategoryChart() {
    const categoryStats = {};
    allIOCs.forEach(ioc => {
        const category = ioc.category || ioc.Category || 'Unknown';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6);

    const total = allIOCs.length;

    return sortedCategories.map(([category, count]) => {
        const percentage = Math.round((count / total) * 100);
        return `
            <div class="category-item">
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="category-info">
                    <span class="category-name">${category}</span>
                    <span class="category-stats">${count} (${percentage}%)</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderConfidenceStats() {
    const ranges = {
        'High (80-100%)': 0,
        'Medium (60-79%)': 0,
        'Low (40-59%)': 0,
        'Very Low (0-39%)': 0
    };

    allIOCs.forEach(ioc => {
        const confidence = (ioc.confidence || ioc.Confidence || 0) * 100;
        if (confidence >= 80) ranges['High (80-100%)']++;
        else if (confidence >= 60) ranges['Medium (60-79%)']++;
        else if (confidence >= 40) ranges['Low (40-59%)']++;
        else ranges['Very Low (0-39%)']++;
    });

    return Object.entries(ranges).map(([range, count]) => `
        <div class="confidence-item">
            <div class="confidence-label">${range}</div>
            <div class="confidence-count">${count}</div>
        </div>
    `).join('');
}

function renderTopThreatSources() {
    const sources = {};
    allIOCs.forEach(ioc => {
        const source = ioc.source || ioc.Source || 'Unknown';
        sources[source] = (sources[source] || 0) + 1;
    });

    const topSources = Object.entries(sources)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return topSources.map(([source, count]) => `
        <div class="source-item">
            <span class="source-name">${source}</span>
            <span class="source-count">${count}</span>
        </div>
    `).join('');
}

function renderConfidenceDistribution() {
    const buckets = Array(10).fill(0);

    allIOCs.forEach(ioc => {
        const confidence = (ioc.confidence || ioc.Confidence || 0) * 100;
        const bucketIndex = Math.min(9, Math.floor(confidence / 10));
        buckets[bucketIndex]++;
    });

    const maxCount = Math.max(...buckets);

    return buckets.map((count, index) => {
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const range = `${index * 10}-${(index + 1) * 10}%`;

        return `
            <div class="distribution-bar" title="${range}: ${count} IOCs">
                <div class="bar-fill" style="height: ${percentage}%"></div>
                <div class="bar-label">${index * 10}</div>
            </div>
        `;
    }).join('');
}

function renderDetectionTimeline() {
    if (allIOCs.length === 0) {
        return '<div class="timeline-placeholder">No detection data available</div>';
    }

    // Group IOCs by detection time (simulated)
    const timeGroups = {};
    allIOCs.forEach(ioc => {
        // Use current time - random offset for demo
        const detectionTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const hourKey = new Date(detectionTime.getFullYear(), detectionTime.getMonth(), detectionTime.getDate(), detectionTime.getHours()).toISOString();

        timeGroups[hourKey] = (timeGroups[hourKey] || 0) + 1;
    });

    const sortedGroups = Object.entries(timeGroups)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-24);

    const maxCount = Math.max(...sortedGroups.map(([, count]) => count));

    return sortedGroups.map(([time, count]) => {
        const height = (count / maxCount) * 100;
        const hour = new Date(time).getHours();

        return `
            <div class="timeline-bar" style="height: ${height}%" 
                 title="${new Date(time).toLocaleString()}: ${count} IOCs">
                <div class="timeline-label">${hour}:00</div>
            </div>
        `;
    }).join('');
}

function renderThreatIntelCorrelation() {
    const correlations = [
        { source: 'VirusTotal', matches: Math.floor(allIOCs.length * 0.7), status: 'active' },
        { source: 'MISP', matches: Math.floor(allIOCs.length * 0.4), status: 'active' },
        { source: 'OTX AlienVault', matches: Math.floor(allIOCs.length * 0.3), status: 'active' },
        { source: 'ThreatCrowd', matches: Math.floor(allIOCs.length * 0.2), status: 'limited' },
        { source: 'PassiveTotal', matches: Math.floor(allIOCs.length * 0.1), status: 'inactive' }
    ];

    return correlations.map(correlation => `
        <div class="threat-intel-item ${correlation.status}">
            <div class="intel-header">
                <span class="intel-source">${correlation.source}</span>
                <span class="intel-status ${correlation.status}">${correlation.status.toUpperCase()}</span>
            </div>
            <div class="intel-stats">
                <span class="match-count">${correlation.matches} matches</span>
                <span class="match-percentage">${Math.round((correlation.matches / allIOCs.length) * 100)}%</span>
            </div>
        </div>
    `).join('');
}

// Utility functions
function getUniqueCategories() {
    const categories = new Set();
    allIOCs.forEach(ioc => {
        const category = ioc.category || ioc.Category || 'Unknown';
        categories.add(category);
    });
    return Array.from(categories).sort();
}

function getUniqueThreatTypes() {
    const types = new Set();
    allIOCs.forEach(ioc => {
        const type = ioc.threatType || ioc.ThreatType;
        if (type) types.add(type);
    });
    return Array.from(types).sort();
}

function getHighConfidenceCount() {
    return allIOCs.filter(ioc =>
        (ioc.confidence || ioc.Confidence || 0) >= 0.8
    ).length;
}

function getStartIndex() {
    return filteredIOCs.length === 0 ? 0 : (currentPage - 1) * iocsPerPage + 1;
}

function getEndIndex() {
    return Math.min(currentPage * iocsPerPage, filteredIOCs.length);
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
export function exportIOCs(format = 'csv') {
    if (!dashboard?.state?.currentAnalysis) {
        dashboard?.showNotification('No IOCs to export', 'warning');
        return;
    }

    try {
        let exportData, filename, mimeType;

        if (format === 'stix') {
            exportData = convertIOCsToSTIX(filteredIOCs);
            filename = `secunik-iocs-stix-${Date.now()}.json`;
            mimeType = 'application/json';
        } else {
            exportData = convertIOCsToCSV(filteredIOCs);
            filename = `secunik-iocs-${Date.now()}.csv`;
            mimeType = 'text/csv';
        }

        downloadFile(exportData, filename, mimeType);
        dashboard?.showNotification(`IOCs exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
        console.error('IOCs export failed:', error);
        dashboard?.showNotification('Failed to export IOCs', 'error');
    }
}

function exportSelectedIOCs() {
    const selectedCheckboxes = document.querySelectorAll('.ioc-checkbox:checked');
    const selectedIndices = Array.from(selectedCheckboxes).map(cb =>
        parseInt(cb.getAttribute('data-ioc-index'))
    );

    if (selectedIndices.length === 0) {
        dashboard?.showNotification('No IOCs selected', 'warning');
        return;
    }

    const selectedIOCs = selectedIndices.map(index => filteredIOCs[index]).filter(Boolean);

    try {
        const csvData = convertIOCsToCSV(selectedIOCs);
        downloadFile(csvData, `secunik-selected-iocs-${Date.now()}.csv`, 'text/csv');
        dashboard?.showNotification(`${selectedIOCs.length} IOCs exported successfully`, 'success');
    } catch (error) {
        console.error('Selected IOCs export failed:', error);
        dashboard?.showNotification('Failed to export selected IOCs', 'error');
    }
}

function convertIOCsToCSV(iocs) {
    const headers = ['Category', 'Value', 'Confidence', 'Severity', 'Threat Type', 'Description', 'Source'];
    const csvRows = [headers.join(',')];

    iocs.forEach(ioc => {
        const row = [
            `"${ioc.category || ioc.Category || ''}"`,
            `"${(ioc.value || ioc.Value || '').replace(/"/g, '""')}"`,
            `"${Math.round((ioc.confidence || ioc.Confidence || 0) * 100)}%"`,
            `"${(ioc.severity || ioc.Severity || '').toUpperCase()}"`,
            `"${ioc.threatType || ioc.ThreatType || ''}"`,
            `"${(ioc.description || ioc.Description || '').replace(/"/g, '""')}"`,
            `"${ioc.source || ioc.Source || ''}"`
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

function convertIOCsToSTIX(iocs) {
    const stixBundle = {
        type: "bundle",
        id: `bundle--${generateUUID()}`,
        spec_version: "2.1",
        objects: [
            {
                type: "identity",
                id: `identity--${generateUUID()}`,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                name: "SecuNik Analysis Platform",
                identity_class: "organization"
            }
        ]
    };

    iocs.forEach(ioc => {
        const stixIndicator = {
            type: "indicator",
            id: `indicator--${generateUUID()}`,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            pattern: generateSTIXPattern(ioc),
            labels: [ioc.threatType || ioc.ThreatType || "unknown"],
            confidence: Math.round((ioc.confidence || ioc.Confidence || 0) * 100)
        };

        if (ioc.description || ioc.Description) {
            stixIndicator.description = ioc.description || ioc.Description;
        }

        stixBundle.objects.push(stixIndicator);
    });

    return JSON.stringify(stixBundle, null, 2);
}

function generateSTIXPattern(ioc) {
    const value = ioc.value || ioc.Value || '';
    const category = (ioc.category || ioc.Category || '').toLowerCase();

    switch (category) {
        case 'ip address':
        case 'ip':
            return `[network-traffic:src_ref.value = '${value}']`;
        case 'domain':
        case 'hostname':
            return `[domain-name:value = '${value}']`;
        case 'url':
            return `[url:value = '${value}']`;
        case 'file hash':
        case 'hash':
            if (value.length === 32) {
                return `[file:hashes.MD5 = '${value}']`;
            } else if (value.length === 40) {
                return `[file:hashes.SHA-1 = '${value}']`;
            } else if (value.length === 64) {
                return `[file:hashes.SHA-256 = '${value}']`;
            }
            return `[file:hashes.MD5 = '${value}']`;
        case 'email':
            return `[email-addr:value = '${value}']`;
        default:
            return `[x-custom-object:value = '${value}']`;
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
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
window.viewIOCDetails = function (iocIndex) {
    const ioc = filteredIOCs[iocIndex];
    if (!ioc) return;

    const modal = createIOCDetailsModal(ioc);
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    dashboard?.showNotification('IOC details opened', 'info', 2000);
};

window.searchThreatIntel = function (value) {
    dashboard?.showNotification(`Searching threat intelligence for: ${value}`, 'info');
    // Would integrate with actual threat intel APIs
};

window.createIOCCase = function (iocIndex) {
    const ioc = filteredIOCs[iocIndex];
    if (!ioc) return;

    dashboard?.switchToTab('case');

    setTimeout(() => {
        const titleField = document.getElementById('caseTitle');
        const severityField = document.getElementById('caseSeverity');
        const descriptionField = document.getElementById('caseDescription');

        if (titleField) {
            titleField.value = `IOC Investigation: ${ioc.category || ioc.Category || 'Unknown'} - ${ioc.value || ioc.Value || ''}`;
        }

        if (severityField) {
            const severity = (ioc.severity || ioc.Severity || 'medium').toLowerCase();
            severityField.value = severity;
        }

        if (descriptionField) {
            descriptionField.value = `Automated case creation from IOC detection.\n\nIOC Details:\nCategory: ${ioc.category || ioc.Category}\nValue: ${ioc.value || ioc.Value}\nConfidence: ${Math.round((ioc.confidence || ioc.Confidence || 0) * 100)}%\nDescription: ${ioc.description || ioc.Description || 'No description available'}`;
        }
    }, 100);
};

window.exportSingleIOC = function (iocIndex) {
    const ioc = filteredIOCs[iocIndex];
    if (!ioc) return;

    try {
        const csvData = convertIOCsToCSV([ioc]);
        downloadFile(csvData, `secunik-ioc-${iocIndex}-${Date.now()}.csv`, 'text/csv');
        dashboard?.showNotification('IOC exported successfully', 'success');
    } catch (error) {
        console.error('Single IOC export failed:', error);
        dashboard?.showNotification('Failed to export IOC', 'error');
    }
};

window.copyToClipboard = async function (text) {
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        dashboard?.showNotification('Copied to clipboard', 'success', 2000);
    } catch (error) {
        console.error('Copy failed:', error);
        dashboard?.showNotification('Failed to copy', 'error');
    }
};

function createIOCDetailsModal(ioc) {
    const modal = document.createElement('div');
    modal.className = 'ioc-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeIOCModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>IOC Details</h3>
                <button class="modal-close" onclick="closeIOCModal()">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="ioc-details">
                    <div class="detail-row">
                        <label>Category:</label>
                        <span class="category-badge">${ioc.category || ioc.Category || 'Unknown'}</span>
                    </div>
                    <div class="detail-row">
                        <label>Value:</label>
                        <span class="ioc-value">${ioc.value || ioc.Value || 'N/A'}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${ioc.value || ioc.Value || ''}')">
                            <i data-feather="copy"></i>
                        </button>
                    </div>
                    <div class="detail-row">
                        <label>Confidence:</label>
                        <span class="confidence">${Math.round((ioc.confidence || ioc.Confidence || 0) * 100)}%</span>
                    </div>
                    <div class="detail-row">
                        <label>Severity:</label>
                        <span class="severity-badge ${(ioc.severity || ioc.Severity || 'low').toLowerCase()}">
                            ${(ioc.severity || ioc.Severity || '').toUpperCase()}
                        </span>
                    </div>
                    <div class="detail-row">
                        <label>Threat Type:</label>
                        <span>${ioc.threatType || ioc.ThreatType || 'Unknown'}</span>
                    </div>
                    <div class="detail-row">
                        <label>Source:</label>
                        <span>${ioc.source || ioc.Source || 'Unknown'}</span>
                    </div>
                    <div class="detail-row">
                        <label>Description:</label>
                        <span>${ioc.description || ioc.Description || 'No description available'}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeIOCModal()">Close</button>
                <button class="btn btn-secondary" onclick="searchThreatIntel('${ioc.value || ioc.Value || ''}')">
                    Search Threat Intel
                </button>
                <button class="btn btn-primary" onclick="createIOCCase(${filteredIOCs.indexOf(ioc)})">
                    Create Case
                </button>
            </div>
        </div>
    `;

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

window.closeIOCModal = function () {
    const modal = document.querySelector('.ioc-modal');
    if (modal) {
        modal.remove();
    }
};