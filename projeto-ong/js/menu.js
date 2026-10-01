/* ==========================================================
   menu.js - MENU HAMBÚRGUER (checkbox + acessibilidade)
   ========================================================== */

export function iniciarMenu() {
    const controle = document.getElementById('menu-controle');
    const botao = document.querySelector('.menu-botao');

    // Mantém aria-expanded igual ao estado real do menu
    const atualizarAria = () => botao.setAttribute('aria-expanded', String(controle.checked));

    controle.addEventListener('change', atualizarAria);

    return {
        fechar() {
            controle.checked = false;
            atualizarAria();
        }
    };
}
