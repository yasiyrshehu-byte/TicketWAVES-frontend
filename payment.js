document.addEventListener("DOMContentLoaded",async()=>{
 const title=$("title"),msg=$("msg"),ref=new URLSearchParams(location.search).get("reference")||new URLSearchParams(location.search).get("trxref");
 if(!ref){showMessage(msg,"No payment reference was returned.","error");return}
 if(!token()){showMessage(msg,"Please sign in to verify and view your ticket.","error");return}
 try{
  const d=await api("/payment/verify/"+encodeURIComponent(ref));
  title.textContent="Payment confirmed";
  showMessage(msg,d.message||"Payment verified. Your ticket is now available in My Tickets.","success");
  const box=$("actions");if(box)box.innerHTML='<a class="button" href="./my-tickets.html">View my tickets</a>';
 }catch(e){title.textContent="Payment not confirmed";showMessage(msg,e.message,"error")}
});
