import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import {environment} from "../../environment.js";
import { router } from "../../js/app.js";

export class ListingManagerComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.router = router;
    }

    //@Override
    async init() {
        if (window.sessionStorage.getItem("isLoggedIn") === "false"){
            window.location.href = environment.navigationUrl + "/home";
            return;
        }
        await super.init();
        // Depending on the page, you can comment the next line
        this.dynamicallyLoadData();

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
                this.handleDeleteProperty(event, deleteButton.dataset.id);
            }

            const editButton = event.target.closest('.edit-button');
            if (editButton) {
                event.preventDefault();
                this.handleEditProperty(event, editButton.dataset.id);
            }

            const viewButton = event.target.closest('.view-button');
            if (viewButton) {
                this.handleViewProperty(event, viewButton.dataset.id);
            }
        });
    }

    handleViewProperty(event, propertyId) {
        event.preventDefault();
        event.stopPropagation();

        console.log("Viewing property with ID:", propertyId);
        sessionStorage.setItem('selectedPropertyId', propertyId);

        if (this.router) {
            this.router.safeNavigate('/property');
        } else { // Fallback if router is not working
            console.error('Router not available for navigation');
            window.location.href = `/TW_Dumitrascu_Ursache_war_exploded/property?id=${propertyId}`;
        }
    }

    handleEditProperty(event, propertyId) {
        event.preventDefault();
        event.stopPropagation();

        console.log("Navigating with property ID:", propertyId);
        sessionStorage.setItem('editPropertyId', propertyId);

        if (this.router) {
            this.router.safeNavigate('/edit-listing');
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
                    this.sortProperties(e.target.value);
                });
            }
        }, 100);
    }

    sortProperties(sortOption) {
        const propertiesContainer = document.getElementById('user-properties-container');
        const propertyCards = Array.from(propertiesContainer.querySelectorAll('.property-card'));

        if (propertyCards.length === 0) return;

        propertyCards.sort((a, b) => {
            const dateA = new Date(a.querySelector('.creation-date').textContent.replace('Created on: ', ''));
            const dateB = new Date(b.querySelector('.creation-date').textContent.replace('Created on: ', ''));

            if (sortOption === 'newest') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        propertiesContainer.innerHTML = '';

        propertyCards.forEach(card => {
            propertiesContainer.appendChild(card);
        });
    }

    initSearchFunctionality() {
        setTimeout(() => {
            const searchInput = document.getElementById('search-listings');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterProperties(e.target.value.toLowerCase());
                });
            }
        }, 100);
    }



    filterProperties(searchTerm) {
        const propertyCards = document.querySelectorAll('.property-card');

        propertyCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();

            if (searchTerm === '' || title.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        const visibleCards = [...propertyCards].filter(card => card.style.display !== 'none');
        const container = document.getElementById('user-properties-container');

        const existingMessage = container.querySelector('.no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        if (visibleCards.length === 0 && searchTerm !== '') {
            const noResultsHTML = `
        <div class="no-results-message">
            <div class="no-properties-icon">🔍</div>
            <h3>No Matching Properties</h3>
            <p>No properties found matching "<strong>${searchTerm}</strong>"</p>
        </div>`;
            container.insertAdjacentHTML('beforeend', noResultsHTML);
        }
    }

    async handleDeleteProperty(event, propertyId) {
        console.log("Delete button clicked");
        console.log("Property ID:", propertyId);

        const confirmed = await this.showCustomConfirmation('Are you sure you want to delete this property?', propertyId);

        if (confirmed) {
            try {
                const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/delete-property', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                    },
                    body: JSON.stringify({propertyId: propertyId})
                });

                if (response.ok) {
                    this.showSuccessMessage('Property deleted successfully!');

                    const deletedCard = document.querySelector(`.property-card .delete-button[data-id="${propertyId}"]`).closest('.property-card');
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

                    const propertiesContainer = document.getElementById('user-properties-container');
                    if (propertiesContainer && !propertiesContainer.querySelector('.property-card')) {
                        propertiesContainer.innerHTML = '<p>No properties found. Add some properties to get started!</p>';
                    }
                } else {
                    const errorText = await response.text();
                    let errorMessage = 'Could not delete property';
                    try {
                        const errorObj = JSON.parse(errorText);
                        errorMessage = errorObj.message || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || errorMessage;
                    }
                    this.showErrorMessage(`Error: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error deleting property:', error);
                this.showErrorMessage('Failed to delete property. Please try again later.');
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

    showCustomConfirmation(message, propertyId) {
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
        container.innerHTML = this.template;
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.constructor.name}:`, this.template);

        return container;
    }

    async dynamicallyLoadData() {
        try {
            console.log("Fetching user properties data...");
            const userId = sessionStorage.getItem("jwt");
            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/user-properties`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const properties = await response.json();
            console.log("Received user properties:", properties);

            const totalListingsElement = document.getElementById('total-listings');
            if (totalListingsElement) {
                totalListingsElement.textContent = properties.length;
            }

            const cardsHTML = properties.length > 0
                ? properties.map(property => {
                    const creationDate = new Date(property.creationDate);
                    const formattedDate = creationDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    return `
                <div class="property-card">
                    <div class="content">
                        <div class="title-wrapper">
                            <h3>${property.title}</h3>
                            <p class="creation-date">Created on: ${formattedDate}</p>
                        </div>
                    </div>
                    <div class="property-actions">
                        <a href="#" class="view-button" data-route="/view-listing" data-id="${property.id}">View</a>
                        <a href="#" class="edit-button" data-route="/edit-listing" data-id="${property.id}">Edit</a>
                        <button class="delete-button" data-id="${property.id}">Delete</button>
                    </div>
                </div>
                `;
                }).join('')
                : `<div class="no-properties-message">
                <div class="no-properties-icon">📭</div>
                <h3>No Properties Found</h3>
                <p>You haven't added any properties yet. Click "Add New Listing" to get started!</p>
               </div>`;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const propertiesContainer = tempDiv.querySelector('#user-properties-container');
            if (propertiesContainer) {
                propertiesContainer.innerHTML = cardsHTML;
            }

            const totalListingsTemplateElement = tempDiv.querySelector('#total-listings');
            if (totalListingsTemplateElement) {
                totalListingsTemplateElement.textContent = properties.length;
            }

            this.setTemplate(tempDiv.innerHTML);

            const renderedPropertiesContainer = document.querySelector('#user-properties-container');
            if (renderedPropertiesContainer) {
                renderedPropertiesContainer.innerHTML = cardsHTML;
            }

            this.sortProperties('newest');

        } catch (error) {
            console.error('Error loading user property data:', error);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const container = tempDiv.querySelector('#user-properties-container');
            if (container) {
                container.innerHTML = '<p>Unable to load your properties at this time. Please try again later.</p>';
            }

            this.setTemplate(tempDiv.innerHTML);
        }
    }
}