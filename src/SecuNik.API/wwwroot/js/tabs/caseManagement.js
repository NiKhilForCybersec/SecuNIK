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
}

export function render() {
    refreshCaseHistory();
}

function handleCaseSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const caseData = {
        id: dashboard.generateCaseId(),
        title: formData.get('caseTitle'),
        severity: formData.get('caseSeverity'),
        assignee: formData.get('caseAssignee') || 'Unassigned',
        description: formData.get('caseDescription'),
        status: 'open',
        createdAt: new Date().toISOString(),
        analysisId: dashboard.state.currentAnalysis?.analysisId || null
    };

    if (validateCase(caseData)) {
        createCase(caseData);
    }
}

function validateCase(caseData) {
    const errors = {};

    if (!caseData.title || caseData.title.trim().length < 3) {
        errors.title = 'Title must be at least 3 characters long';
    }

    if (!caseData.severity) {
        errors.severity = 'Severity is required';
    }

    if (!caseData.description || caseData.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters long';
    }

    displayValidationErrors(errors);
    return Object.keys(errors).length === 0;
}

function displayValidationErrors(errors) {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    Object.entries(errors).forEach(([field, message]) => {
        const errorElement = document.getElementById(`case${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    });
}

function createCase(caseData) {
    dashboard.state.cases.push(caseData);
    dashboard.saveCases();
    refreshCaseHistory();
    clearCaseForm();
    dashboard.showNotification(`Case "${caseData.title}" created successfully`, 'success');
}

function clearCaseForm() {
    if (dashboard.elements.caseForm) {
        dashboard.elements.caseForm.reset();
    }
    updateCharCounter({ target: { value: '' } });
}

function refreshCases() {
    dashboard.loadCases();
    refreshCaseHistory();
    dashboard.showNotification('Cases refreshed', 'info');
}

function refreshCaseHistory() {
    if (!dashboard.elements.caseHistoryList) return;

    if (dashboard.state.cases.length === 0) {
        dashboard.elements.caseHistoryList.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="folder" width="32" height="32"></i>
                <p>No cases found</p>
            </div>
        `;
    } else {
        const recentCases = dashboard.state.cases
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        dashboard.elements.caseHistoryList.innerHTML = recentCases.map(case_ => `
            <div class="case-item" data-case-id="${case_.id}">
                <div class="case-header">
                    <div class="case-title">${dashboard.sanitizeHTML(case_.title)}</div>
                    <div class="case-severity ${case_.severity}">${case_.severity.toUpperCase()}</div>
                </div>
                <div class="case-meta">
                    <span>Assignee: ${dashboard.sanitizeHTML(case_.assignee)}</span>
                    <span>Created: ${dashboard.formatTimestamp(case_.createdAt)}</span>
                </div>
                <div class="case-status">Status: ${case_.status}</div>
            </div>
        `).join('');
    }

    feather.replace();
}

function updateCharCounter(event) {
    const value = event.target.value;
    const maxLength = 1000;
    const counter = document.getElementById('descriptionCounter');

    if (counter) {
        counter.textContent = `${value.length}/${maxLength}`;
        counter.className = value.length > maxLength * 0.9 ? 'char-counter warning' : 'char-counter';
    }
}

function exportCase() {
    if (dashboard.state.cases.length === 0) {
        dashboard.showNotification('No cases to export', 'warning');
        return;
    }

    try {
        const data = JSON.stringify(dashboard.state.cases, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-cases-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard.showNotification('Cases exported successfully', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        dashboard.showNotification('Failed to export cases', 'error');
    }
}

