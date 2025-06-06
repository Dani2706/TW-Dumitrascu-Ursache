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

        // Add event listeners for category cards
        const categoryCards = this.container.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            const categoryType = card.dataset.category;
            const buyButton = card.querySelector('.category-btn[data-type="buy"]');
            const rentButton = card.querySelector('.category-btn[data-type="rent"]');

            if (buyButton) {
                buyButton.addEventListener('click', () => {
                    // Store the property type in sessionStorage
                    const propertyType = this.getPropertyTypeParam(categoryType);
                    sessionStorage.setItem('propertyType', propertyType);
                    sessionStorage.setItem('transactionType', 'sell');

                    // Redirect to properties page
                    window.location.href = 'properties-list?filterCriteria=$categoryType';
                });
            }

            if (rentButton) {
                rentButton.addEventListener('click', () => {
                    // Store the property type in sessionStorage
                    const propertyType = this.getPropertyTypeParam(categoryType);
                    sessionStorage.setItem('propertyType', propertyType);
                    sessionStorage.setItem('transactionType', 'rent');
                    // Redirect to properties page
                    window.location.href = 'properties-list?filterCriteria=$categoryType';
                });
            }
        });

        const searchButton = this.container.querySelector('#search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchQuery = this.container.querySelector('#property-search').value;
                sessionStorage.setItem('searchQuery', searchQuery);
                window.location.href = '#/properties';
            });
        }
    }

    // Helper method to convert category to API parameter
    getPropertyTypeParam(category) {
        switch(category) {
            case 'apartments': return 'flat';
            case 'houses': return 'house';
            case 'land': return 'land';
            case 'commercial': return 'commercial';
            default: return 'flat';
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