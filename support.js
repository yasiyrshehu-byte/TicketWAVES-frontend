document.addEventListener("DOMContentLoaded",()=>{
 const form=$("form");if(!form)return;
 const u=currentUser();if(u){$("name").value=`${u.firstName||""} ${u.lastName||""}`.trim();$("email").value=u.email||""}
 form.addEventListener("submit",async e=>{e.preventDefault();const btn=form.querySelector("button");btn.disabled=true;
 try{const d=await api("/support",{method:"POST",body:JSON.stringify({name:$("name").value.trim(),email:$("email").value.trim(),subject:$("subject").value.trim(),message:$("message").value.trim()})});showMessage($("msg"),d.message||"Support request sent.","success");form.reset()}
 catch(x){showMessage($("msg"),x.message,"error")}finally{btn.disabled=false}
 });
});
