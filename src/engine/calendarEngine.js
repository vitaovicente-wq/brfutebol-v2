// Motor de calendário real. Substitui o antigo sistema de "rodadas isoladas"
// por uma linha do tempo contínua de dias, permitindo janelas de transferência,
// prazos de lesão e eventos narrativos ligados a datas específicas.

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Cria um objeto de data interna do jogo a partir de ano/mês(1-12)/dia.
export function criarData(ano, mes, dia) {
  return { ano, mes, dia };
}

// Converte para um número de dias absolutos (para comparações e somas) usando
// um calendário simplificado de 30 dias por mês — suficiente para uma temporada
// de futebol e evita lidar com anos bissextos / meses de tamanho irregular.
const DIAS_POR_MES = 30;
const MESES_POR_ANO = 12;

export function dataParaDiasAbsolutos(data) {
  return (data.ano * MESES_POR_ANO + (data.mes - 1)) * DIAS_POR_MES + (data.dia - 1);
}

export function diasAbsolutosParaData(diasAbs) {
  const dia = (diasAbs % DIAS_POR_MES) + 1;
  const totalMeses = Math.floor(diasAbs / DIAS_POR_MES);
  const mes = (totalMeses % MESES_POR_ANO) + 1;
  const ano = Math.floor(totalMeses / MESES_POR_ANO);
  return criarData(ano, mes, dia);
}

export function adicionarDias(data, quantidade) {
  return diasAbsolutosParaData(dataParaDiasAbsolutos(data) + quantidade);
}

export function diferencaEmDias(dataA, dataB) {
  return dataParaDiasAbsolutos(dataB) - dataParaDiasAbsolutos(dataA);
}

// Retorna -1 se dataA < dataB, 1 se dataA > dataB, 0 se iguais.
export function compararDatas(dataA, dataB) {
  const absA = dataParaDiasAbsolutos(dataA);
  const absB = dataParaDiasAbsolutos(dataB);
  if (absA < absB) return -1;
  if (absA > absB) return 1;
  return 0;
}

export function getDiaDaSemana(data) {
  const diasAbs = dataParaDiasAbsolutos(data);
  const indice = ((diasAbs % 7) + 7) % 7;
  return DIAS_SEMANA[indice];
}

export function formatarData(data, opcoes = {}) {
  const { comDiaSemana = false, curto = false } = opcoes;
  const mesNome = curto ? MESES[data.mes - 1].slice(0, 3) : MESES[data.mes - 1];
  const base = `${data.dia} de ${mesNome} de ${data.ano}`;
  if (comDiaSemana) {
    return `${getDiaDaSemana(data)}, ${base}`;
  }
  return base;
}

// Estrutura de uma temporada: data de início, data de fim, e marcos importantes
// (abertura/fechamento de janela de transferências, início de férias).
export function criarTemporada(anoInicio) {
  const inicio = criarData(anoInicio, 2, 1);
  const fim = criarData(anoInicio, 12, 15);
  return {
    anoInicio,
    dataInicio: inicio,
    dataFim: fim,
    janelaTransferencias: {
      abertura1: criarData(anoInicio, 1, 1),
      fechamento1: criarData(anoInicio, 2, 5),
      abertura2: criarData(anoInicio, 7, 1),
      fechamento2: criarData(anoInicio, 7, 20),
    },
    feriasInicio: criarData(anoInicio, 12, 16),
    feriasFim: criarData(anoInicio + 1, 1, 31),
  };
}

export function janelaTransferenciasAberta(data, temporada) {
  const { janelaTransferencias: j } = temporada;
  const janela1 = compararDatas(data, j.abertura1) >= 0 && compararDatas(data, j.fechamento1) <= 0;
  const janela2 = compararDatas(data, j.abertura2) >= 0 && compararDatas(data, j.fechamento2) <= 0;
  return janela1 || janela2;
}

// Distribui N rodadas de jogos ao longo da temporada, uma por semana (a cada 7 dias),
// começando na dataInicio. Usado pelo gerador de calendário de competição.
export function gerarDatasRodadas(temporada, numRodadas) {
  const datas = [];
  let cursor = temporada.dataInicio;
  for (let i = 0; i < numRodadas; i++) {
    datas.push(cursor);
    cursor = adicionarDias(cursor, 7);
  }
  return datas;
}

export const MESES_NOMES = MESES;
export const DIAS_SEMANA_NOMES = DIAS_SEMANA;
