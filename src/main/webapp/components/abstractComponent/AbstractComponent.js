export class AbstractComponent {
    constructor() {
        this.template = '';
        this.className = '';
        this.templateLoaded = false;
        this.cssLink = null;
    }

    getTemplate() {
        return this.template;
    }

    setTemplate(template) {
        this.template = template;
    }

    setClassName(className) {
        this.className = className;
    }

    render() {
        throw new Error('Render method must be overriden in the subclass');
    }

    async init(){
        this.loadCssStyles();
        await this.loadHtmlTemplate();
    }

    loadCssStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `./components/${this.className}/${this.className}.css`;
        document.head.appendChild(link);
        this.cssLink = link;
        console.log(`CSS styles loaded for ${this.className}:`, link.href);
    }

    removeCssStyles() {
        if (this.cssLink) {
            this.cssLink.remove();
            console.log(`CSS styles removed for ${this.className}`);
            this.cssLink = null;
        }
    }

    async loadHtmlTemplate() {
        if (!this.templateLoaded){
            const response = await fetch(`./components/${this.className}/${this.className}.html`);
            const template = await response.text();
            this.template = template;
            this.templateLoaded = true;
        }
    }

    eventListenerLoader() {
        throw new Error('Event listener loader method must be overriden in the subclass');
    }

    eventListenerRemover() {
        throw new Error('Event listener remover method must be overriden in the subclass');
    }

    destroy() {
        this.removeCssStyles();
    }
}