/* ==========================================================
   storage.js - CAMADA DE ACESSO AO WEB STORAGE (genérica)
   Não conhece voluntários, formulário nem DOM. Só sabe
   converter: JS <-> string JSON <-> localStorage.
   ========================================================== */

export const Armazenamento = {
    // GET + PARSE. Devolve "padrao" se a chave não existe, o JSON está corrompido ou o storage bloqueado
    ler(chave, padrao) {
        try {
            const texto = localStorage.getItem(chave);   // string ou null
            return texto === null ? padrao : JSON.parse(texto);
        } catch (erro) {
            console.warn('Falha ao ler', chave, erro);
            return padrao;
        }
    },

    // STRINGIFY + SET. Devolve false se a cota estiver cheia ou o storage bloqueado
    gravar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (erro) {
            console.warn('Falha ao gravar', chave, erro);
            return false;
        }
    },

    remover(chave) {
        try { localStorage.removeItem(chave); } catch (erro) { /* ignora */ }
    }
};
