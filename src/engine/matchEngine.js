// Motor de simulação de partidas. Calcula resultado, eventos (gols, cartões,
// faltas) e estatísticas com base na força dos times e configuração tática.

function forca(elenco) {
  if (!elenco || elenco.length === 0) return 65;
  const titulares = elenco.slice(0, 11);
  return Math.round(titulares.reduce((s, j) => s + j.ovr, 0) / titulares.length);
}

function chancePorMinuto(forcaCasa, forcaFora) {
  // Base: cada time tem ~2.5 gols esperados por jogo em forças iguais
  const total = 2.5;
  const ratioFavor = Math.pow(forcaCasa / forcaFora, 1.5);
  const chanceCasa = (total * ratioFavor) / (1 + ratioFavor);
  const chanceFora = total - chanceCasa;
  return { chanceCasa: chanceCasa / 90, chanceFora: chanceFora / 90 };
}

function sortearNomeGoleador(elenco) {
  const atacantes = elenco.filter(j => ['ATA', 'MEI'].includes(j.posicao));
  const pool = atacantes.length > 0 ? atacantes : elenco;
  const pesos = pool.map(j => j.ovr);
  const total = pesos.reduce((s, p) => s + p, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    rand -= pesos[i];
    if (rand <= 0) return pool[i].nome;
  }
  return pool[pool.length - 1].nome;
}

export function simularPartida(clubeCasa, clubeFora, opcoes = {}) {
  const { elencoTitularesCasa, elencoTitularesFora } = opcoes;
  const elencoCasa = elencoTitularesCasa ?? clubeCasa.elenco ?? [];
  const elencoFora = elencoTitularesFora ?? clubeFora.elenco ?? [];

  const fCasa = forca(elencoCasa);
  const fFora = forca(elencoFora);
  const { chanceCasa, chanceFora } = chancePorMinuto(fCasa, fFora);

  const eventos = [];
  let golsCasa = 0;
  let golsFora = 0;

  for (let min = 1; min <= 90; min++) {
    if (Math.random() < chanceCasa) {
      golsCasa++;
      eventos.push({
        minuto: min,
        tipo: 'gol',
        timeId: clubeCasa.id,
        timeNome: clubeCasa.nome,
        autor: sortearNomeGoleador(elencoCasa),
      });
    }
    if (Math.random() < chanceFora) {
      golsFora++;
      eventos.push({
        minuto: min,
        tipo: 'gol',
        timeId: clubeFora.id,
        timeNome: clubeFora.nome,
        autor: sortearNomeGoleador(elencoFora),
      });
    }
    // Cartão amarelo (~1 por jogo por time)
    if (Math.random() < 1 / 90) {
      eventos.push({ minuto: min, tipo: 'cartao_amarelo', timeId: clubeCasa.id, timeNome: clubeCasa.nome });
    }
    if (Math.random() < 1 / 90) {
      eventos.push({ minuto: min, tipo: 'cartao_amarelo', timeId: clubeFora.id, timeNome: clubeFora.nome });
    }
  }

  eventos.sort((a, b) => a.minuto - b.minuto);

  const capacidade = clubeCasa.estadio?.capacidade ?? 20000;
  const diferencaForca = Math.abs(fCasa - fFora);
  const fatorAtratividade = Math.max(0.3, 1 - diferencaForca / 100);
  const publico = Math.round(capacidade * (0.4 + Math.random() * 0.4) * fatorAtratividade);
  const rendaBruta = publico * 35;

  return {
    placarCasa: golsCasa,
    placarFora: golsFora,
    eventos,
    estatisticas: {
      forcaCasa: fCasa,
      forcaFora: fFora,
      publico,
      rendaBruta,
    },
  };
}

// Simula todos os jogos de uma rodada que ainda não foram jogados pelo usuário.
export function simularRodadaCPU(rodada, clubeUsuarioId, getClubeById) {
  return rodada.jogos.map((jogo) => {
    if (jogo.jogado || jogo.mandanteId === clubeUsuarioId || jogo.visitanteId === clubeUsuarioId) {
      return jogo;
    }
    const casa = getClubeById(jogo.mandanteId);
    const fora = getClubeById(jogo.visitanteId);
    if (!casa || !fora) return jogo;
    const resultado = simularPartida(casa, fora);
    return {
      ...jogo,
      jogado: true,
      placarMandante: resultado.placarCasa,
      placarVisitante: resultado.placarFora,
      eventos: resultado.eventos,
    };
  });
}

// Calcula a tabela de classificação a partir do calendário completo.
export function calcularClassificacao(calendario, timeIds) {
  const tabela = Object.fromEntries(
    timeIds.map((id) => [id, { id, pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, gp: 0, gc: 0 }])
  );

  for (const rodada of calendario) {
    for (const jogo of rodada.jogos) {
      if (!jogo.jogado) continue;
      const m = tabela[jogo.mandanteId];
      const v = tabela[jogo.visitanteId];
      if (!m || !v) continue;
      m.jogos++; v.jogos++;
      m.gp += jogo.placarMandante; m.gc += jogo.placarVisitante;
      v.gp += jogo.placarVisitante; v.gc += jogo.placarMandante;
      if (jogo.placarMandante > jogo.placarVisitante) {
        m.pontos += 3; m.vitorias++;
        v.derrotas++;
      } else if (jogo.placarMandante < jogo.placarVisitante) {
        v.pontos += 3; v.vitorias++;
        m.derrotas++;
      } else {
        m.pontos++; m.empates++;
        v.pontos++; v.empates++;
      }
    }
  }

  return Object.values(tabela).sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
    return (b.gp - b.gc) - (a.gp - a.gc);
  });
}

// Extrai artilharia a partir dos eventos de todas as partidas.
export function calcularArtilharia(calendario) {
  const contagem = {};
  for (const rodada of calendario) {
    for (const jogo of rodada.jogos) {
      for (const evt of jogo.eventos) {
        if (evt.tipo !== 'gol') continue;
        const key = `${evt.autor}__${evt.timeId}`;
        contagem[key] = contagem[key] ?? { nome: evt.autor, timeId: evt.timeId, gols: 0 };
        contagem[key].gols++;
      }
    }
  }
  return Object.values(contagem).sort((a, b) => b.gols - a.gols).slice(0, 20);
}
