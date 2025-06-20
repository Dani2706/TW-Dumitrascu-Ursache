import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { router } from "../../js/app.js";

export class HomeComponent extends AbstractComponent {
    constructor() {
        super();
        this.router = router;
        this.setClassName(this.constructor.name);
    }

    async init() {
        await super.init();
    }

    eventListenerLoader() {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }

        this._setupCategoryButtons();
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

                    this.router.safeNavigate("/properties");
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
        try {
            const properties = await this._fetchPropertyData();
            this._updatePropertiesDisplay(properties);
        } catch (error) {
            console.error('Error loading property data:', error);
            this._displayNoPropertiesMessage();
        }
    }

    async _fetchPropertyData() {
        const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/properties/top');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    _updatePropertiesDisplay(properties) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();

        const propertiesContainer = tempDiv.querySelector('#properties-container');
        if (!propertiesContainer) return;

        if (properties && properties.length > 0) {
            propertiesContainer.innerHTML = properties.map(property => this._createPropertyCard(property)).join('');
        } else {
            propertiesContainer.innerHTML = this._getNoPropertiesHTML();
        }

        this._updateTemplate(tempDiv, propertiesContainer);
    }

    _displayNoPropertiesMessage() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();

        const propertiesContainer = tempDiv.querySelector('#properties-container');
        if (!propertiesContainer) return;

        propertiesContainer.innerHTML = this._getNoPropertiesHTML();
        this._updateTemplate(tempDiv, propertiesContainer);
    }

    _updateTemplate(tempDiv, propertiesContainer) {
        this.setTemplate(tempDiv.innerHTML);

        if (this.container) {
            const propertiesContainerDOM = this.container.querySelector('#properties-container');
            if (propertiesContainerDOM) {
                propertiesContainerDOM.innerHTML = propertiesContainer.innerHTML;
            }
        }
    }

    _createPropertyCard(property) {
        return `
            <div class="property-card">
                <h3>${property.title}</h3>
                <div class="property-details">
                    <span class="property-price">${this.formatPrice(property.price)}</span>
                </div>
            </div>
        `;
    }

    _getNoPropertiesHTML() {
        return `
            <div class="no-properties-message">
                <i class="fas fa-home" style="font-size: 48px; color: var(--text-light); margin-bottom: 15px;"></i>
                <p>No featured listings available at this moment.</p>
                <p>Check back soon for new properties!</p>
            </div>
        `;
    }

    formatPrice(price) {
        return `€${price.toLocaleString('ro-RO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    }
}