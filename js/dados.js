/* ==========================================================
   FONTE DE DADOS
   Cada array abaixo alimenta um template do index.html.
   Para incluir um novo projeto, alerta ou campo basta
   acrescentar um objeto: nenhum HTML precisa ser reescrito.
   ========================================================== */

export const projetos = [
    {
        id: 'alimentacao',
        titulo: 'Alimento que Acolhe.',
        status: 'Projeto ativo',
        classeStatus: 'badge-ativo',
        descricao: 'Arrecadamos alimentos e montamos cestas básicas para diversas famílias em situação de vulnerabilidade.'
    },
    {
        id: 'educacao',
        titulo: 'Educação Salva.',
        status: 'Novo projeto',
        classeStatus: 'badge-novo',
        descricao: 'Arrecadamos materiais escolares e montamos kits de estudo para as crianças que necessitam.'
    },
    {
        id: 'trabalho',
        titulo: 'Trabalho para Todos.',
        status: 'Em andamento',
        classeStatus: 'badge-concluido',
        descricao: 'Temos parcerias com diversas empresas, que buscam novos talentos para se juntar às mais variadas organizações, conectando quem precisa com uma oportunidade justa.'
    }
];

export const alertas = [
    {
        tipo: 'alerta-sucesso',
        papel: 'status',
        titulo: 'Sucesso!',
        texto: 'A ação foi realizada com sucesso.'
    },
    {
        tipo: 'alerta-info',
        papel: 'status',
        titulo: 'Informação:',
        texto: 'Confira as oportunidades disponíveis para voluntários.'
    },
    {
        tipo: 'alerta-aviso',
        papel: 'alert',
        titulo: 'Atenção:',
        texto: 'Algumas vagas possuem número limitado de participantes.'
    }
];

// msgFormato: aviso quando o valor não bate com o pattern; msgSucesso: confirmação quando está tudo certo
// String.raw evita ter de duplicar as barras invertidas das expressões regulares
export const campos = [
    {
        id: 'nome',
        rotulo: 'Nome completo:',
        tipo: 'text',
        placeholder: 'Fulano da silva sauro',
        msgSucesso: 'Nome válido!'
    },
    {
        id: 'telefone',
        rotulo: 'Telefone:',
        tipo: 'tel',
        placeholder: '(00) 00000-0000',
        padrao: String.raw`\([0-9]{2}\) [0-9]{5}-[0-9]{4}`,
        msgFormato: 'Use o formato (00) 00000-0000.',
        msgSucesso: 'Telefone válido!'
    },
    {
        id: 'cpf',
        rotulo: 'CPF:',
        tipo: 'text',
        placeholder: '000.000.000-00',
        padrao: String.raw`[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}`,
        msgFormato: 'Use o formato 000.000.000-00.',
        msgSucesso: 'CPF válido!'
    },
    {
        id: 'cep',
        rotulo: 'CEP:',
        tipo: 'text',
        placeholder: '00000-000',
        padrao: '[0-9]{5}-[0-9]{3}',
        msgFormato: 'Use o formato 00000-000.',
        msgSucesso: 'CEP válido!'
    }
];
