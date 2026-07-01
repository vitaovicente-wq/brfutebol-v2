import { useGame } from '../store/GameContext';
import { formatarData } from '../engine/calendarEngine';
import { getProximoJogo } from '../engine/fixtureEngine';
import { getClubeById } from '../data/clubsData';
import ClubCrest from '../components/ClubCrest';

export default function CareerStartedScreen() {
  const { estado, encerrarCarreira } = useGame();

  if (!estado) return null;

  const clube = getClubeById(estado.carreira.clubeAtualId);
  const competicao = estado.competicoes[estado.carreira.ligaAtualId];
  const proximo = getProximoJogo(competicao.calendario, estado.carreira.clubeAtualId);

  return (
    <div style={styles.wrap}>
      <div style={styles.kicker}>CARREIRA CRIADA COM SUCESSO</div>
      <div style={styles.header}>
        <ClubCrest brasao={clube.brasao} size={56} />
        <div>
          <div style={styles.clubName}>{clube.nome}</div>
          <div style={styles.coachName}>Treinador: {estado.treinador.nome}</div>
        </div>
      </div>

      <div style={styles.infoBox}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Data atual</span>
          <span style={styles.infoValue}>{formatarData(estado.carreira.dataAtual, { comDiaSemana: true })}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Moral do treinador</span>
          <span style={styles.infoValue}>{estado.treinador.moral}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Total de rodadas geradas</span>
          <span style={styles.infoValue}>{competicao.calendario.length}</span>
        </div>
      </div>

      {proximo && (
        <div style={styles.matchBox}>
          <div style={styles.matchLabel}>Próximo jogo — Rodada {proximo.rodadaNumero}</div>
          <div style={styles.matchTeams}>
            {getClubeById(proximo.jogo.mandanteId)?.nome} vs {getClubeById(proximo.jogo.visitanteId)?.nome}
          </div>
          <div style={styles.matchDate}>{formatarData(proximo.data)}</div>
        </div>
      )}

      <button onClick={encerrarCarreira} style={styles.resetButton}>
        Apagar save e voltar à seleção
      </button>
    </div>
  );
}

const styles = {
  wrap: { background: '#0d1b14', minHeight: '100vh', padding: 28, fontFamily: 'Arial, sans-serif' },
  kicker: { fontSize: 11, letterSpacing: 2, color: '#5DCAA5', fontWeight: 500, marginBottom: 16 },
  header: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  clubName: { color: '#fff', fontSize: 20, fontWeight: 500 },
  coachName: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 },
  infoBox: {
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0' },
  infoLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  infoValue: { color: '#fff', fontSize: 13, fontWeight: 500 },
  matchBox: {
    background: 'rgba(29,158,117,0.1)',
    border: '0.5px solid #1D9E75',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  matchLabel: { color: '#5DCAA5', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 },
  matchTeams: { color: '#fff', fontSize: 15, fontWeight: 500, marginBottom: 4 },
  matchDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  resetButton: {
    background: 'transparent',
    border: '0.5px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.6)',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
  },
};
