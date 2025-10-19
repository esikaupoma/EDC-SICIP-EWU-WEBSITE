class NoticeBoardPage extends HTMLElement {
    async connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        // Load HTML and CSS
        const [html, css] = await Promise.all([
            fetch('/Components/pages/notice-board/NoticeBoardPage.html').then(res => res.text()),
            fetch('/Components/pages/notice-board/NoticeBoardPage.css').then(res => res.text())
        ]);

        shadow.innerHTML = `<style>${css}</style>${html}`;

        // Wait for DOM to render inside shadow
        await this.setupNoticeBoard(shadow);
    }

    async setupNoticeBoard(shadow) {
        const notices = [
            { date: "30-04-2025", title: "Admission Test Results (Batch 5 and 6)", pdf: "/Resources/files/AdmissionResultBatch-5&6.pdf" },
            { date: "30-12-2024", title: "Admission Test Results (Batch 3 and 4)", pdf: "/Resources/files/AdmissionResultBatch-3&4.pdf" },
            { date: "29-09-2024", title: "Admission Test Results (Batch 1 and 2)", pdf: "/Resources/files/AdmissionResultBatch-1&2.pdf" },
            { date: "10-08-2024", title: "Orientation Schedule for New Students", pdf: "/Resources/files/Orientation.pdf" },
            { date: "25-07-2024", title: "Semester Final Exam Routine", pdf: "/Resources/files/ExamRoutine.pdf" },
            { date: "15-07-2024", title: "Mid-Term Notice for All Programs", pdf: "/Resources/files/MidTermNotice.pdf" },
            { date: "01-07-2024", title: "Class Schedule Update", pdf: "/Resources/files/ScheduleUpdate.pdf" },
            { date: "20-06-2024", title: "Library Hour Extension", pdf: "/Resources/files/LibraryNotice.pdf" },
            { date: "10-06-2024", title: "Lab Maintenance Notice", pdf: "/Resources/files/LabMaintenance.pdf" },
            { date: "01-06-2024", title: "New Faculty Introduction", pdf: "/Resources/files/NewFaculty.pdf" },
            { date: "01-05-2024", title: "Course Registration Deadline", pdf: "/Resources/files/RegistrationDeadline.pdf" },
            { date: "15-04-2024", title: "Holiday Notice for Eid", pdf: "/Resources/files/HolidayEid.pdf" }
        ];

        const noticesPerPage = 10;
        let currentPage = 1;

        const noticeList = shadow.querySelector('#notice-list');
        const prevBtn = shadow.querySelector('#prev-btn');
        const nextBtn = shadow.querySelector('#next-btn');

        function renderNotices() {
            const start = (currentPage - 1) * noticesPerPage;
            const end = start + noticesPerPage;
            const currentNotices = notices.slice(start, end);

            noticeList.innerHTML = '';

            currentNotices.forEach(notice => {
                const item = document.createElement('div');
                item.className = 'notice-item';
                item.innerHTML = `
                    <div class="notice-info">
                        <a href="${notice.pdf}" class="notice-title" target="_blank">${notice.title}</a>
                        <div class="notice-date"><i class="fa-regular fa-calendar-days"></i> ${notice.date}</div>
                    </div>
                    <button class="open-pdf-btn" onclick="window.open('${notice.pdf}', '_blank')">+</button>
                `;
                noticeList.appendChild(item);
            });

            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = end >= notices.length;
        }

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderNotices();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage * noticesPerPage < notices.length) {
                currentPage++;
                renderNotices();
            }
        });

        renderNotices();
    }
}

customElements.define('notice-board-page', NoticeBoardPage);
