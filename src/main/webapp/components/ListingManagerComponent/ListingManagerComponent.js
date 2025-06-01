import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class ListingManagerComponent extends AbstractComponent {
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
        });
    }

    handleEditProperty(event, propertyId) {
        event.preventDefault();
        if (propertyId && window.router) {
            window.router.navigate(`/edit-listing?id=${propertyId}`);
        } else {
            console.error('Cannot navigate to edit page: missing property ID or router');
        }
    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            container.removeEventListener('click', this.handleClickHandler);
        }
    }

    async handleDeleteProperty(event, propertyId) {
        console.log("Delete button clicked");
        console.log("Property ID:", propertyId);

        const confirmed = await this.showCustomConfirmation('Are you sure you want to delete this property?', propertyId);

        if (confirmed) {
            try {
                const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/delete-property', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `propertyId=${propertyId}`
                });

                if (response.ok) {
                    this.showSuccessMessage('Property deleted successfully!');

                    await this.dynamicallyLoadData();
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

        const container = document.querySelector('.listing-manager-component');
        const propertiesGrid = document.querySelector('#user-properties-container');

        if (container && propertiesGrid) {
            container.insertBefore(messageElement, propertiesGrid.previousElementSibling);

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

        const container = document.querySelector('.listing-manager-component');
        const propertiesGrid = document.querySelector('#user-properties-container');

        if (container && propertiesGrid) {
            container.insertBefore(messageElement, propertiesGrid.previousElementSibling);

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
            const userId = 1; // hardcoded for demo
            const response = await fetch(`http://localhost:8081/TW_Dumitrascu_Ursache_war_exploded/user-properties?userId=${userId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const properties = await response.json();
            console.log("Received user properties:", properties);

            const cardsHTML = properties.length > 0
                ? properties.map(property => `
            <div class="property-card">
                <h3>${property.title}</h3>
                <div class="property-actions">
                    <a href="#" class="edit-button" data-route="/edit-listing" data-id="${property.id}">Edit</a>
                    <button class="delete-button" data-id="${property.id}">Delete</button>
                </div>
            </div>
        `).join('')
                : '<p>No properties found. Add some properties to get started!</p>';

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const propertiesContainer = tempDiv.querySelector('#user-properties-container');
            if (propertiesContainer) {
                propertiesContainer.innerHTML = cardsHTML;
            }

            this.setTemplate(tempDiv.innerHTML);

            const renderedPropertiesContainer = document.querySelector('#user-properties-container');
            if (renderedPropertiesContainer) {
                renderedPropertiesContainer.innerHTML = cardsHTML;
            }

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