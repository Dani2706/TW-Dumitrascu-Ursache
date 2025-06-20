import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { environment } from "../../environment.js";
import { router } from "../../js/app.js";

export class RegisterComponent extends AbstractComponent {
    constructor() {
        super();
        this.router = router;
        this.setClassName(this.constructor.name);
        this.errorMessage = "";
        this.isSignUpFailed = true;
        this.errorSelectorName = "";
        this.container = "";
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
        const registerForm = this.container.querySelector(".register-form");
        registerForm.addEventListener("submit", this.register.bind(this))
        // Add event listeners to the container
    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            // Remove event listeners from the container
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
        container.innerHTML = this.template;
        this.container = container;
        this.eventListenerLoader();
        console.log(`Template render loaded for ${this.constructor.name}:`, this.container);

        return container;
    }

    dynamicallyLoadData() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();

        // Add logic to dynamically load data into the component

        this.setTemplate(tempDiv.innerHTML);
    }

    async register(event) {
        event.preventDefault();
        console.log(this.errorSelectorName);
        if (this.errorSelectorName != "") {
            const errorMessage = this.container.querySelector(this.errorSelectorName);
            errorMessage.style.display = "none";
            this.errorSelectorName = "";
        }
        const formData = new FormData(event.target);

        this.verifyPasswordValidity(formData);
        if (this.isSignUpFailed) {
            this.showErrorMessage();
        }
        else {
            const plainObject = Object.fromEntries(formData.entries());
            const response = await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/register", {
                method: "POST",
                body: JSON.stringify(plainObject),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
            );

            if (response.status === 201) {
                alert("User registered!");
                if (this.router) {
                    this.router.safeNavigate("/home");
                } else { // Fallback if router is not working
                    console.error('Router not found');
                    window.location.href = '/home';
                }
                return;
            }
            else if (response.status === 409) {
                const result = await response.text();
                if (result === "UsernameAlreadyInUseException") {
                    this.errorSelectorName = ".backend-username-error-message";
                }
                else if (result === "EmailAlreadyInUseException") {
                    this.errorSelectorName = ".backend-email-error-message";
                }
                else if (result === "PhoneNumberAlreadyInUseException") {
                    this.errorSelectorName = ".backend-phone-number-error-message";
                }
                this.showErrorMessage();
            } else {
                alert("An error occured. Please try again later")
            }
            this.isSignUpFailed = true;
        }

    }

    showErrorMessage() {
        console.log(this.errorSelectorName);
        const errorMessage = this.container.querySelector(this.errorSelectorName);
        errorMessage.style.display = "block";
    }

    verifyPasswordValidity(formData) {
        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");
        const confirmedPassword = formData.get("confirm-password");
        if (!(/^[a-zA-Z0-9]+$/.test(username))){
            this.errorMessage = "Username must contain only letters and numbers";
            this.errorSelectorName = ".frontend-username-error-message";
            this.showErrorMessage();
        }
        else if (!(/^.+@.+$/.test(email))) {
            this.errorMessage = "Invalid email";
            this.errorSelectorName = ".frontend-email-error-message";
            this.showErrorMessage();
        }
        else if (password !== confirmedPassword) {
            this.errorMessage = "Passwords do not match";
            this.errorSelectorName = ".confirm-password-error-message";
            this.showErrorMessage();
        }
        else if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password))) {
            this.errorMessage = "Password must be at least 8 characters, include upper and lower case letters, a number, and a special character.";
            this.errorSelectorName = ".password-error-message";
            this.showErrorMessage();
        } else {
            this.isSignUpFailed = false;
        }
    }
}