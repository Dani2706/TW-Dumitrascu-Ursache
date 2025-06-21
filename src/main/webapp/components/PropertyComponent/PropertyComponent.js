import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class PropertyComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
        this.slideIndex = 1;
        this.currentContainer = null;
    }

    //@Override
    async init() {
        await super.init();
        this.dynamicallyLoadData();
    }

    //@Override
    eventListenerLoader(container) {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }

        this.currentContainer = container;
    }

    //@Override
    eventListenerRemover(container) {

    }

    plusSlides(n) {
        this.showSlides(this.slideIndex += n);
    }

    showSlides(n) {
        const slides = this.currentContainer.querySelectorAll('.slide');
        const counter = this.currentContainer.querySelector('#current-slide');

        if (!slides.length) return;

        if (n > slides.length) this.slideIndex = 1;
        if (n < 1) this.slideIndex = slides.length;

        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove('active');
        }

        slides[this.slideIndex - 1].classList.add('active');

        if (counter) {
            counter.textContent = this.slideIndex;
        }
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
        this.eventListenerLoader(container);
        return container;
    }

    dynamicallyLoadData() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();
        console.log(`Dynamically loading data for ${this.className}`);

        const propertyId = this.getPropertyIdFromContext();
        if (propertyId) {
            this.loadPropertyDetails(propertyId);
        }
    }

    getPropertyIdFromContext() {
        const storedId = sessionStorage.getItem('selectedPropertyId');
        console.log("StoredId: " + storedId);
        if (storedId) {
            return parseInt(storedId);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            return parseInt(id);
        }

        const hash = window.location.hash;
        const hashMatch = hash.match(/#property\/(\d+)/);
        if (hashMatch) {
            return parseInt(hashMatch[1]);
        }

        const container = document.querySelector(`.${this.className}`);
        if (container && container.dataset.propertyId) {
            return parseInt(container.dataset.propertyId);
        }

        console.log('No ID found, using default ID 1 for demo');
        return 1;
    }

    loadPropertyDetails(id) {
        console.log(`Attempting to fetch property with id: ${id}`);
        fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/property?id=${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) throw new Error("Proprietatea nu a fost găsită");
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data);
                this.populatePropertyData(data);
            })
            .catch(error => {
                console.error("Detailed error:", error);
                this.handleError(error);
            });
    }

    populatePropertyData(data) {
        const container = this.currentContainer || document.querySelector(`.${this.className}`);

        if (!container) {
            console.error('Container not found for PropertyComponent');
            return;
        }

        this.setElementText(container, "#property-title", data.title);
        this.setElementText(container, "#property-description", data.description);
        this.setElementText(container, "#property-type", data.propertyType);
        this.setElementText(container, "#transaction-type", data.transactionType);
        this.setElementText(container, "#property-price", data.price);
        this.setElementText(container, "#property-surface", data.surface);
        this.setElementText(container, "#property-rooms", data.rooms);
        this.setElementText(container, "#property-bathrooms", data.bathrooms);
        this.setElementText(container, "#property-floor", data.floor);
        this.setElementText(container, "#property-totalfloors", data.totalFloors);
        this.setElementText(container, "#property-year", data.yearBuilt);
        this.setElementText(container, "#property-created", data.createdAt);
        this.setElementText(container, "#property-address", `${data.address}, ${data.city}, ${data.state}`);
        this.setElementText(container, "#property-contact-name", data.contactName);
        this.setElementText(container, "#property-contact-phone", data.contactPhone);
        this.setElementText(container, "#property-contact-email", data.contactEmail);

        this.addPhotos(container, data.mainPhoto, data.extraPhotos);
        const formattedPrice = this.formatNumberWithDot(data.price);
        this.setElementText(container, "#property-price", formattedPrice);

        this.initializeMap(data);
    }

    addPhotos(container, mainPhoto, extraPhotos) {
        const imageContainer = container.querySelector('.property-images');

        if (!mainPhoto) {
            imageContainer.innerHTML = '<div class="no-photos">No photos available</div>';
            return;
        }

        imageContainer.innerHTML = '';

        const mainSlide = document.createElement('div');
        mainSlide.className = 'slide active';

        const mainImg = document.createElement('img');
        mainImg.src = `data:image/png;base64,${mainPhoto}`;
        mainImg.alt = 'Property Photo';
        mainImg.addEventListener('click', () => this.openFullscreen(mainImg.src));

        mainSlide.appendChild(mainImg);
        imageContainer.appendChild(mainSlide);

        if (extraPhotos && extraPhotos !== "null" && extraPhotos.length > 0) {
            extraPhotos.forEach(photo => {
                const slide = document.createElement('div');
                slide.className = 'slide';

                const img = document.createElement('img');
                img.src = `data:image/png;base64,${photo}`;
                img.alt = 'Property Photo';
                img.addEventListener('click', () => this.openFullscreen(img.src));

                slide.appendChild(img);
                imageContainer.appendChild(slide);
            });
        }

        const totalSlides = 1 + (extraPhotos && extraPhotos !== "null" ? extraPhotos.length : 0);

        if (totalSlides > 1) {
            const prevButton = document.createElement('a');
            prevButton.className = 'prev';
            prevButton.innerHTML = '&#10094;';
            prevButton.addEventListener('click', () => this.plusSlides(-1));

            const nextButton = document.createElement('a');
            nextButton.className = 'next';
            nextButton.innerHTML = '&#10095;';
            nextButton.addEventListener('click', () => this.plusSlides(1));

            imageContainer.appendChild(prevButton);
            imageContainer.appendChild(nextButton);

            const counter = document.createElement('div');
            counter.className = 'slide-counter';
            counter.innerHTML = `<span id="current-slide">1</span>/<span id="total-slides">${totalSlides}</span>`;
            imageContainer.appendChild(counter);
        }

        this.slideIndex = 1;
        this.showSlides(this.slideIndex);
    }

    formatNumberWithDot(number) {
        if (!number) return 'N/A';
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    setElementText(container, selector, text) {
        const element = container.querySelector(selector);
        if (element) {
            element.textContent = text || 'N/A';
        } else {
            console.warn(`Element not found: ${selector}`);
        }
    }

    initializeMap(data) {
        if (!data.latitude || !data.longitude) {
            console.log('No coordinates available for this property');
            return;
        }

        setTimeout(() => {
            const mapContainer = document.getElementById('property-map');
            if (!mapContainer) {
                console.error('Map container not found');
                return;
            }

            const map = L.map('property-map').setView([data.latitude, data.longitude], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            L.marker([data.latitude, data.longitude]).addTo(map)
                .bindPopup(data.address || 'Property Location')
                .openPopup();

            map.invalidateSize();
        }, 100);
    }

    handleError(error) {
        const container = this.currentContainer || document.querySelector(`.${this.className}`);
        if (container) {
            const mainContent = container.querySelector("#main-content") || container;
            mainContent.innerHTML = "<p>Nu s-au putut încărca detaliile proprietății.</p>";
        }
    }

    openFullscreen(imgSrc) {
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';

        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'fullscreen-image';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullscreen-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        overlay.appendChild(closeBtn);
        overlay.appendChild(img);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
}