async function loadEvents(targetId="events",limit=0,q=""){
 const box=$(targetId); if(!box)return;
 try{
  const d=await api(q?"/events?q="+encodeURIComponent(q):"/events");let list=d.events||[];
  if(limit)list=list.slice(0,limit);
  if(!list.length){box.innerHTML='<div class="empty">No events found.</div>';return}
  box.innerHTML=list.map(e=>`<article class="event-card">
   <img src="${esc(e.image||"images/placeholder.svg")}" alt="${esc(e.title)}" onerror="this.src='images/placeholder.svg'">
   <div class="event-body"><span class="tag">${esc(e.category||"Event")}</span>
   <h3>${esc(e.title)}</h3><p>${esc(e.artist||"")}</p>
   <p>${esc(e.venue)} · ${esc(e.city)}</p><p><b>${esc(e.date)} · ${esc(e.time)}</b></p>
   <strong>${money(e.price,e.currency)}</strong><br><br>
   <a class="button" href="./event.html?id=${encodeURIComponent(e.id)}">View event</a></div></article>`).join("");
 }catch(e){box.innerHTML=`<div class="empty error">${esc(e.message)}</div>`}
}
document.addEventListener("DOMContentLoaded",()=>{
 const box=$("events"); if(!box)return;
 const q=new URLSearchParams(location.search).get("q")||"";
 const input=$("q");if(input)input.value=q;
 loadEvents("events",location.pathname.endsWith("index.html")||location.pathname==="/" ? 6 : 0,q);
});
