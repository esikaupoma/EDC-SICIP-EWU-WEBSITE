class SiteLayout extends HTMLElement {
  async connectedCallback() {
    // Render layout into light DOM so global styles (Bootstrap) apply
    const [html, css] = await Promise.all([
      fetch('/Components/layout/SiteLayout.html').then(res => res.text()),
      fetch('/Components/layout/SiteLayout.css').then(res => res.text())
    ]);

    this.innerHTML = `<style>${css}</style>${html}`;

    this.contentArea = this.querySelector('#content-area');

    const initialPage = location.hash ? location.hash.substring(1) : 'home';
    this.loadPage(initialPage, false);

    // Listen for custom navigation events
    window.addEventListener('navigate', (e) => {
      this.saveScrollPosition(); // save before navigating
      this.loadPage(e.detail.page);
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      this.saveScrollPosition(); // save before navigating
      const page = e.state?.page || 'home';
      this.loadPage(page, false);
    });
  }

  saveScrollPosition() {
    if (location.hash === '#home') {
      sessionStorage.setItem('homeScrollPos', window.scrollY);
    }
  }

  async loadPage(page, pushState = true) {
    if (!this.contentArea) return;

    const tagName = `${page}-page`;
    const folderName = page;
    const jsPath = `/Components/pages/${folderName}/${capitalize(page)}Page.js`;

    if (!customElements.get(tagName)) {
      try {
        await import(jsPath);
      } catch (err) {
        console.error(`Failed to load component ${tagName} from ${jsPath}`, err);
        this.contentArea.innerHTML = `<p>Page not found: ${page}</p>`;
        return;
      }
    }

    this.contentArea.innerHTML = `<${tagName}></${tagName}>`;

    if (pushState) {
      history.pushState({ page }, '', `#${page}`);
    }

    // Restore scroll position if returning to home
    if (page === 'home') {
      requestAnimationFrame(() => {
        const savedPos = sessionStorage.getItem('homeScrollPos');
        if (savedPos) {
          window.scrollTo(0, parseInt(savedPos, 10));
          sessionStorage.removeItem('homeScrollPos');
        }
      });
    } else {
      window.scrollTo(0, 0); // go to top for other pages
    }
  }
}

function capitalize(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

customElements.define('site-layout', SiteLayout);
