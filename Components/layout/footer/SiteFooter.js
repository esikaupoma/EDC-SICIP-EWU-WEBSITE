class SiteFooter extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const [html, css] = await Promise.all([
      fetch('/Components/layout/footer/SiteFooter.html').then(res => res.text()),
      fetch('/Components/layout/footer/SiteFooter.css').then(res => res.text())
    ]);

    shadow.innerHTML = `<style>${css}</style>${html}`;

    const buttons = shadow.querySelectorAll('button[data-page]');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const page = button.getAttribute('data-page');
        window.dispatchEvent(new CustomEvent('navigate', {
          detail: { page }
        }));
      });
    });
  }
}

customElements.define('site-footer', SiteFooter);