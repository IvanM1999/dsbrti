let profiles = [];

async function loadProfiles(){
  profiles = await api("profiles");
  render();
}

function render(){
  const grid = document.getElementById("grid");
  grid.innerHTML = profiles.map(p=>`
    <div class="card">
      <img src="${p.image}" width="80">
      <h3>${p.name}</h3>
      <p>${p.area}</p>
      <button onclick="like('${p.id}')">❤️ ${p.likes}</button>
    </div>
  `).join("");
}

async function addProfile(){
  const name = document.getElementById("name").value;
  const area = document.getElementById("area").value;
  const desc = document.getElementById("desc").value;
  const file = document.getElementById("img").files[0];

  let image = "";

  if(file){
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_PRESET);

    const up = await fetch(CLOUDINARY_URL, {
      method:"POST",
      body: form
    });

    const data = await up.json();
    image = data.secure_url;
  }

  await api("profiles","POST",{
    name, area, desc, image, likes:0
  });

  await log("create_profile");
  loadProfiles();
}

async function like(id){
  const p = profiles.find(x=>x.id===id);
  await api("profiles?id=eq."+id,"PATCH",{ likes: p.likes + 1 });
  await log("like");
  loadProfiles();
}

async function log(action){
  await api("logs","POST",{
    action,
    user_agent:navigator.userAgent
  });
}

loadProfiles();<tag>
   Tab to edit
</tag>