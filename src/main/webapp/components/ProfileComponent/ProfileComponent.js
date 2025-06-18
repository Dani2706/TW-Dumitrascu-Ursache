import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { UserService } from "../../services/UserService.js";

export class ProfileComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.container = "";
        this.userService = new UserService();
    }

    //@Override
    async init() {
        await super.init();
        // Depending on the page, you can comment the next line
        await this.dynamicallyLoadData();
    }

    //@Override
    eventListenerLoader() {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }
        // Add event listeners to the container
        //Acces the container with this.container
    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            // Remove event listeners from the container
            //Acces the container with this.container
        }
    }

    //@Override
    destroy() {
        this.eventListenerRemover();
        super.destroy();
    }

    //@Override
    render() {
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.getTemplate();
        this.container = container;
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.constructor.name}:`, this.container);

        return container;
    }

    async dynamicallyLoadData() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();

        const profileContainer = tempDiv.querySelector(".profile-container");

        const newDiv = document.createElement('div');
        newDiv.innerHTML = await this.getUserProfile();

        profileContainer.appendChild(newDiv);

        // Add logic to dynamically load data into the component

        this.setTemplate(tempDiv.innerHTML);
    }

    async getUserProfile() {
        try {
            const userData = await this.userService.getUserProfile();
            return `
                <div class="user-profile">
                    <p><strong>Phone Number:</strong> ${userData.phoneNumber}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Username:</strong> ${userData.username}</p>
                </div>
            `;
        } catch (error) {
            return "Error encountered when fetching the user profile: " + error;
        }
    }
}