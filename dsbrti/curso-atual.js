(() => {
  const STORAGE_KEY = 'dsbrti_curso_atual';

  const cursos = {
    'clp-base': {
      id: 'clp-base',
      nome: 'Curso CLP Base',
      descricao: 'Aulas completas do zero com lógica, fluxogramas, Ladder e revisão para prova.',
      link: 'senai/clp/index.html',
      badge: 'Base'
    },
    'clp-beta': {
      id: 'clp-beta',
      nome: 'Curso CLP Beta Premium',
      descricao: 'Jornada gamificada com XP, badges, desafios, quiz e módulos premium.',
      link: 'senai/beta-clp/index.html',
      badge: 'Premium'
    }
  };

  const obterCursoAtual = () => {
    try {
      const valor = localStorage.getItem(STORAGE_KEY);
      return valor && cursos[valor] ? valor : 'clp-base';
    } catch (error) {
      console.warn('Não foi possível ler o curso atual.', error);
      return 'clp-base';
    }
  };

  const salvarCursoAtual = (id) => {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (error) {
      console.warn('Não foi possível salvar o curso atual.', error);
    }
  };

  const atualizarInterface = () => {
    const cursoAtual = cursos[obterCursoAtual()] || cursos['clp-base'];

    document.querySelectorAll('[data-current-course-label]').forEach((elemento) => {
      elemento.textContent = cursoAtual.nome;
    });

    document.querySelectorAll('[data-current-course-description]').forEach((elemento) => {
      elemento.textContent = cursoAtual.descricao;
    });

    document.querySelectorAll('[data-current-course-link]').forEach((elemento) => {
      elemento.setAttribute('href', cursoAtual.link);
      elemento.textContent = `Abrir ${cursoAtual.nome}`;
    });

    document.querySelectorAll('[data-current-course-badge]').forEach((elemento) => {
      elemento.textContent = `Curso atual: ${cursoAtual.nome}`;
    });

    document.querySelectorAll('[data-course-option]').forEach((elemento) => {
      const ativo = elemento.getAttribute('data-course-option') === cursoAtual.id;
      elemento.classList.toggle('active', ativo);
      elemento.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
  };

  const inicializar = () => {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-course-option]').forEach((elemento) => {
        elemento.addEventListener('click', (event) => {
          const id = elemento.getAttribute('data-course-option');
          if (!id || !cursos[id]) return;

          salvarCursoAtual(id);
          atualizarInterface();

          if (elemento.getAttribute('href')) {
            return true;
          }
        });
      });

      atualizarInterface();
    });
  };

  window.DSBRTICursos = { cursos, obterCursoAtual, salvarCursoAtual };
  inicializar();
})();
