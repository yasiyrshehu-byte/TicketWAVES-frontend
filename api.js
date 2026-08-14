const TW=(()=>{const base=window.TW_CONFIG.API_BASE; const token=()=>localStorage.getItem("tw_token");
async function request(path,opts={}){const headers={...(opts.headers||{})}; if(token())headers.Authorization=`Bearer ${token()}`;
  let body=opts.body;
  if(body && !(body instanceof FormData)){headers["Content-Type"]="application/json";body=JSON.stringify(body)}
  const r=await fetch(base+path,{...opts,headers,body}); let data={}; try{data=await r.json()}catch{}
  if(!r.ok)throw new Error(data.message||`Request failed (${r.status})`); return data;
}
return {base,request,token};})();
function imageUrl(id){return id?`${TW.base.replace(/\/api$/,"")}/api/images/${id}`:"";}
async function requireUser(){if(!TW.token()){location.href="/pages/login.html";return null}try{return (await TW.request("/auth/me")).user}catch(e){localStorage.removeItem("tw_token");location.href="/pages/login.html"}}
