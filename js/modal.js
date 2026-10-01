/* ==========================================================
   modal.js - MODAL FEITO COM CHECKBOX (só o que o JS precisa fazer)
   ========================================================== */

export function fecharModal() {
    const modal = document.getElementById('abrir-modal');
    if (modal) modal.checked = false;
}
