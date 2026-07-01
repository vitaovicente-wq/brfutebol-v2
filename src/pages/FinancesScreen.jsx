import { useGame } from '../store/GameContext';
import { formatarData } from '../engine/calendarEngine';

export default function FinancesScreen() {
  const { estado } = useGame();
  const historico = estado.financas.historico ?? [];
  const entradas = historico.filter(h => h.tipo === 'entrada').reduce((s, h) => s + h.valor, 0);
  const saidas = historico.filter(h => h.tipo === 'saida').reduce((s, h) => s + h.valor, 0);
  const saldo = entradas - saidas;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.kicker}>Gestão</div>
        <h1 style={styles.title}>Finanças</h1>
      </div>

      <div style={styles.resumo}>
        <ResumoBox label="Entradas" valor={entradas} color="#1D9E75" />
        <ResumoBox label="Saídas" valor={saidas} color="#A32D2D" />
        <ResumoBox label="Saldo" valor={saldo} color={saldo >= 0 ? '#5DCAA5' : '#e07b39'} />
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Extrato</div>
        {historico.length === 0 ? (
          <div style={styles.empty}>Nenhuma movimentação ainda.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Data', 'Descrição', 'Tipo', 'Valor'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...historico].reverse().map((item, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{item.data ? formatarData(item.data) : '—'}</td>
                  <td style={styles.td}>{item.texto}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: item.tipo === 'entrada' ? 'rgba(29,158,117,0.2)' : 'rgba(163,45,45,0.2)', color: item.tipo === 'entrada' ? '#5DCAA5' : '#e07b39' }}>
                      {item.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600, color: item.tipo === 'entrada' ? '#5DCAA5' : '#e07b39', textAlign: 'right' }}>
                    R$ {item.valor.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ResumoBox({ label, valor, color }) {
  return (
    <div style={styles.resumoBox}>
      <div style={styles.resumoLabel}>{label}</div>
      <div style={{ ...styles.resumoVal, color }}>R$ {valor.toLocaleString('pt-BR')}</div>
    </div>
  );
}

const styles = {
  wrap: { padding: 28 },
  header: { marginBottom: 24 },
  kicker: { fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: 500, margin: 0 },
  resumo: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 },
  resumoBox: { background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 18px' },
  resumoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 },
  resumoVal: { fontSize: 20, fontWeight: 600 },
  card: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 11, color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  empty: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '6px 8px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom: '0.5px solid rgba(255,255,255,0.04)' },
  td: { fontSize: 13, color: '#fff', padding: '9px 8px' },
  badge: { fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 500 },
};
