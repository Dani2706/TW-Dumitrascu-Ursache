import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { environment } from "../../environment.js";
import { router } from "../../js/app.js";

export class ResetPasswordComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.router = router;
        this.errorMessage = "";
        this.isResetFailed = true;
        this.errorSelectorName = "";
        this.container = "";
        this.countdownInterval = null;
    }

    //@Override
    async init() {
        await super.init();
        this.dynamicallyLoadData();
    }

    //@Override
    eventListenerLoader() {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }
        const resetPasswordForm = this.container.querySelector(".reset-password-form");
        resetPasswordForm.addEventListener("submit", this.resetPassword.bind(this));
    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            const resetPasswordForm = this.container.querySelector(".reset-password-form");
            if (resetPasswordForm) {
                resetPasswordForm.removeEventListener("submit", this.resetPassword.bind(this));
            }
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

    async resetPassword(event) {
        event.preventDefault();

        if (this.errorSelectorName != "") {
            const errorMessage = this.container.querySelector(this.errorSelectorName);
            errorMessage.style.display = "none";
            this.errorSelectorName = "";
        }

        const formData = new FormData(event.target);
        this.verifyPasswordValidity(formData);

        if (this.isResetFailed) {
            this.showErrorMessage();
        } else {

            // FA API CALL AICI
            // FA API CALL AICI
            // FA API CALL AICI

            this.replaceFormWithSuccess();
        }
    }

    showErrorMessage() {
        const errorMessage = this.container.querySelector(this.errorSelectorName);
        errorMessage.style.display = "block";
    }

    verifyPasswordValidity(formData) {
        const password = formData.get("new-password");
        const confirmedPassword = formData.get("confirm-password");

        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password))) {
            this.errorMessage = "Password must be at least 8 characters, include upper and lower case letters, a number, and a special character.";
            this.errorSelectorName = ".password-error-message";
            this.showErrorMessage();
        } else if (password !== confirmedPassword) {
            this.errorMessage = "Passwords do not match";
            this.errorSelectorName = ".confirm-password-error-message";
            this.showErrorMessage();
        } else {
            this.isResetFailed = false;
        }
    }

    replaceFormWithSuccess() {
        const resetPasswordContainer = this.container.querySelector('.reset-password-container');
        const form = this.container.querySelector('.reset-password-form');

        if (resetPasswordContainer && form) {
            const successContent = document.createElement('div');
            successContent.className = 'success-content';

            const messageElement = document.createElement('div');
            messageElement.className = 'success-message';
            messageElement.innerHTML = `
            <h3>Your password has been successfully reset!</h3>
            <p>You will be redirected to login page in <span id="countdown">5</span> seconds...</p>
        `;
            successContent.appendChild(messageElement);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'success-buttons';

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
            resetPasswordContainer.appendChild(successContent);

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