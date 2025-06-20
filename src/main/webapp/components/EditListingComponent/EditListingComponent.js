import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import {environment} from "../../environment.js";
import { router } from "../../js/app.js";

export class EditListingComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.propertyId = null;
        this.router = router;

        this.map = null;
        this.marker = null;
        this.debounceTimer = null;
    }

    //@Override
    async init() {
        if (window.sessionStorage.getItem("isLoggedIn") === "false"){
            window.location.href = environment.navigationUrl + "/home";
            return;
        }
        await super.init();

        const urlParams = new URLSearchParams(window.location.search);
        this.propertyId = urlParams.get('id');

        if (!this.propertyId) {
            this.propertyId = sessionStorage.getItem('editPropertyId');
        }

        if (!this.propertyId) {
            console.error('No property ID provided for editing');
        } else {
            console.log("Successfully found property ID:", this.propertyId);
            await this.prefetchPropertyData();
        }
    }

    async prefetchPropertyData() {
        try {
            const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/property?id=${this.propertyId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch property data: ${response.status}`);
            }

            const propertyData = await response.json();
            sessionStorage.setItem('editPropertyData', JSON.stringify(propertyData));
            return propertyData;
        } catch (error) {
            console.error('Error pre-fetching property data:', error);
            return null;
        }
    }


    //@Override
    eventListenerLoader(container) {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }

        const form = container.querySelector('#editPropertyForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));

            const cancelBtn = container.querySelector('#cancelEdit');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', this.handleCancel.bind(this));
            }

            const cityField = container.querySelector('#city');
            const stateField = container.querySelector('#state');

            if(cityField && stateField) {
                cityField.addEventListener('blur', this.handleLocationChange.bind(this));
                stateField.addEventListener('blur', this.handleLocationChange.bind(this));
            }
        } else {
            console.error('Form #editPropertyForm not found in the template');
        }
    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            const form = container.querySelector('#editPropertyForm');
            if (form) {
                form.removeEventListener('submit', this.handleSubmit.bind(this));
            }

            const cancelBtn = container.querySelector('#cancelEdit');
            if (cancelBtn) {
                cancelBtn.removeEventListener('click', this.handleCancel.bind(this));
            }

            const cityField = container.querySelector('#city');
            const stateField = container.querySelector('#state');

            if(cityField && stateField) {
                cityField.removeEventListener('blur', this.handleLocationChange.bind(this));
                stateField.removeEventListener('blur', this.handleLocationChange.bind(this));
            }
        }
    }

    initializeMap(lat, lng) {
        const mapElement = document.getElementById('propertyMap');
        if(!mapElement) {
            return;
        }

        this.map = L.map('propertyMap').setView([lat || 37.0902, lng || -95.7129], lat && lng ? 13 : 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.map.on('click', (e) => {
            this.updateMarkerPosition(e.latlng.lat, e.latlng.lng);
        });

        if (lat && lng) {
            this.updateMarkerPosition(lat, lng);
        }

        const geocodeStatus = document.getElementById('geocodeStatus');
        if(geocodeStatus) {
            geocodeStatus.textContent = 'Adjust the pin position if needed';
        }
    }

    handleLocationChange() {
        if(this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(() => {
            this.geocodeLocation();
        }, 1000);
    }

    async geocodeLocation() {
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;

        if (!city || !state) {
            console.error('City and state fields are required for geocoding');
            return;
        }

        const geocodeStatus = document.getElementById('geocodeStatus');
        if(!geocodeStatus) {
            console.error('Geocode status element not found');
            return;
        }

        geocodeStatus.textContent = 'Finding location...';
        geocodeStatus.className = 'loading';

        try {
            const locationQuery = `${city}, ${state}`;

            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const location = data[0];

                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);

                this.updateMarkerPosition(lat, lon);

                geocodeStatus.textContent = 'The map is centered on the city you entered.';
                geocodeStatus.className = 'success';
            }
            else {
                geocodeStatus.textContent = 'Oops! We couldn\'t locate that city. You can place the pin yourself.';
                geocodeStatus.className = 'error';
            }
        } catch (error) {
            console.error('Error during geocoding:', error);
            geocodeStatus.textContent = 'Error finding location. Please try again.';
            geocodeStatus.className = 'error';
        }
    }

    updateMarkerPosition(lat, lng) {
        const latitudeInput = document.getElementById('latitude');
        const longitudeInput = document.getElementById('longitude');
        const coordinatesDisplay = document.getElementById('coordinatesDisplay');

        if(latitudeInput && longitudeInput) {
            longitudeInput.value = lng;
            latitudeInput.value = lat;
        }

        if(coordinatesDisplay) {
            coordinatesDisplay.textContent = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
        }

        if(this.marker) {
            this.marker.setLatLng([lat, lng]);
        } else {
            this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

            this.marker.on('dragend', (event) => {
                const position = event.target.getLatLng();
                this.updateMarkerPosition(position.lat, position.lng);
            });
        }

        this.map.setView([lat, lng], 13);
    }

    //@Override
    destroy() {
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.eventListenerRemover(container);
        super.destroy();
    }

    //@Override
    render() {
        try {
            const container = document.createElement('div');
            container.className = this.className;
            container.innerHTML = this.template;

            this.eventListenerLoader(container);

            if (!this.propertyId) {
                const formElement = container.querySelector('#editPropertyForm');
                const errorMsg = document.createElement('div');
                errorMsg.className = 'message error-message';
                errorMsg.innerHTML = 'No property selected for editing.';

                if (formElement && formElement.parentNode) {
                    formElement.parentNode.insertBefore(errorMsg, formElement);
                } else {
                    container.appendChild(errorMsg);
                }
            } else {
                setTimeout(() => {
                    this.fetchAndPopulatePropertyData(container);
                }, 0);
            }

            return container;
        } catch (error) {
            console.error('Error in render method:', error);
            const fallbackContainer = document.createElement('div');
            fallbackContainer.className = this.className;
            fallbackContainer.innerHTML = '<div class="message error-message">Error loading edit form. Please try again later.</div>';
            return fallbackContainer;
        }
    }

    async fetchAndPopulatePropertyData(container) {
        try {
            let propertyData;

            const cachedData = sessionStorage.getItem('editPropertyData');
            if (cachedData) {
                propertyData = JSON.parse(cachedData);
                console.log("Using cached property data:", propertyData);
            } else {
                const response = await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/property?id=${this.propertyId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch property data: ${response.status}`);
                }

                propertyData = await response.json();
                console.log("Fetched property data:", propertyData);
            }

            const renderedContainer = document.querySelector(`.${this.className}`);
            if (!renderedContainer) {
                console.error('Cannot find rendered container to update property data');
                return;
            }

            const idField = renderedContainer.querySelector('#propertyId');
            if (idField) idField.value = this.propertyId;

            const form = renderedContainer.querySelector('#editPropertyForm');

            if (propertyData && form) {
                console.log("All property data keys:", Object.keys(propertyData));

                const textFields = ['title', 'description', 'address', 'country', 'city', 'state',
                    'contactName', 'contactPhone', 'contactEmail'];

                textFields.forEach(field => {
                    const input = form.querySelector(`#${field}`);
                    if (input && propertyData[field] !== undefined) {
                        input.value = propertyData[field];
                    }
                });

                const surfaceAreaField = form.querySelector('#surfaceArea');
                if (surfaceAreaField && propertyData.surface !== undefined) {
                    surfaceAreaField.value = propertyData.surface;
                }

                const numberFields = ['price', 'rooms', 'bathrooms', 'floor', 'totalFloors', 'yearBuilt'];
                numberFields.forEach(field => {
                    const input = form.querySelector(`#${field}`);
                    if (input && propertyData[field] !== undefined) {
                        input.value = propertyData[field];
                    }
                });

                const latitudeInput = form.querySelector('#latitude');
                const longitudeInput = form.querySelector('#longitude');

                if (latitudeInput && propertyData.latitude !== undefined) {
                    latitudeInput.value = propertyData.latitude;
                }

                if (longitudeInput && propertyData.longitude !== undefined) {
                    longitudeInput.value = propertyData.longitude;
                }

                setTimeout(() => {
                    this.initializeMap(
                        propertyData.latitude !== undefined ? parseFloat(propertyData.latitude) : null,
                        propertyData.longitude !== undefined ? parseFloat(propertyData.longitude) : null
                    );
                }, 100);

                const propertyTypeField = form.querySelector('#propertyType');
                if (propertyTypeField && propertyData.propertyType) {
                    const typeMap = {
                        'Flat': 'FLAT',
                        'House': 'HOUSE',
                        'Land': 'LAND',
                        'Commercial': 'COMMERCIAL'
                    };

                    const mappedType = typeMap[propertyData.propertyType.toLowerCase()];
                    if (mappedType) {
                        propertyTypeField.value = mappedType;
                        console.log(`Mapped property type ${propertyData.propertyType} to ${mappedType}`);
                    } else {
                        console.warn(`No mapping found for property type: ${propertyData.propertyType}`);
                    }
                }

                const transactionTypeField = form.querySelector('#transactionType');
                if (transactionTypeField && propertyData.transactionType) {
                    const transactionMap = {
                        'Sell': 'SELL',
                        'Rent': 'RENT'
                    };

                    const mappedTransaction = transactionMap[propertyData.transactionType.toLowerCase()];
                    if (mappedTransaction) {
                        transactionTypeField.value = mappedTransaction;
                        console.log(`Mapped transaction type ${propertyData.transactionType} to ${mappedTransaction}`);
                    } else {
                        console.warn(`No mapping found for transaction type: ${propertyData.transactionType}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading property data:', error);

            const renderedContainer = document.querySelector(`.${this.className}`);
            if (renderedContainer) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'message error-message';
                errorMsg.innerHTML = 'Failed to load property data. Please try again.';

                const form = renderedContainer.querySelector('#editPropertyForm');
                if (form) {
                    renderedContainer.insertBefore(errorMsg, form);
                } else {
                    renderedContainer.appendChild(errorMsg);
                }
            }
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        try {
            this.clearMessages();

            const form = event.target;
            const formData = new FormData(form);

            const propertyData = {
                propertyId: parseInt(formData.get('propertyId')),
                title: formData.get('title'),
                description: formData.get('description'),
                propertyType: formData.get('propertyType').toLowerCase(),
                transactionType: formData.get('transactionType').toLowerCase(),
                price: parseInt(formData.get('price')) || 0,
                surfaceArea: parseInt(formData.get('surfaceArea')) || 0,
                rooms: parseInt(formData.get('rooms')) || 0,
                bathrooms: parseInt(formData.get('bathrooms')) || 0,
                floor: parseInt(formData.get('floor')) || 0,
                totalFloors: parseInt(formData.get('totalFloors')) || 0,
                yearBuilt: parseInt(formData.get('yearBuilt')) || 0,
                address: formData.get('address'),
                country: formData.get('country'),
                city: formData.get('city'),
                state: formData.get('state'),
                latitude: formData.get('latitude') || null,
                longitude: formData.get('longitude') || null,
                contactName: formData.get('contactName'),
                contactPhone: formData.get('contactPhone'),
                contactEmail: formData.get('contactEmail')
            };

            console.log('Submitting property data:', propertyData);

            const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/update-property', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                },
                body: JSON.stringify(propertyData)
            });

            const text = await response.text();
            console.log('Server response:', text);

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Server returned non-JSON response:', text);
                this.showMessage('Server returned invalid response format', 'error');
                return;
            }

            if (response.ok && result.success) {
                this.replaceFormWithSuccessAndCountdown(propertyData.propertyId);
            } else {
                this.showMessage(`Error: ${result.message || 'Failed to update property'}`, 'error');
            }
        } catch (error) {
            console.error('Error updating property:', error);
            this.showMessage(`Error updating property: ${error.message}`, 'error');
        }
    }

    replaceFormWithSuccessAndCountdown(propertyId) {
        const container = document.querySelector('.edit-property-container');
        const form = document.querySelector('#editPropertyForm');

        if (container && form) {
            form.style.display = 'none';

            const successContent = document.createElement('div');
            successContent.className = 'success-content';

            const messageElement = document.createElement('div');
            messageElement.className = 'message success-message';
            messageElement.innerHTML = `
            <h3>Property updated successfully!</h3>
            <p>Your property has been updated.</p>
        `;
            successContent.appendChild(messageElement);

            const countdownElement = document.createElement('div');
            countdownElement.className = 'countdown-message';
            countdownElement.innerHTML = `You will be redirected to manage listings in <span class="countdown">5</span> seconds...`;
            successContent.appendChild(countdownElement);

            container.appendChild(successContent);

            let count = 5;
            const countdownSpan = countdownElement.querySelector('.countdown');

            const countdownInterval = setInterval(() => {
                count--;
                if (countdownSpan) {
                    countdownSpan.textContent = count;
                }

                if (count <= 0) {
                    clearInterval(countdownInterval);
                    if (this.router) {
                        this.router.safeNavigate('/manage-listings');
                    } else { // Fallback if router is not working
                        console.error('Router not found');
                        window.location.href = '/TW_Dumitrascu_Ursache_war_exploded/manage-listings';
                    }
                }
            }, 1000);
        }
    }

    handleCancel(event) {
        event.preventDefault();
        if (this.router) {
            this.router.safeNavigate('/manage-listings');
        } else { // Fallback if router is not working
            console.error('Router not found');
            window.location.href = '/TW_Dumitrascu_Ursache_war_exploded/manage-listings';
        }
    }

    showMessage(message, type, container = null) {
        if (!container) {
            container = document.querySelector('.edit-property-container');
        }

        const form = container.querySelector('#editPropertyForm');

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        messageElement.innerHTML = message;

        if (container && form) {
            container.insertBefore(messageElement, form);
        } else if (container) {
            container.appendChild(messageElement);
        }

        if (type === 'success') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 5000);
        }
    }

    clearMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        });
    }
}