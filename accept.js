document.addEventListener("DOMContentLoaded",async()=>{
 const box=$("box"),t=new URLSearchParams(location.search).get("token");
 if(!t){box.innerHTML='<div class="empty error">Invalid transfer invitation.</div>';return}
 try{
  const d=await api("/transfers/invitation/"+encodeURIComponent(t)),x=d.transfer;
  const u=currentUser();
  box.innerHTML=`<h1>Accept your ticket</h1><p class="muted">Sent by ${esc(x.senderName||"another TicketWAVES user")}</p>
  <div class="panel"><h2>${esc(x.eventTitle)}</h2><p>${esc(x.date)} · ${esc(x.time||"")}<br>${esc(x.venue)}</p>
  <p><b>Section:</b> ${esc(x.section||"—")} &nbsp; <b>Row:</b> ${esc(x.row||"—")} &nbsp; <b>Seat:</b> ${esc(x.seat||"—")}</p>
  <p><b>Recipient email:</b> ${esc(x.recipientEmail)}</p></div>
  <div id="acceptArea"></div>`;
  const area=$("acceptArea");
  if(!u){
   area.innerHTML=`<div class="notice">You need a TicketWAVES account to receive this ticket. Use the same email address shown above.</div>
   <br><a class="button" href="./register.html?transferToken=${encodeURIComponent(t)}&email=${encodeURIComponent(x.recipientEmail)}">Create account</a>
   <a class="button secondary" href="./login.html?transferToken=${encodeURIComponent(t)}&email=${encodeURIComponent(x.recipientEmail)}">I already have an account</a>`;
   return;
  }
  if(String(u.email).toLowerCase()!==String(x.recipientEmail).toLowerCase()){
   area.innerHTML=`<p class="error">You are signed in as ${esc(u.email)}. Sign out and sign in with ${esc(x.recipientEmail)} to accept this ticket.</p>`;
   return;
  }
  area.innerHTML='<button id="acceptBtn" class="primary">Accept ticket</button><p id="acceptMsg"></p>';
  $("acceptBtn").onclick=async()=>{ $("acceptBtn").disabled=true;try{const r=await api("/transfers/accept",{method:"POST",body:JSON.stringify({token:t})});showMessage($("acceptMsg"),r.message||"Ticket accepted.","success");$("acceptBtn").remove();area.insertAdjacentHTML("beforeend",'<br><br><a class="button" href="./my-tickets.html">View my ticket</a>')}catch(e){showMessage($("acceptMsg"),e.message,"error");$("acceptBtn").disabled=false}};
 }catch(e){box.innerHTML=`<div class="empty error"><h2>Invitation unavailable</h2><p>${esc(e.message)}</p></div>`}
});
