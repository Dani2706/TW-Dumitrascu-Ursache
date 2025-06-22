import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import {environment} from "../../environment.js";
import { router } from "../../js/app.js";

export class AdminUserDashboardComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.router = router;
    }

    //@Override
    async init() {
        if (window.sessionStorage.getItem("isLoggedIn") === "false" ||
            window.sessionStorage.getItem("isAdmin") === "false"){
            window.location.href = environment.navigationUrl + "/home";
            return;
        }
        await super.init();
        // Depending on the page, you can comment the next line
        await this.dynamicallyLoadData();

        this.initSearchFunctionality();
        this.initSortingFunctionality();
    }

    //@Override
    eventListenerLoader(container) {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }

        container.addEventListener('click', event => {
            const deleteButton = event.target.closest('.delete-button');
            if (deleteButton) {
                this.handleDeleteUser(event, deleteButton.dataset.id);
            }

            const editButton = event.target.closest('.edit-button');
            if (editButton) {
                event.preventDefault();
                this.handleEditUser(event, editButton.dataset.id);
            }
        });
    }

    handleEditUser(event, userId) {
        event.preventDefault();
        event.stopPropagation();

        console.log("Navigating with user ID:", userId);
        sessionStorage.setItem('userId', userId);

        if (this.router) {
            this.router.safeNavigate('/profile');
        } else { // Fallback if router is not working
            console.error('Router not available for navigation');
            window.location.href = `/TW_Dumitrascu_Ursache_war_exploded/edit-listing`;
        }
    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            container.removeEventListener('click', this.handleClickHandler);
        }
    }

    initSortingFunctionality() {
        setTimeout(() => {
            const sortSelect = document.getElementById('sort-options');
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    this.sortUsers(e.target.value);
                });
            }
        }, 100);
    }

    sortUsers(sortOption) {
        const usersContainer = document.getElementById('user-users-container');
        const userCards = Array.from(usersContainer.querySelectorAll('.user-card'));

        if (userCards.length === 0) return;

        userCards.sort((a, b) => {
            const dateA = new Date(a.querySelector('.creation-date').textContent.replace('Created on: ', ''));
            const dateB = new Date(b.querySelector('.creation-date').textContent.replace('Created on: ', ''));

            if (sortOption === 'newest') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        usersContainer.innerHTML = '';

        userCards.forEach(card => {
            usersContainer.appendChild(card);
        });
    }

    initSearchFunctionality() {
        setTimeout(() => {
            const searchInput = document.getElementById('search-listings');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterUsers(e.target.value.toLowerCase());
                });
            }
        }, 100);
    }



    filterUsers(searchTerm) {
        const userCards = document.querySelectorAll('.user-card');

        userCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();

            if (searchTerm === '' || title.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        const visibleCards = [...userCards].filter(card => card.style.display !== 'none');
        const container = document.getElementById('user-users-container');

        const existingMessage = container.querySelector('.no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        if (visibleCards.length === 0 && searchTerm !== '') {
            const noResultsHTML = `
        <div class="no-results-message">
            <div class="no-users-icon">🔍</div>
            <h3>No Matching User</h3>
            <p>No users found matching "<strong>${searchTerm}</strong>"</p>
        </div>`;
            container.insertAdjacentHTML('beforeend', noResultsHTML);
        }
    }

    async handleDeleteUser(event, userId) {
        console.log("Delete button clicked");
        console.log("User ID:", userId);

        const confirmed = await this.showCustomConfirmation('Are you sure you want to delete this user?', userId);

        if (confirmed) {
            try {
                const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/user', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                    },
                    body: JSON.stringify({userId: userId})
                });

                if (response.ok) {
                    this.showSuccessMessage('User deleted successfully!');

                    const deletedCard = document.querySelector(`.user-card .delete-button[data-id="${userId}"]`).closest('.user-card');
                    if (deletedCard) {
                        deletedCard.remove();

                        const totalListingsElement = document.getElementById('total-listings');
                        if (totalListingsElement) {
                            const currentCount = parseInt(totalListingsElement.textContent);
                            if (!isNaN(currentCount)) {
                                totalListingsElement.textContent = currentCount - 1;
                            }
                        }
                    }

                    const usersContainer = document.getElementById('user-users-container');
                    if (usersContainer && !usersContainer.querySelector('.user-card')) {
                        usersContainer.innerHTML = '<p>No users found. Add some users to get started!</p>';
                    }
                } else {
                    const errorText = await response.text();
                    let errorMessage = 'Could not delete user';
                    try {
                        const errorObj = JSON.parse(errorText);
                        errorMessage = errorObj.message || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || errorMessage;
                    }
                    this.showErrorMessage(`Error: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                this.showErrorMessage('Failed to delete user. Please try again later.');
            }
        }
    }

    showErrorMessage(message) {
        const existingMessage = document.querySelector('.error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'error-message';
        messageElement.innerHTML = message;
        messageElement.style.backgroundColor = '#f8d7da';
        messageElement.style.color = '#721c24';
        messageElement.style.padding = '15px';
        messageElement.style.marginBottom = '20px';
        messageElement.style.borderRadius = '8px';
        messageElement.style.textAlign = 'center';

        const container = document.querySelector('.listing-manager-component');
        if (container) {
            const headerSection = container.querySelector('.header-section');
            if (headerSection && headerSection.nextElementSibling) {
                container.insertBefore(messageElement, headerSection.nextElementSibling);
            } else {
                container.insertBefore(messageElement, container.firstChild);
            }

            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 5000);
        }
    }

    showCustomConfirmation(message, userId) {
        const overlay = document.createElement('div');
        overlay.className = 'delete-confirmation-overlay';

        const modal = document.createElement('div');
        modal.className = 'delete-confirmation-modal';

        modal.innerHTML = `
        <div class="delete-confirmation-content">
            <h3>Confirm Deletion</h3>
            <p>${message}</p>
            <div class="delete-confirmation-actions">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-confirm">Delete</button>
            </div>
        </div>
    `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        return new Promise((resolve) => {
            const cancelBtn = modal.querySelector('.btn-cancel');
            const confirmBtn = modal.querySelector('.btn-confirm');

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(false);
            });

            confirmBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });
        });
    }

    showSuccessMessage(message) {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'success-message';
        messageElement.innerHTML = message;
        messageElement.style.backgroundColor = '#d4edda';
        messageElement.style.color = '#155724';
        messageElement.style.padding = '15px';
        messageElement.style.marginBottom = '20px';
        messageElement.style.borderRadius = '8px';
        messageElement.style.textAlign = 'center';

        const container = document.querySelector('.listing-manager-component');
        if (container) {
            const headerSection = container.querySelector('.header-section');
            if (headerSection && headerSection.nextElementSibling) {
                container.insertBefore(messageElement, headerSection.nextElementSibling);
            } else {
                container.insertBefore(messageElement, container.firstChild);
            }

            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 5000);
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
        container.innerHTML = this.getTemplate();
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.constructor.name}:`, this.template);

        return container;
    }

    async dynamicallyLoadData() {
        try {
            console.log("Fetching user users data...");
            const userId = sessionStorage.getItem("jwt");
            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/all-users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();
            console.log("Received user users:", users);

            const cardsHTML = users.length > 0
                ? users.map(user => {
                    const creationDate = new Date(user.createdAt);
                    const formattedDate = creationDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    return `
                <div class="user-card">
                    <div class="content">
                        <div class="title-wrapper">
                            <h2>Id: ${user.userId}</h2>
                            <h3>${user.username}</h3>
                            <p class="creation-date">Created on: ${formattedDate}</p>
                        </div>
                    </div>
                    <div class="user-actions">
                        <a href="/profile" class="edit-button" data-id="${user.userId}">Edit</a>
                        <button class="delete-button" data-id="${user.userId}">Delete</button>
                    </div>
                </div>
                `;
                }).join('')
                : `<div class="no-users-message">
                <div class="no-users-icon">📭</div>
                <h3>No Users Found</h3>
                <p>There are no users to manage</p>
               </div>`;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const usersContainer = tempDiv.querySelector('#user-users-container');
            if (usersContainer) {
                usersContainer.innerHTML = cardsHTML;
            }

            this.setTemplate(tempDiv.innerHTML);

        } catch (error) {
            console.error('Error loading user user data:', error);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const container = tempDiv.querySelector('#user-users-container');
            if (container) {
                container.innerHTML = '<p>Unable to load your users at this time. Please try again later.</p>';
                console.log(tempDiv.innerHTML);
            }

            this.setTemplate(tempDiv.innerHTML);
            console.log(this.getTemplate());
        }
    }
}