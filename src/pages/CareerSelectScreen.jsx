import { useState, useMemo } from 'react';
import { CONTINENTES, getPaisesPorContinente, getLigasPorPais } from '../data/worldData';
import { getClubesPorLiga } from '../data/clubsData';
import { criarTemporada } from '../engine/calendarEngine';
import { gerarCalendarioLiga } from '../engine/fixtureEngine';
import { useGame } from '../store/GameContext';
import WorldMap from '../components/WorldMap';
import ClubCrest from '../components/ClubCrest';

export default function CareerSelectScreen({ onCarreiraIniciada }) {
  const { iniciarNovaCarreira } = useGame();

  const [continenteId, setContinenteId] = useState('america-sul');
  const [paisId, setPaisId] = useState(null);
  const [ligaId, setLigaId] = useState(null);
  const [clubeId, setClubeId] = useState(null);
  const [treinadorNome, setTreinadorNome] = useState('');

  const paises = useMemo(() => getPaisesPorContinente(continenteId), [continenteId]);
  const paisSelecionado = paisId ?? paises[0]?.id ?? null;

  const ligas = useMemo(
    () => (paisSelecionado ? getLigasPorPais(paisSelecionado) : []),
    [paisSelecionado]
  );
  const ligaSelecionada = ligaId ?? ligas[0]?.id ?? null;

  const clubes = useMemo(
    () => (ligaSelecionada ? getClubesPorLiga(ligaSelecionada) : []),
    [ligaSelecionada]
  );

  const clubeSelecionado = clubes.find((c) => c.id === clubeId) ?? null;

  function selecionarContinente(id) {
    setContinenteId(id);
    setPaisId(null);
    setLigaId(null);
    setClubeId(null);
  }

  function selecionarPais(id) {
    setPaisId(id);
    setLigaId(null);
    setClubeId(null);
  }

  function selecionarLiga(id) {
    setLigaId(id);
    setClubeId(null);
  }

  function podeIniciar() {
    return clubeSelecionado !== null && treinadorNome.trim().length > 0;
  }

  function iniciar() {
    if (!podeIniciar()) return;

    const temporada = criarTemporada(2026);
    const timeIds = clubes.map((c) => c.id);
    const calendario = gerarCalendarioLiga(timeIds, temporada);

    const estado = iniciarNovaCarreira({
      clubeId: clubeSelecionado.id,
      ligaId: ligaSelecionada,
      treinadorNome: treinadorNome.trim(),
      temporada,
      calendario,
      clubes,
    });

    onCarreiraIniciada?.(estado);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.kicker}>BRFUTEBOL — WORLD MANAGER</div>
        <h1 style={styles.title}>Escolha sua carreira</h1>
      </div>

      <div style={styles.section}>
        <div style={styles.stepLabel}>1. Clique em um continente no mapa</div>
        <div style={styles.mapBox}>
          <WorldMap continenteAtivo={continenteId} onSelecionar={selecionarContinente} />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.stepLabel}>2. País</div>
        <div style={styles.pillGrid}>
          {paises.map((pais) => (
            <button
              key={pais.id}
              onClick={() => selecionarPais(pais.id)}
              style={pais.id === paisSelecionado ? styles.pillActive : styles.pill}
            >
              <span>{pais.bandeira}</span>
              <span>{pais.nome}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.stepLabel}>3. Liga / Divisão</div>
        <div style={styles.pillRow}>
          {ligas.map((liga) => (
            <button
              key={liga.id}
              onClick={() => selecionarLiga(liga.id)}
              style={liga.id === ligaSelecionada ? styles.pillActive : styles.pill}
            >
              {liga.nome}
            </button>
          ))}
          {ligas.length === 0 && (
            <span style={styles.placeholderText}>Liga ainda não populada nesta versão</span>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.stepLabel}>4. Clube</div>
        <div style={styles.clubGrid}>
          {clubes.map((clube) => (
            <div
              key={clube.id}
              onClick={() => setClubeId(clube.id)}
              style={clube.id === clubeId ? styles.clubCardSelected : styles.clubCard}
            >
              <ClubCrest brasao={clube.brasao} size={32} />
              <span style={styles.clubName}>{clube.nome}</span>
            </div>
          ))}
          {clubes.length === 0 && (
            <span style={styles.placeholderText}>
              Clubes desta liga ainda não foram cadastrados — selecione Brasil / Série A para testar.
            </span>
          )}
        </div>
      </div>

      {clubeSelecionado && (
        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <ClubCrest brasao={clubeSelecionado.brasao} size={48} />
            <div>
              <div style={styles.detailName}>{clubeSelecionado.nome}</div>
              <div style={styles.detailSub}>
                {ligas.find((l) => l.id === ligaSelecionada)?.nome} — {paises.find((p) => p.id === paisSelecionado)?.nome}
              </div>
            </div>
          </div>

          <div style={styles.statGrid}>
            <Stat label="Objetivo" value={clubeSelecionado.objetivoTemporada} />
            <Stat
              label="Orçamento"
              value={`R$ ${(clubeSelecionado.orcamentoInicial / 1_000_000).toFixed(1)}M`}
            />
            <Stat label="Estádio" value={clubeSelecionado.estadio.nome} />
            <Stat
              label="Destaque"
              value={
                [...clubeSelecionado.elenco].sort((a, b) => b.ovr - a.ovr)[0]?.posicao ?? '—'
              }
            />
          </div>

          <input
            type="text"
            placeholder="Nome do treinador"
            value={treinadorNome}
            onChange={(e) => setTreinadorNome(e.target.value)}
            style={styles.input}
          />

          <button
            onClick={iniciar}
            disabled={!podeIniciar()}
            style={{ ...styles.startButton, opacity: podeIniciar() ? 1 : 0.5 }}
          >
            Iniciar carreira
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

const styles = {
  wrap: {
    background: '#0d1b14',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    background: 'linear-gradient(180deg, #143625 0%, #0d1b14 100%)',
    padding: '24px 28px 18px',
    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#5DCAA5',
    fontWeight: 500,
    marginBottom: 4,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: 500, margin: 0 },
  section: { padding: '18px 28px 0' },
  stepLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    fontWeight: 500,
  },
  mapBox: {
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 10,
  },
  pillGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  pillRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  pill: {
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.65)',
    padding: '8px 14px',
    borderRadius: 7,
    fontSize: 13,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  pillActive: {
    background: '#1D9E75',
    border: '0.5px solid #1D9E75',
    color: '#E1F5EE',
    padding: '8px 14px',
    borderRadius: 7,
    fontSize: 13,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  clubGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  clubCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  clubCardSelected: {
    background: 'rgba(29,158,117,0.12)',
    border: '0.5px solid #1D9E75',
    borderRadius: 10,
    padding: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  clubName: { color: '#fff', fontSize: 12.5, fontWeight: 500 },
  placeholderText: { color: 'rgba(255,255,255,0.4)', fontSize: 12.5 },
  detailCard: {
    margin: '16px 28px 28px',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '18px 20px',
  },
  detailHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 },
  detailName: { color: '#fff', fontSize: 17, fontWeight: 500 },
  detailSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 },
  statBox: { background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '8px 10px' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 },
  statValue: { fontSize: 13, color: '#fff', fontWeight: 500 },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    color: '#fff',
    padding: '11px 14px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
    boxSizing: 'border-box',
  },
  startButton: {
    width: '100%',
    background: '#1D9E75',
    color: '#E1F5EE',
    border: 'none',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
};
