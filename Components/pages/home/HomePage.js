class HomePage extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const [html, css] = await Promise.all([
      fetch('/Components/pages/home/HomePage.html').then(res => res.text()),
      fetch('/Components/pages/home/HomePage.css').then(res => res.text())
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

    // Notice board carousel functionality
    const track = shadow.querySelector('.notice-carousel-track');
    const prevNoticeBtn = shadow.querySelector('.prev-btn');
    const nextNoticeBtn = shadow.querySelector('.next-btn');
    const noticeItems = shadow.querySelectorAll('.notice-item');
    let currentIndex = 0;
    const itemWidth = noticeItems[0]?.offsetWidth + 20; // Adjust for item margin
    const maxIndex = noticeItems.length - Math.floor(track?.offsetWidth / itemWidth);

    function updateCarousel() {
      if (!track) return;
      const newPosition = -currentIndex * itemWidth;
      track.style.transform = `translateX(${newPosition}px)`;
    }

    // Mouse drag functionality
    let isMouseDown = false;
    let startX;
    let scrollLeft;

    track?.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track?.addEventListener('mouseleave', () => {
      isMouseDown = false;
    });

    track?.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    track?.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 2;
      track.scrollLeft = scrollLeft - walk;
    });

    // Button navigation
    nextNoticeBtn?.addEventListener('click', () => {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    });

    prevNoticeBtn?.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });
  }
}

customElements.define('home-page', HomePage);
