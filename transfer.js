document.addEventListener("DOMContentLoaded",async()=>{
 if(!requireAuth())return;
 const id=new URLSearchParams(location.search).get("id"),preview=$("preview"),form=$("form"),msg=$("msg");
 try{
  const d=await api("/tickets/"+encodeURIComponent(id)),t=d.ticket;
  preview.innerHTML=`<h2>${esc(t.eventTitle)}</h2><p>${esc(t.date)} · ${esc(t.time||"")} · ${esc(t.venue)}</p>
  <p><b>Section ${esc(t.section||"—")} · Row ${esc(t.row||"—")} · Seat ${esc(t.seat||"—")}</b></p>`;
  form.addEventListener("submit",async e=>{
   e.preventDefault();const btn=form.querySelector("button");btn.disabled=true;btn.textContent="Sending transfer…";
   try{
    const d=await api("/transfers",{method:"POST",body:JSON.stringify({ticketId:Number(id),recipientName:$("name").value.trim(),recipientEmail:$("email").value.trim().toLowerCase(),recipientPhone:$("phone").value.trim(),message:$("message").value.trim()})});
    showMessage(msg,d.message||"Transfer invitation sent.","success");form.reset();
   }catch(x){showMessage(msg,x.message,"error")}finally{btn.disabled=false;btn.textContent="Send transfer invitation"}
  });
 }catch(e){preview.innerHTML=`<p class="error">${esc(e.message)}</p>`}
});
