// Provider central de estado do jogo. Todas as telas leem e escrevem o estado
// através deste Context, em vez de cada uma acessar o localStorage por conta
// própria — é exatamente essa centralização que evita bugs como os do
// projeto anterior (mensagem duplicada, campos com nomes diferentes entre telas).

import { createContext, useContext, useState, useCallback } from 'react';
import { carregarJogo, salvarJogo, criarNovoEstado, apagarJogoSalvo } from './saveSystem';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [estado, setEstado] = useState(() => carregarJogo());

  const iniciarNovaCarreira = useCallback((parametros) => {
    const novoEstado = criarNovoEstado(parametros);
    const salvo = salvarJogo(novoEstado);
    setEstado(salvo);
    return salvo;
  }, []);

  const atualizarEstado = useCallback((atualizador) => {
    setEstado((atual) => {
      const proximo = typeof atualizador === 'function' ? atualizador(atual) : atualizador;
      return salvarJogo(proximo);
    });
  }, []);

  const encerrarCarreira = useCallback(() => {
    apagarJogoSalvo();
    setEstado(null);
  }, []);

  const valor = {
    estado,
    temJogoSalvo: estado !== null,
    iniciarNovaCarreira,
    atualizarEstado,
    encerrarCarreira,
  };

  return <GameContext.Provider value={valor}>{children}</GameContext.Provider>;
}

export function useGame() {
  const contexto = useContext(GameContext);
  if (contexto === null) {
    throw new Error('useGame precisa ser usado dentro de um GameProvider');
  }
  return contexto;
}
