/**
 * SecuNik Case Management Tab - Fixed Version
 * Incident case management and tracking
 * 
 * @version 2.1.0
 * @author SecuNik Team
 */

let dashboard = null;
let cases = [];
let filteredCases = [];
let currentFilters = {
    status: 'all',
    severity: 'all',
    assignee: 'all',
    search: ''
};
let currentSort = {
    field: 'createdAt',
    direction: 'desc'
};
let currentPage = 1;
let itemsPerPage = 10;
let editingCaseId = null;

/**
 * Initialize case management tab
 */
export function init(dashboardInstance) {
    dashboard = dashboardInstance;
    console.log('✅ Case Management tab initialized');

    // Load cases from dashboard state
    if (dashboard.state.cases) {
        cases = dashboard.state.cases;
        filteredCases = [...cases];
    }

    // Render the case management interface
    render();
}

/**
 * Render case management tab
 */
export function render() {
    console.log('📊 Rendering case management tab');

    renderCaseManagementInterface();
    setupCaseManagementEventListeners();
    applyFiltersAndSort();

    console.log(`✅ Case management rendered with ${cases.length} cases`);
}

/**
 * Render main case management interface
 */
function renderCaseManagementInterface() {
    const caseManagementTab = document.getElementById('caseManagementTab');
    if (!caseManagementTab) return;

    caseManagementTab.innerHTML = `
        <div class="case-management-container">
            <!-- Case Management Header -->
            <div class="section-header">
                <h2><i data-feather="folder" aria-hidden="true"></i> Case Management</h2>
                <div class="header-actions">
                    <div class="cases-summary">
                        <span class="total-cases">${cases.length} Total Cases</span>
                        <span class="open-cases">${getOpenCasesCount()} Open</span>
                        <span class="critical-cases">${getCriticalCasesCount()} Critical</span>
                    </div>
                    <button class="btn btn-secondary" id="exportCasesBtn">
                        <i data-feather="download"></i> Export Cases
                    </button>
                    <button class="btn btn-primary" id="newCaseBtn">
                        <i data-feather="plus"></i> New Case
                    </button>
                </div>
            </div>

            <!-- Case Management Controls -->
            <div class="case-controls">
                <div class="controls-row">
                    <!-- Search -->
                    <div class="control-group">
                        <label for="casesSearch">Search Cases:</label>
                        <div class="search-input-group">
                            <input type="text" id="casesSearch" placeholder="Search cases, titles, assignees..." 
                                   value="${currentFilters.search}">
                            <button class="search-btn" id="searchCasesBtn">
                                <i data-feather="search"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Status Filter -->
                    <div class="control-group">
                        <label for="statusFilter">Status:</label>
                        <select id="statusFilter" value="${currentFilters.status}">
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="closed">Closed</option>
                            <option value="on-hold">On Hold</option>
                        </select>
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

                    <!-- Assignee Filter -->
                    <div class="control-group">
                        <label for="assigneeFilter">Assignee:</label>
                        <select id="assigneeFilter" value="${currentFilters.assignee}">
                            <option value="all">All Assignees</option>
                            ${getUniqueAssignees().map(assignee =>
        `<option value="${assignee}">${assignee}</option>`
    ).join('')}
                        </select>
                    </div>
                </div>

                <div class="controls-row">
                    <!-- Sort Options -->
                    <div class="control-group">
                        <label for="sortField">Sort By:</label>
                        <select id="sortField" value="${currentSort.field}">
                            <option value="createdAt">Created Date</option>
                            <option value="updatedAt">Updated Date</option>
                            <option value="title">Title</option>
                            <option value="severity">Severity</option>
                            <option value="status">Status</option>
                            <option value="assignee">Assignee</option>
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
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>

                    <!-- Clear Filters -->
                    <div class="control-group">
                        <button class="btn btn-outline" id="clearCaseFiltersBtn">
                            <i data-feather="x"></i> Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <!-- Case Statistics -->
            <div class="case-stats" id="caseStats">
                <!-- Will be populated by updateCaseStats() -->
            </div>

            <!-- Case Form Section -->
            <div class="case-form-section" id="caseFormSection" style="display: none;">
                <div class="form-header">
                    <h3 id="caseFormTitle">Create New Case</h3>
                    <button class="btn btn-outline btn-sm" id="cancelCaseFormBtn">
                        <i data-feather="x"></i> Cancel
                    </button>
                </div>
                
                <form class="case-form" id="caseForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="caseTitle">Case Title *</label>
                            <input type="text" id="caseTitle" name="title" required 
                                   placeholder="Enter case title">
                        </div>
                        
                        <div class="form-group">
                            <label for="caseSeverity">Severity *</label>
                            <select id="caseSeverity" name="severity" required>
                                <option value="">Select severity</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="caseAssignee">Assignee *</label>
                            <input type="text" id="caseAssignee" name="assignee" required 
                                   placeholder="Enter assignee name">
                        </div>
                        
                        <div class="form-group">
                            <label for="caseStatus">Status</label>
                            <select id="caseStatus" name="status">
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="on-hold">On Hold</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="casePriority">Priority</label>
                            <select id="casePriority" name="priority">
                                <option value="">Select priority</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="normal">Normal</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="caseDueDate">Due Date</label>
                            <input type="date" id="caseDueDate" name="dueDate">
                        </div>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="caseDescription">Description</label>
                        <textarea id="caseDescription" name="description" rows="4" 
                                  placeholder="Enter case description and details"></textarea>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="caseTags">Tags</label>
                        <input type="text" id="caseTags" name="tags" 
                               placeholder="Enter tags separated by commas">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" id="saveCaseBtn">
                            <i data-feather="save"></i> <span id="saveCaseText">Create Case</span>
                        </button>
                        <button type="button" class="btn btn-outline" id="resetCaseFormBtn">
                            <i data-feather="refresh-ccw"></i> Reset Form
                        </button>
                    </div>
                </form>
            </div>

            <!-- Cases List -->
            <div class="cases-list-section">
                <div class="cases-list-header">
                    <h3>Cases</h3>
                    <div class="list-info">
                        <span id="casesShowing">Showing 0 cases</span>
                    </div>
                </div>
                
                <div class="cases-list" id="casesList">
                    <!-- Cases will be rendered here -->
                </div>

                <!-- Pagination -->
                <div class="pagination-container" id="casesPaginationContainer">
                    <!-- Pagination will be rendered here -->
                </div>
            </div>

            <!-- Case Details Modal -->
            <div class="case-details-modal" id="caseDetailsModal" style="display: none;">
                <div class="modal-backdrop" onclick="closeCaseDetails()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Case Details</h3>
                        <div class="modal-actions">
                            <button class="btn btn-sm btn-secondary" onclick="editCase()">
                                <i data-feather="edit"></i> Edit
                            </button>
                            <button class="modal-close" onclick="closeCaseDetails()">
                                <i data-feather="x"></i>
                            </button>
                        </div>
                    </div>
                    <div class="modal-body" id="caseDetailsContent">
                        <!-- Case details will be populated here -->
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
 * Setup case management event listeners
 */
function setupCaseManagementEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('casesSearch');
    const searchBtn = document.getElementById('searchCasesBtn');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleCaseSearch, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleCaseSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleCaseSearch);
    }

    // Filter controls
    const statusFilter = document.getElementById('statusFilter');
    const severityFilter = document.getElementById('severityFilter');
    const assigneeFilter = document.getElementById('assigneeFilter');

    if (statusFilter) {
        statusFilter.addEventListener('change', handleCaseFilterChange);
    }
    if (severityFilter) {
        severityFilter.addEventListener('change', handleCaseFilterChange);
    }
    if (assigneeFilter) {
        assigneeFilter.addEventListener('change', handleCaseFilterChange);
    }

    // Sort controls
    const sortField = document.getElementById('sortField');
    const sortDirection = document.getElementById('sortDirection');

    if (sortField) {
        sortField.addEventListener('change', handleCaseSortChange);
    }
    if (sortDirection) {
        sortDirection.addEventListener('change', handleCaseSortChange);
    }

    // Items per page
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', handleCaseItemsPerPageChange);
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clearCaseFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllCaseFilters);
    }

    // New case button
    const newCaseBtn = document.getElementById('newCaseBtn');
    if (newCaseBtn) {
        newCaseBtn.addEventListener('click', showNewCaseForm);
    }

    // Export cases button
    const exportBtn = document.getElementById('exportCasesBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCases);
    }

    // Case form controls
    const caseForm = document.getElementById('caseForm');
    const cancelFormBtn = document.getElementById('cancelCaseFormBtn');
    const resetFormBtn = document.getElementById('resetCaseFormBtn');

    if (caseForm) {
        caseForm.addEventListener('submit', handleCaseFormSubmit);
    }
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', hideCaseForm);
    }
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetCaseForm);
    }
}

/**
 * Handle case search functionality
 */
function handleCaseSearch() {
    const searchInput = document.getElementById('casesSearch');
    if (!searchInput) return;

    currentFilters.search = searchInput.value.trim().toLowerCase();
    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Handle case filter changes
 */
function handleCaseFilterChange() {
    const statusFilter = document.getElementById('statusFilter');
    const severityFilter = document.getElementById('severityFilter');
    const assigneeFilter = document.getElementById('assigneeFilter');

    if (statusFilter) currentFilters.status = statusFilter.value;
    if (severityFilter) currentFilters.severity = severityFilter.value;
    if (assigneeFilter) currentFilters.assignee = assigneeFilter.value;

    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Handle case sort changes
 */
function handleCaseSortChange() {
    const sortField = document.getElementById('sortField');
    const sortDirection = document.getElementById('sortDirection');

    if (sortField) currentSort.field = sortField.value;
    if (sortDirection) currentSort.direction = sortDirection.value;

    applyFiltersAndSort();
}

/**
 * Handle case items per page change
 */
function handleCaseItemsPerPageChange() {
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (!itemsPerPageSelect) return;

    itemsPerPage = parseInt(itemsPerPageSelect.value);
    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

/**
 * Clear all case filters
 */
function clearAllCaseFilters() {
    currentFilters = {
        status: 'all',
        severity: 'all',
        assignee: 'all',
        search: ''
    };

    // Reset form controls
    const searchInput = document.getElementById('casesSearch');
    const statusFilter = document.getElementById('statusFilter');
    const severityFilter = document.getElementById('severityFilter');
    const assigneeFilter = document.getElementById('assigneeFilter');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = 'all';
    if (severityFilter) severityFilter.value = 'all';
    if (assigneeFilter) assigneeFilter.value = 'all';

    currentPage = 1;
    applyFiltersAndSort();
}

/**
 * Apply filters and sorting to cases
 */
function applyFiltersAndSort() {
    // Start with all cases
    filteredCases = [...cases];

    // Apply filters
    filteredCases = filteredCases.filter(caseItem => {
        // Status filter
        if (currentFilters.status !== 'all' && caseItem.status !== currentFilters.status) {
            return false;
        }

        // Severity filter
        if (currentFilters.severity !== 'all' && caseItem.severity !== currentFilters.severity) {
            return false;
        }

        // Assignee filter
        if (currentFilters.assignee !== 'all' && caseItem.assignee !== currentFilters.assignee) {
            return false;
        }

        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const searchFields = [
                caseItem.title,
                caseItem.description,
                caseItem.assignee,
                ...(caseItem.tags || [])
            ].join(' ').toLowerCase();

            if (!searchFields.includes(searchLower)) {
                return false;
            }
        }

        return true;
    });

    // Apply sorting
    filteredCases.sort((a, b) => {
        let aValue = a[currentSort.field];
        let bValue = b[currentSort.field];

        // Handle special cases
        if (currentSort.field === 'createdAt' || currentSort.field === 'updatedAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (currentSort.field === 'severity') {
            const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            aValue = severityOrder[aValue] || 0;
            bValue = severityOrder[bValue] || 0;
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
    updateCaseStats();
    renderCasesList();
    renderCasesPagination();
}

/**
 * Update case statistics
 */
function updateCaseStats() {
    const statsContainer = document.getElementById('caseStats');
    if (!statsContainer) return;

    const total = filteredCases.length;
    const open = filteredCases.filter(c => c.status === 'open').length;
    const inProgress = filteredCases.filter(c => c.status === 'in-progress').length;
    const closed = filteredCases.filter(c => c.status === 'closed').length;
    const critical = filteredCases.filter(c => c.severity === 'critical').length;
    const high = filteredCases.filter(c => c.severity === 'high').length;

    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total Cases</div>
            </div>
            <div class="stat-item open">
                <div class="stat-value">${open}</div>
                <div class="stat-label">Open</div>
            </div>
            <div class="stat-item progress">
                <div class="stat-value">${inProgress}</div>
                <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-item closed">
                <div class="stat-value">${closed}</div>
                <div class="stat-label">Closed</div>
            </div>
            <div class="stat-item critical">
                <div class="stat-value">${critical}</div>
                <div class="stat-label">Critical</div>
            </div>
            <div class="stat-item high">
                <div class="stat-value">${high}</div>
                <div class="stat-label">High Priority</div>
            </div>
        </div>
    `;
}

/**
 * Render cases list
 */
function renderCasesList() {
    const container = document.getElementById('casesList');
    const showingSpan = document.getElementById('casesShowing');

    if (!container) return;

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageCases = filteredCases.slice(startIndex, endIndex);

    // Update showing text
    if (showingSpan) {
        showingSpan.textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, filteredCases.length)} of ${filteredCases.length} cases`;
    }

    // Render cases
    if (pageCases.length === 0) {
        container.innerHTML = `
            <div class="no-cases">
                <div class="no-cases-content">
                    <i data-feather="folder" width="64" height="64"></i>
                    <h3>No Cases Found</h3>
                    <p>${filteredCases.length === 0 && cases.length === 0
                ? 'No cases have been created yet.'
                : 'No cases match your current filters.'}</p>
                    <div class="no-cases-actions">
                        ${filteredCases.length === 0 && cases.length === 0
                ? `<button class="btn btn-primary" onclick="showNewCaseForm()">
                                <i data-feather="plus"></i> Create First Case
                               </button>`
                : `<button class="btn btn-outline" onclick="clearAllCaseFilters()">
                                <i data-feather="x"></i> Clear Filters
                               </button>`}
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = pageCases.map(caseItem => `
            <div class="case-card ${caseItem.severity}" data-case-id="${caseItem.id}">
                <div class="case-header">
                    <div class="case-title-section">
                        <h4 class="case-title" onclick="showCaseDetails('${caseItem.id}')">${caseItem.title}</h4>
                        <div class="case-meta">
                            <span class="case-id">Case #${caseItem.id}</span>
                            <span class="case-created">Created: ${formatTimestamp(caseItem.createdAt)}</span>
                        </div>
                    </div>
                    <div class="case-badges">
                        <span class="severity-badge ${caseItem.severity}">
                            <i data-feather="${getSeverityIcon(caseItem.severity)}" width="12" height="12"></i>
                            ${caseItem.severity.toUpperCase()}
                        </span>
                        <span class="status-badge ${caseItem.status}">
                            ${caseItem.status.replace('-', ' ').toUpperCase()}
                        </span>
                        ${caseItem.priority ? `
                            <span class="priority-badge ${caseItem.priority}">
                                ${caseItem.priority.toUpperCase()}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="case-body">
                    <div class="case-description">
                        ${caseItem.description ? truncateText(caseItem.description, 150) : 'No description provided'}
                    </div>
                    
                    <div class="case-details-grid">
                        <div class="detail-item">
                            <label>Assignee:</label>
                            <span>${caseItem.assignee}</span>
                        </div>
                        ${caseItem.dueDate ? `
                            <div class="detail-item">
                                <label>Due Date:</label>
                                <span class="${isOverdue(caseItem.dueDate) ? 'overdue' : ''}">${formatDate(caseItem.dueDate)}</span>
                            </div>
                        ` : ''}
                        ${caseItem.updatedAt !== caseItem.createdAt ? `
                            <div class="detail-item">
                                <label>Last Updated:</label>
                                <span>${formatTimestamp(caseItem.updatedAt)}</span>
                            </div>
                        ` : ''}
                        ${caseItem.analysisId ? `
                            <div class="detail-item">
                                <label>Linked Analysis:</label>
                                <span>Analysis #${caseItem.analysisId}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${caseItem.tags && caseItem.tags.length > 0 ? `
                        <div class="case-tags">
                            ${caseItem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="case-actions">
                    <button class="btn btn-sm btn-outline" onclick="showCaseDetails('${caseItem.id}')">
                        <i data-feather="eye" width="14" height="14"></i> View Details
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editCaseById('${caseItem.id}')">
                        <i data-feather="edit" width="14" height="14"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="duplicateCase('${caseItem.id}')">
                        <i data-feather="copy" width="14" height="14"></i> Duplicate
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="exportSingleCase('${caseItem.id}')">
                        <i data-feather="download" width="14" height="14"></i> Export
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCase('${caseItem.id}')">
                        <i data-feather="trash-2" width="14" height="14"></i> Delete
                    </button>
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
 * Render cases pagination
 */
function renderCasesPagination() {
    const container = document.getElementById('casesPaginationContainer');
    if (!container) return;

    const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

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
                    onclick="changeCasePage(1)" title="First Page">
                <i data-feather="chevrons-left" width="14" height="14"></i>
            </button>
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="changeCasePage(${currentPage - 1})" title="Previous Page">
                <i data-feather="chevron-left" width="14" height="14"></i>
            </button>
    `;

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changeCasePage(${i})">${i}</button>
        `;
    }

    paginationHTML += `
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changeCasePage(${currentPage + 1})" title="Next Page">
                <i data-feather="chevron-right" width="14" height="14"></i>
            </button>
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changeCasePage(${totalPages})" title="Last Page">
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
 * Show new case form
 */
function showNewCaseForm() {
    editingCaseId = null;
    const formSection = document.getElementById('caseFormSection');
    const formTitle = document.getElementById('caseFormTitle');
    const saveText = document.getElementById('saveCaseText');

    if (formSection) formSection.style.display = 'block';
    if (formTitle) formTitle.textContent = 'Create New Case';
    if (saveText) saveText.textContent = 'Create Case';

    resetCaseForm();

    // Scroll to form
    formSection?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Hide case form
 */
function hideCaseForm() {
    const formSection = document.getElementById('caseFormSection');
    if (formSection) {
        formSection.style.display = 'none';
    }
    editingCaseId = null;
    resetCaseForm();
}

/**
 * Reset case form
 */
function resetCaseForm() {
    const form = document.getElementById('caseForm');
    if (form) {
        form.reset();
    }
}

/**
 * Handle case form submission
 */
function handleCaseFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const caseData = {
        title: formData.get('title')?.trim(),
        severity: formData.get('severity'),
        assignee: formData.get('assignee')?.trim(),
        status: formData.get('status') || 'open',
        priority: formData.get('priority') || '',
        dueDate: formData.get('dueDate') || '',
        description: formData.get('description')?.trim() || '',
        tags: formData.get('tags')?.split(',').map(tag => tag.trim()).filter(tag => tag) || []
    };

    // Validate required fields
    if (!caseData.title || !caseData.severity || !caseData.assignee) {
        dashboard?.showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (editingCaseId) {
        // Update existing case
        updateCase(editingCaseId, caseData);
    } else {
        // Create new case
        createCase(caseData);
    }
}

/**
 * Create new case
 */
function createCase(caseData) {
    const newCase = {
        id: Date.now().toString(),
        ...caseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysisId: dashboard?.state.currentAnalysis?.id || null
    };

    cases.unshift(newCase);
    dashboard.state.cases = cases;
    dashboard.saveCases();

    hideCaseForm();
    applyFiltersAndSort();

    dashboard?.showNotification(`Case "${newCase.title}" created successfully`, 'success');
}

/**
 * Update existing case
 */
function updateCase(caseId, caseData) {
    const caseIndex = cases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) return;

    cases[caseIndex] = {
        ...cases[caseIndex],
        ...caseData,
        updatedAt: new Date().toISOString()
    };

    dashboard.state.cases = cases;
    dashboard.saveCases();

    hideCaseForm();
    applyFiltersAndSort();

    dashboard?.showNotification(`Case "${cases[caseIndex].title}" updated successfully`, 'success');
}

/**
 * Export cases to CSV
 */
function exportCases() {
    try {
        const csvData = convertCasesToCSV(filteredCases);
        downloadCSV(csvData, `secunik-cases-${Date.now()}.csv`);
        dashboard?.showNotification('Cases exported successfully', 'success');
    } catch (error) {
        console.error('Cases export failed:', error);
        dashboard?.showNotification('Failed to export cases', 'error');
    }
}

// Helper functions

function getOpenCasesCount() {
    return cases.filter(c => c.status === 'open' || c.status === 'in-progress').length;
}

function getCriticalCasesCount() {
    return cases.filter(c => c.severity === 'critical').length;
}

function getUniqueAssignees() {
    const assignees = [...new Set(cases.map(c => c.assignee))];
    return assignees.filter(assignee => assignee).sort();
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
        return 'Unknown';
    }
}

function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return dateString;
    }
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
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

function convertCasesToCSV(casesData) {
    const headers = ['ID', 'Title', 'Severity', 'Status', 'Assignee', 'Priority', 'Due Date', 'Created', 'Updated', 'Description'];
    const rows = casesData.map(caseItem => [
        caseItem.id,
        caseItem.title,
        caseItem.severity,
        caseItem.status,
        caseItem.assignee,
        caseItem.priority || '',
        caseItem.dueDate || '',
        formatTimestamp(caseItem.createdAt),
        formatTimestamp(caseItem.updatedAt),
        caseItem.description || ''
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
window.changeCasePage = function (page) {
    currentPage = page;
    renderCasesList();
    renderCasesPagination();
};

window.showCaseDetails = function (caseId) {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const modal = document.getElementById('caseDetailsModal');
    const content = document.getElementById('caseDetailsContent');

    if (!modal || !content) return;

    content.innerHTML = `
        <div class="case-full-details">
            <div class="detail-section">
                <h4>Case Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Case ID:</label>
                        <span>#${caseItem.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Title:</label>
                        <span>${caseItem.title}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status:</label>
                        <span class="status-badge ${caseItem.status}">${caseItem.status.replace('-', ' ').toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <label>Severity:</label>
                        <span class="severity-badge ${caseItem.severity}">
                            <i data-feather="${getSeverityIcon(caseItem.severity)}" width="16" height="16"></i>
                            ${caseItem.severity.toUpperCase()}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Assignee:</label>
                        <span>${caseItem.assignee}</span>
                    </div>
                    ${caseItem.priority ? `
                        <div class="detail-item">
                            <label>Priority:</label>
                            <span class="priority-badge ${caseItem.priority}">${caseItem.priority.toUpperCase()}</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <label>Created:</label>
                        <span>${formatTimestamp(caseItem.createdAt)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Last Updated:</label>
                        <span>${formatTimestamp(caseItem.updatedAt)}</span>
                    </div>
                    ${caseItem.dueDate ? `
                        <div class="detail-item">
                            <label>Due Date:</label>
                            <span class="${isOverdue(caseItem.dueDate) ? 'overdue' : ''}">${formatDate(caseItem.dueDate)}</span>
                        </div>
                    ` : ''}
                    ${caseItem.analysisId ? `
                        <div class="detail-item">
                            <label>Linked Analysis:</label>
                            <span>Analysis #${caseItem.analysisId}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${caseItem.description ? `
                <div class="detail-section">
                    <h4>Description</h4>
                    <p class="case-description-full">${caseItem.description}</p>
                </div>
            ` : ''}
            
            ${caseItem.tags && caseItem.tags.length > 0 ? `
                <div class="detail-section">
                    <h4>Tags</h4>
                    <div class="tags-container">
                        ${caseItem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="detail-actions">
                <button class="btn btn-primary" onclick="editCaseById('${caseItem.id}')">
                    <i data-feather="edit"></i> Edit Case
                </button>
                <button class="btn btn-secondary" onclick="duplicateCase('${caseItem.id}')">
                    <i data-feather="copy"></i> Duplicate Case
                </button>
                <button class="btn btn-secondary" onclick="exportSingleCase('${caseItem.id}')">
                    <i data-feather="download"></i> Export Case
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

window.closeCaseDetails = function () {
    const modal = document.getElementById('caseDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.editCase = function () {
    const modal = document.getElementById('caseDetailsModal');
    const caseId = modal.dataset.caseId;
    if (caseId) {
        editCaseById(caseId);
    }
    closeCaseDetails();
};

window.editCaseById = function (caseId) {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    editingCaseId = caseId;

    // Show form
    const formSection = document.getElementById('caseFormSection');
    const formTitle = document.getElementById('caseFormTitle');
    const saveText = document.getElementById('saveCaseText');

    if (formSection) formSection.style.display = 'block';
    if (formTitle) formTitle.textContent = 'Edit Case';
    if (saveText) saveText.textContent = 'Update Case';

    // Populate form
    const form = document.getElementById('caseForm');
    if (form) {
        form.title.value = caseItem.title;
        form.severity.value = caseItem.severity;
        form.assignee.value = caseItem.assignee;
        form.status.value = caseItem.status;
        form.priority.value = caseItem.priority || '';
        form.dueDate.value = caseItem.dueDate || '';
        form.description.value = caseItem.description || '';
        form.tags.value = (caseItem.tags || []).join(', ');
    }

    // Scroll to form
    formSection?.scrollIntoView({ behavior: 'smooth' });
};

window.duplicateCase = function (caseId) {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const duplicatedCase = {
        ...caseItem,
        id: Date.now().toString(),
        title: `${caseItem.title} (Copy)`,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    cases.unshift(duplicatedCase);
    dashboard.state.cases = cases;
    dashboard.saveCases();

    applyFiltersAndSort();
    dashboard?.showNotification(`Case duplicated: "${duplicatedCase.title}"`, 'success');
};

window.deleteCase = function (caseId) {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    if (confirm(`Are you sure you want to delete case "${caseItem.title}"? This action cannot be undone.`)) {
        const caseIndex = cases.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
            cases.splice(caseIndex, 1);
            dashboard.state.cases = cases;
            dashboard.saveCases();

            applyFiltersAndSort();
            dashboard?.showNotification(`Case "${caseItem.title}" deleted`, 'success');
        }
    }
};

window.exportSingleCase = function (caseId) {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    try {
        const csvData = convertCasesToCSV([caseItem]);
        downloadCSV(csvData, `secunik-case-${caseId}-${Date.now()}.csv`);
        dashboard?.showNotification('Case exported successfully', 'success');
    } catch (error) {
        console.error('Case export failed:', error);
        dashboard?.showNotification('Failed to export case', 'error');
    }
};

window.showNewCaseForm = showNewCaseForm;
window.clearAllCaseFilters = clearAllCaseFilters;

// Export functions
export { init, render };

