async function getUser() {
   const { data } = await supabase.auth.getUser();
   return data.user;
}

async function requireAuth() {
   const user = await getUser();
   
   if (!user) {
      window.location.href = "login.html";
   }
}

async function logout() {
   await supabase.auth.signOut();
   window.location.href = "login.html";
}