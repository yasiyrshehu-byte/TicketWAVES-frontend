// =====================================================
// TicketWAVES ADMIN.JS
// Manual event + ticket system
// =====================================================

let manualTickets = [];


// =====================================================
// ADMIN PAGE START
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = $("loginForm");
  const dashboard = $("adminDashboard");

  // -------------------------
  // ADMIN LOGIN
  // -------------------------

  if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

      e.preventDefault();

      const button = loginForm.querySelector("button");

      if (button) {
        button.disabled = true;
      }

      try {

        const response = await api("/auth/login", {
          method: "POST",

          body: JSON.stringify({
            email: $("email").value.trim().toLowerCase(),
            password: $("password").value
          })
        });


        if (response.user?.role !== "admin") {

          throw new Error(
            "This account does not have administrator access."
          );

        }


        localStorage.setItem(
          "token",
          response.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(response.user)
        );


        window.location.href = "./admin.html";


      } catch (error) {

        showMessage(
          $("msg"),
          error.message || "Login failed.",
          "error"
        );

        if (button) {
          button.disabled = false;
        }

      }

    });

    return;
  }


  // -------------------------
  // CHECK ADMIN
  // -------------------------

  if (dashboard) {

    if (!requireAuth()) {
      return;
    }


    const user = currentUser();


    if (!user || user.role !== "admin") {

      dashboard.innerHTML = `
        <div class="admin-card error">
          Administrator access required.
        </div>
      `;

      return;
    }

  }


  // -------------------------
  // CREATE FIRST TICKET
  // -------------------------

  manualTickets = [
    {
      section: "",
      row: "",
      seat: "",
      price: ""
    }
  ];


  renderManualTickets();


  // -------------------------
  // ADD TICKET BUTTON
  // -------------------------

  const addTicketButton = $("addTicketBtn");

  if (addTicketButton) {

    addTicketButton.addEventListener(
      "click",
      addTicket
    );

  }


  // -------------------------
  // CREATE EVENT FORM
  // -------------------------

  const eventForm = $("eventForm");

  if (eventForm) {

    eventForm.addEventListener(
      "submit",
      createEvent
    );

  }


  // -------------------------
  // GIVEAWAY FORM
  // -------------------------

  const freeForm = $("freeForm");

  if (freeForm) {

    freeForm.addEventListener(
      "submit",
      giveAwayTicket
    );

  }


  // -------------------------
  // LOAD ADMIN
  // -------------------------

  loadAdmin();

});



// =====================================================
// LOAD ADMIN DATA
// =====================================================

async function loadAdmin() {

  try {

    const results = await Promise.all([
      api("/admin/stats"),
      api("/admin/events"),
      api("/admin/free-ticket-options"),
      api("/admin/support")
    ]);


    const stats = results[0];
    const events = results[1];
    const free = results[2];
    const support = results[3];


    // =================================================
    // STATS
    // =================================================

    if ($("stats")) {

      $("stats").innerHTML =
        Object.entries(stats.stats || {})
          .map(([key, value]) => {

            return `
              <div class="stat">
                <b>${esc(value)}</b>
                <span>${esc(key)}</span>
              </div>
            `;

          })
          .join("");

    }


    // =================================================
    // EVENTS
    // =================================================

    if ($("eventList")) {

      const eventArray =
        events.events || [];


      if (!eventArray.length) {

        $("eventList").innerHTML =
          "<p>No events.</p>";

      } else {

        $("eventList").innerHTML =
          eventArray.map(event => {

            return `
              <div class="admin-row">

                <b>
                  ${esc(event.title)}
                </b>

                <br>

                ${esc(event.artist || "")}

                <br>

                ${esc(event.date)}
                ·
                ${esc(event.time || "")}

                <br>

                ${esc(event.venue || "")},
                ${esc(event.city || "")},
                ${esc(event.country || "")}

                <br>

                <span>
                  ${Number(event.availableSeats || 0)}
                  available tickets
                </span>

              </div>
            `;

          }).join("");

      }

    }


    // =================================================
    // GIVEAWAY OPTIONS
    // =================================================

    if ($("freeTicket")) {

      const options =
        free.options || [];


      if (!options.length) {

        $("freeTicket").innerHTML = `
          <option value="">
            No available tickets
          </option>
        `;

      } else {

        $("freeTicket").innerHTML = `
          <option value="">
            Select a ticket…
          </option>

          ${
            options.map(ticket => `
              <option value="${esc(ticket.id)}">
                ${esc(ticket.label)}
                · ${esc(ticket.currency)}
                ${esc(ticket.price)}
              </option>
            `).join("")
          }
        `;

      }

    }


    // =================================================
    // SUPPORT
    // =================================================

    if ($("supportList")) {

      const messages =
        support.messages || [];


      if (!messages.length) {

        $("supportList").innerHTML =
          "<p>No support messages.</p>";

      } else {

        $("supportList").innerHTML =
          messages.map(message => {

            return `
              <div class="admin-row">

                <b>
                  ${esc(message.subject)}
                </b>

                <br>

                ${esc(message.email)}

                <br>

                ${esc(message.message)}

                <br>

                <small>
                  ${esc(message.status || "open")}
                </small>

              </div>
            `;

          }).join("");

      }

    }


  } catch (error) {

    showMessage(
      $("adminMsg"),
      error.message || "Unable to load admin data.",
      "error"
    );

  }

}



// =====================================================
// RENDER MANUAL TICKETS
// =====================================================

function renderManualTickets() {

  const container = $("ticketList");

  if (!container) {
    return;
  }


  container.innerHTML = "";


  manualTickets.forEach((ticket, index) => {

    const row =
      document.createElement("div");


    row.className =
      "ticket-row";


    row.innerHTML = `

      <div class="ticket-row-header">

        <strong>
          Ticket ${index + 1}
        </strong>

        ${
          index > 0
          ? `
            <button
              type="button"
              class="remove-ticket"
              data-remove="${index}"
            >
              Remove
            </button>
          `
          : ""
        }

      </div>


      <div class="ticket-fields">


        <div class="field">

          <label>
            Section
          </label>

          <input
            type="text"
            class="ticket-section"
            data-index="${index}"
            value="${esc(ticket.section)}"
            placeholder="e.g. 110"
          >

        </div>


        <div class="field">

          <label>
            Row
          </label>

          <input
            type="text"
            class="ticket-row-input"
            data-index="${index}"
            value="${esc(ticket.row)}"
            placeholder="e.g. 24"
          >

        </div>


        <div class="field">

          <label>
            Seat
          </label>

          <input
            type="text"
            class="ticket-seat"
            data-index="${index}"
            value="${esc(ticket.seat)}"
            placeholder="e.g. 14"
          >

        </div>


        <div class="field">

          <label>
            Price
          </label>

          <input
            type="number"
            class="ticket-price"
            data-index="${index}"
            value="${esc(ticket.price)}"
            min="0"
            step="0.01"
            placeholder="100"
          >

        </div>


      </div>

    `;


    container.appendChild(row);

  });


  // -------------------------
  // REMOVE BUTTONS
  // -------------------------

  container
    .querySelectorAll("[data-remove]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.remove);

          manualTickets.splice(
            index,
            1
          );

          renderManualTickets();

        }
      );

    });

}



// =====================================================
// ADD TICKET
// =====================================================

function addTicket() {

  manualTickets.push({

    section: "",
    row: "",
    seat: "",
    price: ""

  });


  renderManualTickets();


  setTimeout(() => {

    const rows =
      document.querySelectorAll(
        ".ticket-row"
      );


    if (rows.length) {

      rows[rows.length - 1]
        .scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

    }

  }, 100);

}



// =====================================================
// COLLECT TICKETS
// =====================================================

function collectTickets() {

  const sections =
    document.querySelectorAll(
      ".ticket-section"
    );


  const rows =
    document.querySelectorAll(
      ".ticket-row-input"
    );


  const seats =
    document.querySelectorAll(
      ".ticket-seat"
    );


  const prices =
    document.querySelectorAll(
      ".ticket-price"
    );


  const tickets = [];


  for (
    let i = 0;
    i < manualTickets.length;
    i++
  ) {

    const section =
      sections[i]?.value.trim() || "";


    const row =
      rows[i]?.value.trim() || "";


    const seat =
      seats[i]?.value.trim() || "";


    const price =
      prices[i]?.value.trim() || "";


    if (
      !section ||
      !row ||
      !seat ||
      !price
    ) {

      throw new Error(
        `Please complete Ticket ${i + 1}: Section, Row, Seat and Price.`
      );

    }


    const numericPrice =
      Number(price);


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



// =====================================================
// CREATE EVENT
// =====================================================

async function createEvent(e) {

  e.preventDefault();


  const button =
    e.currentTarget.querySelector(
      "button[type='submit']"
    );


  if (button) {

    button.disabled = true;
    button.textContent =
      "Creating Event...";

  }


  try {

    const tickets =
      collectTickets();


    const title =
      $("title")?.value.trim() || "";


    const artist =
      $("artist")?.value.trim() || "";


    const date =
      $("date")?.value || "";


    const time =
      $("time")?.value || "";


    const venue =
      $("venue")?.value.trim() || "";


    const city =
      $("city")?.value.trim() || "";


    const country =
      $("country")?.value.trim() || "";


    const currency =
      $("currency")?.value
        .trim()
        .toUpperCase() || "NGN";


    const image =
      $("image")?.value.trim() || "";


    const description =
      $("description")?.value.trim() || "";


    // -------------------------
    // VALIDATION
    // -------------------------

    if (!title) {
      throw new Error(
        "Please enter the event title."
      );
    }


    if (!date) {
      throw new Error(
        "Please select the event date."
      );
    }


    if (!time) {
      throw new Error(
        "Please select the event time."
      );
    }


    if (!venue) {
      throw new Error(
        "Please enter the venue."
      );
    }


    if (!city) {
      throw new Error(
        "Please enter the city."
      );
    }


    if (!country) {
      throw new Error(
        "Please enter the country."
      );
    }


    // -------------------------
    // SEND EVENT
    // -------------------------

    const response =
      await api(
        "/admin/events",
        {

          method: "POST",

          body: JSON.stringify({

            title,
            artist,
            date,
            time,

            venue,
            city,
            country,

            currency,

            image,

            description,

            tickets

          })

        }
      );


    showMessage(
      $("eventMsg"),
      response.message ||
        "Event created successfully!",
      "success"
    );


    // -------------------------
    // RESET
    // -------------------------

    e.currentTarget.reset();


    if ($("currency")) {

      $("currency").value =
        "NGN";

    }


    manualTickets = [

      {
        section: "",
        row: "",
        seat: "",
        price: ""
      }

    ];


    renderManualTickets();


    // -------------------------
    // RELOAD ADMIN
    // -------------------------

    await loadAdmin();


  } catch (error) {

    showMessage(
      $("eventMsg"),
      error.message ||
        "Event creation failed.",
      "error"
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "Create Event";

    }

  }

}



// =====================================================
// GIVE AWAY TICKET
// =====================================================

async function giveAwayTicket(e) {

  e.preventDefault();


  const button =
    e.currentTarget.querySelector(
      "button[type='submit']"
    );


  if (button) {
    button.disabled = true;
  }


  try {

    const email =
      $("freeEmail")
        ?.value
        .trim()
        .toLowerCase();


    const ticketId =
      Number(
        $("freeTicket")?.value
      );


    if (!email) {

      throw new Error(
        "Please enter the recipient's email."
      );

    }


    if (!ticketId) {

      throw new Error(
        "Please select a ticket."
      );

    }


    const response =
      await api(
        "/admin/free-ticket",
        {

          method: "POST",

          body: JSON.stringify({

            userEmail: email,

            ticketId

          })

        }
      );


    showMessage(
      $("freeMsg"),
      response.message ||
        "Free ticket issued successfully.",
      "success"
    );


    $("freeEmail").value = "";


    await loadAdmin();


  } catch (error) {

    showMessage(
      $("freeMsg"),
      error.message ||
        "Unable to issue free ticket.",
      "error"
    );

  } finally {

    if (button) {
      button.disabled = false;
    }

  }

}
