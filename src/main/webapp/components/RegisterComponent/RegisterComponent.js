import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { environment } from "../../environment.js";
import { router } from "../../js/app.js";
import {UserService} from "../../services/UserService.js";
import {AdminService} from "../../services/AdminService.js";

export class RegisterComponent extends AbstractComponent {
    constructor() {
        super();
        this.router = router;
        this.setClassName(this.constructor.name);
        this.errorMessage = "";
        this.isSignUpFailed = true;
        this.errorSelectorName = "";
        this.container = "";
        this.userService = new UserService();
        this.adminService = new AdminService();
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
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
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
            const userData = Object.fromEntries(formData.entries());
            let response = null;
            if (sessionStorage.getItem("isAdmin")){
                response = await this.adminService.registerUser(userData);
            }
            else{
                response = await this.userService.registerUser(userData);
            }

            if (response.status === 201) {
                this.replaceFormWithSuccess();
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
        const phone = formData.get("phone");
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
        else if (!(/^\+?\d+$/.test(phone))) {
            this.errorMessage = "Phone number must contain only digits and optionally a '+' sign";
            this.errorSelectorName = ".frontend-phone-error-message";
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

    replaceFormWithSuccess() {
        const registerContainer = this.container.querySelector('.register-container');
        const form = this.container.querySelector('.register-form');

        if (registerContainer && form) {
            const successContent = document.createElement('div');
            successContent.className = 'success-content';

            const messageElement = document.createElement('div');
            messageElement.className = 'success-message';
            messageElement.innerHTML = `
            <h3>Your account has been successfully created!</h3>
            <p>You will be redirected to login page in <span id="countdown">5</span> seconds...</p>
        `;
            successContent.appendChild(messageElement);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'success-buttons';

            this.countdownInterval = null;

            const homeButton = document.createElement('a');
            homeButton.className = 'btn btn-secondary';
            homeButton.innerHTML = 'Go to Home';
            homeButton.href = '#';
            homeButton.onclick = (e) => {
                e.preventDefault();
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                }
                this.router.safeNavigate("/home");

                document.querySelectorAll('.nav-bar a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-route') === '/') {
                        link.classList.add('active');
                    }
                });

                return false;
            };

            const loginButton = document.createElement('a');
            loginButton.className = 'btn btn-primary';
            loginButton.innerHTML = 'Go to Login';
            loginButton.href = '#';
            loginButton.onclick = (e) => {
                e.preventDefault();
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                }
                this.router.safeNavigate("/login");

                document.querySelectorAll('.nav-bar a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-route') === '/login') {
                        link.classList.add('active');
                    }
                });

                return false;
            };

            buttonContainer.appendChild(homeButton);
            buttonContainer.appendChild(loginButton);
            successContent.appendChild(buttonContainer);

            form.style.display = 'none';
            registerContainer.appendChild(successContent);

            let countdown = 5;
            const countdownElement = document.getElementById('countdown');
            this.countdownInterval = setInterval(() => {
                countdown--;
                if (countdownElement) {
                    countdownElement.textContent = countdown;
                }

                if (countdown <= 0) {
                    clearInterval(this.countdownInterval);
                    this.router.safeNavigate("/login");

                    document.querySelectorAll('.nav-bar a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-route') === '/login') {
                            link.classList.add('active');
                        }
                    });
                }
            }, 1000);
        }
    }
}