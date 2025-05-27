class EdcSicipOfficialsPage extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const [html, css] = await Promise.all([
      fetch('/Components/pages/edc-sicip-officials/Edc-sicip-officialsPage.html').then(res => res.text()),
      fetch('/Components/pages/edc-sicip-officials/Edc-sicip-officialsPage.css').then(res => res.text())
    ]);

    shadow.innerHTML = `<style>${css}</style>${html}`;
  }
}

customElements.define('edc-sicip-officials-page', EdcSicipOfficialsPage);