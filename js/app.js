const API_KEY='ticketwaves_api_url';
function apiBase(){const saved=localStorage.getItem(API_KEY)||window.TICKETWAVES_API_URL||'';if(saved)return saved.replace(/\/$/,'');if(location.hostname==='localhost'||location.hostname==='127.0.0.1')return location.origin;return '';}
function setApiBase(v){localStorage.setItem(API_KEY,String(v||'').trim().replace(/\/$/,''));window.TICKETWAVES_API_URL=apiBase();}
function token(){return localStorage.getItem('tw_token')||''} function user(){try{return JSON.parse(localStorage.getItem('tw_user')||'null')}catch{return null}}
function api(path,opt={}){const base=apiBase();if(!base)throw new Error('Set your Render API URL in API Settings first.');const h={...(opt.headers||{})};if(token())h.Authorization='Bearer '+token();if(!(opt.body instanceof FormData))h['Content-Type']='application/json';return fetch(base+path,{...opt,headers:h}).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||`Request failed (${r.status})`);return d;});}
function money(n,c='NGN'){return new Intl.NumberFormat(undefined,{style:'currency',currency:c,maximumFractionDigits:2}).format(Number(n||0));}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function img(src){return src||'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80';}
function nav(){const u=user();document.querySelectorAll('[data-auth]').forEach(e=>e.style.display=u?'':'none');document.querySelectorAll('[data-guest]').forEach(e=>e.style.display=u?'none':'');const name=document.querySelector('[data-user-name]');if(name)name.textContent=u?u.firstName:'Account';}
function logout(){localStorage.removeItem('tw_token');localStorage.removeItem('tw_user');location.href='index.html';}
function requireLogin(){if(!token()){location.href='login.html?next='+encodeURIComponent(location.href);return false}return true}
function saveApi(){const v=prompt('Enter your Render backend URL (do not add /api):',apiBase()||'');if(v&&/^https?:\/\//.test(v)){setApiBase(v);alert('API URL saved.');location.reload();}}
document.addEventListener('DOMContentLoaded',nav);
