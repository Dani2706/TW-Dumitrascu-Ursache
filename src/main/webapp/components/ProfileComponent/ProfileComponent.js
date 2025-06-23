import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { UserService } from "../../services/UserService.js";
import { AdminService} from "../../services/AdminService.js";
import {router} from "../../js/app.js";
import {environment} from "../../environment.js";

export class ProfileComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.router = router;
        this.container = "";
        this.userService = new UserService();
        this.adminService = new AdminService();
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

        const deleteButton = this.container.querySelector('#delete-account-button');
        deleteButton.addEventListener("click", this.handleDelete.bind(this));
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

    showNotificationPopup(message) {
        const existingPopup = document.querySelector('.notification-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'notification-popup-overlay';

        const popup = document.createElement('div');
        popup.className = 'notification-popup';

        const popupContent = document.createElement('div');
        popupContent.className = 'notification-content';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';

        const messageEl = document.createElement('p');
        messageEl.textContent = message;

        popupContent.appendChild(messageEl);
        popup.appendChild(closeBtn);
        popup.appendChild(popupContent);
        popupOverlay.appendChild(popup);
        document.body.appendChild(popupOverlay);

        setTimeout(() => {
            popup.classList.add('show');
        }, 10);

        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => {
                popupOverlay.remove();
            }, 300);
        });

        setTimeout(() => {
            if (document.body.contains(popupOverlay)) {
                popup.classList.remove('show');
                setTimeout(() => {
                    popupOverlay.remove();
                }, 300);
            }
        }, 5000);
    }

    async handleDelete(){
        console.log("Deleting");
        const userId = sessionStorage.getItem("userId");
        let response = null;
        if (userId != null && sessionStorage.getItem("isAdmin")){
            response = await this.adminService.deleteUser(userId);
        }
        else {
            response = await this.userService.deleteUser();
        }

        if (response.status === 204){
            console.log("Status 204");
            if (sessionStorage.getItem("isAdmin") === "true")
            {
                this.router.safeNavigate("/admin/UserDashboard");
            }
            else{
                sessionStorage.clear();
                console.log("Clearing sessionStorage");
                console.log(sessionStorage.getItem("jwt"));
                this.router.safeNavigate("/");
            }
        }
        else if (response.status === 401){
            this.showNotificationPopup("You are not authorized to do this");
        } else if(response.status === 400){
            this.showNotificationPopup("There is no user to delete");
        } else {
            this.showNotificationPopup("An error occurred. Please try again later");
        }
    }

    async getUserProfile(profileContainer) {
        try {
            const userId = sessionStorage.getItem("userId");
            let response = null;
            if (userId != null && sessionStorage.getItem("isAdmin")){
                response = await this.adminService.getUser(userId);
            }
            else {
                response = await this.userService.getUserProfile();
            }

            if (response.status === 200) {
                const userData = await response.json();
                const username = profileContainer.querySelector('#username');
                username.setAttribute('value', userData.username);

                const email = profileContainer.querySelector('#email');
                email.setAttribute('value', userData.email);

                const phone = profileContainer.querySelector('#phone');
                phone.setAttribute('value', userData.phoneNumber);
            }
            else if (response.status === 401){
                throw new Error("Unable to upload your profile information. \n Please login first!");
            }
            else {
                console.log("Inserted in get");
                throw new Error("There was an error uploading your profile information. \n Please retry or try again later!");
            }

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

            const userId = sessionStorage.getItem("userId");
            let response = null;
            if (userId != null && (sessionStorage.getItem("isAdmin") === "true")){
                formData.append("userId", userId);
                const userData = Object.fromEntries(formData.entries());
                response = await this.adminService.updateUser(userData);
            }
            else {
                const userData = Object.fromEntries(formData.entries());
                response = await this.userService.updateUserProfile(userData);
            }

            try {
                let errorMessage = "";
                console.log(response.status);
                if (response.status === 200) {
                    const json = await response.json();
                    if (sessionStorage.getItem("isAdmin") === "false") {
                        console.log("Updating sessionStorage token");
                        sessionStorage.setItem("jwt", json.token)
                    }
                    this.showNotificationPopup("Profile updated succesfully!");
                    //sessionStorage.setItem("isAdmin", json.isAdmin)
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
                    this.appendErrorMessage(errorMessage);
                } else {
                    console.log("Inserted in update");
                    throw new Error("There was an error uploading your profile information. Please retry or try again later!");
                }
            } catch (error) {
                console.log(error);
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