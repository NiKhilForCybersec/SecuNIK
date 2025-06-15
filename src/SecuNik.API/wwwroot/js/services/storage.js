/**
 * SecuNik Storage Service - Local Storage Management
 */

export function loadSettings() {
    try {
        const saved = localStorage.getItem('secunik_dashboard_settings');
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

export function saveSettings(settings) {
    try {
        localStorage.setItem('secunik_dashboard_settings', JSON.stringify(settings));
    } catch { }
}

export function loadHistory() {
    try {
        const saved = localStorage.getItem('secunik_analysis_history');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function saveHistory(history) {
    try {
        localStorage.setItem('secunik_analysis_history', JSON.stringify(history));
    } catch { }
}

export function loadCases() {
    try {
        const saved = localStorage.getItem('secunik_cases');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function saveCases(cases) {
    try {
        localStorage.setItem('secunik_cases', JSON.stringify(cases));
    } catch { }
}