import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { getClubeById } from '../data/clubsData';
import { getProximoJogo } from '../engine/fixtureEngine';
import { simularPartida, simularRodadaCPU } from '../engine/matchEngine';
import { adicionarDias } from '../engine/calendarEngine';
import ClubCrest from '../components/ClubCrest';

const DELAY_MS = 300;

export default function MatchScreen() {
  const { estado, atualizarEstado } = useGame();
  const navigate = useNavigate();

  const ligaId = estado.carreira.ligaAtualId;
  const competicao = estado.competicoes[ligaId];
  const clubeUsuarioId = estado.carreira.clubeAtualId;
  const clubeUsuario = getClubeById(clubeUsuarioId);

  const proximoJogo = getProximoJogo(competicao.calendario, clubeUsuarioId);
  const jogo = proximoJogo?.jogo;
  const ehMandante = jogo?.mandanteId === clubeUsuarioId;
  const adversarioId = ehMandante ? jogo?.visitanteId : jogo?.mandanteId;
  const adversario = getClubeById(adversarioId);

  const [fase, setFase] = useState('pre'); // pre | jogando | fim
  const [minutoAtual, setMinutoAtual] = useState(0);
  const [eventosVisiveis, setEventosVisiveis] = useState([]);
  const [placar, setPlacar] = useState({ casa: 0, fora: 0 });
  const [resultado, setResultado] = useState(null);
  const feedRef = useRef(null);

  function iniciarJogo() {
    const res = simularPartida(
      ehMandante ? clubeUsuario : adversario,
      ehMandante ? adversario : clubeUsuario
    );
    setResultado(res);
    setFase('jogando');
  }

  useEffect(() => {
    if (fase !== 'jogando' || !resultado) return;
    if (minutoAtual > 90) {
      setFase('fim');
      return;
    }

    const timer = setTimeout(() => {
      const novosEventos = resultado.eventos.filter(e => e.minuto === minutoAtual);
      if (novosEventos.length > 0) {
        setEventosVisiveis(prev => [...prev, ...novosEventos]);
        novosEventos.forEach(evt => {
          if (evt.tipo === 'gol') {
            setPlacar(prev => ({
              casa: evt.timeId === (ehMandante ? clubeUsuarioId : adversarioId) ? prev.casa + 1 : prev.casa,
              fora: evt.timeId === (ehMandante ? adversarioId : clubeUsuarioId) ? prev.fora + 1 : prev.fora,
            }));
          }
        });
      }
      setMinutoAtual(m => m + 1);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [fase, minutoAtual, resultado]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [eventosVisiveis]);

  function finalizarJogo() {
    if (!resultado || !jogo) return;

    atualizarEstado((atual) => {
      const cal = [...atual.competicoes[ligaId].calendario];
      const rodadaIdx = cal.findIndex(r => r.numero === proximoJogo.rodadaNumero);
      const jogoIdx = cal[rodadaIdx].jogos.findIndex(
        j => j.mandanteId === jogo.mandanteId && j.visitanteId === jogo.visitanteId
      );

      cal[rodadaIdx] = {
        ...cal[rodadaIdx],
        jogos: cal[rodadaIdx].jogos.map((j, i) =>
          i === jogoIdx ? {
            ...j,
            jogado: true,
            placarMandante: ehMandante ? resultado.placarCasa : resultado.placarFora,
            placarVisitante: ehMandante ? resultado.placarFora : resultado.placarCasa,
            eventos: resultado.eventos,
          } : j
        ),
      };

      // Simula jogos da CPU na mesma rodada
      cal[rodadaIdx] = {
        ...cal[rodadaIdx],
        jogos: simularRodadaCPU(cal[rodadaIdx], clubeUsuarioId, getClubeById),
      };

      const novaData = adicionarDias(atual.carreira.dataAtual, 7);

      return {
        ...atual,
        carreira: { ...atual.carreira, dataAtual: novaData },
        competicoes: {
          ...atual.competicoes,
          [ligaId]: { ...atual.competicoes[ligaId], calendario: cal },
        },
        financas: {
          historico: [
            ...atual.financas.historico,
            { texto: `Bilheteria — vs ${adversario?.nome}`, valor: resultado.estatisticas.rendaBruta, tipo: 'entrada', data: atual.carreira.dataAtual },
          ],
        },
      };
    });

    navigate('/dashboard');
  }

  if (!jogo || !adversario) {
    return (
      <div style={styles.wrap}>
        <div style={styles.empty}>Não há partida agendada para jogos — volte ao Dashboard.</div>
      </div>
    );
  }

  const clubeCasa = ehMandante ? clubeUsuario : adversario;
  const clubeFora = ehMandante ? adversario : clubeUsuario;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.kicker}>Rodada {proximoJogo.rodadaNumero}</div>

        <div style={styles.scoreboard}>
          <div style={styles.scoreTeam}>
            <ClubCrest brasao={clubeCasa.brasao} size={40} />
            <span style={styles.scoreTeamName}>{clubeCasa.nome}</span>
          </div>
          <div style={styles.scoreCenter}>
            <div style={styles.score}>{placar.casa} — {placar.fora}</div>
            <div style={styles.minute}>
              {fase === 'pre' && '—'}
              {fase === 'jogando' && `${minutoAtual}'`}
              {fase === 'fim' && 'FIM'}
            </div>
          </div>
          <div style={{ ...styles.scoreTeam, alignItems: 'flex-end' }}>
            <ClubCrest brasao={clubeFora.brasao} size={40} />
            <span style={styles.scoreTeamName}>{clubeFora.nome}</span>
          </div>
        </div>
      </div>

      {/* Feed de narração */}
      <div style={styles.feed} ref={feedRef}>
        {fase === 'pre' && (
          <div style={styles.feedEmpty}>Clique em "Iniciar partida" para começar a simulação.</div>
        )}
        {eventosVisiveis.map((evt, i) => (
          <div key={i} style={evt.tipo === 'gol' ? styles.feedGol : styles.feedEvt}>
            <span style={styles.feedMin}>{evt.minuto}'</span>
            {evt.tipo === 'gol' && <span style={styles.feedIcon}>⚽</span>}
            {evt.tipo === 'cartao_amarelo' && <span style={styles.feedIcon}>🟨</span>}
            <span style={styles.feedText}>
              {evt.tipo === 'gol' && `GOL! ${evt.autor} marca para o ${evt.timeNome}`}
              {evt.tipo === 'cartao_amarelo' && `Cartão amarelo para ${evt.timeNome}`}
            </span>
          </div>
        ))}
        {fase === 'fim' && (
          <div style={styles.feedFim}>
            Apito final! {clubeCasa.nome} {placar.casa} x {placar.fora} {clubeFora.nome}
          </div>
        )}
      </div>

      {/* Estatísticas */}
      {resultado && (
        <div style={styles.stats}>
          <Stat label="Força casa" value={resultado.estatisticas.forcaCasa} />
          <Stat label="Força fora" value={resultado.estatisticas.forcaFora} />
          <Stat label="Público" value={resultado.estatisticas.publico?.toLocaleString('pt-BR')} />
          <Stat label="Renda" value={`R$ ${(resultado.estatisticas.rendaBruta / 1000).toFixed(0)}K`} />
        </div>
      )}

      <div style={styles.actions}>
        {fase === 'pre' && (
          <button style={styles.btnPlay} onClick={iniciarJogo}>▶ Iniciar partida</button>
        )}
        {fase === 'jogando' && (
          <button style={styles.btnSkip} onClick={() => setMinutoAtual(91)}>⏩ Pular para o fim</button>
        )}
        {fase === 'fim' && (
          <button style={styles.btnPlay} onClick={finalizarJogo}>Confirmar resultado e avançar</button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statVal}>{value}</div>
    </div>
  );
}

const styles = {
  wrap: { padding: 28, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 20 },
  empty: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  header: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 },
  kicker: { fontSize: 11, color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, textAlign: 'center' },
  scoreboard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  scoreTeam: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, flex: 1 },
  scoreTeamName: { color: '#fff', fontSize: 14, fontWeight: 500 },
  scoreCenter: { textAlign: 'center' },
  score: { fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: 4 },
  minute: { fontSize: 13, color: '#5DCAA5', marginTop: 4 },
  feed: { flex: 1, minHeight: 280, maxHeight: 360, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 },
  feedEmpty: { color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', marginTop: 80 },
  feedEvt: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' },
  feedGol: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(29,158,117,0.15)', border: '0.5px solid rgba(29,158,117,0.4)' },
  feedFim: { textAlign: 'center', color: '#5DCAA5', fontWeight: 600, fontSize: 15, marginTop: 10 },
  feedMin: { color: 'rgba(255,255,255,0.4)', fontSize: 12, width: 28, flexShrink: 0 },
  feedIcon: { fontSize: 16 },
  feedText: { color: '#fff', fontSize: 13 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  statBox: { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  statVal: { fontSize: 15, fontWeight: 600, color: '#fff' },
  actions: { display: 'flex', gap: 10 },
  btnPlay: { flex: 1, background: '#1D9E75', color: '#E1F5EE', border: 'none', padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  btnSkip: { flex: 1, background: 'rgba(255,255,255,0.07)', color: '#fff', border: '0.5px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
};
