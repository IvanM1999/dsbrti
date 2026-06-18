function getToken() {
   return localStorage.getItem("token");
}

async function api(path, method = "GET", body = null) {
   const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
      method,
      headers: {
         "apikey": SUPABASE_KEY,
         "Authorization": "Bearer " + getToken(),
         "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : null
   });
   
   return res.json();
}