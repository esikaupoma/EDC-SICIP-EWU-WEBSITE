class SiteHeader extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const [html, css] = await Promise.all([
      fetch('/Components/layout/header/SiteHeader.html').then(res => res.text()),
      fetch('/Components/layout/header/SiteHeader.css').then(res => res.text())
    ]);

    shadow.innerHTML = `<style>${css}</style>${html}`;

    const buttons = shadow.querySelectorAll('button[data-page]');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const page = button.getAttribute('data-page');
        // window.dispatchEvent  -->This allows each button to tell the system what page to load, based on its data-page value.
        window.dispatchEvent(new CustomEvent('navigate', {   
          detail: { page }
        }));
      });
    });
  }
}

customElements.define('site-header', SiteHeader);
