/* ==========================================================
   validacao.js - REGRAS DE VALIDAÇÃO
   Só decide se um valor é válido e devolve a mensagem de erro.
   Não altera a tela (isso é papel do formulario.js).
   ========================================================== */

export function cpfValido(valor) {
    const d = valor.replace(/\D/g, '').split('').map(Number);
    if (d.length !== 11 || d.every((n) => n === d[0])) return false;   // 111.111.111-11 etc. não existem
    const digitoVerificador = (qtd) => {
        const soma = d.slice(0, qtd).reduce((acc, n, i) => acc + n * (qtd + 1 - i), 0);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };
    return digitoVerificador(9) === d[9] && digitoVerificador(10) === d[10];
}

const regrasDeConteudo = {
    nome(valor) {
        const nome = valor.trim();
        if (/\d/.test(nome)) return 'O nome não pode conter números.';
        if (nome.split(/\s+/).length < 2) return 'Informe nome e sobrenome.';
        return '';
    },
    telefone(valor) {
        if (Number(valor.slice(1, 3)) < 11) return 'DDD inválido.';
        if (valor[5] !== '9') return 'O celular deve começar com 9 após o DDD.';
        return '';
    },
    cpf(valor) {
        return cpfValido(valor) ? '' : 'CPF inválido: confira os números.';
    },
    cep(valor) {
        return valor === '00000-000' ? 'CEP inexistente.' : '';
    }
};

// "config" é a definição do campo (dados.js), recebida por parâmetro: este módulo não importa os dados.
// Critérios, nesta ordem: 1) vazio  2) formato (pattern)  3) regra de conteúdo do campo
export function mensagemDeErro(campo, config) {
    if (campo.validity.valueMissing || !campo.value.trim()) return 'Campo obrigatório.';
    if (campo.validity.patternMismatch) return config.msgFormato;
    return regrasDeConteudo[campo.id]?.(campo.value) ?? '';
}
