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
        if (sessionStorage.getItem("isAdmin") === "true"){
            this.router.safeNavigate("/admin/PropertyDashboard")
            return;
        }
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
            let properties = await response.json();

            const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
            let userFavorites = [];

            if (isLoggedIn) {
                try {
                    const favoritesResponse = await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/favorites', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + sessionStorage.getItem('jwt')
                        }
                    });

                    if (favoritesResponse.ok) {
                        userFavorites = await favoritesResponse.json();
                    }
                } catch (e) {
                    console.error('Error fetching user favorites:', e);
                    userFavorites = [];
                }
            }

            this.properties = properties.map(property => {
                return {
                    ...property,
                    isFavorite: userFavorites.some(fav => fav.propertyId === property.propertyId)
                };
            });

            this.updatePropertiesDisplay(this.properties);
        } catch (error) {
            console.error('Error loading property data:', error);
            this.displayNoPropertiesMessage();
        }
    }

    async toggleFavorite(button) {
        const propertyId = button.getAttribute('data-id');
        if (!propertyId) {
            console.error('No property ID found on favorite button');
            return;
        }

        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            this.showNotificationPopup('Please log in to add properties to favorites');
            return;
        }

        const isFavorited = button.classList.contains('favorited');

        try {
            const method = isFavorited ? 'DELETE' : 'POST';
            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/favorites/${propertyId}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('jwt')
                }
            });

            if (response.ok) {
                button.classList.toggle('favorited');

                const property = this.properties.find(p => p.propertyId == propertyId);
                if (property) {
                    property.isFavorite = !isFavorited;
                }
            } else {
                console.error('Failed to update favorite status');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }

    showNotificationPopup(message) {
        const existingPopup = document.querySelector('.notification-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'notification-popup-overlay';

        const popup = document.createElement('div');
        popup.className = 'notification-popup';

        const popupContent = document.createElement('div');
        popupContent.className = 'notification-content';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';

        const messageEl = document.createElement('p');
        messageEl.textContent = message;

        popupContent.appendChild(messageEl);
        popup.appendChild(closeBtn);
        popup.appendChild(popupContent);
        popupOverlay.appendChild(popup);
        document.body.appendChild(popupOverlay);

        setTimeout(() => {
            popup.classList.add('show');
        }, 10);

        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => {
                popupOverlay.remove();
            }, 300);
        });

        setTimeout(() => {
            if (document.body.contains(popupOverlay)) {
                popup.classList.remove('show');
                setTimeout(() => {
                    popupOverlay.remove();
                }, 300);
            }
        }, 5000);
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
        const isFavorited = property.isFavorite ? 'favorited' : '';

        return `
        <div class="property-card" data-property-id="${property.propertyId}">
            <button class="favorite-btn ${isFavorited}" data-id="${property.propertyId}">
                <i class="fas fa-heart"></i>
            </button>
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

            const favoriteBtn = card.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavorite(favoriteBtn);
                });
            }
        });
    }
}