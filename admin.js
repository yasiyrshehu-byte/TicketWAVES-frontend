document.addEventListener("DOMContentLoaded", () => {
  const loginForm = $("loginForm");
  const dashboard = $("adminDashboard");

  // =========================
  // ADMIN LOGIN
  // =========================
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = loginForm.querySelector("button");
      btn.disabled = true;

      try {
        const d = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: $("email").value.trim().toLowerCase(),
            password: $("password").value
          })
        });

        if (d.user?.role !== "admin") {
          throw new Error(
            "This account does not have administrator access."
          );
        }

        localStorage.setItem("token", d.token);
        localStorage.setItem("user", JSON.stringify(d.user));

        location.href = "./admin.html";

      } catch (err) {
        showMessage($("msg"), err.message, "error");
        btn.disabled = false;
      }
    });

    return;
  }

  // =========================
  // ADMIN DASHBOARD
  // =========================
  if (dashboard && !requireAuth()) return;

  if (
    dashboard &&
    currentUser()?.role !== "admin"
  ) {
    dashboard.innerHTML =
      '<div class="admin-card error">Administrator access required.</div>';
    return;
  }

  loadAdmin();
});


// =========================
// LOAD ADMIN DATA
// =========================
async function loadAdmin() {
  try {
    const [stats, events, free, support] = await Promise.all([
      api("/admin/stats"),
      api("/events"),
      api("/admin/free-ticket-options"),
      api("/admin/support")
    ]);

    // Stats
    if ($("stats")) {
      $("stats").innerHTML =
        Object.entries(stats.stats || {})
          .map(
            ([key, value]) =>
              `<div class="stat">
                <b>${esc(value)}</b>
                <span>${esc(key)}</span>
              </div>`
          )
          .join("");
    }

    // Events
    if ($("eventList")) {
      $("eventList").innerHTML =
        (events.events || [])
          .map(
            (event) =>
              `<div class="admin-row">
                <b>${esc(event.title)}</b><br>
                ${esc(event.date)} ·
                ${esc(event.venue || "")},
                ${esc(event.city || "")}<br>
                <span>
                  ${Number(event.availableSeats || 0)}
                  available
                </span>
              </div>`
          )
          .join("") || "<p>No events.</p>";
    }

    // Giveaway tickets
    if ($("freeTicket")) {
      $("freeTicket").innerHTML =
        (free.options || [])
          .map(
            (ticket) =>
              `<option value="${esc(ticket.id)}">
                ${esc(ticket.label)}
              </option>`
          )
          .join("") ||
        "<option value=''>No available seats</option>";
    }

    // Support
    if ($("supportList")) {
      $("supportList").innerHTML =
        (support.messages || [])
          .map(
            (message) =>
              `<div class="admin-row">
                <b>${esc(message.subject)}</b><br>
                ${esc(message.email)}<br>
                ${esc(message.message)}<br>
                <small>${esc(message.status || "open")}</small>
              </div>`
          )
          .join("") || "<p>No support messages.</p>";
    }

  } catch (err) {
    showMessage(
      $("adminMsg"),
      err.message,
      "error"
    );
  }
}


// =========================
// MANUAL TICKET SYSTEM
// =========================

let manualTickets = [];


// Create the ticket input area
function renderManualTickets() {
  const container = $("ticketRows");

  if (!container) return;

  container.innerHTML = "";

  manualTickets.forEach((ticket, index) => {
    const row = document.createElement("div");

    row.className = "ticket-row";

    row.innerHTML = `
      <div class="ticket-row-header">
        <strong>Ticket ${index + 1}</strong>

        <button
          type="button"
          class="remove-ticket"
          onclick="removeTicket(${index})"
        >
          Remove
        </button>
      </div>

      <div class="ticket-fields">

        <div class="field">
          <label>Section</label>
          <input
            type="text"
            class="ticket-section"
            data-index="${index}"
            value="${esc(ticket.section)}"
            placeholder="e.g. 110"
          >
        </div>

        <div class="field">
          <label>Row</label>
          <input
            type="text"
            class="ticket-row-input"
            data-index="${index}"
            value="${esc(ticket.row)}"
            placeholder="e.g. 24"
          >
        </div>

        <div class="field">
          <label>Seat</label>
          <input
            type="text"
            class="ticket-seat"
            data-index="${index}"
            value="${esc(ticket.seat)}"
            placeholder="e.g. 14"
          >
        </div>

        <div class="field">
          <label>Price</label>
          <input
            type="number"
            class="ticket-price"
            data-index="${index}"
            value="${esc(ticket.price)}"
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>

      </div>
    `;

    container.appendChild(row);
  });
}


// =========================
// ADD TICKET
// =========================
function addTicket() {

  manualTickets.push({
    section: "",
    row: "",
    seat: "",
    price: ""
  });

  renderManualTickets();

  // Scroll to new ticket
  setTimeout(() => {
    const rows = document.querySelectorAll(".ticket-row");

    if (rows.length) {
      rows[rows.length - 1].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, 50);
}


// =========================
// REMOVE TICKET
// =========================
function removeTicket(index) {

  manualTickets.splice(index, 1);

  renderManualTickets();
}


// =========================
// READ CURRENT TICKETS
// =========================
function collectTickets() {

  const sections =
    document.querySelectorAll(".ticket-section");

  const rows =
    document.querySelectorAll(".ticket-row-input");

  const seats =
    document.querySelectorAll(".ticket-seat");

  const prices =
    document.querySelectorAll(".ticket-price");

  const tickets = [];

  for (let i = 0; i < manualTickets.length; i++) {

    const section =
      sections[i]?.value.trim() || "";

    const row =
      rows[i]?.value.trim() || "";

    const seat =
      seats[i]?.value.trim() || "";

    const price =
      prices[i]?.value.trim() || "";

    if (!section || !row || !seat || !price) {
      throw new Error(
        `Please complete Ticket ${i + 1}: Section, Row, Seat and Price.`
      );
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      throw new Error(
        `Invalid price for Ticket ${i + 1}.`
      );
    }

    tickets.push({
      section,
      row,
      seat,
      price: numericPrice
    });
  }

  if (!tickets.length) {
    throw new Error(
      "Please add at least one ticket."
    );
  }

  return tickets;
}


// =========================
// CREATE EVENT
// =========================
$("eventForm")?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const button =
      e.currentTarget.querySelector("button[type='submit']");

    if (button) {
      button.disabled = true;
      button.textContent = "Creating Event...";
    }

    try {

      const tickets = collectTickets();

      const eventData = {
        title: $("title")?.value.trim() || "",
        artist: $("artist")?.value.trim() || "",
        date: $("date")?.value || "",
        time: $("time")?.value || "",
        currency:
          $("currency")?.value.trim().toUpperCase() || "NGN",
        image: $("image")?.value.trim() || "",
        description:
          $("description")?.value.trim() || "",

        // MANUAL TICKETS
        tickets: tickets
      };


      if (!eventData.title) {
        throw new Error("Please enter the event title.");
      }

      if (!eventData.date) {
        throw new Error("Please select the event date.");
      }

      if (!eventData.time) {
        throw new Error("Please select the event time.");
      }


      const response = await api(
        "/admin/events",
        {
          method: "POST",

          body: JSON.stringify(eventData)
        }
      );


      showMessage(
        $("eventMsg"),
        response.message ||
          "Event created successfully!",
        "success"
      );


      // Clear form
      e.currentTarget.reset();

      manualTickets = [];

      renderManualTickets();

      if ($("currency")) {
        $("currency").value = "NGN";
      }


      // Reload events
      await loadAdmin();


    } catch (err) {

      showMessage(
        $("eventMsg"),
        err.message,
        "error"
      );

    } finally {

      if (button) {
        button.disabled = false;
        button.textContent = "Create Event";
      }
    }
  }
);


// =========================
// GIVE AWAY TICKET
// =========================
$("freeForm")?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const button =
      e.currentTarget.querySelector("button");

    button.disabled = true;

    try {

      const ticketId =
        Number($("freeTicket").value);

      if (!ticketId) {
        throw new Error(
          "Please select a ticket."
        );
      }

      const response = await api(
        "/admin/free-ticket",
        {
          method: "POST",

          body: JSON.stringify({
            userEmail:
              $("freeEmail")
                .value
                .trim()
                .toLowerCase(),

            ticketId
          })
        }
      );

      showMessage(
        $("freeMsg"),
        response.message ||
          "Free ticket issued.",
        "success"
      );

      await loadAdmin();

    } catch (err) {

      showMessage(
        $("freeMsg"),
        err.message,
        "error"
      );

    } finally {

      button.disabled = false;
    }
  }
);


// =========================
// INITIAL TICKET
// =========================
document.addEventListener(
  "DOMContentLoaded",
  () => {

    // If the ticket container exists,
    // automatically create Ticket 1.
    if ($("ticketRows")) {

      manualTickets = [
        {
          section: "",
          row: "",
          seat: "",
          price: ""
        }
      ];

      renderManualTickets();
    }
  }
);
