export function init(data) {
    // Initialize executive summary functionality
    setupExecutiveControls();
    setupExecutiveExport();
}

export function render(analysis) {
    if (!analysis) return;

    const executiveData = extractExecutiveData(analysis);
    renderExecutiveSummary(executiveData);
    renderRiskAssessment(executiveData);
    renderKeyFindings(executiveData);
    renderRecommendations(executiveData);
    renderBusinessImpact(executiveData);
}

function extractExecutiveData(analysis) {
    const result = analysis.result;

    // Handle multiple data structure formats
    const executive = result.executive || result.Executive || {};
    const ai = result.ai || result.AI || {};
    const technical = result.technical || result.Technical || {};

    return {
        summary: executive.summary || ai.summary || 'Executive summary not available',
        keyFindings: executive.keyFindings || ai.keyFindings || generateKeyFindings(technical),
        riskLevel: executive.riskLevel || ai.riskLevel || calculateRiskLevel(technical),
        immediateActions: executive.immediateActions || ai.immediateActions || ai.recommendedActions || [],
        longTermRecommendations: executive.longTermRecommendations || ai.longTermRecommendations || [],
        businessImpact: executive.businessImpact || ai.businessImpact || 'Business impact assessment pending',
        attackVector: ai.attackVector || 'Attack vector analysis pending',
        threatAssessment: ai.threatAssessment || 'Threat assessment pending',
        severityScore: ai.severityScore || calculateSeverityScore(technical),
        metadata: {
            analysisId: analysis.analysisId,
            fileName: analysis.fileInfo?.name || 'Unknown file',
            timestamp: analysis.timestamp,
            processingTime: analysis.processingTime
        }
    };
}

function generateKeyFindings(technical) {
    const events = technical.securityEvents || technical.SecurityEvents || [];
    const iocs = technical.detectedIOCs || technical.DetectedIOCs || [];

    const findings = [];

    if (events.length > 0) {
        findings.push(`${events.length} security events detected across analyzed data`);
    }

    if (iocs.length > 0) {
        findings.push(`${iocs.length} indicators of compromise identified`);
    }

    const criticalEvents = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'critical'
    ).length;

    if (criticalEvents > 0) {
        findings.push(`${criticalEvents} critical severity events requiring immediate attention`);
    }

    const highEvents = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'high'
    ).length;

    if (highEvents > 0) {
        findings.push(`${highEvents} high severity events identified`);
    }

    return findings.join('\n• ');
}

function calculateRiskLevel(technical) {
    const events = technical.securityEvents || technical.SecurityEvents || [];
    const iocs = technical.detectedIOCs || technical.DetectedIOCs || [];

    const criticalEvents = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'critical'
    ).length;

    const highEvents = events.filter(e =>
        (e.severity || e.Severity || '').toLowerCase() === 'high'
    ).length;

    if (criticalEvents > 0 || highEvents > 5) return 'HIGH';
    if (highEvents > 0 || iocs.length > 10) return 'MEDIUM';
    return 'LOW';
}

function calculateSeverityScore(technical) {
    const events = technical.securityEvents || technical.SecurityEvents || [];
    const iocs = technical.detectedIOCs || technical.DetectedIOCs || [];

    let score = 1;

    events.forEach(event => {
        switch ((event.severity || event.Severity || '').toLowerCase()) {
            case 'critical': score += 25; break;
            case 'high': score += 15; break;
            case 'medium': score += 8; break;
            case 'low': score += 3; break;
            default: score += 1;
        }
    });

    score += iocs.length * 2;

    return Math.min(Math.round(score), 100);
}

function renderExecutiveSummary(data) {
    const container = document.getElementById('executiveSummaryContainer') ||
        document.querySelector('.executive-summary');

    if (!container) return;

    container.innerHTML = `
        <div class="executive-header">
            <div class="executive-title">
                <h2>Executive Summary</h2>
                <div class="executive-meta">
                    <span class="analysis-id">Analysis ID: ${data.metadata.analysisId}</span>
                    <span class="analysis-date">${new Date(data.metadata.timestamp).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="executive-controls">
                <button class="btn btn-secondary" id="printExecutiveBtn">
                    <i data-feather="printer"></i> Print
                </button>
                <button class="btn btn-primary" id="exportExecutiveBtn">
                    <i data-feather="download"></i> Export PDF
                </button>
            </div>
        </div>
        
        <div class="executive-content">
            <div class="summary-section">
                <h3>Analysis Overview</h3>
                <div class="summary-text">
                    ${formatExecutiveText(data.summary)}
                </div>
                <div class="summary-metrics">
                    <div class="metric-item">
                        <span class="metric-label">File Analyzed:</span>
                        <span class="metric-value">${data.metadata.fileName}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Processing Time:</span>
                        <span class="metric-value">${formatProcessingTime(data.metadata.processingTime)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Risk Level:</span>
                        <span class="metric-value risk-${data.riskLevel.toLowerCase()}">${data.riskLevel}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Severity Score:</span>
                        <span class="metric-value">${data.severityScore}/100</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function renderRiskAssessment(data) {
    const container = document.getElementById('riskAssessmentContainer') ||
        document.querySelector('.risk-assessment');

    if (!container) return;

    const riskColor = {
        'HIGH': '#ef4444',
        'MEDIUM': '#f59e0b',
        'LOW': '#10b981'
    }[data.riskLevel] || '#6b7280';

    container.innerHTML = `
        <div class="risk-assessment-card">
            <div class="risk-header">
                <h3>Risk Assessment</h3>
                <div class="risk-level-badge" style="background: ${riskColor}">
                    ${data.riskLevel} RISK
                </div>
            </div>
            <div class="risk-content">
                <div class="risk-score-visual">
                    <div class="risk-gauge">
                        <div class="gauge-fill" style="width: ${data.severityScore}%; background: ${riskColor}"></div>
                    </div>
                    <div class="risk-score-text">
                        <span class="score-value">${data.severityScore}</span>
                        <span class="score-label">/ 100</span>
                    </div>
                </div>
                <div class="risk-details">
                    <div class="risk-item">
                        <strong>Attack Vector:</strong>
                        <p>${formatExecutiveText(data.attackVector)}</p>
                    </div>
                    <div class="risk-item">
                        <strong>Threat Assessment:</strong>
                        <p>${formatExecutiveText(data.threatAssessment)}</p>
                    </div>
                    <div class="risk-item">
                        <strong>Business Impact:</strong>
                        <p>${formatExecutiveText(data.businessImpact)}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderKeyFindings(data) {
    const container = document.getElementById('keyFindingsContainer') ||
        document.querySelector('.key-findings');

    if (!container) return;

    container.innerHTML = `
        <div class="findings-card">
            <div class="findings-header">
                <h3>Key Findings</h3>
                <div class="findings-count">${countFindings(data.keyFindings)} items</div>
            </div>
            <div class="findings-content">
                <div class="findings-list">
                    ${formatFindingsList(data.keyFindings)}
                </div>
            </div>
        </div>
    `;
}

function renderRecommendations(data) {
    const container = document.getElementById('recommendationsContainer') ||
        document.querySelector('.recommendations');

    if (!container) return;

    const immediateActions = Array.isArray(data.immediateActions) ?
        data.immediateActions :
        (data.immediateActions ? [data.immediateActions] : []);

    const longTermActions = Array.isArray(data.longTermRecommendations) ?
        data.longTermRecommendations :
        (data.longTermRecommendations ? [data.longTermRecommendations] : []);

    container.innerHTML = `
        <div class="recommendations-card">
            <div class="recommendations-header">
                <h3>Recommendations</h3>
            </div>
            <div class="recommendations-content">
                <div class="immediate-actions">
                    <h4><i data-feather="alert-circle"></i> Immediate Actions</h4>
                    <div class="actions-list immediate">
                        ${immediateActions.length > 0 ?
            immediateActions.map((action, index) => `
                            <div class="action-item priority-high">
                                <div class="action-number">${index + 1}</div>
                                <div class="action-text">${formatExecutiveText(action)}</div>
                                <div class="action-priority">HIGH</div>
                            </div>
                          `).join('') :
            '<div class="no-actions">No immediate actions required</div>'
        }
                    </div>
                </div>
                
                <div class="long-term-actions">
                    <h4><i data-feather="target"></i> Long-term Recommendations</h4>
                    <div class="actions-list long-term">
                        ${longTermActions.length > 0 ?
            longTermActions.map((action, index) => `
                            <div class="action-item priority-medium">
                                <div class="action-number">${index + 1}</div>
                                <div class="action-text">${formatExecutiveText(action)}</div>
                                <div class="action-priority">MEDIUM</div>
                            </div>
                          `).join('') :
            '<div class="no-actions">No long-term recommendations at this time</div>'
        }
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function renderBusinessImpact(data) {
    const container = document.getElementById('businessImpactContainer') ||
        document.querySelector('.business-impact');

    if (!container) return;

    const impactLevel = determineImpactLevel(data.severityScore, data.riskLevel);
    const impactColor = getImpactColor(impactLevel);

    container.innerHTML = `
        <div class="business-impact-card">
            <div class="impact-header">
                <h3>Business Impact Assessment</h3>
                <div class="impact-level" style="background: ${impactColor}">
                    ${impactLevel.toUpperCase()}
                </div>
            </div>
            <div class="impact-content">
                <div class="impact-description">
                    ${formatExecutiveText(data.businessImpact)}
                </div>
                <div class="impact-metrics">
                    <div class="impact-metric">
                        <div class="metric-icon">
                            <i data-feather="clock"></i>
                        </div>
                        <div class="metric-info">
                            <div class="metric-title">Estimated Resolution Time</div>
                            <div class="metric-value">${getResolutionTime(data.riskLevel)}</div>
                        </div>
                    </div>
                    <div class="impact-metric">
                        <div class="metric-icon">
                            <i data-feather="users"></i>
                        </div>
                        <div class="metric-info">
                            <div class="metric-title">Stakeholder Involvement</div>
                            <div class="metric-value">${getStakeholderLevel(data.riskLevel)}</div>
                        </div>
                    </div>
                    <div class="impact-metric">
                        <div class="metric-icon">
                            <i data-feather="shield"></i>
                        </div>
                        <div class="metric-info">
                            <div class="metric-title">Security Posture</div>
                            <div class="metric-value">${getSecurityPosture(data.severityScore)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function setupExecutiveControls() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'printExecutiveBtn' || e.target.closest('#printExecutiveBtn')) {
            printExecutiveSummary();
        }

        if (e.target.id === 'exportExecutiveBtn' || e.target.closest('#exportExecutiveBtn')) {
            exportExecutiveSummary();
        }
    });
}

function setupExecutiveExport() {
    // Additional export functionality can be added here
}

function printExecutiveSummary() {
    const printContent = document.querySelector('.executive-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>SecuNik Executive Summary</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .risk-high { color: #ef4444; }
                    .risk-medium { color: #f59e0b; }
                    .risk-low { color: #10b981; }
                    .executive-header { margin-bottom: 20px; }
                    .summary-metrics { margin: 15px 0; }
                    .metric-item { margin: 5px 0; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>SecuNik Professional - Executive Summary</h1>
                ${printContent.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function exportExecutiveSummary() {
    try {
        const dashboard = window.secuNikDashboard;
        if (!dashboard?.state.currentAnalysis) {
            dashboard?.showNotification('No analysis data to export', 'warning');
            return;
        }

        const executiveData = extractExecutiveData(dashboard.state.currentAnalysis);
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                exportType: 'Executive Summary',
                analysisId: executiveData.metadata.analysisId,
                fileName: executiveData.metadata.fileName
            },
            executiveSummary: {
                summary: executiveData.summary,
                riskLevel: executiveData.riskLevel,
                severityScore: executiveData.severityScore,
                keyFindings: executiveData.keyFindings,
                businessImpact: executiveData.businessImpact,
                immediateActions: executiveData.immediateActions,
                longTermRecommendations: executiveData.longTermRecommendations,
                attackVector: executiveData.attackVector,
                threatAssessment: executiveData.threatAssessment
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-executive-summary-${executiveData.metadata.analysisId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification('Executive summary exported successfully', 'success');
    } catch (error) {
        console.error('Executive export failed:', error);
        window.secuNikDashboard?.showNotification('Failed to export executive summary', 'error');
    }
}

// Utility functions
function formatExecutiveText(text) {
    if (!text) return 'Information not available';
    return text.replace(/\n/g, '<br>');
}

function formatProcessingTime(timeMs) {
    if (!timeMs) return 'Unknown';
    const seconds = Math.round(timeMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function countFindings(findings) {
    if (!findings) return 0;
    if (typeof findings === 'string') {
        return findings.split('\n•').filter(f => f.trim()).length;
    }
    if (Array.isArray(findings)) {
        return findings.length;
    }
    return 0;
}

function formatFindingsList(findings) {
    if (!findings) return '<div class="no-findings">No key findings available</div>';

    let findingsList = [];

    if (typeof findings === 'string') {
        findingsList = findings.split('\n•').map(f => f.replace(/^•\s*/, '').trim()).filter(f => f);
    } else if (Array.isArray(findings)) {
        findingsList = findings;
    }

    if (findingsList.length === 0) {
        return '<div class="no-findings">No key findings available</div>';
    }

    return findingsList.map((finding, index) => `
        <div class="finding-item">
            <div class="finding-number">${index + 1}</div>
            <div class="finding-text">${formatExecutiveText(finding)}</div>
        </div>
    `).join('');
}

function determineImpactLevel(severityScore, riskLevel) {
    if (riskLevel === 'HIGH' || severityScore > 80) return 'critical';
    if (riskLevel === 'MEDIUM' || severityScore > 50) return 'significant';
    return 'minimal';
}

function getImpactColor(level) {
    const colors = {
        'critical': '#ef4444',
        'significant': '#f59e0b',
        'minimal': '#10b981'
    };
    return colors[level] || '#6b7280';
}

function getResolutionTime(riskLevel) {
    const times = {
        'HIGH': '4-8 hours',
        'MEDIUM': '1-2 days',
        'LOW': '3-5 days'
    };
    return times[riskLevel] || '1-2 days';
}

function getStakeholderLevel(riskLevel) {
    const levels = {
        'HIGH': 'Executive + IT + Security',
        'MEDIUM': 'IT + Security Teams',
        'LOW': 'Security Team'
    };
    return levels[riskLevel] || 'Security Team';
}

function getSecurityPosture(severityScore) {
    if (severityScore > 80) return 'Compromised';
    if (severityScore > 50) return 'Weakened';
    if (severityScore > 20) return 'Monitored';
    return 'Stable';
}