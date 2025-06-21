import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { environment } from "../../environment.js";

export class FavoriteListingsComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.container = "";
        this.favoriteListings = [];
    }

    //@Override
    async init() {
        await super.init();
        await this.dynamicallyLoadData();
    }

    //@Override
    eventListenerLoader() {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }

        const viewButtons = this.container.querySelectorAll('.view-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', this.viewListing.bind(this));
        });

        const removeButtons = this.container.querySelectorAll('.remove-button');
        removeButtons.forEach(button => {
            button.addEventListener('click', this.removeListing.bind(this));
        });
    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            const viewButtons = this.container.querySelectorAll('.view-button');
            viewButtons.forEach(button => {
                button.removeEventListener('click', this.viewListing.bind(this));
            });

            const removeButtons = this.container.querySelectorAll('.remove-button');
            removeButtons.forEach(button => {
                button.removeEventListener('click', this.removeListing.bind(this));
            });
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
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.constructor.name}:`, this.container);

        return container;
    }

    async dynamicallyLoadData() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();

        await this.loadFavoriteListings(tempDiv);

        this.setTemplate(tempDiv.innerHTML);

        if (this.container) {
            this.eventListenerRemover();
            this.eventListenerLoader();
        }
    }

    async loadFavoriteListings(container) {
        try {
            const response = await fetch(`${environment.backendUrl}/TW_Dumitrascu_Ursache_war_exploded/api/favorites`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                }
            });

            if (response.status === 200) {
                this.favoriteListings = await response.json();

                const totalFavorites = container.querySelector('#total-favorites');
                totalFavorites.textContent = this.favoriteListings.length;

                const favoritesContainer = container.querySelector('#favorites-container');
                const noFavoritesMessage = container.querySelector('#no-favorites');

                favoritesContainer.innerHTML = '';

                if (this.favoriteListings.length === 0) {
                    noFavoritesMessage.style.display = 'block';
                    favoritesContainer.style.display = 'none';
                } else {
                    noFavoritesMessage.style.display = 'none';
                    favoritesContainer.style.display = 'grid';

                    this.favoriteListings.forEach(listing => {
                        const card = this.createPropertyCard(listing);
                        favoritesContainer.appendChild(card);
                    });
                }
            } else if (response.status === 401) {
                throw new Error("Please login to view your favorite listings.");
            } else {
                throw new Error("Failed to load favorite listings. Please try again later.");
            }
        } catch (error) {
            this.displayErrorMessage(container, error.message);
        }
    }

    createPropertyCard(listing) {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.dataset.id = listing.id;

        const creationDate = new Date(listing.dateAdded || new Date());
        const formattedDate = creationDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const propertyId = listing.propertyId || listing.id;

        card.innerHTML = `
        <div class="content">
            <div class="title-wrapper">
                <h3>${listing.title}</h3>
                <p class="creation-date">Added to favorites on: ${formattedDate}</p>
            </div>
        </div>
        <div class="property-actions">
            <a href="#" class="view-button" data-property-id="${propertyId}">View</a>
            <button class="remove-button" data-property-id="${propertyId}">Remove</button>
        </div>
    `;

        return card;
    }

    viewListing(event) {
        event.preventDefault();

        const propertyId = event.currentTarget.getAttribute('data-property-id');
        console.log("Viewing property with ID:", propertyId);

        if (!propertyId) {
            console.error("No property ID found on the view button");
            return;
        }

        sessionStorage.setItem('selectedPropertyId', propertyId);

        if (window.router) {
            window.router.safeNavigate('/property');
        } else {
            window.location.href = `/TW_Dumitrascu_Ursache_war_exploded/property?id=${propertyId}`;
        }
    }

    async removeListing(event) {
        const propertyId = event.currentTarget.getAttribute('data-property-id');

        try {
            const response = await fetch(`${environment.backendUrl}/TW_Dumitrascu_Ursache_war_exploded/api/favorites/${propertyId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                }
            });

            if (response.status === 204) {
                await this.loadFavoriteListings(this.container);

                const card = this.container.querySelector(`.property-card[data-id="${propertyId}"]`);
                if (card) {
                    card.remove();
                }

                const totalFavorites = this.container.querySelector('#total-favorites');
                if (totalFavorites) {
                    totalFavorites.textContent = this.favoriteListings.length;
                }

                const noFavoritesMessage = this.container.querySelector('#no-favorites');
                const favoritesContainer = this.container.querySelector('#favorites-container');
                if (this.favoriteListings.length === 0 && noFavoritesMessage && favoritesContainer) {
                    noFavoritesMessage.style.display = 'block';
                    favoritesContainer.style.display = 'none';
                }

                this.eventListenerRemover();
                this.eventListenerLoader();

            } else if (response.status === 401) {
                throw new Error("Please login to remove listings from favorites.");
            } else {
                throw new Error("Failed to remove listing from favorites. Please try again.");
            }
        } catch (error) {
            alert(error.message);
        }
    }

    displayErrorMessage(container, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '15px';
        errorDiv.style.marginBottom = '15px';
        errorDiv.style.backgroundColor = '#ffeeee';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.textAlign = 'center';
        errorDiv.textContent = message;

        container.querySelector('.favorites-stats').after(errorDiv);
    }
}