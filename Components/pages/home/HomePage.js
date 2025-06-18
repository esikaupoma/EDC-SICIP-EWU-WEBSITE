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


// ---------------Notice board carousel functionality-------------------------//

// ---------------Notice board carousel functionality (Auto-Slide)-------------------------//

const track = document.querySelector('.news-carousel');
const newsItems = document.querySelectorAll('.news-item');

let currentIndex = 0;
const itemWidth = newsItems[0]?.offsetWidth + 20; // Adjust for gap/margin
const visibleItems = Math.floor(track?.offsetWidth / itemWidth);
const maxIndex = newsItems.length - visibleItems;

function updateCarousel() {
  if (!track) return;
  const newPosition = -currentIndex * itemWidth;
  track.style.transform = `translateX(${newPosition}px)`;
}

// Auto slide every 3 seconds
let autoSlide = setInterval(() => {
  currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
  updateCarousel();
}, 3000);

// Optional: pause on hover
track.addEventListener('mouseenter', () => clearInterval(autoSlide));
track.addEventListener('mouseleave', () => {
  autoSlide = setInterval(() => {
    currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    updateCarousel();
  }, 3000);
});

// Optional: Mouse drag scroll (if you still want it)
let isMouseDown = false;
let startX;
let scrollLeft;

track.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  startX = e.pageX - track.offsetLeft;
  scrollLeft = track.scrollLeft;
});

track.addEventListener('mouseleave', () => {
  isMouseDown = false;
});

track.addEventListener('mouseup', () => {
  isMouseDown = false;
});

track.addEventListener('mousemove', (e) => {
  if (!isMouseDown) return;
  e.preventDefault();
  const x = e.pageX - track.offsetLeft;
  const walk = (x - startX) * 2;
  track.scrollLeft = scrollLeft - walk;
});

  }
}

customElements.define('home-page', HomePage);
