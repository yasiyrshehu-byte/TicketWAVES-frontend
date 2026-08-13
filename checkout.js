let eventData=null,selected=[];
const seatsBox=$("seats"),summary=$("summary"),pay=$("pay"),msg=$("msg"),currencySelect=$("currency");
function renderSummary(){
 if(!eventData)return;
 const total=selected.length*Number(eventData.price||0);
 summary.innerHTML=`<div class="summary-row"><span>Seats</span><b>${selected.length}</b></div>
 <div class="summary-row"><span>Price</span><b>${money(eventData.price,eventData.currency)}</b></div>
 <div class="summary-row"><span>Total</span><b>${money(total,eventData.currency)}</b></div>`;
}
function supportedCurrencies(e){
 const raw=e.supportedCurrencies||e.currencies;
 if(Array.isArray(raw)&&raw.length)return raw.map(String).map(x=>x.toUpperCase());
 return [String(e.currency||"NGN").toUpperCase()];
}
document.addEventListener("DOMContentLoaded",async()=>{
 if(!requireAuth())return;
 const id=new URLSearchParams(location.search).get("event");
 if(!id){showMessage(msg,"No event selected.","error");return}
 try{
  const d=await api("/events/"+encodeURIComponent(id));eventData=d.event;
  $("eventInfo").classList.remove("loading");
  $("eventInfo").innerHTML=`<h2>${esc(eventData.title)}</h2><p>${esc(eventData.date)} · ${esc(eventData.time)}</p><p>${esc(eventData.venue)}, ${esc(eventData.city)}</p>`;
  const currencies=supportedCurrencies(eventData);
  if(currencySelect){currencySelect.innerHTML=currencies.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");currencySelect.value=currencies[0]}
  const s=await api("/events/"+encodeURIComponent(id)+"/seats");const seats=s.seats||[];
  if(!seats.length){seatsBox.innerHTML='<div class="empty">No seats are currently available.</div>';pay.disabled=true;return}
  const groups={};seats.forEach(x=>(groups[x.section]??=[]).push(x));
  seatsBox.innerHTML=Object.entries(groups).map(([section,arr])=>`<div class="seat-section"><h3>Section ${esc(section)}</h3><div class="seat-grid">${arr.map(x=>`<button type="button" class="seat" data-id="${x.id}" data-section="${esc(x.section)}" data-row="${esc(x.row)}" data-seat="${esc(x.seat)}">${esc(x.row)}-${esc(x.seat)}</button>`).join("")}</div></div>`).join("");
  seatsBox.querySelectorAll(".seat").forEach(b=>b.addEventListener("click",()=>{
    const id=Number(b.dataset.id),idx=selected.indexOf(id);
    if(idx>=0){selected.splice(idx,1);b.classList.remove("selected")}else{selected.push(id);b.classList.add("selected")}
    renderSummary();
  }));
  renderSummary();
 }catch(e){$("eventInfo").innerHTML=`<span class="error">${esc(e.message)}</span>`;pay.disabled=true}
});
pay?.addEventListener("click",async()=>{
 if(!selected.length){showMessage(msg,"Select at least one seat.","error");return}
 pay.disabled=true;pay.textContent="Opening secure payment…";
 try{
  const currency=currencySelect?.value||eventData.currency;
  const d=await api("/payment/initialize",{method:"POST",body:JSON.stringify({eventId:eventData.id,seatIds:selected,currency})});
  if(!d.authorization_url)throw new Error("Payment gateway did not return a checkout URL.");
  location.href=d.authorization_url;
 }catch(e){showMessage(msg,e.message,"error");pay.disabled=false;pay.textContent="Pay securely"}
});
