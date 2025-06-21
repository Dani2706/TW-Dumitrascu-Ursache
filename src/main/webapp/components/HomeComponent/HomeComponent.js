import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { router } from "../../js/app.js";

export class HomeComponent extends AbstractComponent {
    constructor() {
        super();
        this.router = router;
        this.setClassName(this.constructor.name);
        this.properties = [];
    }

    async init() {
        await super.init();
    }

    eventListenerLoader() {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }
        this._setupCategoryButtons();
        this.addPropertyCardListeners();
    }

    _setupCategoryButtons() {
        const categoryCards = this.container.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            const categoryType = card.dataset.category;
            ['buy', 'rent'].forEach(actionType => {
                const button = card.querySelector(`.category-btn[data-type="${actionType}"]`);
                if (!button) return;
                button.addEventListener('click', () => {
                    const propertyType = this.getPropertyTypeParam(categoryType);
                    const transactionType = actionType === 'buy' ? 'sell' : 'rent';
                    sessionStorage.setItem('propertyType', propertyType);
                    sessionStorage.setItem('transactionType', transactionType);
                    this.router.safeNavigate("/properties-list");
                });
            });
        });
    }

    getPropertyTypeParam(category) {
        const propertyTypes = {
            'flat': 'flat',
            'house': 'house',
            'land': 'land',
            'commercial': 'commercial'
        };
        return propertyTypes[category] || 'flat';
    }

    eventListenerRemover() {
        if (!this.templateLoaded) return;
        const categoryButtons = this.container.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => button.replaceWith(button.cloneNode(true)));
        const propertyCards = this.container.querySelectorAll('.property-card');
        propertyCards.forEach(card => card.replaceWith(card.cloneNode(true)));
    }

    destroy() {
        this.eventListenerRemover();
        super.destroy();
    }

    render() {
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.container = container;
        this.dynamicallyLoadData();
        this.eventListenerLoader();
        return container;
    }

    async dynamicallyLoadData() {
        const propertiesContainer = this.container.querySelector('#properties-container');
        if (!propertiesContainer) return;
        propertiesContainer.innerHTML = '<div class="loading">Loading properties...</div>';
        try {
            const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/properties/top');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.properties = await response.json();
            this.updatePropertiesDisplay(this.properties);
        } catch (error) {
            console.error('Error loading property data:', error);
            this.displayNoPropertiesMessage();
        }
    }

    updatePropertiesDisplay(properties) {
        const propertiesContainer = this.container.querySelector('#properties-container');
        if (!propertiesContainer) return;
        if (properties && properties.length > 0) {
            propertiesContainer.innerHTML = properties.map(property => this.createPropertyCardHTML(property)).join('');
        } else {
            this.displayNoPropertiesMessage();
        }
        this.addPropertyCardListeners();
    }

    displayNoPropertiesMessage() {
        const propertiesContainer = this.container.querySelector('#properties-container');
        if (!propertiesContainer) return;
        propertiesContainer.innerHTML = `
            <div class="no-properties-message">
                <i class="fas fa-home" style="font-size: 48px; color: var(--text-light); margin-bottom: 15px;"></i>
                <p>No featured listings available at this moment.</p>
                <p>Check back soon for new properties!</p>
            </div>
        `;
    }

    createPropertyCardHTML(property) {
        return `
            <div class="property-card" data-property-id="${property.propertyId}">
                <div class="property-details">
                    <h3>${property.title}</h3>
                    <p class="property-location">${property.city}, ${property.country}</p>
                    <div class="property-features">
                        <span>${property.rooms} rooms</span>
                        <span>${property.bathrooms} bathrooms</span>
                        <span>${property.surfaceArea} m²</span>
                    </div>
                    <div class="property-action-row">
                        <div class="property-price">€${property.price.toLocaleString('ro-RO')}</div>
                        <button class="view-details-btn">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }

    addPropertyCardListeners() {
        const propertyCards = this.container.querySelectorAll('.property-card');
        propertyCards.forEach(card => {
            const viewDetailsBtn = card.querySelector('.view-details-btn');
            const propertyId = card.dataset.propertyId;
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    sessionStorage.setItem('selectedPropertyId', propertyId);
                    this.router.safeNavigate("/property");
                });
            }
            card.addEventListener('click', () => {
                sessionStorage.setItem('selectedPropertyId', propertyId);
                this.router.safeNavigate("/property");
            });
        });
    }
}