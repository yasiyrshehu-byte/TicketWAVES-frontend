const API=(window.TW_CONFIG?.API_BASE_URL||'').replace(/\/$/,'');
function getToken(){return localStorage.getItem('token')} function getUser(){try{return JSON.parse(localStorage.getItem('user')||'null')}catch{return null}}
function authHeaders(){const t=getToken();return t?{'Authorization':`Bearer ${t}`,'Content-Type':'application/json'}:{'Content-Type':'application/json'}}
async function api(path,opt={}){const r=await fetch(API+path,{...opt,headers:{...authHeaders(),...(opt.headers||{})}});const text=await r.text();let d={};try{d=text?JSON.parse(text):{}}catch{d={message:text}}if(!r.ok)throw Error(d.message||`Request failed (${r.status})`);return d}
function requireAuth(){if(!getToken()){location.href='login.html';return false}return true} function money(a,c='NGN'){try{return new Intl.NumberFormat(undefined,{style:'currency',currency:c||'NGN'}).format(Number(a||0))}catch{return `${c||''} ${a||0}`}}
function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))} function logout(){localStorage.removeItem('token');localStorage.removeItem('user');location.href='login.html'}
document.addEventListener('DOMContentLoaded',()=>{const a=document.getElementById('authLink');if(a&&getUser()){a.textContent='Account';a.href='profile.html'}});
