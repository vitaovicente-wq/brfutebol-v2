import { useState, useCallback } from 'react';
import { useGame } from '../store/GameContext';
import { getClubeById } from '../data/clubsData';

// Grade de quadrantes: 5 linhas (GK→ATK) x 5 colunas (esq→dir)
// Cada posição tem afinidade com certas regiões da grade
const QUADRANTES_LINHAS = 5;
const QUADRANTES_COLUNAS = 5;

const POSICAO_QUADRANTE_IDEAL = {
  GOL: { linha: 0, coluna: 2 },
  ZAG: { linha: 1, coluna: 2 },
  LD:  { linha: 1, coluna: 4 },
  LE:  { linha: 1, coluna: 0 },
  VOL: { linha: 2, coluna: 2 },
  MEI: { linha: 3, coluna: 2 },
  ATA: { linha: 4, coluna: 2 },
};

function calcularRendimento(posicao, linha, coluna) {
  const ideal = POSICAO_QUADRANTE_IDEAL[posicao] ?? { linha: 2, coluna: 2 };
  const distLinha = Math.abs(ideal.linha - linha);
  const distColuna = Math.abs(ideal.coluna - coluna);
  const dist = distLinha + distColuna;
  if (dist === 0) return 'otimo';
  if (dist <= 1) return 'bom';
  if (dist <= 2) return 'aceitavel';
  return 'ruim';
}

const RENDIMENTO_COR = {
  otimo:    '#1D9E75',
  bom:      '#5DCAA5',
  aceitavel:'#e8d44d',
  ruim:     '#A32D2D',
};

const RENDIMENTO_LABEL = {
  otimo: '✦ Posição ideal',
  bom: '✓ Boa posição',
  aceitavel: '~ Posição aceitável',
  ruim: '✕ Fora de posição',
};

const FORMACOES = {
  '4-3-3': [
    { pos: 'GOL', l: 0, c: 2 },
    { pos: 'LD',  l: 1, c: 4 }, { pos: 'ZAG', l: 1, c: 3 }, { pos: 'ZAG', l: 1, c: 1 }, { pos: 'LE', l: 1, c: 0 },
    { pos: 'MEI', l: 2, c: 4 }, { pos: 'VOL', l: 2, c: 2 }, { pos: 'MEI', l: 2, c: 0 },
    { pos: 'ATA', l: 4, c: 4 }, { pos: 'ATA', l: 4, c: 2 }, { pos: 'ATA', l: 4, c: 0 },
  ],
  '4-4-2': [
    { pos: 'GOL', l: 0, c: 2 },
    { pos: 'LD',  l: 1, c: 4 }, { pos: 'ZAG', l: 1, c: 3 }, { pos: 'ZAG', l: 1, c: 1 }, { pos: 'LE', l: 1, c: 0 },
    { pos: 'MEI', l: 3, c: 4 }, { pos: 'VOL', l: 2, c: 3 }, { pos: 'VOL', l: 2, c: 1 }, { pos: 'MEI', l: 3, c: 0 },
    { pos: 'ATA', l: 4, c: 3 }, { pos: 'ATA', l: 4, c: 1 },
  ],
  '3-5-2': [
    { pos: 'GOL', l: 0, c: 2 },
    { pos: 'ZAG', l: 1, c: 4 }, { pos: 'ZAG', l: 1, c: 2 }, { pos: 'ZAG', l: 1, c: 0 },
    { pos: 'LD',  l: 2, c: 4 }, { pos: 'MEI', l: 3, c: 3 }, { pos: 'VOL', l: 2, c: 2 }, { pos: 'MEI', l: 3, c: 1 }, { pos: 'LE', l: 2, c: 0 },
    { pos: 'ATA', l: 4, c: 3 }, { pos: 'ATA', l: 4, c: 1 },
  ],
  '4-2-3-1': [
    { pos: 'GOL', l: 0, c: 2 },
    { pos: 'LD',  l: 1, c: 4 }, { pos: 'ZAG', l: 1, c: 3 }, { pos: 'ZAG', l: 1, c: 1 }, { pos: 'LE', l: 1, c: 0 },
    { pos: 'VOL', l: 2, c: 3 }, { pos: 'VOL', l: 2, c: 1 },
    { pos: 'MEI', l: 3, c: 4 }, { pos: 'MEI', l: 3, c: 2 }, { pos: 'MEI', l: 3, c: 0 },
    { pos: 'ATA', l: 4, c: 2 },
  ],
};

export default function LineupScreen() {
  const { estado, atualizarEstado } = useGame();
  const clube = getClubeById(estado.carreira.clubeAtualId);
  const elenco = clube?.elenco ?? [];

  const [formacao, setFormacao] = useState('4-3-3');
  const [slots, setSlots] = useState(() => initSlots('4-3-3', elenco));
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [jogadorSelecionado, setJogadorSelecionado] = useState(null);
  const [saved, setSaved] = useState(false);

  function initSlots(form, elenco) {
    const slots = FORMACOES[form].map((s, i) => ({
      ...s,
      slotId: i,
      jogador: elenco[i] ?? null,
    }));
    return slots;
  }

  function trocarFormacao(novaForm) {
    setFormacao(novaForm);
    setSlots(initSlots(novaForm, elenco));
    setSlotSelecionado(null);
    setJogadorSelecionado(null);
  }

  const jogadoresNoSlot = slots.map(s => s.jogador?.id).filter(Boolean);
  const reservas = elenco.filter(j => !jogadoresNoSlot.includes(j.id));

  function handleSlotClick(slotId) {
    const slot = slots.find(s => s.slotId === slotId);
    if (jogadorSelecionado) {
      // Coloca o jogador selecionado nesse slot
      setSlots(prev => prev.map(s => {
        if (s.slotId === slotId) return { ...s, jogador: jogadorSelecionado };
        if (s.jogador?.id === jogadorSelecionado.id) return { ...s, jogador: slot.jogador };
        return s;
      }));
      setJogadorSelecionado(null);
      setSlotSelecionado(null);
    } else {
      setSlotSelecionado(slotId === slotSelecionado ? null : slotId);
      setJogadorSelecionado(null);
    }
  }

  function handleJogadorClick(jogador) {
    if (slotSelecionado !== null) {
      setSlots(prev => prev.map(s =>
        s.slotId === slotSelecionado ? { ...s, jogador } : s
      ));
      setSlotSelecionado(null);
      setJogadorSelecionado(null);
    } else {
      setJogadorSelecionado(j => j?.id === jogador.id ? null : jogador);
    }
  }

  function autoEscalar() {
    const form = FORMACOES[formacao];
    const usados = new Set();
    const novosSlots = form.map((s) => {
      const candidatos = elenco
        .filter(j => !usados.has(j.id))
        .sort((a, b) => {
          const ra = calcularRendimento(a.posicao, s.l, s.c);
          const rb = calcularRendimento(b.posicao, s.l, s.c);
          const ord = ['otimo','bom','aceitavel','ruim'];
          if (ord.indexOf(ra) !== ord.indexOf(rb)) return ord.indexOf(ra) - ord.indexOf(rb);
          return b.ovr - a.ovr;
        });
      const escolhido = candidatos[0] ?? null;
      if (escolhido) usados.add(escolhido.id);
      return { ...s, slotId: form.indexOf(s), jogador: escolhido };
    });
    setSlots(novosSlots.map((s, i) => ({ ...s, slotId: i })));
    setSlotSelecionado(null);
    setJogadorSelecionado(null);
  }

  function salvar() {
    atualizarEstado(atual => ({
      ...atual,
      mundo: {
        ...atual.mundo,
        escalacao: { formacao, slots: slots.map(s => ({ slotId: s.slotId, jogadorId: s.jogador?.id ?? null })) },
      },
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const slotAtivo = slots.find(s => s.slotId === slotSelecionado);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>Tática</div>
          <h1 style={styles.title}>Escalação</h1>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.formacoes}>
            {Object.keys(FORMACOES).map(f => (
              <button key={f} onClick={() => trocarFormacao(f)}
                style={f === formacao ? styles.formBtn : styles.formBtnInactive}>
                {f}
              </button>
            ))}
          </div>
          <button style={styles.autoBtn} onClick={autoEscalar}>⚡ Auto</button>
          <button style={{ ...styles.saveBtn, background: saved ? '#0F6E56' : '#1D9E75' }} onClick={salvar}>
            {saved ? '✓ Salvo!' : 'Salvar'}
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Lista de reservas */}
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Elenco / Reservas</div>
          <div style={styles.panelHint}>
            {jogadorSelecionado
              ? `Selecionado: ${jogadorSelecionado.nome} — clique em um slot no campo`
              : slotSelecionado !== null
              ? `Slot vazio selecionado — clique em um jogador`
              : 'Clique num jogador para selecioná-lo'}
          </div>
          <div style={styles.playerList}>
            {reservas.map(j => (
              <div key={j.id}
                onClick={() => handleJogadorClick(j)}
                style={{ ...styles.playerRow, ...(jogadorSelecionado?.id === j.id ? styles.playerRowSelected : {}) }}>
                <span style={styles.posBadge}>{j.posicao}</span>
                <span style={styles.playerName}>{j.nome}</span>
                <span style={styles.playerOvr}>{j.ovr}</span>
              </div>
            ))}
            {reservas.length === 0 && <div style={styles.emptyText}>Todos escalados</div>}
          </div>
        </div>

        {/* Campo com quadrantes */}
        <div style={styles.fieldWrap}>
          <div style={styles.field}>
            {/* Grade de quadrantes de fundo */}
            {Array.from({ length: QUADRANTES_LINHAS }).map((_, l) =>
              Array.from({ length: QUADRANTES_COLUNAS }).map((_, c) => (
                <div key={`${l}-${c}`} style={{
                  ...styles.quadrante,
                  top: `${(l / QUADRANTES_LINHAS) * 100}%`,
                  left: `${(c / QUADRANTES_COLUNAS) * 100}%`,
                  width: `${100 / QUADRANTES_COLUNAS}%`,
                  height: `${100 / QUADRANTES_LINHAS}%`,
                  background: slotAtivo
                    ? `${RENDIMENTO_COR[calcularRendimento(slotAtivo.pos, l, c)]}22`
                    : 'transparent',
                }} />
              ))
            )}

            {/* Linhas do campo */}
            <div style={styles.fieldLine} />
            <div style={styles.fieldCircle} />
            <div style={styles.fieldPA1} />
            <div style={styles.fieldPA2} />

            {/* Slots de jogadores */}
            {slots.map(slot => {
              const top = ((slot.l + 0.5) / QUADRANTES_LINHAS) * 100;
              const left = ((slot.c + 0.5) / QUADRANTES_COLUNAS) * 100;
              const isSelected = slot.slotId === slotSelecionado;
              const rendimento = slot.jogador ? calcularRendimento(slot.jogador.posicao, slot.l, slot.c) : null;
              const cor = rendimento ? RENDIMENTO_COR[rendimento] : 'rgba(255,255,255,0.2)';

              return (
                <div key={slot.slotId}
                  onClick={() => handleSlotClick(slot.slotId)}
                  style={{
                    ...styles.slot,
                    top: `${top}%`,
                    left: `${left}%`,
                    transform: 'translate(-50%, -50%)',
                  }}>
                  <div style={{
                    ...styles.kit,
                    background: slot.jogador ? cor : 'rgba(255,255,255,0.08)',
                    border: isSelected ? '2px solid #fff' : `2px solid ${cor}88`,
                    boxShadow: isSelected ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
                  }}>
                    {slot.jogador ? slot.jogador.posicao : '+'}
                  </div>
                  {slot.jogador && (
                    <div style={styles.kitLabel}>
                      {slot.jogador.nome.split(' ')[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legenda de rendimento */}
          <div style={styles.legend}>
            {Object.entries(RENDIMENTO_LABEL).map(([key, label]) => (
              <div key={key} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: RENDIMENTO_COR[key] }} />
                <span style={styles.legendText}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Painel direito: detalhe do slot selecionado */}
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Detalhe</div>
          {slotAtivo?.jogador ? (
            <>
              <div style={styles.detailName}>{slotAtivo.jogador.nome}</div>
              <div style={styles.detailPos}>{slotAtivo.jogador.posicao} • OVR {slotAtivo.jogador.ovr}</div>
              {(() => {
                const r = calcularRendimento(slotAtivo.jogador.posicao, slotAtivo.l, slotAtivo.c);
                return (
                  <div style={{ ...styles.rendimentoBadge, background: `${RENDIMENTO_COR[r]}22`, color: RENDIMENTO_COR[r], border: `0.5px solid ${RENDIMENTO_COR[r]}` }}>
                    {RENDIMENTO_LABEL[r]}
                  </div>
                );
              })()}
              <div style={styles.atribGrid}>
                {Object.entries(slotAtivo.jogador.atributos).map(([k, v]) => (
                  <div key={k} style={styles.atribBox}>
                    <div style={styles.atribLabel}>{k.toUpperCase()}</div>
                    <div style={styles.atribVal}>{v}</div>
                  </div>
                ))}
              </div>
              <button
                style={styles.removeBtn}
                onClick={() => {
                  setSlots(prev => prev.map(s => s.slotId === slotSelecionado ? { ...s, jogador: null } : s));
                  setSlotSelecionado(null);
                }}>
                Remover do slot
              </button>
            </>
          ) : slotSelecionado !== null ? (
            <div style={styles.emptyText}>Slot vazio — clique em um jogador na lista</div>
          ) : (
            <div style={styles.emptyText}>Clique em um jogador no campo para ver os detalhes</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: 28, minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  kicker: { fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: 500, margin: 0 },
  headerActions: { display: 'flex', alignItems: 'center', gap: 8 },
  formacoes: { display: 'flex', gap: 6 },
  formBtn: { background: '#1D9E75', border: 'none', color: '#E1F5EE', padding: '7px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  formBtnInactive: { background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', padding: '7px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer' },
  autoBtn: { background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer' },
  saveBtn: { border: 'none', color: '#E1F5EE', padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'background .2s' },
  grid: { display: 'grid', gridTemplateColumns: '200px 1fr 200px', gap: 16 },
  panel: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 },
  panelTitle: { fontSize: 11, color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 },
  panelHint: { fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, minHeight: 28 },
  playerList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 },
  playerRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, border: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' },
  playerRowSelected: { border: '0.5px solid #1D9E75', background: 'rgba(29,158,117,0.15)' },
  posBadge: { fontSize: 10, fontWeight: 600, color: '#5DCAA5', background: 'rgba(29,158,117,0.15)', padding: '2px 5px', borderRadius: 4, minWidth: 28, textAlign: 'center' },
  playerName: { fontSize: 12, color: '#fff', flex: 1 },
  playerOvr: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
  emptyText: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 20 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { position: 'relative', width: '100%', paddingBottom: '140%', background: '#1a4a26', borderRadius: 10, overflow: 'hidden' },
  quadrante: { position: 'absolute', transition: 'background .2s', pointerEvents: 'none' },
  fieldLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.2)', pointerEvents: 'none' },
  fieldCircle: { position: 'absolute', top: '50%', left: '50%', width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' },
  fieldPA1: { position: 'absolute', top: 0, left: '20%', right: '20%', height: '12%', border: '1px solid rgba(255,255,255,0.2)', borderTop: 'none', pointerEvents: 'none' },
  fieldPA2: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '12%', border: '1px solid rgba(255,255,255,0.2)', borderBottom: 'none', pointerEvents: 'none' },
  slot: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', zIndex: 2 },
  kit: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#fff', transition: 'all .15s' },
  kitLabel: { fontSize: 9, color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '1px 5px', borderRadius: 3, whiteSpace: 'nowrap', maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis' },
  legend: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: '50%' },
  legendText: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  detailName: { color: '#fff', fontSize: 15, fontWeight: 600 },
  detailPos: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  rendimentoBadge: { fontSize: 11, padding: '4px 10px', borderRadius: 6, fontWeight: 500, textAlign: 'center' },
  atribGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 4 },
  atribBox: { background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' },
  atribLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  atribVal: { fontSize: 14, fontWeight: 600, color: '#fff' },
  removeBtn: { width: '100%', background: 'rgba(163,45,45,0.2)', border: '0.5px solid rgba(163,45,45,0.4)', color: '#e07b39', padding: '8px', borderRadius: 7, fontSize: 12, cursor: 'pointer', marginTop: 4 },
};
