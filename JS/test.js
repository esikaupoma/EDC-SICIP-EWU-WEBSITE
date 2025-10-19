document.addEventListener('DOMContentLoaded', function () {
    const carouselTrack = document.querySelector('.carousel-track');
    const noticeItems = Array.from(document.querySelectorAll('.notice-item'));
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    let currentIndex = 0;
    const itemWidth = noticeItems[0].offsetWidth + 10; // Includes margin
    const maxIndex = noticeItems.length - Math.floor(carouselTrack.offsetWidth / itemWidth);

    function updateCarousel() {
        const newPosition = -currentIndex * itemWidth;
        carouselTrack.style.transform = `translateX(${newPosition}px)`;
        updateButtons();
    }

    function updateButtons() {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= maxIndex;
    }

    nextButton.addEventListener('click', function () {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevButton.addEventListener('click', function () {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // Initialize carousel position and button states
    updateCarousel();
});
