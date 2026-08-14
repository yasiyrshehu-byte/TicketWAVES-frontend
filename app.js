(() => {
  const state = { events: [], tickets: [], user: null, loaded: false };
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const money = n => {
    const num = Number(n || 0);
    try { return new Intl.NumberFormat(undefined, {style:"currency", currency:"NGN", maximumFractionDigits:2}).format(num); }
    catch { return "₦" + num.toLocaleString(); }
  };
  const toast = (msg, bad=false) => {
    const el = $("#toast"); if (!el) return;
    el.textContent = msg; el.className = "toast show " + (bad ? "bad" : "");
    clearTimeout(window.__twToast); window.__twToast = setTimeout(() => el.className = "toast", 3200);
  };
  const normalizeList = data => Array.isArray(data) ? data : (data?.events || data?.tickets || data?.orders || data?.users || data?.data || []);
  const imageOf = e => e?.image || e?.imageUrl || e?.poster || e?.coverImage || "";
  const eventId = e => e?._id || e?.id || e?.eventId;
  const ticketId = t => t?._id || t?.id || t?.ticketId;

  async function loadUser() {
    try {
      if (!TWAPI.token()) return null;
      const d = await TWAPI.get("/auth/me");
      state.user = d?.user || d;
      return state.user;
    } catch {
      const cached = localStorage.getItem("tw_user");
      if (cached) { try { state.user = JSON.parse(cached); } catch {} }
      return state.user;
    }
  }

  async function loadEvents() {
    const paths = ["/events", "/events?status=active"];
    let data;
    for (const p of paths) { try { data = await TWAPI.get(p); break; } catch {} }
    state.events = normalizeList(data);
    renderEvents();
  }

  async function loadTickets() {
    if (!TWAPI.token()) {
      state.tickets = [];
      renderTickets();
      return;
    }
    const paths = ["/orders/my-tickets", "/tickets/my", "/tickets", "/orders"];
    for (const p of paths) {
      try {
        const data = await TWAPI.get(p);
        const list = normalizeList(data);
        if (list.length || p === paths[paths.length-1]) { state.tickets = list.filter(x => x.ticket || x.event || x.ticketCode || x.orderNumber); break; }
      } catch {}
    }
    renderTickets();
  }

  function eventCard(e) {
    const img = imageOf(e);
    const title = e.title || e.name || "Untitled event";
    const artist = e.artist || e.artistName || "";
    const date = e.date || e.eventDate || e.startDate;
    const venue = e.venue || e.location || "";
    const city = e.city || e.country || "";
    const price = e.price ?? e.minPrice ?? e.startingPrice ?? 0;
    return `<article class="event-card">
      <button class="event-image" data-event="${escapeHtml(eventId(e))}">
        ${img ? `<img src="${escapeHtml(img)}" alt="">` : `<div class="image-placeholder">TICKET<br>WAVES</div>`}
        <span class="status-pill">${e.status || "Available"}</span>
      </button>
      <div class="event-body">
        <small>${escapeHtml(artist)}</small>
        <h3>${escapeHtml(title)}</h3>
        <p>◷ ${escapeHtml(date ? new Date(date).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"}) : "Date TBA")}</p>
        <p>⌖ ${escapeHtml(venue)}${city ? " · " + escapeHtml(city) : ""}</p>
        <div class="event-foot"><b>${money(price)}</b><button class="mini-btn" data-event="${escapeHtml(eventId(e))}">View</button></div>
      </div>
    </article>`;
  }

  function renderEvents(list=state.events) {
    const html = list.length ? list.map(eventCard).join("") : `<div class="empty-card">No events yet. Admin-created events will appear here automatically.</div>`;
    $("#popular-grid").innerHTML = html;
    $("#recommend-grid").innerHTML = html;
  }

  function renderFavorites() {
    const favs = JSON.parse(localStorage.getItem("tw_favorites") || "[]");
    $("#favorites-strip").innerHTML = `<button class="favorite-add" data-action="favorites">＋<span>Add favourites</span></button>` +
      favs.slice(0,8).map(f => `<div class="favorite-card"><div>${f.image ? `<img src="${escapeHtml(f.image)}" alt="">` : "♡"}</div><span>${escapeHtml(f.name)}</span></div>`).join("");
  }

  function ticketCard(t) {
    const e = t.event || {};
    const title = t.eventTitle || e.title || t.title || "Ticket";
    const code = t.ticketCode || t.code || t.orderNumber || ticketId(t) || "TW-" + Math.random().toString(36).slice(2,9).toUpperCase();
    const img = imageOf(e) || t.image || "";
    const date = t.eventDate || e.date || e.eventDate || "";
    const section = t.section || t.ticketSection || "General";
    const row = t.row || t.ticketRow || "—";
    const seat = t.seat || t.ticketSeat || "—";
    const qty = t.quantity || 1;
    return `<article class="ticket-card" data-ticket="${escapeHtml(ticketId(t))}">
      <div class="ticket-top">${img ? `<img src="${escapeHtml(img)}" alt="">` : `<div class="ticket-art">TW</div>`}<div><span class="eyebrow dark">YOUR TICKET</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(date)}</p></div></div>
      <div class="ticket-details">
        <div><small>SECTION</small><b>${escapeHtml(section)}</b></div><div><small>ROW</small><b>${escapeHtml(row)}</b></div><div><small>SEAT</small><b>${escapeHtml(seat)}</b></div><div><small>QTY</small><b>${escapeHtml(qty)}</b></div>
      </div>
      <div class="ticket-code"><svg class="barcode" data-code="${escapeHtml(code)}"></svg><b>${escapeHtml(code)}</b></div>
      <div class="ticket-actions"><button class="primary-btn" data-open-ticket="${escapeHtml(ticketId(t))}">Open ticket</button><button class="secondary-btn" data-transfer-ticket="${escapeHtml(ticketId(t))}">Transfer</button></div>
    </article>`;
  }

  function renderTickets() {
    $("#tickets-list").innerHTML = state.tickets.length ? state.tickets.map(ticketCard).join("") :
      `<div class="empty-card"><h3>No tickets yet</h3><p>Tickets from purchases, admin giveaways and transfers will appear here.</p><button class="primary-btn" data-nav="#discover">Find events</button></div>`;
    if (window.JsBarcode) $$(".barcode").forEach(svg => { try { JsBarcode(svg, svg.dataset.code, {format:"CODE128",displayValue:false,height:54,margin:0}); } catch {} });
  }

  function navigate(hash) {
    hash = hash || "#discover";
    const key = hash.replace("#","").split("?")[0];
    const valid = ["discover","for-you","tickets","sell","account"];
    const page = valid.includes(key) ? key : "discover";
    $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-"+page));
    $$(".bottom-nav button").forEach(b => b.classList.toggle("selected", b.dataset.nav === "#"+page));
    history.replaceState(null,"", "#"+page);
    if (page === "tickets") loadTickets();
    if (page === "account") renderAccount();
  }

  function renderAccount() {
    const u = state.user;
    $("#account-name").textContent = u?.name || u?.fullName || "Account";
    $("#account-email").textContent = u?.email || "Sign in to manage your account.";
    $("#account-location").textContent = u?.location || localStorage.getItem("tw_location") || "Not set";
    $("#account-country").textContent = u?.country || localStorage.getItem("tw_country") || "Not set";
    $("#notifications-toggle").checked = localStorage.getItem("tw_notifications") !== "false";
    $("#location-toggle").checked = localStorage.getItem("tw_location_content") === "true";
  }

  async function openEvent(id) {
    const e = state.events.find(x => String(eventId(x)) === String(id));
    if (!e) return toast("Event not found", true);
    const m = $("#event-modal");
    const img = imageOf(e);
    m.innerHTML = `<div class="modal-sheet">
      <button class="modal-close">×</button>
      ${img ? `<img class="modal-cover" src="${escapeHtml(img)}" alt="">` : ""}
      <div class="modal-content"><span class="eyebrow dark">${escapeHtml(e.artist || e.artistName || "LIVE EVENT")}</span><h2>${escapeHtml(e.title || e.name)}</h2>
      <p>◷ ${escapeHtml(e.date || e.eventDate || "Date TBA")} · ${escapeHtml(e.time || e.eventTime || "Time TBA")}</p>
      <p>⌖ ${escapeHtml(e.venue || e.location || "Venue TBA")} · ${escapeHtml(e.city || e.country || "")}</p>
      <div class="price-box"><span>From</span><b>${money(e.price ?? e.minPrice ?? e.startingPrice)}</b></div>
      <button class="primary-btn full" data-buy-event="${escapeHtml(id)}">Continue to tickets</button></div></div>`;
    m.classList.remove("hidden");
  }

  function openTicket(tid) {
    const t = state.tickets.find(x => String(ticketId(x)) === String(tid));
    if (!t) return toast("Ticket not found", true);
    const e=t.event||{};
    const code=t.ticketCode||t.code||t.orderNumber||ticketId(t)||"TW-TICKET";
    const m=$("#ticket-modal");
    m.innerHTML=`<div class="modal-sheet ticket-sheet"><button class="modal-close">×</button>
      <div class="ticket-big"><div class="ticket-brand">TICKET<span>WAVES</span></div><h2>${escapeHtml(t.eventTitle||e.title||t.title||"Ticket")}</h2>
      <p>${escapeHtml(t.eventDate||e.date||e.eventDate||"")} · ${escapeHtml(t.eventTime||e.time||"")}</p><p>${escapeHtml(t.venue||e.venue||e.location||"")}</p>
      <div class="ticket-seat-grid"><div><small>SECTION</small><b>${escapeHtml(t.section||"General")}</b></div><div><small>ROW</small><b>${escapeHtml(t.row||"—")}</b></div><div><small>SEAT</small><b>${escapeHtml(t.seat||"—")}</b></div></div>
      <svg class="barcode big-barcode" id="big-barcode"></svg><strong>${escapeHtml(code)}</strong><p class="ticket-note">Keep this ticket ready at the venue. The barcode and ticket information come from your TicketWAVES ticket record.</p></div></div>`;
    m.classList.remove("hidden");
    if(window.JsBarcode) try{JsBarcode("#big-barcode",code,{format:"CODE128",height:80,width:2,displayValue:false,margin:8});}catch{}
  }

  function showAuth() {
    const m=$("#auth-modal");
    m.innerHTML=`<div class="modal-sheet small"><button class="modal-close">×</button><div class="modal-content"><span class="eyebrow dark">ACCOUNT</span><h2>Sign in</h2><p>Use your TicketWAVES account to access tickets and orders.</p><input id="login-email" class="field" type="email" placeholder="Email"><input id="login-password" class="field" type="password" placeholder="Password"><button id="login-btn" class="primary-btn full">Sign in</button><p class="muted">If your backend uses different auth paths, update them in assets/js/app.js.</p></div></div>`;
    m.classList.remove("hidden");
  }

  async function login() {
    const email=$("#login-email").value.trim(), password=$("#login-password").value;
    try {
      const d=await TWAPI.send("/auth/login","POST",{email,password});
      const tk=d?.token||d?.accessToken||d?.data?.token;
      if(tk) localStorage.setItem("tw_token",tk);
      state.user=d?.user||d?.data?.user||d;
      localStorage.setItem("tw_user",JSON.stringify(state.user||{}));
      $("#auth-modal").classList.add("hidden"); toast("Signed in successfully"); renderAccount(); loadTickets();
    } catch(e){ toast(e.message||"Unable to sign in",true); }
  }

  async function buyEvent(id) {
    if (!TWAPI.token()) { $("#event-modal").classList.add("hidden"); showAuth(); return; }
    toast("Opening ticket selection…");
    // The existing backend can expose /tickets?eventId=ID or /events/ID/tickets.
    try {
      const d=await TWAPI.get("/events/"+encodeURIComponent(id)+"/tickets");
      const list=normalizeList(d);
      if(!list.length) throw new Error("No tickets are available for this event.");
      $("#event-modal").classList.add("hidden");
      const t=list[0];
      await createOrder(t);
    } catch(e) { toast(e.message||"No tickets available",true); }
  }

  async function createOrder(t) {
    try {
      const d=await TWAPI.send("/orders","POST",{ticketId:ticketId(t),quantity:1});
      toast("Order created. Complete payment in your checkout flow.");
      await loadTickets();
      navigate("#tickets");
    } catch(e){ toast(e.message||"Could not create order",true); }
  }

  function setup() {
    document.addEventListener("click", async ev => {
      const nav=ev.target.closest("[data-nav]"); if(nav){ev.preventDefault();navigate(nav.dataset.nav);return;}
      const ec=ev.target.closest("[data-event]"); if(ec){openEvent(ec.dataset.event);return;}
      const buy=ev.target.closest("[data-buy-event]"); if(buy){buyEvent(buy.dataset.buyEvent);return;}
      const ot=ev.target.closest("[data-open-ticket]"); if(ot){openTicket(ot.dataset.openTicket);return;}
      const close=ev.target.closest(".modal-close"); if(close){close.closest(".modal").classList.add("hidden");return;}
      const cat=ev.target.closest(".category-card"); if(cat){const filtered=state.events.filter(e=>(e.category||"").toLowerCase()===cat.dataset.category.toLowerCase());renderEvents(filtered.length?filtered:state.events);navigate("#discover");return;}
      const action=ev.target.closest("[data-action]"); if(action){handleAction(action.dataset.action);return;}
      const transfer=ev.target.closest("[data-transfer-ticket]"); if(transfer){toast("Transfer flow is ready for the backend transfer endpoint.",false);return;}
    });
    $("#global-search").addEventListener("submit",e=>{e.preventDefault();const q=$("#search-input").value.trim().toLowerCase();renderEvents(state.events.filter(x=>JSON.stringify(x).toLowerCase().includes(q)));});
    $("#notifications-toggle").addEventListener("change",e=>localStorage.setItem("tw_notifications",e.target.checked));
    $("#location-toggle").addEventListener("change",e=>localStorage.setItem("tw_location_content",e.target.checked));
    $("#admin-logout")?.addEventListener("click",()=>{localStorage.removeItem("tw_token");localStorage.removeItem("token");location.href="./index.html#discover";});
    window.addEventListener("hashchange",()=>navigate(location.hash));
  }

  async function handleAction(action) {
    if(action==="logout"){localStorage.removeItem("tw_token");localStorage.removeItem("token");localStorage.removeItem("tw_user");toast("Logged out");navigate("#discover");return;}
    if(action==="edit-details"){toast("Edit details page can be connected to /auth/me + /users/me.");return;}
    if(action==="orders"){toast("Open My Tickets to see ticket-linked orders.");navigate("#tickets");return;}
    if(action==="favorites"){toast("Favourite artists can be stored in your account profile.");return;}
    if(action==="security"){toast("Security settings are controlled by the backend authentication endpoints.");return;}
    if(action==="notifications"){toast("Your notification centre is ready for backend notification data.");return;}
    if(action==="location"){const v=prompt("Enter your city or location:",localStorage.getItem("tw_location")||"");if(v){localStorage.setItem("tw_location",v);renderAccount();}}
    if(action==="country"){const v=prompt("Enter your country:",localStorage.getItem("tw_country")||"");if(v){localStorage.setItem("tw_country",v);renderAccount();}}
  }

  async function boot(){
    setup(); renderFavorites(); navigate(location.hash||"#discover");
    try{await loadUser();}catch{}
    renderAccount();
    try{await loadEvents(); state.loaded=true;}catch(e){toast("Backend unavailable — check API Settings/Render URL.",true);}
    await loadTickets();
  }
  boot();
})();
