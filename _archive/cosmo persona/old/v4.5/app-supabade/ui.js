function renderPerfis(lista) {
   const div = document.getElementById("lista");
   div.innerHTML = "";
   
   lista.forEach(p => {
      div.innerHTML += `
      <div class="card">
        👤 ${p.name}
      </div>
    `;
   });
}