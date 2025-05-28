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
        // Close the mobile menu
        const nav = shadow.querySelector('nav');
        const hamburger = shadow.querySelector('.hamburger-menu');
        const icon = hamburger.querySelector('.material-symbols-outlined');
        nav.classList.remove('nav-active');
        icon.textContent = 'menu';
      });
    });

    const hamburger = shadow.querySelector('.hamburger-menu');
    const nav = shadow.querySelector('nav');
    const icon = hamburger.querySelector('.material-symbols-outlined');

    hamburger.addEventListener('click', () => {
      nav.classList.toggle('nav-active');
      

      if (nav.classList.contains('nav-active')) {
        icon.textContent = 'close';
      } else {
        icon.textContent = 'menu';
      }
    });

    const dropdownButtons = shadow.querySelectorAll('.nav-item-dropdown > button');
    dropdownButtons.forEach(button => {
      button.addEventListener('click', (e) => {
          e.stopPropagation(); 
          const dropdown = button.parentElement;
          const wasActive = dropdown.classList.contains('active');
          
          // Close all dropdowns
          dropdownButtons.forEach(otherButton => {
            otherButton.parentElement.classList.remove('active');
          });
          
          if (!wasActive) {
            dropdown.classList.add('active');
          }
      });
    });
    // Close dropdowns when clicking anywhere else
    document.addEventListener('click', () => {
      dropdownButtons.forEach(button => {
        button.parentElement.classList.remove('active');
      });
    });
  }
}

customElements.define('site-header', SiteHeader);
