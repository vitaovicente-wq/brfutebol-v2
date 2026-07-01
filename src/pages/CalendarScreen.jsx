import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { getClubeById } from '../data/clubsData';
import { formatarData } from '../engine/calendarEngine';

export default function CalendarScreen() {
  const { estado } = useGame();
  const ligaId = estado.carreira.ligaAtualId;
  const competicao = estado.competicoes[ligaId];
  const clubeUsuarioId = estado.carreira.clubeAtualId;

  const rodadaAtual = competicao.calendario.findIndex(r =>
    r.jogos.some(j => !j.jogado && (j.mandanteId === clubeUsuarioId || j.visitanteId === clubeUsuarioId))
  );
  const [rodadaVista, setRodadaVista] = useState(Math.max(0, rodadaAtual));
  const [jogoSelecionado, setJogoSelecionado] = useState(null);

  const rodada = competicao.calendario[rodadaVista];

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.kicker}>Campeonato</div>
        <h1 style={styles.title}>Calendário</h1>
      </div>

      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={() => setRodadaVista(v => Math.max(0, v - 1))} disabled={rodadaVista === 0}>
          ‹ Anterior
        </button>
        <div style={styles.navLabel}>
          <div style={styles.navRound}>Rodada {rodada.numero}</div>
          <div style={styles.navDate}>{formatarData(rodada.data)}</div>
        </div>
        <button style={styles.navBtn} onClick={() => setRodadaVista(v => Math.min(competicao.calendario.length - 1, v + 1))} disabled={rodadaVista === competicao.calendario.length - 1}>
          Próxima ›
        </button>
      </div>

      <div style={styles.jogosList}>
        {rodada.jogos.map((jogo, i) => {
          const mandante = getClubeById(jogo.mandanteId);
          const visitante = getClubeById(jogo.visitanteId);
          const isUser = jogo.mandanteId === clubeUsuarioId || jogo.visitanteId === clubeUsuarioId;
          return (
            <div
              key={i}
              style={{ ...styles.jogoCard, ...(isUser ? styles.jogoCardUser : {}), cursor: jogo.jogado ? 'pointer' : 'default' }}
              onClick={() => jogo.jogado && setJogoSelecionado(jogo)}
            >
              <div style={styles.jogoTeam}>
                <span style={styles.jogoNome}>{mandante?.nome ?? jogo.mandanteId}</span>
              </div>
              <div style={styles.jogoCenter}>
                {jogo.jogado ? (
                  <span style={styles.placar}>{jogo.placarMandante} — {jogo.placarVisitante}</span>
                ) : (
                  <span style={styles.vs}>VS</span>
                )}
              </div>
              <div style={{ ...styles.jogoTeam, alignItems: 'flex-end' }}>
                <span style={styles.jogoNome}>{visitante?.nome ?? jogo.visitanteId}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de resultado */}
      {jogoSelecionado && (
        <div style={styles.modalOverlay} onClick={() => setJogoSelecionado(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Resultado</div>
            <div style={styles.modalPlacar}>
              {getClubeById(jogoSelecionado.mandanteId)?.nome} {jogoSelecionado.placarMandante} — {jogoSelecionado.placarVisitante} {getClubeById(jogoSelecionado.visitanteId)?.nome}
            </div>
            <div style={styles.modalEventos}>
              {jogoSelecionado.eventos.filter(e => e.tipo === 'gol').map((e, i) => (
                <div key={i} style={styles.modalEvt}>⚽ {e.minuto}' — {e.autor} ({e.timeNome})</div>
              ))}
            </div>
            <button style={styles.modalClose} onClick={() => setJogoSelecionado(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { padding: 28 },
  header: { marginBottom: 20 },
  kicker: { fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: 500, margin: 0 },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px' },
  navBtn: { background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 13 },
  navLabel: { textAlign: 'center' },
  navRound: { color: '#fff', fontWeight: 600, fontSize: 15 },
  navDate: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  jogosList: { display: 'flex', flexDirection: 'column', gap: 8 },
  jogoCard: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center' },
  jogoCardUser: { border: '0.5px solid rgba(29,158,117,0.4)', background: 'rgba(29,158,117,0.06)' },
  jogoTeam: { flex: 1, display: 'flex', flexDirection: 'column' },
  jogoNome: { color: '#fff', fontSize: 14, fontWeight: 500 },
  jogoCenter: { width: 80, textAlign: 'center' },
  placar: { color: '#fff', fontSize: 18, fontWeight: 700 },
  vs: { color: 'rgba(255,255,255,0.3)', fontSize: 16 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#1a2e22', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: 28, minWidth: 340 },
  modalTitle: { fontSize: 11, color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  modalPlacar: { color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' },
  modalEventos: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 },
  modalEvt: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  modalClose: { width: '100%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: 10, borderRadius: 8, cursor: 'pointer', fontSize: 14 },
};
