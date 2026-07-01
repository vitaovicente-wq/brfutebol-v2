// Gerador de confrontos de campeonato (turno e returno) usando o algoritmo
// round-robin clássico, com cada rodada associada a uma data real do calendário.

import { gerarDatasRodadas } from './calendarEngine';

// Algoritmo round-robin: para N times, gera N-1 rodadas do turno (todos jogam
// contra todos uma vez). O returno espelha o turno com mando de campo invertido.
function gerarRoundRobin(times) {
  const lista = [...times];
  if (lista.length % 2 !== 0) lista.push(null); // bye se número ímpar de times

  const numRodadas = lista.length - 1;
  const metade = lista.length / 2;
  const rodadas = [];

  let elenco = [...lista];
  for (let r = 0; r < numRodadas; r++) {
    const confrontosRodada = [];
    for (let i = 0; i < metade; i++) {
      const mandante = elenco[i];
      const visitante = elenco[elenco.length - 1 - i];
      if (mandante && visitante) {
        confrontosRodada.push(r % 2 === 0
          ? { mandante, visitante }
          : { mandante: visitante, visitante: mandante });
      }
    }
    rodadas.push(confrontosRodada);
    // Rotaciona mantendo o primeiro time fixo (método padrão de round-robin)
    const fixo = elenco[0];
    const resto = elenco.slice(1);
    resto.unshift(resto.pop());
    elenco = [fixo, ...resto];
  }
  return rodadas;
}

export function gerarCalendarioLiga(timeIds, temporada) {
  const turno = gerarRoundRobin(timeIds);
  const returno = turno.map((rodada) =>
    rodada.map((confronto) => ({ mandante: confronto.visitante, visitante: confronto.mandante }))
  );
  const todasRodadas = [...turno, ...returno];
  const datas = gerarDatasRodadas(temporada, todasRodadas.length);

  return todasRodadas.map((confrontos, indice) => ({
    numero: indice + 1,
    data: datas[indice],
    jogos: confrontos.map((c) => ({
      mandanteId: c.mandante,
      visitanteId: c.visitante,
      jogado: false,
      placarMandante: null,
      placarVisitante: null,
      eventos: [],
    })),
  }));
}

// Retorna a próxima rodada ainda não jogada que contenha um jogo do clube informado.
export function getProximoJogo(calendario, clubeId) {
  for (const rodada of calendario) {
    const jogo = rodada.jogos.find(
      (j) => !j.jogado && (j.mandanteId === clubeId || j.visitanteId === clubeId)
    );
    if (jogo) return { rodadaNumero: rodada.numero, data: rodada.data, jogo };
  }
  return null;
}

// Retorna todas as rodadas já concluídas até (e incluindo) a data informada.
export function getRodadasAteData(calendario, data) {
  return calendario.filter((rodada) => rodada.jogos.every((j) => j.jogado));
}
