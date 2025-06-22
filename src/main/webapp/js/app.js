import { Router } from "./router.js";
import { HomeComponent } from "../components/HomeComponent/HomeComponent.js";
import { ProfileComponent } from "../components/ProfileComponent/ProfileComponent.js";
import { PropertyComponent } from "../components/PropertyComponent/PropertyComponent.js";
import { LoginComponent } from "../components/LoginComponent/LoginComponent.js";
import { RegisterComponent } from "../components/RegisterComponent/RegisterComponent.js";
import { AddPropertyComponent } from "../components/AddPropertyComponent/AddPropertyComponent.js";
import { ListingManagerComponent } from "../components/ListingManagerComponent/ListingManagerComponent.js";
import { EditListingComponent } from "../components/EditListingComponent/EditListingComponent.js";
import { PropertiesListComponent } from "../components/PropertiesListComponent/PropertiesListComponent.js";
import { AdminUserDashboardComponent } from "../components/AdminUserDashboardComponent/AdminUserDashboardComponent.js";
import { AdminPropertyDashboardComponent } from "../components/AdminPropertyDashboardComponent/AdminPropertyDashboardComponent.js"
import {FavoriteListingsComponent} from "../components/FavoriteListingsComponent/FavoriteListingsComponent.js";

const basePath = window.location.pathname.split('/').slice(0, 2).join('/');
const routes = {
            "/" : HomeComponent,
            "/properties-list" :PropertiesListComponent,
            "/profile" : ProfileComponent,
            "/manage-listings" : ListingManagerComponent,
            "/add-property" : AddPropertyComponent,
            "/edit-listing" : EditListingComponent,
            "/favorite-listings" : FavoriteListingsComponent,
            "/property" : PropertyComponent,
            "/login" : LoginComponent,
            "/register" : RegisterComponent,
            "/admin/PropertyDashboard" : AdminPropertyDashboardComponent,
            "/admin/UserDashboard" : AdminUserDashboardComponent
        }
export const router = new Router('#main-window', basePath, routes);
console.log("Router initialized with base path:", basePath);

router.setAfterNavigateCallback(() => {
    updateActiveNavLink();
    updateAdminStyling();
});

document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link) {
        e.preventDefault();
        const path = link.getAttribute('data-route');
        router.safeNavigate(path);
        updateActiveNavLink();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navBar = document.querySelector('.nav-bar');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navBar.classList.toggle('active');
        });
    }

    const navLinks = document.querySelectorAll('.nav-bar a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navBar.classList.remove('active');
            }
        });
    });

    updateActiveNavLink();
    updateAdminStyling();

    document.body.style.visibility = 'visible';
});

function updateActiveNavLink() {
    const currentPath = window.location.pathname.replace(basePath, '');
    const navLinks = document.querySelectorAll('.nav-bar a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('data-route');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateAdminStyling() {
    const isAdmin = window.sessionStorage.getItem("isAdmin") === "true";
    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');
    const headerTitle = document.querySelector('.header h1');

    const existingBadge = document.querySelector('.admin-badge');
    if (existingBadge) {
        existingBadge.remove();
    }

    if (isAdmin) {
        header.style.backgroundColor = '#4a4a4a';
        footer.style.backgroundColor = '#4a4a4a';

        const adminBadge = document.createElement('span');
        adminBadge.className = 'admin-badge';
        adminBadge.textContent = 'Admin Dashboard';
        headerTitle.appendChild(adminBadge);
    } else {
        header.style.backgroundColor = '#003366';
        footer.style.backgroundColor = '#003366';
    }
}

console.log('App initialized');
