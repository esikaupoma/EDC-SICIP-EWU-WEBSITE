class WhoWeArePage extends HTMLElement {
    async connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        const [html, css] = await Promise.all([
            fetch('/Components/pages/who-we-are/WhoWeArePage.html').then(res => res.text()),
            fetch('/Components/pages/who-we-are/WhoWeArePage.css').then(res => res.text())
        ]);

        shadow.innerHTML = `<style>${css}</style>${html}`;
    }
}

customElements.define('who-we-are-page', WhoWeArePage);