class SiteLayout extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Load layout HTML + CSS
    const [html, css] = await Promise.all([
      fetch('/Components/layout/SiteLayout.html').then(res => res.text()),
      fetch('/Components/layout/SiteLayout.css').then(res => res.text())
    ]);

    shadow.innerHTML = `<style>${css}</style>${html}`;

    this.contentArea = shadow.querySelector('#content-area');

    // Load default page based on URL hash or fallback to 'home' 
    const initialPage = location.hash ? location.hash.substring(1) : 'home';
    this.loadPage(initialPage, false);

    // Listen for custom navigation events
    window.addEventListener('navigate', (e) => {
      this.loadPage(e.detail.page);
    });

    // Handle back/forward browser buttons
    window.addEventListener('popstate', (e) => {
      const page = e.state?.page || 'home';
      this.loadPage(page, false);
    });
  }

  async loadPage(page, pushState = true) {
    if (!this.contentArea) return;

    const tagName = `${page}-page`;  // e.g. edcSicipOfficials-page 
    const folderName = page;         // match folder name exactly
    const jsPath = `/Components/pages/${folderName}/${capitalize(page)}Page.js`;

    // Dynamically load the page component
    if (!customElements.get(tagName)) {
      try {
        await import(jsPath);
      } catch (err) {
        console.error(`Failed to load component ${tagName} from ${jsPath}`, err);
        this.contentArea.innerHTML = `<p>Page not found: ${page}</p>`;
        return;
      }
    }

    // Inject the page component tag
    this.contentArea.innerHTML = `<${tagName}></${tagName}>`;

    // Push to browser history if needed
    if (pushState) {
      history.pushState({ page }, '', `#${page}`);
    }
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

customElements.define('site-layout', SiteLayout);
