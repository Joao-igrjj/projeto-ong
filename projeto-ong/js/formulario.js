/* ==========================================================
   formulario.js - INTERFACE DO FORMULÁRIO DE CADASTRO
   Liga eventos (focusout, input, submit) às regras de
   validacao.js, mascaras.js e à persistência de voluntarios.js.
   ========================================================== */

import { campos } from './dados.js';
import { montar } from './templates.js';
import { aplicarMascara, mascaras } from './mascaras.js';
import { mensagemDeErro } from './validacao.js';
import {
    CAMPOS_RASCUNHO, lerRascunho, salvarRascunho, limparRascunho, adicionarVoluntario
} from './voluntarios.js';

const configDoCampo = (id) => campos.find((c) => c.id === id);

// Manipulação condicional do DOM: classe visual, atributo de acessibilidade e mensagem abaixo do campo
function mostrarResultado(campo, erro) {
    const mensagem = campo.parentElement.querySelector('.mensagem-campo');
    mensagem.id ||= `${campo.id}-msg`;
    campo.setAttribute('aria-describedby', mensagem.id);

    campo.classList.toggle('campo-erro', Boolean(erro));
    campo.classList.toggle('campo-ok', !erro);
    campo.setAttribute('aria-invalid', String(Boolean(erro)));

    mensagem.classList.toggle('mensagem-erro', Boolean(erro));
    mensagem.classList.toggle('mensagem-sucesso', !erro);
    mensagem.textContent = erro || configDoCampo(campo.id).msgSucesso;
}

function limparResultado(campo) {
    campo.classList.remove('campo-erro', 'campo-ok');
    campo.removeAttribute('aria-invalid');
    campo.parentElement.querySelector('.mensagem-campo').textContent = '';
}

// Verifica um campo e mostra o resultado; devolve true se está válido
function validarCampo(campo) {
    const erro = mensagemDeErro(campo, configDoCampo(campo.id));
    mostrarResultado(campo, erro);
    return !erro;
}

// Chamada a cada renderização da página: devolve ao formulário o rascunho salvo (string -> objeto)
export function restaurarRascunho(raiz) {
    const form = raiz.querySelector('form');
    if (!form) return;                                   // só a página de cadastro tem formulário

    const rascunho = lerRascunho();
    CAMPOS_RASCUNHO.forEach((id) => {
        if (rascunho[id]) form.elements[id].value = rascunho[id];
    });
}

// "aoCadastrar" é um callback: o formulário avisa que houve um cadastro, sem saber quem se interessa
export function iniciarFormulario({ aoCadastrar }) {

    // Ao SAIR do campo (focusout): primeira verificação com erro visível
    document.addEventListener('focusout', (evento) => {
        const campo = evento.target;
        if (!campo.matches('#app form input')) return;
        campo.dataset.tocado = 'sim';
        validarCampo(campo);
    });

    // INPUT: máscara + rascunho + validação em tempo real (delegação: os campos são criados dinamicamente)
    document.addEventListener('input', (evento) => {
        const campo = evento.target;
        if (!campo.matches('#app form input')) return;

        if (Object.hasOwn(mascaras, campo.id)) {
            campo.value = aplicarMascara(campo.value, mascaras[campo.id]);
        }

        // localStorage: a cada tecla, grava o rascunho (já com a máscara aplicada)
        if (CAMPOS_RASCUNHO.includes(campo.id)) {
            salvarRascunho(Object.fromEntries(new FormData(campo.form)));
        }

        // O erro só aparece depois que o campo foi "visitado"; o sucesso aparece assim que fica correto
        const erro = mensagemDeErro(campo, configDoCampo(campo.id));
        if (campo.dataset.tocado || !erro) {
            mostrarResultado(campo, erro);
        } else {
            limparResultado(campo);
        }
    });

    // SUBMIT: tratado pela SPA, sem recarregar a página
    document.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const form = evento.target;
        form.querySelector('.alerta')?.remove();         // evita empilhar avisos repetidos

        // Verifica TODOS os campos de uma vez, para o usuário ver cada problema
        const invalidos = [...form.querySelectorAll('input')].filter((campo) => {
            campo.dataset.tocado = 'sim';
            return !validarCampo(campo);
        });

        if (invalidos.length > 0) {
            form.append(montar('tpl-alerta', {
                tipo: 'alerta-aviso',
                papel: 'alert',
                titulo: 'Atenção:',
                texto: invalidos.length === 1
                    ? 'corrija 1 campo antes de enviar.'
                    : `corrija ${invalidos.length} campos antes de enviar.`
            }));
            invalidos[0].focus();
            return;
        }

        const dados = Object.fromEntries(new FormData(form));   // { nome, telefone, cpf, cep }
        const primeiroNome = dados.nome.trim().split(/\s+/)[0];

        adicionarVoluntario(dados);                      // localStorage (o CPF não é gravado)
        limparRascunho();                                // enviou: o rascunho não é mais necessário

        form.append(montar('tpl-alerta', {
            tipo: 'alerta-sucesso',
            papel: 'status',
            titulo: 'Sucesso!',
            texto: `Cadastro recebido, ${primeiroNome}! Obrigado por ser voluntário.`
        }));
        form.reset();
        form.querySelectorAll('input').forEach((campo) => {
            limparResultado(campo);
            delete campo.dataset.tocado;
        });
        aoCadastrar();
    });
}
