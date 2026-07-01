import { useGame } from '../store/GameContext';
import { getClubeById } from '../data/clubsData';
import { calcularClassificacao, calcularArtilharia } from '../engine/matchEngine';

export default function StandingsScreen() {
  const { estado } = useGame();
  const ligaId = estado.carreira.ligaAtualId;
  const competicao = estado.competicoes[ligaId];
  const clubeUsuarioId = estado.carreira.clubeAtualId;

  const timeIds = [...new Set(
    competicao.calendario.flatMap(r => r.jogos.flatMap(j => [j.mandanteId, j.visitanteId]))
  )];
  const tabela = calcularClassificacao(competicao.calendario, timeIds);
  const artilharia = calcularArtilharia(competicao.calendario);

  function zonaStyle(pos) {
    if (pos <= 4) return { borderLeft: '3px solid #1D9E75' };
    if (pos <= 6) return { borderLeft: '3px solid #185FA5' };
    if (pos >= tabela.length - 3) return { borderLeft: '3px solid #A32D2D' };
    return { borderLeft: '3px solid transparent' };
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.kicker}>Campeonato</div>
        <h1 style={styles.title}>Classificação</h1>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Tabela</div>
          <div style={styles.legend}>
            <span style={{ color: '#1D9E75' }}>▌ Libertadores</span>
            <span style={{ color: '#185FA5' }}>▌ Sul-Americana</span>
            <span style={{ color: '#A32D2D' }}>▌ Rebaixamento</span>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Clube', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG', 'Pts'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabela.map((time, i) => {
                const clube = getClubeById(time.id);
                const isUser = time.id === clubeUsuarioId;
                return (
                  <tr key={time.id} style={{ ...styles.tr, ...zonaStyle(i + 1), background: isUser ? 'rgba(29,158,117,0.08)' : undefined }}>
                    <td style={styles.tdNum}>{i + 1}</td>
                    <td style={{ ...styles.td, fontWeight: isUser ? 600 : 400 }}>
                      {clube?.nome ?? time.id}
                      {isUser && <span style={styles.youBadge}> você</span>}
                    </td>
                    <td style={styles.tdNum}>{time.jogos}</td>
                    <td style={{ ...styles.tdNum, color: '#1D9E75' }}>{time.vitorias}</td>
                    <td style={styles.tdNum}>{time.empates}</td>
                    <td style={{ ...styles.tdNum, color: '#A32D2D' }}>{time.derrotas}</td>
                    <td style={styles.tdNum}>{time.gp}</td>
                    <td style={styles.tdNum}>{time.gc}</td>
                    <td style={styles.tdNum}>{time.gp - time.gc}</td>
                    <td style={{ ...styles.tdNum, fontWeight: 700, color: '#fff' }}>{time.pontos}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>⚽ Artilharia</div>
          {artilharia.length === 0 ? (
            <div style={styles.emptyText}>Nenhum gol marcado ainda.</div>
          ) : (
            <div style={styles.artList}>
              {artilharia.map((art, i) => {
                const clube = getClubeById(art.timeId);
                return (
                  <div key={i} style={styles.artRow}>
                    <span style={styles.artPos}>{i + 1}</span>
                    <div style={styles.artInfo}>
                      <span style={styles.artNome}>{art.nome}</span>
                      <span style={styles.artClube}>{clube?.nome ?? art.timeId}</span>
                    </div>
                    <span style={styles.artGols}>{art.gols} gols</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: 28 },
  header: { marginBottom: 24 },
  kicker: { fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: 500, margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 },
  card: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 11, color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  legend: { display: 'flex', gap: 16, marginBottom: 10, fontSize: 11 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '6px 4px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom: '0.5px solid rgba(255,255,255,0.04)' },
  td: { fontSize: 13, color: '#fff', padding: '7px 4px' },
  tdNum: { fontSize: 13, color: 'rgba(255,255,255,0.7)', padding: '7px 4px', textAlign: 'center' },
  youBadge: { fontSize: 9, background: 'rgba(29,158,117,0.3)', color: '#5DCAA5', padding: '1px 5px', borderRadius: 4, marginLeft: 4 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  artList: { display: 'flex', flexDirection: 'column', gap: 8 },
  artRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 },
  artPos: { color: 'rgba(255,255,255,0.4)', fontSize: 12, width: 20, textAlign: 'center' },
  artInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  artNome: { color: '#fff', fontSize: 13, fontWeight: 500 },
  artClube: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  artGols: { color: '#5DCAA5', fontWeight: 700, fontSize: 14 },
};
