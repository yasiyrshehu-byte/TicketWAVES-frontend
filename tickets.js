document.addEventListener("DOMContentLoaded", async () => {

    const box = document.getElementById("tickets");

    if (!box) return;

    if (typeof requireAuth === "function" && !requireAuth()) {
        return;
    }

    let allTickets = [];
    let activeTab = "upcoming";

    const esc = (value) => {
        if (value === null || value === undefined) return "";
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    };


    function isPast(ticket) {

        if (ticket.isPast !== undefined) {
            return Boolean(ticket.isPast);
        }

        if (ticket.date) {

            const dateString = `${ticket.date} ${ticket.time || ""}`;

            const eventDate = new Date(dateString);

            if (!Number.isNaN(eventDate.getTime())) {
                return eventDate < new Date();
            }
        }

        return false;
    }


    function getImage(ticket) {

        return (
            ticket.image ||
            ticket.eventImage ||
            ticket.imageUrl ||
            ticket.eventImageUrl ||
            "./images/default-event.jpg"
        );
    }


    function renderTickets() {

        const filtered = allTickets.filter(ticket => {

            const past = isPast(ticket);

            return activeTab === "past" ? past : !past;
        });


        if (!filtered.length) {

            box.innerHTML = `
                <div class="tickets-empty">
                    <div class="empty-icon">🎟️</div>

                    <h2>
                        ${
                            activeTab === "past"
                                ? "No past tickets"
                                : "No upcoming tickets"
                        }
                    </h2>

                    <p>
                        ${
                            activeTab === "past"
                                ? "Your past tickets will appear here."
                                : "Tickets you purchase will appear here."
                        }
                    </p>
                </div>
            `;

            return;
        }


        box.innerHTML = filtered.map(ticket => {

            const id = ticket.id || ticket._id;

            const status = ticket.status || "active";

            return `
                <article class="my-ticket-card">

                    <div class="ticket-card-image">

                        <img
                            src="${esc(getImage(ticket))}"
                            alt="${esc(ticket.eventTitle || "Event")}"
                            onerror="this.style.display='none'"
                        >

                        <div class="ticket-card-date">

                            ${esc(ticket.date || "Event date")}

                            ${
                                ticket.time
                                    ? ` · ${esc(ticket.time)}`
                                    : ""
                            }

                        </div>

                    </div>


                    <div class="ticket-card-content">

                        <div class="ticket-status">
                            ${esc(status)}
                        </div>


                        <h2>
                            ${esc(ticket.eventTitle || "Event")}
                        </h2>


                        <p class="ticket-location">
                            ${esc(ticket.venue || "Venue")}
                        </p>


                        <p class="ticket-location">
                            ${esc(ticket.city || ticket.location || "")}
                        </p>


                        <div class="ticket-seat-summary">

                            <div>
                                <small>SECTION</small>
                                <strong>
                                    ${esc(ticket.section || "—")}
                                </strong>
                            </div>

                            <div>
                                <small>ROW</small>
                                <strong>
                                    ${esc(ticket.row || "—")}
                                </strong>
                            </div>

                            <div>
                                <small>SEAT</small>
                                <strong>
                                    ${esc(ticket.seat || "—")}
                                </strong>
                            </div>

                        </div>


                        <a
                            class="view-ticket-button"
                            href="./ticket.html?id=${encodeURIComponent(id)}"
                        >
                            <span class="ticket-barcode-icon">▥</span>
                            View Tickets
                        </a>

                    </div>

                </article>
            `;

        }).join("");
    }


    function updateCounts() {

        const upcoming = allTickets.filter(
            ticket => !isPast(ticket)
        ).length;

        const past = allTickets.filter(
            ticket => isPast(ticket)
        ).length;


        const upcomingCount =
            document.getElementById("upcomingCount");

        const pastCount =
            document.getElementById("pastCount");


        if (upcomingCount) {
            upcomingCount.textContent = upcoming;
        }

        if (pastCount) {
            pastCount.textContent = past;
        }
    }


    document.querySelectorAll(".ticket-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            document
                .querySelectorAll(".ticket-tab")
                .forEach(button => {
                    button.classList.remove("active");
                });


            tab.classList.add("active");

            activeTab = tab.dataset.tab;

            renderTickets();
        });

    });


    try {

        const response = await api("/tickets/me");

        allTickets = response.tickets || [];

        updateCounts();

        renderTickets();

    } catch (error) {

        box.innerHTML = `
            <div class="tickets-empty error">

                <div class="empty-icon">!</div>

                <h2>Unable to load tickets</h2>

                <p>
                    ${esc(error.message || "Please try again.")}
                </p>

                <button
                    class="retry-button"
                    onclick="location.reload()"
                >
                    Try Again
                </button>

            </div>
        `;
    }

});
