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

        const sortSelect = this.container.querySelector('#sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.dynamicallyLoadData(sortSelect.value);
            });
        }

        this.setupFilterInputListeners();
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

        mainContent.parentNode.insertBefore(mapContainer, mainContent);

        if (window.L) {
            this.debouncedInitMap();
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

        this.addPropertiesToMap(this.properties);
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
        }
    }

    createMapPopupContent(property) {
        const popupContent = document.createElement('div');
        popupContent.className = 'map-info-window';

        const title = document.createElement('h3');
        title.textContent = property.title;
        title.className = 'map-title clickable';
        title.onclick = () => {
            console.log("Viewing property with ID:", property.propertyId);
            sessionStorage.setItem('selectedPropertyID', property.propertyId);

            this.router.safeNavigate('/property');
        };

        const details = document.createElement('p');
        details.textContent = `${property.rooms} rooms · ${property.bathrooms} baths · ${property.surfaceArea} m²`;

        const price = document.createElement('p');
        price.textContent = `${property.price} ${property.transactionType === 'rent' ? '€/month' : '€'}`;

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
        let filteredProperties = [...this.properties];

        const selectedCities = this.getSelectedCities();
        const selectedStates = this.getSelectedStates();

        this.filterConfig.fields.forEach(field => {
            const minValue = document.querySelector(`#${field.id}-min`)?.value;
            const maxValue = document.querySelector(`#${field.id}-max`)?.value;

            filteredProperties = this.applyRangeFilter(
                filteredProperties,
                field.property,
                minValue,
                maxValue,
                field.type
            );
        });

        if (selectedCities.length > 0) {
            filteredProperties = filteredProperties.filter(property =>
                selectedCities.includes(property.city)
            );
        }

        if (selectedStates.length > 0) {
            filteredProperties = filteredProperties.filter(property =>
                selectedStates.includes(property.state)
            );
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
        return `
            <div class="property-card" data-property-id="${property.propertyId}">
                <img class="photo" src=${formattedImageUrl}>
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

            this.properties = await response.json();

            this.sortProperties(sortOption);

            this.updateFilterRanges();

            const currentCitySelections = this.getSelectedCities();
            const currentStateSelections = this.getSelectedStates();
            const currentFilters = {};

            this.filterConfig.fields.forEach(field => {
                const minInput = this.container.querySelector(`#${field.id}-min`);
                const maxInput = this.container.querySelector(`#${field.id}-max`);

                currentFilters[`${field.id}-min`] = minInput?.value || '';
                currentFilters[`${field.id}-max`] = maxInput?.value || '';
            });

            await Promise.all([
                this.renderCityFilters(),
                this.renderStateFilters()
            ]);

            this.filterConfig.fields.forEach(field => {
                const minInput = this.container.querySelector(`#${field.id}-min`);
                const maxInput = this.container.querySelector(`#${field.id}-max`);

                if (minInput) minInput.value = currentFilters[`${field.id}-min`];
                if (maxInput) maxInput.value = currentFilters[`${field.id}-max`];
            });

            if (currentCitySelections.length > 0 || currentStateSelections.length > 0 ||
                Object.values(currentFilters).some(val => val !== '')) {

                this.applyFilters();
            } else {
                this.updatePropertiesDisplay(this.properties);
                this.updateMapWithFilteredProperties(this.properties);
            }

        } catch (error) {
            console.error('Error fetching properties:', error);
            propertiesGrid.innerHTML = '<div class="error-message">Failed to load properties. Please try again later.</div>';
        }
    }

    sortProperties(sortOption) {
        const sortingStrategies = {
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
}