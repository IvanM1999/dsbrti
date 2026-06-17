document.addEventListener('DOMContentLoaded', () => {
    const hamburguer = document.getElementById('hamburguer');
    const menu = document.getElementById('menu');

    // Alternar menu hamburguer no mobile
    hamburguer.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    // Fechar o menu ao clicar em qualquer link dele
    document.querySelectorAll('#menu a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
        });
    });

    // Controle de envio do Formulário de Contato
    const formContato = document.getElementById('formContato');
    formContato.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const mensagem = document.getElementById('mensagem').value;

        // Aqui você pode integrar com o Formspree, EmailJS ou seu próprio backend Spring Boot
        console.log('Tentativa de envio de:', { nome, email, mensagem });
        
        alert(`Obrigado pelo contato, ${nome}! Sua mensagem foi simulada com sucesso.`);
        formContato.reset();
    });
});
