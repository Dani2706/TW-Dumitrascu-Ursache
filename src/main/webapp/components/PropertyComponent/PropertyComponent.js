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

        /*const slides = container.querySelectorAll('.slides');
        if (slides.length > 0) {
            this.showSlides(this.slideIndex, container);
        }

        const prev = container.querySelector('.prev');
        const next = container.querySelector('.next');

        if (prev) prev.addEventListener('click', () => this.plusSlides(-1));
        if (next) next.addEventListener('click', () => this.plusSlides(1));*/
    }

    //@Override
    eventListenerRemover(container) {
        /*if (this.templateLoaded) {
            const prev = container.querySelector('.prev');
            const next = container.querySelector('.next');

            if (prev) prev.removeEventListener('click', () => this.plusSlides(-1));
            if (next) next.removeEventListener('click', () => this.plusSlides(1));
        }*/
    }

    /*plusSlides(n, container) {
        this.showSlides(this.slideIndex += n, this.currentContainer);
    }

    currentSlide(n, container) {
        this.showSlides(this.slideIndex = n, this.currentContainer);
    }

    showSlides(n, container) {
        const slides = container.querySelectorAll(".slides");
        if (!slides.length) return;

        if (n > slides.length) this.slideIndex = 1;
        if (n < 1) this.slideIndex = slides.length;

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        slides[this.slideIndex - 1].style.display = "block";
    }*/

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
        fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/property?id=${id}`)
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

        const formattedPrice = this.formatNumberWithDot(data.price);
        this.setElementText(container, "#property-price", formattedPrice);
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

    setElementAttribute(container, selector, attribute, value) {
        const element = container.querySelector(selector);
        if (element && value) {
            element.setAttribute(attribute, value);
        }
    }

    handleError(error) {
        const container = this.currentContainer || document.querySelector(`.${this.className}`);
        if (container) {
            const mainContent = container.querySelector("#main-content") || container;
            mainContent.innerHTML = "<p>Nu s-au putut încărca detaliile proprietății.</p>";
        }
    }

    loadProperty(propertyId) {
        if (propertyId && propertyId > 0) {
            this.loadPropertyDetails(propertyId);
        } else {
            console.error('Invalid property ID provided');
        }
    }
}