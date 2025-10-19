class SiteHeader extends HTMLElement {
  async connectedCallback() {
    // Prevent double-render: if a header was already rendered, remove this placeholder
    if (document.querySelector('header[data-site-header]')) {
      this.remove();
      return;
    }

    // Load HTML into this element (instead of shadow DOM) so Bootstrap CSS/JS apply
    const html = await fetch('/Components/layout/header/SiteHeader.html').then(res => res.text());
    this.innerHTML = html;

    // Mark the rendered header so future SiteHeader instances skip rendering
    const hdr = this.querySelector('header');
    if (hdr) hdr.setAttribute('data-site-header', 'true');

    // Attach event handlers for navigation buttons
    const buttons = this.querySelectorAll('button[data-page]');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const page = button.getAttribute('data-page');
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));

        // If offcanvas is open, hide it
        const offcanvasEl = document.getElementById('mainOffcanvas');
        if (offcanvasEl) {
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
          bsOffcanvas.hide();
        }
      });
    });

    // Enhance accessibility: ensure dropdown toggles have proper aria attributes (Bootstrap handles most)
    // No extra dropdown JS required because Bootstrap's data attributes handle dropdowns.
    // Ensure body content isn't hidden under fixed header: set padding-top to header height
    const adjustBodyPadding = () => {
      const hdr = this.querySelector('header');
      if (hdr) document.body.style.paddingTop = `${hdr.offsetHeight}px`;
    };

    // Run once and on resize
    adjustBodyPadding();
    window.addEventListener('resize', adjustBodyPadding);

    // Recompute when offcanvas shows/hides (Bootstrap events)
    const offcanvasEl = document.getElementById('mainOffcanvas');
    if (offcanvasEl) {
      offcanvasEl.addEventListener('shown.bs.offcanvas', adjustBodyPadding);
      offcanvasEl.addEventListener('hidden.bs.offcanvas', adjustBodyPadding);
    }
  }
}

customElements.define('site-header', SiteHeader);
