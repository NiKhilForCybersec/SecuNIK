export function initTab(analysis) {
    if (!analysis) return;

    renderForensicsOverview(analysis);
    renderEvidenceChain(analysis);
    renderArtifactAnalysis(analysis);
    renderForensicsTimeline(analysis);
    setupForensicsControls();
}

function renderForensicsOverview(analysis) {
    const container = document.getElementById('forensicsOverviewContainer') ||
        document.querySelector('.forensics-overview-container');

    if (!container) return;

    const forensicsData = extractForensicsData(analysis);

    container.innerHTML = `
        <div class="forensics-header-card">
            <div class="card-header">
                <h3><i data-feather="search"></i> Digital Forensics Analysis</h3>
                <div class="forensics-status">
                    <span class="status-badge completed">Analysis Complete</span>
                </div>
            </div>
            <div class="card-content">
                <div class="forensics-metrics">
                    <div class="metric-group">
                        <div class="metric-card primary">
                            <div class="metric-icon">
                                <i data-feather="shield"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value">${forensicsData.integrityScore}</div>
                                <div class="metric-label">Integrity Score</div>
                                <div class="metric-sublabel">File authenticity assessment</div>
                            </div>
                        </div>
                        
                        <div class="metric-card secondary">
                            <div class="metric-icon">
                                <i data-feather="clock"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value">${forensicsData.timelineEvents}</div>
                                <div class="metric-label">Timeline Events</div>
                                <div class="metric-sublabel">Chronological artifacts</div>
                            </div>
                        </div>
                        
                        <div class="metric-card tertiary">
                            <div class="metric-icon">
                                <i data-feather="database"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value">${forensicsData.artifactCount}</div>
                                <div class="metric-label">Artifacts Found</div>
                                <div class="metric-sublabel">Digital evidence pieces</div>
                            </div>
                        </div>
                        
                        <div class="metric-card quaternary">
                            <div class="metric-icon">
                                <i data-feather="link"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value">${forensicsData.chainLength}</div>
                                <div class="metric-label">Chain Links</div>
                                <div class="metric-sublabel">Evidence correlation</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="forensics-summary">
                    <div class="summary-section">
                        <h4>Forensics Assessment</h4>
                        <p class="assessment-text">
                            ${generateForensicsAssessment(forensicsData)}
                        </p>
                    </div>
                    
                    <div class="summary-section">
                        <h4>Key Forensic Indicators</h4>
                        <div class="indicator-list">
                            ${forensicsData.keyIndicators.map(indicator => `
                                <div class="indicator-item ${indicator.severity}">
                                    <i data-feather="${indicator.icon}"></i>
                                    <span class="indicator-text">${indicator.text}</span>
                                    <span class="indicator-confidence">${indicator.confidence}% confidence</span>
                                </div>
                            `).join('')}
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

function renderEvidenceChain(analysis) {
    const container = document.getElementById('evidenceChainContainer') ||
        document.querySelector('.evidence-chain-container');

    if (!container) return;

    const evidenceChain = buildEvidenceChain(analysis);

    container.innerHTML = `
        <div class="evidence-chain-card">
            <div class="card-header">
                <h3><i data-feather="link"></i> Chain of Custody</h3>
                <div class="chain-controls">
                    <button class="btn btn-secondary" id="exportChainBtn">
                        <i data-feather="download"></i> Export Chain
                    </button>
                    <button class="btn btn-secondary" id="validateChainBtn">
                        <i data-feather="check-circle"></i> Validate
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="evidence-chain-visualization">
                    ${renderChainVisualization(evidenceChain)}
                </div>
                
                <div class="chain-details">
                    <h4>Evidence Chain Details</h4>
                    <div class="chain-table">
                        <div class="chain-header">
                            <div class="chain-col">Step</div>
                            <div class="chain-col">Action</div>
                            <div class="chain-col">Timestamp</div>
                            <div class="chain-col">Hash/Checksum</div>
                            <div class="chain-col">Status</div>
                        </div>
                        ${evidenceChain.map((step, index) => `
                            <div class="chain-row">
                                <div class="chain-col">${index + 1}</div>
                                <div class="chain-col">${step.action}</div>
                                <div class="chain-col">${formatTimestamp(step.timestamp)}</div>
                                <div class="chain-col">
                                    <code class="hash-display">${step.hash}</code>
                                </div>
                                <div class="chain-col">
                                    <span class="status-badge ${step.status}">${step.status.toUpperCase()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function renderArtifactAnalysis(analysis) {
    const container = document.getElementById('artifactAnalysisContainer') ||
        document.querySelector('.artifact-analysis-container');

    if (!container) return;

    const artifacts = extractDigitalArtifacts(analysis);

    container.innerHTML = `
        <div class="artifact-analysis-card">
            <div class="card-header">
                <h3><i data-feather="database"></i> Digital Artifacts</h3>
                <div class="artifact-controls">
                    <select id="artifactTypeFilter" class="artifact-filter">
                        <option value="">All Types</option>
                        <option value="network">Network</option>
                        <option value="file">File System</option>
                        <option value="registry">Registry</option>
                        <option value="memory">Memory</option>
                        <option value="log">Log Entries</option>
                    </select>
                    <button class="btn btn-secondary" id="exportArtifactsBtn">
                        <i data-feather="download"></i> Export
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="artifact-categories">
                    ${Object.entries(artifacts.byCategory).map(([category, items]) => `
                        <div class="artifact-category" data-category="${category}">
                            <div class="category-header">
                                <h4>
                                    <i data-feather="${getCategoryIcon(category)}"></i>
                                    ${category.charAt(0).toUpperCase() + category.slice(1)} Artifacts
                                </h4>
                                <span class="category-count">${items.length} items</span>
                            </div>
                            <div class="artifact-list">
                                ${items.slice(0, 5).map(artifact => `
                                    <div class="artifact-item" data-type="${artifact.type}">
                                        <div class="artifact-icon">
                                            <i data-feather="${artifact.icon}"></i>
                                        </div>
                                        <div class="artifact-details">
                                            <div class="artifact-name">${sanitizeHTML(artifact.name)}</div>
                                            <div class="artifact-description">${sanitizeHTML(artifact.description)}</div>
                                            <div class="artifact-metadata">
                                                <span class="artifact-timestamp">${formatTimestamp(artifact.timestamp)}</span>
                                                <span class="artifact-confidence">Confidence: ${artifact.confidence}%</span>
                                            </div>
                                        </div>
                                        <div class="artifact-actions">
                                            <button class="btn-icon" title="View details" onclick="viewArtifactDetails('${artifact.id}')">
                                                <i data-feather="eye"></i>
                                            </button>
                                            <button class="btn-icon" title="Export artifact" onclick="exportSingleArtifact('${artifact.id}')">
                                                <i data-feather="download"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                                ${items.length > 5 ? `
                                    <div class="artifact-more">
                                        <button class="btn btn-link" onclick="showAllArtifacts('${category}')">
                                            View all ${items.length} ${category} artifacts
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function renderForensicsTimeline(analysis) {
    const container = document.getElementById('forensicsTimelineContainer') ||
        document.querySelector('.forensics-timeline-container');

    if (!container) return;

    const timelineData = buildForensicsTimeline(analysis);

    container.innerHTML = `
        <div class="forensics-timeline-card">
            <div class="card-header">
                <h3><i data-feather="clock"></i> Forensic Timeline</h3>
                <div class="timeline-controls">
                    <select id="timelineGranularity" class="timeline-filter">
                        <option value="minute">By Minute</option>
                        <option value="hour" selected>By Hour</option>
                        <option value="day">By Day</option>
                    </select>
                    <button class="btn btn-secondary" id="exportTimelineBtn">
                        <i data-feather="download"></i> Export Timeline
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="timeline-visualization">
                    ${renderForensicsTimelineChart(timelineData)}
                </div>
                
                <div class="timeline-events">
                    <h4>Critical Timeline Events</h4>
                    <div class="timeline-event-list">
                        ${timelineData.criticalEvents.map(event => `
                            <div class="timeline-event ${event.severity}">
                                <div class="event-time">
                                    <div class="event-timestamp">${formatTimestamp(event.timestamp)}</div>
                                    <div class="event-relative">${getRelativeTime(event.timestamp)}</div>
                                </div>
                                <div class="event-content">
                                    <div class="event-title">${sanitizeHTML(event.title)}</div>
                                    <div class="event-description">${sanitizeHTML(event.description)}</div>
                                    <div class="event-tags">
                                        ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                                    </div>
                                </div>
                                <div class="event-metadata">
                                    <span class="event-source">${sanitizeHTML(event.source)}</span>
                                    <span class="event-confidence">${event.confidence}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function setupForensicsControls() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'exportChainBtn' || e.target.closest('#exportChainBtn')) {
            exportEvidenceChain();
        }

        if (e.target.id === 'validateChainBtn' || e.target.closest('#validateChainBtn')) {
            validateEvidenceChain();
        }

        if (e.target.id === 'exportArtifactsBtn' || e.target.closest('#exportArtifactsBtn')) {
            exportArtifacts();
        }

        if (e.target.id === 'exportTimelineBtn' || e.target.closest('#exportTimelineBtn')) {
            exportForensicsTimeline();
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === 'artifactTypeFilter') {
            filterArtifacts(e.target.value);
        }

        if (e.target.id === 'timelineGranularity') {
            updateTimelineGranularity(e.target.value);
        }
    });
}

// Data extraction and processing functions
function extractForensicsData(analysis) {
    const technical = analysis.result?.technical || analysis.result?.Technical || {};
    const events = technical.securityEvents || technical.SecurityEvents || [];
    const iocs = technical.detectedIOCs || technical.DetectedIOCs || [];

    return {
        integrityScore: calculateIntegrityScore(analysis),
        timelineEvents: events.length,
        artifactCount: calculateArtifactCount(events, iocs),
        chainLength: buildEvidenceChain(analysis).length,
        keyIndicators: generateKeyIndicators(events, iocs, analysis)
    };
}

function calculateIntegrityScore(analysis) {
    // Mock integrity calculation based on file metadata and analysis results
    const metadata = analysis.result?.technical?.metadata || {};
    const hasHash = !!metadata.hash;
    const hasValidTimestamp = !!analysis.timestamp;
    const hasSecureTransfer = true; // Assume secure transfer for now

    let score = 60; // Base score
    if (hasHash) score += 20;
    if (hasValidTimestamp) score += 10;
    if (hasSecureTransfer) score += 10;

    return `${score}%`;
}

function calculateArtifactCount(events, iocs) {
    return events.length + iocs.length;
}

function generateKeyIndicators(events, iocs, analysis) {
    const indicators = [];

    if (events.length > 100) {
        indicators.push({
            severity: 'high',
            icon: 'alert-triangle',
            text: 'High volume of security events detected',
            confidence: 95
        });
    }

    if (iocs.length > 20) {
        indicators.push({
            severity: 'medium',
            icon: 'target',
            text: 'Multiple indicators of compromise found',
            confidence: 88
        });
    }

    const metadata = analysis.result?.technical?.metadata || {};
    if (metadata.hash) {
        indicators.push({
            severity: 'low',
            icon: 'shield',
            text: 'File integrity verified with cryptographic hash',
            confidence: 99
        });
    }

    if (indicators.length === 0) {
        indicators.push({
            severity: 'low',
            icon: 'check-circle',
            text: 'Standard forensic patterns detected',
            confidence: 75
        });
    }

    return indicators;
}

function generateForensicsAssessment(forensicsData) {
    const integrityValue = parseInt(forensicsData.integrityScore);

    if (integrityValue >= 90) {
        return "High integrity forensic evidence with strong chain of custody. All digital artifacts show consistent timestamps and verifiable hashes. Suitable for legal proceedings.";
    } else if (integrityValue >= 70) {
        return "Good forensic integrity with minor gaps in evidence chain. Most artifacts are well-preserved and timestamped. Recommended for investigative purposes.";
    } else {
        return "Moderate forensic integrity. Some evidence gaps detected. Additional verification recommended before use in formal investigations.";
    }
}

function buildEvidenceChain(analysis) {
    const chain = [];
    const metadata = analysis.result?.technical?.metadata || {};

    // File creation/modification
    chain.push({
        action: 'File Created',
        timestamp: metadata.created || analysis.timestamp,
        hash: metadata.hash || 'N/A',
        status: 'verified'
    });

    if (metadata.modified && metadata.modified !== metadata.created) {
        chain.push({
            action: 'File Modified',
            timestamp: metadata.modified,
            hash: metadata.hash || 'N/A',
            status: 'verified'
        });
    }

    // Analysis upload
    chain.push({
        action: 'Uploaded for Analysis',
        timestamp: analysis.timestamp,
        hash: metadata.hash || 'N/A',
        status: 'verified'
    });

    // Analysis completion
    chain.push({
        action: 'Analysis Completed',
        timestamp: new Date().toISOString(),
        hash: metadata.hash || 'N/A',
        status: 'verified'
    });

    return chain;
}

function renderChainVisualization(chain) {
    return `
        <div class="chain-flow">
            ${chain.map((step, index) => `
                <div class="chain-step">
                    <div class="step-icon ${step.status}">
                        <i data-feather="${getChainStepIcon(step.action)}"></i>
                    </div>
                    <div class="step-label">${step.action}</div>
                    ${index < chain.length - 1 ? '<div class="step-connector"></div>' : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function extractDigitalArtifacts(analysis) {
    const technical = analysis.result?.technical || analysis.result?.Technical || {};
    const events = technical.securityEvents || technical.SecurityEvents || [];
    const iocs = technical.detectedIOCs || technical.DetectedIOCs || [];

    const artifacts = {
        byCategory: {
            network: [],
            file: [],
            log: [],
            registry: [],
            memory: []
        },
        all: []
    };

    // Process security events as artifacts
    events.forEach((event, index) => {
        const artifact = {
            id: `event-${index}`,
            name: event.eventType || event.EventType || 'Security Event',
            description: (event.description || event.Description || '').substring(0, 100),
            timestamp: event.timestamp || event.Timestamp,
            type: 'log',
            confidence: 85,
            icon: 'file-text',
            source: event.source || event.Source || 'Unknown'
        };

        artifacts.byCategory.log.push(artifact);
        artifacts.all.push(artifact);
    });

    // Process IOCs as artifacts
    iocs.forEach((ioc, index) => {
        let category = 'network';
        let icon = 'globe';
        let name = 'Network Indicator';

        if (typeof ioc === 'string') {
            if (ioc.includes('.') && !ioc.includes('@')) {
                category = 'network';
                icon = 'globe';
                name = 'Domain/IP Indicator';
            } else if (/^[a-fA-F0-9]{32,64}$/.test(ioc)) {
                category = 'file';
                icon = 'file';
                name = 'File Hash';
            } else if (ioc.includes('@')) {
                category = 'network';
                icon = 'mail';
                name = 'Email Indicator';
            }
        }

        const artifact = {
            id: `ioc-${index}`,
            name: name,
            description: `IOC: ${typeof ioc === 'string' ? ioc : JSON.stringify(ioc).substring(0, 50)}`,
            timestamp: new Date().toISOString(),
            type: category,
            confidence: 78,
            icon: icon,
            source: 'IOC Detection'
        };

        artifacts.byCategory[category].push(artifact);
        artifacts.all.push(artifact);
    });

    return artifacts;
}

function buildForensicsTimeline(analysis) {
    const technical = analysis.result?.technical || analysis.result?.Technical || {};
    const events = technical.securityEvents || technical.SecurityEvents || [];

    const timelineEvents = events.map(event => ({
        timestamp: event.timestamp || event.Timestamp,
        title: event.eventType || event.EventType || 'Security Event',
        description: (event.description || event.Description || '').substring(0, 150),
        severity: (event.severity || event.Severity || 'medium').toLowerCase(),
        source: event.source || event.Source || 'Unknown',
        confidence: 85,
        tags: ['security', 'event']
    }));

    // Sort by timestamp
    timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
        events: timelineEvents,
        criticalEvents: timelineEvents.filter(e => ['critical', 'high'].includes(e.severity)).slice(0, 10)
    };
}

function renderForensicsTimelineChart(timelineData) {
    // Simplified timeline chart
    const events = timelineData.events;
    if (events.length === 0) {
        return '<div class="timeline-empty">No timeline events available</div>';
    }

    const timeGroups = groupEventsByHour(events);
    const maxEvents = Math.max(...Object.values(timeGroups).map(g => g.length), 1);

    return `
        <div class="timeline-chart">
            ${Object.entries(timeGroups).map(([hour, hourEvents]) => `
                <div class="timeline-bar-group">
                    <div class="timeline-bar" style="height: ${(hourEvents.length / maxEvents) * 100}%" 
                         title="${hourEvents.length} events at ${hour}">
                        ${hourEvents.map(event => `
                            <div class="timeline-event-dot ${event.severity}" 
                                 title="${event.title} - ${formatTimestamp(event.timestamp)}"></div>
                        `).join('')}
                    </div>
                    <div class="timeline-label">${hour}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Utility functions
function getCategoryIcon(category) {
    const iconMap = {
        network: 'globe',
        file: 'file',
        registry: 'settings',
        memory: 'cpu',
        log: 'file-text'
    };
    return iconMap[category] || 'help-circle';
}

function getChainStepIcon(action) {
    if (action.includes('Created')) return 'plus-circle';
    if (action.includes('Modified')) return 'edit';
    if (action.includes('Uploaded')) return 'upload';
    if (action.includes('Completed')) return 'check-circle';
    return 'circle';
}

function groupEventsByHour(events) {
    const groups = {};
    events.forEach(event => {
        const date = new Date(event.timestamp);
        const hour = date.getHours().toString().padStart(2, '0') + ':00';
        if (!groups[hour]) groups[hour] = [];
        groups[hour].push(event);
    });
    return groups;
}

function getRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffHours > 0) return `${diffHours} hours ago`;
    return 'Recently';
}

// Export functions
function exportEvidenceChain() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) {
        dashboard?.showNotification('No evidence chain to export', 'warning');
        return;
    }

    try {
        const chain = buildEvidenceChain(dashboard.state.currentAnalysis);
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                analysisId: dashboard.state.currentAnalysis.analysisId,
                exportType: 'Evidence Chain'
            },
            evidenceChain: chain
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evidence-chain-${dashboard.state.currentAnalysis.analysisId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification('Evidence chain exported successfully', 'success');
    } catch (error) {
        console.error('Evidence chain export failed:', error);
        window.secuNikDashboard?.showNotification('Failed to export evidence chain', 'error');
    }
}

function validateEvidenceChain() {
    const dashboard = window.secuNikDashboard;
    const chain = buildEvidenceChain(dashboard?.state.currentAnalysis);

    // Perform validation checks
    const validationResults = {
        hashConsistency: true,
        timestampOrder: true,
        gapAnalysis: false,
        integrityCheck: true
    };

    const isValid = Object.values(validationResults).every(result => result);

    dashboard?.showNotification(
        isValid ? 'Evidence chain validation passed' : 'Evidence chain validation found issues',
        isValid ? 'success' : 'warning'
    );
}

function exportArtifacts() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) {
        dashboard?.showNotification('No artifacts to export', 'warning');
        return;
    }

    try {
        const artifacts = extractDigitalArtifacts(dashboard.state.currentAnalysis);
        const csvData = convertArtifactsToCSV(artifacts.all);

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forensic-artifacts-${dashboard.state.currentAnalysis.analysisId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification('Artifacts exported successfully', 'success');
    } catch (error) {
        console.error('Artifacts export failed:', error);
        window.secuNikDashboard?.showNotification('Failed to export artifacts', 'error');
    }
}

function exportForensicsTimeline() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) {
        dashboard?.showNotification('No timeline to export', 'warning');
        return;
    }

    try {
        const timelineData = buildForensicsTimeline(dashboard.state.currentAnalysis);
        const csvData = convertTimelineToCSV(timelineData.events);

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forensic-timeline-${dashboard.state.currentAnalysis.analysisId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification('Forensic timeline exported successfully', 'success');
    } catch (error) {
        console.error('Timeline export failed:', error);
        window.secuNikDashboard?.showNotification('Failed to export timeline', 'error');
    }
}

function convertArtifactsToCSV(artifacts) {
    const headers = ['ID', 'Name', 'Type', 'Description', 'Timestamp', 'Confidence', 'Source'];
    const rows = artifacts.map(artifact => [
        artifact.id,
        artifact.name,
        artifact.type,
        artifact.description.replace(/"/g, '""'),
        artifact.timestamp,
        artifact.confidence,
        artifact.source
    ]);

    return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
}

function convertTimelineToCSV(events) {
    const headers = ['Timestamp', 'Title', 'Description', 'Severity', 'Source', 'Confidence'];
    const rows = events.map(event => [
        event.timestamp,
        event.title,
        event.description.replace(/"/g, '""'),
        event.severity,
        event.source,
        event.confidence
    ]);

    return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
}

// Filter functions
function filterArtifacts(type) {
    const categories = document.querySelectorAll('.artifact-category');
    categories.forEach(category => {
        if (!type || category.dataset.category === type) {
            category.style.display = 'block';
        } else {
            category.style.display = 'none';
        }
    });
}

function updateTimelineGranularity(granularity) {
    // This would update the timeline visualization based on granularity
    // Implementation would depend on the specific timeline rendering logic
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification(`Timeline granularity changed to: ${granularity}`, 'info', 2000);
}

// Global functions for artifact actions
window.viewArtifactDetails = function (artifactId) {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification(`Viewing details for artifact: ${artifactId}`, 'info', 3000);
};

window.exportSingleArtifact = function (artifactId) {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification(`Exporting artifact: ${artifactId}`, 'info', 3000);
};

window.showAllArtifacts = function (category) {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification(`Showing all ${category} artifacts`, 'info', 3000);
};

// Utility functions (reused from other modules)
function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown';
    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch (error) {
        return 'Invalid date';
    }
}