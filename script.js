(function(){
"use strict";
const KEY="ticketwaves_final_v12";
const FALLBACK="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400&q=90";
const OLD=["ticketwaves_state_v10","ticketwaves_state_v9","ticketwaves_state_v8"];
const countries=[["US","🇺🇸","United States"],["NG","🇳🇬","Nigeria"],["CA","🇨🇦","Canada"],["GB","🇬🇧","United Kingdom"],["AU","🇦🇺","Australia"],["DE","🇩🇪","Germany"],["FR","🇫🇷","France"],["ES","🇪🇸","Spain"],["BE","🇧🇪","Belgium"],["NL","🇳🇱","Netherlands"],["IE","🇮🇪","Ireland"],["ZA","🇿🇦","South Africa"],["AE","🇦🇪","United Arab Emirates"],["JP","🇯🇵","Japan"],["KR","🇰🇷","South Korea"],["MX","🇲🇽","Mexico"]];
const demo={id:"demo",eventName:"Your Event",artistName:"Artist / Performer",venue:"Your Venue",location:"City, Country",date:"2026-12-12",time:"20:00",image:FALLBACK,mapQuery:"Your Venue, City, Country",order:"ORDER-000001",extraInfo:"Mobile Ticket",tickets:[{id:"s1",section:"A1",row:"1",seat:"1",barcode:"000000000001"}]};
const defaults={country:"US",events:[demo],transfers:[],profile:{firstName:"",lastName:"",email:""}};
function clone(v){return JSON.parse(JSON.stringify(v))}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])).replace(/\'/g,"&#39;")}
function uid(p){return p+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}
function el(id){return document.getElementById(id)}
function q(s){return document.querySelector(s)}
function qa(s){return [...document.querySelectorAll(s)]}
function normalize(v){
  let events=v.events||v.tickets;
  if(!Array.isArray(events)||!events.length)events=clone(defaults.events);
  events=events.map(t=>({id:t.id||uid("event"),eventName:t.eventName||"Your Event",artistName:t.artistName||"",venue:t.venue||"Your Venue",location:t.location||"",date:t.date||"",time:t.time||"",image:t.image||t.eventImage||FALLBACK,mapQuery:t.mapQuery||t.venue||"",order:t.order||t.orderNumber||"ORDER-000001",extraInfo:t.extraInfo||"Mobile Ticket",tickets:Array.isArray(t.tickets)?t.tickets.map(s=>({id:s.id||uid("seat"),section:s.section||"",row:s.row||"",seat:s.seat||"",barcode:s.barcode||uid("code")})):[]}));
  return {country:v.country||"US",events,transfers:Array.isArray(v.transfers)?v.transfers:[],profile:Object.assign({},defaults.profile,v.profile||v.user||{})};
}
function load(){
  for(const k of [KEY,...OLD]){try{const v=JSON.parse(localStorage.getItem(k)||"");if(v)return normalize(v)}catch(e){}}
  return clone(defaults)
}
let state=load();
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function route(){return location.hash.replace(/^#/,"")||"/my-tickets"}
function go(r){location.hash=r}
function country(){return countries.find(c=>c[0]===state.country)||countries[0]}
function dateText(d,t){
 if(!d)return "";
 const x=new Date(d+"T12:00:00");if(Number.isNaN(x.getTime()))return d;
 const wd=x.toLocaleDateString(undefined,{weekday:"short"}).toUpperCase(),mo=x.toLocaleDateString(undefined,{month:"short"}).toUpperCase();
 let s=wd+" • "+mo+" "+x.getDate()+", "+x.getFullYear();
 if(t){let [hh,mm]=String(t).split(":");let h=Number(hh);s+=" • "+(h%12||12)+":"+(mm||"00")+(h>=12?" PM":" AM")}
 return s
}
function nav(active){
 const a=[["/discover","⌕","Discover"],["/for-you","♥","For You"],["/my-tickets","◇","My Tickets"],["/sell","$","Sell"],["/account","●","Account"]];
 return '<nav class="bottom-nav">'+a.map(x=>'<button class="nav-item '+(x[0]===active?"active":"")+'" onclick="go(\''+x[0]+'\')"><span class="nav-icon">'+x[1]+'</span><span class="nav-label">'+x[2]+'</span></button>').join("")+"</nav>"
}
function header(title,back,flag){
 return '<header class="header"><div class="header-side">'+(back?'<button class="back" onclick="history.back()">‹</button>':"")+'</div><div class="title">'+esc(title)+(flag?'<span class="country-dot" onclick="countrySheet()">'+country()[1]+'</span>':"")+'</div><div class="header-side right"><button class="help" onclick="help()">Help</button></div></header>'
}
function render(body,active){el("app").innerHTML='<div class="app"><div class="shell">'+body+'</div>'+nav(active)+'</div>'}
function help(){alert("Use For You to add or edit your event and ticket information.")}
function toast(s){const x=document.createElement("div");x.className="toast";x.textContent=s;document.body.appendChild(x);setTimeout(()=>x.remove(),1900)}
function eventCard(g){
 return '<article class="event-card"><img src="'+esc(g.image||FALLBACK)+'" alt=""><div class="event-copy"><div class="event-date">'+esc(dateText(g.date,g.time))+'</div><div class="event-title">'+esc(g.eventName)+'</div><div class="event-venue">'+esc(g.venue)+(g.location?" - "+esc(g.location):"")+'</div></div><div class="event-count">▣ x'+g.tickets.length+'</div><button class="event-btn" onclick="go(\'/event/'+encodeURIComponent(g.id)+'\')"><span class="scan">▥</span>View Tickets</button></article>'
}
function myTickets(past=false){
 const up=state.events.filter(g=>new Date((g.date||"9999-12-31")+"T23:59:59")>=new Date()),pa=state.events.filter(g=>!up.includes(g)),items=past?pa:up;
 render(header("My Events",false,true)+'<div class="subtabs"><button class="'+(!past?"active":"")+'" onclick="myTickets(false)">UPCOMING ('+up.length+')</button><button class="'+(past?"active":"")+'" onclick="myTickets(true)">PAST ('+pa.length+')</button></div><div class="events">'+(items.length?items.map(eventCard).join(""):'<div class="empty"><h2>No events</h2><p>Add one in For You.</p></div>')+'</div>',"/my-tickets")
}
function ticketCard(g,t,i){
 const p=state.transfers.find(x=>x.eventId===g.id&&x.index===i&&x.status==="pending");
 return '<div class="ticket-card"><div class="ticket-label">'+esc(g.extraInfo||"TICKET")+'</div><div class="ticket-grid"><div><div class="lab">SECTION</div><div class="val">'+esc(t.section||"—")+'</div></div><div><div class="lab">ROW</div><div class="val">'+esc(t.row||"—")+'</div></div><div><div class="lab">SEAT</div><div class="val">'+esc(t.seat||"—")+'</div></div></div>'+(p?'<div class="transfer-pending"><span>Transfer Pending: '+esc(p.first+" "+p.last)+'</span><button onclick="cancelTransfer(\''+encodeURIComponent(g.id)+'\','+i+')">Cancel</button></div>':"")+'</div>'
}
function eventPage(id){
 const g=state.events.find(x=>x.id===decodeURIComponent(id));if(!g){go("/my-tickets");return}
 const detail='<section id="ticketsView"><div class="order"><div class="order-head"><div><div class="order-title">Order #'+esc(g.order)+'</div><div class="order-sub">x'+g.tickets.length+' Ticket'+(g.tickets.length===1?"":"s")+'</div></div><button class="dots" onclick="eventMenu(\''+encodeURIComponent(g.id)+'\')">⋮</button></div>'+g.tickets.map((t,i)=>ticketCard(g,t,i)).join("")+'<div class="more">MORE OPTIONS</div><div class="map-wrap"><iframe loading="lazy" title="Venue map" src="https://www.openstreetmap.org/export/embed.html?bbox=-79.43%2C43.63%2C-79.32%2C43.72&layer=mapnik"></iframe><div class="map-actions"><button onclick="toast(\'Upgrade options\')"><span class="mi">↥</span>Upgrade</button><button onclick="transfer(\''+encodeURIComponent(g.id)+'\')"><span class="mi">↗</span>Transfer</button><button onclick="sell(\''+encodeURIComponent(g.id)+'\')"><span class="mi">⟳</span>Sell</button></div></div><a class="directions" target="_blank" rel="noopener" href="https://www.openstreetmap.org/search?query='+encodeURIComponent(g.mapQuery||g.venue+" "+g.location)+'">Get Directions</a></div></section>';
 const extras='<section id="extrasView" class="extras" style="display:none"><h2>EXTRAS</h2><div class="got"><div class="got-visual"><img src="'+esc(g.image||FALLBACK)+'" alt=""><div class="got-word">YOU GOT<br>TICKETS!</div></div><div class="share"><h3>Post on Social Media</h3><p>Build hype for the event, and share that you got tickets with your friends and family.</p><button onclick="share(\''+encodeURIComponent(g.id)+'\')">Share You’re Going ↗</button></div></div></section>';
 render(header("",true)+'<main><section class="page-hero"><img src="'+esc(g.image||FALLBACK)+'" alt=""><div class="shade"></div><div class="hero-copy"><div class="hero-date">'+esc(dateText(g.date,g.time))+'</div><div class="hero-name">'+esc(g.eventName)+'</div><div class="hero-venue">'+esc(g.venue)+(g.location?" - "+esc(g.location):"")+'</div></div><div class="hero-count">▣ x'+g.tickets.length+'</div></section><button class="view-ticket-large" onclick="viewTickets(\''+encodeURIComponent(g.id)+'\')">▥ View Tickets</button><div class="tabbar"><button id="ticketsTab" class="active" onclick="tab(\'tickets\')">Tickets</button><button id="extrasTab" onclick="tab(\'extras\')">Extras</button></div>'+detail+extras+'</main>',"/my-tickets")
}
function tab(which){
 const t=el("ticketsView"),x=el("extrasView"),a=el("ticketsTab"),b=el("extrasTab");
 if(which==="extras"){t.style.display="none";x.style.display="block";a.classList.remove("active");b.classList.add("active")}
 else{x.style.display="none";t.style.display="block";b.classList.remove("active");a.classList.add("active")}
}
function viewTickets(id){
 const g=state.events.find(x=>x.id===decodeURIComponent(id));if(!g)return;
 el("modal").innerHTML='<div class="sheet"><div class="handle"></div><div class="sheet-head"><span>'+g.tickets.length+' Ticket'+(g.tickets.length===1?"":"s")+'</span><button class="close" onclick="closeModal()">Done</button></div><div class="entry-list">'+g.tickets.map(t=>'<div class="entry"><div class="entry-blue"><div class="entry-name">'+esc(g.eventName)+'</div><div class="entry-grid"><div><span>SEC</span><b>'+esc(t.section||"—")+'</b></div><div><span>ROW</span><b>'+esc(t.row||"—")+'</b></div><div><span>SEAT</span><b>'+esc(t.seat||"—")+'</b></div></div><div class="entry-venue">'+esc(g.venue)+'</div></div><div class="barcode"></div><div class="barcode-number">'+esc(t.barcode||g.order)+'</div><button class="wallet" onclick="toast(\'Wallet action ready\')">Add to Wallet</button><div class="entry-note">Entry code is shown only in View Tickets.</div></div>').join("")+'</div></div>';
 showModal()
}
function transfer(id){
 const g=state.events.find(x=>x.id===decodeURIComponent(id));if(!g)return;
 el("modal").innerHTML='<div class="sheet"><div class="handle"></div><div class="sheet-head"><span>TRANSFER TICKETS</span><button class="close" onclick="closeModal()">Done</button></div><div class="sheet-body"><div class="field"><label>SELECT TICKET</label><select class="select" id="trIdx">'+g.tickets.map((t,i)=>'<option value="'+i+'">Ticket '+(i+1)+' — Section '+esc(t.section||"—")+' / Row '+esc(t.row||"—")+' / Seat '+esc(t.seat||"—")+'</option>').join("")+'</select></div><div class="field"><label>FIRST NAME*</label><input id="trFirst" class="input" placeholder="Enter First Name"></div><div class="field"><label>LAST NAME*</label><input id="trLast" class="input" placeholder="Enter Last Name"></div><div class="field"><label>EMAIL*</label><input id="trEmail" class="input" type="email" placeholder="Enter Email Address"></div><div class="field"><label>NOTE</label><textarea id="trNote" class="textarea" placeholder="Add a note"></textarea></div></div><div class="transfer-actions"><button class="back-btn" onclick="closeModal()">Back</button><button id="forward" class="forward" onclick="submitTransfer(\''+encodeURIComponent(g.id)+'\')">Forward Ticket</button></div></div>';
 showModal();["trFirst","trLast","trEmail"].forEach(i=>el(i).addEventListener("input",ready));ready()
}
function ready(){el("forward")?.classList.toggle("ready",!!(el("trFirst")?.value.trim()&&el("trLast")?.value.trim()&&el("trEmail")?.value.trim()))}
function submitTransfer(id){
 const g=state.events.find(x=>x.id===decodeURIComponent(id)),first=el("trFirst")?.value.trim(),last=el("trLast")?.value.trim(),email=el("trEmail")?.value.trim(),index=Number(el("trIdx")?.value||0);
 if(!first||!last||!email){toast("Complete the required fields");return}
 state.transfers=state.transfers.filter(x=>!(x.eventId===g.id&&x.index===index&&x.status==="pending"));
 state.transfers.push({id:uid("transfer"),eventId:g.id,index,first,last,email,note:el("trNote")?.value||"",status:"pending"});save();closeModal();eventPage(g.id);toast("Transfer Pending")
}
function cancelTransfer(id,i){state.transfers=state.transfers.filter(x=>!(x.eventId===decodeURIComponent(id)&&x.index===i&&x.status==="pending"));save();eventPage(decodeURIComponent(id))}
function sell(){toast("Sell flow ready to connect")}
function showModal(){el("modal").className="modal show"}
function closeModal(){el("modal").className="modal";el("modal").innerHTML=""}
function share(id){const g=state.events.find(x=>x.id===decodeURIComponent(id));if(!g)return;const txt="I got tickets for "+g.eventName+"!";if(navigator.share)navigator.share({title:g.eventName,text:txt}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>toast("Share text copied"))}
function eventMenu(id){const g=state.events.find(x=>x.id===decodeURIComponent(id));if(!g)return;el("modal").innerHTML='<div class="sheet"><div class="handle"></div><div class="sheet-head"><span>Event Options</span><button class="close" onclick="closeModal()">Close</button></div><div class="sheet-body"><button class="primary" onclick="editEvent(\''+encodeURIComponent(g.id)+'\');closeModal()">Edit Event</button><button class="secondary" onclick="deleteEvent(\''+encodeURIComponent(g.id)+'\')">Delete Event</button></div></div>';showModal()}
function deleteEvent(id){if(!confirm("Delete this event?"))return;state.events=state.events.filter(x=>x.id!==decodeURIComponent(id));save();closeModal();go("/my-tickets")}
function discover(){render(header("Discover",false,false)+'<main class="form-page"><div class="profile-title">Discover</div><input class="input" id="search" placeholder="Artist, Event or Venue"><div class="list-card" style="margin-top:14px;border:1px solid #ddd;border-radius:8px;padding:15px"><b>Find your next event</b><p style="color:#777">Create and manage events in For You.</p></div></main>',"/discover")}
function countrySheet(){
 const rows=countries.map(c=>'<div class="country-row"><span class="country-name">'+c[1]+' '+esc(c[2])+'</span><button class="pick" onclick="pickCountry(\''+c[0]+'\')">Select</button></div>').join("");
 el("modal").innerHTML='<div class="sheet"><div class="handle"></div><div class="sheet-head"><span>Select Country</span><button class="close" onclick="closeModal()">Close</button></div><div class="sheet-body">'+rows+'</div></div>';showModal()
}
function pickCountry(c){state.country=c;save();closeModal();myTickets()}
function form(id){
 const g=id?state.events.find(x=>x.id===decodeURIComponent(id)):null;
 const d=g||{eventName:"",artistName:"",venue:"",location:"",date:"",time:"",image:"",mapQuery:"",order:"",extraInfo:"Mobile Ticket",tickets:[{id:uid("seat"),section:"",row:"",seat:"",barcode:""}]};
 render(header(g?"Edit Event":"For You",true,false)+'<form class="form-page" onsubmit="saveEvent(event,\''+(g?encodeURIComponent(g.id):"")+'\')"><div class="field"><label>Event Name</label><input id="fName" class="input" required value="'+esc(d.eventName)+'"></div><div class="field"><label>Artist / Performer</label><input id="fArtist" class="input" value="'+esc(d.artistName)+'"></div><div class="field"><label>Venue</label><input id="fVenue" class="input" value="'+esc(d.venue)+'"></div><div class="field"><label>Location</label><input id="fLocation" class="input" value="'+esc(d.location)+'"></div><div class="field"><label>Date</label><input id="fDate" class="input" type="date" value="'+esc(d.date)+'"></div><div class="field"><label>Time</label><input id="fTime" class="input" type="time" value="'+esc(d.time)+'"></div><div class="field"><label>Map Search</label><input id="fMap" class="input" value="'+esc(d.mapQuery)+'"></div><div class="field"><label>Order Number</label><input id="fOrder" class="input" value="'+esc(d.order)+'"></div><div class="field"><label>Ticket Label</label><input id="fExtra" class="input" value="'+esc(d.extraInfo)+'"></div><div class="field"><label>Event Image</label><input id="fFile" type="file" accept="image/*" onchange="pickImage(event)" style="width:100%;padding:10px 0"><input id="fImage" class="input" placeholder="Or paste image URL" value="'+(d.image.startsWith("data:")?"":esc(d.image))+'"></div><div class="field"><label>Tickets</label><div id="seats">'+d.tickets.map(seatForm).join("")+'</div><button type="button" class="secondary" onclick="addSeat()">+ Add Another Ticket</button></div><button type="submit" class="primary">'+(g?"Save Changes":"Add Event / Tickets")+'</button>'+(g?'<button type="button" class="secondary" onclick="deleteEvent(\''+encodeURIComponent(g.id)+'\')">Delete Event</button>':"")+'</form>',"/for-you")
}
function seatForm(t){return '<div class="seat-editor"><button class="remove" type="button" onclick="this.parentElement.remove()">Remove</button><div class="field"><label>Section</label><input class="input sec" value="'+esc(t.section)+'"></div><div class="field"><label>Row</label><input class="input row" value="'+esc(t.row)+'"></div><div class="field"><label>Seat</label><input class="input seat" value="'+esc(t.seat)+'"></div><div class="field"><label>Barcode / Entry Code</label><input class="input code" value="'+esc(t.barcode)+'"></div></div>'}
function addSeat(){el("seats").insertAdjacentHTML("beforeend",seatForm({id:uid("seat"),section:"",row:"",seat:"",barcode:""}))}
function pickImage(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>window._img=r.result;r.readAsDataURL(f)}
function saveEvent(e,id){
 e.preventDefault();
 const tickets=qa("#seats .seat-editor").map(x=>({id:uid("seat"),section:x.querySelector(".sec").value.trim(),row:x.querySelector(".row").value.trim(),seat:x.querySelector(".seat").value.trim(),barcode:x.querySelector(".code").value.trim()}));
 const data={eventName:el("fName").value.trim(),artistName:el("fArtist").value.trim(),venue:el("fVenue").value.trim(),location:el("fLocation").value.trim(),date:el("fDate").value,time:el("fTime").value,mapQuery:el("fMap").value.trim(),order:el("fOrder").value.trim()||"ORDER-000001",extraInfo:el("fExtra").value.trim()||"Mobile Ticket",image:window._img||el("fImage").value.trim()||FALLBACK,tickets:tickets.length?tickets:[{id:uid("seat"),section:"",row:"",seat:"",barcode:uid("code")}]};
 if(id){const i=state.events.findIndex(x=>x.id===decodeURIComponent(id));if(i>=0)state.events[i]=Object.assign({id:decodeURIComponent(id)},data)}else state.events.push(Object.assign({id:uid("event")},data));
 window._img=null;save();go("/my-tickets")
}
function editEvent(id){go("/for-you/edit/"+id)}
function account(){render(header("Account",false,false)+'<main class="form-page"><div class="profile-title">Account</div><div class="field"><label>First Name</label><input id="pf" class="input" value="'+esc(state.profile.firstName)+'"></div><div class="field"><label>Last Name</label><input id="pl" class="input" value="'+esc(state.profile.lastName)+'"></div><div class="field"><label>Email</label><input id="pe" class="input" value="'+esc(state.profile.email)+'"></div><button class="primary" onclick="profileSave()">Save Profile</button></main>',"/account")}
function profileSave(){state.profile.firstName=el("pf").value.trim();state.profile.lastName=el("pl").value.trim();state.profile.email=el("pe").value.trim();save();toast("Profile saved")}
function sellPage(){render(header("Sell",false,false)+'<main class="form-page"><div class="profile-title">Sell Tickets</div><p style="color:#777">Select an event from My Tickets to continue.</p></main>',"/sell")}
function main(){
 const r=route();
 if(r==="/discover")return discover();
 if(r==="/for-you")return form();
 if(r==="/account")return account();
 if(r==="/sell")return sellPage();
 if(r.startsWith("/for-you/edit/"))return form(r.slice(14));
 if(r.startsWith("/event/"))return eventPage(r.slice(7));
 return myTickets();
}
Object.assign(window,{go,myTickets,showPast:()=>myTickets(true),viewTickets,closeModal,eventMenu,deleteEvent,share,transfer,submitTransfer,cancelTransfer,sell,addSeat,pickImage,saveEvent,editEvent,account,profileSave,form,countrySheet,pickCountry,sellPage});
window.addEventListener("hashchange",main);document.addEventListener("DOMContentLoaded",main);save();
})();
