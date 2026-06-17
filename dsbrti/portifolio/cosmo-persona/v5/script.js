// Animação suave da engrenagem
const gear = document.querySelector(".gear");

setInterval(() => {
  gear.style.transform = `rotate(${Date.now() / 50}deg)`;
}, 30);

// Efeito neon pulsante no texto
const neonText = document.querySelector(".neon");

setInterval(() => {
  neonText.classList.toggle("pulse");
}, 1200);

// Hover com brilho nos cards
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    card.classList.add("glow");
  });
  card.addEventListener("mouseleave", () => {
    card.classList.remove("glow");
  });
});

// Efeito de brilho suave no CTA
const cta = document.querySelector(".cta-final h2");

setInterval(() => {
  cta.classList.toggle("pulse-cta");
}, 1500);

// Hover suave nos botões do footer
document.querySelectorAll(".footer-links a").forEach(link => {
  link.addEventListener("mouseenter", () => link.classList.add("footer-hover"));
  link.addEventListener("mouseleave", () => link.classList.remove("footer-hover"));
});