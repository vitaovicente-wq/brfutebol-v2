import { useState, useMemo } from 'react';
import { CONTINENTES, getPaisesPorContinente, getLigasPorPais } from '../data/worldData';
import { getClubesPorLiga } from '../data/clubsData';
import { criarTemporada } from '../engine/calendarEngine';
import { gerarCalendarioLiga } from '../engine/fixtureEngine';
import { useGame } from '../store/GameContext';
import ClubCrest from '../components/ClubCrest';

const ETAPAS = ['continente', 'pais', 'liga', 'clube', 'nome'];

const CONTINENTE_BG = {
  'america-sul':   'linear-gradient(135deg, #0d2b1a 0%, #1a4a2e 100%)',
  'america-norte': 'linear-gradient(135deg, #0d1f2b 0%, #1a3a4a 100%)',
  'europa':        'linear-gradient(135deg, #1a1a2e 0%, #2e2a4a 100%)',
  'asia':          'linear-gradient(135deg, #2b1a0d 0%, #4a2e1a 100%)',
};

const CONTINENTE_ACCENT = {
  'america-sul':   '#1D9E75',
  'america-norte': '#185FA5',
  'europa':        '#534AB7',
  'asia':          '#854F0B',
};

export default function CareerSelectScreen({ onCarreiraIniciada }) {
  const { iniciarNovaCarreira } = useGame();
  const [etapa, setEtapa] = useState(0);
  const [animDir, setAnimDir] = useState('frente'); // 'frente' | 'volta'
  const [continenteId, setContinenteId] = useState(null);
  const [paisId, setPaisId] = useState(null);
  const [ligaId, setLigaId] = useState(null);
  const [clubeId, setClubeId] = useState(null);
  const [treinadorNome, setTreinadorNome] = useState('');

  const paises = useMemo(() => continenteId ? getPaisesPorContinente(continenteId) : [], [continenteId]);
  const ligas = useMemo(() => paisId ? getLigasPorPais(paisId) : [], [paisId]);
  const clubes = useMemo(() => ligaId ? getClubesPorLiga(ligaId) : [], [ligaId]);
  const clubeSelecionado = clubes.find(c => c.id === clubeId) ?? null;
  const accent = continenteId ? CONTINENTE_ACCENT[continenteId] : '#1D9E75';
  const bg = continenteId ? CONTINENTE_BG[continenteId] : 'linear-gradient(135deg, #0d1b14 0%, #143625 100%)';

  function avancar(novaEtapa) {
    setAnimDir('frente');
    setTimeout(() => setEtapa(novaEtapa), 0);
  }
  function voltar() {
    setAnimDir('volta');
    setTimeout(() => setEtapa(e => e - 1), 0);
  }

  function iniciar() {
    const temporada = criarTemporada(2026);
    const timeIds = clubes.map(c => c.id);
    const calendario = gerarCalendarioLiga(timeIds, temporada);
    const estado = iniciarNovaCarreira({
      clubeId: clubeSelecionado.id,
      ligaId,
      treinadorNome: treinadorNome.trim(),
      temporada,
      calendario,
      clubes,
    });
    onCarreiraIniciada?.(estado);
  }

  return (
    <div style={{ ...styles.wrap, background: bg }}>
      {/* Barra superior */}
      <div style={styles.topBar}>
        <div style={styles.logoWrap}><img src="/brfutebol-v2/logo.svg" alt="BRFutebol" style={styles.logoImg} /></div>
        <div style={styles.topRight}>
          {/* Indicador de etapas */}
          <div style={styles.steps}>
            {ETAPAS.map((e, i) => (
              <div key={e} style={{
                ...styles.stepDot,
                background: i <= etapa ? accent : 'rgba(255,255,255,0.15)',
                width: i === etapa ? 24 : 8,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo da etapa */}
      <div style={styles.stage}>

        {/* ETAPA 0 — Continente */}
        {etapa === 0 && (
          <div style={styles.etapaWrap}>
            <div style={styles.etapaTitulo}>Onde você quer começar sua carreira?</div>
            <div style={styles.etapaSubtitulo}>Escolha o continente</div>
            <div style={styles.continenteGrid}>
              {CONTINENTES.map(cont => (
                <button key={cont.id}
                  onClick={() => { setContinenteId(cont.id); setPaisId(null); setLigaId(null); setClubeId(null); avancar(1); }}
                  style={{ ...styles.continenteCard, borderColor: CONTINENTE_ACCENT[cont.id] + '44' }}>
                  <div style={{ ...styles.continenteAccent, background: CONTINENTE_ACCENT[cont.id] }} />
                  <div style={styles.continenteNome}>{cont.nome}</div>
                  <div style={styles.continenteSub}>{cont.paises.length} países</div>
                  <div style={{ ...styles.continenteArrow, color: CONTINENTE_ACCENT[cont.id] }}>→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 1 — País */}
        {etapa === 1 && (
          <div style={styles.etapaWrap}>
            <div style={styles.etapaTitulo}>Escolha o país</div>
            <div style={styles.etapaSubtitulo}>{CONTINENTES.find(c => c.id === continenteId)?.nome}</div>
            <div style={styles.paisGrid}>
              {paises.map(pais => (
                <button key={pais.id}
                  onClick={() => { setPaisId(pais.id); setLigaId(null); setClubeId(null); avancar(2); }}
                  style={{ ...styles.paisCard, borderColor: pais.id === paisId ? accent : 'rgba(255,255,255,0.1)' }}>
                  <img src={`https://flagcdn.com/w40/${pais.flagCode}.png`} alt={pais.nome} style={styles.paisFlag} onError={e => { e.target.style.display='none'; }} />
                  <span style={styles.paisNome}>{pais.nome}</span>
                  <span style={styles.paisLigas}>{pais.ligas.length} {pais.ligas.length === 1 ? 'liga' : 'ligas'}</span>
                </button>
              ))}
            </div>
            <BtnVoltar onClick={voltar} />
          </div>
        )}

        {/* ETAPA 2 — Liga */}
        {etapa === 2 && (
          <div style={styles.etapaWrap}>
            <div style={styles.etapaTitulo}>Escolha a liga</div>
            <div style={styles.etapaSubtitulo}>{paises.find(p => p.id === paisId)?.nome}</div>
            <div style={styles.ligaList}>
              {ligas.map(liga => (
                <button key={liga.id}
                  onClick={() => { setLigaId(liga.id); setClubeId(null); avancar(3); }}
                  style={{ ...styles.ligaCard, borderColor: liga.id === ligaId ? accent : 'rgba(255,255,255,0.1)', borderLeft: `4px solid ${accent}` }}>
                  <div>
                    <div style={styles.ligaNome}>{liga.nome}</div>
                    <div style={styles.ligaSub}>{liga.numTimes} times • {liga.numRodadas} rodadas • Divisão {liga.divisaoNivel}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 18 }}>→</span>
                </button>
              ))}
            </div>
            <BtnVoltar onClick={voltar} />
          </div>
        )}

        {/* ETAPA 3 — Clube */}
        {etapa === 3 && (
          <div style={styles.etapaWrap}>
            <div style={styles.etapaTitulo}>Escolha o clube</div>
            <div style={styles.etapaSubtitulo}>{ligas.find(l => l.id === ligaId)?.nome}</div>
            {clubes.length === 0 ? (
              <div style={styles.semClubes}>
                Essa liga ainda não tem clubes cadastrados.<br />Selecione Brasil / Série A para testar.
              </div>
            ) : (
              <div style={styles.clubeGrid}>
                {clubes.map(clube => (
                  <button key={clube.id}
                    onClick={() => { setClubeId(clube.id); avancar(4); }}
                    style={{ ...styles.clubeCard, borderColor: clubeId === clube.id ? accent : 'rgba(255,255,255,0.08)' }}>
                    <ClubCrest brasao={clube.brasao} size={36} />
                    <div style={styles.clubeInfo}>
                      <div style={styles.clubeNome}>{clube.nome}</div>
                      <div style={styles.clubeObj}>{clube.objetivoTemporada}</div>
                    </div>
                    <div style={styles.clubeOrc}>
                      R$ {(clube.orcamentoInicial / 1_000_000).toFixed(0)}M
                    </div>
                  </button>
                ))}
              </div>
            )}
            <BtnVoltar onClick={voltar} />
          </div>
        )}

        {/* ETAPA 4 — Nome do treinador + confirmação */}
        {etapa === 4 && clubeSelecionado && (
          <div style={styles.etapaWrap}>
            <div style={styles.etapaTitulo}>Quase lá!</div>
            <div style={styles.etapaSubtitulo}>Como quer ser chamado?</div>

            <div style={styles.confirmCard}>
              <div style={styles.confirmClube}>
                <ClubCrest brasao={clubeSelecionado.brasao} size={56} />
                <div>
                  <div style={styles.confirmNome}>{clubeSelecionado.nome}</div>
                  <div style={styles.confirmLiga}>{ligas.find(l => l.id === ligaId)?.nome} — {paises.find(p => p.id === paisId)?.nome}</div>
                </div>
              </div>
              <div style={styles.confirmStats}>
                <ConfirmStat label="Objetivo" value={clubeSelecionado.objetivoTemporada} accent={accent} />
                <ConfirmStat label="Orçamento" value={`R$ ${(clubeSelecionado.orcamentoInicial / 1_000_000).toFixed(1)}M`} accent={accent} />
                <ConfirmStat label="Estádio" value={clubeSelecionado.estadio.nome} accent={accent} />
                <ConfirmStat label="Capacidade" value={clubeSelecionado.estadio.capacidade.toLocaleString('pt-BR')} accent={accent} />
              </div>
            </div>

            <input
              type="text"
              placeholder="Nome do treinador..."
              value={treinadorNome}
              onChange={e => setTreinadorNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && treinadorNome.trim() && iniciar()}
              style={{ ...styles.nomeInput, borderColor: treinadorNome ? accent : 'rgba(255,255,255,0.15)' }}
              autoFocus
            />

            <button
              onClick={iniciar}
              disabled={!treinadorNome.trim()}
              style={{ ...styles.iniciarBtn, background: treinadorNome.trim() ? accent : 'rgba(255,255,255,0.1)', opacity: treinadorNome.trim() ? 1 : 0.5 }}>
              ▶ Iniciar carreira
            </button>

            <BtnVoltar onClick={voltar} />
          </div>
        )}
      </div>
    </div>
  );
}

function BtnVoltar({ onClick }) {
  return (
    <button onClick={onClick} style={styles.btnVoltar}>
      ← Voltar
    </button>
  );
}

function ConfirmStat({ label, value, accent }) {
  return (
    <div style={styles.confirmStatBox}>
      <div style={{ ...styles.confirmStatLabel, color: accent }}>{label}</div>
      <div style={styles.confirmStatVal}>{value}</div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', transition: 'background 0.4s ease' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' },
  logoWrap: { display: 'flex', alignItems: 'center' },
  logoImg: { height: 40, width: 'auto' },
  topRight: { display: 'flex', alignItems: 'center', gap: 16 },
  steps: { display: 'flex', alignItems: 'center', gap: 6 },
  stepDot: { height: 8, borderRadius: 4, transition: 'all 0.3s ease' },
  stage: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 40px' },
  etapaWrap: { width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 20 },
  etapaTitulo: { color: '#fff', fontSize: 28, fontWeight: 600, margin: 0 },
  etapaSubtitulo: { color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: -12 },

  continenteGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  continenteCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid', borderRadius: 12, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', transition: 'all .15s', position: 'relative', overflow: 'hidden' },
  continenteAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '12px 0 0 12px' },
  continenteNome: { color: '#fff', fontSize: 16, fontWeight: 600, flex: 1 },
  continenteSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  continenteArrow: { fontSize: 20, fontWeight: 700 },

  paisGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  paisCard: { background: 'rgba(255,255,255,0.04)', border: '0.5px solid', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all .15s' },
  paisFlag: { width: 40, height: 'auto', borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' },
  paisNome: { color: '#fff', fontSize: 13, fontWeight: 500, textAlign: 'center' },
  paisLigas: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },

  ligaList: { display: 'flex', flexDirection: 'column', gap: 10 },
  ligaCard: { background: 'rgba(255,255,255,0.04)', border: '0.5px solid', borderRadius: 10, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .15s' },
  ligaNome: { color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 3 },
  ligaSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  clubeGrid: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' },
  clubeCard: { background: 'rgba(255,255,255,0.04)', border: '0.5px solid', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s', textAlign: 'left' },
  clubeInfo: { flex: 1 },
  clubeNome: { color: '#fff', fontSize: 14, fontWeight: 600 },
  clubeObj: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  clubeOrc: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 },
  semClubes: { color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, textAlign: 'center', padding: '40px 0' },

  confirmCard: { background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
  confirmClube: { display: 'flex', alignItems: 'center', gap: 16 },
  confirmNome: { color: '#fff', fontSize: 20, fontWeight: 600 },
  confirmLiga: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 3 },
  confirmStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  confirmStatBox: { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' },
  confirmStatLabel: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  confirmStatVal: { color: '#fff', fontSize: 13, fontWeight: 500 },

  nomeInput: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid', color: '#fff', padding: '14px 18px', borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none', transition: 'border-color .2s' },
  iniciarBtn: { width: '100%', border: 'none', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', letterSpacing: 0.5 },
  btnVoltar: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', padding: '8px 0', textAlign: 'left', width: 'fit-content' },
};
