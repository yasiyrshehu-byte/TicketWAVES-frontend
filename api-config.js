// TicketWAVES production API configuration
const TW_API_BASE = "https://ticketwaves-backend-3.onrender.com/api";

function twToken(){
  return localStorage.getItem("token") || localStorage.getItem("ticketwaves_token") || "";
}
function twHeaders(extra={}){
  const h={"Content-Type":"application/json",...extra};
  const t=twToken(); if(t) h.Authorization=`Bearer ${t}`;
  return h;
}
async function twFetch(path, options={}, timeout=15000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const res=await fetch(TW_API_BASE+path,{...options,headers:twHeaders(options.headers||{}),signal:controller.signal});
    let data={};
    try{data=await res.json();}catch{}
    if(!res.ok) throw new Error(data.message||`Request failed (${res.status})`);
    return data;
  }catch(e){
    if(e.name==="AbortError") throw new Error("The server took too long to respond. Please try again.");
    if(e instanceof TypeError) throw new Error("TicketWAVES server could not be reached. Please check the backend deployment.");
    throw e;
  }finally{clearTimeout(timer);}
}
