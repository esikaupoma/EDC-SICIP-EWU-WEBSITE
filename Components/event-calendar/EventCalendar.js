class EventCalendar extends HTMLElement {
    constructor() {
        super();
        this.eventData = {
            "2025-06-23": [
                { title: "Orientation", color: "red", location: "Auditorium A" }
            ],
            "2024-11-12": [
                { title: "Event1", color: "yellow", location: "Room 101" },
                { title: "Event2", color: "red", location: "Main Hall" },
                { title: "Event3", color: "blue", location: "Conference Center" }
            ]
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

        shadow.querySelector('#year').textContent = this.currentYear;
        this.loadCalendar(this.currentYear, this.currentMonth);

        shadow.querySelector('.prev-year').addEventListener('click', () => this.prevYear());
        shadow.querySelector('.next-year').addEventListener('click', () => this.nextYear());

        const monthItems = shadow.querySelectorAll('.months li');
        monthItems.forEach((item, index) => {
            if (index === this.currentMonth) item.classList.add('active');
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

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let classes = 'date';
            let eventDots = '';

            if (dateStr === new Date().toISOString().slice(0, 10)) {
                classes += ' current-date';
            }

            if (this.eventData[dateStr]) {
                const colors = this.eventData[dateStr].map(e => e.color).slice(0, 3);
                eventDots = colors.map(color => `<div class="event-dot ${color}"></div>`).join('');
            }

            const dateElement = document.createElement('span');
            dateElement.className = classes;
            dateElement.innerHTML = `${day}<div class="event-dots">${eventDots}</div>`;
            dateElement.addEventListener('click', () => {
                const prevSelected = dates.querySelector('.selected-date');
                if (prevSelected) prevSelected.classList.remove('selected-date');
                dateElement.classList.add('selected-date');
                this.showEventsForDate(dateStr);
            });
            dates.appendChild(dateElement);
        }

        const totalCells = firstDay + daysInMonth;
        const nextDays = 42 - totalCells;
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

        this.loadEventsForMonth(year, month);
    }

    showEventsForDate(dateStr) {
        const shadow = this.shadowRoot;
        const eventList = shadow.querySelector('.event-list');
        eventList.innerHTML = '';

        if (this.eventData[dateStr]) {
            this.eventData[dateStr].forEach(({ title, color, location }) => {
                const [year, month, day] = dateStr.split('-').map(Number);
                const eventDate = new Date(year, month - 1, day);
                const formattedDate = `<span class="day">${day}</span> <span class="month-year">${eventDate.toLocaleString('default', { month: 'short' })}, ${year}</span>`;
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item', color);
                eventItem.innerHTML = `
                    <div class="event-date ${color}">${formattedDate}</div>
                    <div class="event-details">
                        <h3>${title}</h3>
                        <p><i class="fa-solid fa-location-dot"></i> ${location}</p>
                    </div>
                `;
                eventList.appendChild(eventItem);
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
        eventList.innerHTML = '';

        let hasEvents = false;

        Object.entries(this.eventData).forEach(([dateStr, events]) => {
            const [eventYear, eventMonth, eventDay] = dateStr.split('-').map(Number);
            if (eventYear === year && eventMonth - 1 === month) {
                hasEvents = true;
                events.forEach(({ title, color, location }) => {
                    const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
                    const formattedDate = `<span class="day">${eventDay}</span> <span class="month-year">${eventDate.toLocaleString('default', { month: 'short' })}, ${eventYear}</span>`;
                    const eventItem = document.createElement('div');
                    eventItem.classList.add('event-item', color);
                    eventItem.innerHTML = `
                        <div class="event-date ${color}">${formattedDate}</div>
                        <div class="event-details">
                            <h3>${title}</h3>
                            <p><i class="fa-solid fa-location-dot"></i> ${location}</p>
                        </div>
                    `;
                    eventList.appendChild(eventItem);
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
