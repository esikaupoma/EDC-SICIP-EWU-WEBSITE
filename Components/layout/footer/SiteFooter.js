class SiteFooter extends HTMLElement {
  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('/Components/layout/footer/SiteFooter.html').then(res => res.text()),
      fetch('/Components/layout/footer/SiteFooter.css').then(res => res.text())
    ]);

    // Scope CSS to this component
    const scopedCss = css.replace(/(^|\s)([^\{\}]+)\s*\{/g, (match, space, selector) => {
      // Add 'site-footer' in front of every selector
      if (selector.trim().startsWith('site-footer')) return match;
      return `${space}site-footer ${selector} {`;
    });

    const styleTag = document.createElement('style');
    styleTag.textContent = scopedCss;
    this.appendChild(styleTag);

    // Inject HTML
    this.innerHTML += html;

    // Button navigation
    const buttons = this.querySelectorAll('button[data-page]');
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
