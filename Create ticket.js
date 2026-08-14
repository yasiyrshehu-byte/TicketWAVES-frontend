document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);

    const ticketId = params.get("id");


    if (!ticketId) {

        showError("No ticket was specified.");

        return;
    }


    if (typeof requireAuth === "function" && !requireAuth()) {
        return;
    }


    const $ = (id) => document.getElementById(id);


    const esc = (value) => {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    };


    let ticket = null;


    /*
     * --------------------------------------------------
     * LOAD TICKET
     * --------------------------------------------------
     *
     * Expected backend endpoint:
     *
     * GET /tickets/:id
     *
     */

    async function loadTicket() {

        try {

            const response = await api(
                `/tickets/${encodeURIComponent(ticketId)}`
            );

            ticket = response.ticket || response;

            if (!ticket) {
                throw new Error("Ticket not found.");
            }


            renderTicket();


        } catch (error) {

            showError(
                error.message || "Unable to load ticket."
            );

        }
    }


    /*
     * --------------------------------------------------
     * RENDER TICKET
     * --------------------------------------------------
     */

    function renderTicket() {

        const image =
            ticket.image ||
            ticket.eventImage ||
            ticket.imageUrl ||
            ticket.eventImageUrl ||
            "./images/default-event.jpg";


        $("ticketEventImage").src = image;


        $("ticketEventImage").onerror = () => {
            $("ticketEventImage").src =
                "./images/default-event.jpg";
        };


        $("ticketEventTitle").textContent =
            ticket.eventTitle ||
            ticket.title ||
            "Event";


        const date =
            ticket.date ||
            "Event date";


        const time =
            ticket.time ||
            "";


        $("ticketDate").textContent =
            time
                ? `${date} · ${time}`
                : date;


        $("ticketVenue").textContent =
            ticket.venue ||
            ticket.location ||
            "Venue";


        $("ticketSection").textContent =
            ticket.section || "—";


        $("ticketRow").textContent =
            ticket.row || "—";


        $("ticketSeat").textContent =
            ticket.seat || "—";


        $("ticketOrder").textContent =
            ticket.orderNumber ||
            ticket.orderId ||
            ticket.order ||
            "—";


        $("mapVenue").textContent =
            ticket.venue ||
            "Venue";


        $("mapLocation").textContent =
            ticket.city ||
            ticket.location ||
            "";


        renderVerification();

        createSecureTicketLink();

        createQRCode();

    }


    /*
     * --------------------------------------------------
     * VERIFICATION
     * --------------------------------------------------
     */

    function renderVerification() {

        const verified =
            ticket.verified === true ||
            ticket.isVerified === true ||
            ticket.verificationStatus === "verified";


        if (verified) {

            $("verificationText").textContent =
                "This ticket is verified by TicketWAVES.";

        } else {

            $("verificationText").textContent =
                "Ticket information is available in your TicketWAVES account.";

        }

    }


    /*
     * --------------------------------------------------
     * SECURE VIEW LINK
     * --------------------------------------------------
     */

    function createSecureTicketLink() {

        let token =
            ticket.shareToken ||
            ticket.publicToken ||
            ticket.ticketToken;


        /*
         * The preferred production setup is that the backend
         * supplies a secure token.
         *
         * For development, fall back to the ticket ID.
         */

        const url = new URL(
            "./ticket.html",
            window.location.href
        );


        if (token) {

            url.searchParams.set(
                "token",
                token
            );

        } else {

            url.searchParams.set(
                "id",
                ticket.id || ticket._id || ticketId
            );

        }


        const link = url.toString();


        $("ticketLink").value = link;

        $("shareLinkInput").value = link;

        window.ticketShareURL = link;

    }


    /*
     * --------------------------------------------------
     * QR CODE
     * --------------------------------------------------
     */

    function createQRCode() {

        const container =
            $("ticketQRCode");


        if (!container) return;


        container.innerHTML = "";


        if (
            typeof QRCode === "undefined"
        ) {

            container.innerHTML = `
                <div class="qr-unavailable">
                    QR code unavailable
                </div>
            `;

            return;
        }


        new QRCode(container, {

            text: window.ticketShareURL,

            width: 230,

            height: 230,

            colorDark: "#111111",

            colorLight: "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.H

        });

    }


    /*
     * --------------------------------------------------
     * COPY LINK
     * --------------------------------------------------
     */

    async function copyText(text) {

        try {

            await navigator.clipboard.writeText(text);

            return true;

        } catch {

            const input =
                document.createElement("textarea");

            input.value = text;

            document.body.appendChild(input);

            input.select();

            document.execCommand("copy");

            input.remove();

            return true;
        }

    }


    $("copyLinkButton")?.addEventListener(
        "click",
        async () => {

            await copyText(
                $("ticketLink").value
            );

            const button =
                $("copyLinkButton");

            button.textContent = "Copied";

            setTimeout(() => {
                button.textContent = "Copy";
            }, 1500);

        }
    );


    /*
     * --------------------------------------------------
     * SHARE TICKET
     * --------------------------------------------------
     */

    $("shareTicketButton")?.addEventListener(
        "click",
        () => {

            $("shareModal").classList.remove("hidden");

        }
    );


    $("closeShareModal")?.addEventListener(
        "click",
        () => {

            $("shareModal").classList.add("hidden");

        }
    );


    $("copyShareLink")?.addEventListener(
        "click",
        async () => {

            await copyText(
                $("shareLinkInput").value
            );


            $("copyShareLink").textContent =
                "Copied";


            setTimeout(() => {

                $("copyShareLink").textContent =
                    "Copy";

            }, 1500);

        }
    );


    $("nativeShareButton")?.addEventListener(
        "click",
        async () => {

            const shareData = {

                title:
                    ticket.eventTitle ||
                    "TicketWAVES Ticket",

                text:
                    "View my verified ticket on TicketWAVES.",

                url:
                    window.ticketShareURL

            };


            if (
                navigator.share
            ) {

                try {

                    await navigator.share(
                        shareData
                    );

                } catch {

                    // User cancelled share.

                }

            } else {

                await copyText(
                    window.ticketShareURL
                );

                $("nativeShareButton").textContent =
                    "Link Copied";

            }

        }
    );


    /*
     * --------------------------------------------------
     * TRANSFER MODAL
     * --------------------------------------------------
     */

    $("requestTransferButton")?.addEventListener(
        "click",
        () => {

            $("transferModal").classList.remove("hidden");

        }
    );


    $("closeTransferModal")?.addEventListener(
        "click",
        () => {

            $("transferModal").classList.add("hidden");

        }
    );


    /*
     * --------------------------------------------------
     * TRANSFER REQUEST
     * --------------------------------------------------
     *
     * Expected backend endpoint:
     *
     * POST /tickets/:id/transfer-request
     *
     */

    $("transferForm")?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const recipientName =
                $("recipientName").value.trim();


            const recipientEmail =
                $("recipientEmail").value.trim();


            const message =
                $("transferMessage");


            if (
                !recipientName ||
                !recipientEmail
            ) {

                message.textContent =
                    "Please enter the recipient's name and email.";

                return;
            }


            message.textContent =
                "Sending transfer request…";


            try {

                const response = await api(
                    `/tickets/${encodeURIComponent(ticketId)}/transfer-request`,
                    {
                        method: "POST",

                        body: JSON.stringify({

                            recipientName,

                            recipientEmail

                        })
                    }
                );


                message.className =
                    "form-message success";


                message.textContent =
                    response.message ||
                    "Transfer request sent. The ticket owner must accept or decline the request.";


                $("transferForm").reset();


            } catch (error) {

                /*
                 * If the backend reports that the recipient
                 * doesn't have an account, send them directly
                 * to registration.
                 */

                const text =
                    String(
                        error.message || ""
                    ).toLowerCase();


                if (
                    text.includes("account") &&
                    (
                        text.includes("not found") ||
                        text.includes("doesn't") ||
                        text.includes("does not")
                    )
                ) {

                    const registerURL =
                        new URL(
                            "./register.html",
                            window.location.href
                        );


                    registerURL.searchParams.set(
                        "transferTicket",
                        ticketId
                    );


                    registerURL.searchParams.set(
                        "email",
                        recipientEmail
                    );


                    window.location.href =
                        registerURL.toString();

                    return;
                }


                message.className =
                    "form-message error";


                message.textContent =
                    error.message ||
                    "Unable to send transfer request.";

            }

        }
    );


    /*
     * --------------------------------------------------
     * DIRECTIONS
     * --------------------------------------------------
     */

    $("directionsButton")?.addEventListener(
        "click",
        () => {

            const destination =
                [
                    ticket.venue,
                    ticket.address,
                    ticket.city,
                    ticket.country
                ]
                .filter(Boolean)
                .join(", ");


            if (!destination) {

                return;

            }


            const mapsURL =
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;


            window.open(
                mapsURL,
                "_blank",
                "noopener"
            );

        }
    );


    /*
     * --------------------------------------------------
     * BACK
     * --------------------------------------------------
     */

    $("backButton")?.addEventListener(
        "click",
        () => {

            if (
                window.history.length > 1
            ) {

                window.history.back();

            } else {

                window.location.href =
                    "./my-tickets.html";

            }

        }
    );


    /*
     * --------------------------------------------------
     * CLOSE MODALS WHEN BACKGROUND IS TAPPED
     * --------------------------------------------------
     */

    document.querySelectorAll(
        ".modal-overlay"
    ).forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    modal.classList.add("hidden");

                }

            }
        );

    });


    /*
     * --------------------------------------------------
     * ERROR
     * --------------------------------------------------
     */

    function showError(message) {

        document.querySelector(
            ".ticket-detail-page"
        ).innerHTML = `

            <div class="ticket-error-page">

                <div class="ticket-error-icon">
                    !
                </div>

                <h1>
                    Ticket unavailable
                </h1>

                <p>
                    ${esc(message)}
                </p>

                <a
                    href="./my-tickets.html"
                    class="primary-ticket-button"
                >
                    Back to My Tickets
                </a>

            </div>

        `;

    }


    await loadTicket();

});
