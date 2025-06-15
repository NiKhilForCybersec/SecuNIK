export function initTab(analysis) {
    if (!analysis) return;
    render(analysis);
}

export function render(analysis) {
    if (!analysis) return;

    const container = document.getElementById('recommendationsContainer') ||
        document.querySelector('.recommendations-container');

    if (!container) return;

    let actions = analysis.result?.ai?.recommendedActions || [];
    if (!Array.isArray(actions)) {
        actions = actions ? [actions] : [];
    }

    if (actions.length === 0) {
        container.innerHTML = `
            <div class="placeholder-content">
                <i data-feather="zap" width="32" height="32"></i>
                <p>No recommendations available</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <ul class="recommended-actions">
                ${actions.map((a, idx) => `
                    <li><span class="action-number">${idx + 1}.</span> <span class="action-text">${escapeHTML(a)}</span></li>
                `).join('')}
            </ul>
        `;
    }

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
