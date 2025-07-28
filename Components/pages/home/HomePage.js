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
      }, 4000); // 4000 milliseconds = 4 seconds
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


    // ---------------News carousel functionality-------------------------//
    function setupSlickDotsNewsBoard() {
      const newsCarouselBoard = shadow.querySelector('.news-carousel');
      const newsItemsBoard = shadow.querySelectorAll('.news-carousel .news-item');
      const slickDots = shadow.querySelector('.slick-dots');

      if (!newsCarouselBoard || !newsItemsBoard.length || !slickDots) return;

      let newsIndexBoard = 0;
      let newsIntervalBoard;
      let visibleCount = 1;

      function updateVisibleCount() {
        const containerWidth = newsCarouselBoard.offsetWidth;
        const itemWidth = newsItemsBoard[0]?.offsetWidth || 250;
        visibleCount = Math.floor(containerWidth / itemWidth) || 1;
      }

      function showNewsBoard(index) {
        updateVisibleCount();

        const totalItems = newsItemsBoard.length;
        const totalPages = Math.ceil(totalItems / visibleCount);

        // Clamp index to prevent overflow (important after resize)
        const maxStartIndex = (totalPages - 1) * visibleCount;
        const start = Math.min(Math.floor(index / visibleCount) * visibleCount, maxStartIndex);
        const end = start + visibleCount;

        // Hide all
        newsItemsBoard.forEach(item => {
          item.style.display = 'none';
          item.classList.remove('news-fade-in');
        });

        // Show only the visible set
        for (let i = start; i < end && i < totalItems; i++) {
          const item = newsItemsBoard[i];
          item.style.display = 'block';
          void item.offsetWidth; // trigger reflow
          item.classList.add('news-fade-in');
        }

        // Activate current dot
        if (slickDots) {
          Array.from(slickDots.children).forEach((li, i) => {
            li.classList.toggle('slick-active', i === Math.floor(start / visibleCount));
          });
        }

        newsIndexBoard = start; // keep current index aligned
      }

      function createSlickDots() {
        updateVisibleCount();
        if (!slickDots) return;
        slickDots.innerHTML = '';

        const dotCount = Math.ceil(newsItemsBoard.length / visibleCount);
        for (let i = 0; i < dotCount; i++) {
          const li = document.createElement('li');
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.innerHTML = '<span></span>';
          btn.addEventListener('click', () => {
            const targetIndex = i * visibleCount;
            if (newsIndexBoard !== targetIndex) {
              newsIndexBoard = targetIndex;
              showNewsBoard(newsIndexBoard);
            }
          });
          li.appendChild(btn);
          slickDots.appendChild(li);
        }
      }

      function nextNewsBoard() {
        updateVisibleCount();
        const totalPages = Math.ceil(newsItemsBoard.length / visibleCount);
        const currentPage = Math.floor(newsIndexBoard / visibleCount);
        const nextPage = (currentPage + 1) % totalPages;
        newsIndexBoard = nextPage * visibleCount;
        showNewsBoard(newsIndexBoard);
      }

      function startNewsAutoBoard() {
        newsIntervalBoard = setInterval(nextNewsBoard, 5000);
      }

      function stopNewsAutoBoard() {
        clearInterval(newsIntervalBoard);
      }

      // Pause on hover
      newsCarouselBoard.addEventListener('mouseenter', stopNewsAutoBoard);
      newsCarouselBoard.addEventListener('mouseleave', startNewsAutoBoard);

      window.addEventListener('resize', () => {
        const prevVisible = visibleCount;
        updateVisibleCount();

        // Only recreate dots if count changes
        if (prevVisible !== visibleCount) {
          createSlickDots();
        }

        // Reset index to show a valid group
        showNewsBoard(newsIndexBoard = 0);
      });

      // Initialize
      createSlickDots();
      showNewsBoard(newsIndexBoard);
      startNewsAutoBoard();
    }

    // Wait for component if not loaded yet
    if (shadow.querySelector('.news-carousel') && shadow.querySelector('.slick-dots')) {
      setupSlickDotsNewsBoard();
    } else {
      const observer = new MutationObserver(() => {
        if (shadow.querySelector('.news-carousel') && shadow.querySelector('.slick-dots')) {
          observer.disconnect();
          setupSlickDotsNewsBoard();
        }
      });
      observer.observe(shadow, { childList: true, subtree: true });
    }

  }
}

customElements.define('home-page', HomePage);