// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });
  
  if (error) return alert(error.message);
  
  window.location.href = "index.html";
}

// REGISTER
async function register() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  
  const { error } = await supabase.auth.signUp({
    email,
    password: senha
  });
  
  if (error) return alert(error.message);
  
  alert("Conta criada");
}

// PERFIS
async function criarPerfil() {
  const nome = document.getElementById("nome").value;
  const user = await getUser();
  
  await supabase.from("profiles").insert({
    user_id: user.id,
    name: nome
  });
  
  carregarPerfis();
}

async function carregarPerfis() {
  const { data } = await supabase.from("profiles").select("*");
  renderPerfis(data);
}

// ADMIN
async function isAdmin() {
  const user = await getUser();
  
  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  return !!data;
}

async function carregarAdmin() {
  if (!(await isAdmin())) {
    alert("Sem acesso");
    window.location.href = "index.html";
    return;
  }
  
  const { data } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false });
  
  const div = document.getElementById("adminLogs");
  div.innerHTML = "";
  
  data.forEach(l => {
    div.innerHTML += `
      <div class="card">
        🔥 ${l.action}
      </div>
    `;
  });
}