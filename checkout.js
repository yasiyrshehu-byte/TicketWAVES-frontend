let eventData = null;
let allSeats = [];
let visibleSeats = [];
let selected = [];
const seatsBox = $("seats"), summary = $("summary"), pay = $("pay"), msg = $("msg"), currencySelect = $("currency");
const params = new URLSearchParams(location.search);
const requestedSection = params.get("section") || "";

function supportedCurrencies(e) {
  const raw = e.supportedCurrencies || e.currencies;
  if (Array.isArray(raw) && raw.length) return raw.map(String).map(x => x.toUpperCase());
  return [String(e.currency || "NGN").toUpperCase()];
}

function seatPrice(seat) { return Number(seat.price ?? eventData?.price ?? 0); }
function seatCurrency(seat) { return String(seat.currency || eventData?.currency || "NGN").toUpperCase(); }

function renderSummary() {
  if (!eventData) return;
  const currency = currencySelect?.value || eventData.currency || "NGN";
  const total = selected.reduce((sum, id) => {
    const s = allSeats.find(x => Number(x.id) === Number(id));
    return sum + (s ? seatPrice(s) : 0);
  }, 0);
  const chosen = selected.map(id => allSeats.find(x => Number(x.id) === Number(id))).filter(Boolean);
  const seatText = chosen.length ? chosen.map(s => `${s.section || ""} · Row ${s.row || "—"} · Seat ${s.seat || "—"}`).join("<br>") : "None selected";
  summary.innerHTML = `<div class="summary-row"><span>Section</span><b>${esc(requestedSection || "Any")}</b></div>
    <div class="summary-row"><span>Seats</span><b>${selected.length}</b></div>
    <div class="summary-row"><span>Selection</span><b>${seatText}</b></div>
    <div class="summary-row"><span>Total</span><b>${money(total, currency)}</b></div>`;
}

function renderSeats(section) {
  const filtered = allSeats.filter(x => !section || String(x.section || "") === String(section));
  visibleSeats = filtered;
  if (!filtered.length) {
    seatsBox.innerHTML = '<div class="empty">No available seats in this section.</div>';
    pay.disabled = true;
    return;
  }
  const groups = {};
  filtered.forEach(x => (groups[x.row || "—"] ||= []).push(x));
  seatsBox.innerHTML = `<div class="seat-section-heading"><div><b>${section ? `Section ${esc(section)}` : "Available seats"}</b><span>${filtered.length} available</span></div></div>` +
    Object.entries(groups).map(([row, arr]) => `<div class="seat-row"><span class="row-label">Row ${esc(row)}</span><div class="seat-grid">${arr.map(x => {
      const status = String(x.status || "Available").toLowerCase();
      const disabled = status !== "available" && status !== "active" && status !== "";
      const selectedClass = selected.includes(Number(x.id)) ? " selected" : "";
      return `<button type="button" class="seat${selectedClass}${disabled ? " sold" : ""}" data-id="${esc(x.id)}" ${disabled ? "disabled" : ""} title="${esc(seatCurrency(x))}">
        <strong>${esc(x.seat || "—")}</strong><small>${money(seatPrice(x), seatCurrency(x))}</small>
      </button>`;
    }).join("")}</div></div>`).join("");

  seatsBox.querySelectorAll(".seat:not([disabled])").forEach(b => b.addEventListener("click", () => {
    const id = Number(b.dataset.id), idx = selected.indexOf(id);
    if (idx >= 0) { selected.splice(idx, 1); b.classList.remove("selected"); }
    else { selected.push(id); b.classList.add("selected"); }
    renderSummary();
  }));
  pay.disabled = false;
  renderSummary();
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  const id = params.get("event");
  if (!id) { showMessage(msg, "No event selected.", "error"); return; }
  try {
    const d = await api("/events/" + encodeURIComponent(id));
    eventData = d.event || d.data || d;
    $("eventInfo").classList.remove("loading");
    $("eventInfo").innerHTML = `<h2>${esc(eventData.title)}</h2><p><strong>📅</strong> ${esc(eventData.date)} · ${esc(eventData.time)}</p><p><strong>📍</strong> ${esc(eventData.venue)}, ${esc(eventData.city)}${eventData.country ? `, ${esc(eventData.country)}` : ""}</p><p class="muted">Choose your exact section, row and seat before payment.</p>`;

    const currencies = supportedCurrencies(eventData);
    if (currencySelect) {
      currencySelect.innerHTML = currencies.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
      currencySelect.value = currencies[0];
      currencySelect.addEventListener("change", renderSummary);
    }

    const s = await api("/events/" + encodeURIComponent(id) + "/seats");
    allSeats = (s.seats || s.data || []).filter(x => String(x.status || "Available").toLowerCase() !== "sold");
    if (!allSeats.length) { seatsBox.innerHTML = '<div class="empty">No seats are currently available.</div>'; pay.disabled = true; return; }

    const sections = [...new Set(allSeats.map(x => String(x.section || "General Admission")))];
    const select = $("sectionSelect");
    if (select) {
      select.innerHTML = `<option value="">All sections</option>` + sections.map(sec => `<option value="${esc(sec)}">Section ${esc(sec)}</option>`).join("");
      select.value = requestedSection && sections.includes(requestedSection) ? requestedSection : "";
      select.addEventListener("change", () => { selected = []; renderSeats(select.value); });
    }
    renderSeats(select?.value || requestedSection);
  } catch (e) {
    $("eventInfo").innerHTML = `<span class="error">${esc(e.message)}</span>`;
    pay.disabled = true;
  }
});

pay?.addEventListener("click", async () => {
  if (!selected.length) { showMessage(msg, "Select at least one seat.", "error"); return; }
  pay.disabled = true; pay.textContent = "Opening secure payment…";
  try {
    const currency = currencySelect?.value || eventData.currency || "NGN";
    const d = await api("/payment/initialize", { method: "POST", body: JSON.stringify({ eventId: eventData.id, seatIds: selected, currency }) });
    if (!d.authorization_url) throw new Error("Payment gateway did not return a checkout URL.");
    location.href = d.authorization_url;
  } catch (e) { showMessage(msg, e.message, "error"); pay.disabled = false; pay.textContent = "Pay securely"; }
});
