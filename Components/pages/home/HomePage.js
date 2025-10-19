class HomePage extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Load HTML and CSS
    const htmlPromise = fetch('/Components/pages/home/HomePage.html').then(res => res.text());
    const cssPromise = fetch('/Components/pages/home/HomePage.css').then(res => res.text());

    Promise.all([htmlPromise, cssPromise]).then(results => {
      const html = results[0], css = results[1];
      shadow.innerHTML = `<style>${css}</style>${html}`;

      // Initialize Bootstrap carousel instance inside the shadow root (Bootstrap is loaded globally)
      const galleryEl = shadow.querySelector('#galleryCarousel');
      if (galleryEl) {
        // Wait for bootstrap to be available (should be loaded from index.html)
        const initCarousel = () => {
          if (window.bootstrap && typeof bootstrap.Carousel === 'function') {
            // Dispose any existing instance to avoid duplicate timers
            try {
              const existing = bootstrap.Carousel.getInstance(galleryEl);
              if (existing) existing.dispose();
            } catch (err) {
              // ignore
            }

            // Create a single Carousel instance with a sensible interval (3000ms)
            const bsCarousel = new bootstrap.Carousel(galleryEl, { interval: 3000 });

            // Ensure handlers attach only once
            if (!galleryEl.dataset.carouselInit) {
              // Wire indicator buttons inside the shadow DOM to control the carousel
              const indicators = shadow.querySelectorAll('.carousel-indicators button[data-bs-slide-to]');
              indicators.forEach((btn, idx) => {
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  bsCarousel.to(idx);
                });
              });

              // Wire prev/next controls inside shadow
              const prevBtn = shadow.querySelector('.carousel-control-prev');
              const nextBtn = shadow.querySelector('.carousel-control-next');
              if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); bsCarousel.prev(); });
              if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); bsCarousel.next(); });

              // Pause on hover and resume on leave to avoid accidental fast cycling
              galleryEl.addEventListener('mouseenter', () => bsCarousel.pause());
              galleryEl.addEventListener('mouseleave', () => bsCarousel.cycle());

              // Small delay to ensure no duplicate timers from earlier inits; start cycling once
              setTimeout(() => {
                try { bsCarousel.pause(); } catch (e) { }
                try { bsCarousel.cycle(); } catch (e) { }
              }, 50);

              galleryEl.dataset.carouselInit = 'true';
            }
          } else {
            // Retry shortly if bootstrap not yet available
            setTimeout(initCarousel, 50);
          }
        };
        initCarousel();
      }

      // ----------------- Button Navigation ----------------- //
      const buttons = shadow.querySelectorAll('button[data-page]');
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const page = button.getAttribute('data-page');
          window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
        });
      });

      // ----------------- Hero Background Carousel ----------------- //
      const heroSlides = shadow.querySelectorAll('.hero-slide');
      let heroIndex = 0;

      function showHeroSlide(index) {
        heroSlides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      }

      function nextHeroSlide() {
        heroIndex = (heroIndex + 1) % heroSlides.length;
        showHeroSlide(heroIndex);
      }

      function prevHeroSlide() {
        heroIndex = (heroIndex - 1 + heroSlides.length) % heroSlides.length;
        showHeroSlide(heroIndex);
      }

      // Auto-slide every 3s
      let heroInterval = setInterval(nextHeroSlide, 3000);

      function resetHeroInterval() {
        clearInterval(heroInterval);
        heroInterval = setInterval(nextHeroSlide, 3000);
      }

      // Show initial slide
      showHeroSlide(heroIndex);



      // ------------------------------ Info Cards -------------------------- //
      const cards = shadow.querySelectorAll('.info-card'); // use shadow root

      function fadeInOnScroll() {
        const triggerBottom = window.innerHeight * 0.85;

        cards.forEach(card => {
          const cardTop = card.getBoundingClientRect().top;
          if (cardTop < triggerBottom) {
            card.classList.add('animate');
          }
        });
      }

      window.addEventListener('scroll', fadeInOnScroll);
      window.addEventListener('load', fadeInOnScroll);


      // ----------------- Main Slideshow (Picture Carousel) ----------------- //
      // let slideIndex = 0;
      // let slideshowInterval;
      // const slides = shadow.querySelectorAll('.slides');
      // const indicators = shadow.querySelectorAll('.indicator');
      // const prevBtn = shadow.querySelector('.prev');
      // const nextBtn = shadow.querySelector('.next');
      // const slideshowContainer = shadow.querySelector('.slideshow-container');

      // function showSlides() {
      //   slides.forEach((slide, index) => {
      //     slide.style.display = (index === slideIndex) ? 'block' : 'none';
      //     if (indicators[index]) {
      //       indicators[index].classList.toggle('active', index === slideIndex);
      //     }
      //   });
      // }

      // function changeSlide(n) {
      //   slideIndex = (slideIndex + n + slides.length) % slides.length;
      //   showSlides();
      // }

      // function startSlideshow() {
      //   slideshowInterval = setInterval(() => {
      //     slideIndex = (slideIndex + 1) % slides.length;
      //     showSlides();
      //   }, 4000);
      // }

      // function stopSlideshow() {
      //   clearInterval(slideshowInterval);
      // }

      // showSlides();
      // startSlideshow();

      // if (slideshowContainer) {
      //   slideshowContainer.addEventListener('mouseenter', stopSlideshow);
      //   slideshowContainer.addEventListener('mouseleave', startSlideshow);
      // }

      // indicators.forEach((indicator, index) => {
      //   indicator.addEventListener('click', () => {
      //     slideIndex = index;
      //     showSlides();
      //   });
      // });

      // if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
      // if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

      // ----------------- News Carousel Setup ----------------- //
      function setupSlickDotsNewsBoard() {
        const newsCarouselBoard = shadow.querySelector('.news-carousel');
        const newsItemsBoard = shadow.querySelectorAll('.news-carousel .news-item');
        const slickDots = shadow.querySelector('.slick-dots');

        if (!newsCarouselBoard || !newsItemsBoard.length || !slickDots) return;

        let newsIndexBoard = 0;
        let newsIntervalBoard;
        let visibleCount = 1;
        let itemWidth = 270;

        function updateVisibleCount() {
          const containerWidth = newsCarouselBoard.offsetWidth;
          itemWidth = newsItemsBoard[0] ? newsItemsBoard[0].offsetWidth : 270;
          visibleCount = Math.floor(containerWidth / itemWidth) || 1;
        }

        function showNewsBoard(index, forceUpdate) {
          if (forceUpdate) updateVisibleCount();
          const totalItems = newsItemsBoard.length;
          const totalPages = Math.ceil(totalItems / visibleCount);
          const maxStartIndex = (totalPages - 1) * visibleCount;
          const start = Math.min(Math.floor(index / visibleCount) * visibleCount, maxStartIndex);
          const end = start + visibleCount;

          newsItemsBoard.forEach(item => {
            item.style.display = 'none';
            item.classList.remove('news-fade-in');
          });

          const visibleItems = [];
          for (let i = start; i < end && i < totalItems; i++) {
            const item = newsItemsBoard[i];
            item.style.display = 'block';
            void item.offsetWidth; // trigger reflow for animation
            item.classList.add('news-fade-in');
            visibleItems.push(item);
          }

          const totalGap = (visibleItems.length - 1) * 20;
          const totalWidth = visibleItems.length * itemWidth + totalGap;
          const containerWidth = newsCarouselBoard.offsetWidth;
          const padding = Math.max(0, (containerWidth - totalWidth) / 2);
          newsCarouselBoard.style.paddingLeft = padding + 'px';
          newsCarouselBoard.style.paddingRight = padding + 'px';

          Array.from(slickDots.children).forEach((li, i) => {
            li.classList.toggle('slick-active', i === Math.floor(start / visibleCount));
          });

          newsIndexBoard = start;
        }

        function createSlickDots() {
          updateVisibleCount();
          slickDots.innerHTML = '';
          const dotCount = Math.ceil(newsItemsBoard.length / visibleCount);
          for (let i = 0; i < dotCount; i++) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = '<span></span>';
            ((index) => {
              btn.addEventListener('click', () => {
                const targetIndex = index * visibleCount;
                if (newsIndexBoard !== targetIndex) showNewsBoard(targetIndex);
              });
            })(i);
            li.appendChild(btn);
            slickDots.appendChild(li);
          }
        }

        function nextNewsBoard() {
          const totalPages = Math.ceil(newsItemsBoard.length / visibleCount);
          const currentPage = Math.floor(newsIndexBoard / visibleCount);
          const nextPage = (currentPage + 1) % totalPages;
          showNewsBoard(nextPage * visibleCount);
        }

        function startNewsAutoBoard() {
          newsIntervalBoard = setInterval(nextNewsBoard, 5000);
        }

        function stopNewsAutoBoard() {
          clearInterval(newsIntervalBoard);
        }

        newsCarouselBoard.addEventListener('mouseenter', stopNewsAutoBoard);
        newsCarouselBoard.addEventListener('mouseleave', startNewsAutoBoard);

        window.addEventListener('resize', () => {
          const oldVisible = visibleCount;
          updateVisibleCount();
          if (oldVisible !== visibleCount) {
            createSlickDots();
            showNewsBoard(newsIndexBoard = 0, true);
          }
        });

        updateVisibleCount();
        createSlickDots();
        showNewsBoard(newsIndexBoard, true);
        // startNewsAutoBoard(); // Disabled auto sliding
      }

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

    });
  }
}

customElements.define('home-page', HomePage);
