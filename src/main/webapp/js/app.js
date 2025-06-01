import { Router } from "./router.js";
import { HomeComponent } from "../components/HomeComponent/HomeComponent.js";
import { ProfileComponent } from "../components/ProfileComponent/ProfileComponent.js";
import { PropertyComponent } from "../components/PropertyComponent/PropertyComponent.js";
import { LoginComponent } from "../components/LoginComponent/LoginComponent.js";
import { AddPropertyComponent } from "../components/AddPropertyComponent/AddPropertyComponent.js";
import { ListingManagerComponent } from "../components/ListingManagerComponent/ListingManagerComponent.js";
import { EditListingComponent } from "../components/EditListingComponent/EditListingComponent.js";
//import { RegisterComponent } from "../components/RegisterComponent/RegisterComponent.js";

const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
const routes = {
            "/" : HomeComponent,
            "/profile" : ProfileComponent,
            "/manage-listings" : ListingManagerComponent,
            "/add-property" : AddPropertyComponent,
            "/edit-listing" : EditListingComponent,
            "/property" : PropertyComponent,
            "/login" : LoginComponent
            //"/register" : RegisterComponent
        }
const router = new Router('#main-window', basePath, routes);
console.log("Router initialized with base path:", basePath);

document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link) {
        e.preventDefault();
        const path = link.getAttribute('data-route');
        router.navigate(path);
    }
});
console.log('App initialized');
