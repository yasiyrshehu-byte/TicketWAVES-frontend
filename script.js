(function(){
"use strict";
const KEY="ticketSiteStateV6";
const DEFAULT_IMG="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400&q=85";
const DEMO={
 id:"demo-1",
 eventName:"BTS WORLD TOUR 'ARIRANG' IN TORONTO",
 artistName:"BTS",
 venue:"Rogers Stadium",
 location:"Toronto, ON",
 date:"2026-08-23",
 time:"20:00",
 eventImage:DEFAULT_IMG,
 mapQuery:"Rogers Stadium Toronto",
 orderNumber:"301272737374747345",
 ticketType:"Mobile",
 extraInfo:"",
 tickets:[{id:"seat-1",section:"D2",row:"15",seat:"3",ticketType:"Mobile",barcode:"301272737374747345"}]
};
const countries=[["US","🇺🇸","United States"],["CA","🇨🇦","Canada"],["GB","🇬🇧","United Kingdom"],["AU","🇦🇺","Australia"],["NG","🇳🇬","Nigeria"],["BE","🇧🇪","Belgium"],["DE","🇩🇪","Germany"],["FR","🇫🇷","France"],["ES","🇪🇸","Spain"],["IE","🇮🇪","Ireland"],["ZA","🇿🇦","South Africa"],["AE","🇦🇪","United Arab Emirates"],["NL","🇳🇱","Netherlands"],["JP","🇯🇵","Japan"],["KR","🇰🇷","South Korea"]];
const defaults={tickets:[DEMO],transfers:[],sales:[],user:{firstName:"Regina",lastName:"",email:"",phone:"",country:"US"},country:"US"};
function deep(v){return JSON.parse(JSON.stringify(v))}
function uid(prefix){return prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9)}
function load(){
 try{
   const raw=JSON.parse(localStorage.getItem(KEY));
   if(raw&&typeof raw==="object"){
     return {...deep(defaults),...raw,
       tickets:Array.isArray(raw.tickets)?raw.tickets:deep(defaults.tickets),
       transfers:Array.isArray(raw.transfers)?raw.transfers:[],
       sales:Array.isArray(raw.sales)?raw.sales:[],
       user:{...deep(defaults.user),...(raw.user||{})}
     };
   }
 }catch(e){}
 return deep(defaults);
}
let state=load();
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function route(){return location.hash.replace(/^#/,"")||"/discover"}
function nav(to){location.hash=to}
function formatDate(s){
 if(!s)return "";
 const d=new Date(s+"T12:00:00");
 return isNaN(d.getTime())?esc(s):d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"}).toUpperCase();
}
function formatTime(s){
 if(!s)return "";
 const a=String(s).split(":"); if(a.length<2)return esc(s);
 let h=Number(a[0]); return (h%12||12)+":"+a[1]+" "+(h>=12?"PM":"AM");
}
function imageOrFallback(v){return v||DEFAULT_IMG}
function country(){return countries.find(x=>x[0]===state.country)||countries[0]}
function bottom(active){return `<nav class="bottomNav">
<button class="${active==="/discover"?"active":""}" onclick="go('/discover')"><span class="navIcon">⌕</span><span class="navText">Discover</span></button>
<button class="${active==="/favorites"?"active":""}" onclick="go('/favorites')"><span class="navIcon">♥</span><span class="navText">For You</span></button>
<button class="${active==="/my-tickets"?"active":""}" onclick="go('/my-tickets')"><span class="navIcon">◈</span><span class="navText">My Tickets</span></button>
<button class="${active==="/sell"?"active":""}" onclick="go('/sell')"><span class="navIcon">$</span><span class="navText">Sell</span></button>
<button class="${active==="/account"?"active":""}" onclick="go('/account')"><span class="navIcon">●</span><span class="navText">Account</span></button>
</nav>`}
function standardHeader(title,active){
 const c=country();
 return `<header class="darkHeader"><div class="headerBar">
<div class="headerSide"><button class="iconBtn" onclick="go('/discover')">‹</button></div>
<div class="brand"><img src="logo-t.png" alt=""><span>${esc(title)}</span></div>
<div class="headerSide right"><button class="iconBtn help" onclick="alert('Help')">?</button></div>
</div></header>`;
}
function countryModal(){
 const el=document.getElementById("modal"); if(!el)return;
 el.innerHTML=`<div class="sheet"><div class="formRow"><div class="formTitle">Change Location</div><button class="secondaryBtn" onclick="closeModal()">Close</button></div>
 ${countries.map(c=>`<div class="countryRow"><div><span style="font-size:26px">${c[1]}</span> <b>${esc(c[2])}</b></div><button class="secondaryBtn" onclick="chooseCountry('${c[0]}')">Select</button></div>`).join("")}</div>`;
 el.classList.add("show");
}
function closeModal(){const el=document.getElementById("modal");if(el)el.classList.remove("show")}
function chooseCountry(code){state.country=code;state.user.country=code;save();closeModal();render()}
function ensureModal(){
 let el=document.getElementById("modal");
 if(!el){el=document.createElement("div");el.id="modal";el.className="modal";el.addEventListener("click",e=>{if(e.target===el)closeModal()});document.body.appendChild(el)}
 return el;
}
function discover(){
 const content=`${standardHeader("Discover")}<div class="searchArea"><div class="searchBox"><input id="discoverQ" placeholder="Artist, Event or Venue" oninput="filterDiscover(this.value)"></div><div class="chips"><button class="chip">Concerts</button><button class="chip">Sports</button><button class="chip">Arts & Comedy</button></div></div>
 <main class="page discoverPage"><div class="hero"><img src="${DEFAULT_IMG}" alt=""></div><div class="sectionTitle">Discover</div><div id="discoverList" class="eventList">${discoverCards()}</div></main>${bottom("/discover")}`;
 document.getElementById("app").innerHTML=`<div class="app">${content}</div>`;
 ensureModal();
}
function discoverCards(){
 const items=[
  {title:"My Chemical Romance",cat:"Concerts",meta:"LIVE",img:"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80"},
  {title:"J. Cole",cat:"Hip-Hop/Rap",meta:"LIVE",img:"https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=1200&q=80"},
  {title:"World Events",cat:"Entertainment",meta:"LIVE",img:"https://images.unsplash.com/photo-1459749411177-047381bb3ece?w=1200&q=80"}
 ];
 return items.map(x=>`<article class="eventCard" data-search="${esc((x.title+" "+x.cat).toLowerCase())}"><img src="${x.img}" alt=""><div class="eventCardBody"><div class="kicker">${esc(x.meta)}</div><h3>${esc(x.title)}</h3><p>${esc(x.cat)}</p></div></article>`).join("");
}
function filterDiscover(v){const q=String(v||"").toLowerCase();document.querySelectorAll("#discoverList .eventCard").forEach(c=>c.style.display=(c.dataset.search||"").includes(q)?"block":"none")}
function myTickets(tab="upcoming"){
 const now=new Date();
 const upcoming=state.tickets.filter(t=>new Date((t.date||"9999-12-31")+"T23:59:59")>=now);
 const past=state.tickets.filter(t=>!upcoming.includes(t));
 const items=tab==="past"?past:upcoming;
 document.getElementById("app").innerHTML=`<div class="app ticketPage">${standardHeader("My Events")}<div class="tabHeader"><div class="tabs">
<button class="${tab==="upcoming"?"active":""}" onclick="myTickets('upcoming')">UPCOMING (${upcoming.length})</button>
<button class="${tab==="past"?"active":""}" onclick="myTickets('past')">PAST (${past.length})</button></div></div>
<main class="page">${items.length?items.map(myEvent).join(""):`<div class="emptyPage"><h2>No ${tab} events</h2><p class="muted">Tickets you add from For You appear here automatically.</p></div>`}</main>${bottom("/my-tickets")}</div>`;
}
function myEvent(g){
 const img=imageOrFallback(g.eventImage);
 return `<article class="myEventCard"><div class="eventHero"><img src="${esc(img)}" alt=""></div>
 <div class="eventInfoOverlay"><div class="eventDate">${formatDate(g.date)} • ${formatTime(g.time)} <span class="countBadge">▧ x${g.tickets.length}</span></div>
 <div class="eventName">${esc(g.eventName)}</div><div class="eventMeta">${esc(g.venue)} - ${esc(g.location)}</div></div>
 <button class="viewBtn" onclick="go('/ticket/${encodeURIComponent(g.id)}')">▦ View Tickets</button></article>`
}
function ticketDetail(id){
 const g=state.tickets.find(x=>x.id===decodeURIComponent(id));
 if(!g){nav("/my-tickets");return}
 const transfers=state.transfers.filter(x=>x.ticketId===g.id&&x.status==="pending");
 document.getElementById("app").innerHTML=`<div class="app ticketPage">${standardHeader("")}<main class="page">
 <article class="myEventCard">
 <div class="eventHero"><img src="${esc(imageOrFallback(g.eventImage))}" alt=""></div>
 <div class="eventInfoOverlay"><div class="eventDate">${formatDate(g.date)} • ${formatTime(g.time)} <span class="countBadge">▧ x${g.tickets.length}</span></div>
 <div class="eventName">${esc(g.eventName)}</div><div class="eventMeta">${esc(g.venue)} - ${esc(g.location)}</div></div>
 <button class="viewBtn" onclick="showBarcode('${encodeURIComponent(g.id)}')">▦ View Tickets</button>
 </article>
 <div class="orderBlock"><div class="orderRow"><div><div class="orderTitle">Order #${esc(g.orderNumber)}</div><div class="orderSub">x${g.tickets.length} Ticket${g.tickets.length===1?"":"s"}</div></div><button class="iconBtn more" onclick="alert('More options')">⋮</button></div>
 ${g.tickets.map((t,i)=>seatCard(g,t,i)).join("")}
 <div class="moreOptions">MORE OPTIONS</div>
 <div class="mapWrap"><iframe title="Venue map" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-79.42%2C43.63%2C-79.32%2C43.70&layer=mapnik&marker=43.8078%2C-79.3449"></iframe>
 <div class="mapPill"><button onclick="nav('/transfer/${encodeURIComponent(g.id)}')">↗ Transfer</button><button onclick="sellTicket('${encodeURIComponent(g.id)}')">⟳ Sell</button></div></div>
 </div></main>${bottom("/my-tickets")}</div>`;
 ensureModal();
}
function seatCard(g,t,i){
 const pending=state.transfers.find(x=>x.ticketId===g.id&&x.ticketIndex===i&&x.status==="pending");
 return `<div class="ticketCard"><div class="ticketHead">${esc(g.extraInfo||"TICKET")}</div><div class="ticketSeats">
 <div class="ticketSeat"><div class="ticketLabel">SECTION</div><div class="ticketValue">${esc(t.section||"—")}</div></div>
 <div class="ticketSeat"><div class="ticketLabel">ROW</div><div class="ticketValue">${esc(t.row||"—")}</div></div>
 <div class="ticketSeat"><div class="ticketLabel">SEAT</div><div class="ticketValue">${esc(t.seat||"—")}</div></div></div>
 ${pending?`<div class="transferPending"><div class="transferText"><span class="statusIcon">↗</span><span>Transfer Pending: ${esc(pending.firstName+" "+pending.lastName)}</span></div><button class="deleteBtn" onclick="cancelTransfer('${encodeURIComponent(g.id)}',${i})">♜</button></div>`:""}</div>`;
}
function showBarcode(id){
 const g=state.tickets.find(x=>x.id===decodeURIComponent(id));if(!g)return;
 const m=ensureModal();
 m.classList.add("barcodeModal");
 m.innerHTML=`<div class="sheet"><div class="formRow"><div class="formTitle">Tickets</div><button class="secondaryBtn" onclick="closeModal()">Done</button></div>
 ${g.tickets.map(t=>`<div class="barcode"><div class="ticketHead">TICKET</div><div class="barcodeBars"></div><div class="barcodeNumber">${esc(t.barcode||g.orderNumber||t.id)}</div></div>`).join("")}</div>`;
 m.classList.add("show");
}
function addTicket(){document.getElementById("app").innerHTML=`<div class="app"><div class="formPage">${ticketForm()}</div></div>`}
function editTicket(id){const g=state.tickets.find(x=>x.id===decodeURIComponent(id));if(g)document.getElementById("app").innerHTML=`<div class="app"><div class="formPage">${ticketForm(g)}</div></div>`}
function ticketForm(g){
 const x=g||{id:"",eventName:"",artistName:"",venue:"",location:"",date:"",time:"20:00",eventImage:"",mapQuery:"",orderNumber:"",extraInfo:"",tickets:[{section:"",row:"",seat:"",ticketType:"Mobile",barcode:""}]};
 const ts=Array.isArray(x.tickets)&&x.tickets.length?x.tickets:[{section:"",row:"",seat:"",ticketType:"Mobile",barcode:""}];
 return `<div class="formRow"><button class="secondaryBtn" onclick="go('/favorites')">← Back</button><div class="formTitle">${x.id?"Edit":"Add"} Ticket</div><span></span></div>
 <form onsubmit="saveTicket(event)">
 <input type="hidden" id="editId" value="${esc(x.id)}">
 <label class="label">Event Name*</label><input class="input" id="fEvent" required value="${esc(x.eventName)}">
 <label class="label">Artist / Performer</label><input class="input" id="fArtist" value="${esc(x.artistName)}">
 <label class="label">Venue*</label><input class="input" id="fVenue" required value="${esc(x.venue)}">
 <label class="label">Location*</label><input class="input" id="fLocation" required value="${esc(x.location)}">
 <label class="label">Date*</label><input class="input" id="fDate" type="date" required value="${esc(x.date)}">
 <label class="label">Time</label><input class="input" id="fTime" type="time" value="${esc(x.time||"20:00")}">
 <label class="label">Order Number</label><input class="input" id="fOrder" value="${esc(x.orderNumber)}">
 <label class="label">Ticket header / extra info</label><input class="input" id="fExtra" value="${esc(x.extraInfo||"")}">
 <label class="label">Event image</label>
 <div class="imageUpload"><input class="input" id="fImageFile" type="file" accept="image/*" onchange="previewImage(this)">
 <input class="input" id="fImageUrl" type="url" placeholder="Or paste image URL" value="${esc(x.eventImage&&x.eventImage.startsWith("data:")?"":x.eventImage||"")}">
 <img id="imagePreview" class="previewImg" ${x.eventImage?`src="${esc(x.eventImage)}"`:"style=\"display:none\""} alt=""></div>
 <label class="label">Map search</label><input class="input" id="fMap" value="${esc(x.mapQuery||x.location||x.venue||"")}">
 <div class="formRow" style="margin-top:22px"><div class="formTitle">Tickets / Seats</div><button type="button" class="secondaryBtn" onclick="addSeatEditor()">+ Add seat</button></div>
 <div id="seatEditors">${ts.map((t,i)=>seatEditor(t,i)).join("")}</div>
 <button class="primaryBtn full" type="submit">Save Ticket</button>
 ${x.id?`<button class="secondaryBtn full" type="button" style="margin-top:10px;color:#c62828" onclick="deleteTicket('${encodeURIComponent(x.id)}')">Delete Ticket</button>`:""}
 </form>`;
}
function seatEditor(t,i){
 return `<div class="ticketRowEditor" data-index="${i}">
 <div class="ticketRowTop"><span>Seat ${i+1}</span>${i>0?`<button type="button" class="smallDanger" onclick="this.closest('.ticketRowEditor').remove()">Remove</button>`:""}</div>
 <div class="rowGrid"><div><label class="label">Section</label><input class="input seatSection" value="${esc(t.section||"")}"></div>
 <div><label class="label">Row</label><input class="input seatRow" value="${esc(t.row||"")}"></div>
 <div><label class="label">Seat</label><input class="input seatSeat" value="${esc(t.seat||"")}"></div></div>
 <label class="label">Barcode / Ticket number</label><input class="input seatBarcode" value="${esc(t.barcode||"")}">
 <input type="hidden" class="seatId" value="${esc(t.id||uid("seat"))}">
 </div>`;
}
function addSeatEditor(){const box=document.getElementById("seatEditors");if(!box)return;box.insertAdjacentHTML("beforeend",seatEditor({section:"",row:"",seat:"",barcode:""},box.children.length))}
function previewImage(input){
 const f=input.files&&input.files[0]; if(!f)return;
 const reader=new FileReader();
 reader.onload=e=>{const p=document.getElementById("imagePreview");if(p){p.src=e.target.result;p.style.display="block";}};
 reader.readAsDataURL(f);
}
function val(id){const e=document.getElementById(id);return e?e.value.trim():""}
function saveTicket(ev){
 ev.preventDefault();
 const id=val("editId"),existing=state.tickets.find(x=>x.id===id);
 let image=val("fImageUrl");
 const preview=document.getElementById("imagePreview"); if(preview&&preview.src&&preview.src.startsWith("data:"))image=preview.src;
 if(!image)image=existing&&existing.eventImage?existing.eventImage:DEFAULT_IMG;
 const tickets=[...document.querySelectorAll("#seatEditors .ticketRowEditor")].map((el,i)=>({
   id:el.querySelector(".seatId")?.value||uid("seat"),
   section:el.querySelector(".seatSection")?.value.trim()||"",
   row:el.querySelector(".seatRow")?.value.trim()||"",
   seat:el.querySelector(".seatSeat")?.value.trim()||"",
   barcode:el.querySelector(".seatBarcode")?.value.trim()||"",
   ticketType:"Mobile"
 })).filter(t=>t.section||t.row||t.seat||t.barcode);
 if(!tickets.length){tickets.push({id:uid("seat"),section:"",row:"",seat:"",barcode:"",ticketType:"Mobile"})}
 const g={id:id||uid("ticket"),eventName:val("fEvent"),artistName:val("fArtist"),venue:val("fVenue"),location:val("fLocation"),date:val("fDate"),time:val("fTime")||"20:00",orderNumber:val("fOrder")||uid("order").replace(/-/g,""),extraInfo:val("fExtra"),eventImage:image,mapQuery:val("fMap")||val("fLocation"),tickets};
 if(existing)state.tickets=state.tickets.map(x=>x.id===id?g:x);else state.tickets.unshift(g);
 save();nav("/my-tickets");
}
function deleteTicket(id){
 const d=decodeURIComponent(id);if(!confirm("Delete this ticket?"))return;
 state.tickets=state.tickets.filter(x=>x.id!==d);state.transfers=state.transfers.filter(x=>x.ticketId!==d);state.sales=state.sales.filter(x=>x.ticketId!==d);save();nav("/my-tickets");
}
function transfer(id){
 const g=state.tickets.find(x=>x.id===decodeURIComponent(id));if(!g)return;
 document.getElementById("app").innerHTML=`<div class="app"><div class="formPage"><div class="formRow"><button class="secondaryBtn" onclick="go('/ticket/${encodeURIComponent(g.id)}')">← Back</button><div class="formTitle">TRANSFER TICKETS</div><span></span></div>
 <p><b>${g.tickets.length}</b> ticket${g.tickets.length===1?"":"s"} selected. You can transfer an individual seat.</p>
 <label class="label">Ticket</label><select class="select" id="transferIndex">${g.tickets.map((t,i)=>`<option value="${i}">Seat ${i+1}: Section ${esc(t.section)} • Row ${esc(t.row)} • Seat ${esc(t.seat)}</option>`).join("")}</select>
 <label class="label">First Name*</label><input class="input" id="tf" required>
 <label class="label">Last Name*</label><input class="input" id="tl" required>
 <label class="label">Email*</label><input class="input" id="te" type="email" required>
 <label class="label">Phone</label><input class="input" id="tp" type="tel">
 <label class="label">Note</label><textarea class="textarea" id="tn" rows="4"></textarea>
 <button class="primaryBtn full" onclick="submitTransfer('${encodeURIComponent(g.id)}')">Forward Ticket</button></div></div>`;
}
function submitTransfer(id){
 const d=decodeURIComponent(id),g=state.tickets.find(x=>x.id===d);if(!g)return;
 const idx=Number(document.getElementById("transferIndex").value)||0;
 const f=val("tf"),l=val("tl"),e=val("te"),p=val("tp"),n=val("tn");
 if(!f||!l||!e){alert("Please complete the required fields.");return}
 state.transfers=state.transfers.filter(x=>!(x.ticketId===d&&x.ticketIndex===idx&&x.status==="pending"));
 state.transfers.push({id:uid("transfer"),ticketId:d,ticketIndex:idx,firstName:f,lastName:l,email:e,phone:p,note:n,status:"pending"});
 save();nav("/ticket/"+encodeURIComponent(d));
}
function cancelTransfer(id,index){const d=decodeURIComponent(id);state.transfers=state.transfers.filter(x=>!(x.ticketId===d&&x.ticketIndex===index));save();nav("/ticket/"+encodeURIComponent(d))}
function sellTicket(id){const d=decodeURIComponent(id);const g=state.tickets.find(x=>x.id===d);if(!g)return;state.sales.push({id:uid("sale"),ticketId:d,status:"listed",createdAt:new Date().toISOString()});save();alert("Ticket listed for sale");}
function sell(){
 document.getElementById("app").innerHTML=`<div class="app">${standardHeader("Sell")}<main class="page foryouHero"><div class="infoCard"><h2>Sell your tickets</h2><p class="muted">Choose a ticket from your events and list it for sale.</p></div>${state.tickets.map(g=>`<div class="infoCard"><b>${esc(g.eventName)}</b><p class="muted">${formatDate(g.date)} • ${esc(g.venue)}</p><button class="primaryBtn" onclick="sellTicket('${encodeURIComponent(g.id)}')">List Ticket</button></div>`).join("")}</main>${bottom("/sell")}</div>`;
}
function favorites(){
 document.getElementById("app").innerHTML=`<div class="app">${standardHeader("For You")}<main class="foryouHero"><div class="infoCard"><h2>For You</h2><p class="muted">Add and manage your ticket details here. Saved tickets automatically appear in My Tickets.</p><button class="primaryBtn full" onclick="addTicket()">+ Add Ticket</button></div>
 ${state.tickets.map(g=>`<div class="infoCard"><b>${esc(g.eventName)}</b><p class="muted">${formatDate(g.date)} • ${esc(g.venue)} • ${g.tickets.length} ticket${g.tickets.length===1?"":"s"}</p><div class="desktopActions"><button class="secondaryBtn" onclick="editTicket('${encodeURIComponent(g.id)}')">Edit</button><button class="secondaryBtn" onclick="go('/ticket/${encodeURIComponent(g.id)}')">View</button></div></div>`).join("")}</main>${bottom("/favorites")}</div>`;
}
function account(){
 const c=country();
 document.getElementById("app").innerHTML=`<div class="app">${standardHeader("Account")}<main class="foryouHero"><div class="infoCard"><h2>${esc(state.user.firstName)} ${esc(state.user.lastName)}</h2><p class="muted">${esc(state.user.email||"")}</p></div><div class="infoCard"><div class="formRow"><b>Country</b><button class="secondaryBtn" onclick="countryModal()">${c[1]} ${esc(c[2])}</button></div><div class="formRow"><b>Profile</b><button class="secondaryBtn" onclick="editProfile()">Edit</button></div></div></main>${bottom("/account")}</div>`;
 ensureModal();
}
function editProfile(){const n=prompt("First name",state.user.firstName||"");if(n!==null){state.user.firstName=n.trim()||state.user.firstName;save();render()}}
function render(){
 try{
  const r=route();
  if(r==="/discover")discover();
  else if(r==="/favorites")favorites();
  else if(r==="/my-tickets")myTickets();
  else if(r==="/sell")sell();
  else if(r==="/account")account();
  else if(r.startsWith("/ticket/"))ticketDetail(r.slice(8));
  else if(r.startsWith("/transfer/"))transfer(r.slice(10));
  else discover();
 }catch(e){
  console.error(e);
  document.getElementById("app").innerHTML=`<div class="errorPage"><h2>App error</h2><p>${esc(e&&e.message?e.message:"Please refresh the page.")}</p><button class="primaryBtn" onclick="location.reload()">Refresh</button></div>`;
 }
}
window.go=nav;window.closeModal=closeModal;window.countryModal=countryModal;window.chooseCountry=chooseCountry;window.filterDiscover=filterDiscover;window.myTickets=myTickets;window.addTicket=addTicket;window.editTicket=editTicket;window.saveTicket=saveTicket;window.deleteTicket=deleteTicket;window.previewImage=previewImage;window.addSeatEditor=addSeatEditor;window.transfer=transfer;window.submitTransfer=submitTransfer;window.cancelTransfer=cancelTransfer;window.sellTicket=sellTicket;window.showBarcode=showBarcode;window.editProfile=editProfile;
window.addEventListener("hashchange",render);
ensureModal();render();
})();