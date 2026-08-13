document.addEventListener("DOMContentLoaded",async()=>{
 const box=$("event"),id=new URLSearchParams(location.search).get("id");
 if(!box||!id){if(box)box.innerHTML='<div class="empty error">Event not found.</div>';return}
 try{
  const d=await api("/events/"+encodeURIComponent(id)),e=d.event;
  box.classList.remove("loading");
  box.innerHTML=`<img src="${esc(e.image||"images/placeholder.svg")}" alt="${esc(e.title)}" onerror="this.src='images/placeholder.svg'">
  <div><span class="tag">${esc(e.category||"Event")}</span><h1>${esc(e.title)}</h1><h2>${esc(e.artist||"")}</h2>
  <p>${esc(e.description||"")}</p><p><b>${esc(e.venue)}</b><br>${esc(e.city)}, ${esc(e.country)}<br>${esc(e.date)} · ${esc(e.time)}</p>
  <h2>${money(e.price,e.currency)}</h2><p>${Number(e.availableSeats||0)} seats available</p>
  <a class="button" href="./checkout.html?event=${encodeURIComponent(e.id)}">Choose section, row & seat</a></div>`;
 }catch(e){box.innerHTML=`<div class="empty error">${esc(e.message)}</div>`}
});
