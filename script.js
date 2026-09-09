(function(){
'use strict';

const KEY = 'ticketwaves_state_v8';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=85';
const countries = [
  ['US','🇺🇸','United States'],['NG','🇳🇬','Nigeria'],['CA','🇨🇦','Canada'],['GB','🇬🇧','United Kingdom'],
  ['AU','🇦🇺','Australia'],['DE','🇩🇪','Germany'],['FR','🇫🇷','France'],['ES','🇪🇸','Spain'],
  ['BE','🇧🇪','Belgium'],['NL','🇳🇱','Netherlands'],['IE','🇮🇪','Ireland'],['ZA','🇿🇦','South Africa'],
  ['AE','🇦🇪','United Arab Emirates'],['JP','🇯🇵','Japan'],['KR','🇰🇷','South Korea'],['MX','🇲🇽','Mexico']
];

const demo = {
  id:'demo', eventName:'Your Event Name', artistName:'Artist / Performer', venue:'Your Venue', location:'City, Country',
  date:'2026-12-12', time:'20:00', eventImage:FALLBACK_IMAGE, mapQuery:'Your Venue', orderNumber:'ORDER-000001',
  extraInfo:'Standard Ticket', tickets:[{id:'seat-1',section:'A1',row:'1',seat:'1',ticketType:'Mobile',barcode:'000000000001'}]
};
const defaults = {tickets:[demo],transfers:[],sales:[],user:{firstName:'',lastName:'',email:'',phone:'',country:'US'},country:'US'};

function clone(v){return JSON.parse(JSON.stringify(v));}
function uid(p){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
function esc(s){return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function val(id){var el=document.getElementById(id);return el ? String(el.value||'').trim() : '';}
function q(sel){return document.querySelector(sel);}
function qa(sel){return Array.prototype.slice.call(document.querySelectorAll(sel));}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function load(){try{var r=JSON.parse(localStorage.getItem(KEY));if(r&&typeof r==='object')return Object.assign(clone(defaults),r,{tickets:Array.isArray(r.tickets)?r.tickets:clone(defaults.tickets),transfers:Array.isArray(r.transfers)?r.transfers:[],sales:Array.isArray(r.sales)?r.sales:[],user:Object.assign(clone(defaults.user),r.user||{})});}catch(e){}return clone(defaults);}
let state = load();
function route(){return location.hash.replace(/^#/,'') || '/my-tickets';}
function go(r){location.hash=r;}
function currentCountry(){return countries.find(function(c){return c[0]===state.country;}) || countries[0];}
function formatDate(v){if(!v)return '';var d=new Date(v+'T12:00:00');return isNaN(d.getTime())?esc(v):d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}).toUpperCase();}
function formatTime(v){if(!v)return '';var a=String(v).split(':');var h=Number(a[0]);return (h%12||12)+':'+(a[1]||'00')+(h>=12?' PM':' AM');}
function img(v){return v||FALLBACK_IMAGE;}
function ticketIcon(){return '<span class="ticketMiniIcon"></span>';}

function bottom(active){
  var data=[['/discover','⌕','Discover'],['/favorites','♥','For You'],['/my-tickets','◇','My Tickets'],['/sell','$','Sell'],['/account','●','Account']];
  return '<nav class="bottomNav">'+data.map(function(n){return '<button class="'+(active===n[0]?'active':'')+'" onclick="go(\''+n[0]+'\')"><span class="navIcon">'+n[1]+'</span><span class="navText">'+n[2]+'</span></button>';}).join('')+'</nav>';
}

function header(title, showFlag){
  var flag=showFlag===false?'': '<span class="flag">'+currentCountry()[1]+'</span>';
  var logo=showFlag===false?'<img src="logo-t.png" alt="">':'';
  return '<header class="darkHeader"><div class="headerBar"><div class="headerSide"><button class="iconBtn" onclick="go(\'/discover\')">‹</button></div><div class="brand">'+logo+'<span>'+esc(title||'')+'</span>'+flag+'</div><div class="headerSide right"><button class="helpBtn" onclick="alert(\'Help\')">Help</button></div></div></header>';
}

function render(content,active){document.getElementById('app').innerHTML='<div class="app"><div class="shell">'+content+'</div>'+bottom(active)+'</div>';ensureModal();}
function ensureModal(){var m=document.getElementById('modal');if(!m){m=document.createElement('div');m.id='modal';m.className='modal';document.body.appendChild(m);}return m;}
function closeModal(){var m=ensureModal();m.className='modal';m.innerHTML='';}
function countryModal(){
  var m=ensureModal();
  var rows=countries.map(function(c){return '<div class="countryRow"><span class="countryName"><span class="countryFlag">'+c[1]+'</span>'+esc(c[2])+'</span><button class="secondaryBtn" onclick="chooseCountry(\''+c[0]+'\')">Select</button></div>';}).join('');
  m.innerHTML='<div class="countrySheet"><div class="formRow"><b>Select Country</b><button class="secondaryBtn" onclick="closeModal()">Close</button></div>'+rows+'</div>';
  m.classList.add('show');
}
function chooseCountry(code){state.country=code;state.user.country=code;save();closeModal();main();}

function discover(){
  render(header('Discover',false)+'<main class="foryouPage"><div class="infoCard"><input class="input" placeholder="Artist, Event or Venue"></div><div class="infoCard"><h2>Discover Events</h2><p class="muted">Browse upcoming experiences and save event details in For You.</p></div></main>','/discover');
}

function myTickets(tab){
  tab=tab||'upcoming';
  var now=Date.now();
  var upcoming=state.tickets.filter(function(t){return new Date((t.date||'9999-12-31')+'T23:59:59').getTime()>=now;});
  var past=state.tickets.filter(function(t){return upcoming.indexOf(t)===-1;});
  var items=tab==='past'?past:upcoming;
  var tabs='<div class="tabHeader"><div class="tabs"><button class="'+(tab==='upcoming'?'active':'')+'" onclick="myTickets(\'upcoming\')">UPCOMING ('+upcoming.length+')</button><button class="'+(tab==='past'?'active':'')+'" onclick="myTickets(\'past\')">PAST ('+past.length+')</button></div></div>';
  var list=items.length?items.map(myEvent).join(''):'<div class="emptyPage"><h2>No '+tab+' events</h2><p>Add an event from For You.</p></div>';
  render(header('My Events',true)+tabs+'<div class="eventList">'+list+'</div>','/my-tickets');
}

function myEvent(g){
  return '<article class="myEventCard"><div class="eventHero"><img src="'+esc(img(g.eventImage))+'" alt=""></div><div class="eventInfoOverlay"><div class="eventDate">'+formatDate(g.date)+' • '+formatTime(g.time)+' <span class="countBadge">'+ticketIcon()+' x'+g.tickets.length+'</span></div><div class="eventName">'+esc(g.eventName)+'</div><div class="eventMeta">'+esc(g.venue)+' - '+esc(g.location)+'</div></div><button class="viewBtn" onclick="go(\'/ticket/'+encodeURIComponent(g.id)+'\')">▥ View Tickets</button></article>';
}

function ticketDetail(id){
  var g=state.tickets.find(function(x){return x.id===decodeURIComponent(id);});
  if(!g){go('/my-tickets');return;}
  var seats=g.tickets.map(function(t,i){return seatCard(g,t,i);}).join('');
  var ticketsPanel='<section id="ticketsPanel" class="ticketPanel"><article class="myEventCard"><div class="eventHero"><img src="'+esc(img(g.eventImage))+'" alt=""></div><div class="eventInfoOverlay"><div class="eventDate">'+formatDate(g.date)+' • '+formatTime(g.time)+' <span class="countBadge">'+ticketIcon()+' x'+g.tickets.length+'</span></div><div class="eventName">'+esc(g.eventName)+'</div><div class="eventMeta">'+esc(g.venue)+' - '+esc(g.location)+'</div></div><button class="viewBtn" onclick="showBarcode(\''+encodeURIComponent(g.id)+'\')">▥ View Tickets</button></article><div class="orderBlock"><div class="orderRow"><div><div class="orderTitle">Order #'+esc(g.orderNumber)+'</div><div class="orderSub">x'+g.tickets.length+' Ticket'+(g.tickets.length===1?'':'s')+'</div></div><button class="moreDots" onclick="alert(\'More options\')">⋮</button></div>'+seats+'<div class="moreOptions">MORE OPTIONS</div><div class="mapWrap"><iframe title="Venue map" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-79.43%2C43.63%2C-79.32%2C43.72&layer=mapnik&marker=43.8078%2C-79.3449"></iframe><div class="mapPill"><button onclick="alert(\'Upgrade options\')">↥ Upgrade</button><button onclick="openTransfer(\''+encodeURIComponent(g.id)+'\')">↗ Transfer</button><button onclick="sellTicket(\''+encodeURIComponent(g.id)+'\')">⟳ Sell</button></div></div><a class="directionsBtn" target="_blank" rel="noopener" href="https://www.openstreetmap.org/search?query='+encodeURIComponent((g.venue||'')+' '+(g.location||''))+'">Get Directions</a></div></section>';
  var extrasPanel='<section id="extrasPanel" class="extrasPanel"><div class="gotTicketCard"><div class="gotTicketVisual"><img src="'+esc(img(g.eventImage))+'" alt=""><div class="gotTicketText">YOU GOT<br>TICKETS!</div></div><div class="socialBlock"><h3>Post on Social Media</h3><p>Build hype for the event, and share that you got tickets with your friends and family.</p><button class="shareBtn" onclick="shareEvent(\''+encodeURIComponent(g.id)+'\')">Share You’re Going ↗</button></div></div></section>';
  var content=header('',false)+'<main class="page"><div class="ticketTabs"><button id="ticketsTab" class="active" onclick="switchTabs(\'tickets\')">Tickets</button><button id="extrasTab" onclick="switchTabs(\'extras\')">Extras</button></div>'+ticketsPanel+extrasPanel+'</main>';
  render(content,'/my-tickets');
}

function seatCard(g,t,i){
  var p=state.transfers.find(function(x){return x.ticketId===g.id&&x.ticketIndex===i&&x.status==='pending';});
  var pending=p?'<div class="transferPending"><div class="transferText"><span class="statusIcon">↗</span><span>Transfer Pending: '+esc(p.firstName+' '+p.lastName)+'</span></div><button class="deleteBtn" onclick="cancelTransfer(\''+encodeURIComponent(g.id)+'\','+i+')">⌫</button></div>':'';
  return '<div class="ticketCard"><div class="ticketHead">'+esc(g.extraInfo||'TICKET')+'</div><div class="ticketSeats"><div class="ticketSeat"><div class="ticketLabel">SECTION</div><div class="ticketValue">'+esc(t.section||'—')+'</div></div><div class="ticketSeat"><div class="ticketLabel">ROW</div><div class="ticketValue">'+esc(t.row||'—')+'</div></div><div class="ticketSeat"><div class="ticketLabel">SEAT</div><div class="ticketValue">'+esc(t.seat||'—')+'</div></div></div>'+pending+'</div>';
}

function switchTabs(which){
  var a=q('#ticketsPanel'),b=q('#extrasPanel'),ta=q('#ticketsTab'),tb=q('#extrasTab');
  if(!a||!b)return;
  if(which==='extras'){a.classList.add('hidden');b.classList.add('show');ta.classList.remove('active');tb.classList.add('active');}
  else{b.classList.remove('show');a.classList.remove('hidden');ta.classList.add('active');tb.classList.remove('active');}
}

function showBarcode(id){
  var g=state.tickets.find(function(x){return x.id===decodeURIComponent(id);});if(!g)return;
  var m=ensureModal();
  var body=g.tickets.map(function(t){return '<div class="entryTicket"><div class="entryBlue"><div class="entryTop">'+esc(g.extraInfo||'Mobile Ticket')+'</div><div class="entryGrid"><div><span>SEC</span><strong>'+esc(t.section||'—')+'</strong></div><div><span>ROW</span><strong>'+esc(t.row||'—')+'</strong></div><div><span>SEAT</span><strong>'+esc(t.seat||'—')+'</strong></div></div><div class="entryExtra">'+esc(g.venue||'')+'</div></div><div class="barcodeBars"></div><div class="barcodeNumber">'+esc(t.barcode||g.orderNumber||t.id)+'</div><button class="walletBtn" onclick="alert(\'Wallet integration can be connected here\')">Add to Wallet</button></div>';}).join('');
  m.innerHTML='<div class="transferSheet"><div class="sheetHandle"></div><div class="sheetHeader">'+g.tickets.length+' Ticket'+(g.tickets.length===1?'':'s')+' <button class="secondaryBtn" style="float:right" onclick="closeModal()">Done</button></div><div class="barcodeSheet">'+body+'</div></div>';
  m.classList.add('show');
}

function openTransfer(id){
  var g=state.tickets.find(function(x){return x.id===decodeURIComponent(id);});if(!g)return;
  var m=ensureModal(),t=g.tickets[0]||{};
  m.innerHTML='<div class="transferSheet"><div class="sheetHandle"></div><div class="sheetHeader">TRANSFER TICKETS</div><div class="transferBody"><h2>1 Ticket Selected</h2><div class="transferSeat">Section <b>'+esc(t.section||'—')+'</b>, Row <b>'+esc(t.row||'—')+'</b>, Seat <b>'+esc(t.seat||'—')+'</b></div><label class="transferLabel">First Name*</label><input class="transferInput" id="tf" placeholder="Enter First Name"><label class="transferLabel">Last Name*</label><input class="transferInput" id="tl" placeholder="Enter Last Name"><label class="transferLabel">Email*</label><input class="transferInput" id="te" type="email" placeholder="Enter Email Address"><div class="mobileSwitch">Use Mobile Number Instead</div><label class="transferLabel">Note</label><textarea class="transferInput" id="tn" style="height:88px;padding-top:12px"></textarea></div><div class="transferFooter"><button class="transferBack" onclick="closeModal()">‹ Back</button><button id="transferForward" class="transferForward" onclick="submitTransfer(\''+encodeURIComponent(g.id)+'\')">Forward 1 Ticket</button></div></div>';
  m.classList.add('show');
  ['tf','tl','te'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',transferReady);});
  transferReady();
}
function transferReady(){var ok=val('tf')&&val('tl')&&val('te');var b=q('#transferForward');if(b)b.classList.toggle('ready',!!ok);}
function submitTransfer(id){
  var d=decodeURIComponent(id),g=state.tickets.find(function(x){return x.id===d;});if(!g)return;
  var f=val('tf'),l=val('tl'),e=val('te'),n=val('tn');
  if(!f||!l||!e){alert('Please complete the required fields.');return;}
  state.transfers=state.transfers.filter(function(x){return !(x.ticketId===d&&x.ticketIndex===0&&x.status==='pending');});
  state.transfers.push({id:uid('transfer'),ticketId:d,ticketIndex:0,firstName:f,lastName:l,email:e,note:n,status:'pending'});
  save();closeModal();ticketDetail(encodeURIComponent(d));
}
function cancelTransfer(id,index){var d=decodeURIComponent(id);state.transfers=state.transfers.filter(function(x){return !(x.ticketId===d&&x.ticketIndex===index);});save();ticketDetail(encodeURIComponent(d));}
function sellTicket(id){var d=decodeURIComponent(id);if(!state.tickets.some(function(x){return x.id===d;}))return;state.sales.push({id:uid('sale'),ticketId:d,status:'listed',createdAt:new Date().toISOString()});save();alert('Ticket listed for sale');}

function ticketForm(g){
  var x=g||{id:'',eventName:'',artistName:'',venue:'',location:'',date:'',time:'20:00',orderNumber:'',extraInfo:'Standard Ticket',eventImage:'',mapQuery:'',tickets:[{section:'',row:'',seat:'',barcode:''}]};
  var ts=x.tickets&&x.tickets.length?x.tickets:[{section:'',row:'',seat:'',barcode:''}];
  return '<div class="formRow"><button class="secondaryBtn" onclick="go(\'/favorites\')">← Back</button><div class="formTitle">'+(x.id?'Edit':'Add')+' Event / Ticket</div><span></span></div><form onsubmit="saveTicket(event)"><input type="hidden" id="editId" value="'+esc(x.id)+'"><label class="label">Event Name*</label><input class="input" id="fEvent" required value="'+esc(x.eventName)+'"><label class="label">Artist / Performer</label><input class="input" id="fArtist" value="'+esc(x.artistName)+'"><label class="label">Venue*</label><input class="input" id="fVenue" required value="'+esc(x.venue)+'"><label class="label">Location*</label><input class="input" id="fLocation" required value="'+esc(x.location)+'"><label class="label">Date*</label><input class="input" id="fDate" type="date" required value="'+esc(x.date)+'"><label class="label">Time</label><input class="input" id="fTime" type="time" value="'+esc(x.time||'20:00')+'"><label class="label">Order Number</label><input class="input" id="fOrder" value="'+esc(x.orderNumber)+'"><label class="label">Ticket title / extra information</label><input class="input" id="fExtra" value="'+esc(x.extraInfo||'')+'"><label class="label">Event image</label><div class="imageUpload"><input class="input" id="fImageFile" type="file" accept="image/*" onchange="previewImage(this)"><input class="input" id="fImageUrl" type="url" placeholder="Or paste an image URL"><img id="imagePreview" class="previewImg" '+(x.eventImage?'src="'+esc(x.eventImage)+'"':'style="display:none"')+' alt=""></div><label class="label">Map search</label><input class="input" id="fMap" value="'+esc(x.mapQuery||x.location||x.venue)+'"><div class="formRow" style="margin-top:20px"><div class="formTitle">Tickets / Seats</div><button type="button" class="secondaryBtn" onclick="addSeatEditor()">+ Add seat</button></div><div id="seatEditors">'+ts.map(seatEditor).join('')+'</div><button class="primaryBtn full" type="submit">Save Ticket</button>'+(x.id?'<button type="button" class="secondaryBtn full" style="margin-top:10px;color:#c62828" onclick="deleteTicket(\''+encodeURIComponent(x.id)+'\')">Delete Ticket</button>':'')+'</form>';
}
function seatEditor(t,i){return '<div class="rowEditor"><div class="rowEditorHeader"><span>Ticket '+(i+1)+'</span>'+(i?'<button class="removeSeat" type="button" onclick="this.closest(\'.rowEditor\').remove()">Remove</button>':'')+'</div><input type="hidden" class="seatId" value="'+esc(t.id||uid('seat'))+'"><div class="seatGrid"><div><label class="label">Section</label><input class="input seatSection" value="'+esc(t.section||'')+'"></div><div><label class="label">Row</label><input class="input seatRow" value="'+esc(t.row||'')+'"></div><div><label class="label">Seat</label><input class="input seatSeat" value="'+esc(t.seat||'')+'"></div></div><label class="label">Barcode / Ticket number</label><input class="input seatBarcode" value="'+esc(t.barcode||'')+'"></div>';}
function addSeatEditor(){var b=q('#seatEditors');if(b)b.insertAdjacentHTML('beforeend',seatEditor({},b.children.length));}
function previewImage(inp){var f=inp.files&&inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var p=q('#imagePreview');if(p){p.src=e.target.result;p.style.display='block';}};r.readAsDataURL(f);}
function saveTicket(ev){
  ev.preventDefault();
  var id=val('editId'),existing=state.tickets.find(function(x){return x.id===id;});
  var p=q('#imagePreview');var image=(p&&p.src&&p.src.indexOf('data:')===0)?p.src:(val('fImageUrl')|| (existing&&existing.eventImage) || FALLBACK_IMAGE);
  var tickets=qa('#seatEditors .rowEditor').map(function(el){return {id:el.querySelector('.seatId')?.value||uid('seat'),section:el.querySelector('.seatSection')?.value.trim()||'',row:el.querySelector('.seatRow')?.value.trim()||'',seat:el.querySelector('.seatSeat')?.value.trim()||'',barcode:el.querySelector('.seatBarcode')?.value.trim()||'',ticketType:'Mobile'};}).filter(function(t){return t.section||t.row||t.seat||t.barcode;});
  if(!tickets.length)tickets=[{id:uid('seat'),section:'',row:'',seat:'',barcode:'',ticketType:'Mobile'}];
  var g={id:id||uid('ticket'),eventName:val('fEvent'),artistName:val('fArtist'),venue:val('fVenue'),location:val('fLocation'),date:val('fDate'),time:val('fTime')||'20:00',orderNumber:val('fOrder')||uid('order').replace(/-/g,''),extraInfo:val('fExtra')||'Standard Ticket',eventImage:image,mapQuery:val('fMap')||val('fLocation'),tickets:tickets};
  if(existing)state.tickets=state.tickets.map(function(x){return x.id===id?g:x;});else state.tickets.unshift(g);save();go('/my-tickets');
}
function deleteTicket(id){var d=decodeURIComponent(id);if(!confirm('Delete this ticket?'))return;state.tickets=state.tickets.filter(function(x){return x.id!==d;});state.transfers=state.transfers.filter(function(x){return x.ticketId!==d;});state.sales=state.sales.filter(function(x){return x.ticketId!==d;});save();go('/my-tickets');}
function editTicket(id){var g=state.tickets.find(function(x){return x.id===decodeURIComponent(id);});if(g)document.getElementById('app').innerHTML='<div class="app"><div class="shell"><div class="formPage">'+ticketForm(g)+'</div></div></div>';}
function addTicket(){document.getElementById('app').innerHTML='<div class="app"><div class="shell"><div class="formPage">'+ticketForm()+'</div></div></div>';}
function favorites(){var cards=state.tickets.map(function(g){return '<div class="infoCard"><b>'+esc(g.eventName)+'</b><p class="muted">'+formatDate(g.date)+' • '+esc(g.venue)+' • '+g.tickets.length+' ticket'+(g.tickets.length===1?'':'s')+'</p><div style="display:flex;gap:8px"><button class="secondaryBtn" onclick="editTicket(\''+encodeURIComponent(g.id)+'\')">Edit</button><button class="secondaryBtn" onclick="go(\'/ticket/'+encodeURIComponent(g.id)+'\')">View</button></div></div>';}).join('');render(header('For You',false)+'<main class="foryouPage"><div class="infoCard"><h2>For You</h2><p class="muted">Manage every event, image and ticket detail. Saved tickets automatically appear in My Tickets.</p><button class="primaryBtn full" onclick="addTicket()">+ Add Event / Ticket</button></div>'+cards+'</main>','/favorites');}
function sell(){var cards=state.tickets.map(function(g){return '<div class="infoCard"><b>'+esc(g.eventName)+'</b><p class="muted">'+formatDate(g.date)+' • '+esc(g.venue)+'</p><button class="primaryBtn" onclick="sellTicket(\''+encodeURIComponent(g.id)+'\')">Sell Ticket</button></div>';}).join('');render(header('Sell',false)+'<main class="foryouPage">'+cards+'</main>','/sell');}
function account(){render(header('Account',false)+'<main class="foryouPage"><div class="infoCard"><h2>'+esc(state.user.firstName||'Your Account')+'</h2><p class="muted">'+esc(state.user.email||'')+'</p><button class="secondaryBtn" onclick="countryModal()">'+currentCountry()[1]+' '+esc(currentCountry()[2])+'</button></div></main>','/account');}
function shareEvent(id){var g=state.tickets.find(function(x){return x.id===decodeURIComponent(id);});if(!g)return;if(navigator.share)navigator.share({title:g.eventName,text:'You’re going! '+g.eventName}).catch(function(){});else alert('Share your event with friends and family.');}
function main(){try{var r=route();if(r==='/discover')discover();else if(r==='/favorites')favorites();else if(r==='/my-tickets')myTickets();else if(r==='/sell')sell();else if(r==='/account')account();else if(r.indexOf('/ticket/')===0)ticketDetail(r.slice(8));else myTickets();}catch(e){console.error(e);document.getElementById('app').innerHTML='<div class="emptyPage"><h2>Something went wrong</h2><p>'+esc(e.message||'Please refresh')+'</p></div>';}}

window.go=go;window.myTickets=myTickets;window.addTicket=addTicket;window.editTicket=editTicket;window.saveTicket=saveTicket;window.deleteTicket=deleteTicket;window.addSeatEditor=addSeatEditor;window.previewImage=previewImage;window.openTransfer=openTransfer;window.submitTransfer=submitTransfer;window.cancelTransfer=cancelTransfer;window.sellTicket=sellTicket;window.showBarcode=showBarcode;window.closeModal=closeModal;window.switchTabs=switchTabs;window.countryModal=countryModal;window.chooseCountry=chooseCountry;window.shareEvent=shareEvent;
window.addEventListener('hashchange',main);ensureModal();main();
})();
