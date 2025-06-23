import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { environment } from "../../environment.js";
import { router } from "../../js/app.js";

export class RecoverPasswordComponent extends AbstractComponent {
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
        const resetPasswordForm = this.container.querySelector(".email-account-recovery-form");
        resetPasswordForm.addEventListener("submit", this.recoverAccount.bind(this));
    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            const resetPasswordForm = this.container.querySelector(".email-account-recovery-form");
            if (resetPasswordForm) {
                resetPasswordForm.removeEventListener("submit", this.recoverAccount.bind(this));
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

    async recoverAccount(event) {
        event.preventDefault();

        if (this.errorSelectorName !== "") {
            const errorMessage = this.container.querySelector(this.errorSelectorName);
            errorMessage.style.display = "none";
            this.errorSelectorName = "";
        }

        const formData = new FormData(event.target);
        this.verifyPasswordValidity(formData);

        if (this.isResetFailed) {
            this.showErrorMessage();
        } else {
            const userData = Object.fromEntries(formData.entries());
            const response = await fetch("/TW_Dumitrascu_Ursache_war_exploded/api/email", {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            if (response.status === 200){
                this.replaceFormWithSuccess();
                return;
            } else if (response.status === 400){
                this.errorSelectorName = ".backend-email-error-message";
                this.showErrorMessage();
            } else {
                this.showNotificationPopup("An error occured. Please try again later");
            }
            this.isResetFailed = true;
        }
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

    showErrorMessage() {
        const errorMessage = this.container.querySelector(this.errorSelectorName);
        errorMessage.style.display = "block";
    }

    verifyPasswordValidity(formData) {
        const email = formData.get("email");

        if (!(/^.+@.+$/.test(email))) {
            this.errorMessage = "Invalid email";
            this.errorSelectorName = ".frontend-email-error-message";
            this.showErrorMessage();
        } else {
            this.isResetFailed = false;
        }

    }

    replaceFormWithSuccess() {
        const emailAccountRecoveryContainer = this.container.querySelector('.email-account-recovery-container');
        const form = this.container.querySelector('.email-account-recovery-form');

        if (emailAccountRecoveryContainer && form) {
            const successContent = document.createElement('div');
            successContent.className = 'success-content';

            const messageElement = document.createElement('div');
            messageElement.className = 'success-message';
            messageElement.innerHTML = `
            <h3>Your email was submitted</h3>
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
            emailAccountRecoveryContainer.appendChild(successContent);

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