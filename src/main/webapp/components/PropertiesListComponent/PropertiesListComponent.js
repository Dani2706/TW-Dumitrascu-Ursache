import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import { router } from "../../js/app.js";

export class PropertiesListComponent extends AbstractComponent {
    constructor() {
        super();
        this.router = router;
        this.setClassName(this.constructor.name);
        this.container = "";
        this.properties = [];
        this.mapDebounceTimer = null;
        this.map = null;
        this.filterTimer = null;
        this.filterConfig = {
            fields: [
                {id: 'price', type: 'float', property: 'price'},
                {id: 'area', type: 'float', property: 'surfaceArea'},
                {id: 'bedrooms', type: 'int', property: 'rooms'},
                {id: 'bathrooms', type: 'float', property: 'bathrooms'},
                {id: 'floor', type: 'int', property: 'floor'},
                {id: 'year-built', type: 'int', property: 'yearBuilt'}
            ],
            locations: ['city', 'state']
        };
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

        this.setupCategoryCardListeners();
        this.addPropertyCardListeners();
        this.setupClearFiltersButton();
        this.setupSortSelect();
        this.setupFilterInputListeners();
    }

    setupSortSelect() {
        const sortSelect = this.container.querySelector('#sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortProperties(sortSelect.value);
                this.updatePropertiesDisplay(this.properties);
            });
        }
    }

    setupCategoryCardListeners() {
        const categoryCards = this.container.querySelectorAll('.category-card');

        categoryCards.forEach(card => {
            const categoryType = card.dataset.category;
            const buyButton = card.querySelector('.category-btn[data-type="buy"]');
            const rentButton = card.querySelector('.category-btn[data-type="rent"]');

            if (buyButton) {
                buyButton.addEventListener('click', () => {
                    this.navigateToFilteredProperties(categoryType, 'sell');
                });
            }

            if (rentButton) {
                rentButton.addEventListener('click', () => {
                    this.navigateToFilteredProperties(categoryType, 'rent');
                });
            }
        });
    }

    navigateToFilteredProperties(categoryType, transactionType) {
        const propertyType = this.getPropertyTypeParam(categoryType);
        sessionStorage.setItem('propertyType', propertyType);
        sessionStorage.setItem('transactionType', transactionType);

        this.router.safeNavigate('/properties-list')
    }

    setupFilterInputListeners() {
        const filterInputs = this.filterConfig.fields.flatMap(field =>
            [`#${field.id}-min`, `#${field.id}-max`]);

        filterInputs.forEach(selector => {
            const input = this.container.querySelector(selector);
            if (input) {
                input.addEventListener('input', this.debounceFilter.bind(this));
                input.addEventListener('change', this.applyFilters.bind(this));
            }
        });
    }

    debounceFilter() {
        clearTimeout(this.filterTimer);
        this.filterTimer = setTimeout(() => {
            this.applyFilters();
        }, 500);
    }

    getPropertyTypeParam(category) {
        const propertyTypeMap = {
            'flat': 'flat',
            'house': 'house',
            'land': 'land',
            'commercial': 'commercial'
        };

        return propertyTypeMap[category] || 'flat';
    }

    //@Override
    eventListenerRemover() {
        if (this.templateLoaded) {
            const elementsToClone = [
                '.category-dropdown-toggle',
                '.category-btn',
                '.property-card',
                '.view-details-btn',
                '#sort-select'
            ];

            elementsToClone.forEach(selector => {
                const elements = this.container.querySelectorAll(selector);
                elements.forEach(el => el.replaceWith(el.cloneNode(true)));
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

        this.setupCategoryDropdown();
        this.setupPropertyMap();
        this.setupPropertySearch();
        this.dynamicallyLoadData();
        this.eventListenerLoader();

        console.log(`Template render loaded for ${this.constructor.name}:`, this.template);

        return container;
    }

    setupCategoryDropdown() {
        const categorySection = this.container.querySelector('.category-section');
        if (!categorySection) {
            console.error('Category section not found');
            return;
        }

        const dropdownToggle = document.createElement('div');
        dropdownToggle.className = 'category-dropdown-toggle';
        dropdownToggle.innerHTML = '<span>Change the category</span><i class="fas fa-chevron-down"></i>';

        categorySection.parentNode.insertBefore(dropdownToggle, categorySection);
        categorySection.classList.add('collapsed');

        dropdownToggle.addEventListener('click', (event) => {
            event.preventDefault();
            categorySection.classList.toggle('collapsed');
            dropdownToggle.classList.toggle('active');

            const icon = dropdownToggle.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    }

    setupPropertyMap() {
        const mainContent = this.container.querySelector('.main-content');
        const mapContainer = document.createElement('div');
        mapContainer.id = 'properties-map';
        mapContainer.className = 'properties-map-container';

        const mapControls = document.createElement('div');
        mapControls.className = 'map-controls';
        mapControls.style.display = 'none';
        mapContainer.appendChild(mapControls);

        const drawButton = document.createElement('button');
        drawButton.className = 'map-control-btn draw-btn';
        drawButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        drawButton.title = 'Draw area to filter properties';
        mapControls.appendChild(drawButton);

        const eraseButton = document.createElement('button');
        eraseButton.className = 'map-control-btn erase-btn';
        eraseButton.innerHTML = '<i class="fas fa-eraser"></i>';
        eraseButton.title = 'Clear drawn area';
        eraseButton.style.display = 'none';
        mapControls.appendChild(eraseButton);

        const instructionMsg = document.createElement('div');
        instructionMsg.className = 'map-instruction-msg';
        instructionMsg.textContent = 'Draw 4 points to narrow down the area where you\'re searching for properties.';
        instructionMsg.style.display = 'none';
        mapContainer.appendChild(instructionMsg);

        mainContent.parentNode.insertBefore(mapContainer, mainContent);

        if (window.L) {
            this.debouncedInitMap();

            drawButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.startDrawingMode(event);
            });
            eraseButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.clearDrawnArea();
            });
        }
    }

    initMap() {
        if (!this.properties?.length || !document.getElementById('properties-map') || !window.L) return;

        if (this.map) {
            this.map.remove();
        }

        this.map = L.map('properties-map').setView([37.0902, -95.7129], 4); // Default to USA

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.drawingMode = false;
        this.drawnPoints = [];
        this.drawnPolygon = null;
        this.markers = [];

        this.addPropertiesToMap(this.properties);
    }

    startDrawingMode() {
        const drawButton = this.container.querySelector('.draw-btn');
        const eraseButton = this.container.querySelector('.erase-btn');
        const instructionMsg = this.container.querySelector('.map-instruction-msg');

        event.stopPropagation();

        this.clearDrawnArea(false);

        instructionMsg.style.display = 'block';

        drawButton.classList.add('active');
        this.drawingMode = true;
        this.drawnPoints = [];

        this.mapClickHandler = (e) => this.handleMapClick(e);
        this.map.on('click', this.mapClickHandler);
    }

    handleMapClick(e) {
        if (!this.drawingMode) return;

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        this.drawnPoints.push([lat, lng]);

        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'drawing-point-marker',
                iconSize: [12, 12]
            })
        }).addTo(this.map);

        this.markers.push(marker);

        if (this.drawnPoints.length === 4) {
            this.completePolygon();
        }
    }

    completePolygon() {
        const drawButton = this.container.querySelector('.draw-btn');
        const eraseButton = this.container.querySelector('.erase-btn');
        const instructionMsg = this.container.querySelector('.map-instruction-msg');

        instructionMsg.style.display = 'none';

        this.drawnPolygon = L.polygon(this.drawnPoints, {
            color: '#3498db',
            fillColor: '#3498db',
            fillOpacity: 0.2,
            weight: 2
        }).addTo(this.map);

        eraseButton.style.display = 'block';

        drawButton.classList.remove('active');
        this.drawingMode = false;

        this.map.off('click', this.mapClickHandler);

        this.filterPropertiesByPolygon();
    }

    clearDrawnArea(resetFilter = true) {
        const eraseButton = this.container.querySelector('.erase-btn');
        const instructionMsg = this.container.querySelector('.map-instruction-msg');

        instructionMsg.style.display = 'none';

        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];

        if (this.drawnPolygon) {
            this.map.removeLayer(this.drawnPolygon);
            this.drawnPolygon = null;
        }

        this.drawingMode = false;
        this.drawnPoints = [];

        eraseButton.style.display = 'none';

        if (resetFilter) {
            this.updatePropertiesDisplay(this.properties);
            this.updateMapWithFilteredProperties(this.properties);
        }

        this.map.off('click', this.mapClickHandler);
    }

    filterPropertiesByPolygon() {
        if (!this.drawnPolygon) return;

        const filteredProperties = this.properties.filter(property => {
            if (!property.latitude || !property.longitude) return false;

            const point = L.latLng(property.latitude, property.longitude);
            return this.drawnPolygon.getBounds().contains(point);
        });

        this.updatePropertiesDisplay(filteredProperties);
        this.updateMapWithFilteredProperties(filteredProperties);
    }

    addPropertiesToMap(properties) {
        const bounds = L.latLngBounds();
        let hasValidCoordinates = false;

        properties.forEach(property => {
            if (!property.latitude || !property.longitude) return;

            hasValidCoordinates = true;
            const marker = L.marker([property.latitude, property.longitude]).addTo(this.map);
            marker.bindPopup(this.createMapPopupContent(property));
            bounds.extend([property.latitude, property.longitude]);
        });

        if (hasValidCoordinates) {
            this.map.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 15
            });

            const mapControls = this.container.querySelector('.map-controls');
            if (mapControls) {
                mapControls.style.display = 'flex';
            }
        }
    }

    createMapPopupContent(property) {
        const popupContent = document.createElement('div');
        popupContent.className = 'map-info-window';

        const formattedPrice = property.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        const title = document.createElement('h3');
        title.textContent = property.title;
        title.className = 'map-title clickable';
        title.onclick = () => {
            console.log("Viewing property with ID:", property.propertyId);
            sessionStorage.setItem('selectedPropertyId', property.propertyId);

            this.router.safeNavigate('/property');
        };

        const details = document.createElement('p');
        details.textContent = `${property.rooms} rooms · ${property.bathrooms} baths · ${property.surfaceArea} m²`;

        const price = document.createElement('p');
        price.textContent = `${formattedPrice} ${property.transactionType === 'rent' ? '€/month' : '€'}`;

        popupContent.append(title, details, price);
        return popupContent;
    }

    debouncedInitMap() {
        clearTimeout(this.mapDebounceTimer);
        this.mapDebounceTimer = setTimeout(() => this.initMap(), 1000);
    }

    async loadFilterLocations(type = 'city') {
        try {
            const filterParams = new URLSearchParams({type});

            this.filterConfig.fields.forEach(field => {
                const minValue = document.querySelector(`#${field.id}-min`)?.value;
                const maxValue = document.querySelector(`#${field.id}-max`)?.value;

                if (minValue) filterParams.append(`min${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`, minValue);
                if (maxValue) filterParams.append(`max${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`, maxValue);
            });

            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/getFilteredLocations?${filterParams}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error loading ${type} filters:`, error);
            return [];
        }
    }

    async renderLocationFilters(locationType, locations, selectedLocations = null) {
        const filterContainer = this.container.querySelector(`.${locationType}-filter-container`);
        if (!filterContainer) return;

        if (selectedLocations === null) {
            if (locationType === 'city') {
                selectedLocations = this.getSelectedCities();
            } else if (locationType === 'state') {
                selectedLocations = this.getSelectedStates();
            }
        }

        filterContainer.innerHTML = `<div class="loading-filters">Loading ${locationType}s...</div>`;

        try {
            if (!locations?.length) {
                filterContainer.innerHTML = `<div class="no-results">No ${locationType}s found</div>`;
                return;
            }

            let html = '<div class="filter-options">';

            locations.slice(0, 3).forEach(location => {
                const isChecked = selectedLocations.includes(location) ? 'checked' : '';
                html += this.createLocationFilterOption(locationType, location, isChecked);
            });

            if (locations.length > 3) {
                html += `<div class="expanded-${locationType}s" style="display: none;">`;

                locations.slice(3).forEach(location => {
                    const isChecked = selectedLocations.includes(location) ? 'checked' : '';
                    html += this.createLocationFilterOption(locationType, location, isChecked);
                });

                html += `</div>
                    <div class="show-more-container">
                        <button class="show-more-btn">Show More</button>
                    </div>`;
            }

            html += '</div>';
            filterContainer.innerHTML = html;

            this.setupShowMoreButton(filterContainer, locationType);

            const checkboxes = filterContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    setTimeout(() => this.applyFilters(), 0);
                });
            });
        } catch (error) {
            console.error(`Error rendering ${locationType} filters:`, error);
            filterContainer.innerHTML = `<div class="error-message">Failed to load ${locationType}s</div>`;
        }
    }

    createLocationFilterOption(locationType, location, isChecked) {
        return `
            <div class="filter-option">
                <input type="checkbox" id="${locationType}-${location}" name="${locationType}" value="${location}" ${isChecked}>
                <label for="${locationType}-${location}">${location}</label>
            </div>
        `;
    }

    setupShowMoreButton(filterContainer, locationType) {
        const showMoreBtn = filterContainer.querySelector('.show-more-btn');
        if (!showMoreBtn) return;

        showMoreBtn.addEventListener('click', () => {
            const expandedSection = filterContainer.querySelector(`.expanded-${locationType}s`);
            const isExpanded = expandedSection.style.display !== 'none';

            expandedSection.style.display = isExpanded ? 'none' : 'block';
            showMoreBtn.textContent = isExpanded ? 'Show More' : 'Show Less';
        });
    }

    async renderCityFilters() {
        const cities = await this.loadFilterLocations('city');
        this.cities = cities;
        this.renderLocationFilters('city', cities);
    }

    async renderStateFilters() {
        const states = await this.loadFilterLocations('state');
        this.states = states;
        this.renderLocationFilters('state', states);
    }

    getSelectedCities() {
        return Array.from(document.querySelectorAll('input[type="checkbox"][name="city"]:checked'))
            .map(cb => cb.value);
    }

    getSelectedStates() {
        return Array.from(document.querySelectorAll('input[type="checkbox"][name="state"]:checked'))
            .map(cb => cb.value);
    }

    applyFilters() {
        const searchText = this.container.querySelector('#property-search')?.value.trim().toLowerCase() || '';

        let filteredProperties;
        if (searchText) {
            filteredProperties = this.properties.filter(property =>
                property.title.toLowerCase().includes(searchText) ||
                property.city.toLowerCase().includes(searchText) ||
                property.country.toLowerCase().includes(searchText)
            );
        } else {
            filteredProperties = [...this.properties];
        }

        filteredProperties = this.applyCurrentFilters(filteredProperties);

        if (this.drawnPolygon) {
            filteredProperties = filteredProperties.filter(property => {
                if (!property.latitude || !property.longitude) return false;
                const point = L.latLng(property.latitude, property.longitude);
                return this.drawnPolygon.getBounds().contains(point);
            });
        }

        this.updatePropertiesDisplay(filteredProperties);
        this.updateMapWithFilteredProperties(filteredProperties);
    }

    applyRangeFilter(properties, property, minValue, maxValue, type) {
        if (!properties?.length) return [];

        let result = properties;

        if (minValue && minValue.trim() !== '') {
            const value = type === 'int' ? parseInt(minValue) : parseFloat(minValue);
            result = result.filter(p => p[property] >= value);
        }

        if (maxValue && maxValue.trim() !== '') {
            const value = type === 'int' ? parseInt(maxValue) : parseFloat(maxValue);
            result = result.filter(p => p[property] <= value);
        }

        return result;
    }

    updateMapWithFilteredProperties(filteredProperties) {
        if (!this.map) return;

        this.map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });

        this.addPropertiesToMap(filteredProperties);
    }

    updatePropertiesDisplay(properties) {
        const propertiesGrid = this.container.querySelector('.properties-grid');
        if (!propertiesGrid) return;

        const propertiesCountSpan = this.container.querySelector('.properties-count');
        if (propertiesCountSpan) {
            propertiesCountSpan.textContent = `(${properties.length} listings)`;
        }

        if (properties.length === 0) {
            propertiesGrid.innerHTML = '<div class="no-properties">No properties match your filters</div>';
            return;
        }

        propertiesGrid.innerHTML = properties.map(property => this.createPropertyCardHTML(property)).join('');

        this.addPropertyCardListeners();
    }

    createPropertyCardHTML(property) {
        const formattedImageUrl = `data:image/png;base64,${property.mainPhoto}`;
        const isFavorited = property.isFavorite ? 'favorited' : '';
        const formattedPrice = property.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

            return `
            <div class="property-card" data-id="${property.propertyId}">
                <img class="photo" src=${formattedImageUrl}>
                <button class="favorite-btn ${isFavorited}" data-id="${property.propertyId}">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="property-details">
                    <h3>${property.title}</h3>
                    <div class="property-location">${property.city}, ${property.state}</div>
                    <div class="property-features">
                        <span>${property.rooms} rooms</span>
                        <span>${property.bathrooms} baths</span>
                        <span>${property.surfaceArea} m²</span>
                    </div>
                    <div class="property-action-row">
                        <div class="property-price">${formattedPrice} ${property.transactionType === 'rent' ? '€/month' : '€'}</div>
                        <button class="view-details-btn" data-id="${property.propertyId}">View Details</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    addPropertyCardListeners() {
        const propertyCards = this.container.querySelectorAll('.property-card');
        propertyCards.forEach(card => {
            const viewDetailsBtn = card.querySelector('.view-details-btn');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', () => {
                    const propertyId = viewDetailsBtn.getAttribute('data-id');
                    console.log('PropertiesListings' + propertyId);
                    sessionStorage.setItem('selectedPropertyId', propertyId);
                    router.safeNavigate('/property');
                });
            }

            const favoriteBtn = card.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavorite(favoriteBtn);
                });
            }
        });
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

    async dynamicallyLoadData(sortOption = 'newest') {
        const propertiesGrid = this.container.querySelector('.properties-grid');
        if (!propertiesGrid) return;

        propertiesGrid.innerHTML = '<div class="loading">Loading properties...</div>';

        const propertyType = sessionStorage.getItem('propertyType') || 'flat';
        const transactionType = sessionStorage.getItem('transactionType');

        try {
            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/properties?propertyType=${propertyType}&transactionType=${transactionType}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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

            if (sortOption) {
                this.sortProperties(sortOption);
            }

            this.updatePropertiesDisplay(this.properties);
            this.updateFilterRanges();
            this.renderCityFilters();
            this.renderStateFilters();
            this.debouncedInitMap();

        } catch (error) {
            console.error('Error loading properties:', error);
            propertiesGrid.innerHTML = '<div class="error-message">Failed to load properties. Please try again later.</div>';
        }
    }

    sortProperties(sortOption) {
        const sortingStrategies = {
            'newest': (a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0),
            'oldest': (a, b) => new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0),
            'price-asc': (a, b) => a.price - b.price,
            'price-desc': (a, b) => b.price - a.price,
            'area-asc': (a, b) => a.surfaceArea - b.surfaceArea,
            'area-desc': (a, b) => b.surfaceArea - a.surfaceArea
        };

        if (sortingStrategies[sortOption]) {
            this.properties.sort(sortingStrategies[sortOption]);
        }
    }

    updateFilterRanges() {
        if (!this.properties?.length) return;

        const ranges = {};

        this.filterConfig.fields.forEach(field => {
            const values = this.properties.map(p => p[field.property]);
            ranges[field.id] = {
                min: Math.min(...values),
                max: Math.max(...values)
            };

            const minInput = this.container.querySelector(`#${field.id}-min`);
            const maxInput = this.container.querySelector(`#${field.id}-max`);

            if (minInput) {
                minInput.placeholder = field.type === 'float' ?
                    ranges[field.id].min.toLocaleString() :
                    ranges[field.id].min.toString();
            }

            if (maxInput) {
                maxInput.placeholder = field.type === 'float' ?
                    ranges[field.id].max.toLocaleString() :
                    ranges[field.id].max.toString();
            }
        });

        this.filterRanges = ranges;
    }

    setupClearFiltersButton() {
        const clearFiltersBtn = this.container.querySelector('.clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    clearAllFilters() {
        this.filterConfig.fields.forEach(field => {
            const minInput = this.container.querySelector(`#${field.id}-min`);
            const maxInput = this.container.querySelector(`#${field.id}-max`);

            if (minInput) minInput.value = '';
            if (maxInput) maxInput.value = '';
        });

        const cityCheckboxes = this.container.querySelectorAll('input[type="checkbox"][name="city"]');
        cityCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        const stateCheckboxes = this.container.querySelectorAll('input[type="checkbox"][name="state"]');
        stateCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        this.updatePropertiesDisplay(this.properties);
        this.updateMapWithFilteredProperties(this.properties);

        this.renderCityFilters();
        this.renderStateFilters();
    }


    setupPropertySearch() {
        const propertiesHeader = this.container.querySelector('.properties-header');
        if (!propertiesHeader) return;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'property-search-container';
        searchContainer.innerHTML = `
            <div class="property-search-wrapper">
                <input type="text" id="property-search" placeholder="Search properties...">
                <button class="clear-search-btn" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
                <i class="fas fa-search search-icon"></i>
            </div>
        `;

        propertiesHeader.insertAdjacentElement('afterend', searchContainer);

        const searchInput = searchContainer.querySelector('#property-search');
        const clearButton = searchContainer.querySelector('.clear-search-btn');

        searchInput.addEventListener('input', () => {
            const searchText = searchInput.value.trim().toLowerCase();
            clearButton.style.display = searchText ? 'block' : 'none';
            this.filterPropertiesBySearch(searchText);
        });

        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.style.display = 'none';
            this.filterPropertiesBySearch('');
        });
    }

    filterPropertiesBySearch(searchText) {
        let filteredProperties;

        if (searchText === '') {
            filteredProperties = [...this.properties];
        } else {
            filteredProperties = this.properties.filter(property =>
                property.title.toLowerCase().includes(searchText) ||
                property.city.toLowerCase().includes(searchText) ||
                property.country.toLowerCase().includes(searchText)
            );
        }

        filteredProperties = this.applyCurrentFilters(filteredProperties);
        this.updatePropertiesDisplay(filteredProperties);
        this.updateMapWithFilteredProperties(filteredProperties);
    }

    applyCurrentFilters(properties) {
        const selectedCities = this.getSelectedCities();
        const selectedStates = this.getSelectedStates();
        let result = [...properties];

        this.filterConfig.fields.forEach(field => {
            const minValue = document.querySelector(`#${field.id}-min`)?.value;
            const maxValue = document.querySelector(`#${field.id}-max`)?.value;

            result = this.applyRangeFilter(
                result,
                field.property,
                minValue,
                maxValue,
                field.type
            );
        });

        if (selectedCities.length > 0) {
            result = result.filter(property =>
                selectedCities.includes(property.city)
            );
        }

        if (selectedStates.length > 0) {
            result = result.filter(property =>
                selectedStates.includes(property.state)
            );
        }

        return result;
    }
}