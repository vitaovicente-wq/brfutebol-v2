// Sistema central de save. Diferente do projeto anterior (onde cada tela lia
// e gravava pedaços do localStorage separadamente, causando bugs de
// inconsistência), aqui existe um único formato de estado e duas funções
// (salvarJogo / carregarJogo) que são a ÚNICA porta de entrada para persistência.

const SAVE_KEY = 'brfutebol_v2_save';
const VERSAO_SAVE = 1;

export function criarNovoEstado({ clubeId, ligaId, treinadorNome, temporada, calendario, clubes }) {
  return {
    versao: VERSAO_SAVE,
    criadoEm: new Date().toISOString(),

    treinador: {
      nome: treinadorNome,
      moral: 'bairro', // bairro | estadual | nacional | continental | mundial
      historico: [],   // [{ clubeId, dataInicio, dataFim, motivoSaida }]
      titulos: [],      // [{ competicaoId, temporada }]
      scoutTemporadas: [], // [{ temporada, jogos, vitorias, empates, derrotas, posicaoFinal, golsPro, golsContra }]
    },

    carreira: {
      clubeAtualId: clubeId,
      ligaAtualId: ligaId,
      dataAtual: temporada.dataInicio,
      temporadaAtual: temporada,
    },

    mundo: {
      // Snapshot mutável dos clubes (orçamento, elenco etc. evoluem a partir daqui;
      // os dados estáticos de worldData/clubsData são só o "molde" inicial).
      clubes,
    },

    competicoes: {
      [ligaId]: {
        calendario,
        classificacao: calendario.length ? null : [], // calculada sob demanda por standingsEngine
      },
    },

    financas: {
      historico: [],
    },

    mensagens: [],

    config: {
      ultimaAtualizacao: new Date().toISOString(),
    },
  };
}

export function salvarJogo(estado) {
  try {
    const atualizado = {
      ...estado,
      config: { ...estado.config, ultimaAtualizacao: new Date().toISOString() },
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(atualizado));
    return atualizado;
  } catch (erro) {
    console.error('Falha ao salvar o jogo:', erro);
    return estado;
  }
}

export function carregarJogo() {
  try {
    const bruto = localStorage.getItem(SAVE_KEY);
    if (!bruto) return null;
    const estado = JSON.parse(bruto);
    if (estado.versao !== VERSAO_SAVE) {
      console.warn('Save de versão antiga encontrado — pode haver incompatibilidades.');
    }
    return estado;
  } catch (erro) {
    console.error('Falha ao carregar o jogo:', erro);
    return null;
  }
}

export function existeJogoSalvo() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function apagarJogoSalvo() {
  localStorage.removeItem(SAVE_KEY);
}
