const eventData = {
    "2024-11-10": ["Holiday", "yellow"],
    "2020-07-23": ["Event", "red"],
    "2024-11-12": ["Holiday", "yellow", "Event", "red", "Birthday", "blue"],
    // Add more events here with dates and colors
};

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function loadCalendar(year, month) {
    const dates = document.getElementById('dates');
    dates.innerHTML = '';
    document.getElementById('year').textContent = year;
    document.getElementById('month-name').textContent = new Date(year, month).toLocaleString('default', { month: 'long' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Show last few days from the previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        dates.innerHTML += `<span class="date prev-month">${prevMonthDays - i}</span>`;
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let classes = 'date';
        let eventDots = '';

        if (dateStr === new Date().toISOString().slice(0, 10)) {
            classes += ' current-date';
        }

        if (eventData[dateStr]) {
            const colors = eventData[dateStr].filter((_, index) => index % 2 === 1).slice(0, 3);
            eventDots = colors.map(color => `<div class="event-dot ${color}"></div>`).join('');
        }

        dates.innerHTML += `<span class="${classes}">${day}<div class="event-dots">${eventDots}</div></span>`;
    }

    // Fill in the remaining cells with next month's starting days
    const totalCells = firstDay + daysInMonth;
    const nextDays = 42 - totalCells; // Ensures 6 full weeks

    for (let i = 1; i <= nextDays; i++) {
        dates.innerHTML += `<span class="date next-month">${i}</span>`;
    }

    // Load events for this month
    loadEventsForMonth(year, month);
}

function loadEventsForMonth(year, month) {
    const eventList = document.querySelector('.event-list');
    eventList.innerHTML = ''; // Clear existing events

    let hasEvents = false;

    Object.keys(eventData).forEach(dateStr => {
        const [eventYear, eventMonth, eventDay] = dateStr.split('-').map(Number);
        if (eventYear === year && eventMonth - 1 === month) {
            const events = eventData[dateStr];
            hasEvents = true;
            events.forEach((event, index) => {
                if (index % 2 === 0) {
                    const eventColor = events[index + 1];
                    const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
                    const formattedDate = `
                        <span class="day">${eventDay}</span> 
                        <span class="month-year">${eventDate.toLocaleString('default', { month: 'short' })}, ${eventYear}</span>
                    `;
                    const eventItem = document.createElement('div');
                    eventItem.classList.add('event-item', eventColor);
                    eventItem.innerHTML = `
                        <div class="event-date ${eventColor}">
                            ${formattedDate}
                        </div>
                        <div class="event-details">
                            <h3>${event}</h3>
                            <p><i class="fa-solid fa-location-dot"></i> Location for ${event}</p>
                        </div>
                    `;
                    eventList.appendChild(eventItem);
                }
            });
        }
    });

    if (!hasEvents) {
        const noEventMessage = document.createElement('div');
        noEventMessage.classList.add('no-events');
        noEventMessage.textContent = 'No events scheduled for this month.';
        eventList.appendChild(noEventMessage);
    }
}

function setMonth(month) {
    currentMonth = month;
    loadCalendar(currentYear, currentMonth);
}

function nextYear() {
    currentYear++;
    loadCalendar(currentYear, currentMonth);
}

function prevYear() {
    currentYear--;
    loadCalendar(currentYear, currentMonth);
}

window.onload = function () {
    loadCalendar(currentYear, currentMonth);
};
