/* ==========================================================
   router.js - ROTEADOR POR HASH (#/rota)
   Troca o conteúdo do <main> pelo template da rota. Não conhece
   formulário, storage nem menu: avisa quem interessar pelo
   callback "aoRenderizar".
   ========================================================== */

export function iniciarRouter({ app, rotas, naoEncontrada, aoRenderizar }) {

    // "#/projetos/educacao" -> { rota: 'projetos', secao: 'educacao' }
    function lerRota() {
        const [rota = '', secao = ''] = location.hash.replace(/^#\/?/, '').split('/');
        return { rota, secao };
    }

    // Sinaliza no menu qual página está aberta (aria-current)
    function marcarLinkAtivo(rota) {
        document.querySelectorAll('a[data-link]').forEach((link) => {
            if (link.getAttribute('href') === '#/' + rota) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function renderizar() {
        const { rota, secao } = lerRota();
        const pagina = Object.hasOwn(rotas, rota) ? rotas[rota] : naoEncontrada;

        const modelo = document.getElementById(pagina.template);
        app.replaceChildren(modelo.content.cloneNode(true));
        aoRenderizar(app);                               // quem usa o roteador completa a página
        document.title = pagina.titulo;
        marcarLinkAtivo(rota);

        const alvo = secao ? document.getElementById(secao) : null;
        if (alvo) {
            alvo.scrollIntoView({ behavior: 'smooth' }); // ex.: #/projetos/educacao
        } else {
            window.scrollTo(0, 0);
        }
        app.focus({ preventScroll: true });              // leitores de tela percebem a troca
    }

    // Interceptação: clique em qualquer link com data-link (delegação de evento)
    document.addEventListener('click', (evento) => {
        const link = evento.target.closest('a[data-link]');
        if (!link) return;

        evento.preventDefault();
        const destino = link.getAttribute('href');
        if (destino === location.hash) {
            renderizar();                                // mesma rota: 'hashchange' não dispararia
        } else {
            location.hash = destino;
        }
    });

    window.addEventListener('hashchange', renderizar);   // voltar/avançar e URL digitada
    renderizar();                                        // primeira carga
}
