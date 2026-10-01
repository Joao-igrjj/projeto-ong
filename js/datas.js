/* ==========================================================
   datas.js - ADAPTADOR DA BIBLIOTECA EXTERNA (Day.js)
   Único arquivo que conhece o global "dayjs" (carregado por CDN
   no index.html). Se o CDN falhar, cai no recurso nativo.
   ========================================================== */

const dj = globalThis.dayjs;

if (dj) {
    dj.extend(globalThis.dayjs_plugin_relativeTime);   // habilita .fromNow()
    dj.locale('pt-br');
}

export function formatarData(iso) {
    if (!dj) return new Date(iso).toLocaleString('pt-BR');
    const data = dj(iso);
    return `${data.format('DD/MM/YYYY [às] HH:mm')} (${data.fromNow()})`;
}
