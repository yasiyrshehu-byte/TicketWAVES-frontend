(() => {
  const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const list=d=>Array.isArray(d)?d:(d?.data||d?.users||d?.events||d?.tickets||d?.orders||d?.giveaways||[]);
  const id=x=>x?._id||x?.id;
  const money=n=>{try{return new Intl.NumberFormat(undefined,{style:"currency",currency:"NGN"}).format(Number(n||0))}catch{return"₦"+Number(n||0).toLocaleString()}};
  const toast=(m,bad=false)=>{const t=$("#toast");t.textContent=m;t.className="toast show "+(bad?"bad":"");clearTimeout(window.__at);window.__at=setTimeout(()=>t.className="toast",3200)};
  const state={};

  async function fetchFirst(paths){
    let last;
    for(const p of paths){try{return await TWAPI.get(p)}catch(e){last=e}}
    throw last||new Error("Request failed");
  }

  async function stats(){
    try{return await fetchFirst(["/admin/stats","/admin/dashboard","/admin/analytics"])}
    catch{return {}}
  }

  function renderPage(title,sub,body){return `<h1>${title}</h1><p class="sub">${sub}</p>${body}`}

  function table(headers, rows){
    return `<div class="admin-card admin-table-wrap"><table class="admin-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.join(""):`<tr><td colspan="${headers.length}">No records found.</td></tr>`}</tbody></table></div>`;
  }

  async function renderDashboard(el){
    const s=await stats(); const u=s.users??s.totalUsers??"—", ev=s.events??s.totalEvents??"—", tk=s.tickets??s.totalTickets??"—", rev=s.revenue??s.totalRevenue??0;
    el.innerHTML=renderPage("Overview","A single control centre for every TicketWAVES record.",`<div class="stat-grid">
      <div class="stat"><span>Users</span><strong>${esc(u)}</strong></div><div class="stat"><span>Events</span><strong>${esc(ev)}</strong></div><div class="stat"><span>Tickets</span><strong>${esc(tk)}</strong></div><div class="stat"><span>Revenue</span><strong>${money(rev)}</strong></div>
    </div><div class="notice">The admin is split into separate pages so every area can be tested independently. Data should come from the Render API, not disappear after a refresh.</div>
    <div class="admin-card"><h2>Quick actions</h2><div class="admin-actions"><a class="btn primary" href="#create-event">Create event</a><a class="btn primary" href="#create-giveaway">Create giveaway</a><a class="btn" href="#tickets">Manage tickets</a><a class="btn" href="#users">Manage users</a></div></div>`);
  }

  async function renderUsers(el,suspended=false){
    let data=await fetchFirst(suspended?["/admin/users/suspended","/users?suspended=true"]:["/admin/users","/users"]);
    const rows=list(data).map(u=>`<tr><td>${esc(u.name||u.fullName||"—")}</td><td>${esc(u.email)}</td><td>${esc(u.role||"user")}</td><td>${esc(u.suspended?"Suspended":"Active")}</td><td><div class="admin-actions"><button class="btn ${u.suspended?"success":"danger"}" data-user-toggle="${esc(id(u))}" data-suspended="${u.suspended}">${u.suspended?"Unsuspend":"Suspend"}</button></div></td></tr>`);
    el.innerHTML=renderPage(suspended?"Suspended users":"Users",suspended?"Only suspended accounts.":"All registered accounts.",table(["Name","Email","Role","Status","Action"],rows));
  }

  async function renderEvents(el){
    const data=await fetchFirst(["/admin/events","/events"]); const rows=list(data).map(e=>`<tr><td>${e.image||e.imageUrl?`<img src="${esc(e.image||e.imageUrl)}" style="width:54px;height:38px;object-fit:cover;border-radius:8px">`:"—"}</td><td>${esc(e.title||e.name)}</td><td>${esc(e.artist||e.artistName||"")}</td><td>${esc(e.date||e.eventDate||"")}</td><td>${esc(e.venue||e.location||"")}</td><td><div class="admin-actions"><button class="btn" data-edit-event="${esc(id(e))}">Edit</button><button class="btn danger" data-delete-event="${esc(id(e))}">Delete</button></div></td></tr>`);
    el.innerHTML=renderPage("Events","Create, edit or remove event listings.",`<div class="admin-actions"><a class="btn primary" href="#create-event">+ Create event</a></div>`+table(["Image","Event","Artist","Date","Venue","Actions"],rows));
  }

  async function renderTickets(el,available=false){
    const data=await fetchFirst(available?["/admin/tickets/available","/tickets?status=available"]:["/admin/tickets","/tickets"]);
    const rows=list(data).map(t=>`<tr><td>${esc(t.ticketCode||t.code||id(t))}</td><td>${esc(t.eventTitle||t.event?.title||t.eventName||"")}</td><td>${esc(t.section||"—")}</td><td>${esc(t.row||"—")}</td><td>${esc(t.seat||"—")}</td><td>${esc(t.status||"available")}</td><td>${money(t.price)}</td><td><div class="admin-actions"><button class="btn" data-edit-ticket="${esc(id(t))}">Edit</button><button class="btn danger" data-delete-ticket="${esc(id(t))}">Delete</button></div></td></tr>`);
    el.innerHTML=renderPage(available?"Available tickets":"All tickets",available?"Tickets that can be sold or given away.":"Every ticket record, including owned and sold tickets.",table(["Code","Event","Section","Row","Seat","Status","Price","Actions"],rows));
  }

  async function renderOrders(el,paid=false){
    const data=await fetchFirst(paid?["/admin/orders/paid","/orders?status=paid"]:["/admin/orders","/orders"]);
    const rows=list(data).map(o=>`<tr><td>${esc(o.orderNumber||id(o))}</td><td>${esc(o.user?.email||o.email||o.userEmail||"")}</td><td>${esc(o.event?.title||o.eventTitle||"")}</td><td>${money(o.total||o.amount||o.price)}</td><td>${esc(o.status||"")}</td><td>${esc(o.createdAt?new Date(o.createdAt).toLocaleString():"")}</td></tr>`);
    el.innerHTML=renderPage(paid?"Paid orders":"All orders",paid?"Completed/paid orders.":"Every order in the system.",table(["Order","Customer","Event","Amount","Status","Created"],rows));
  }

  async function renderRevenue(el){
    const data=await fetchFirst(["/admin/revenue","/admin/analytics"]); const total=data.total??data.revenue??data.totalRevenue??0;
    el.innerHTML=renderPage("Revenue","Sales and paid-order revenue from the backend.",`<div class="stat-grid"><div class="stat"><span>Total revenue</span><strong>${money(total)}</strong></div><div class="stat"><span>Paid orders</span><strong>${esc(data.paidOrders??data.orders??"—")}</strong></div></div><div class="admin-card"><h2>Revenue response</h2><pre style="white-space:pre-wrap">${esc(JSON.stringify(data,null,2))}</pre></div>`);
  }

  async function renderGiveaways(el){
    const data=await fetchFirst(["/admin/giveaways","/giveaways"]); const rows=list(data).map(g=>`<tr><td>${esc(g.recipientEmail||g.user?.email||"")}</td><td>${esc(g.ticket?.ticketCode||g.ticketCode||"")}</td><td>${esc(g.event?.title||g.eventTitle||"")}</td><td>${esc(g.createdAt?new Date(g.createdAt).toLocaleString():"")}</td></tr>`);
    el.innerHTML=renderPage("Giveaways","Give a ticket directly to an existing account. Email delivery is not required.",`<div class="admin-actions"><a class="btn primary" href="#create-giveaway">+ Create giveaway</a></div>`+table(["Recipient","Ticket","Event","Created"],rows));
  }

  function createEventForm(existing={}){
    const e=existing; return page(e._id?"Edit event":"Create event","Add event details and upload the image directly from your gallery.",`<form id="event-form" class="admin-card form-grid" data-id="${esc(id(e)||"")}">
      <div class="form-field"><label>Event title</label><input name="title" required value="${esc(e.title||"")}"></div>
      <div class="form-field"><label>Artist name</label><input name="artist" value="${esc(e.artist||e.artistName||"")}"></div>
      <div class="form-field"><label>Date</label><input name="date" type="date" required value="${esc((e.date||e.eventDate||"").slice?.(0,10)||"")}"></div>
      <div class="form-field"><label>Time</label><input name="time" type="time" value="${esc(e.time||e.eventTime||"")}"></div>
      <div class="form-field"><label>Venue</label><input name="venue" required value="${esc(e.venue||"")}"></div>
      <div class="form-field"><label>City / country</label><input name="city" value="${esc(e.city||e.country||"")}"></div>
      <div class="form-field"><label>Category</label><select name="category">${["Concerts","Sports","Theatre","Comedy","Festival","Conference","Other"].map(x=>`<option ${x===(e.category||"Concerts")?"selected":""}>${x}</option>`).join("")}</select></div>
      <div class="form-field"><label>Starting price</label><input name="price" type="number" min="0" step="0.01" value="${esc(e.price??e.minPrice??"")}"></div>
      <div class="form-field full"><label>Description</label><textarea name="description">${esc(e.description||"")}</textarea></div>
      <div class="form-field full"><label>Event image — choose from gallery</label><div class="upload-box"><input id="event-image" name="image" type="file" accept="image/*"><img id="event-preview" class="upload-preview" src="${esc(e.image||e.imageUrl||"")}"></div></div>
      <div class="form-field full"><div class="admin-actions"><button class="btn primary" type="submit">Save event</button><a class="btn" href="#events">Cancel</a></div></div>
    </form>`);
  }

  function createGiveawayForm(){
    return page("Create giveaway","Separate from Create Event. The admin can enter the event/ticket information and recipient directly.",`<form id="giveaway-form" class="admin-card form-grid">
      <div class="form-field"><label>Recipient account email</label><input name="recipientEmail" type="email" required></div>
      <div class="form-field"><label>Event title</label><input name="eventTitle" required></div>
      <div class="form-field"><label>Artist</label><input name="artist"></div>
      <div class="form-field"><label>Event date</label><input name="eventDate" type="date" required></div>
      <div class="form-field"><label>Event time</label><input name="eventTime" type="time"></div>
      <div class="form-field"><label>Venue</label><input name="venue" required></div>
      <div class="form-field"><label>City / country</label><input name="city"></div>
      <div class="form-field"><label>Section</label><input name="section" placeholder="e.g. N110"></div>
      <div class="form-field"><label>Row</label><input name="row"></div>
      <div class="form-field"><label>Seat</label><input name="seat"></div>
      <div class="form-field"><label>Quantity</label><input name="quantity" type="number" min="1" value="1"></div>
      <div class="form-field"><label>Ticket price</label><input name="price" type="number" min="0" step="0.01" value="0"></div>
      <div class="form-field full"><label>Ticket / event information</label><textarea name="information" placeholder="Add the ticket information the recipient should see."></textarea></div>
      <div class="form-field full"><label>Image — choose from gallery</label><div class="upload-box"><input id="giveaway-image" name="image" type="file" accept="image/*"><img id="giveaway-preview" class="upload-preview"></div></div>
      <div class="form-field full"><button class="btn primary" type="submit">Issue free ticket</button></div>
    </form>`);
  }

  async function editTicket(idv){
    let t; try{t=await fetchFirst([`/admin/tickets/${idv}`,`/tickets/${idv}`])}catch(e){toast("Could not load ticket",true);return}
    const el=$('[data-page="tickets"]');
    el.innerHTML=renderPage("Edit ticket","Change section, row, seat and additional ticket information.",`<form id="ticket-form" class="admin-card form-grid" data-id="${esc(idv)}">
      <div class="form-field"><label>Section</label><input name="section" value="${esc(t.section||"")}"></div>
      <div class="form-field"><label>Row</label><input name="row" value="${esc(t.row||"")}"></div>
      <div class="form-field"><label>Additional section</label><input name="additionalSection" value="${esc(t.additionalSection||"")}"></div>
      <div class="form-field"><label>Additional row</label><input name="additionalRow" value="${esc(t.additionalRow||"")}"></div>
      <div class="form-field"><label>Seat</label><input name="seat" value="${esc(t.seat||"")}"></div>
      <div class="form-field"><label>Price</label><input name="price" type="number" value="${esc(t.price??0)}"></div>
      <div class="form-field full"><label>Additional ticket information</label><textarea name="information">${esc(t.information||t.notes||"")}</textarea></div>
      <div class="form-field full"><label>Status</label><select name="status">${["available","reserved","sold","issued","transferred","cancelled"].map(s=>`<option ${s===(t.status||"available")?"selected":""}>${s}</option>`).join("")}</select></div>
      <div class="form-field full"><div class="admin-actions"><button class="btn primary" type="submit">Save ticket</button><button type="button" class="btn" data-ticket-back>Back</button></div></div>
    </form>`);
  }

  async function saveEvent(form){
    const fd=new FormData(form); const obj=Object.fromEntries(fd.entries()); const file=fd.get("image"); delete obj.image;
    if(file && file.size){obj.image=await compressImage(file)}
    const eid=form.dataset.id;
    try{
      if(eid) await TWAPI.send(`/admin/events/${eid}`,"PATCH",obj);
      else await TWAPI.send("/admin/events","POST",obj);
      toast("Event saved permanently by the backend."); location.hash="#events";
    }catch(e){toast(e.message||"Could not save event",true)}
  }

  async function saveGiveaway(form){
    const fd=new FormData(form); const obj=Object.fromEntries(fd.entries()); const file=fd.get("image"); delete obj.image;
    if(file && file.size)obj.image=await compressImage(file);
    try{
      await TWAPI.send("/admin/giveaways","POST",obj);
      toast("Free ticket issued to the account."); location.hash="#giveaways";
    }catch(e){toast(e.message||"Giveaway failed",true)}
  }

  async function saveTicket(form){
    const idv=form.dataset.id; const obj=Object.fromEntries(new FormData(form).entries());
    try{await TWAPI.send(`/admin/tickets/${idv}`,"PATCH",obj);toast("Ticket updated.");location.hash="#tickets"}catch(e){toast(e.message||"Could not update ticket",true)}
  }

  async function compressImage(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader(); r.onload=()=>{const img=new Image();img.onload=()=>{const max=TW_CONFIG.MAX_IMAGE_WIDTH;const scale=Math.min(1,max/img.width);const c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",TW_CONFIG.IMAGE_QUALITY))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file);
    });
  }

  function preview(fileInput,imgId){
    const f=fileInput.files?.[0], img=$("#"+imgId); if(!f||!img)return;
    const r=new FileReader();r.onload=()=>{img.src=r.result;img.style.display="block"};r.readAsDataURL(f);
  }

  async function route(){
    const name=(location.hash||"#dashboard").slice(1)||"dashboard";
    const page=$(`[data-page="${CSS.escape(name)}"]`)||$('[data-page="dashboard"]');
    $$(".admin-page").forEach(p=>p.classList.remove("active")); page.classList.add("active");
    $$("[data-admin-nav]").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+name));
    try{
      if(name==="dashboard") await renderDashboard(page);
      else if(name==="users") await renderUsers(page,false);
      else if(name==="suspendedUsers") await renderUsers(page,true);
      else if(name==="events") await renderEvents(page);
      else if(name==="tickets") await renderTickets(page,false);
      else if(name==="availableTickets") await renderTickets(page,true);
      else if(name==="orders") await renderOrders(page,false);
      else if(name==="paidOrders") await renderOrders(page,true);
      else if(name==="revenue") await renderRevenue(page);
      else if(name==="giveaways") await renderGiveaways(page);
      else if(name==="create-event") page.innerHTML=createEventForm();
      else if(name==="create-giveaway") page.innerHTML=createGiveawayForm();
      else if(name==="support") page.innerHTML=renderPage("Support","Review and manage customer support requests.",`<div class="admin-card"><p>Connect this page to your support endpoint when it is available. The admin navigation is already separated so support is no longer mixed into event creation.</p></div>`);
    }catch(e){page.innerHTML=page("Unable to load this section",e.message||"API request failed.",`<div class="admin-card danger-zone"><b>Backend request failed.</b><p>${esc(e.message||"Unknown error")}</p><a class="btn" href="#dashboard">Back to overview</a></div>`)}
  }

  document.addEventListener("click",async e=>{
    const dt=e.target.closest("[data-delete-ticket]"); if(dt){if(!confirm("Delete this ticket permanently?"))return;try{await TWAPI.send(`/admin/tickets/${dt.dataset.deleteTicket}`,"DELETE");toast("Ticket deleted.");route()}catch(x){toast(x.message,true)}}
    const de=e.target.closest("[data-delete-event]"); if(de){if(!confirm("Delete this event? Tickets should be handled first."))return;try{await TWAPI.send(`/admin/events/${de.dataset.deleteEvent}`,"DELETE");toast("Event deleted.");route()}catch(x){toast(x.message,true)}}
    const et=e.target.closest("[data-edit-ticket]"); if(et){await editTicket(et.dataset.editTicket)}
    const ub=e.target.closest("[data-user-toggle]"); if(ub){const suspended=ub.dataset.suspended==="true";try{await TWAPI.send(`/admin/users/${ub.dataset.userToggle}/suspend`,"PATCH",{suspended:!suspended});toast(suspended?"User unsuspended":"User suspended");route()}catch(x){toast(x.message,true)}}
    if(e.target.closest("[data-ticket-back]"))location.hash="#tickets";
  });
  document.addEventListener("change",e=>{if(e.target.id==="event-image")preview(e.target,"event-preview");if(e.target.id==="giveaway-image")preview(e.target,"giveaway-preview")});
  document.addEventListener("submit",e=>{if(e.target.id==="event-form"){e.preventDefault();saveEvent(e.target)}if(e.target.id==="giveaway-form"){e.preventDefault();saveGiveaway(e.target)}if(e.target.id==="ticket-form"){e.preventDefault();saveTicket(e.target)}});
  window.addEventListener("hashchange",route);
  (async()=>{if(!TWAPI.token()){toast("Admin login token not found. Sign in first.",true)};try{const u=await TWAPI.get("/auth/me");$("#admin-email").textContent=u?.email||u?.user?.email||"Admin control centre"}catch{}route()})();
})();
