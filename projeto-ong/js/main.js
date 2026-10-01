/* ==========================================================
   main.js - PONTO DE ENTRADA (composição)
   Único arquivo que conhece todos os módulos. Aqui eles são
   conectados por callbacks; entre si, quase não se importam.
   ========================================================== */

import { projetos, alertas, campos } from './dados.js';
import { preencherListas } from './templates.js';
import { iniciarRouter } from './router.js';
import { iniciarMenu } from './menu.js';
import { fecharModal } from './modal.js';
import { iniciarTeclado } from './teclado.js';
import { iniciarFormulario, restaurarRascunho } from './formulario.js';
import { iniciarLista, renderizarVoluntarios } from './lista-voluntarios.js';

// Tabela de rotas: cada rota aponta para um <template> do index.html
const rotas = {
    '':       { template: 'tpl-inicio',   titulo: 'ONG Mãos que Transformam' },
    projetos: { template: 'tpl-projetos', titulo: 'Projetos' },
    cadastro: { template: 'tpl-cadastro', titulo: 'Seja um voluntário' }
};
const naoEncontrada = { template: 'tpl-404', titulo: 'Página não encontrada' };

// Cada [data-lista="nome"] do HTML recebe um componente por item do array correspondente
const listas = {
    projetos: { itens: projetos, template: 'tpl-projeto' },
    alertas:  { itens: alertas,  template: 'tpl-alerta' },
    campos:   { itens: campos,   template: 'tpl-campo' }
};

const app = document.getElementById('app');
const menu = iniciarMenu();

iniciarTeclado({
    aoEscape() {
        menu.fechar();
        fecharModal();
    }
});

iniciarFormulario({ aoCadastrar: () => renderizarVoluntarios(app) });
iniciarLista(app);

iniciarRouter({
    app,
    rotas,
    naoEncontrada,
    aoRenderizar(raiz) {
        preencherListas(raiz, listas);                   // projetos, alertas e campos
        restaurarRascunho(raiz);                         // localStorage -> campos do formulário
        renderizarVoluntarios(raiz);                     // localStorage -> lista de cadastros
        menu.fechar();                                   // fecha o menu mobile após navegar
    }
});
