import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class HomeComponent extends AbstractComponent {
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
        // Add event listeners to the container
    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            // Remove event listeners from the container
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

        // Load data AFTER initial render
        this.dynamicallyLoadData(container);

        return container;
    }

    async dynamicallyLoadData(container) {
        try {
            // Fetch property data from backend API
            console.log("Fetching property data...");
            const response = await fetch('http://localhost:8081/TW_Dumitrascu_Ursache_war_exploded/api/properties/top');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const properties = await response.json();
            console.log("Received properties:", properties);

            // Generate HTML for property cards
            const cardsHTML = properties.map(property => `
                <div class="property-card">
                    <h3>${property.title}</h3>
                    <div class="property-details">
                        <span class="property-price">${this.formatPrice(property.price)}</span>
                    </div>
                </div>
            `).join('');

            // Update template with property cards
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const propertiesContainer = container.querySelector('#properties-container');
            if (propertiesContainer) {
                propertiesContainer.innerHTML = cardsHTML;
            }
        } catch (error) {
            console.error('Error loading property data:', error);
            // Fallback content if loading fails
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const container = tempDiv.querySelector('#properties-container');
            if (container) {
                container.innerHTML = '<p>Unable to load properties at this time. Please try again later.</p>';
            }

            this.setTemplate(tempDiv.innerHTML);
        }
    }

    formatPrice(price) {
        // Format price with thousand separators and currency symbol
        return `€${price.toLocaleString('ro-RO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    }
}
