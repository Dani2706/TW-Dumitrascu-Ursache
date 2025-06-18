import { environment } from "../environment.js";

export class Router {
    constructor(containerSelector, basePath, routes) {
        this.container = document.querySelector(containerSelector);
        this.routes = routes;
        this.basePath = basePath;
        this.eventListenerLoader();
        this.currentRenderedComponentInstance = null;
        this.currentRenderedComponentDOM = null;
    }

    //This sets the eventlisteners that are ment to happen 
    //for things outside the #main-window
    eventListenerLoader() {
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
        document.addEventListener('DOMContentLoaded', async () => {
            //this.manageNavBarElementsInHeader();
            const fullPath = window.location.pathname;
            const path = fullPath.replace(this.basePath, '');
            console.log(`Current path on load: ${path}`);
            await this.navigate(path); // Load the correct view on page load
            document.body.style.visibility = 'visible';
        });
        document.querySelector(".logout-button")
            .addEventListener('click', () => {
                window.sessionStorage.clear();
                window.location.href = environment.navigationUrl + "/";
            })
    }

    async manageNavBarElementsInHeader() {
        let loginTrueDisplayStatus = "";
        let loginFalseDisplayStatus = "";
        const loginTrue = document.querySelectorAll(".login-true");
        const loginFalse = document.querySelectorAll(".login-false");
        if (window.sessionStorage.getItem("isLoggedIn") === "true") {
            loginTrueDisplayStatus = "block";
            loginFalseDisplayStatus = "none";
        }
        else {
            loginTrueDisplayStatus = "none";
            loginFalseDisplayStatus = "block";
        }
        loginTrue.forEach(el => {
            el.style.display = loginTrueDisplayStatus;
        })
        loginFalse.forEach(el => {
            el.style.display = loginFalseDisplayStatus;
        })
    }

    async navigate(path) {
        if (!this.routes[path]) {
            path = '/';
        }
        const fullPath = `${this.basePath}${path}`;
        history.pushState({}, '', fullPath);
        await this.render(path);
        await this.manageNavBarElementsInHeader();
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
            //this.container = #main-window
            this.container.appendChild(this.currentRenderedComponentDOM);
            this.currentRenderedComponentInstance = instance;
        }
        else {
            throw new Error(`No component found for path: ${path}`);
        }

    }

    cleanRenderedComponent() {
        if (this.currentRenderedComponentInstance) {
            this.currentRenderedComponentDOM.remove();
            this.currentRenderedComponentInstance.destroy();
            this.currentRenderedComponentInstance = null;
            this.currentRenderedComponentDOM = null;
            console.log('Cleaned up rendered component');
        }
    }

    async safeNavigate(path){
        const mainWindow = document.getElementById('main-window');
        const footer = document.querySelector(".footer");
        const nav_bar = document.querySelector(".nav-bar");
        mainWindow.style.visibility = 'hidden';
        footer.style.visibility = 'hidden';
        nav_bar.style.visibility = 'hidden';
        console.log("Before");
        console.log("After");
        await this.navigate(path);
        mainWindow.style.visibility = 'visible';
        footer.style.visibility = 'visible';
        nav_bar.style.visibility = 'visible';
    }
}