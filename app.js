function setNav(){
  const current=location.pathname.split("/").pop()||"index.html";
  document.querySelectorAll("[data-nav]").forEach(a=>{if(a.getAttribute("href")?.endsWith(current))a.classList.add("active")});
  document.querySelectorAll("[data-logout]").forEach(b=>b.onclick=()=>{localStorage.removeItem("tw_token");location.href="/index.html"});
}
function eventCard(e){
 const img=imageUrl(e.imageId);
 return `<a class="card" href="/pages/event.html?id=${e._id}">${img?`<img class="eventimg" src="${img}" alt="">`:`<div class="eventimg"></div>`}<div class="cardbody"><span class="tag">${e.category||"Event"}</span><div class="eventtitle">${escapeHtml(e.title)}</div><div class="meta"><span>📅 ${new Date(e.date).toLocaleDateString()}</span><span>📍 ${escapeHtml(e.venue)} · ${escapeHtml(e.city||"")}</span><span>🎟 ${e.availableTickets||0} tickets available</span></div><div class="price">From ${formatMoney(e.minPrice||0,e.currency||"NGN")}</div></div></a>`;
}
function formatMoney(n,c="NGN"){try{return new Intl.NumberFormat("en-NG",{style:"currency",currency:c,maximumFractionDigits:0}).format(n)}catch{return `${c} ${n}`}}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function loadEvents(container,q=""){container.innerHTML=`<div class="empty">Loading events…</div>`;try{const d=await TW.request("/events"+(q?`?q=${encodeURIComponent(q)}`:""));container.innerHTML=d.events.length?d.events.map(eventCard).join(""):`<div class="empty">No events yet.</div>`}catch(e){container.innerHTML=`<div class="empty">${escapeHtml(e.message)}</div>`}}
document.addEventListener("DOMContentLoaded",setNav);
