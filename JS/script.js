document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger-menu');
    const navBar = document.querySelector('.nav-bar');
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    const noticeContent = document.querySelector('.notice-content');

    hamburger.addEventListener('click', function () {
        navBar.classList.toggle('active');
    });

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');

        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                menu.classList.toggle('active');
            }
        });
    });

    // Freeze the notice animation on hover
    noticeContent.addEventListener('mouseenter', function () {
        this.style.animationPlayState = 'paused'; // Pause animation on hover
    });

    noticeContent.addEventListener('mouseleave', function () {
        this.style.animationPlayState = 'running'; // Resume animation when not hovered
    });

    // Slideshow functionality
    let slideIndex = 0;
    let slideshowInterval;

    function showSlides() {
        const slides = document.querySelectorAll('.slides');
        const indicators = document.querySelectorAll('.indicator');
        slides.forEach((slide, index) => {
            slide.style.display = index === slideIndex ? 'block' : 'none';
            indicators[index].classList.toggle('active', index === slideIndex);
        });
    }

    function changeSlide(n) {
        slideIndex = (slideIndex + n + document.querySelectorAll('.slides').length) % document.querySelectorAll('.slides').length;
        showSlides();
    }

    function startSlideshow() {
        slideshowInterval = setInterval(() => {
            slideIndex = (slideIndex + 1) % document.querySelectorAll('.slides').length;
            showSlides();
        }, 3000); // Change image every 3 seconds
    }

    document.querySelector('.slideshow-container').addEventListener('mouseenter', () => {
        clearInterval(slideshowInterval);
    });

    document.querySelector('.slideshow-container').addEventListener('mouseleave', startSlideshow);

    // Add click event to indicators
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.setAttribute('data-index', index);
        indicator.addEventListener('click', function () {
            slideIndex = parseInt(this.getAttribute('data-index'));
            showSlides();
        });
    });

    // Initialize slideshow
    showSlides();
    startSlideshow();

    // Add event listeners for prev/next buttons
    document.querySelector('.prev').addEventListener('click', () => changeSlide(-1));
    document.querySelector('.next').addEventListener('click', () => changeSlide(1));
});
