class EventCalendar extends HTMLElement {
    constructor() {
        super();
        this.eventData = {
            "2024-11-10": ["Holiday", "yellow"],
            "2020-07-23": ["Event", "red"],
            "2024-11-12": ["Holiday", "yellow", "Event", "red", "Birthday", "blue"],
        };
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
        this.selectedDate = null;
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        const [html, css] = await Promise.all([
            fetch('/Components/event-calendar/EventCalendar.html').then(res => res.text()),
            fetch('/Components/event-calendar/EventCalendar.css').then(res => res.text())
        ]);

        shadow.innerHTML = `<style>${css}</style>${html}`;

        // Set initial year display
        shadow.querySelector('#year').textContent = this.currentYear;

        this.loadCalendar(this.currentYear, this.currentMonth);

        // Add event listeners for navigation
        shadow.querySelector('.prev-year').addEventListener('click', () => this.prevYear());
        shadow.querySelector('.next-year').addEventListener('click', () => this.nextYear());

        // Add event listeners for month selection
        const monthItems = shadow.querySelectorAll('.months li');
        monthItems.forEach((item, index) => {
            if (index === this.currentMonth) {
                item.classList.add('active');
            }
            item.addEventListener('click', () => {
                this.setMonth(index);
                monthItems.forEach(m => m.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    loadCalendar(year, month) {
        const shadow = this.shadowRoot;
        const dates = shadow.getElementById('dates');
        dates.innerHTML = '';
        shadow.querySelector('#year').textContent = year;
        shadow.getElementById('month-name').textContent = new Date(year, month).toLocaleString('default', { month: 'long' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Show last few days from the previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            const prevMonthDay = prevMonthDays - i;
            const prevMonth = month === 0 ? 12 : month;
            const prevYear = month === 0 ? year - 1 : year;
            const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevMonthDay).padStart(2, '0')}`;

            const dateElement = document.createElement('span');
            dateElement.className = 'date prev-month';
            dateElement.textContent = prevMonthDay;
            dateElement.addEventListener('click', () => this.showEventsForDate(dateStr));
            dates.appendChild(dateElement);
        }

        // Add days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let classes = 'date';
            let eventDots = '';

            if (dateStr === new Date().toISOString().slice(0, 10)) {
                classes += ' current-date';
            }

            if (this.eventData[dateStr]) {
                const colors = this.eventData[dateStr].filter((_, index) => index % 2 === 1).slice(0, 3);
                eventDots = colors.map(color => `<div class="event-dot ${color}"></div>`).join('');
            }

            const dateElement = document.createElement('span');
            dateElement.className = classes;
            dateElement.innerHTML = `${day}<div class="event-dots">${eventDots}</div>`;

            // Add click event listener for the date
            dateElement.addEventListener('click', () => {
                // Remove selected class from previously selected date
                const prevSelected = dates.querySelector('.selected-date');
                if (prevSelected) {
                    prevSelected.classList.remove('selected-date');
                }

                // Add selected class to clicked date
                dateElement.classList.add('selected-date');

                // Show events for this date
                this.showEventsForDate(dateStr);
            });

            dates.appendChild(dateElement);
        }

        // Fill in the remaining cells with next month's starting days
        const totalCells = firstDay + daysInMonth;
        const nextDays = 42 - totalCells; // Ensures 6 full weeks

        for (let i = 1; i <= nextDays; i++) {
            const nextMonth = month === 11 ? 1 : month + 2;
            const nextYear = month === 11 ? year + 1 : year;
            const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            const dateElement = document.createElement('span');
            dateElement.className = 'date next-month';
            dateElement.textContent = i;
            dateElement.addEventListener('click', () => this.showEventsForDate(dateStr));
            dates.appendChild(dateElement);
        }

        // Load events for this month
        this.loadEventsForMonth(year, month);
    }

    showEventsForDate(dateStr) {
        const shadow = this.shadowRoot;
        const eventList = shadow.querySelector('.event-list');
        eventList.innerHTML = ''; // Clear existing events

        if (this.eventData[dateStr]) {
            const events = this.eventData[dateStr];
            events.forEach((event, index) => {
                if (index % 2 === 0) {
                    const eventColor = events[index + 1];
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const eventDate = new Date(year, month - 1, day);
                    const formattedDate = `
                        <span class="day">${day}</span> 
                        <span class="month-year">${eventDate.toLocaleString('default', { month: 'short' })}, ${year}</span>
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
        } else {
            const noEventMessage = document.createElement('div');
            noEventMessage.classList.add('no-events');
            noEventMessage.textContent = 'No events scheduled for this date.';
            eventList.appendChild(noEventMessage);
        }
    }

    loadEventsForMonth(year, month) {
        const shadow = this.shadowRoot;
        const eventList = shadow.querySelector('.event-list');
        eventList.innerHTML = ''; // Clear existing events

        let hasEvents = false;

        Object.keys(this.eventData).forEach(dateStr => {
            const [eventYear, eventMonth, eventDay] = dateStr.split('-').map(Number);
            if (eventYear === year && eventMonth - 1 === month) {
                const events = this.eventData[dateStr];
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

    setMonth(month) {
        if (month < 0) {
            this.currentYear--;
            this.currentMonth = 11;
        } else if (month > 11) {
            this.currentYear++;
            this.currentMonth = 0;
        } else {
            this.currentMonth = month;
        }
        this.loadCalendar(this.currentYear, this.currentMonth);
    }

    nextYear() {
        this.currentYear++;
        this.loadCalendar(this.currentYear, this.currentMonth);
    }

    prevYear() {
        this.currentYear--;
        this.loadCalendar(this.currentYear, this.currentMonth);
    }
}

customElements.define('event-calendar', EventCalendar);
