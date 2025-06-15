import * as api from '../services/api.js';

// Initialize the Threat Intelligence tab. Currently there are no controls to
// set up so this simply acts as a placeholder should future functionality be
// required.
export function initTab() {
    return;
}

// Retrieve the latest threat intelligence data from the backend API.
export async function fetchThreatIntel() {
    try {
        const data = await api.getLatestThreatIntel();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Failed to fetch threat intelligence:', err);
        return [];
    }
}

// Render threat indicators in the Threat Intelligence tab.
export function render(indicators = []) {
    const container = document.getElementById('threatIntelContainer') ||
        document.querySelector('.threat-intel-container');
    if (!container) return;

    if (!Array.isArray(indicators) || indicators.length === 0) {
        container.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="alert-circle" width="32" height="32"></i>
                <p>No threat intelligence available</p>
            </div>`;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        return;
    }

    container.innerHTML = `
        <table class="threat-intel-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Last Seen</th>
                    <th>Source</th>
                </tr>
            </thead>
            <tbody>
                ${indicators.map(i => `
                    <tr>
                        <td>${escapeHTML(i.type)}</td>
                        <td>${escapeHTML(i.value)}</td>
                        <td>${escapeHTML(i.description)}</td>
                        <td>${formatDate(i.lastSeen)}</td>
                        <td>${escapeHTML(i.source)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function escapeHTML(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatDate(date) {
    if (!date) return 'Unknown';
    try {
        return new Date(date).toLocaleString();
    } catch {
        return 'Unknown';
    }
}

