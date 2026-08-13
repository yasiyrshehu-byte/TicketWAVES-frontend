document.addEventListener("DOMContentLoaded",()=>{
 const loginForm=$("loginForm"),dashboard=$("adminDashboard");
 if(loginForm){
  loginForm.addEventListener("submit",async e=>{e.preventDefault();const btn=loginForm.querySelector("button");btn.disabled=true;
   try{const d=await api("/auth/login",{method:"POST",body:JSON.stringify({email:$("email").value.trim().toLowerCase(),password:$("password").value})});
    if(d.user?.role!=="admin")throw new Error("This account does not have administrator access.");
    localStorage.setItem("token",d.token);localStorage.setItem("user",JSON.stringify(d.user));location.href="./admin.html";
   }catch(x){showMessage($("msg"),x.message,"error");btn.disabled=false}
  });return;
 }
 if(dashboard&&!requireAuth())return;
 if(dashboard&&currentUser()?.role!=="admin"){dashboard.innerHTML='<div class="admin-card error">Administrator access required.</div>';return}
 loadAdmin();
});
async function loadAdmin(){
 try{
  const [stats,events,free,support]=await Promise.all([api("/admin/stats"),api("/events"),api("/admin/free-ticket-options"),api("/admin/support")]);
  $("stats").innerHTML=Object.entries(stats.stats||{}).map(([k,v])=>`<div class="stat"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join("");
  $("eventList").innerHTML=(events.events||[]).map(e=>`<div class="admin-row"><b>${esc(e.title)}</b><br>${esc(e.date)} · ${esc(e.venue)}<br><span>${Number(e.availableSeats||0)} available</span></div>`).join("")||"<p>No events.</p>";
  $("freeTicket").innerHTML=(free.options||[]).map(x=>`<option value="${esc(x.id)}">${esc(x.label)}</option>`).join("")||"<option value=''>No available seats</option>";
  $("supportList").innerHTML=(support.messages||[]).map(x=>`<div class="admin-row"><b>${esc(x.subject)}</b><br>${esc(x.email)}<br>${esc(x.message)}<br><small>${esc(x.status||"open")}</small></div>`).join("")||"<p>No support messages.</p>";
 }catch(e){showMessage($("adminMsg"),e.message,"error")}
}
document.addEventListener("DOMContentLoaded",()=>{
 $("eventForm")?.addEventListener("submit",async e=>{e.preventDefault();const b=e.currentTarget.querySelector("button");b.disabled=true;
  try{await api("/admin/events",{method:"POST",body:JSON.stringify({title:$("title").value.trim(),artist:$("artist").value.trim(),venue:$("venue").value.trim(),city:$("city").value.trim(),country:$("country").value.trim(),date:$("date").value,time:$("time").value,currency:$("currency").value.trim().toUpperCase(),price:Number($("price").value),image:$("image").value.trim(),description:$("description").value.trim(),sections:$("sections").value.trim(),rows:Number($("rows").value),seatsPerRow:Number($("seatsPerRow").value)})});showMessage($("eventMsg"),"Event created successfully.","success");e.currentTarget.reset();$("currency").value="NGN";await loadAdmin()}catch(x){showMessage($("eventMsg"),x.message,"error")}finally{b.disabled=false}
 });
 $("freeForm")?.addEventListener("submit",async e=>{e.preventDefault();const b=e.currentTarget.querySelector("button");b.disabled=true;
  try{const d=await api("/admin/free-ticket",{method:"POST",body:JSON.stringify({userEmail:$("freeEmail").value.trim().toLowerCase(),ticketId:Number($("freeTicket").value)})});showMessage($("freeMsg"),d.message||"Free ticket issued.","success");await loadAdmin()}catch(x){showMessage($("freeMsg"),x.message,"error")}finally{b.disabled=false}
 });
});
