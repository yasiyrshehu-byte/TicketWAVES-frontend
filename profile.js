document.addEventListener("DOMContentLoaded",async()=>{
 const box=$("profile");if(!box||!requireAuth())return;
 try{const d=await api("/users/me"),u=d.user;box.innerHTML=`<h1>${esc((u.firstName||"")+" "+(u.lastName||""))}</h1>
 <div class="profile-grid"><div><small>Email</small><b>${esc(u.email)}</b></div><div><small>Phone</small><b>${esc(u.phone||"Not provided")}</b></div><div><small>Role</small><b>${esc(u.role||"user")}</b></div></div><br>
 <a class="button" href="./my-tickets.html">My tickets</a> <button class="button secondary" onclick="logout()">Sign out</button>`;
 }catch(e){box.innerHTML=`<p class="error">${esc(e.message)}</p>`}
});
