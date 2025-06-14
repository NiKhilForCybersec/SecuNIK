let dashboard;

export function init(dash) {
    dashboard = dash;

    if (dashboard.elements.caseForm) {
        dashboard.elements.caseForm.addEventListener('submit', handleCaseSubmit);
    }

    if (dashboard.elements.exportCaseBtn) {
        dashboard.elements.exportCaseBtn.addEventListener('click', exportCase);
    }

    if (dashboard.elements.refreshCasesBtn) {
        dashboard.elements.refreshCasesBtn.addEventListener('click', refreshCases);
    }

    if (dashboard.elements.caseDescription) {
        dashboard.elements.caseDescription.addEventListener('input', updateCharCounter);
    }

    // Add real-time validation
    setupFormValidation();
}

export function render() {
    refreshCaseHistory();
}

function setupFormValidation() {
    const titleInput = dashboard.elements.caseTitle;
    const severitySelect = dashboard.elements.caseSeverity;
    const descriptionTextarea = dashboard.elements.caseDescription;

    if (titleInput) {
        titleInput.addEventListener('blur', () => validateField('title', titleInput.value));
        titleInput.addEventListener('input', () => clearFieldError('title'));
    }

    if (severitySelect) {
        severitySelect.addEventListener('change', () => validateField('severity', severitySelect.value));
    }

    if (descriptionTextarea) {
        descriptionTextarea.addEventListener('blur', () => validateField('description', descriptionTextarea.value));
        descriptionTextarea.addEventListener('input', () => clearFieldError('description'));
    }
}

function handleCaseSubmit(event) {
    event.preventDefault();

    // Show loading state
    const submitBtn = dashboard.elements.createCaseBtn;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Creating...';
    }

    try {
        const formData = new FormData(event.target);
        const caseData = {
            id: dashboard.generateCaseId(),
            title: formData.get('caseTitle')?.trim() || '',
            severity: formData.get('caseSeverity') || '',
            assignee: formData.get('caseAssignee')?.trim() || 'Unassigned',
            description: formData.get('caseDescription')?.trim() || '',
            status: 'open',
            createdAt: new Date().toISOString(),
            analysisId: dashboard.state.currentAnalysis?.analysisId || null,
            tags: [],
            priority: mapSeverityToPriority(formData.get('caseSeverity')),
            estimatedResolution: calculateEstimatedResolution(formData.get('caseSeverity'))
        };

        if (validateCase(caseData)) {
            createCase(caseData);
        }
    } catch (error) {
        console.error('Case creation failed:', error);
        dashboard.showNotification('Failed to create case', 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<i data-feather="plus"></i> Create Incident';
            feather.replace();
        }
    }
}

function validateCase(caseData) {
    const errors = {};

    // Title validation
    if (!caseData.title || caseData.title.length < 3) {
        errors.title = 'Title must be at least 3 characters long';
    } else if (caseData.title.length > 100) {
        errors.title = 'Title must be less than 100 characters';
    }

    // Severity validation
    if (!caseData.severity) {
        errors.severity = 'Severity is required';
    } else if (!['low', 'medium', 'high', 'critical'].includes(caseData.severity)) {
        errors.severity = 'Please select a valid severity level';
    }

    // Description validation
    if (!caseData.description || caseData.description.length < 10) {
        errors.description = 'Description must be at least 10 characters long';
    } else if (caseData.description.length > 1000) {
        errors.description = 'Description must be less than 1000 characters';
    }

    // Assignee validation (optional but if provided, must be valid)
    if (caseData.assignee && caseData.assignee !== 'Unassigned' && caseData.assignee.length < 2) {
        errors.assignee = 'Assignee name must be at least 2 characters';
    }

    // Check for duplicate case titles
    const existingCase = dashboard.state.cases.find(c =>
        c.title.toLowerCase() === caseData.title.toLowerCase() && c.status !== 'closed'
    );
    if (existingCase) {
        errors.title = 'A case with this title already exists';
    }

    displayValidationErrors(errors);
    return Object.keys(errors).length === 0;
}

function validateField(fieldName, value) {
    const errors = {};

    switch (fieldName) {
        case 'title':
            if (!value || value.length < 3) {
                errors.title = 'Title must be at least 3 characters long';
            } else if (value.length > 100) {
                errors.title = 'Title must be less than 100 characters';
            }
            break;
        case 'severity':
            if (!value) {
                errors.severity = 'Severity is required';
            }
            break;
        case 'description':
            if (!value || value.length < 10) {
                errors.description = 'Description must be at least 10 characters long';
            } else if (value.length > 1000) {
                errors.description = 'Description must be less than 1000 characters';
            }
            break;
    }

    displayValidationErrors(errors);
    return Object.keys(errors).length === 0;
}

function clearFieldError(fieldName) {
    const errorElement = document.getElementById(`case${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Error`);
    const formGroup = errorElement?.closest('.form-group');

    if (errorElement) {
        errorElement.textContent = '';
    }
    if (formGroup) {
        formGroup.classList.remove('error');
    }
}

function displayValidationErrors(errors) {
    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));

    Object.entries(errors).forEach(([field, message]) => {
        const errorElement = document.getElementById(`case${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
        const formGroup = errorElement?.closest('.form-group');

        if (errorElement) {
            errorElement.textContent = message;
        }
        if (formGroup) {
            formGroup.classList.add('error');
        }
    });
}

function createCase(caseData) {
    try {
        dashboard.state.cases.unshift(caseData); // Add to beginning for recent first
        dashboard.saveCases();
        refreshCaseHistory();
        clearCaseForm();

        dashboard.showNotification(
            `Case "${caseData.title}" created successfully`,
            'success'
        );

        // Auto-link to current analysis if available
        if (dashboard.state.currentAnalysis) {
            dashboard.showNotification(
                'Case has been linked to current analysis',
                'info'
            );
        }
    } catch (error) {
        console.error('Failed to create case:', error);
        dashboard.showNotification('Failed to save case data', 'error');
    }
}

function clearCaseForm() {
    if (dashboard.elements.caseForm) {
        dashboard.elements.caseForm.reset();
    }

    // Clear validation errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));

    // Reset character counter
    updateCharCounter({ target: { value: '' } });
}

function refreshCases() {
    try {
        dashboard.loadCases();
        refreshCaseHistory();
        dashboard.showNotification('Cases refreshed', 'info');
    } catch (error) {
        console.error('Failed to refresh cases:', error);
        dashboard.showNotification('Failed to refresh cases', 'error');
    }
}

function refreshCaseHistory() {
    if (!dashboard.elements.caseHistoryList) return;

    try {
        if (dashboard.state.cases.length === 0) {
            dashboard.elements.caseHistoryList.innerHTML = `
                <div class="placeholder-content">
                    <i data-feather="folder" width="32" height="32"></i>
                    <p>No cases found</p>
                    <small>Create your first incident case using the form</small>
                </div>
            `;
        } else {
            const recentCases = dashboard.state.cases
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10);

            dashboard.elements.caseHistoryList.innerHTML = recentCases.map(case_ => `
                <div class="case-item" data-case-id="${case_.id}" onclick="showCaseDetails('${case_.id}')">
                    <div class="case-header">
                        <div class="case-title">${dashboard.sanitizeHTML(case_.title)}</div>
                        <div class="case-severity ${case_.severity}">${case_.severity.toUpperCase()}</div>
                    </div>
                    <div class="case-meta">
                        <span><strong>Assignee:</strong> ${dashboard.sanitizeHTML(case_.assignee)}</span>
                        <span><strong>Created:</strong> ${dashboard.formatTimestamp(case_.createdAt)}</span>
                    </div>
                    <div class="case-status">
                        <strong>Status:</strong> ${case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                        ${case_.priority ? `• <strong>Priority:</strong> ${case_.priority}` : ''}
                    </div>
                    ${case_.description ? `
                        <div class="case-description">
                            ${dashboard.sanitizeHTML(case_.description.substring(0, 150))}${case_.description.length > 150 ? '...' : ''}
                        </div>
                    ` : ''}
                    ${case_.analysisId ? `
                        <div class="case-analysis-link">
                            <small><i data-feather="link" width="12" height="12"></i> Linked to analysis ${case_.analysisId}</small>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        // Re-initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    } catch (error) {
        console.error('Failed to refresh case history:', error);
        dashboard.elements.caseHistoryList.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="alert-circle" width="32" height="32"></i>
                <p>Failed to load cases</p>
                <small>Please try refreshing</small>
            </div>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

function updateCharCounter(event) {
    const value = event.target.value;
    const maxLength = 1000;
    const counter = document.getElementById('descriptionCounter');

    if (counter) {
        counter.textContent = `${value.length}/${maxLength}`;

        if (value.length > maxLength * 0.9) {
            counter.className = 'char-counter warning';
        } else {
            counter.className = 'char-counter';
        }
    }
}

function exportCase() {
    if (dashboard.state.cases.length === 0) {
        dashboard.showNotification('No cases to export', 'warning');
        return;
    }

    try {
        const exportData = {
            exportedAt: new Date().toISOString(),
            exportedBy: 'SecuNik Dashboard',
            totalCases: dashboard.state.cases.length,
            cases: dashboard.state.cases.map(case_ => ({
                ...case_,
                exportNote: 'Exported from SecuNik Professional Dashboard'
            }))
        };

        const data = JSON.stringify(exportData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-cases-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard.showNotification(`Exported ${dashboard.state.cases.length} cases successfully`, 'success');
    } catch (error) {
        console.error('Export failed:', error);
        dashboard.showNotification('Failed to export cases', 'error');
    }
}

// Utility functions
function mapSeverityToPriority(severity) {
    const priorityMap = {
        'critical': 'P1 - Critical',
        'high': 'P2 - High',
        'medium': 'P3 - Medium',
        'low': 'P4 - Low'
    };
    return priorityMap[severity] || 'P3 - Medium';
}

function calculateEstimatedResolution(severity) {
    const resolutionMap = {
        'critical': '4 hours',
        'high': '24 hours',
        'medium': '72 hours',
        'low': '1 week'
    };
    return resolutionMap[severity] || '72 hours';
}

// Global function for case details (called from HTML)
window.showCaseDetails = function (caseId) {
    const case_ = dashboard.state.cases.find(c => c.id === caseId);
    if (!case_) return;

    const detailsHtml = `
        <div class="case-details-modal">
            <div class="case-details-header">
                <h3>${dashboard.sanitizeHTML(case_.title)}</h3>
                <span class="case-severity ${case_.severity}">${case_.severity.toUpperCase()}</span>
            </div>
            <div class="case-details-body">
                <div class="detail-row">
                    <strong>ID:</strong> ${case_.id}
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> ${case_.status}
                </div>
                <div class="detail-row">
                    <strong>Assignee:</strong> ${case_.assignee}
                </div>
                <div class="detail-row">
                    <strong>Created:</strong> ${dashboard.formatTimestamp(case_.createdAt)}
                </div>
                <div class="detail-row">
                    <strong>Priority:</strong> ${case_.priority || 'Not set'}
                </div>
                <div class="detail-row">
                    <strong>Est. Resolution:</strong> ${case_.estimatedResolution || 'Not set'}
                </div>
                ${case_.analysisId ? `
                    <div class="detail-row">
                        <strong>Linked Analysis:</strong> ${case_.analysisId}
                    </div>
                ` : ''}
                <div class="detail-row">
                    <strong>Description:</strong>
                    <p style="margin-top: 0.5rem; line-height: 1.4;">${dashboard.sanitizeHTML(case_.description)}</p>
                </div>
            </div>
        </div>
    `;

    // Show in a simple alert for now (you could implement a proper modal)
    dashboard.showNotification(`Case Details: ${case_.title}`, 'info', 10000);
    console.log('Case Details:', case_);
};