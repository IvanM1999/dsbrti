function getToken() {
   return localStorage.getItem("token");
}

async function apiFetch(url, options = {}) {
   options.headers = options.headers || {};
   options.headers["Authorization"] = "Bearer " + getToken();
   
   return fetch(url, options);
}