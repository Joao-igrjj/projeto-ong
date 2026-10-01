/* ==========================================================
   mascaras.js - MÁSCARAS DE DIGITAÇÃO (funções puras, sem DOM)
   ========================================================== */

// # = um dígito
export const mascaras = {
    telefone: '(##) #####-####',
    cpf: '###.###.###-##',
    cep: '#####-###'
};

export function aplicarMascara(valor, modelo) {
    const digitos = valor.replace(/\D/g, '');            // descarta tudo que não é número
    let saida = '';
    let i = 0;
    for (const caractere of modelo) {
        if (i >= digitos.length) break;                  // acabaram os dígitos: para (permite apagar)
        saida += caractere === '#' ? digitos[i++] : caractere;
    }
    return saida;
}
