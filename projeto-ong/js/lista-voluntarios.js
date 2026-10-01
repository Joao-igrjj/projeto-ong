/* ==========================================================
   lista-voluntarios.js - EXIBE O HISTÓRICO DE CADASTROS
   Lê pelo serviço voluntarios.js e desenha com templates.js.
   ========================================================== */

import { montar } from './templates.js';
import { formatarData } from './datas.js';
import { listarVoluntarios, limparVoluntarios } from './voluntarios.js';

export function renderizarVoluntarios(raiz) {
    const secao = raiz.querySelector('#voluntarios');
    if (!secao) return;                                  // página sem a lista

    const lista = listarVoluntarios();                   // string -> array
    secao.hidden = lista.length === 0;                   // sem histórico: seção escondida

    secao.querySelector('#voluntarios-lista').replaceChildren(
        ...lista.map((v) => montar('tpl-voluntario', {
            nome: v.nome,
            detalhes: `Tel: ${v.telefone} | CEP: ${v.cep} | Cadastro em ${formatarData(v.data)}`
        }))
    );
}

// Botão "Limpar lista" (delegação, pois o botão é criado dinamicamente)
export function iniciarLista(raiz) {
    document.addEventListener('click', (evento) => {
        if (!evento.target.closest('#limpar-voluntarios')) return;
        limparVoluntarios();
        renderizarVoluntarios(raiz);
    });
}
