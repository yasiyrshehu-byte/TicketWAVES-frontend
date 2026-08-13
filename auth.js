document.addEventListener("DOMContentLoaded",()=>{
 const form=$("form");if(!form)return;
 const params=new URLSearchParams(location.search),isRegister=!!$("firstName");
 const msg=$("msg"),transferToken=params.get("transferToken");
 const emailParam=params.get("email");if(emailParam&&$("email"))$("email").value=emailParam;
 form.addEventListener("submit",async e=>{
  e.preventDefault();const btn=form.querySelector("button");btn.disabled=true;
  try{
   const body={email:$("email").value.trim().toLowerCase(),password:$("password").value};
   if(isRegister)Object.assign(body,{firstName:$("firstName").value.trim(),lastName:$("lastName").value.trim(),phone:$("phone").value.trim()});
   const d=await api("/auth/"+(isRegister?"register":"login"),{method:"POST",body:JSON.stringify(body)});
   if(!d.token)throw new Error("Authentication response was incomplete.");
   localStorage.setItem("token",d.token);localStorage.setItem("user",JSON.stringify(d.user));
   if(transferToken){
    try{await api("/transfers/accept",{method:"POST",body:JSON.stringify({token:transferToken})});location.href="./my-tickets.html";return}
    catch(x){location.href="./accept-transfer.html?token="+encodeURIComponent(transferToken);return}
   }
   location.href=params.get("redirect")||"./index.html";
  }catch(x){showMessage(msg,x.message,"error");btn.disabled=false}
 });
});
