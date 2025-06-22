import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { environment } from "../../environment.js";
import { router } from "../../js/app.js";

export class LoginComponent extends AbstractComponent {
    constructor() {
        super();
        this.router = router;
        this.setClassName(this.constructor.name);
        this.container = "";
        this.errorSelectorName = "";
    }

    //@Override
    async init() {
        if (window.sessionStorage.getItem("isLoggedIn") === "true"){
            window.location.href = environment.navigationUrl + "/home";
            return;
        }
        await super.init();
        // Depending on the page, you can comment the next line
        this.dynamicallyLoadData();
    }

    //@Override
    eventListenerLoader() {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }
        // Add event listeners to the container
        const loginForm = this.container.querySelector(".login-form");
        loginForm.addEventListener("submit", this.login.bind(this));

    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            // Remove event listeners from the container
        }
    }

    //@Override
    destroy(){
        this.eventListenerRemover();
        super.destroy();
    }

    //@Override
    render(){
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.container = container;
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.constructor.name}:`, this.container);

        return container;
    }

    dynamicallyLoadData() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();

        // Add logic to dynamically load data into the component

        this.setTemplate(tempDiv.innerHTML);
    }

    async login(event) {
        event.preventDefault();
        if (this.errorSelectorName != "") {
            const errorMessage = this.container.querySelector(this.errorSelectorName);
            errorMessage.style.display = "none";
            this.errorSelectorName = "";
        }
        const formData = new FormData(event.target);
        const plainObject = Object.fromEntries(formData.entries());

        const response = await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/login", {
                method : "POST",
                body : JSON.stringify(plainObject),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        if (response.status === 200) {
            const result = await response.json();
            sessionStorage.setItem("jwt", result.token)
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("isAdmin", result.isAdmin);
            console.log(result.isAdmin);

            if (this.router) {
                this.router.navigate("/");
            } else { // Fallback if router is not working
                console.error('Router not found');
                window.location.href = '/profile';
            }
        }
        else if (response.status === 401) {
            this.errorSelectorName = ".login-failed-error-message";
            this.showErrorMessage();
        }
        else {
            const result = await response.text();
            alert("Error:" + result);
        }
    }

    showErrorMessage() {
        console.log(this.errorSelectorName);
        const errorMessage = this.container.querySelector(this.errorSelectorName);
        errorMessage.style.display = "block";
    }
}