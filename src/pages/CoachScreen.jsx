import { useGame } from '../store/GameContext';

const MORAL_NIVEIS = ['bairro', 'estadual', 'nacional', 'continental', 'mundial'];
const MORAL_LABELS = { bairro: 'Bairro', estadual: 'Estadual', nacional: 'Nacional', continental: 'Continental', mundial: 'Mundial' };
const MORAL_DESC = {
  bairro: 'Reputação local. Clubes da região podem se interessar por você.',
  estadual: 'Reconhecido no cenário estadual. Bons resultados regionais abriram portas.',
  nacional: 'Nome respeitado em âmbito nacional. Grandes clubes do país estão atentos.',
  continental: 'Treinador de destaque continental. Propostas internacionais na mesa.',
  mundial: 'Elite do futebol mundial. Poucos chegam aqui.',
};

export default function CoachScreen() {
  const { estado } = useGame();
  const { treinador } = estado;
  const nivelAtual = MORAL_NIVEIS.indexOf(treinador.moral);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.kicker}>Perfil</div>
        <h1 style={styles.title}>{treinador.nome}</h1>
        <div style={styles.moralBadge}>{MORAL_LABELS[treinador.moral]}</div>
      </div>

      {/* Moral */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Reputação do Treinador</div>
        <div style={styles.moralSteps}>
          {MORAL_NIVEIS.map((nivel, i) => (
            <div key={nivel} style={styles.moralStep}>
              <div style={{ ...styles.moralDot, background: i <= nivelAtual ? '#1D9E75' : 'rgba(255,255,255,0.1)', border: i === nivelAtual ? '2px solid #5DCAA5' : '2px solid transparent' }} />
              {i < MORAL_NIVEIS.length - 1 && (
                <div style={{ ...styles.moralLine, background: i < nivelAtual ? '#1D9E75' : 'rgba(255,255,255,0.1)' }} />
              )}
              <div style={styles.moralLabel}>{MORAL_LABELS[nivel]}</div>
            </div>
          ))}
        </div>
        <div style={styles.moralDesc}>{MORAL_DESC[treinador.moral]}</div>
      </div>

      {/* Títulos */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🏆 Títulos</div>
        {treinador.titulos.length === 0 ? (
          <div style={styles.empty}>Nenhum título ainda. A história está sendo escrita.</div>
        ) : (
          <div style={styles.titulosList}>
            {treinador.titulos.map((t, i) => (
              <div key={i} style={styles.tituloRow}>
                <span style={styles.tituloIcon}>🏆</span>
                <span style={styles.tituloNome}>{t.competicaoId}</span>
                <span style={styles.tituloAno}>{t.temporada}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scout por temporada */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Scout por Temporada</div>
        {treinador.scoutTemporadas.length === 0 ? (
          <div style={styles.empty}>Primeira temporada em andamento.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Temporada', 'Clube', 'J', 'V', 'E', 'D', 'Posição final'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {treinador.scoutTemporadas.map((s, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{s.temporada}</td>
                  <td style={styles.td}>{s.clubeId}</td>
                  <td style={styles.tdNum}>{s.jogos}</td>
                  <td style={{ ...styles.tdNum, color: '#1D9E75' }}>{s.vitorias}</td>
                  <td style={styles.tdNum}>{s.empates}</td>
                  <td style={{ ...styles.tdNum, color: '#A32D2D' }}>{s.derrotas}</td>
                  <td style={styles.tdNum}>{s.posicaoFinal}º</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Histórico de clubes */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Histórico de Clubes</div>
        {treinador.historico.length === 0 ? (
          <div style={styles.empty}>Passagem atual em andamento.</div>
        ) : (
          <div style={styles.historicoList}>
            {treinador.historico.map((h, i) => (
              <div key={i} style={styles.historicoRow}>
                <div style={styles.historicoDot} />
                <div>
                  <div style={styles.historicoClube}>{h.clubeId}</div>
                  <div style={styles.historicoMeta}>{h.dataInicio} → {h.dataFim} — {h.motivoSaida}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: 28, display: 'flex', flexDirection: 'column', gap: 16 },
  header: { marginBottom: 4 },
  kicker: { fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: 500, margin: '0 0 8px' },
  moralBadge: { display: 'inline-block', background: 'rgba(29,158,117,0.2)', color: '#5DCAA5', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1 },
  card: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 11, color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  moralSteps: { display: 'flex', alignItems: 'center', marginBottom: 16 },
  moralStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  moralDot: { width: 14, height: 14, borderRadius: '50%', marginBottom: 6, transition: 'all .2s' },
  moralLine: { position: 'absolute', top: 6, left: '50%', width: '100%', height: 2, zIndex: 0 },
  moralLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  moralDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' },
  empty: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  titulosList: { display: 'flex', flexDirection: 'column', gap: 8 },
  tituloRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 },
  tituloIcon: { fontSize: 18 },
  tituloNome: { color: '#fff', fontSize: 13, flex: 1 },
  tituloAno: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '6px 8px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom: '0.5px solid rgba(255,255,255,0.04)' },
  td: { fontSize: 13, color: '#fff', padding: '8px 8px' },
  tdNum: { fontSize: 13, color: 'rgba(255,255,255,0.7)', padding: '8px 8px', textAlign: 'center' },
  historicoList: { display: 'flex', flexDirection: 'column', gap: 12 },
  historicoRow: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  historicoDot: { width: 10, height: 10, borderRadius: '50%', background: '#1D9E75', marginTop: 3, flexShrink: 0 },
  historicoClube: { color: '#fff', fontSize: 13, fontWeight: 500 },
  historicoMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
};
