import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import {environment} from "../../environment.js";

export class AddPropertyComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);

        this.map = null;
        this.marker = null;
        this.debounceTimer = null
        this.container = null;
        this.numberOfPhotosUploaded = 1;
        this.dialogBoxOpen = false;
        this.activeInputEvent = null;
    }

    //@Override
    async init() {
        if (window.sessionStorage.getItem("isLoggedIn") === "false"){
            window.location.href = environment.navigationUrl + "/home";
            return;
        }
        await super.init();

        this.container = document.querySelector(`.${this.className}`);

        this.setupMainPhoto();

        this.setupExtraPhotoSlot(this.container.querySelector('#photo1'));
    }

    setupMainPhoto() {
        const mainPhoto = this.container.querySelector('#mainPhoto');
        const mainImage = this.container.querySelector('#main-img');
        const mainPreview = this.container.querySelector('#main-preview');
        const mainPlaceholder = mainPreview.querySelector('.photo-placeholder');

        let mainRemoveBtn = mainPreview.querySelector('.remove-photo-btn');
        if (!mainRemoveBtn) {
            mainRemoveBtn = document.createElement('button');
            mainRemoveBtn.className = 'remove-photo-btn';
            mainRemoveBtn.innerHTML = '<i class="fa fa-times"></i>';
            mainRemoveBtn.style.display = 'none';
            mainPreview.appendChild(mainRemoveBtn);
        }

        mainRemoveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mainImage.removeAttribute('src');
            mainPhoto.value = '';
            if (mainPlaceholder) {
                mainPlaceholder.style.display = 'flex';
            }
            mainRemoveBtn.style.display = 'none';
        });

        mainPhoto.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    mainImage.src = reader.result;
                    if (mainPlaceholder) {
                        mainPlaceholder.style.display = 'none';
                    }
                    mainRemoveBtn.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            } else {
                mainImage.removeAttribute('src');
                if (mainPlaceholder) {
                    mainPlaceholder.style.display = 'flex';
                }
                mainRemoveBtn.style.display = 'none';
            }
        });
    }

    //@Override
    eventListenerLoader(container) {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }

        this.container = container;

        const form = container.querySelector('#addPropertyForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));

            const cityField = container.querySelector('#city');
            const stateField = container.querySelector('#state');

            if(cityField && stateField) {
                cityField.addEventListener('blur', this.handleLocationChange.bind(this));
                stateField.addEventListener('blur', this.handleLocationChange.bind(this));
            }

            setTimeout(() => this.initializeMap(), 100);

            this.setupMainPhoto();

            const photo1 = container.querySelector('#photo1');
            if (photo1) {
                this.setupExtraPhotoSlot(photo1);
            }

        } else {
            console.error('Form #addPropertyForm not found in the template');
        }
    }

    setupExtraPhotoSlot(photoInput) {
        const photoCard = photoInput.closest('.photo-upload-card');
        const imagePreview = photoCard.querySelector('.preview-image');
        const photoPreview = photoCard.querySelector('.photo-preview');
        const placeholder = photoCard.querySelector('.photo-placeholder');

        let removeBtn = photoPreview.querySelector('.remove-photo-btn');
        if (!removeBtn) {
            removeBtn = document.createElement('button');
            removeBtn.className = 'remove-photo-btn';
            removeBtn.innerHTML = '<i class="fa fa-times"></i>';
            removeBtn.style.display = 'none';
            photoPreview.appendChild(removeBtn);
        }

        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            imagePreview.removeAttribute('src');
            photoInput.value = '';
            placeholder.style.display = 'flex';
            removeBtn.style.display = 'none';

            this.manageExtraPhotoContainers();
        });

        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    imagePreview.src = reader.result;
                    removeBtn.style.display = 'flex';
                    placeholder.style.display = 'none';

                    this.manageExtraPhotoContainers();
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.removeAttribute('src');
                placeholder.style.display = 'flex';
                removeBtn.style.display = 'none';
            }
        });
    }

    renumberPhotoFields() {
        const extraPhotos = this.container.querySelector('#extra-photos');
        const photoCards = extraPhotos.querySelectorAll('.photo-upload-card');

        photoCards.forEach((card, index) => {
            const photoNum = index + 1;

            const input = card.querySelector('input[type="file"]');
            const oldId = input.id;
            input.id = `photo${photoNum}`;

            const label = card.querySelector('label.upload-btn');
            label.setAttribute('for', `photo${photoNum}`);

            const img = card.querySelector('.preview-image');
            img.id = `photo${photoNum}-img`;
        });

        this.numberOfPhotosUploaded = photoCards.length;
    }

    manageExtraPhotoContainers() {
        const extraPhotos = this.container.querySelector('#extra-photos');
        const photoCards = extraPhotos.querySelectorAll('.photo-upload-card');

        let filledCards = 0;
        let emptyCards = [];

        photoCards.forEach(card => {
            const img = card.querySelector('.preview-image');
            if (img && img.src && img.src !== '') {
                filledCards++;
            } else {
                emptyCards.push(card);
            }
        });

        if (emptyCards.length === 0) {
            this.addNewPhotoField();
        } else if (emptyCards.length > 1) {
            for (let i = 1; i < emptyCards.length; i++) {
                emptyCards[i].remove();
            }
            this.numberOfPhotosUploaded = filledCards + 1;
        }

        this.renumberPhotoFields();
    }

    addNewPhotoField() {
        console.log("Adding new photo field");
        this.numberOfPhotosUploaded += 1;

        const extraPhotos = this.container.querySelector('#extra-photos');

        const newPhotoCard = document.createElement('div');
        newPhotoCard.setAttribute('class', 'photo-upload-card');

        const previewContainer = document.createElement('div');
        previewContainer.setAttribute('class', 'photo-preview');

        const imagePreview = document.createElement('img');
        imagePreview.setAttribute('id', `photo${this.numberOfPhotosUploaded}-img`);
        imagePreview.setAttribute('class', 'photo preview-image');

        const placeholder = document.createElement('div');
        placeholder.setAttribute('class', 'photo-placeholder');
        placeholder.innerHTML = '<i class="fa fa-image"></i><span>Additional Photo</span>';

        previewContainer.appendChild(imagePreview);
        previewContainer.appendChild(placeholder);

        const uploadLabel = document.createElement('label');
        uploadLabel.setAttribute('for', `photo${this.numberOfPhotosUploaded}`);
        uploadLabel.setAttribute('class', 'upload-btn');
        uploadLabel.innerHTML = '<span>Add Photo</span>';

        const newInput = document.createElement('input');
        newInput.setAttribute('type', 'file');
        newInput.setAttribute('id', `photo${this.numberOfPhotosUploaded}`);
        newInput.setAttribute('name', 'photo');
        newInput.setAttribute('accept', 'image/*');

        uploadLabel.appendChild(newInput);

        newPhotoCard.appendChild(previewContainer);
        newPhotoCard.appendChild(uploadLabel);

        extraPhotos.appendChild(newPhotoCard);

        this.setupExtraPhotoSlot(newInput);
    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            const form = container.querySelector('#addPropertyForm');
            if (form) {
                form.removeEventListener('submit', this.handleSubmit.bind(this));

                const cityField = container.querySelector('#city');
                const stateField = container.querySelector('#state');

                if(cityField && stateField) {
                    cityField.removeEventListener('blur', this.handleLocationChange.bind(this));
                    stateField.removeEventListener('blur', this.handleLocationChange.bind(this));
                }
            }
        }
    }

    initializeMap() {
        const mapElement = document.getElementById('propertyMap');
        if(!mapElement) return;

        this.map = L.map('propertyMap').setView([37.0902, -95.7129], 4); // Default to USA view

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.map.on('click', (e) => {
            this.updateMarkerPosition(e.latlng.lat, e.latlng.lng);
        });

        const geocodeStatus = document.getElementById('geocodeStatus');
        if(geocodeStatus) {
            geocodeStatus.textContent = 'Enter city and state to see location on map';
        }
    }

    handleLocationChange() {
        if(this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(() => {
            this.geocodeLocation();
        }, 1000); // 1 second debounce
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
            const locationQuery = `${city}, ${state}, USA`;

            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const location = data[0];

                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);

                this.updateMarkerPosition(lat, lon);

                geocodeStatus.textContent = 'The map has been centered on the city you entered.';
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
            })
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
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.container = container;
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.constructor.name}:`, this.template);

        return container;
    }

    getMainPhoto(){
        const mainImg = this.container.querySelector('#main-img');
        return mainImg.getAttribute('src');
    }

    getExtraPhotos(){
        const extraPhotos = this.container.querySelectorAll('.photo');
        return Array.from(extraPhotos).map(extraPhoto => extraPhoto.getAttribute('src'));
    }

    async handleSubmit(event) {
        event.preventDefault();

        try {
            console.log('Form submitted, processing...');

            this.clearMessages();

            const form = event.target;
            const formData = new FormData(form);

            const propertyData = {
                title: formData.get('title'),
                description: formData.get('description'),
                propertyType: formData.get('propertyType'),
                transactionType: formData.get('transactionType'),
                price: parseInt(formData.get('price')),
                surfaceArea: parseInt(formData.get('surfaceArea')),
                rooms: formData.get('rooms') && formData.get('rooms') !== '' ? parseInt(formData.get('rooms')) : 0,
                bathrooms: formData.get('bathrooms') && formData.get('bathrooms') !== '' ? parseInt(formData.get('bathrooms')) : 0,
                floor: formData.get('floor') ? parseInt(formData.get('floor')) : 0,
                totalFloors: formData.get('totalFloors') ? parseInt(formData.get('totalFloors')) : 0,
                yearBuilt: formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt')) : 0,
                address: formData.get('address'),
                country: formData.get('country'),
                city: formData.get('city'),
                state: formData.get('state'),
                latitude: formData.get('latitude') || null,
                longitude: formData.get('longitude') || null,
                contactName: formData.get('contactName'),
                contactPhone: formData.get('contactPhone'),
                contactEmail: formData.get('contactEmail'),
                mainPhoto: this.getMainPhoto(),
                extraPhotos: this.getExtraPhotos()
            };

            console.log('Json: ' + JSON.stringify(propertyData));

            const response = await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/add-property', {
                method: 'POST',
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                },
                body: JSON.stringify(propertyData)
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await response.json();

                if (response.ok) {
                    this.replaceFormWithSuccess(result.propertyId);
                } else {
                    this.showMessage(`Error: ${result.message || 'Failed to add property'}`, 'error');
                }
            } else {
                // Handle non-JSON response
                const text = await response.text();
                console.error('Server returned non-JSON response:', text);
                this.showMessage('Server error occurred. Check console for details.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showMessage(`Error adding property: ${error.message}`, 'error');
        }
    }

    replaceFormWithSuccess(propertyId) {
        const container = document.querySelector('.add-property-container');
        const form = document.querySelector('#addPropertyForm');

        if (container && form) {
            const successContent = document.createElement('div');
            successContent.className = 'success-content';

            const messageElement = document.createElement('div');
            messageElement.className = 'message success-message';
            messageElement.innerHTML = `<h3>Property added successfully!</h3>
                               <p>Your property has been created with ID: ${propertyId}</p>`;
            successContent.appendChild(messageElement);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'success-buttons';

            const addNewButton = document.createElement('a');
            addNewButton.className = 'btn btn-primary';
            addNewButton.innerHTML = 'Add Another Property';
            addNewButton.href = '#';
            addNewButton.setAttribute('data-route', '/add-property');

            const viewListingsButton = document.createElement('a');
            viewListingsButton.className = 'btn btn-secondary';
            viewListingsButton.innerHTML = 'View My Listings';
            viewListingsButton.href = '#';
            viewListingsButton.setAttribute('data-route', '/manage-listings');

            buttonContainer.appendChild(addNewButton);
            buttonContainer.appendChild(viewListingsButton);
            successContent.appendChild(buttonContainer);

            form.style.display = 'none';
            container.appendChild(successContent);
        }
    }

    showMessage(message, type) {
        const container = document.querySelector('.add-property-container');
        const form = document.querySelector('#addPropertyForm');
        if (container && form) {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}-message`;
            messageElement.innerHTML = message;

            container.insertBefore(messageElement, form);

            if (type === 'success') {
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 5000);
            }
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