import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";
import {environment} from "../../environment.js";
import { router } from "../../js/app.js";
import { PropertyService } from "../../services/PropertyService.js";

export class EditListingComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.propertyId = null;
        this.router = router;

        this.map = null;
        this.marker = null;
        this.debounceTimer = null;
        this.container = null;
        this.numberOfPhotosUploaded = 0;
        this.propertyService = new PropertyService();
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
            this.container = container;

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
                const response = await this.propertyService.getProperty(this.propertyId);

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

                this.populateMainPhoto(propertyData.mainPhoto);
                this.populateExtraPhotos(propertyData.extraPhotos);

                this.container = renderedContainer;

                this.setupMainPhoto();

                setTimeout(() => {
                    this.numberOfPhotosUploaded = 0;

                    if (propertyData.mainPhoto) {
                        this.populateMainPhoto(propertyData.mainPhoto);
                    }
                    if (propertyData.extraPhotos && Array.isArray(propertyData.extraPhotos)) {
                        this.populateExtraPhotos(propertyData.extraPhotos);
                    }
                }, 100);

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

    populateMainPhoto(mainPhoto) {
        if (!mainPhoto) return;

        const mainPhotoInput = this.container.querySelector('#mainPhoto');
        const mainPhotoContainer = this.container.querySelector('#main-img');
        const mainPreview = this.container.querySelector('#main-preview');
        const mainPlaceholder = mainPreview.querySelector('.photo-placeholder');

        mainPhotoContainer.setAttribute('src', `data:image/png;base64,${mainPhoto}`);

        if (mainPhotoInput && mainPhotoInput.hasAttribute('required')) {
            mainPhotoInput.removeAttribute('required');
        }

        if (mainPlaceholder) {
            mainPlaceholder.style.display = 'none';
        }

        let mainRemoveBtn = mainPreview.querySelector('.remove-photo-btn');
        if (mainRemoveBtn) {
            mainRemoveBtn.style.display = 'flex';
        }
    }

    populateExtraPhotos(extraPhotos) {
        if (!extraPhotos || !extraPhotos.length) {
            this.addNewPhotoField();
            return;
        }

        const extraPhotosContainer = this.container.querySelector('#extra-photos');

        extraPhotosContainer.innerHTML = '';

        extraPhotos.forEach((extraPhotoBase64, index) => {
            this.numberOfPhotosUploaded = index + 1;

            const photoCard = document.createElement('div');
            photoCard.className = 'photo-upload-card';

            const photoPreview = document.createElement('div');
            photoPreview.className = 'photo-preview';

            const img = document.createElement('img');
            img.id = `photo${this.numberOfPhotosUploaded}-img`;
            img.className = 'photo preview-image';
            img.src = `data:image/png;base64,${extraPhotoBase64}`;

            const placeholder = document.createElement('div');
            placeholder.className = 'photo-placeholder';
            placeholder.innerHTML = '<i class="fa fa-image"></i><span>Additional Photo</span>';
            placeholder.style.display = 'none';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-photo-btn';
            removeBtn.innerHTML = '<i class="fa fa-times"></i>';
            removeBtn.style.display = 'flex';

            const uploadLabel = document.createElement('label');
            uploadLabel.setAttribute('for', `photo${this.numberOfPhotosUploaded}`);
            uploadLabel.className = 'upload-btn';
            uploadLabel.innerHTML = '<span>Replace Photo</span>';

            const input = document.createElement('input');
            input.type = 'file';
            input.id = `photo${this.numberOfPhotosUploaded}`;
            input.name = 'photo';
            input.accept = 'image/*';

            uploadLabel.appendChild(input);
            photoPreview.appendChild(img);
            photoPreview.appendChild(placeholder);
            photoPreview.appendChild(removeBtn);
            photoCard.appendChild(photoPreview);
            photoCard.appendChild(uploadLabel);

            extraPhotosContainer.appendChild(photoCard);

            this.setupExtraPhotoSlot(input);
        });

        this.addNewPhotoField();
    }

    addNewPhotoField() {
        console.log("Adding new photo field");
        this.numberOfPhotosUploaded += 1;

        const extraPhotos = this.container.querySelector('#extra-photos');

        const newPhotoField = document.createElement('div');
        newPhotoField.setAttribute('class', 'form-group');

        const newLabel = document.createElement('label');
        newLabel.setAttribute('for', 'photo' + this.numberOfPhotosUploaded);
        newLabel.textContent = "Photo " + this.numberOfPhotosUploaded;

        const newInput = document.createElement('input');
        newInput.setAttribute('type', 'file');
        newInput.setAttribute('id', 'photo' + this.numberOfPhotosUploaded);
        newInput.setAttribute('name', 'photo');
        newInput.setAttribute('accept', 'image/*');

        const imagePreview = document.createElement('img');
        imagePreview.style.maxWidth = '200px';
        imagePreview.style.display = 'block';
        imagePreview.style.marginTop = '10px';
        imagePreview.setAttribute('class', 'photo');

        newInput.addEventListener('click', (event) => {
            this.dialogBoxOpen = true;
            this.activeInputEvent = event;
        })

        newInput.addEventListener('change', (event) => {
            console.log('dynamic change event');
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    imagePreview.src = reader.result;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.removeAttribute('src');
            }

            this.changeExtraPhotosContainer(event);
        });

        newPhotoField.appendChild(newLabel);
        newPhotoField.appendChild(newInput);
        newPhotoField.appendChild(imagePreview);

        extraPhotos.appendChild(newPhotoField);

        return imagePreview;
    }

    changeExtraPhotosContainer(event) {
        const input = event.target;
        const lastDigitOfInputName = parseInt(input.getAttribute("id").slice(-1), 10);
        if (input.files.length > 0){
            if (lastDigitOfInputName === this.numberOfPhotosUploaded) {
                this.addNewPhotoField();
            }
        }
        else {
            this.removePhotoField(event);
        }
    }

    removePhotoField(event){
        const input = event.target;
        const lastDigitOfInputName = parseInt(input.getAttribute("id").slice(-1), 10);
        const inputParent = input.closest('.form-group');
        inputParent.remove();
        if ((lastDigitOfInputName !== this.numberOfPhotosUploaded)){
            const extraPhotos = this.container.querySelector('#extra-photos');
            const photos = extraPhotos.querySelectorAll('.form-group');

            photos.forEach((photo, index) => {
                const label = photo.querySelector('label');
                const input = photo.querySelector('input');

                const number = index + 1;

                label.htmlFor = `photo${number}`
                label.textContent = `Photo ${number}`;

                input.setAttribute('id', `photo${number}`);
            });
        }
        this.numberOfPhotosUploaded -= 1;
    }

    getMainPhoto() {
        const mainImg = this.container.querySelector('#main-img');
        return mainImg.getAttribute('src');
    }

    getExtraPhotos() {
        const extraPhotos = this.container.querySelectorAll('.photo.preview-image');
        return Array.from(extraPhotos)
            .filter(img => img.getAttribute('src'))
            .map(img => img.getAttribute('src'));
    }

    async handleSubmit(event) {
        event.preventDefault();

        try {
            this.clearMessages();

            const mainImg = this.container.querySelector('#main-img');
            const mainPhoto = this.container.querySelector('#mainPhoto');

            if (mainImg.src && mainPhoto.hasAttribute('required')) {
                mainPhoto.removeAttribute('required');
            }

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
                contactEmail: formData.get('contactEmail'),
                mainPhoto: this.getMainPhoto(),
                extraPhotos: this.getExtraPhotos()
            };

            console.log('Submitting property data:', propertyData);

            const response = await this.propertyService.updateProperty(propertyData);

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
            countdownElement.innerHTML = `You will be redirected in <span class="countdown">5</span> seconds...`;
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
                        if (window.sessionStorage.getItem("isAdmin") === "true") {
                            this.router.safeNavigate('/admin/PropertyDashboard');
                        } else {
                            this.router.safeNavigate('/manage-listings');
                        }
                    } else {
                        console.error('Router not found');
                        if (window.sessionStorage.getItem("isAdmin") === "true") {
                            window.location.href = '/TW_Dumitrascu_Ursache_war_exploded/admin/PropertyDashboard';
                        } else {
                            window.location.href = '/TW_Dumitrascu_Ursache_war_exploded/manage-listings';
                        }
                    }
                }
            }, 1000);
        }
    }

    handleCancel(event) {
        event.preventDefault();
        if (this.router) {
            if (window.sessionStorage.getItem("isAdmin") === "true") {
                this.router.safeNavigate('/admin/PropertyDashboard');
            } else {
                this.router.safeNavigate('/manage-listings');
            }
        } else { // Fallback if router is not working
            console.error('Router not found');
            if (window.sessionStorage.getItem("isAdmin") === "true") {
                window.location.href = '/TW_Dumitrascu_Ursache_war_exploded/admin/PropertyDashboard';
            } else {
                window.location.href = '/TW_Dumitrascu_Ursache_war_exploded/manage-listings';
            }
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

    setupMainPhoto() {
        const mainPhoto = this.container.querySelector('#mainPhoto');
        const mainImage = this.container.querySelector('#main-img');
        const mainPreview = this.container.querySelector('#main-preview');
        const mainPlaceholder = mainPreview.querySelector('.photo-placeholder');

        if (mainImage && mainImage.src && mainImage.src !== '') {
            mainPhoto.removeAttribute('required');
        }

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
}