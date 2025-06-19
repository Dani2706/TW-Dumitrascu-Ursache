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
                    //window.location.href = `property?id=$propertyId`;
                    this.router.safeNavigate("/property");
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

        const rangeInputs = this.container.querySelectorAll('.range-input input[type="number"]');
        rangeInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.applyFilters();
            });

            input.addEventListener('input', this.debounceFilter.bind(this));
        });

        const filterInputs = [
            '#price-min', '#price-max',
            '#area-min', '#area-max',
            '#bedrooms-min', '#bedrooms-max',
            '#bathrooms-min', '#bathrooms-max',
            '#floor-min', '#floor-max',
            '#year-built-min', '#year-built-max'
        ];

        filterInputs.forEach(selector => {
            const input = this.container.querySelector(selector);
            if (input) {
                input.addEventListener('input', this.debounceFilter.bind(this));
                input.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });

        this.addPropertyCardListeners();
    }

    debounceFilter() {
        clearTimeout(this.filterTimer);
        this.filterTimer = setTimeout(() => {
            this.applyFilters();
        }, 500);
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
            const dropdownToggle = this.container.querySelector('.category-dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.replaceWith(dropdownToggle.cloneNode(true));
            }

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

        console.log('Setting up category dropdown');

        const dropdownToggle = document.createElement('div');
        dropdownToggle.className = 'category-dropdown-toggle';
        dropdownToggle.innerHTML = '<span>Change the category</span><i class="fas fa-chevron-down"></i>';

        categorySection.parentNode.insertBefore(dropdownToggle, categorySection);

        categorySection.classList.add('collapsed');

        dropdownToggle.addEventListener('click', (event) => {
            console.log('Dropdown clicked');
            event.preventDefault();
            categorySection.classList.toggle('collapsed');
            dropdownToggle.classList.toggle('active');

            const icon = dropdownToggle.querySelector('i');
            if (icon.classList.contains('fa-chevron-down')) {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        });

        console.log('Category dropdown setup complete');
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
        if (!this.properties || this.properties.length === 0) return;

        const mapElement = document.getElementById('properties-map');
        if (!mapElement || !window.L) return;

        if (this.map) {
            this.map.remove();
        }

        this.map = L.map('properties-map').setView([37.0902, -95.7129], 4); // Default to USA

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        const bounds = L.latLngBounds();
        let hasValidCoordinates = false;

        this.properties.forEach(property => {
            if (property.latitude && property.longitude) {
                hasValidCoordinates = true;
                const marker = L.marker([property.latitude, property.longitude]).addTo(this.map);

                const popupContent = document.createElement('div');
                popupContent.className = 'map-info-window';

                const title = document.createElement('h3');
                title.textContent = property.title;
                title.className = 'map-title clickable';
                title.onclick = (e) => {
                    console.log("Viewing property with ID:", property.propertyId);
                    sessionStorage.setItem('selectedPropertyID', property.propertyId);

                    if (this.router) {
                        this.router.safeNavigate('/property');
                    } else { // Fallback if router is not working
                        console.error('Router not available for navigation');
                        window.location.href = `/TW_Dumitrascu_Ursache_war_exploded/property`;
                    }
                };

                const details = document.createElement('p');
                details.textContent = `${property.rooms} rooms · ${property.bathrooms} baths · ${property.surfaceArea} m²`;

                const price = document.createElement('p');
                price.textContent = `${property.price} ${property.transactionType === 'rent' ? '€/month' : '€'}`;

                popupContent.appendChild(title);
                popupContent.appendChild(details);
                popupContent.appendChild(price);

                marker.bindPopup(popupContent);

                bounds.extend([property.latitude, property.longitude]);
            }
        });

        if (hasValidCoordinates) {
            this.map.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 15
            });
        }
    }

    debouncedInitMap() {
        if (this.mapDebounceTimer) {
            clearTimeout(this.mapDebounceTimer);
        }

        this.mapDebounceTimer = setTimeout(() => {
            this.initMap();
        }, 1000);
    }

    async loadFilterLocations(type = 'city', limit = 3) {
        try {
            const minPrice = document.querySelector('#price-min')?.value || '';
            const maxPrice = document.querySelector('#price-max')?.value || '';
            const minArea = document.querySelector('#area-min')?.value || '';
            const maxArea = document.querySelector('#area-max')?.value || '';
            const minBedrooms = document.querySelector('#bedrooms-min')?.value || '';
            const maxBedrooms = document.querySelector('#bedrooms-max')?.value || '';
            const minBathrooms = document.querySelector('#bathrooms-min')?.value || '';
            const maxBathrooms = document.querySelector('#bathrooms-max')?.value || '';
            const minFloor = document.querySelector('#floor-min')?.value || '';
            const maxFloor = document.querySelector('#floor-max')?.value || '';
            const minYearBuilt = document.querySelector('#year-built-min')?.value || '';
            const maxYearBuilt = document.querySelector('#year-built-max')?.value || '';


            const params = new URLSearchParams({
                type: type
            });

            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (minArea) params.append('minArea', minArea);
            if (maxArea) params.append('maxArea', maxArea);
            if (minBedrooms) params.append('minBedrooms', minBedrooms);
            if (maxBedrooms) params.append('maxBedrooms', maxBedrooms);
            if (minBathrooms) params.append('minBathrooms', minBathrooms);
            if (maxBathrooms) params.append('maxBathrooms', maxBathrooms);
            if (minFloor) params.append('minFloor', minFloor);
            if (maxFloor) params.append('maxFloor', maxFloor);
            if (minYearBuilt) params.append('minYearBuilt', minYearBuilt);
            if (maxYearBuilt) params.append('maxYearBuilt', maxYearBuilt);

            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/getFilteredLocations?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const locations = await response.json();
            return locations;
        } catch (error) {
            console.error(`Error loading ${type} filters:`, error);
            return [];
        }
    }

    async renderCityFilters() {
        const cityFilterContainer = this.container.querySelector('.city-filter-container');
        if (!cityFilterContainer) return;

        cityFilterContainer.innerHTML = '<div class="loading-filters">Loading cities...</div>';

        try {
            const cities = await this.loadFilterLocations('city');
            this.cities = cities;

            if (cities.length === 0) {
                cityFilterContainer.innerHTML = '<div class="no-results">No cities found</div>';
                return;
            }

            let html = '<div class="filter-options">';

            cities.slice(0, 3).forEach(city => {
                html += `
                <div class="filter-option">
                    <input type="checkbox" id="city-${city}" name="city" value="${city}">
                    <label for="city-${city}">${city}</label>
                </div>
            `;
            });

            if (cities.length > 3) {
                html += `<div class="expanded-cities" style="display: none;">`;

                cities.slice(3).forEach(city => {
                    html += `
                    <div class="filter-option">
                        <input type="checkbox" id="city-${city}" name="city" value="${city}">
                        <label for="city-${city}">${city}</label>
                    </div>
                `;
                });

                html += `</div>`;

                html += `
                <div class="show-more-container">
                    <button class="show-more-btn">Show More</button>
                </div>
            `;
            }

            html += '</div>';
            cityFilterContainer.innerHTML = html;

            const showMoreBtn = cityFilterContainer.querySelector('.show-more-btn');
            if (showMoreBtn) {
                showMoreBtn.addEventListener('click', () => {
                    const expandedCities = cityFilterContainer.querySelector('.expanded-cities');

                    if (expandedCities.style.display === 'none') {
                        expandedCities.style.display = 'block';
                        showMoreBtn.textContent = 'Show Less';
                    } else {
                        expandedCities.style.display = 'none';
                        showMoreBtn.textContent = 'Show More';
                    }
                });
            }

            const cityCheckboxes = cityFilterContainer.querySelectorAll('input[type="checkbox"]');
            cityCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.applyFilters();
                });
            });
        } catch (error) {
            console.error('Error loading cities:', error);
            cityFilterContainer.innerHTML = '<div class="error-message">Failed to load cities</div>';
        }
    }

    async renderStateFilters() {
        const stateFilterContainer = this.container.querySelector('.state-filter-container');
        if (!stateFilterContainer) return;

        stateFilterContainer.innerHTML = '<div class="loading-filters">Loading states...</div>';

        try {
            const states = await this.loadFilterLocations('state');
            this.states = states;

            if (states.length === 0) {
                stateFilterContainer.innerHTML = '<div class="no-results">No states found</div>';
                return;
            }

            let html = '<div class="filter-options">';

            states.slice(0, 3).forEach(state => {
                html += `
            <div class="filter-option">
                <input type="checkbox" id="state-${state}" name="state" value="${state}">
                <label for="state-${state}">${state}</label>
            </div>
        `;
            });

            if (states.length > 3) {
                html += `<div class="expanded-states" style="display: none;">`;

                states.slice(3).forEach(state => {
                    html += `
                <div class="filter-option">
                    <input type="checkbox" id="state-${state}" name="state" value="${state}">
                    <label for="state-${state}">${state}</label>
                </div>
            `;
                });

                html += `</div>`;

                html += `
            <div class="show-more-container">
                <button class="show-more-btn">Show More</button>
            </div>
        `;
            }

            html += '</div>';
            stateFilterContainer.innerHTML = html;

            const showMoreBtn = stateFilterContainer.querySelector('.show-more-btn');
            if (showMoreBtn) {
                showMoreBtn.addEventListener('click', () => {
                    const expandedStates = stateFilterContainer.querySelector('.expanded-states');

                    if (expandedStates.style.display === 'none') {
                        expandedStates.style.display = 'block';
                        showMoreBtn.textContent = 'Show Less';
                    } else {
                        expandedStates.style.display = 'none';
                        showMoreBtn.textContent = 'Show More';
                    }
                });
            }

            const stateCheckboxes = stateFilterContainer.querySelectorAll('input[type="checkbox"]');
            stateCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.applyFilters();
                });
            });
        } catch (error) {
            console.error('Error loading states:', error);
            stateFilterContainer.innerHTML = '<div class="error-message">Failed to load states</div>';
        }
    }

    getSelectedCities() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"][name="city"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    getSelectedStates() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"][name="state"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    applyFilters() {
        const minPrice = document.querySelector('#price-min')?.value;
        const maxPrice = document.querySelector('#price-max')?.value;
        const minArea = document.querySelector('#area-min')?.value;
        const maxArea = document.querySelector('#area-max')?.value;
        const minBedrooms = document.querySelector('#bedrooms-min')?.value;
        const maxBedrooms = document.querySelector('#bedrooms-max')?.value;
        const minBathrooms = document.querySelector('#bathrooms-min')?.value;
        const maxBathrooms = document.querySelector('#bathrooms-max')?.value;
        const minFloor = document.querySelector('#floor-min')?.value;
        const maxFloor = document.querySelector('#floor-max')?.value;
        const minYearBuilt = document.querySelector('#year-built-min')?.value;
        const maxYearBuilt = document.querySelector('#year-built-max')?.value;


        let filteredProperties = [...this.properties];

        if (minPrice && minPrice.trim() !== '') {
            const minPriceValue = parseFloat(minPrice);
            filteredProperties = filteredProperties.filter(property =>
                property.price >= minPriceValue
            );
        }

        if (maxPrice && maxPrice.trim() !== '') {
            const maxPriceValue = parseFloat(maxPrice);
            filteredProperties = filteredProperties.filter(property =>
                property.price <= maxPriceValue
            );
        }

        if (minArea && minArea.trim() !== '') {
            const minAreaValue = parseFloat(minArea);
            filteredProperties = filteredProperties.filter(property =>
                property.surfaceArea >= minAreaValue
            );
        }

        if (maxArea && maxArea.trim() !== '') {
            const maxAreaValue = parseFloat(maxArea);
            filteredProperties = filteredProperties.filter(property =>
                property.surfaceArea <= maxAreaValue
            );
        }

        if (minBedrooms && minBedrooms.trim() !== '') {
            const minBedroomsValue = parseInt(minBedrooms);
            filteredProperties = filteredProperties.filter(property =>
                property.rooms >= minBedroomsValue
            );
        }

        if (maxBedrooms && maxBedrooms.trim() !== '') {
            const maxBedroomsValue = parseInt(maxBedrooms);
            filteredProperties = filteredProperties.filter(property =>
                property.rooms <= maxBedroomsValue
            );
        }

        if (minBathrooms && minBathrooms.trim() !== '') {
            const minBathroomsValue = parseFloat(minBathrooms);
            filteredProperties = filteredProperties.filter(property =>
                property.bathrooms >= minBathroomsValue
            );
        }

        if (maxBathrooms && maxBathrooms.trim() !== '') {
            const maxBathroomsValue = parseFloat(maxBathrooms);
            filteredProperties = filteredProperties.filter(property =>
                property.bathrooms <= maxBathroomsValue
            );
        }

        if (minFloor && minFloor.trim() !== '') {
            const minFloorValue = parseInt(minFloor);
            filteredProperties = filteredProperties.filter(property =>
                property.floor >= minFloorValue
            );
        }

        if (maxFloor && maxFloor.trim() !== '') {
            const maxFloorValue = parseInt(maxFloor);
            filteredProperties = filteredProperties.filter(property =>
                property.floor <= maxFloorValue
            );
        }

        if (minYearBuilt && minYearBuilt.trim() !== '') {
            const minYearBuiltValue = parseInt(minYearBuilt);
            filteredProperties = filteredProperties.filter(property =>
                property.yearBuilt >= minYearBuiltValue
            );
        }

        if (maxYearBuilt && maxYearBuilt.trim() !== '') {
            const maxYearBuiltValue = parseInt(maxYearBuilt);
            filteredProperties = filteredProperties.filter(property =>
                property.yearBuilt <= maxYearBuiltValue
            );
        }

        this.refreshCityFilters(filteredProperties);
        this.refreshStateFilters(filteredProperties);

        const selectedCities = this.getSelectedCities();
        const selectedStates = this.getSelectedStates();

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

    async refreshCityFilters(filteredProperties) {
        const cityFilterContainer = this.container.querySelector('.city-filter-container');
        if (!cityFilterContainer) return;

        const selectedCities = this.getSelectedCities();

        const availableCities = [...new Set(filteredProperties.map(property => property.city))].sort();

        if (availableCities.length === 0) {
            cityFilterContainer.innerHTML = '<div class="no-results">No cities available with current filters</div>';
            return;
        }

        let html = '<div class="filter-options">';

        availableCities.slice(0, 3).forEach(city => {
            const isChecked = selectedCities.includes(city) ? 'checked' : '';
            html += `
        <div class="filter-option">
            <input type="checkbox" id="city-${city}" name="city" value="${city}" ${isChecked}>
            <label for="city-${city}">${city}</label>
        </div>
        `;
        });

        if (availableCities.length > 3) {
            html += `<div class="expanded-cities" style="display: none;">`;

            availableCities.slice(3).forEach(city => {
                const isChecked = selectedCities.includes(city) ? 'checked' : '';
                html += `
            <div class="filter-option">
                <input type="checkbox" id="city-${city}" name="city" value="${city}" ${isChecked}>
                <label for="city-${city}">${city}</label>
            </div>
            `;
            });

            html += `</div>`;

            html += `
        <div class="show-more-container">
            <button class="show-more-btn">Show More</button>
        </div>
        `;
        }

        html += '</div>';
        cityFilterContainer.innerHTML = html;

        const showMoreBtn = cityFilterContainer.querySelector('.show-more-btn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                const expandedCities = cityFilterContainer.querySelector('.expanded-cities');

                if (expandedCities.style.display === 'none') {
                    expandedCities.style.display = 'block';
                    showMoreBtn.textContent = 'Show Less';
                } else {
                    expandedCities.style.display = 'none';
                    showMoreBtn.textContent = 'Show More';
                }
            });
        }

        const cityCheckboxes = cityFilterContainer.querySelectorAll('input[type="checkbox"]');
        cityCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    async refreshStateFilters(filteredProperties) {
        const stateFilterContainer = this.container.querySelector('.state-filter-container');
        if (!stateFilterContainer) return;

        const selectedStates = this.getSelectedStates();

        const availableStates = [...new Set(filteredProperties.map(property => property.state))].sort();

        if (availableStates.length === 0) {
            stateFilterContainer.innerHTML = '<div class="no-results">No states available with current filters</div>';
            return;
        }

        let html = '<div class="filter-options">';

        availableStates.slice(0, 3).forEach(state => {
            const isChecked = selectedStates.includes(state) ? 'checked' : '';
            html += `
        <div class="filter-option">
            <input type="checkbox" id="state-${state}" name="state" value="${state}" ${isChecked}>
            <label for="state-${state}">${state}</label>
        </div>
        `;
        });

        if (availableStates.length > 3) {
            html += `<div class="expanded-states" style="display: none;">`;

            availableStates.slice(3).forEach(state => {
                const isChecked = selectedStates.includes(state) ? 'checked' : '';
                html += `
            <div class="filter-option">
                <input type="checkbox" id="state-${state}" name="state" value="${state}" ${isChecked}>
                <label for="state-${state}">${state}</label>
            </div>
            `;
            });

            html += `</div>`;

            html += `
        <div class="show-more-container">
            <button class="show-more-btn">Show More</button>
        </div>
        `;
        }

        html += '</div>';
        stateFilterContainer.innerHTML = html;

        const showMoreBtn = stateFilterContainer.querySelector('.show-more-btn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                const expandedStates = stateFilterContainer.querySelector('.expanded-states');

                if (expandedStates.style.display === 'none') {
                    expandedStates.style.display = 'block';
                    showMoreBtn.textContent = 'Show Less';
                } else {
                    expandedStates.style.display = 'none';
                    showMoreBtn.textContent = 'Show More';
                }
            });
        }

        const stateCheckboxes = stateFilterContainer.querySelectorAll('input[type="checkbox"]');
        stateCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    updateMapWithFilteredProperties(filteredProperties) {
        if (!this.map) return;

        this.map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });

        if (!filteredProperties || filteredProperties.length === 0) return;

        const bounds = L.latLngBounds();
        let hasValidCoordinates = false;

        filteredProperties.forEach(property => {
            if (property.latitude && property.longitude) {
                hasValidCoordinates = true;
                const marker = L.marker([property.latitude, property.longitude]).addTo(this.map);

                const popupContent = document.createElement('div');
                popupContent.className = 'map-info-window';

                const title = document.createElement('h3');
                title.textContent = property.title;
                title.className = 'map-title clickable';
                title.onclick = (e) => {
                    console.log("Viewing property with ID:", property.propertyId);
                    sessionStorage.setItem('selectedPropertyID', property.propertyId);

                    if (this.router) {
                        this.router.safeNavigate('/property');
                    } else { // Fallback if router is not working
                        console.error('Router not available for navigation');
                        window.location.href = `/TW_Dumitrascu_Ursache_war_exploded/property`;
                    }
                };

                const details = document.createElement('p');
                details.textContent = `${property.rooms} rooms · ${property.bathrooms} baths · ${property.surfaceArea} m²`;

                const price = document.createElement('p');
                price.textContent = `${property.price} ${property.transactionType === 'rent' ? '€/month' : '€'}`;

                popupContent.appendChild(title);
                popupContent.appendChild(details);
                popupContent.appendChild(price);

                marker.bindPopup(popupContent);

                bounds.extend([property.latitude, property.longitude]);
            }
        });

        if (hasValidCoordinates) {
            this.map.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 15
            });
        }
    }

    updatePropertiesDisplay(filteredProperties) {
        const propertiesGrid = this.container.querySelector('.properties-grid');
        if (!propertiesGrid) return;

        if (filteredProperties.length === 0) {
            propertiesGrid.innerHTML = '<div class="no-properties">No properties match your filters</div>';
            return;
        }

        let propertiesHTML = '';
        filteredProperties.forEach(property => {
            propertiesHTML += `
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
                        <div class="property-price">$${property.price.toLocaleString()}</div>
                        <button class="view-details-btn">View Details</button>
                    </div>
                </div>
            </div>
        `;
        });

        propertiesGrid.innerHTML = propertiesHTML;

        const propertiesCountSpan = this.container.querySelector('.properties-count');
        if (propertiesCountSpan) {
            propertiesCountSpan.textContent = `(${filteredProperties.length} listings)`;
        }

        this.addPropertyCardListeners();
    }

    addPropertyCardListeners() {
        const propertyCards = this.container.querySelectorAll('.property-card');
        propertyCards.forEach(card => {
            const viewDetailsBtn = card.querySelector('.view-details-btn');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const propertyId = card.dataset.propertyId;
                    sessionStorage.setItem('selectedPropertyId', propertyId);
                    this.router.safeNavigate("/property");
                });
            }

            card.addEventListener('click', () => {
                const propertyId = card.dataset.propertyId;
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
        console.log("PropertyType: " + propertyType);
        console.log("TransactionType: " + transactionType);

        try {
            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/all-properties?filterCriteria=${propertyType}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let properties = await response.json();

            if (transactionType) {
                properties = properties.filter(property => property.transactionType === transactionType);
            }

            this.properties = properties;

            this.cities = await this.loadFilterLocations('city');
            this.renderCityFilters();

            this.states = await this.loadFilterLocations('state');
            this.renderStateFilters();


            this.debouncedInitMap();

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