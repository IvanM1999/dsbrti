import { UI, Card, Button, Input, Feedback } from './ui.js';
import { Engine } from './engine.js';
import { Exercises } from './exercises.js';
import { Progress } from './progress.js';

const App = {
   
   current: null,
   
   init() {
      this.newExercise();
      this.updateStats();
   },
   
   newExercise() {
      const ex = Exercises[Math.floor(Math.random() * Exercises.length)];
      this.current = ex.generate();
      
      UI.mount("exerciseContainer",
         Card("Exercício", `
        <p>${this.current.question}</p>

        ${Input("answer", "Resposta")}

        ${Button("Verificar", "check()")}
        ${Button("Novo", "newExercise()", "secondary")}

        <div id="feedback"></div>
      `)
      );
   },
   
   check() {
      const user = parseFloat(document.getElementById("answer").value);
      const correct = this.current.solve(Engine);
      
      const ok = Math.abs(user - correct) < 0.1;
      
      Progress.update(this.current.type, ok);
      
      UI.mount("feedback",
         Feedback(
            ok ?
            "✔ Correto!" :
            `✖ Errado<br>${this.current.formula}`,
            ok ? "ok" : "err"
         )
      );
      
      this.updateStats();
   },
   
   updateStats() {
      const p = Progress.load();
      
      UI.mount("statsContainer", `
      <div class="card">
        <div class="title">Aproveitamento</div>
        <h2>${Progress.accuracy()}%</h2>
      </div>

      <div class="card">
        <div class="title">Total</div>
        <h2>${p.total}</h2>
      </div>

      <div class="card">
        <div class="title">Acertos</div>
        <h2>${p.correct}</h2>
      </div>
    `);
   }
   
};

// GLOBAL (para funcionar com onclick)
window.newExercise = () => App.newExercise();
window.check = () => App.check();

App.init();