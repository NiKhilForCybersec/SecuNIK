let dashboard;

export function init(dash) {
    dashboard = dash;

    // Setup export button
    const exportBtn = document.getElementById('exportIOCsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportIOCs());
    }

    // Setup IOC search and filtering
    setupIOCFiltering();
    setupIOCSearch();
}

export function render(data) {
    if (!data) return;

    const iocs = data.result?.technical?.detectedIOCs ||
        data.result?.Technical?.DetectedIOCs || [];

    renderIOCsTable(iocs);
    updateIOCStats(iocs);
}

export function exportIOCs(analysis = dashboard?.state.currentAnalysis) {
    if (!analysis) {
        dashboard?.showNotification('No analysis data available', 'warning');
        return;
    }

    const iocs = analysis.result.technical?.detectedIOCs ||
        analysis.result.Technical?.DetectedIOCs || [];

    if (iocs.length === 0) {
        dashboard?.showNotification('No IOCs found to export', 'warning');
        return;
    }

    try {
        // Enhanced IOC processing for export
        const processedIOCs = processIOCsForExport(iocs);

        // Create multiple export formats
        const formats = {
            csv: convertIOCsToCSV(processedIOCs),
            json: convertIOCsToJSON(processedIOCs),
            stix: convertIOCsToSTIX(processedIOCs, analysis)
        };

        // Let user choose format or export all
        showExportDialog(formats, analysis.analysisId);

    } catch (error) {
        console.error('IOC export failed:', error);
        dashboard?.showNotification('Failed to export IOCs', 'error');
    }
}

function processIOCsForExport(iocs) {
    return iocs.map((ioc, index) => {
        let processed = {
            id: index + 1,
            value: '',
            type: 'Unknown',
            category: 'Unknown',
            confidence: 'Medium',
            description: '',
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            tlp: 'WHITE',
            source: 'SecuNik Analysis'
        };

        if (typeof ioc === 'string') {
            processed.value = ioc;
            processed = { ...processed, ...categorizeIOCString(ioc) };
        } else if (typeof ioc === 'object') {
            processed = {
                ...processed,
                ...ioc,
                value: ioc.value || ioc.indicator || ioc.ioc || '',
                type: ioc.type || ioc.category || processed.type,
                category: ioc.category || ioc.type || processed.category
            };
        }

        return processed;
    });
}

function categorizeIOCString(iocString) {
    const categories = {
        // IP Address patterns
        ip: {
            pattern: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
            type: 'IP Address',
            category: 'Network'
        },
        // Domain patterns
        domain: {
            pattern: /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}$/,
            type: 'Domain',
            category: 'Network'
        },
        // URL patterns
        url: {
            pattern: /^https?:\/\//,
            type: 'URL',
            category: 'Network'
        },
        // Email patterns
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            type: 'Email',
            category: 'Communication'
        },
        // Hash patterns
        md5: {
            pattern: /^[a-fA-F0-9]{32}$/,
            type: 'MD5 Hash',
            category: 'File'
        },
        sha1: {
            pattern: /^[a-fA-F0-9]{40}$/,
            type: 'SHA1 Hash',
            category: 'File'
        },
        sha256: {
            pattern: /^[a-fA-F0-9]{64}$/,
            type: 'SHA256 Hash',
            category: 'File'
        }
    };

    // Remove common prefixes
    let cleanValue = iocString;
    const prefixes = ['IP:', 'Domain:', 'Hash:', 'Email:', 'URL:'];
    for (const prefix of prefixes) {
        if (cleanValue.startsWith(prefix)) {
            cleanValue = cleanValue.substring(prefix.length).trim();
            break;
        }
    }

    // Try to categorize
    for (const [key, config] of Object.entries(categories)) {
        if (config.pattern.test(cleanValue)) {
            return {
                value: cleanValue,
                type: config.type,
                category: config.category,
                confidence: 'High'
            };
        }
    }

    return {
        value: cleanValue,
        type: 'Unknown',
        category: 'Other',
        confidence: 'Low'
    };
}

function convertIOCsToCSV(iocs) {
    const headers = [
        'ID', 'Value', 'Type', 'Category', 'Confidence',
        'Description', 'First Seen', 'Last Seen', 'TLP', 'Source'
    ];

    const rows = iocs.map(ioc => [
        ioc.id || '',
        ioc.value || '',
        ioc.type || '',
        ioc.category || '',
        ioc.confidence || '',
        ioc.description || '',
        ioc.firstSeen || '',
        ioc.lastSeen || '',
        ioc.tlp || '',
        ioc.source || ''
    ]);

    return [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

function convertIOCsToJSON(iocs) {
    const exportData = {
        metadata: {
            exportedAt: new Date().toISOString(),
            exportedBy: 'SecuNik Professional',
            version: '2.1.0',
            totalIOCs: iocs.length,
            format: 'SecuNik IOC JSON v1.0'
        },
        iocs: iocs
    };

    return JSON.stringify(exportData, null, 2);
}

function convertIOCsToSTIX(iocs, analysis) {
    const stixBundle = {
        type: 'bundle',
        id: `bundle--${generateUUID()}`,
        spec_version: '2.1',
        objects: []
    };

    // Add identity object
    stixBundle.objects.push({
        type: 'identity',
        id: `identity--${generateUUID()}`,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        name: 'SecuNik Professional',
        identity_class: 'organization'
    });

    // Add IOCs as indicators
    iocs.forEach(ioc => {
        const indicator = {
            type: 'indicator',
            id: `indicator--${generateUUID()}`,
            created: ioc.firstSeen || new Date().toISOString(),
            modified: ioc.lastSeen || new Date().toISOString(),
            pattern: createSTIXPattern(ioc),
            labels: [ioc.category?.toLowerCase() || 'unknown'],
            confidence: mapConfidenceToNumber(ioc.confidence)
        };

        if (ioc.description) {
            indicator.description = ioc.description;
        }

        stixBundle.objects.push(indicator);
    });

    return JSON.stringify(stixBundle, null, 2);
}

function createSTIXPattern(ioc) {
    const typeMap = {
        'IP Address': 'ipv4-addr:value',
        'Domain': 'domain-name:value',
        'URL': 'url:value',
        'Email': 'email-addr:value',
        'MD5 Hash': 'file:hashes.MD5',
        'SHA1 Hash': 'file:hashes.SHA-1',
        'SHA256 Hash': 'file:hashes.SHA-256'
    };

    const stixType = typeMap[ioc.type] || 'artifact:payload_bin';
    return `[${stixType} = '${ioc.value}']`;
}

function mapConfidenceToNumber(confidence) {
    const confidenceMap = {
        'High': 85,
        'Medium': 65,
        'Low': 35,
        'Unknown': 50
    };
    return confidenceMap[confidence] || 50;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function showExportDialog(formats, analysisId) {
    // Simple export - could be enhanced with a proper modal
    const choice = prompt(
        'Choose export format:\n1. CSV\n2. JSON\n3. STIX 2.1\n4. All formats\n\nEnter number (1-4):',
        '1'
    );

    const downloads = [];

    switch (choice) {
        case '1':
            downloads.push({ data: formats.csv, filename: `iocs-${analysisId}.csv`, type: 'text/csv' });
            break;
        case '2':
            downloads.push({ data: formats.json, filename: `iocs-${analysisId}.json`, type: 'application/json' });
            break;
        case '3':
            downloads.push({ data: formats.stix, filename: `iocs-${analysisId}.stix`, type: 'application/json' });
            break;
        case '4':
            downloads.push(
                { data: formats.csv, filename: `iocs-${analysisId}.csv`, type: 'text/csv' },
                { data: formats.json, filename: `iocs-${analysisId}.json`, type: 'application/json' },
                { data: formats.stix, filename: `iocs-${analysisId}.stix`, type: 'application/json' }
            );
            break;
        default:
            dashboard?.showNotification('Export cancelled', 'info');
            return;
    }

    // Download files
    downloads.forEach((download, index) => {
        setTimeout(() => {
            const blob = new Blob([download.data], { type: download.type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = download.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, index * 500); // Stagger downloads
    });

    dashboard?.showNotification(`IOCs exported in ${downloads.length} format(s)`, 'success');
}

function renderIOCsTable(iocs) {
    const container = document.getElementById('iocTableContainer') ||
        document.querySelector('.ioc-table-container');

    if (!container) return;

    if (iocs.length === 0) {
        container.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="search" width="48" height="48"></i>
                <h3>No IOCs Detected</h3>
                <p>No indicators of compromise were found in the analysis</p>
            </div>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        return;
    }

    const processedIOCs = processIOCsForExport(iocs);
    const categorizedIOCs = categorizeIOCs(processedIOCs);

    container.innerHTML = `
        <div class="ioc-table-header">
            <h3>Indicators of Compromise (${iocs.length})</h3>
            <div class="ioc-table-controls">
                <input type="text" id="iocSearch" placeholder="Search IOCs..." class="ioc-search">
                <select id="iocCategoryFilter" class="ioc-filter">
                    <option value="">All Categories</option>
                    ${Object.keys(categorizedIOCs).map(cat =>
        `<option value="${cat}">${cat}</option>`
    ).join('')}
                </select>
                <button class="btn btn-secondary" onclick="window.secuNikDashboard.tabs.iocs.exportIOCs()">
                    <i data-feather="download"></i> Export
                </button>
            </div>
        </div>
        <div class="ioc-table-wrapper">
            <table class="ioc-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Category</th>
                        <th>Confidence</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="iocTableBody">
                    ${processedIOCs.map(ioc => `
                        <tr class="ioc-row" data-category="${ioc.category}" data-type="${ioc.type}">
                            <td class="ioc-type">
                                <span class="type-badge ${ioc.category.toLowerCase()}">${ioc.type}</span>
                            </td>
                            <td class="ioc-value">
                                <code>${dashboard?.sanitizeHTML(ioc.value)}</code>
                            </td>
                            <td class="ioc-category">${ioc.category}</td>
                            <td class="ioc-confidence">
                                <span class="confidence-badge ${ioc.confidence.toLowerCase()}">${ioc.confidence}</span>
                            </td>
                            <td class="ioc-actions">
                                <button class="btn-icon" title="Copy to clipboard" onclick="copyToClipboard('${ioc.value}')">
                                    <i data-feather="copy"></i>
                                </button>
                                <button class="btn-icon" title="Lookup in threat intelligence" onclick="lookupIOC('${ioc.value}', '${ioc.type}')">
                                    <i data-feather="external-link"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function categorizeIOCs(iocs) {
    const categories = {};
    iocs.forEach(ioc => {
        const category = ioc.category || 'Unknown';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(ioc);
    });
    return categories;
}

function updateIOCStats(iocs) {
    const statsContainer = document.querySelector('.ioc-stats');
    if (!statsContainer) return;

    const processedIOCs = processIOCsForExport(iocs);
    const stats = calculateIOCStats(processedIOCs);

    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${stats.total}</span>
            <span class="stat-label">Total IOCs</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${stats.highConfidence}</span>
            <span class="stat-label">High Confidence</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${stats.unique}</span>
            <span class="stat-label">Unique Values</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${Object.keys(stats.categories).length}</span>
            <span class="stat-label">Categories</span>
        </div>
    `;
}

function calculateIOCStats(iocs) {
    const uniqueValues = new Set();
    const categories = {};
    let highConfidence = 0;

    iocs.forEach(ioc => {
        uniqueValues.add(ioc.value);

        const category = ioc.category || 'Unknown';
        categories[category] = (categories[category] || 0) + 1;

        if (ioc.confidence === 'High') {
            highConfidence++;
        }
    });

    return {
        total: iocs.length,
        unique: uniqueValues.size,
        highConfidence,
        categories
    };
}

function setupIOCFiltering() {
    document.addEventListener('change', (e) => {
        if (e.target.id === 'iocCategoryFilter') {
            filterIOCsByCategory(e.target.value);
        }
    });
}

function setupIOCSearch() {
    document.addEventListener('input', (e) => {
        if (e.target.id === 'iocSearch') {
            searchIOCs(e.target.value);
        }
    });
}

function filterIOCsByCategory(category) {
    const rows = document.querySelectorAll('.ioc-row');
    rows.forEach(row => {
        if (!category || row.dataset.category === category) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function searchIOCs(searchTerm) {
    const rows = document.querySelectorAll('.ioc-row');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (!term || text.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Global functions for IOC actions
window.copyToClipboard = async function (text) {
    try {
        await navigator.clipboard.writeText(text);
        dashboard?.showNotification('IOC copied to clipboard', 'success', 2000);
    } catch (error) {
        console.error('Copy failed:', error);
        dashboard?.showNotification('Failed to copy IOC', 'error');
    }
};

window.lookupIOC = function (value, type) {
    // Open threat intelligence lookup (configurable URLs)
    const lookupUrls = {
        'IP Address': `https://www.virustotal.com/gui/ip-address/${value}`,
        'Domain': `https://www.virustotal.com/gui/domain/${value}`,
        'MD5 Hash': `https://www.virustotal.com/gui/file/${value}`,
        'SHA1 Hash': `https://www.virustotal.com/gui/file/${value}`,
        'SHA256 Hash': `https://www.virustotal.com/gui/file/${value}`,
        'URL': `https://www.virustotal.com/gui/url/${btoa(value)}`
    };

    const url = lookupUrls[type] || `https://www.google.com/search?q=${encodeURIComponent(value)}`;
    window.open(url, '_blank');

    dashboard?.showNotification(`Opening threat intelligence lookup for ${type}`, 'info', 3000);
};