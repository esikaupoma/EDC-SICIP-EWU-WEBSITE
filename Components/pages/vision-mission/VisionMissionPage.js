class VisionMissionPage extends HTMLElement {
    async connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        const [html, css] = await Promise.all([
            fetch('/Components/pages/vision-mission/VisionMissionPage.html').then(res => res.text()),
            fetch('/Components/pages/vision-mission/VisionMissionPage.css').then(res => res.text())
        ]);

        shadow.innerHTML = `<style>${css}</style>${html}`;
    }
}

customElements.define('vision-mission-page', VisionMissionPage);