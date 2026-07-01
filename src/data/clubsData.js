// Dados de clubes por liga. Cada clube tem um "brasao" gerado (cores, iniciais)
// em vez de logo real — evita qualquer questão de direitos de imagem e
// pode ser customizado depois pelo Editor de Universo.

function brasao(cor1, cor2, iniciais) {
  return { cor1, cor2, iniciais };
}

// Paleta de cores reutilizável para gerar brasões variados sem repetir.
const PALETA = [
  ['#1D9E75', '#0F6E56'],
  ['#185FA5', '#0C447C'],
  ['#A32D2D', '#791F1F'],
  ['#854F0B', '#633806'],
  ['#534AB7', '#3C3489'],
  ['#993C1D', '#712B13'],
  ['#3B6D11', '#27500A'],
  ['#993556', '#72243E'],
  ['#5F5E5A', '#444441'],
  ['#0C447C', '#042C53'],
];

function gerarBrasao(nome, indice) {
  const [cor1, cor2] = PALETA[indice % PALETA.length];
  const iniciais = nome
    .split(' ')
    .filter((w) => w.length > 2 || w === w.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || nome.slice(0, 2).toUpperCase();
  return brasao(cor1, cor2, iniciais);
}

function criarElencoBase(clubeNome, forcaBase) {
  // Elenco placeholder: 18 jogadores com atributos variando perto da força base do clube.
  // Será substituído por dados reais conforme cada liga é detalhada, ou pelo Editor de Universo.
  const posicoes = ['GOL', 'ZAG', 'ZAG', 'LD', 'LE', 'VOL', 'VOL', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA', 'ATA',
    'GOL', 'ZAG', 'LD', 'MEI', 'ATA'];
  return posicoes.map((pos, i) => {
    const variacao = Math.floor(Math.random() * 11) - 5;
    const ovr = Math.max(45, Math.min(94, forcaBase + variacao));
    return {
      id: `${clubeNome.toLowerCase().replace(/\s+/g, '-')}-j${i + 1}`,
      nome: `Jogador ${i + 1}`,
      posicao: pos,
      idade: 18 + Math.floor(Math.random() * 18),
      ovr,
      atributos: {
        pac: Math.max(30, Math.min(99, ovr + Math.floor(Math.random() * 10) - 5)),
        sho: Math.max(30, Math.min(99, ovr + Math.floor(Math.random() * 10) - 5)),
        pas: Math.max(30, Math.min(99, ovr + Math.floor(Math.random() * 10) - 5)),
        dri: Math.max(30, Math.min(99, ovr + Math.floor(Math.random() * 10) - 5)),
        def: Math.max(30, Math.min(99, ovr + Math.floor(Math.random() * 10) - 5)),
        phy: Math.max(30, Math.min(99, ovr + Math.floor(Math.random() * 10) - 5)),
      },
      moral: 70,
      condicao: 100,
      contrato: { duracaoAnos: 2, salarioMensal: Math.round(ovr * 800) },
    };
  });
}

// Lista-base de nomes de clubes da Série A do Brasil (campeonato totalmente populado como referência).
const NOMES_SERIE_A_BR = [
  'Corinthians', 'Palmeiras', 'São Paulo', 'Santos', 'Flamengo', 'Fluminense',
  'Vasco da Gama', 'Botafogo', 'Grêmio', 'Internacional', 'Atlético Mineiro',
  'Cruzeiro', 'Bahia', 'Vitória', 'Sport Recife', 'Ceará', 'Fortaleza',
  'Athletico Paranaense', 'Coritiba', 'Goiás',
];

function gerarClubesParaLiga(ligaId, nomes, forcaMedia) {
  return nomes.map((nome, i) => ({
    id: `${ligaId}-${nome.toLowerCase().replace(/\s+/g, '-')}`,
    nome,
    ligaId,
    brasao: gerarBrasao(nome, i),
    orcamentoInicial: Math.round((forcaMedia / 70) * (30 + Math.random() * 40) * 1_000_000),
    objetivoTemporada: i < 3 ? 'Título' : i < 8 ? 'Vaga continental' : i >= nomes.length - 4 ? 'Evitar rebaixamento' : 'Meio de tabela',
    estadio: {
      nome: `Arena ${nome.split(' ')[0]}`,
      capacidade: 20000 + Math.floor(Math.random() * 40000),
    },
    elenco: criarElencoBase(nome, forcaMedia + (i < nomes.length / 2 ? 3 : -3)),
  }));
}

export const CLUBES_POR_LIGA = {
  'br-serie-a': gerarClubesParaLiga('br-serie-a', NOMES_SERIE_A_BR, 75),
};

export function getClubesPorLiga(ligaId) {
  return CLUBES_POR_LIGA[ligaId] || [];
}

export function getClubeById(clubeId) {
  for (const lista of Object.values(CLUBES_POR_LIGA)) {
    const clube = lista.find((c) => c.id === clubeId);
    if (clube) return clube;
  }
  return null;
}
