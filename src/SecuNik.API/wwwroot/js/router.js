/**
 * SecuNik Router - Simple Tab Navigation Router
 */
export default class Router {
    constructor(navTabs, tabSections) {
        this.navTabs = Array.from(navTabs);
        this.tabSections = Array.from(tabSections);
    }

    init() {
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const name = tab.getAttribute('data-tab');
                if (name) this.switchTo(name);
            });
        });
    }

    switchTo(name) {
        this.navTabs.forEach(tab => {
            const active = tab.getAttribute('data-tab') === name;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', active);
        });
        this.tabSections.forEach(sec => {
            const active = sec.id === `${name}Tab`;
            sec.classList.toggle('active', active);
        });
        if (history.replaceState) {
            history.replaceState(null, '', `#${name}`);
        }
    }
}