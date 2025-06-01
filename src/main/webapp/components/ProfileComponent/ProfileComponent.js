import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class ProfileComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
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
        // const buton = container.querySelector('.home-button');
        // buton.addEventListener('click', this.handleClick);
    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            const buton = container.querySelector('.home-button');
            if (buton) {
                buton.removeEventListener('click', this.handleClick);
            }
        }
    }

    //@Override
    destroy(){
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.eventListenerRemover(container);
        super.destroy();
    }

    //@Override
    render(){
        const container = document.createElement('div');
        container.className = this.className;
        container.innerHTML = this.template;
        this.eventListenerLoader(container);
        console.log(`Template render loaded for ${this.className}:`, this.template);
        console.log(window.sessionStorage.getItem("jwt"));
        return container;
    }

    handleClick(event) {
        event.preventDefault();
        alert('Button clicked in ProfileComponent!');
    }

    dynamicallyLoadData() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();
        // Add logic to dynamically load data into the component
        console.log(`Dynamically loading data for ${this.className}`);
    }
}