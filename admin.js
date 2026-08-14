/* =========================================================
   TICKETWAVES ADMIN.JS
   Manual Event + Ticket Management
   ========================================================= */

let manualTickets = [];


/* =========================================================
   ADMIN LOGIN / DASHBOARD STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = $("loginForm");
  const dashboard = $("adminDashboard");


  /* =======================================================
     ADMIN LOGIN
     ======================================================= */

  if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

      e.preventDefault();

      const form = e.currentTarget;
      const button = form.querySelector("button");

      if (button) {
        button.disabled = true;
        button.textContent = "Logging in...";
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

        console.error(
          "ADMIN LOGIN ERROR:",
          error
        );

        showMessage(
          $("msg"),
          error.message || "Login failed.",
          "error"
        );

      } finally {

        if (button) {
          button.disabled = false;
          button.textContent = "Login";
        }

      }

    });

    return;
  }


  /* =======================================================
     ADMIN DASHBOARD
     ======================================================= */

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
      Create Ticket 1 automatically.
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
      Add Ticket button.
    */

    const addTicketButton =
      $("addTicketBtn");


    if (addTicketButton) {

      addTicketButton.addEventListener(
        "click",
        addTicket
      );

    }


    /*
      Load dashboard.
    */

    loadAdmin();

  }

});


/* =========================================================
   LOAD ADMIN DATA
   ========================================================= */

async function loadAdmin() {

  try {

    const [
      stats,
      events,
      freeTickets,
      support
    ] = await Promise.all([

      api("/admin/stats"),

      api("/events"),

      api("/admin/free-ticket-options"),

      api("/admin/support")

    ]);


    /* =====================================================
       STATS
       ===================================================== */

    if ($("stats")) {

      $("stats").innerHTML =
        Object.entries(
          stats.stats || {}
        )
        .map(([key, value]) => {

          return `
            <div class="stat">

              <b>
                ${esc(value)}
              </b>

              <span>
                ${esc(key)}
              </span>

            </div>
          `;

        })
        .join("");

    }


    /* =====================================================
       EVENTS
       ===================================================== */

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

              ${
                event.time
                  ? ` · ${esc(event.time)}`
                  : ""
              }

              <br>

              ${esc(event.venue || "")}

              ${
                event.city
                  ? `, ${esc(event.city)}`
                  : ""
              }

              ${
                event.country
                  ? `, ${esc(event.country)}`
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
        .join("")

        || "<p>No events.</p>";

    }


    /* =====================================================
       GIVEAWAY TICKETS
       ===================================================== */

    if ($("freeTicket")) {

      const options =
        freeTickets.options || [];


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
            options
              .map((ticket) => {

                return `
                  <option value="${esc(ticket.id)}">

                    ${esc(ticket.label)}

                    ${
                      ticket.price != null
                        ? ` — ${esc(
                            ticket.currency || ""
                          )} ${esc(
                            ticket.price
                          )}`
                        : ""
                    }

                  </option>
                `;

              })
              .join("")
          }

        `;

      }

    }


    /* =====================================================
       SUPPORT
       ===================================================== */

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
                ${esc(
                  message.status || "open"
                )}
              </small>

            </div>
          `;

        })
        .join("")

        || "<p>No support messages.</p>";

    }


  } catch (error) {

    console.error(
      "LOAD ADMIN ERROR:",
      error
    );


    showMessage(
      $("adminMsg"),
      error.message ||
        "Unable to load admin information.",
      "error"
    );

  }

}


/* =========================================================
   RENDER MANUAL TICKETS
   ========================================================= */

function renderManualTickets() {

  const container =
    $("ticketList");


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


          <div class="field">

            <label>
              Section
            </label>

            <input
              type="text"
              class="ticket-section"
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


  /* =======================================================
     REMOVE BUTTONS
     ======================================================= */

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
   SAVE CURRENT TICKET INPUTS
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
   ADD TICKET
   ========================================================= */

function addTicket() {

  /*
    Save Ticket 1 before creating Ticket 2.
  */

  saveTicketInputs();


  manualTickets.push({

    section: "",
    row: "",
    seat: "",
    price: ""

  });


  renderManualTickets();


  /*
    Scroll to the newly-created ticket.
  */

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


  if (!manualTickets.length) {

    throw new Error(
      "Please add at least one ticket."
    );

  }


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


    const numericPrice =
      Number(ticket.price);


    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice < 0
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
        numericPrice

    });

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
      Capture currentTarget BEFORE await.
      This prevents the Safari:

      null is not an object
      evaluating 'e.currentTarget.reset'

      error.
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

      /* ===================================================
         COLLECT TICKETS
         =================================================== */

      const tickets =
        collectTickets();


      /* ===================================================
         EVENT INFORMATION
         =================================================== */

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


      /* ===================================================
         VALIDATION
         =================================================== */

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


      /* ===================================================
         CREATE VENUE AUTOMATICALLY
         =================================================== */

      const seatData =
        tickets.map((ticket) => {

          return {

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

          };

        });


      /*
        Build FormData for /admin/venues.
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
        JSON.stringify(
          seatData
        )
      );


      /*
        VERY IMPORTANT:
        Use apiForm(), NOT api().

        apiForm() does not force
        Content-Type: application/json.
      */

      const venueResponse =
        await apiForm(
          "/admin/venues",
          venueForm
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
        Number(
          venueResponse.venueId
        );


      /* ===================================================
         CREATE EVENT
         =================================================== */

      const eventResponse =
        await api(
          "/admin/events",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                venueId:
                  venueId,

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


      /* ===================================================
         SUCCESS
         =================================================== */

      showMessage(
        $("eventMsg"),
        eventResponse.message ||
          "Event created successfully!",
        "success"
      );


      /*
        Reset the actual form.
        We use the saved `form` variable.
      */

      form.reset();


      /*
        Reset manual tickets.
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
        Restore currency.
      */

      if ($("currency")) {

        $("currency").value =
          "NGN";

      }


      /*
        Refresh events,
        statistics and giveaway list.
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
          "Server error.",
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

            body:
              JSON.stringify({

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
        Clear recipient email.
      */

      $("freeEmail").value =
        "";


      /*
        Reload available tickets.
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
