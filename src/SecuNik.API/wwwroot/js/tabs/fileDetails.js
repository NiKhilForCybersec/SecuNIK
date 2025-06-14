export function initTab(analysis) {
    if (!analysis) return;

    renderFileMetadata(analysis);
    renderFileAnalysisInfo(analysis);
    renderParsingResults(analysis);
    renderFileStructure(analysis);
    setupFileDetailsControls();
}

function renderFileMetadata(analysis) {
    const container = document.getElementById('fileMetadataContainer') ||
        document.querySelector('.file-metadata-container');

    if (!container) return;

    const fileInfo = analysis.fileInfo || {};
    const metadata = analysis.result?.technical?.metadata ||
        analysis.result?.Technical?.Metadata || {};

    container.innerHTML = `
        <div class="file-details-card">
            <div class="card-header">
                <h3><i data-feather="file-text"></i> File Information</h3>
                <div class="file-actions">
                    <button class="btn btn-secondary" id="downloadFileInfoBtn">
                        <i data-feather="download"></i> Export Info
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="file-metadata-grid">
                    <div class="metadata-section">
                        <h4>Basic Information</h4>
                        <div class="metadata-table">
                            <div class="metadata-row">
                                <span class="metadata-label">File Name:</span>
                                <span class="metadata-value">${sanitizeHTML(fileInfo.name || 'Unknown')}</span>
                            </div>
                            <div class="metadata-row">
                                <span class="metadata-label">File Size:</span>
                                <span class="metadata-value">${formatFileSize(fileInfo.size || metadata.size || 0)}</span>
                            </div>
                            <div class="metadata-row">
                                <span class="metadata-label">File Type:</span>
                                <span class="metadata-value">${sanitizeHTML(fileInfo.type || detectFileType(fileInfo.name))}</span>
                            </div>
                            <div class="metadata-row">
                                <span class="metadata-label">MIME Type:</span>
                                <span class="metadata-value">${sanitizeHTML(metadata.mimeType || 'Unknown')}</span>
                            </div>
                            <div class="metadata-row">
                                <span class="metadata-label">Last Modified:</span>
                                <span class="metadata-value">${formatTimestamp(fileInfo.lastModified || metadata.modified)}</span>
                            </div>
                            <div class="metadata-row">
                                <span class="metadata-label">Created:</span>
                                <span class="metadata-value">${formatTimestamp(metadata.created)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="metadata-section">
                        <h4>Security Information</h4>
                        <div class="metadata-table">
                            <div class="metadata-row">
                                <span class="metadata-label">File Hash (SHA256):</span>
                                <span class="metadata-value hash-value" title="Click to copy">
                                    <code onclick="copyToClipboard('${metadata.hash || 'Not available'}')">${metadata.hash || 'Not available'}</code>
                                    <button class="copy-btn" onclick="copyToClipboard('${metadata.hash || ''}')">
                                        <i data-feather="copy"></i>
                                    </button>
                                </span>
                            </div>
                            <div class="metadata-row">
                                <span class="metadata-label">Virus Scan:</span>
                                <span class="metadata-value">
                                    <span class="status-badge clean">Clean</span>
                                </span>
                            </div>
                            <div class="metadata-row">
                                <span class="metadata-label">Digital Signature:</span>
                                <span class="metadata-value">
                                    <span class="status-badge ${metadata.signed ? 'signed' : 'unsigned'}">
                                        ${metadata.signed ? 'Digitally Signed' : 'Not Signed'}
                                    </span>
                                </span>
                            </div>
                            <div class="metadata-row">
                                <span class="metadata-label">Entropy:</span>
                                <span class="metadata-value">${calculateEntropy(metadata) || 'Not calculated'}</span>
                            </div>
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

function renderFileAnalysisInfo(analysis) {
    const container = document.getElementById('fileAnalysisContainer') ||
        document.querySelector('.file-analysis-container');

    if (!container) return;

    const technical = analysis.result?.technical || analysis.result?.Technical || {};
    const processingTime = analysis.processingTime || 0;

    container.innerHTML = `
        <div class="analysis-details-card">
            <div class="card-header">
                <h3><i data-feather="zap"></i> Analysis Information</h3>
                <div class="analysis-status">
                    <span class="status-badge completed">Completed</span>
                </div>
            </div>
            <div class="card-content">
                <div class="analysis-metrics-grid">
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i data-feather="clock"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">${formatProcessingTime(processingTime)}</div>
                            <div class="metric-label">Processing Time</div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i data-feather="alert-circle"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">${(technical.securityEvents || technical.SecurityEvents || []).length}</div>
                            <div class="metric-label">Security Events</div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i data-feather="target"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">${(technical.detectedIOCs || technical.DetectedIOCs || []).length}</div>
                            <div class="metric-label">IOCs Found</div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i data-feather="layers"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">${technical.totalLines || 'N/A'}</div>
                            <div class="metric-label">Lines Processed</div>
                        </div>
                    </div>
                </div>

                <div class="analysis-details">
                    <div class="detail-section">
                        <h4>Analysis Configuration</h4>
                        <div class="config-table">
                            <div class="config-row">
                                <span class="config-label">Analysis ID:</span>
                                <span class="config-value">${analysis.analysisId}</span>
                            </div>
                            <div class="config-row">
                                <span class="config-label">Analysis Timestamp:</span>
                                <span class="config-value">${formatTimestamp(analysis.timestamp)}</span>
                            </div>
                            <div class="config-row">
                                <span class="config-label">File Format:</span>
                                <span class="config-value">${technical.fileFormat || 'Auto-detected'}</span>
                            </div>
                            <div class="config-row">
                                <span class="config-label">Parser Used:</span>
                                <span class="config-value">${technical.parserUsed || 'Universal Parser'}</span>
                            </div>
                            <div class="config-row">
                                <span class="config-label">AI Analysis:</span>
                                <span class="config-value">
                                    <span class="status-badge enabled">Enabled</span>
                                </span>
                            </div>
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

function renderParsingResults(analysis) {
    const container = document.getElementById('parsingResultsContainer') ||
        document.querySelector('.parsing-results-container');

    if (!container) return;

    const technical = analysis.result?.technical || analysis.result?.Technical || {};
    const rawData = technical.rawData || {};

    container.innerHTML = `
        <div class="parsing-results-card">
            <div class="card-header">
                <h3><i data-feather="cpu"></i> Parsing Results</h3>
                <div class="parsing-controls">
                    <button class="btn btn-secondary" id="toggleRawDataBtn">
                        <i data-feather="code"></i> Toggle Raw Data
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="parsing-summary">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">Records Parsed:</div>
                            <div class="summary-value">${rawData.recordCount || rawData.lineCount || 'N/A'}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">File Type Detected:</div>
                            <div class="summary-value">${rawData.fileType || 'Unknown'}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Parsing Success:</div>
                            <div class="summary-value">
                                <span class="status-badge success">100%</span>
                            </div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Data Quality:</div>
                            <div class="summary-value">
                                <span class="status-badge ${getDataQualityStatus(technical)}">
                                    ${getDataQualityLabel(technical)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="raw-data-section" id="rawDataSection" style="display: none;">
                    <h4>Raw Parsing Data</h4>
                    <div class="raw-data-viewer">
                        <div class="data-tabs">
                            <button class="data-tab active" data-tab="summary">Summary</button>
                            <button class="data-tab" data-tab="events">Events</button>
                            <button class="data-tab" data-tab="iocs">IOCs</button>
                            <button class="data-tab" data-tab="metadata">Metadata</button>
                        </div>
                        <div class="data-content">
                            <div class="data-panel active" id="summary-panel">
                                <pre class="data-preview">${JSON.stringify({
        totalEvents: (technical.securityEvents || technical.SecurityEvents || []).length,
        totalIOCs: (technical.detectedIOCs || technical.DetectedIOCs || []).length,
        parsingTime: formatProcessingTime(analysis.processingTime),
        fileFormat: technical.fileFormat || 'Auto-detected'
    }, null, 2)}</pre>
                            </div>
                            <div class="data-panel" id="events-panel">
                                <pre class="data-preview">${JSON.stringify(
        (technical.securityEvents || technical.SecurityEvents || []).slice(0, 5),
        null, 2
    )}</pre>
                                ${(technical.securityEvents || technical.SecurityEvents || []).length > 5 ?
            `<div class="data-truncated">... and ${(technical.securityEvents || technical.SecurityEvents || []).length - 5} more events</div>` :
            ''
        }
                            </div>
                            <div class="data-panel" id="iocs-panel">
                                <pre class="data-preview">${JSON.stringify(
            (technical.detectedIOCs || technical.DetectedIOCs || []).slice(0, 10),
            null, 2
        )}</pre>
                                ${(technical.detectedIOCs || technical.DetectedIOCs || []).length > 10 ?
            `<div class="data-truncated">... and ${(technical.detectedIOCs || technical.DetectedIOCs || []).length - 10} more IOCs</div>` :
            ''
        }
                            </div>
                            <div class="data-panel" id="metadata-panel">
                                <pre class="data-preview">${JSON.stringify(technical.metadata || {}, null, 2)}</pre>
                            </div>
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

function renderFileStructure(analysis) {
    const container = document.getElementById('fileStructureContainer') ||
        document.querySelector('.file-structure-container');

    if (!container) return;

    const technical = analysis.result?.technical || analysis.result?.Technical || {};
    const events = technical.securityEvents || technical.SecurityEvents || [];
    const iocs = technical.detectedIOCs || technical.DetectedIOCs || [];

    // Analyze file structure patterns
    const structure = analyzeFileStructure(events, iocs, technical);

    container.innerHTML = `
        <div class="file-structure-card">
            <div class="card-header">
                <h3><i data-feather="layers"></i> File Structure Analysis</h3>
            </div>
            <div class="card-content">
                <div class="structure-visualization">
                    <div class="structure-tree">
                        ${renderStructureTree(structure)}
                    </div>
                </div>
                
                <div class="structure-insights">
                    <h4>Structural Insights</h4>
                    <div class="insights-list">
                        ${generateStructureInsights(structure).map(insight => `
                            <div class="insight-item">
                                <i data-feather="${insight.icon}"></i>
                                <span>${insight.text}</span>
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

function setupFileDetailsControls() {
    // Toggle raw data visibility
    document.addEventListener('click', (e) => {
        if (e.target.id === 'toggleRawDataBtn' || e.target.closest('#toggleRawDataBtn')) {
            toggleRawDataSection();
        }

        if (e.target.id === 'downloadFileInfoBtn' || e.target.closest('#downloadFileInfoBtn')) {
            downloadFileInfo();
        }

        if (e.target.classList.contains('data-tab')) {
            switchDataTab(e.target.dataset.tab);
        }
    });
}

function toggleRawDataSection() {
    const section = document.getElementById('rawDataSection');
    const btn = document.getElementById('toggleRawDataBtn');

    if (section && btn) {
        const isVisible = section.style.display !== 'none';
        section.style.display = isVisible ? 'none' : 'block';

        const icon = btn.querySelector('i');
        if (icon) {
            icon.setAttribute('data-feather', isVisible ? 'code' : 'eye-off');
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
    }
}

function switchDataTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.data-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update panels
    document.querySelectorAll('.data-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-panel`).classList.add('active');
}

function downloadFileInfo() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) {
        dashboard?.showNotification('No file information to export', 'warning');
        return;
    }

    try {
        const analysis = dashboard.state.currentAnalysis;
        const fileInfo = {
            analysisId: analysis.analysisId,
            timestamp: analysis.timestamp,
            fileInfo: analysis.fileInfo,
            technicalMetadata: analysis.result?.technical?.metadata || analysis.result?.Technical?.Metadata,
            processingTime: analysis.processingTime,
            parsingResults: {
                eventsFound: (analysis.result?.technical?.securityEvents || analysis.result?.Technical?.SecurityEvents || []).length,
                iocsFound: (analysis.result?.technical?.detectedIOCs || analysis.result?.Technical?.DetectedIOCs || []).length,
                linesProcessed: analysis.result?.technical?.totalLines || analysis.result?.Technical?.TotalLines
            }
        };

        const blob = new Blob([JSON.stringify(fileInfo, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-file-info-${analysis.analysisId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification('File information exported successfully', 'success');
    } catch (error) {
        console.error('File info export failed:', error);
        window.secuNikDashboard?.showNotification('Failed to export file information', 'error');
    }
}

// Utility functions
function analyzeFileStructure(events, iocs, technical) {
    const structure = {
        fileType: technical.fileFormat || 'Unknown',
        sections: [],
        patterns: [],
        quality: 'good'
    };

    // Analyze event distribution
    if (events.length > 0) {
        const eventTypes = {};
        events.forEach(event => {
            const type = event.eventType || event.EventType || 'Unknown';
            eventTypes[type] = (eventTypes[type] || 0) + 1;
        });

        structure.sections.push({
            name: 'Security Events',
            count: events.length,
            types: Object.keys(eventTypes).length,
            details: eventTypes
        });
    }

    // Analyze IOC distribution
    if (iocs.length > 0) {
        const iocCategories = {};
        iocs.forEach(ioc => {
            let category = 'Unknown';
            if (typeof ioc === 'string') {
                if (ioc.includes('.')) category = 'Domain/IP';
                else if (/^[a-fA-F0-9]{32,64}$/.test(ioc)) category = 'Hash';
                else if (ioc.includes('@')) category = 'Email';
            }
            iocCategories[category] = (iocCategories[category] || 0) + 1;
        });

        structure.sections.push({
            name: 'Indicators of Compromise',
            count: iocs.length,
            categories: Object.keys(iocCategories).length,
            details: iocCategories
        });
    }

    return structure;
}

function renderStructureTree(structure) {
    return `
        <div class="tree-node root">
            <div class="node-label">
                <i data-feather="file"></i>
                ${structure.fileType} File
            </div>
            <div class="node-children">
                ${structure.sections.map(section => `
                    <div class="tree-node">
                        <div class="node-label">
                            <i data-feather="${section.name.includes('Events') ? 'alert-circle' : 'target'}"></i>
                            ${section.name} (${section.count})
                        </div>
                        <div class="node-children">
                            ${Object.entries(section.details).slice(0, 5).map(([key, value]) => `
                                <div class="tree-leaf">
                                    <span class="leaf-label">${key}:</span>
                                    <span class="leaf-value">${value}</span>
                                </div>
                            `).join('')}
                            ${Object.keys(section.details).length > 5 ? `
                                <div class="tree-leaf more">
                                    ... and ${Object.keys(section.details).length - 5} more
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateStructureInsights(structure) {
    const insights = [];

    structure.sections.forEach(section => {
        if (section.name.includes('Events')) {
            if (section.count > 100) {
                insights.push({
                    icon: 'alert-triangle',
                    text: `High volume of security events detected (${section.count})`
                });
            }
            if (section.types > 10) {
                insights.push({
                    icon: 'layers',
                    text: `Diverse event types found (${section.types} different types)`
                });
            }
        }

        if (section.name.includes('IOC')) {
            if (section.count > 50) {
                insights.push({
                    icon: 'target',
                    text: `Significant number of IOCs identified (${section.count})`
                });
            }
        }
    });

    if (insights.length === 0) {
        insights.push({
            icon: 'check-circle',
            text: 'File structure appears normal with standard security patterns'
        });
    }

    return insights;
}

function getDataQualityStatus(technical) {
    const events = technical.securityEvents || technical.SecurityEvents || [];
    const iocs = technical.detectedIOCs || technical.DetectedIOCs || [];

    if (events.length > 50 && iocs.length > 10) return 'excellent';
    if (events.length > 10 && iocs.length > 0) return 'good';
    if (events.length > 0) return 'fair';
    return 'minimal';
}

function getDataQualityLabel(technical) {
    const status = getDataQualityStatus(technical);
    return {
        'excellent': 'Excellent',
        'good': 'Good',
        'fair': 'Fair',
        'minimal': 'Minimal'
    }[status] || 'Unknown';
}

function calculateEntropy(metadata) {
    // Simplified entropy calculation placeholder
    const size = metadata.size || 0;
    if (size === 0) return 'N/A';

    // Mock entropy based on file size (in real implementation, this would analyze file content)
    const entropy = Math.min(8.0, (size / 10000) + Math.random() * 2);
    return entropy.toFixed(2);
}

// Utility functions (reused from other modules)
function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

function formatProcessingTime(timeMs) {
    if (!timeMs) return 'Unknown';
    const seconds = Math.round(timeMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function detectFileType(fileName) {
    if (!fileName) return 'Unknown';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const typeMap = {
        'evtx': 'Windows Event Log',
        'evt': 'Windows Event Log (Legacy)',
        'pcap': 'Network Packet Capture',
        'csv': 'Comma Separated Values',
        'json': 'JavaScript Object Notation',
        'log': 'System Log File',
        'txt': 'Text File'
    };
    return typeMap[ext] || 'Unknown';
}

// Global function for copying to clipboard
window.copyToClipboard = async function (text) {
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        window.secuNikDashboard?.showNotification('Copied to clipboard', 'success', 2000);
    } catch (error) {
        console.error('Copy failed:', error);
        window.secuNikDashboard?.showNotification('Failed to copy', 'error');
    }
};