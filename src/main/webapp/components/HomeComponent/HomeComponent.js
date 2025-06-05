import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class HomeComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.container = "";
    }

    //@Override
    async init() {
        await super.init();
    }

    //@Override
    eventListenerLoader() {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }

        const categoryButtons = this.container.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                window.location.href = `/TW_Dumitrascu_Ursache_war_exploded/properties?category=${category}`;
            });
        });

        const searchButton = this.container.querySelector('#search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchQuery = this.container.querySelector('#property-search').value;
                window.location.href = `/TW_Dumitrascu_Ursache_war_exploded/properties?search=${searchQuery}`;
            });
        }
    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            const categoryButtons = this.container.querySelectorAll('.category-btn');
            categoryButtons.forEach(button => {
                button.replaceWith(button.cloneNode(true));
            });

            const searchButton = this.container.querySelector('#search-button');
            if (searchButton) {
                searchButton.replaceWith(searchButton.cloneNode(true));
            }
        }
    }

    //@Override
    destroy() {
        this.eventListenerRemover();
        super.destroy();
    }

    //@Override
    render() {
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.container = container;

        this.dynamicallyLoadData();

        this.eventListenerLoader();
        console.log(`Template render loaded for ${this.constructor.name}:`, this.template);

        return container;
    }

    async dynamicallyLoadData() {
        try {
            console.log("Fetching property data...");
            const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/properties/top');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const properties = await response.json();
            console.log("Received properties:", properties);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const propertiesContainer = tempDiv.querySelector('#properties-container');
            if (propertiesContainer && properties.length > 0) {
                propertiesContainer.innerHTML = properties.map(property => `
                    <div class="property-card">
                        <h3>${property.title}</h3>
                        <div class="property-details">
                            <span class="property-price">${this.formatPrice(property.price)}</span>
                        </div>
                    </div>
                `).join('');
            } else if (propertiesContainer) {
                propertiesContainer.innerHTML = `
                    <div class="no-properties-message">
                        <i class="fas fa-home" style="font-size: 48px; color: var(--text-light); margin-bottom: 15px;"></i>
                        <p>No featured listings available at this moment.</p>
                        <p>Check back soon for new properties!</p>
                    </div>
                `;
            }

            this.setTemplate(tempDiv.innerHTML);

            if (this.container) {
                const propertiesContainerDOM = this.container.querySelector('#properties-container');
                if (propertiesContainerDOM) {
                    propertiesContainerDOM.innerHTML = propertiesContainer.innerHTML;
                }
            }

        } catch (error) {
            console.error('Error loading property data:', error);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.getTemplate();

            const propertiesContainer = tempDiv.querySelector('#properties-container');
            if (propertiesContainer) {
                propertiesContainer.innerHTML = `
                    <div class="no-properties-message">
                        <i class="fas fa-home" style="font-size: 48px; color: var(--text-light); margin-bottom: 15px;"></i>
                        <p>No featured listings available at this moment.</p>
                        <p>Check back soon for new properties!</p>
                    </div>
                `;
            }

            this.setTemplate(tempDiv.innerHTML);

            if (this.container) {
                const propertiesContainerDOM = this.container.querySelector('#properties-container');
                if (propertiesContainerDOM) {
                    propertiesContainerDOM.innerHTML = propertiesContainer.innerHTML;
                }
            }
        }
    }

    formatPrice(price) {
        return `€${price.toLocaleString('ro-RO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    }
}