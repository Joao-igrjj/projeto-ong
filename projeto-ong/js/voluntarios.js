/* ==========================================================
   voluntarios.js - REGRAS DE NEGÓCIO DE PERSISTÊNCIA
   Sabe quais chaves existem e o formato dos dados de um
   voluntário. Não usa DOM: quem chama decide como exibir.
   ========================================================== */

import { Armazenamento } from './storage.js';

const CHAVE_VOLUNTARIOS = 'mqt:voluntarios';   // array de objetos
const CHAVE_RASCUNHO = 'mqt:rascunho';         // objeto { nome, telefone, cep }

// CPF fica de fora de propósito: o localStorage não é criptografado
export const CAMPOS_RASCUNHO = ['nome', 'telefone', 'cep'];

export function listarVoluntarios() {
    return Armazenamento.ler(CHAVE_VOLUNTARIOS, []);
}

export function adicionarVoluntario({ nome, telefone, cep }) {
    const lista = listarVoluntarios();
    lista.push({
        id: Date.now(),
        nome: nome.trim(),
        telefone,
        cep,
        data: new Date().toISOString()
    });
    return Armazenamento.gravar(CHAVE_VOLUNTARIOS, lista);
}

export function limparVoluntarios() {
    Armazenamento.remover(CHAVE_VOLUNTARIOS);
}

export function lerRascunho() {
    return Armazenamento.ler(CHAVE_RASCUNHO, {});
}

// Filtra pelos campos permitidos: mesmo que alguém passe o CPF, ele não é gravado
export function salvarRascunho(dados) {
    const rascunho = {};
    CAMPOS_RASCUNHO.forEach((id) => {
        if (id in dados) rascunho[id] = dados[id];
    });
    return Armazenamento.gravar(CHAVE_RASCUNHO, rascunho);
}

export function limparRascunho() {
    Armazenamento.remover(CHAVE_RASCUNHO);
}
