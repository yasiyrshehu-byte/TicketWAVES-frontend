document.addEventListener("DOMContentLoaded",()=>{
  const loginForm=$("loginForm"),dashboard=$("adminDashboard");

  if(loginForm){
    loginForm.addEventListener("submit",async e=>{
      e.preventDefault();

      const btn=loginForm.querySelector("button");
      btn.disabled=true;

      try{
        const d=await api("/auth/login",{
          method:"POST",
          body:JSON.stringify({
            email:$("email").value.trim().toLowerCase(),
            password:$("password").value
          })
        });

        if(d.user?.role!=="admin"){
          throw new Error(
            "This account does not have administrator access."
          );
        }

        localStorage.setItem("token",d.token);
        localStorage.setItem(
          "user",
          JSON.stringify(d.user)
        );

        location.href="./admin.html";

      }catch(x){
        showMessage(
          $("msg"),
          x.message,
          "error"
        );

        btn.disabled=false;
      }
    });

    return;
  }

  if(dashboard&&!requireAuth())return;

  if(
    dashboard &&
    currentUser()?.role!=="admin"
  ){
    dashboard.innerHTML=
      '<div class="admin-card error">Administrator access required.</div>';

    return;
  }

  loadAdmin();
});


async function loadAdmin(){

  try{

    const [
      stats,
      events,
      free,
      support,
      venues
    ]=await Promise.all([

      api("/admin/stats"),

      api("/events"),

      api("/admin/free-ticket-options"),

      api("/admin/support"),

      api("/admin/venues")

    ]);


    $("stats").innerHTML=
      Object.entries(
        stats.stats||{}
      )
      .map(
        ([k,v])=>
          `<div class="stat">
            <b>${esc(v)}</b>
            <span>${esc(k)}</span>
          </div>`
      )
      .join("");


    $("eventList").innerHTML=
      (events.events||[])
      .map(
        e=>
          `<div class="admin-row">

            <b>${esc(e.title)}</b>

            <br>

            ${esc(e.date)}
            ·
            ${esc(e.venue)},
            ${esc(e.city||"")}

            <br>

            <span>
              ${Number(e.availableSeats||0)}
              available
            </span>

          </div>`
      )
      .join("")
      ||
      "<p>No events.</p>";


    $("freeTicket").innerHTML=
      (free.options||[])
      .map(
        x=>
          `<option value="${esc(x.id)}">
            ${esc(x.label)}
          </option>`
      )
      .join("")
      ||
      "<option value=''>No available seats</option>";


    $("supportList").innerHTML=
      (support.messages||[])
      .map(
        x=>
          `<div class="admin-row">

            <b>${esc(x.subject)}</b>

            <br>

            ${esc(x.email)}

            <br>

            ${esc(x.message)}

            <br>

            <small>
              ${esc(x.status||"open")}
            </small>

          </div>`
      )
      .join("")
      ||
      "<p>No support messages.</p>";


    $("venueId").innerHTML=
      '<option value="">Select a saved venue…</option>'+
      (venues.venues||[])
      .map(
        v=>
          `<option value="${esc(v.id)}">
            ${esc(v.name)}
            —
            ${esc(v.city)},
            ${esc(v.country)}
            (${Number(v.seatCount||0)} seats)
          </option>`
      )
      .join("");


  }catch(e){

    showMessage(
      $("adminMsg"),
      e.message,
      "error"
    );

  }
}


async function parseSeatData(file){

  const text=await file.text();

  if(
    file.name
      .toLowerCase()
      .endsWith(".json")
  ){

    const parsed=JSON.parse(text);

    const rows=
      Array.isArray(parsed)
        ? parsed
        : (parsed.seats||[]);

    if(!rows.length){

      throw new Error(
        "The JSON seat map contains no seats."
      );

    }

    return rows;
  }


  const lines=
    text
      .split(/\r?\n/)
      .filter(Boolean);


  if(lines.length<2){

    throw new Error(
      "The CSV seat map is empty."
    );

  }


  const headers=
    lines
      .shift()
      .split(",")
      .map(
        x=>x.trim().toLowerCase()
      );


  return lines.map(line=>{

    const cols=line.split(",");
    const o={};

    headers.forEach(
      (h,i)=>{
        o[h]=(cols[i]||"").trim();

        if(o.price!==undefined){
          o.price=Number(o.price);
        }
      }
    );

    return o;

  });

}


$("venueForm")?.addEventListener(
  "submit",
  async e=>{

    e.preventDefault();

    const b=
      e.currentTarget.querySelector(
        "button"
      );

    b.disabled=true;

    try{

      const mapFile=
        $("venueMapFile").files[0];

      const dataFile=
        $("seatDataFile").files[0];


      if(!mapFile||!dataFile){

        throw new Error(
          "Upload both the seat map image and seat-data file."
        );

      }


      const seats=
        await parseSeatData(
          dataFile
        );


      const fd=
        new FormData();


      fd.append(
        "name",
        $("venueName").value.trim()
      );

      fd.append(
        "city",
        $("venueCity").value.trim()
      );

      fd.append(
        "country",
        $("venueCountry").value.trim()
      );

      fd.append(
        "address",
        $("venueAddress").value.trim()
      );

      fd.append(
        "seatMapImage",
        mapFile
      );

      fd.append(
        "seatData",
        JSON.stringify(seats)
      );


      const d=
        await apiForm(
          "/admin/venues",
          fd
        );


      showMessage(
        $("venueMsg"),
        d.message||
        "Venue saved and seat map imported.",
        "success"
      );


      e.currentTarget.reset();

      await loadAdmin();


    }catch(x){

      showMessage(
        $("venueMsg"),
        x.message,
        "error"
      );

    }finally{

      b.disabled=false;

    }

  }
);


$("eventForm")?.addEventListener(
  "submit",
  async e=>{

    e.preventDefault();

    const b=
      e.currentTarget.querySelector(
        "button"
      );

    b.disabled=true;

    try{

      const d=
        await api(
          "/admin/events",
          {
            method:"POST",

            body:JSON.stringify({

              venueId:
                Number(
                  $("venueId").value
                ),

              title:
                $("title")
                  .value
                  .trim(),

              artist:
                $("artist")
                  .value
                  .trim(),

              date:
                $("date").value,

              time:
                $("time").value,

              currency:
                $("currency")
                  .value
                  .trim()
                  .toUpperCase(),

              image:
                $("image")
                  .value
                  .trim(),

              description:
                $("description")
                  .value
                  .trim()

            })
          }
        );


      showMessage(
        $("eventMsg"),
        d.message||
        "Event created successfully using the venue seat map.",
        "success"
      );


      e.currentTarget.reset();

      $("currency").value="NGN";

      await loadAdmin();


    }catch(x){

      showMessage(
        $("eventMsg"),
        x.message,
        "error"
      );

    }finally{

      b.disabled=false;

    }

  }
);


$("freeForm")?.addEventListener(
  "submit",
  async e=>{

    e.preventDefault();

    const b=
      e.currentTarget.querySelector(
        "button"
      );

    b.disabled=true;

    try{

      const d=
        await api(
          "/admin/free-ticket",
          {
            method:"POST",

            body:JSON.stringify({

              userEmail:
                $("freeEmail")
                  .value
                  .trim()
                  .toLowerCase(),

              ticketId:
                Number(
                  $("freeTicket").value
                )

            })
          }
        );


      showMessage(
        $("freeMsg"),
        d.message||
        "Free ticket issued.",
        "success"
      );


      await loadAdmin();


    }catch(x){

      showMessage(
        $("freeMsg"),
        x.message,
        "error"
      );

    }finally{

      b.disabled=false;

    }

  }
);
