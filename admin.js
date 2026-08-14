/* =========================================================
   TICKETWAVES ADMIN.JS
   Manual event + ticket management
   ========================================================= */

let manualTickets = [];


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = $("loginForm");
  const dashboard = $("adminDashboard");

  /* -------------------------
     ADMIN LOGIN
  ------------------------- */

  if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

      e.preventDefault();

      const form = e.currentTarget;
      const button = form.querySelector("button");

      if (button) {
        button.disabled = true;
      }

      try {

        const response = await api("/auth/login", {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: $("email").value.trim().toLowerCase(),
            password: $("password").value
          })
        });


        if (!response.user) {
          throw new Error("Login failed.");
        }


        if (response.user.role !== "admin") {
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

        console.error("ADMIN LOGIN:", error);

        showMessage(
          $("msg"),
          error.message || "Login failed.",
          "error"
        );

      } finally {

        if (button) {
          button.disabled = false;
        }

      }

    });

    return;
  }


  /* -------------------------
     ADMIN DASHBOARD
  ------------------------- */

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


    /*
      Create Ticket 1 automatically
    */
    manualTickets = [
      {
        section: "",
        row: "",
        seat: "",
        price: ""
      }
    ];


    renderManualTickets();


    /*
      Make + Add Ticket work
    */
    const addTicketButton = $("addTicketBtn");

    if (addTicketButton) {

      addTicketButton.addEventListener(
        "click",
        addTicket
      );

    }


    /*
      Load admin information
    */
    loadAdmin();

  }

});


/* =========================================================
   LOAD ADMIN DATA
   ========================================================= */

async function loadAdmin() {

  try {

    const results = await Promise.all([
      api("/admin/stats"),
      api("/events"),
      api("/admin/free-ticket-options"),
      api("/admin/support")
    ]);


    const stats = results[0];
    const events = results[1];
    const freeTickets = results[2];
    const support = results[3];


    /* -------------------------
       STATS
    ------------------------- */

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


    /* -------------------------
       EVENTS
    ------------------------- */

    if ($("eventList")) {

      $("eventList").innerHTML =
        (events.events || [])
          .map((event) => {

            return `
              <div class="admin-row">

                <b>
                  ${esc(event.title)}
                </b>

                <br>

                ${esc(event.date || "")}

                ${event.time
                  ? ` · ${esc(event.time)}`
                  : ""
                }

                <br>

                ${esc(event.venue || "")}

                ${event.city
                  ? `, ${esc(event.city)}`
                  : ""
                }

                <br>

                <span>
                  ${Number(event.availableSeats || 0)}
                  available
                </span>

              </div>
            `;

          })
          .join("") || "<p>No events.</p>";

    }


    /* -------------------------
       GIVEAWAY TICKETS
    ------------------------- */

    if ($("freeTicket")) {

      const options =
        freeTickets.options || [];


      if (!options.length) {

        $("freeTicket").innerHTML =
          `
          <option value="">
            No available tickets
          </option>
          `;

      } else {

        $("freeTicket").innerHTML =
          `
          <option value="">
            Select a ticket…
          </option>
          ` +

          options
            .map((ticket) => {

              return `
                <option value="${esc(ticket.id)}">
                  ${esc(ticket.label)}
                  ${ticket.price != null
                    ? ` — ${esc(ticket.currency || "")} ${esc(ticket.price)}`
                    : ""
                  }
                </option>
              `;

            })
            .join("");

      }

    }


    /* -------------------------
       SUPPORT
    ------------------------- */

    if ($("supportList")) {

      $("supportList").innerHTML =
        (support.messages || [])
          .map((message) => {

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

          })
          .join("") || "<p>No support messages.</p>";

    }


  } catch (error) {

    console.error(
      "LOAD ADMIN:",
      error
    );


    if ($("adminMsg")) {

      showMessage(
        $("adminMsg"),
        error.message ||
          "Unable to load admin information.",
        "error"
      );

    }

  }

}


/* =========================================================
   MANUAL TICKET RENDERER
   ========================================================= */

function renderManualTickets() {

  const container = $("ticketList");

  if (!container) {
    return;
  }


  container.innerHTML = "";


  manualTickets.forEach(
    (ticket, index) => {

      const wrapper =
        document.createElement("div");


      wrapper.className =
        "ticket-row";


      wrapper.innerHTML = `

        <div class="ticket-row-header">

          <strong>
            Ticket ${index + 1}
          </strong>

          ${
            manualTickets.length > 1
              ? `
                <button
                  type="button"
                  class="remove-ticket"
                  data-remove-ticket="${index}"
                >
                  Remove
                </button>
              `
              : ""
          }

        </div>


        <div class="ticket-fields">


          <!-- SECTION -->

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


          <!-- ROW -->

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


          <!-- SEAT -->

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


          <!-- PRICE -->

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


      container.appendChild(wrapper);

    }
  );


  /*
    Remove ticket buttons
  */

  container
    .querySelectorAll(
      "[data-remove-ticket]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.removeTicket
            );

          removeTicket(index);

        }
      );

    });

}


/* =========================================================
   ADD TICKET
   ========================================================= */

function addTicket() {

  /*
    Save what is currently typed
    before adding another ticket.
  */

  saveTicketInputs();


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

  }, 50);

}


/* =========================================================
   SAVE INPUTS
   ========================================================= */

function saveTicketInputs() {

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


  manualTickets =
    manualTickets.map(
      (ticket, index) => {

        return {

          section:
            sections[index]?.value.trim()
            || "",

          row:
            rows[index]?.value.trim()
            || "",

          seat:
            seats[index]?.value.trim()
            || "",

          price:
            prices[index]?.value.trim()
            || ""

        };

      }
    );

}


/* =========================================================
   REMOVE TICKET
   ========================================================= */

function removeTicket(index) {

  saveTicketInputs();


  if (manualTickets.length <= 1) {

    return;

  }


  manualTickets.splice(
    index,
    1
  );


  renderManualTickets();

}


/* =========================================================
   COLLECT TICKETS
   ========================================================= */

function collectTickets() {

  saveTicketInputs();


  const tickets = [];


  for (
    let i = 0;
    i < manualTickets.length;
    i++
  ) {

    const ticket =
      manualTickets[i];


    if (
      !ticket.section ||
      !ticket.row ||
      !ticket.seat ||
      ticket.price === ""
    ) {

      throw new Error(
        `Please complete Ticket ${i + 1}: Section, Row, Seat and Price.`
      );

    }


    const price =
      Number(ticket.price);


    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      throw new Error(
        `Invalid price for Ticket ${i + 1}.`
      );

    }


    tickets.push({

      section:
        ticket.section,

      row:
        ticket.row,

      seat:
        ticket.seat,

      price:
        price,

      currency:
        $("currency")?.value
          .trim()
          .toUpperCase()
          || "NGN"

    });

  }


  if (!tickets.length) {

    throw new Error(
      "Please add at least one ticket."
    );

  }


  return tickets;

}


/* =========================================================
   CREATE EVENT
   ========================================================= */

$("eventForm")?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();


    /*
      IMPORTANT:
      Save the form BEFORE await.
      This fixes:

      null is not an object
      evaluating 'e.currentTarget.reset'
    */

    const form =
      e.currentTarget;


    const button =
      form.querySelector(
        "button[type='submit']"
      );


    if (button) {

      button.disabled = true;

      button.textContent =
        "Creating Event...";

    }


    try {

      /*
        Collect manual tickets
      */

      const tickets =
        collectTickets();


      /*
        Event information
      */

      const title =
        $("title")?.value.trim()
        || "";

      const artist =
        $("artist")?.value.trim()
        || "";

      const date =
        $("date")?.value
        || "";

      const time =
        $("time")?.value
        || "";

      const venue =
        $("venue")?.value.trim()
        || "";

      const city =
        $("city")?.value.trim()
        || "";

      const country =
        $("country")?.value.trim()
        || "";

      const currency =
        $("currency")?.value
          .trim()
          .toUpperCase()
        || "NGN";

      const image =
        $("image")?.value.trim()
        || "";

      const description =
        $("description")?.value.trim()
        || "";


      /* -------------------------
         VALIDATION
      ------------------------- */

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


      /* =================================================
         STEP 1
         CREATE VENUE AUTOMATICALLY
         ================================================= */

      const seatData =
        tickets.map((ticket) => ({

          section:
            ticket.section,

          row:
            ticket.row,

          seat:
            ticket.seat,

          price:
            ticket.price,

          currency:
            currency

        }));


      /*
        The existing backend /admin/venues
        expects multipart/form-data.
      */

      const venueForm =
        new FormData();


      venueForm.append(
        "name",
        venue
      );


      venueForm.append(
        "city",
        city
      );


      venueForm.append(
        "country",
        country
      );


      venueForm.append(
        "address",
        ""
      );


      venueForm.append(
        "seatData",
        JSON.stringify(seatData)
      );


      /*
        Do NOT manually set Content-Type here.
        Browser adds the multipart boundary.
      */

      const venueResponse =
        await api(
          "/admin/venues",
          {
            method: "POST",
            body: venueForm
          }
        );


      if (
        !venueResponse ||
        !venueResponse.venueId
      ) {

        throw new Error(
          venueResponse?.message ||
          "Unable to create venue."
        );

      }


      const venueId =
        venueResponse.venueId;


      /* =================================================
         STEP 2
         CREATE EVENT
         ================================================= */

      const eventResponse =
        await api(
          "/admin/events",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              venueId:

                Number(venueId),

              title:

                title,

              artist:

                artist,

              date:

                date,

              time:

                time,

              currency:

                currency,

              image:

                image,

              description:

                description

            })

          }
        );


      if (
        !eventResponse ||
        eventResponse.success === false
      ) {

        throw new Error(
          eventResponse?.message ||
          "Event creation failed."
        );

      }


      /* =================================================
         SUCCESS
         ================================================= */

      showMessage(
        $("eventMsg"),
        eventResponse.message ||
          "Event created successfully!",
        "success"
      );


      /*
        Reset the saved form reference.
        NOT e.currentTarget.reset()
      */

      form.reset();


      /*
        Reset tickets
      */

      manualTickets = [
        {
          section: "",
          row: "",
          seat: "",
          price: ""
        }
      ];


      renderManualTickets();


      /*
        Restore currency
      */

      if ($("currency")) {

        $("currency").value =
          "NGN";

      }


      /*
        Refresh admin dashboard
      */

      await loadAdmin();


    } catch (error) {

      console.error(
        "CREATE EVENT ERROR:",
        error
      );


      showMessage(
        $("eventMsg"),
        error.message ||
          "Unable to create event.",
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
);


/* =========================================================
   ADMIN GIVEAWAY
   ========================================================= */

$("freeForm")?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();


    const form =
      e.currentTarget;


    const button =
      form.querySelector(
        "button[type='submit']"
      );


    if (button) {

      button.disabled = true;

      button.textContent =
        "Giving Away...";

    }


    try {

      const email =
        $("freeEmail")
          ?.value
          .trim()
          .toLowerCase()
        || "";


      const ticketId =
        Number(
          $("freeTicket")?.value
        );


      if (!email) {

        throw new Error(
          "Please enter the recipient account email."
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

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              userEmail:
                email,

              ticketId:
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


      /*
        Clear recipient email
      */

      $("freeEmail").value =
        "";


      /*
        Reload available tickets
      */

      await loadAdmin();


    } catch (error) {

      console.error(
        "FREE TICKET ERROR:",
        error
      );


      showMessage(
        $("freeMsg"),
        error.message ||
          "Unable to give away ticket.",
        "error"
      );


    } finally {

      if (button) {

        button.disabled = false;

        button.textContent =
          "Give Away Ticket";

      }

    }

  }
);
