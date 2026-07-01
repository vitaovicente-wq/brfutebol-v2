import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { getClubeById } from '../data/clubsData';
import { getProximoJogo } from '../engine/fixtureEngine';
import { formatarData } from '../engine/calendarEngine';
import { calcularClassificacao } from '../engine/matchEngine';
import ClubCrest from '../components/ClubCrest';

export default function Dashboard() {
  const { estado } = useGame();
  const navigate = useNavigate();

  if (!estado) return null;

  const clube = getClubeById(estado.carreira.clubeAtualId);
  const ligaId = estado.carreira.ligaAtualId;
  const competicao = estado.competicoes[ligaId];
  const proximoJogo = getProximoJogo(competicao.calendario, estado.carreira.clubeAtualId);

  const timeIds = competicao.calendario[0]?.jogos.flatMap(j => [j.mandanteId, j.visitanteId]) ?? [];
  const todosTimesIds = [...new Set(timeIds)];
  const classificacao = calcularClassificacao(competicao.calendario, todosTimesIds);
  const posicao = classificacao.findIndex(t => t.id === estado.carreira.clubeAtualId) + 1;
  const meuDado = classificacao.find(t => t.id === estado.carreira.clubeAtualId);

  const adversarioId = proximoJogo
    ? (proximoJogo.jogo.mandanteId === estado.carreira.clubeAtualId
        ? proximoJogo.jogo.visitanteId
        : proximoJogo.jogo.mandanteId)
    : null;
  const adversario = adversarioId ? getClubeById(adversarioId) : null;
  const ehMandante = proximoJogo?.jogo.mandanteId === estado.carreira.clubeAtualId;

  const jogadores = [...(clube?.elenco ?? [])].sort((a, b) => b.ovr - a.ovr);

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>{formatarData(estado.carreira.dataAtual, { comDiaSemana: true })}</div>
          <h1 style={styles.title}>{clube?.nome}</h1>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.saldoBox}>
            <div style={styles.saldoLabel}>Saldo</div>
            <div style={styles.saldoVal}>
              R$ {((clube?.orcamentoInicial ?? 0) / 1_000_000).toFixed(1)}M
            </div>
          </div>
          <div style={styles.saldoBox}>
            <div style={styles.saldoLabel}>Classificação</div>
            <div style={styles.saldoVal}>{posicao}º lugar</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Próximo jogo */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Próximo Jogo</div>
          {proximoJogo && adversario ? (
            <>
              <div style={styles.matchBanner}>
                <div style={styles.matchTeam}>
                  <ClubCrest brasao={ehMandante ? clube.brasao : adversario.brasao} size={44} />
                  <span style={styles.matchTeamName}>{ehMandante ? clube.nome : adversario.nome}</span>
                  <span style={styles.matchTeamSub}>Mandante</span>
                </div>
                <div style={styles.matchVs}>VS</div>
                <div style={styles.matchTeam}>
                  <ClubCrest brasao={ehMandante ? adversario.brasao : clube.brasao} size={44} />
                  <span style={styles.matchTeamName}>{ehMandante ? adversario.nome : clube.nome}</span>
                  <span style={styles.matchTeamSub}>Visitante</span>
                </div>
              </div>
              <div style={styles.matchMeta}>
                Rodada {proximoJogo.rodadaNumero} — {formatarData(proximoJogo.data)}
              </div>
              <button style={styles.playBtn} onClick={() => navigate('/partida')}>
                ▶ Jogar agora
              </button>
            </>
          ) : (
            <div style={styles.emptyText}>Temporada encerrada — aguarde a próxima temporada.</div>
          )}
        </div>

        {/* Stats do clube */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Campeonato</div>
          <div style={styles.statRow4}>
            <StatBox label="Jogos" value={meuDado?.jogos ?? 0} />
            <StatBox label="Vitórias" value={meuDado?.vitorias ?? 0} color="#1D9E75" />
            <StatBox label="Empates" value={meuDado?.empates ?? 0} color="#854F0B" />
            <StatBox label="Derrotas" value={meuDado?.derrotas ?? 0} color="#A32D2D" />
          </div>
          <div style={styles.statRow4}>
            <StatBox label="Pontos" value={meuDado?.pontos ?? 0} color="#5DCAA5" />
            <StatBox label="Gols pró" value={meuDado?.gp ?? 0} />
            <StatBox label="Gols contra" value={meuDado?.gc ?? 0} />
            <StatBox label="Saldo" value={(meuDado?.gp ?? 0) - (meuDado?.gc ?? 0)} />
          </div>
          <div style={styles.objetivoRow}>
            <span style={styles.objetivoLabel}>Objetivo:</span>
            <span style={styles.objetivoVal}>{clube?.objetivoTemporada}</span>
          </div>
        </div>

        {/* Elenco */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <div style={styles.cardTitle}>Elenco</div>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Pos', 'Jogador', 'Idade', 'OVR', 'PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY', 'Condição'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jogadores.map((j) => (
                <tr key={j.id} style={styles.tr}>
                  <td style={styles.tdPos}><span style={styles.posBadge}>{j.posicao}</span></td>
                  <td style={styles.td}>{j.nome}</td>
                  <td style={styles.tdNum}>{j.idade}</td>
                  <td style={{ ...styles.tdNum, fontWeight: 700, color: ovrColor(j.ovr) }}>{j.ovr}</td>
                  <td style={styles.tdNum}>{j.atributos.pac}</td>
                  <td style={styles.tdNum}>{j.atributos.sho}</td>
                  <td style={styles.tdNum}>{j.atributos.pas}</td>
                  <td style={styles.tdNum}>{j.atributos.dri}</td>
                  <td style={styles.tdNum}>{j.atributos.def}</td>
                  <td style={styles.tdNum}>{j.atributos.phy}</td>
                  <td style={styles.td}>
                    <div style={styles.condBar}>
                      <div style={{ ...styles.condFill, width: `${j.condicao}%`, background: condColor(j.condicao) }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statVal, color: color ?? '#fff' }}>{value}</div>
    </div>
  );
}

function ovrColor(ovr) {
  if (ovr >= 80) return '#5DCAA5';
  if (ovr >= 70) return '#e8d44d';
  return '#e07b39';
}

function condColor(cond) {
  if (cond >= 75) return '#1D9E75';
  if (cond >= 50) return '#e8d44d';
  return '#A32D2D';
}

const styles = {
  wrap: { padding: 28, minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  kicker: { fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: 500, margin: 0 },
  headerRight: { display: 'flex', gap: 12 },
  saldoBox: { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', textAlign: 'right' },
  saldoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  saldoVal: { fontSize: 16, fontWeight: 600, color: '#fff' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  card: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 11, color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500, marginBottom: 16 },
  matchBanner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  matchTeam: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 },
  matchTeamName: { color: '#fff', fontSize: 13, fontWeight: 500, textAlign: 'center' },
  matchTeamSub: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
  matchVs: { color: 'rgba(255,255,255,0.3)', fontSize: 20, fontWeight: 700, padding: '0 16px' },
  matchMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginBottom: 14 },
  playBtn: { width: '100%', background: '#1D9E75', color: '#E1F5EE', border: 'none', padding: '11px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  statRow4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 8 },
  statBox: { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: 600 },
  objetivoRow: { marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 },
  objetivoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginRight: 8 },
  objetivoVal: { fontSize: 13, color: '#fff', fontWeight: 500 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '6px 8px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', textTransform: 'uppercase' },
  tr: { borderBottom: '0.5px solid rgba(255,255,255,0.04)' },
  td: { fontSize: 13, color: '#fff', padding: '8px 8px' },
  tdNum: { fontSize: 13, color: 'rgba(255,255,255,0.8)', padding: '8px 8px', textAlign: 'center' },
  tdPos: { padding: '8px 8px' },
  posBadge: { background: 'rgba(29,158,117,0.2)', color: '#5DCAA5', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4 },
  condBar: { width: 60, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  condFill: { height: '100%', borderRadius: 3 },
};
