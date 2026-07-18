async function loadDashboard() {
   const logs = await api("logs");
   const profiles = await api("profiles");
   
   document.getElementById("users").textContent = new Set(logs.map(l => l.user_id)).size;
   document.getElementById("actions").textContent = logs.length;
   document.getElementById("profiles").textContent = profiles.length;
   
   const activity = document.getElementById("activity");
   
   activity.innerHTML = logs.slice(-20).reverse().map(l => `
    <div class="card">
      <b>${l.action}</b><br>
      ${l.user_agent}<br>
      ${new Date(l.created_at).toLocaleString()}
    </div>
  `).join("");
}

loadDashboard();