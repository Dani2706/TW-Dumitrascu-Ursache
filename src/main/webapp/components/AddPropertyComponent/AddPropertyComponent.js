import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class AddPropertyComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
    }

    //@Override
    async init() {
        await super.init();
    }

    //@Override
    eventListenerLoader(container) {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }

        const form = container.querySelector('#addPropertyForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
            console.log('Form submit event listener added');
        } else {
            console.error('Form #addPropertyForm not found in the template');
        }
    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            const form = container.querySelector('#addPropertyForm');
            if (form) {
                form.removeEventListener('submit', this.handleSubmit.bind(this));
            }
        }
    }

    //@Override
    destroy() {
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.eventListenerRemover(container);
        super.destroy();
    }

    //@Override
    render() {
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.constructor.name}:`, this.template);

        return container;
    }

    async handleSubmit(event) {
        event.preventDefault();

        try {
            console.log('Form submitted, processing...');

            this.clearMessages();

            const form = event.target;
            const formData = new FormData(form);

            const propertyData = {
                title: formData.get('title'),
                description: formData.get('description'),
                propertyType: formData.get('propertyType'),
                transactionType: formData.get('transactionType'),
                price: parseInt(formData.get('price')),
                surfaceArea: parseInt(formData.get('surfaceArea')),
                rooms: formData.get('rooms') && formData.get('rooms') !== '' ? parseInt(formData.get('rooms')) : 0,
                bathrooms: formData.get('bathrooms') && formData.get('bathrooms') !== '' ? parseInt(formData.get('bathrooms')) : 0,
                floor: formData.get('floor') ? parseInt(formData.get('floor')) : 0,
                totalFloors: formData.get('totalFloors') ? parseInt(formData.get('totalFloors')) : 0,
                yearBuilt: formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt')) : 0,
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                contactName: formData.get('contactName'),
                contactPhone: formData.get('contactPhone'),
                contactEmail: formData.get('contactEmail')
            };

            console.log('Sending property data:', propertyData);

            const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/add-property', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyData)
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await response.json();

                if (response.ok) {
                    this.replaceFormWithSuccess(result.propertyId);
                } else {
                    this.showMessage(`Error: ${result.message || 'Failed to add property'}`, 'error');
                }
            } else {
                // Handle non-JSON response
                const text = await response.text();
                console.error('Server returned non-JSON response:', text);
                this.showMessage('Server error occurred. Check console for details.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showMessage(`Error adding property: ${error.message}`, 'error');
        }
    }

    replaceFormWithSuccess(propertyId) {
        const container = document.querySelector('.add-property-container');
        const form = document.querySelector('#addPropertyForm');

        if (container && form) {
            const successContent = document.createElement('div');
            successContent.className = 'success-content';

            const messageElement = document.createElement('div');
            messageElement.className = 'message success-message';
            messageElement.innerHTML = `<h3>Property added successfully!</h3>
                               <p>Your property has been created with ID: ${propertyId}</p>`;
            successContent.appendChild(messageElement);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'success-buttons';

            const addNewButton = document.createElement('a');
            addNewButton.className = 'btn btn-primary';
            addNewButton.innerHTML = 'Add Another Property';
            addNewButton.href = '#';
            addNewButton.setAttribute('data-route', '/add-property');

            const viewListingsButton = document.createElement('a');
            viewListingsButton.className = 'btn btn-secondary';
            viewListingsButton.innerHTML = 'View My Listings';
            viewListingsButton.href = '#';
            viewListingsButton.setAttribute('data-route', '/manage-listings');

            buttonContainer.appendChild(addNewButton);
            buttonContainer.appendChild(viewListingsButton);
            successContent.appendChild(buttonContainer);

            form.style.display = 'none';
            container.appendChild(successContent);
        }
    }

    showMessage(message, type) {
        const container = document.querySelector('.add-property-container');
        const form = document.querySelector('#addPropertyForm');
        if (container && form) {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}-message`;
            messageElement.innerHTML = message;

            container.insertBefore(messageElement, form);

            if (type === 'success') {
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 5000);
            }
        }
    }

    clearMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        });
    }
}