class ApplyOnlinePage extends HTMLElement {
    async connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        const [html, css] = await Promise.all([
            fetch('/Components/pages/apply-online/ApplyOnlinePage.html').then(res => res.text()),
            fetch('/Components/pages/apply-online/ApplyOnlinePage.css').then(res => res.text())
        ]);

        shadow.innerHTML = `<style>${css}</style>${html}`;
    }
}

customElements.define('apply-online-page', ApplyOnlinePage);

