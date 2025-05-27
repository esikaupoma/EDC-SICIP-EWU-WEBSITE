class HomePage extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const [html, css] = await Promise.all([
      fetch('/Components/pages/home/HomePage.html').then(res => res.text()),
      fetch('/Components/pages/home/HomePage.css').then(res => res.text())
    ]);

    shadow.innerHTML = `<style>${css}</style>${html}`;

    // Slideshow functionality
    let slideIndex = 0;
    let slideshowInterval;

    const slides = shadow.querySelectorAll('.slides');
    const indicators = shadow.querySelectorAll('.indicator');
    const prevBtn = shadow.querySelector('.prev');
    const nextBtn = shadow.querySelector('.next');
    const slideshowContainer = shadow.querySelector('.slideshow-container');

    function showSlides() {
      slides.forEach((slide, index) => {
        slide.style.display = index === slideIndex ? 'block' : 'none';
        indicators[index]?.classList.toggle('active', index === slideIndex);
      });
    }

    function changeSlide(n) {
      slideIndex = (slideIndex + n + slides.length) % slides.length;
      showSlides();
    }

    function startSlideshow() {
      slideshowInterval = setInterval(() => {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlides();
      }, 3000);
    }

    function stopSlideshow() {
      clearInterval(slideshowInterval);
    }

    // Initialize slideshow
    showSlides();
    startSlideshow();

    // Event listeners
    if (slideshowContainer) {
      slideshowContainer.addEventListener('mouseenter', stopSlideshow);
      slideshowContainer.addEventListener('mouseleave', startSlideshow);
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        slideIndex = index;
        showSlides();
      });
    });

    prevBtn?.addEventListener('click', () => changeSlide(-1));
    nextBtn?.addEventListener('click', () => changeSlide(1));

    // OPTIONAL: Notice board carousel
    const track = shadow.querySelector('.carousel-track');
    const prevNoticeBtn = shadow.querySelector('.prev-btn');
    const nextNoticeBtn = shadow.querySelector('.next-btn');

    if (track && prevNoticeBtn && nextNoticeBtn) {
      const scrollStep = 300;

      prevNoticeBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      });

      nextNoticeBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollStep, behavior: 'smooth' });
      });
    }
  }
}

customElements.define('home-page', HomePage);
