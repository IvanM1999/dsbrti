// ================= CONEXÃO =================
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ================= PROTEÇÃO =================
async function proteger(){
  const { data } = await supabase.auth.getUser();

  if(!data.user){
    window.location.href = "login.html";
  }
}

// Só protege páginas internas
if(
  window.location.pathname.includes("index") ||
  window.location.pathname.includes("dashboard")
){
  proteger();
}

// ================= LOGIN =================
async function login(){
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if(error){
    alert("Erro: " + error.message);
  } else {
    window.location.href = "index.html";
  }
}

// ================= REGISTRO =================
async function registrar(){
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const { error } = await supabase.auth.signUp({
    email,
    password: senha
  });

  if(error){
    alert(error.message);
  } else {
    alert("Conta criada! Agora faça login.");
  }
}

// ================= LOGOUT =================
async function logout(){
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

// ================= LOG =================
async function log(action, metadata = {}){
  const user = await supabase.auth.getUser();

  if(!user.data.user) return;

  await supabase.from("logs").insert({
    user_id: user.data.user.id,
    action,
    metadata
  });
}

// ================= CRIAR PERFIL =================
async function criarPerfil(){
  const user = await supabase.auth.getUser();

  const name = document.getElementById("name").value;
  const area = document.getElementById("area").value;
  const desc = document.getElementById("desc").value;

  if(!name){
    alert("Nome obrigatório");
    return;
  }

  await supabase.from("profiles").insert({
    user_id: user.data.user.id,
    name,
    area,
    description: desc,
    image: "https://i.pravatar.cc/150?u=" + name
  });

  await log("CREATE_PROFILE", { name });

  carregarPerfis();
}

// ================= LISTAR PERFIS =================
async function carregarPerfis(){
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if(error){
    console.error(error);
    return;
  }

  const lista = document.getElementById("lista");
  if(!lista) return;

  lista.innerHTML = "";

  data.forEach(p => {
    lista.innerHTML += `
      <div class="card">
        <img src="${p.image}" width="50">
        <b>${p.name}</b><br>
        ${p.area || ""}<br>
        ${p.description || ""}
      </div>
    `;
  });
}

// ================= DASHBOARD =================
async function carregarDashboard(){

  const { data: perfis } = await supabase.from("profiles").select("*");

  const { data: logs } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  document.getElementById("totalPerfis").innerHTML =
    "👥 Total de Perfis: " + (perfis?.length || 0);

  document.getElementById("totalLogs").innerHTML =
    "📊 Ações recentes: " + (logs?.length || 0);

  const logsDiv = document.getElementById("logs");
  if(!logsDiv) return;

  logsDiv.innerHTML = "";

  logs.forEach(l => {
    logsDiv.innerHTML += `
      <div class="card">
        🔥 ${l.action}<br>
        🕒 ${new Date(l.created_at).toLocaleString()}
      </div>
    `;
  });
}

// ================= AUTO LOAD =================
if(window.location.pathname.includes("index")){
  carregarPerfis();
}

if(window.location.pathname.includes("dashboard")){
  carregarDashboard();
}