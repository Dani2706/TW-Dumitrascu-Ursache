import { AbstractComponent } from "../abstractComponent/AbstractComponent.js";

export class HomeComponent extends AbstractComponent {
    constructor() {
        super();
        this.setClassName(this.constructor.name);
    }

    //@Override
    async init() {
        await super.init();
        // Depending on the page, you can comment the next line
        this.dynamicallyLoadData();
    }

    //@Override
    eventListenerLoader(container) {
        if (!this.templateLoaded) {
            throw new Error('Template not loaded. Call super.init() first.');
        }
        // Add event listeners to the container
    }

    //@Override
    eventListenerRemover(container) {
        if (this.templateLoaded) {
            // Remove event listeners from the container
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
        console.log(`Template render loaded for ${this.constructor.name}:`, this.template);

        return container;
    }

    dynamicallyLoadData() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.getTemplate();

        // Add logic to dynamically load data into the component

        this.setTemplate(tempDiv.innerHTML);
    }
}