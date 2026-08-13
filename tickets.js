document.addEventListener("DOMContentLoaded",async()=>{
 const box=$("tickets");if(!box||!requireAuth())return;
 try{
  const d=await api("/tickets/me"),ts=d.tickets||[];
  if(!ts.length){box.innerHTML='<div class="empty">You have no tickets yet.</div>';return}
  box.innerHTML=ts.map(t=>`<article class="event-card"><div class="event-body">
   <span class="status">${esc(t.status||"active")}</span><h3>${esc(t.eventTitle)}</h3>
   <p>${esc(t.date)} · ${esc(t.time||"")} · ${esc(t.venue)}</p>
   <p>Section <b>${esc(t.section||"—")}</b> · Row <b>${esc(t.row||"—")}</b> · Seat <b>${esc(t.seat||"—")}</b></p>
   <a class="button" href="./ticket.html?id=${encodeURIComponent(t.id)}">Open ticket</a></div></article>`).join("");
 }catch(e){box.innerHTML=`<div class="empty error">${esc(e.message)}</div>`}
});
