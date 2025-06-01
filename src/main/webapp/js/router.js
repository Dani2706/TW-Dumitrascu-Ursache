export class Router {
    constructor(containerSelector, basePath, routes) {
        this.container = document.querySelector(containerSelector);
        this.routes = routes;
        this.basePath = basePath;
        this.eventListenerLoader();
        this.currentRenderedComponentInstance = null;
        this.currentRenderedComponentDOM = null;
    }

    eventListenerLoader(){
        window.addEventListener('popstate', () => {
            const fullPath = location.pathname;
            console.log(`Navigating to: ${fullPath}`);
            const path = fullPath.replace(this.basePath, '');
            console.log(`Path after stripping base: ${path}`);
            if (path in this.routes) {
                this.render(path);
            } else {
                console.error(`No route found for path: ${path}`);
            }
        });
        document.addEventListener('DOMContentLoaded', () => {
            const fullPath = window.location.pathname;
            const path = fullPath.replace(this.basePath, '');
            console.log(`Current path on load: ${path}`);
            this.navigate(path); // Load the correct view on page load
        });
    }

    navigate(path) {
        if (!this.routes[path]) {
            path = '/';
        }
        const fullPath = `${this.basePath}${path}`;
        history.pushState({}, '', fullPath);
        this.render(path);
        console.log('Navigating to:', path);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async render(path) {
        this.cleanRenderedComponent();
        const component = this.routes[path];
        if (component) {
            const instance = new component();
            await instance.init().then(() => {
                console.log(`Rendering component for path: ${path}`);
            }).catch(error => {
                console.error(`Error initializing component for path ${path}:`, error);
            });
            this.currentRenderedComponentDOM = instance.render();
            this.container.appendChild(this.currentRenderedComponentDOM);
            this.currentRenderedComponentInstance = instance;
        }
        else {
            throw new Error(`No component found for path: ${path}`);
        }

    }

    cleanRenderedComponent(){
        if (this.currentRenderedComponentInstance) {
            this.currentRenderedComponentDOM.remove();
            this.currentRenderedComponentInstance.destroy();
            this.currentRenderedComponentInstance = null;
            this.currentRenderedComponentDOM = null;
            console.log('Cleaned up rendered component');
        }
    }
}