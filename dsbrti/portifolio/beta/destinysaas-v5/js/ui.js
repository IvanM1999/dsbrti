/**
 * Motor de Interface e Feedback Visual (Semana 2)
 */

const UI = {
    // 1. Mostrar Alerta Flutuante (Toast)
    toast(type, message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `glass p-4 rounded-2xl shadow-xl flex items-center justify-between transition-all duration-300 transform translate-y-2 opacity-0 border-l-4 ${
            type === 'success' ? 'border-teal-500' : type === 'error' ? 'border-red-500' : 'border-yellow-500'
        }`;

        // Ícone dinâmico
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';
        const colorClass = type === 'success' ? 'text-teal-400' : type === 'error' ? 'text-red-400' : 'text-yellow-400';

        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="font-bold ${colorClass}">${icon}</span>
                <span class="text-sm font-medium text-slate-200">${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white text-xs ml-4">✕</button>
        `;

        container.appendChild(toast);

        // Animação de Entrada
        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);

        // Auto-destruição após 4 segundos
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // 2. Processador de Erros de API (Conexão direta com Semana 1)
    handleAPIError(errorResponse) {
        const errorMap = {
            'AUTH_FAILED': 'Acesso negado. E-mail ou senha incorretos.',
            'UNAUTHORIZED': 'Sessão expirada. Por favor, entre novamente.',
            'FORBIDDEN': 'Esta função exige o Plano Pro ou superior.',
            'INVALID_INPUT': 'Verifique as informações digitadas e tente de novo.',
            'SLUG_TAKEN': 'Esse link de perfil já está em uso por outro utilizador.',
            'DB_ERROR': 'O banco de dados está instável. Tente em alguns minutos.'
        };

        const code = errorResponse.code || 'UNKNOWN';
        const message = errorMap[code] || errorResponse.message || 'Ocorreu um erro inesperado.';
        
        this.toast('error', message);
    },

    // 3. Renderizador de Grade de Cursos (Simulação EVG)
    renderCursos(cursosList) {
        const grid = document.getElementById('cursos-grid');
        if (!grid) return;

        if (cursosList.length === 0) {
            grid.innerHTML = `<p class="col-span-full text-center text-slate-400">Nenhum curso encontrado nesta área.</p>`;
            return;
        }

        grid.innerHTML = cursosList.map(curso => `
            <div class="glass rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 group">
                <div class="space-y-3">
                    <span class="text-xs font-semibold px-2.5 py-1 bg-teal-500/10 text-teal-400 rounded-full">${curso.category}</span>
                    <h3 class="text-lg font-bold group-hover:text-teal-400 transition-colors">${curso.title}</h3>
                    <p class="text-slate-400 text-xs line-clamp-2">${curso.description || 'Domine conceitos e aplique de forma prática com certificado.'}</p>
                </div>
                <div class="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span class="text-xs text-slate-500">⏱ ${curso.duration || '20h'}</span>
                    <button onclick="acessarCurso('${curso.id}')" class="px-4 py-2 bg-white/5 hover:bg-teal-500 hover:text-slate-900 rounded-xl text-xs font-bold transition">
                        Acessar Aula
                    </button>
                </div>
            </div>
        `).join('');
    }
};
