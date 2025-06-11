import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class PropertiesListComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.container = "";
        this.properties = [];
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

        const categoryCards = this.container.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            const categoryType = card.dataset.category;
            const buyButton = card.querySelector('.category-btn[data-type="buy"]');
            const rentButton = card.querySelector('.category-btn[data-type="rent"]');

            if (buyButton) {
                buyButton.addEventListener('click', () => {
                    const propertyType = this.getPropertyTypeParam(categoryType);
                    sessionStorage.setItem('propertyType', propertyType);
                    sessionStorage.setItem('transactionType', 'sell');

                    window.location.href = 'properties-list?filterCriteria=$categoryType';
                });
            }

            if (rentButton) {
                rentButton.addEventListener('click', () => {
                    const propertyType = this.getPropertyTypeParam(categoryType);
                    sessionStorage.setItem('propertyType', propertyType);
                    sessionStorage.setItem('transactionType', 'rent');

                    window.location.href = 'properties-list?filterCriteria=$categoryType';
                });
            }
        });

        const propertyCards = this.container.querySelectorAll('.property-card');
        propertyCards.forEach(card => {
            const viewDetailsBtn = card.querySelector('.view-details-btn');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const propertyId = card.dataset.propertyId;
                    sessionStorage.setItem('selectedPropertyId', propertyId);
                    window.location.href = `property?id=$propertyId`;
                });
            }

            card.addEventListener('click', () => {
                const propertyId = card.dataset.propertyId;
                sessionStorage.setItem('selectedPropertyId', propertyId);
                window.location.href = `property?id=$propertyId`;
            });
        });

        const sortSelect = this.container.querySelector('#sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const selectedSort = sortSelect.value;
                this.dynamicallyLoadData(selectedSort);
            });
        }
    }

    getPropertyTypeParam(category) {
        switch(category) {
            case 'flat': return 'flat';
            case 'house': return 'house';
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

            const propertyCards = this.container.querySelectorAll('.property-card');
            propertyCards.forEach(card => {
                const viewDetailsBtn = card.querySelector('.view-details-btn');
                if (viewDetailsBtn) {
                    viewDetailsBtn.replaceWith(viewDetailsBtn.cloneNode(true));
                }
                card.replaceWith(card.cloneNode(true));
            });

            const sortSelect = this.container.querySelector('#sort-select');
            if (sortSelect) {
                sortSelect.replaceWith(sortSelect.cloneNode(true));
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

    async dynamicallyLoadData(sortOption = 'newest') {
        const propertiesGrid = this.container.querySelector('.properties-grid');
        if (!propertiesGrid) return;

        propertiesGrid.innerHTML = '<div class="loading">Loading properties...</div>';

        const propertyType = sessionStorage.getItem('propertyType') || 'flat';
        const transactionType = sessionStorage.getItem('transactionType');

        try {
            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/all-properties?filterCriteria=${propertyType}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let properties = await response.json();

            if (transactionType) {
                properties = properties.filter(property => {
                    console.log(`Property ${property.propertyId} transaction type: ${property.transactionType}`);
                    return property.transactionType === transactionType;
                });
                console.log(`Filtered to ${properties.length} properties with transaction type: ${transactionType}`);
            }

            this.properties = properties;

            const propertiesCountSpan = this.container.querySelector('.properties-count');
            if (propertiesCountSpan) {
                propertiesCountSpan.textContent = `(${this.properties.length} listings)`;
            }

            if (this.properties.length === 0) {
                propertiesGrid.innerHTML = '<div class="no-properties">No apartments found</div>';
                return;
            }

            if (sortOption === 'price-asc') {
                this.properties.sort((a, b) => a.price - b.price);
            } else if (sortOption === 'price-desc') {
                this.properties.sort((a, b) => b.price - a.price);
            } else if (sortOption === 'area-asc') {
                this.properties.sort((a, b) => a.surfaceArea - b.surfaceArea);
            } else if (sortOption === 'area-desc') {
                this.properties.sort((a, b) => b.surfaceArea - a.surfaceArea);
            }

            let propertiesHTML = '';
            this.properties.forEach(property => {
                propertiesHTML += `
                    <div class="property-card" data-property-id="${property.propertyId}">
                        <!-- <div class="property-image"> -->
                        <!--    <img src="assets/images/apartment-placeholder.jpg" alt="${property.title}"> -->
                        <!-- </div> -->
                        <div class="property-details">
                            <h3>${property.title}</h3>
                            <p class="property-location">${property.city}, ${property.country}</p>
                            <div class="property-features">
                                <span>${property.rooms} rooms</span>
                                <span>${property.bathrooms} bathrooms</span>
                                <span>${property.surfaceArea} m²</span>
                            </div>
                            
                            <div class="property-action-row">
                                <div class="property-price">$${property.price.toLocaleString()}</div>
                                <button class="view-details-btn">View Details</button>
                            </div>
                            
                        </div>
                    </div>
                `;
            });

            propertiesGrid.innerHTML = propertiesHTML;
            this.eventListenerLoader();

        } catch (error) {
            console.error('Error fetching properties:', error);
            propertiesGrid.innerHTML = '<div class="error-message">Failed to load properties. Please try again later.</div>';

            const propertiesCountSpan = this.container.querySelector('.properties-count');
            if (propertiesCountSpan) {
                propertiesCountSpan.textContent = '(0 listings)';
            }
        }
    }
}