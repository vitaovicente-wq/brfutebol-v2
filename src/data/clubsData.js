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

const NOMES_GOL = ['Weverton','Cássio','Santos','Tadeu','João Paulo','Muriel','Rafael','Lucas Perri','Everson','Bento'];
const NOMES_DEF = ['Gustavo Gómez','Luan','Nino','David Braz','Léo Ortiz','Lucas Verissimo','Bremer','Rodrigo Caio','Ruan','Manoel','Fagner','Marcos Rocha','Mayke','Rafael Ramos','Piquerez','Guilherme Arana','Sasha','Reinaldo'];
const NOMES_MEI = ['Raphael Veiga','Gabriel Menino','Zé Rafael','Danilo','Patrick de Paula','Gustavo Scarpa','Everton Ribeiro','Gerson','Thiago Maia','Bruno Henrique','De Arrascaeta','Victor Hugo','Claudinho','Cuéllar','Rinaldo','Lucas Lima','Ronaldo','Edenilson'];
const NOMES_ATA = ['Endrick','Rony','Dudu','Flaco López','Gabigol','Pedro','Hulk','Ademir','Cano','Luciano','Calleri','Vitor Roque','Deyverson','Wellington Nem','Arthur Cabral','Yuri Alberto','Júnior Santos','Tiquinho Soares'];

function nomePorPosicao(pos, usado) {
  let pool;
  if (pos === 'GOL') pool = NOMES_GOL;
  else if (['ZAG','LD','LE'].includes(pos)) pool = NOMES_DEF;
  else if (['VOL','MEI'].includes(pos)) pool = NOMES_MEI;
  else pool = NOMES_ATA;
  const disponiveis = pool.filter(n => !usado.has(n));
  if (disponiveis.length === 0) return `${pos} ${Math.floor(Math.random()*99)+1}`;
  const nome = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  usado.add(nome);
  return nome;
}

function criarElencoBase(clubeNome, forcaBase) {
  const posicoes = ['GOL', 'ZAG', 'ZAG', 'LD', 'LE', 'VOL', 'VOL', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA', 'ATA',
    'GOL', 'ZAG', 'LD', 'MEI', 'ATA'];
  const usado = new Set();
  return posicoes.map((pos, i) => {
    const variacao = Math.floor(Math.random() * 11) - 5;
    const ovr = Math.max(45, Math.min(94, forcaBase + variacao));
    return {
      id: `${clubeNome.toLowerCase().replace(/\s+/g, '-')}-j${i + 1}`,
      nome: nomePorPosicao(pos, usado),
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
