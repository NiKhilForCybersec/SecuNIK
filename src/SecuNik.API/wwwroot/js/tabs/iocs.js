let dashboard;

export function init(dash) {
    dashboard = dash;
    const exportBtn = document.getElementById('exportIOCsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportIOCs());
    }
}

export function render(data) {
    // Placeholder for IOC rendering logic
}

export function exportIOCs(analysis = dashboard?.state.currentAnalysis) {
    if (!analysis) {
        dashboard?.showNotification('No analysis data available', 'warning');
        return;
    }

    const iocs = analysis.result.technical?.detectedIOCs || [];

    if (iocs.length === 0) {
        dashboard?.showNotification('No IOCs found to export', 'warning');
        return;
    }

    try {
        const csvData = convertIOCsToCSV(iocs);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-iocs-${analysis.analysisId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification('IOCs exported successfully', 'success');
    } catch (error) {
        console.error('IOC export failed:', error);
        dashboard?.showNotification('Failed to export IOCs', 'error');
    }
}

function convertIOCsToCSV(iocs) {
    const headers = ['Type', 'Value', 'Category', 'Confidence', 'Description', 'First Seen'];
    const rows = iocs.map(ioc => [
        ioc.type || '',
        ioc.value || '',
        ioc.category || '',
        ioc.confidence || '',
        ioc.description || '',
        ioc.firstSeen || ''
    ]);

    return [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

