document.addEventListener('DOMContentLoaded', function () {
    const track = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.prev-btn');
    const nextButton = document.querySelector('.next-btn');
    const items = document.querySelectorAll('.notice-item');
    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth + 10; // Adjust for item margin
    const maxIndex = items.length - Math.floor(track.offsetWidth / itemWidth);

    function updateCarousel() {
        const newPosition = -currentIndex * itemWidth;
        track.style.transform = `translateX(${newPosition}px)`;
    }

    nextButton.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // Add mouse move event for horizontal scrolling
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
        if (!isMouseDown) return; // Stop the fn from running if mouse is not down
        e.preventDefault(); // Prevent text selection
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2; // The multiplier can adjust the scroll speed
        track.scrollLeft = scrollLeft - walk;
    });
});
