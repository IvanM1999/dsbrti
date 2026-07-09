document.addEventListener('DOMContentLoaded', () => {
  const xpChip = document.getElementById('xp-chip');
  const xpBarFill = document.getElementById('xp-bar-fill');
  const levelValue = document.getElementById('level-value');
  const streakValue = document.getElementById('streak-value');
  const nextBadge = document.getElementById('next-badge');
  const rankingPosition = document.getElementById('ranking-position');
  const badgeItems = document.querySelectorAll('.badge-item');
  const blockChecks = document.querySelectorAll('input[data-block]');

  const updateDashboard = () => {
    const checkedBlocks = Array.from(blockChecks).filter((input) => input.checked).length;
    const xp = 120 + checkedBlocks * 80;
    const level = checkedBlocks >= 3 ? 'Nível 3' : checkedBlocks >= 2 ? 'Nível 2' : checkedBlocks >= 1 ? 'Nível 1' : 'Nível 0';
    const streak = checkedBlocks >= 3 ? '3 dias' : checkedBlocks >= 2 ? '2 dias' : checkedBlocks >= 1 ? '1 dia' : '0 dias';
    const unlockedBadges = checkedBlocks >= 1 ? 1 : 0;

    if (xpChip) xpChip.textContent = `${xp} XP`;
    if (xpBarFill) xpBarFill.style.width = `${Math.min(100, checkedBlocks * 33)}%`;
    if (levelValue) levelValue.textContent = level;
    if (streakValue) streakValue.textContent = streak;
    if (nextBadge) nextBadge.textContent = `${Math.min(3, unlockedBadges + checkedBlocks)} / 3`;
    if (rankingPosition) rankingPosition.textContent = checkedBlocks >= 3 ? '#1' : checkedBlocks >= 2 ? '#2' : '#3';

    badgeItems.forEach((badge, index) => {
      const shouldUnlock = index === 0 ? checkedBlocks >= 1 : index === 1 ? checkedBlocks >= 2 : checkedBlocks >= 3;
      badge.classList.toggle('unlocked', shouldUnlock);
    });
  };

  blockChecks.forEach((input) => input.addEventListener('change', updateDashboard));
  updateDashboard();

  const missionCards = document.querySelectorAll('.mission-card');

  missionCards.forEach((card) => {
    const items = card.querySelectorAll('[data-progress-item]');
    const progressFill = card.querySelector('.progress-fill');
    const progressLabel = card.querySelector('.progress-label');

    const updateProgress = () => {
      const checked = Array.from(items).filter((input) => input.checked).length;
      const total = items.length || 1;
      const percent = Math.round((checked / total) * 100);
      if (progressFill) {
        progressFill.style.width = `${percent}%`;
      }
      if (progressLabel) {
        progressLabel.textContent = `${percent}% concluído`;
      }
    };

    items.forEach((input) => input.addEventListener('change', updateProgress));
    updateProgress();
  });

  const quizPage = document.querySelector('.quiz-options');
  if (quizPage) {
    const questions = [
      {
        name: 'q1',
        correct: 'b',
        feedback: 'Correto! O CLP é um controlador lógico programável.'
      },
      {
        name: 'q2',
        correct: 'a',
        feedback: 'Correto! A HMI/IHM mostra estado e recebe comandos do operador.'
      },
      {
        name: 'q3',
        correct: 'b',
        feedback: 'Correto! A bobina representa uma saída ou ação.'
      }
    ];

    questions.forEach((question) => {
      const inputs = document.querySelectorAll(`input[name="${question.name}"]`);
      inputs.forEach((input) => {
        input.addEventListener('change', () => {
          const feedback = document.getElementById(`${question.name}-feedback`);
          if (feedback) {
            feedback.textContent = input.value === question.correct ? question.feedback : 'Quase lá. Revise o conteúdo da aula e tente de novo.';
          }
        });
      });
    });
  }
});
