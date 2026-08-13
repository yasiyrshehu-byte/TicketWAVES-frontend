const API = window.TW_CONFIG?.API_BASE_URL || "";

function $(id) {
  return document.getElementById(id);
}


/* =========================================
   AUTH
========================================= */

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("tw_token") ||
    ""
  );
}


function authHeaders() {

  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {})
  };
}


/* =========================================
   MESSAGE
========================================= */

function message(element, text, success = false) {

  if (!element) return;

  element.textContent = text;

  element.style.color = success
    ? "#16803c"
    : "#d93025";
}


/* =========================================
   MANUAL TICKET BUILDER
========================================= */

let ticketNumber = 0;


function createTicketCard() {

  ticketNumber++;

  const card = document.createElement("div");

  card.className = "ticket-card";

  card.dataset.ticket = ticketNumber;


  card.innerHTML = `

    <div class="ticket-card-header">

      <h4>
        Ticket ${ticketNumber}
      </h4>

      ${
        ticketNumber > 1
          ? `
            <button
              type="button"
              class="remove-ticket"
            >
              Remove
            </button>
          `
          : ""
      }

    </div>


    <div class="ticket-fields">

      <div>

        <label>
          Section
        </label>

        <input
          type="text"
          class="ticket-section"
          placeholder="Example: 110"
          required
        >

      </div>


      <div>

        <label>
          Row
        </label>

        <input
          type="text"
          class="ticket-row"
          placeholder="Example: 23"
          required
        >

      </div>


      <div>

        <label>
          Seat
        </label>

        <input
          type="text"
          class="ticket-seat"
          placeholder="Example: 24"
          required
        >

      </div>


      <div>

        <label>
          Price
        </label>

        <input
          type="number"
          class="ticket-price"
          min="0"
          step="0.01"
          placeholder="Example: 25000"
          required
        >

      </div>

    </div>

  `;


  const removeButton =
    card.querySelector(".remove-ticket");


  if (removeButton) {

    removeButton.addEventListener(
      "click",
      () => {

        card.remove();

        renumberTickets();

      }
    );

  }


  $("ticketList").appendChild(card);

}


function renumberTickets() {

  const cards =
    document.querySelectorAll(
      ".ticket-card"
    );


  cards.forEach(
    (card, index) => {

      const number = index + 1;

      card.dataset.ticket = number;

      const heading =
        card.querySelector("h4");

      if (heading) {

        heading.textContent =
          `Ticket ${number}`;

      }

    }
  );


  ticketNumber = cards.length;

}


/* =========================================
   ADD TICKET
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    createTicketCard();


    $("addTicketBtn")?.addEventListener(
      "click",
      () => {

        createTicketCard();

      }
    );

  }
);


/* =========================================
   GET MANUAL TICKETS
========================================= */

function getManualTickets() {

  const cards =
    document.querySelectorAll(
      ".ticket-card"
    );


  return Array.from(cards).map(
    card => ({

      section:
        card
          .querySelector(".ticket-section")
          .value
          .trim(),

      row:
        card
          .querySelector(".ticket-row")
          .value
          .trim(),

      seat:
        card
          .querySelector(".ticket-seat")
          .value
          .trim(),

      price:
        Number(
          card
            .querySelector(".ticket-price")
            .value
        ),

      currency:
        $("currency").value
          .trim()
          .toUpperCase(),

      status:
        "available"

    })
  );

}


/* =========================================
   CREATE EVENT
========================================= */

$("eventForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const eventMsg =
      $("eventMsg");


    const tickets =
      getManualTickets();


    if (!tickets.length) {

      message(
        eventMsg,
        "Please add at least one ticket."
      );

      return;

    }


    try {

      message(
        eventMsg,
        "Creating event..."
      );


      const payload = {

        title:
          $("title").value.trim(),

        artist:
          $("artist").value.trim(),

        date:
          $("date").value,

        time:
          $("time").value,

        venue:
          $("venue").value.trim(),

        city:
          $("city").value.trim(),

        country:
          $("country").value.trim(),

        currency:
          $("currency").value
            .trim()
            .toUpperCase(),

        image:
          $("image").value.trim(),

        description:
          $("description").value.trim(),

        tickets

      };


      const response =
        await fetch(
          `${API}/api/admin/events`,
          {
            method: "POST",

            headers:
              authHeaders(),

            body:
              JSON.stringify(payload)
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Could not create event."
        );

      }


      message(
        eventMsg,
        "Event created successfully!",
        true
      );


      $("eventForm").reset();


      $("currency").value =
        "NGN";


      $("ticketList").innerHTML =
        "";


      ticketNumber = 0;


      createTicketCard();


      loadEvents();

    }

    catch (error) {

      console.error(error);

      message(
        eventMsg,
        error.message ||
        "Server error."
      );

    }

  }
);


/* =========================================
   ADMIN GIVEAWAY
========================================= */

$("freeForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const msg =
      $("freeMsg");


    try {

      message(
        msg,
        "Giving away ticket..."
      );


      const payload = {

        userEmail:
          $("freeEmail")
            .value
            .trim()
            .toLowerCase(),

        ticketId:
          Number(
            $("freeTicket").value
          ),

        /*
          IMPORTANT:
          Admin giveaway = NO EMAIL
        */

        sendEmail:
          false,

        reason:
          "admin_giveaway"

      };


      const response =
        await fetch(
          `${API}/api/admin/free-ticket`,
          {
            method: "POST",

            headers:
              authHeaders(),

            body:
              JSON.stringify(payload)
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Could not give away ticket."
        );

      }


      message(
        msg,
        "Ticket given away successfully. No email was sent.",
        true
      );


      $("freeForm").reset();


      loadAvailableTickets();

    }

    catch (error) {

      console.error(error);

      message(
        msg,
        error.message ||
        "Server error."
      );

    }

  }
);


/* =========================================
   LOAD EVENTS
========================================= */

async function loadEvents() {

  const list =
    $("eventList");

  if (!list) return;


  try {

    const response =
      await fetch(
        `${API}/api/events`
      );


    const data =
      await response.json();


    const events =
      data.events ||
      data.data ||
      data ||
      [];


    if (!Array.isArray(events) ||
        !events.length) {

      list.innerHTML =
        "<p>No events found.</p>";

      return;

    }


    list.innerHTML =
      events.map(
        event => `

          <div class="event-row">

            <strong>
              ${escapeHtml(
                event.title || "Event"
              )}
            </strong>

            <span>
              ${escapeHtml(
                event.artist || ""
              )}
            </span>

            <span>
              ${escapeHtml(
                event.date || ""
              )}
            </span>

          </div>

        `
      ).join("");

  }

  catch (error) {

    console.error(error);

    list.innerHTML =
      "<p>Unable to load events.</p>";

  }

}


/* =========================================
   LOAD AVAILABLE TICKETS
========================================= */

async function loadAvailableTickets() {

  const select =
    $("freeTicket");

  if (!select) return;


  try {

    select.innerHTML =
      `
        <option value="">
          Loading available tickets…
        </option>
      `;


    const response =
      await fetch(
        `${API}/api/admin/available-tickets`,
        {
          headers:
            authHeaders()
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Could not load tickets."
      );

    }


    const tickets =
      data.tickets ||
      data.data ||
      [];


    select.innerHTML =
      `
        <option value="">
          Select ticket…
        </option>
      `;


    tickets.forEach(
      ticket => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          ticket.id;


        option.textContent =
          `${ticket.event_title || ticket.title} — Section ${ticket.section} — Row ${ticket.row_name} — Seat ${ticket.seat} — ${ticket.price} ${ticket.currency}`;


        select.appendChild(
          option
        );

      }
    );


  }

  catch (error) {

    console.error(error);

    select.innerHTML =
      `
        <option value="">
          Unable to load tickets
        </option>
      `;

  }

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadEvents();

    loadAvailableTickets();

  }
);
