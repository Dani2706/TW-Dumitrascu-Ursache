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
    }

    setLogoutEventListener(){
        document.querySelector(".logout-button")
            .addEventListener('click', () => {
                window.sessionStorage.clear();
                window.location.href = environment.navigationUrl + "/";
            })
    }

    async manageNavBarElementsInHeader() {
        const navBar = document.getElementById("manage-nav-bar");
        navBar.replaceChildren();
        if (sessionStorage.getItem("isAdmin") === "true"){
            const userDashboard = document.createElement('a');
            userDashboard.setAttribute("href", "/admin/UserDashboard");
            userDashboard.setAttribute("data-route", "/admin/UserDashboard")
            userDashboard.textContent = "User Dashboard";

            const propertyDashboard = document.createElement('a');
            propertyDashboard.setAttribute("href", "/admin/PropertyDashboard");
            propertyDashboard.setAttribute("data-route", "/admin/PropertyDashboard")
            propertyDashboard.textContent = "Property Dashboard";

            const logout = document.createElement('a');
            logout.classList.add("logout-button");
            logout.setAttribute("href", "/");
            logout.setAttribute("class", "logout-button");
            logout.setAttribute("data-route", "/logout");
            logout.textContent = "Logout";

            navBar.appendChild(userDashboard);
            navBar.appendChild(propertyDashboard);
            navBar.appendChild(logout);

            this.setLogoutEventListener();
        }
        else {
            const home = document.createElement('a');
            home.setAttribute("href", "/");
            home.setAttribute("data-route", "/")
            home.textContent = "Home";

            navBar.appendChild(home);

            if (sessionStorage.getItem("isLoggedIn") === "true"){
                const favorites = document.createElement('a');
                favorites.setAttribute("href", "/favorite-listings");
                favorites.setAttribute("data-route", "/favorite-listings");
                favorites.textContent = "Favorites";

                const yourListings = document.createElement('a');
                yourListings.setAttribute("href", "/manage-listings");
                yourListings.setAttribute("data-route", "/manage-listings");
                yourListings.textContent = "Your listings";

                const profile = document.createElement('a');
                profile.setAttribute("href", "/profile");
                profile.setAttribute("data-route", "/profile");
                profile.textContent = "Profile";

                const logout = document.createElement('a');
                logout.classList.add("logout-button");
                logout.setAttribute("href", "/");
                logout.setAttribute("class", "logout-button");
                logout.setAttribute("data-route", "/logout");
                logout.textContent = "Logout";

                navBar.appendChild(favorites);
                navBar.appendChild(yourListings);
                navBar.appendChild(profile);
                navBar.appendChild(logout);

                this.setLogoutEventListener();
            } else {
                const login = document.createElement('a');
                login.setAttribute("href", "/login");
                login.setAttribute("data-route", "/login")
                login.textContent = "Login";

                const register = document.createElement('a');
                register.setAttribute("href", "/register");
                register.setAttribute("data-route", "/register")
                register.textContent = "Register";

                navBar.appendChild(login);
                navBar.appendChild(register);
            }
        }
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
        console.log("After");
        await this.navigate(path);
        mainWindow.style.visibility = 'visible';
        footer.style.visibility = 'visible';
        nav_bar.style.visibility = 'visible';
    }
}