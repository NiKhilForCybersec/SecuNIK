import { updateTimelineChart } from './dashboard.js';

let dashboard;

export function init(dash) {
    dashboard = dash;
    const timelineBtns = document.querySelectorAll('.timeline-btn');
    timelineBtns.forEach(btn => {
        btn.addEventListener('click', handleTimelineFilter);
    });
}

export function render(analysis) {
    const events = analysis?.result?.technical?.securityEvents || [];
    updateTimelineChart(events);
}

function handleTimelineFilter(event) {
    const period = event.target.getAttribute('data-period');

    document.querySelectorAll('.timeline-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
    });

    event.target.classList.add('active');
    event.target.setAttribute('aria-checked', 'true');

    if (dashboard?.state.currentAnalysis) {
        const events = dashboard.state.currentAnalysis.result.technical?.securityEvents || [];
        const filteredEvents = filterEventsByPeriod(events, period);
        updateTimelineChart(filteredEvents);
    }
}

function filterEventsByPeriod(events, period) {
    const now = new Date();
    let cutoff;

    switch (period) {
        case '1h':
            cutoff = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case '6h':
            cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
            break;
        case '24h':
            cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        default:
            return events;
    }

    return events.filter(e => e.timestamp && new Date(e.timestamp) >= cutoff);
}

