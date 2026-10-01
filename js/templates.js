/* ==========================================================
   templates.js - SISTEMA DE TEMPLATES (genérico)
   Clona <template> do HTML e o preenche com um objeto.
   Não conhece rotas, formulários nem storage.
   ========================================================== */

// data-campo="chave"   -> textContent recebe dados[chave] (texto puro, sem risco de HTML injetado)
// data-classe="chave"  -> adiciona a classe CSS guardada em dados[chave]
// data-attr="a:chave"  -> setAttribute('a', dados[chave]); vários separados por vírgula
export function montar(idTemplate, dados) {
    const clone = document.getElementById(idTemplate).content.cloneNode(true);

    clone.querySelectorAll('[data-campo], [data-classe], [data-attr]').forEach((el) => {
        if (el.dataset.campo) {
            el.textContent = dados[el.dataset.campo] ?? '';
        }
        if (el.dataset.classe && dados[el.dataset.classe]) {
            el.classList.add(dados[el.dataset.classe]);
        }
        if (el.dataset.attr) {
            el.dataset.attr.split(',').forEach((par) => {
                const [atributo, chave] = par.split(':');
                if (dados[chave] !== undefined) el.setAttribute(atributo, dados[chave]);
            });
        }
    });
    return clone;
}

// "listas" chega por parâmetro: { nome: { itens: [...], template: 'tpl-id' } }
export function preencherListas(raiz, listas) {
    raiz.querySelectorAll('[data-lista]').forEach((container) => {
        const lista = listas[container.dataset.lista];
        if (!lista) return;                              // data-lista sem dados: ignora
        container.append(...lista.itens.map((item) => montar(lista.template, item)));
    });
}
