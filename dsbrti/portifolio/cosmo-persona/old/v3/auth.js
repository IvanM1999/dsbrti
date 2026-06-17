async function login() {
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
   
   const res = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "apikey": SUPABASE_KEY
      },
      body: JSON.stringify({ email, password })
   });
   
   const data = await res.json();
   
   if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      window.location = "index.html";
   } else {
      alert("Erro login");
   }
}