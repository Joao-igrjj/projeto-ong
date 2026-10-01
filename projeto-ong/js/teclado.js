/* ==========================================================
   teclado.js - ATALHOS DE TECLADO
   Não sabe o que "fechar" significa: recebe um callback.
   ========================================================== */

export function iniciarTeclado({ aoEscape }) {
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
            aoEscape();
            return;
        }

        // Enter/Espaço em um rótulo focado (menu, "Quero saber mais", "Entendi") equivale a clicar
        if ((evento.key === 'Enter' || evento.key === ' ') && evento.target.matches('label[role="button"]')) {
            evento.preventDefault();                     // Espaço não rola a página
            evento.target.click();                       // o clique no rótulo alterna o checkbox
        }
    });
}
