document.addEventListener("DOMContentLoaded",async()=>{
 const box=$("ticket");if(!box||!requireAuth())return;
 const id=new URLSearchParams(location.search).get("id");
 try{
  const d=await api("/tickets/"+encodeURIComponent(id)),t=d.ticket;
  box.innerHTML=`<div class="ticket-header"><b>TICKETWAVES</b><span>${esc(t.status||"Active")}</span></div>
  ${t.image?`<img class="ticket-cover" src="${esc(t.image)}" alt="${esc(t.eventTitle)}">`:""}
  <div class="ticket-body"><h1>${esc(t.eventTitle)}</h1><p>${esc(t.date)} · ${esc(t.time||"")}</p><p>${esc(t.venue)} · ${esc(t.city||"")} ${esc(t.country||"")}</p>
  <div class="ticket-seats"><div>Section<br><b>${esc(t.section||"—")}</b></div><div>Row<br><b>${esc(t.row||"—")}</b></div><div>Seat<br><b>${esc(t.seat||"—")}</b></div></div>
  <p><b>Ticket:</b> ${esc(t.ticketNumber)}</p><div class="qr">${t.qrData?`<img src="${esc(t.qrData)}" alt="Ticket QR">`:"<p class='muted'>QR will be available from the backend.</p>"}</div>
  <a class="button" href="./transfer.html?id=${encodeURIComponent(t.id)}">Transfer ticket</a></div>`;
 }catch(e){box.innerHTML=`<div class="empty error">${esc(e.message)}</div>`}
});
