class SiteLayout extends HTMLElement {
  // This function runs when <site-layout> appears in the HTML
  async connectedCallback() {
    // Create a shadow DOM so styles and content don't leak outside
    const shadow = this.attachShadow({ mode: 'open' });

    // Load the layout HTML and CSS from files
    const [html, css] = await Promise.all([
      fetch('/Components/layout/SiteLayout.html').then(res => res.text()),
      fetch('/Components/layout/SiteLayout.css').then(res => res.text())
    ]);

    // Inject the loaded HTML and CSS into the shadow DOM
    shadow.innerHTML = `<style>${css}</style>${html}`;

    // Find the content area where page components will be inserted
    this.contentArea = shadow.querySelector('#content-area');

    // Get the first page to load based on the URL (e.g. #home )
    const initialPage = location.hash ? location.hash.substring(1) : 'home';
    this.loadPage(initialPage, false); // Load that page

    // Listen for custom navigation events (triggered by JS navigation)
    window.addEventListener('navigate', (e) => {
      this.loadPage(e.detail.page);
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      const page = e.state?.page || 'home';
      this.loadPage(page, false);
    });
  }

  // This function loads and shows a page like <home-page>, <apply-online-page>, etc.
  async loadPage(page, pushState = true) {
    // Stop if content area is missing
    if (!this.contentArea) return;

    const tagName = `${page}-page`;  // Custom tag name (e.g. <home-page>  </home-page>)
    const folderName = page;         // Folder name should match page name eg. home , apply-online, edc-sicip-officials and file name eg. HomePage, ApplyOnlinePage
    const jsPath = `/Components/pages/${folderName}/${capitalize(page)}Page.js`; // Path to JS file

    // Check if the custom tag is already defined
    if (!customElements.get(tagName)) {
      try {
        await import(jsPath);
      } catch (err) {
        console.error(`Failed to load component ${tagName} from ${jsPath}`, err);
        this.contentArea.innerHTML = `<p>Page not found: ${page}</p>`;
        return;
      }
    }

    // Insert the page component inside the layout (in <div id="content-area"> eg. <home> </home>)
    this.contentArea.innerHTML = `<${tagName}></${tagName}>`;

    // Update the browser history (so URL updates to #page)
    if (pushState) {
      history.pushState({ page }, '', `#${page}`);
    }
  }
}

// Helper function to capitalize the first letter of a string (e.g. "home" → "Home")
function capitalize(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}



customElements.define('site-layout', SiteLayout);
