const API=(window.TW_CONFIG?.API_BASE_URL||"").replace(/\/$/,"");
const $=id=>document.getElementById(id);
function token(){return localStorage.getItem("token")||""}
function currentUser(){try{return JSON.parse(localStorage.getItem("user")||"null")}catch{return null}}
function authHeaders(){return token()?{"Authorization":"Bearer "+token(),"Content-Type":"application/json"}:{"Content-Type":"application/json"}}
async function api(path,opt={}){
  if(!API) throw new Error("Backend URL is not configured. Edit config.js.");
  const r=await fetch(API+path,{...opt,headers:{...authHeaders(),...(opt.headers||{})}});
  const text=await r.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{data={message:text}};
  if(!r.ok) throw new Error(data.message||`Request failed (${r.status})`);
  return data;
}
function requireAuth(){
  if(!token()){location.href="./login.html?redirect="+encodeURIComponent(location.href);return false}
  return true;
}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function money(v,c="NGN"){try{return new Intl.NumberFormat(undefined,{style:"currency",currency:c}).format(Number(v||0))}catch{return `${c} ${Number(v||0).toFixed(2)}`}}
function logout(){localStorage.removeItem("token");localStorage.removeItem("user");location.href="./login.html"}
function showMessage(el,text,type=""){if(!el)return;el.textContent=text;el.className=type}
document.addEventListener("DOMContentLoaded",()=>{
  const u=currentUser(), link=$("authLink");
  if(link&&u){link.textContent="Account";link.href="./profile.html"}
});
