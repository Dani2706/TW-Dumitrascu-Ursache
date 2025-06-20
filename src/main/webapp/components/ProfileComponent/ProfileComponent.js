import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { UserService } from "../../services/UserService.js";
import {environment} from "../../environment.js";

export class ProfileComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.container = "";
        this.userService = new UserService();
        this.errorContainer = null;
        this.runtimeErrorContainer = null;
        this.runtimeErrorParentContainer = null;
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
        const updateProfileForm = this.container.querySelector('.update-profile-form');
        updateProfileForm.addEventListener("submit", this.updateUserProfile.bind(this));
        // Add event listeners to the container
        //Acces the container with this.container
    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            // Remove event listeners from the container
            //Acces the container with this.container
            const updateProfileForm = this.container.querySelector('.update-profile-form');
            updateProfileForm.removeEventListener("submit", this.updateUserProfile.bind(this));
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

        await this.getUserProfile(profileContainer);
        // Add logic to dynamically load data into the component

        this.setTemplate(tempDiv.innerHTML);
    }

    async getUserProfile(profileContainer) {
        try {
            const userData = await this.userService.getUserProfile();

            const username = profileContainer.querySelector('#username');
            username.setAttribute('value', userData.username);

            const email = profileContainer.querySelector('#email');
            email.setAttribute('value', userData.email);

            const phone = profileContainer.querySelector('#phone');
            phone.setAttribute('value', userData.phoneNumber);

        } catch (error) {
            this.prependInitErrorMessage(profileContainer, error.message);
        }
    }

    async updateUserProfile(event) {
        event.preventDefault();

        this.removeInitErrorMessage();

        const formData = new FormData(event.target);

        const errorMessage = this.verifyPasswordValidity(formData);
        if (!this.appendErrorMessage(errorMessage)) {
            const plainObject = Object.fromEntries(formData.entries());

            const response = await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/user/profile", {
                    method: "PUT",
                    body: JSON.stringify(plainObject),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                    }
                }
            );
            try {
                let errorMessage = "";
                console.log(response.status);
                console.log(response);
                if (response.status === 204) {
                    alert("Profile updated succesfully!");
                } else if (response.status === 401) {
                    throw new Error("Unable to update your profile information. Please login first!");
                } else if (response.status === 409) {
                    const result = await response.text();
                    if (result === "UsernameAlreadyInUseException") {
                        errorMessage = "* Username already in use";
                        this.runtimeErrorParentContainer = this.container.querySelector(".username-field");
                    } else if (result === "EmailAlreadyInUseException") {
                        errorMessage = "* Email already in use";
                        this.runtimeErrorParentContainer = this.container.querySelector(".email-field");
                    } else if (result === "PhoneNumberAlreadyInUseException") {
                        errorMessage = "* Phone number already in use";
                        this.runtimeErrorParentContainer = this.container.querySelector(".phone-number-field");
                    }
                } else {
                    throw new Error("There was an error uploading your profile information. Please retry or try again later!");
                }
                this.appendErrorMessage(errorMessage);
            } catch (error) {
                this.prependErrorMessage(this.container.querySelector(".profile-container"), error.message);
            }
        }
    }

    verifyPasswordValidity(formData) {
        const username = formData.get("username");
        const email = formData.get("email");
        const phone = formData.get("phone");
        let errorMessage = "";
        if (!(/^[a-zA-Z0-9]+$/.test(username))){
            errorMessage = "Username must contain only letters and numbers";
            this.runtimeErrorParentContainer = this.container.querySelector(".username-field");
        }
        else if (!(/^.+@.+$/.test(email))) {
            errorMessage = "Invalid email";
            this.runtimeErrorParentContainer = this.container.querySelector(".email-field");
        }
        else if (!(/^\+?(\d[\d\s-]{7,}\d)$/.test(phone))){
            errorMessage = "Invalid phone number";
            this.runtimeErrorParentContainer = this.container.querySelector(".phone-number-field");
        }

        return errorMessage;
    }

    removeInitErrorMessage(){
        const initErrorContainer = this.container.querySelector(".init-error-message");
        if (initErrorContainer != null) {
            initErrorContainer.remove();
        }
    }

    prependInitErrorMessage(profileContainer, errorMessage){
        const newDiv = document.createElement('div');
        newDiv.classList.add("init-error-message");
        newDiv.innerHTML = errorMessage;
        profileContainer.prepend(newDiv);
        this.errorContainer = newDiv;
    }

    prependErrorMessage(profileContainer, errorMessage){
        if (this.errorContainer != null){
            this.errorContainer.parentNode.removeChild(this.errorContainer);
            this.errorContainer = null;
        }

        const newDiv = document.createElement('div');
        newDiv.innerHTML = errorMessage;
        profileContainer.prepend(newDiv);
        this.errorContainer = newDiv;
    }

    appendErrorMessage(errorMessage){
        if (this.runtimeErrorContainer != null){
            this.runtimeErrorContainer.parentNode.removeChild(this.runtimeErrorContainer);
            this.runtimeErrorContainer = null;
            this.runtimeErrorParentContainer = null;

        }

        if (errorMessage !== ""){
            const newDiv = document.createElement('div');
            newDiv.innerHTML = errorMessage;
            newDiv.classList.add("custom-error");
            this.runtimeErrorParentContainer.appendChild(newDiv);
            this.runtimeErrorContainer = newDiv;
            return true;
        }
        return false;
    }
}