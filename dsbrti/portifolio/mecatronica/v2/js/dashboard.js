import { Progress } from './progress.js';

function load() {
  const p = Progress.load();
  const acc = parseFloat(Progress.accuracy());

  document.getElementById("accMain").innerText = acc + "%";
  document.getElementById("totalMain").innerText = p.total;
  document.getElementById("correctMain").innerText = p.correct;

  document.getElementById("progressFill").style.width = acc + "%";
}

load();