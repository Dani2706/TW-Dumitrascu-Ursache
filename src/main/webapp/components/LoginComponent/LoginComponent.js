import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class LoginComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
    }

    //@Override
    async init() {
        await super.init();
        // Depending on the page, you can comment the next line
        this.dynamicallyLoadData();
    }

    //@Override
    eventListenerLoader(container) {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }
        // Add event listeners to the container
        const loginForm = container.querySelector(".login-form");
        loginForm.addEventListener("submit", this.login);

    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            // Remove event listeners from the container
        }
    }

    //@Override
    destroy(){
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.eventListenerRemover(container);
        super.destroy();
    }

    //@Override
    render(){
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.constructor.name}:`, this.template);

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
        const formData = new FormData(this);
        const plainObject = Object.fromEntries(formData.entries());

        const response = await fetch("/TW_Dumitrascu_Ursache_1_0_SNAPSHOT_war/api/login", {
                method : "POST",
                body : JSON.stringify(plainObject),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        
        const result = await response.json();
        if (response.ok) {
            window.sessionStorage.setItem("jwt", result.token)
            window.location.href = "/TW_Dumitrascu_Ursache_1_0_SNAPSHOT_war/profile";
        }
        else {
            alert("Error:" + result);
        }
    }
}