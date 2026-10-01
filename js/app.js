/* ==========================================================
   SPA - Mãos que Transformam
   Roteador por hash (#/rota) + renderização via DOM na <main id="app">
   ========================================================== */

// 1. Tabela de rotas: cada rota aponta para um <template> do index.html
const rotas = {
    '':       { template: 'tpl-inicio',   titulo: 'ONG Mãos que Transformam' },
    projetos: { template: 'tpl-projetos', titulo: 'Projetos' },
    cadastro: { template: 'tpl-cadastro', titulo: 'Seja um voluntário' }
};

const paginaNaoEncontrada = { template: 'tpl-404', titulo: 'Página não encontrada' };

// 1.1 BIBLIOTECA EXTERNA (Day.js, carregada por CDN no index.html)
// Configuração feita uma única vez. O "typeof" evita erro se o CDN falhar (offline, bloqueio etc.)
if (typeof dayjs !== 'undefined') {
    dayjs.extend(dayjs_plugin_relativeTime);             // habilita .fromNow() ("há 2 minutos")
    dayjs.locale('pt-br');                               // meses e textos em português
}

// Formata a data de cadastro; se o Day.js não carregou, cai no recurso nativo (o site não quebra)
function formatarData(iso) {
    if (typeof dayjs === 'undefined') return new Date(iso).toLocaleString('pt-BR');
    const data = dayjs(iso);
    return `${data.format('DD/MM/YYYY [às] HH:mm')} (${data.fromNow()})`;
}

const app = document.getElementById('app');                    // div principal
const menuControle = document.getElementById('menu-controle'); // checkbox do hambúrguer
const menuBotao = document.querySelector('.menu-botao');       // rótulo com o ícone das 3 linhas

// Mantém o atributo aria-expanded do botão igual ao estado real do menu
function atualizarAriaMenu() {
    menuBotao.setAttribute('aria-expanded', String(menuControle.checked));
}

// 2. SISTEMA DE TEMPLATES
// montar(): clona um <template> e o preenche com os dados de um objeto.
//   data-campo="chave"   -> textContent recebe dados[chave] (texto puro, sem risco de HTML injetado)
//   data-classe="chave"  -> adiciona a classe CSS guardada em dados[chave]
//   data-attr="a:chave"  -> setAttribute('a', dados[chave]); vários separados por vírgula
function montar(idTemplate, dados) {
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

// Cada [data-lista="nome"] do HTML recebe um componente por item do array correspondente
const listas = {
    projetos: { itens: projetos, template: 'tpl-projeto' },
    alertas:  { itens: alertas,  template: 'tpl-alerta' },
    campos:   { itens: campos,   template: 'tpl-campo' }
};

function preencherListas(raiz) {
    raiz.querySelectorAll('[data-lista]').forEach((container) => {
        const { itens, template } = listas[container.dataset.lista];
        container.append(...itens.map((item) => montar(template, item)));
    });
}

// 2.1 PERSISTÊNCIA (localStorage): funções que usam js/storage.js
// Grava o rascunho: objeto { nome, telefone, cep } -> string JSON
function salvarRascunho(form) {
    const rascunho = {};
    CAMPOS_RASCUNHO.forEach((id) => { rascunho[id] = form.elements[id].value; });
    Armazenamento.gravar(CHAVES.rascunho, rascunho);
}

// Lê o histórico salvo e desenha o formulário/lista como o usuário deixou
function restaurarInterface() {
    const form = app.querySelector('form');
    if (!form) return;                                   // só a página de cadastro tem formulário

    const rascunho = Armazenamento.ler(CHAVES.rascunho, {});   // string -> objeto
    CAMPOS_RASCUNHO.forEach((id) => {
        if (rascunho[id]) form.elements[id].value = rascunho[id];
    });
    renderizarVoluntarios();
}

// Lê o array de voluntários e cria um componente (tpl-voluntario) por item
function renderizarVoluntarios() {
    const secao = document.getElementById('voluntarios');
    if (!secao) return;

    const lista = Armazenamento.ler(CHAVES.voluntarios, []);   // string -> array
    secao.hidden = lista.length === 0;                   // sem histórico: seção escondida

    secao.querySelector('#voluntarios-lista').replaceChildren(
        ...lista.map((v) => montar('tpl-voluntario', {
            nome: v.nome,
            detalhes: `Tel: ${v.telefone} | CEP: ${v.cep} | Cadastro em ${formatarData(v.data)}`
        }))
    );
}

// Botão "Limpar lista": apaga a chave e redesenha (delegação, pois o botão é criado dinamicamente)
document.addEventListener('click', (evento) => {
    if (!evento.target.closest('#limpar-voluntarios')) return;
    Armazenamento.remover(CHAVES.voluntarios);
    renderizarVoluntarios();
});

// 3. Lê a URL e separa rota e seção. Ex.: "#/projetos/educacao" -> ["projetos", "educacao"]
function lerRota() {
    const [rota = '', secao = ''] = location.hash.replace(/^#\/?/, '').split('/');
    return { rota, secao };
}

// 4. Renderiza: troca o conteúdo da <main> pelo template da rota atual
function renderizar() {
    const { rota, secao } = lerRota();
    const pagina = Object.hasOwn(rotas, rota) ? rotas[rota] : paginaNaoEncontrada;

    const modelo = document.getElementById(pagina.template);
    app.replaceChildren(modelo.content.cloneNode(true)); // clona o template e substitui o conteúdo antigo
    preencherListas(app);                                // gera projetos, alertas e campos a partir dos dados
    restaurarInterface();                                // devolve rascunho e lista salvos no localStorage
    document.title = pagina.titulo;

    menuControle.checked = false;                        // fecha o menu mobile após navegar
    atualizarAriaMenu();
    marcarLinkAtivo(rota);

    const alvo = secao ? document.getElementById(secao) : null;
    if (alvo) {
        alvo.scrollIntoView({ behavior: 'smooth' });     // ex.: #/projetos/educacao
    } else {
        window.scrollTo(0, 0);                           // página nova começa no topo
    }
    app.focus({ preventScroll: true });                  // leitores de tela percebem a troca
}

// 5. Sinaliza no menu qual página está aberta (aria-current)
function marcarLinkAtivo(rota) {
    document.querySelectorAll('a[data-link]').forEach((link) => {
        if (link.getAttribute('href') === '#/' + rota) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// 6. Interceptação: captura o clique em qualquer link com data-link (delegação de evento)
document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[data-link]');
    if (!link) return;                                   // clique em outra coisa: ignora

    evento.preventDefault();                             // bloqueia a navegação padrão do navegador
    const destino = link.getAttribute('href');

    if (destino === location.hash) {
        renderizar();                                    // mesma rota: 'hashchange' não dispararia
    } else {
        location.hash = destino;                         // atualiza a URL, cria histórico e dispara 'hashchange'
    }
});

// 7. Botões voltar/avançar do navegador (e URL digitada) também renderizam
window.addEventListener('hashchange', renderizar);

// 8. VERIFICAÇÃO DE CONSISTÊNCIA DOS CAMPOS
// Regras de conteúdo, além de "vazio" e "formato". Cada uma devolve a mensagem de erro, ou '' se estiver ok.
function cpfValido(valor) {
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

// Critérios avaliados, nesta ordem: 1) vazio  2) formato (pattern)  3) regra de conteúdo do campo
function mensagemDeErro(campo) {
    if (campo.validity.valueMissing || !campo.value.trim()) return 'Campo obrigatório.';
    if (campo.validity.patternMismatch) return campos.find((c) => c.id === campo.id).msgFormato;
    return regrasDeConteudo[campo.id]?.(campo.value) ?? '';
}

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
    mensagem.textContent = erro || campos.find((c) => c.id === campo.id).msgSucesso;
}

function limparResultado(campo) {
    campo.classList.remove('campo-erro', 'campo-ok');
    campo.removeAttribute('aria-invalid');
    campo.parentElement.querySelector('.mensagem-campo').textContent = '';
}

// Verifica um campo e mostra o resultado; devolve true se está válido
function validarCampo(campo) {
    const erro = mensagemDeErro(campo);
    mostrarResultado(campo, erro);
    return !erro;
}

// Ao SAIR do campo (focusout): primeira verificação com erro visível
document.addEventListener('focusout', (evento) => {
    const campo = evento.target;
    if (!campo.matches('#app form input')) return;
    campo.dataset.tocado = 'sim';
    validarCampo(campo);
});

// 9. SUBMIT: o formulário é tratado pela SPA, sem recarregar a página
document.addEventListener('submit', (evento) => {
    evento.preventDefault();                             // impede o envio/recarregamento padrão
    const form = evento.target;
    form.querySelector('.alerta')?.remove();             // evita empilhar avisos repetidos

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
        invalidos[0].focus();                            // leva o usuário ao primeiro problema
        return;                                          // não envia
    }

    const dados = Object.fromEntries(new FormData(form)); // lê os campos: { nome, telefone, cpf, cep }
    const primeiroNome = dados.nome.trim().split(/\s+/)[0];

    // localStorage: lê o array salvo, acrescenta o novo voluntário e grava tudo de volta (sem o CPF)
    const voluntarios = Armazenamento.ler(CHAVES.voluntarios, []);
    voluntarios.push({
        id: Date.now(),
        nome: dados.nome.trim(),
        telefone: dados.telefone,
        cep: dados.cep,
        data: new Date().toISOString()
    });
    Armazenamento.gravar(CHAVES.voluntarios, voluntarios);
    Armazenamento.remover(CHAVES.rascunho);              // enviou: o rascunho não é mais necessário

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
    renderizarVoluntarios();                             // atualiza a lista com o novo cadastro
});

// 10. INPUT: máscara aplicada enquanto o usuário digita (# = um dígito)
const mascaras = {
    telefone: '(##) #####-####',
    cpf: '###.###.###-##',
    cep: '#####-###'
};

function aplicarMascara(valor, modelo) {
    const digitos = valor.replace(/\D/g, '');            // descarta tudo que não é número
    let saida = '';
    let i = 0;
    for (const caractere of modelo) {
        if (i >= digitos.length) break;                  // acabaram os dígitos: para (permite apagar)
        saida += caractere === '#' ? digitos[i++] : caractere;
    }
    return saida;
}

// Delegação: os campos são criados dinamicamente, então o listener fica no document
document.addEventListener('input', (evento) => {
    const campo = evento.target;
    if (!campo.matches('#app form input')) return;

    if (Object.hasOwn(mascaras, campo.id)) {             // telefone, CPF e CEP: aplica a máscara
        campo.value = aplicarMascara(campo.value, mascaras[campo.id]);
    }

    // localStorage: a cada tecla, grava o rascunho (já com a máscara aplicada)
    if (CAMPOS_RASCUNHO.includes(campo.id)) salvarRascunho(campo.form);

    // Tempo real: o erro só aparece depois que o campo foi "visitado" (evita gritar na 1ª tecla),
    // mas a confirmação de sucesso aparece assim que o valor fica correto
    const erro = mensagemDeErro(campo);
    if (campo.dataset.tocado || !erro) {
        mostrarResultado(campo, erro);
    } else {
        limparResultado(campo);
    }
});

// 11. CHANGE: o checkbox do menu mudou (aberto/fechado) -> atualiza a acessibilidade
menuControle.addEventListener('change', atualizarAriaMenu);

// 12. KEYDOWN: teclado para menu e modal
document.addEventListener('keydown', (evento) => {
    // Esc fecha o menu e o modal
    if (evento.key === 'Escape') {
        menuControle.checked = false;
        atualizarAriaMenu();
        const modal = document.getElementById('abrir-modal');
        if (modal) modal.checked = false;
        return;
    }

    // Enter/Espaço em um rótulo focado (menu, "Quero saber mais", "Entendi") equivale a clicar
    if ((evento.key === 'Enter' || evento.key === ' ') && evento.target.matches('label[role="button"]')) {
        evento.preventDefault();                         // Espaço não rola a página
        evento.target.click();                           // o clique no rótulo alterna o checkbox
    }
});

// 13. Primeira carga da página
renderizar();
