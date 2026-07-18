const API = "http://localhost:3000";

async function login() {
   const user = prompt("User:");
   const pass = prompt("Pass:");
   
   const res = await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass })
   });
   
   const data = await res.json();
   
   localStorage.setItem("token", data.accessToken);
}