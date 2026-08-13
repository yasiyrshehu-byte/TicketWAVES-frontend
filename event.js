document.addEventListener("DOMContentLoaded", async () => {
  const box = $("event");
  const id = new URLSearchParams(location.search).get("id");
  if (!box || !id) { if (box) box.innerHTML='<div class="empty error">Event not found.</div>'; return; }
  try {
    const d=await api("/events/"+encodeURIComponent(id));
    const e=d.event||d.data||d; box.classList.remove("loading");
    let seats=[];
    try { const s=await api("/events/"+encodeURIComponent(id)+"/seats"); seats=s.seats||s.data||[]; } catch(err){ console.warn("Seat map unavailable",err); }
    const groups={};
    seats.filter(x=>String(x.status||"Available").toLowerCase()!=="sold").forEach(x=>{const sec=String(x.section||"General Admission");(groups[sec] ||= []).push(x);});
    const sectionCards=Object.entries(groups).map(([section,arr])=>{
      const prices=arr.map(x=>Number(x.price??e.price??0)).filter(Number.isFinite);const min=prices.length?Math.min(...prices):Number(e.price||0);const max=prices.length?Math.max(...prices):min;const currency=arr.find(x=>x.currency)?.currency||e.currency||"NGN";
      const priceText=min===max?money(min,currency):`${money(min,currency)} – ${money(max,currency)}`;
      const rows=[...new Set(arr.map(x=>String(x.row||"—")))].length;
      return `<article class="section-choice"><div><span class="tag">Section ${esc(section)}</span><h3>Section ${esc(section)}</h3><p class="muted">${arr.length} available seats · ${rows} rows</p></div><div class="section-choice-price"><b>${priceText}</b><a class="button" href="./checkout.html?event=${encodeURIComponent(e.id)}&section=${encodeURIComponent(section)}">Choose section</a></div></article>`;
    }).join("");
    const map=e.seatMapImage||e.venueSeatMapImage||e.venue?.seatMapImage||e.seatMap?.image||"";
    const mapHtml=map?`<div class="venue-map-card"><div class="section-title"><h2>Venue seat map</h2><span class="muted">Use this map to choose your section.</span></div><img class="venue-map" src="${esc(map)}" alt="${esc(e.venue||"Venue")} seat map" onerror="this.closest('.venue-map-card').remove()"></div>`:"";
    box.innerHTML=`<div><img src="${esc(e.image||"images/placeholder.svg")}" alt="${esc(e.title||"Event")}" onerror="this.src='images/placeholder.svg'"></div><div><span class="tag">${esc(e.category||"Event")}</span><h1>${esc(e.title||"Event")}</h1>${e.artist?`<h2>${esc(e.artist)}</h2>`:""}<div class="event-meta-card"><p><strong>📅 ${esc(e.date||"Date TBA")}</strong><br>${esc(e.time||"Time TBA")}</p><p><strong>📍 ${esc(e.venue||"Venue TBA")}</strong><br>${esc(e.city||"")}${e.country?`, ${esc(e.country)}`:""}</p></div>${e.description?`<p>${esc(e.description)}</p>`:""}<h2>Choose your section</h2><p class="muted">Sections and rows come from the venue's saved seat map. Prices are shown before you pay.</p><div class="section-choices">${sectionCards||'<div class="empty">No available sections right now.</div>'}</div></div>${mapHtml}`;
  } catch(e){box.innerHTML=`<div class="empty error">${esc(e.message)}</div>`;}
});
