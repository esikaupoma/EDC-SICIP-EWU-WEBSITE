class PSCPage extends HTMLElement {
    async connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        const [html, css] = await Promise.all([
            fetch('/Components/pages/p-s-c/PSCPage.html').then(res => res.text()),
            fetch('/Components/pages/p-s-c/PSCPage.css').then(res => res.text())
        ]);

        shadow.innerHTML = `<style>${css}</style>${html}`;
    }
}

customElements.define('p-s-c-page', PSCPage);