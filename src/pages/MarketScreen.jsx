import { useState, useMemo } from 'react';
import { useGame } from '../store/GameContext';
import { getClubeById } from '../data/clubsData';

const NOMES_MERCADO = [
  'Lucas Moura','Willian','Hulk','Diego Costa','Éverton Cebolinha','Gabriel Barbosa',
  'Robinho','Elias','Ramires','Jô','Luan','Léo Moura','Thiago Neves','Wellington Nim',
  'Rafael Sobis','Anderson','Alex','Magrão','Pedrão','Kléberson',
];
const POSICOES = ['GOL','ZAG','LD','LE','VOL','MEI','ATA'];

function gerarAgentesLivres() {
  return Array.from({ length: 15 }, (_, i) => {
    const pos = POSICOES[i % POSICOES.length];
    const ovr = 60 + Math.floor(Math.random() * 25);
    return {
      id: `livre-${i}`,
      nome: NOMES_MERCADO[i % NOMES_MERCADO.length],
      posicao: pos,
      idade: 20 + Math.floor(Math.random() * 15),
      ovr,
      salarioMin: Math.round(ovr * 600),
      luviasMin: Math.round(ovr * 1200),
      atributos: {
        pac: Math.max(30, ovr + Math.floor(Math.random()*10)-5),
        sho: Math.max(30, ovr + Math.floor(Math.random()*10)-5),
        pas: Math.max(30, ovr + Math.floor(Math.random()*10)-5),
        dri: Math.max(30, ovr + Math.floor(Math.random()*10)-5),
        def: Math.max(30, ovr + Math.floor(Math.random()*10)-5),
        phy: Math.max(30, ovr + Math.floor(Math.random()*10)-5),
      },
    };
  });
}

const AGENTES_LIVRES = gerarAgentesLivres();

const ETAPAS = ['papel', 'duracao', 'salario', 'luvas', 'fim'];
const PAPEL_OPCOES = ['Titular Absoluto','Titular Importante','Rotação','Reserva'];
const DURACAO_OPCOES = [1, 2, 3, 4, 5];

export default function MarketScreen() {
  const { estado, atualizarEstado } = useGame();
  const clube = getClubeById(estado.carreira.clubeAtualId);
  const [filtroPos, setFiltroPos] = useState('Todos');
  const [jogadorSel, setJogadorSel] = useState(null);
  const [etapa, setEtapa] = useState(0);
  const [papel, setPapel] = useState(null);
  const [duracao, setDuracao] = useState(null);
  const [salario, setSalario] = useState('');
  const [luvas, setLuvas] = useState('');
  const [resposta, setResposta] = useState(null);
  const [contratados, setContratados] = useState([]);

  const filtrados = useMemo(() =>
    AGENTES_LIVRES.filter(j =>
      !contratados.includes(j.id) &&
      (filtroPos === 'Todos' || j.posicao === filtroPos)
    ), [filtroPos, contratados]);

  function abrirNegociacao(jogador) {
    setJogadorSel(jogador);
    setEtapa(0);
    setPapel(null); setDuracao(null); setSalario(''); setLuvas(''); setResposta(null);
  }

  function fecharNegociacao() {
    setJogadorSel(null); setEtapa(0); setResposta(null);
  }

  function avaliarOfertas() {
    const salNum = Number(salario);
    const luvasNum = Number(luvas);
    const aceitaSalario = salNum >= jogadorSel.salarioMin;
    const aceitaLuvas = luvasNum >= jogadorSel.luviasMin;
    if (aceitaSalario && aceitaLuvas) return 'aceite';
    if (aceitaSalario || aceitaLuvas) return 'hesita';
    return 'recusa';
  }

  function confirmarContrato() {
    const jogador = {
      ...jogadorSel,
      id: `contratado-${jogadorSel.id}`,
      condicao: 100,
      moral: 80,
      contrato: { duracaoAnos: duracao, salarioMensal: Number(salario) },
    };
    atualizarEstado(atual => {
      const clubes = atual.mundo.clubes.map(c =>
        c.id === estado.carreira.clubeAtualId
          ? { ...c, elenco: [...c.elenco, jogador] }
          : c
      );
      return {
        ...atual,
        mundo: { ...atual.mundo, clubes },
        financas: {
          historico: [...atual.financas.historico, {
            texto: `Luvas — ${jogador.nome}`,
            valor: Number(luvas),
            tipo: 'saida',
            data: atual.carreira.dataAtual,
          }],
        },
      };
    });
    setContratados(prev => [...prev, jogadorSel.id]);
    setResposta('contratado');
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.kicker}>Transferências</div>
        <h1 style={styles.title}>Mercado</h1>
      </div>

      <div style={styles.grid}>
        {/* Lista de agentes livres */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Agentes Livres</div>
          <div style={styles.filtros}>
            {['Todos', ...POSICOES].map(p => (
              <button key={p} onClick={() => setFiltroPos(p)}
                style={p === filtroPos ? styles.filtroActive : styles.filtro}>
                {p}
              </button>
            ))}
          </div>
          <div style={styles.lista}>
            {filtrados.map(j => (
              <div key={j.id} style={styles.jogadorRow} onClick={() => abrirNegociacao(j)}>
                <span style={styles.posBadge}>{j.posicao}</span>
                <div style={styles.jogadorInfo}>
                  <span style={styles.jogadorNome}>{j.nome}</span>
                  <span style={styles.jogadorMeta}>{j.idade} anos</span>
                </div>
                <span style={{ ...styles.ovrBadge, color: j.ovr >= 75 ? '#5DCAA5' : j.ovr >= 65 ? '#e8d44d' : '#e07b39' }}>
                  {j.ovr}
                </span>
                <button style={styles.negBtn}>Negociar</button>
              </div>
            ))}
            {filtrados.length === 0 && <div style={styles.emptyText}>Nenhum agente disponível nessa posição.</div>}
          </div>
        </div>

        {/* Painel de negociação */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Negociação</div>
          {!jogadorSel ? (
            <div style={styles.emptyNeg}>
              <div style={styles.emptyIcon}>🤝</div>
              <div style={styles.emptyText}>Selecione um jogador para iniciar a negociação</div>
            </div>
          ) : (
            <div style={styles.negWrap}>
              <div style={styles.negHeader}>
                <div style={styles.negNome}>{jogadorSel.nome}</div>
                <div style={styles.negMeta}>{jogadorSel.posicao} • {jogadorSel.idade} anos • OVR {jogadorSel.ovr}</div>
              </div>

              <div style={styles.atribGrid}>
                {Object.entries(jogadorSel.atributos).map(([k, v]) => (
                  <div key={k} style={styles.atribBox}>
                    <div style={styles.atribLabel}>{k.toUpperCase()}</div>
                    <div style={styles.atribVal}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Etapas */}
              {resposta === 'contratado' ? (
                <div style={styles.sucesso}>
                  ✅ {jogadorSel.nome} contratado com sucesso!
                  <button style={styles.fecharBtn} onClick={fecharNegociacao}>Fechar</button>
                </div>
              ) : (
                <>
                  {etapa === 0 && (
                    <Etapa titulo="Qual será o papel dele no time?">
                      {PAPEL_OPCOES.map(p => (
                        <OpcaoBtn key={p} label={p} selecionado={papel === p} onClick={() => setPapel(p)} />
                      ))}
                      <BtnAvancar disabled={!papel} onClick={() => setEtapa(1)} />
                    </Etapa>
                  )}
                  {etapa === 1 && (
                    <Etapa titulo="Duração do contrato (anos)">
                      <div style={{ display: 'flex', gap: 8 }}>
                        {DURACAO_OPCOES.map(d => (
                          <OpcaoBtn key={d} label={`${d} ano${d > 1 ? 's' : ''}`} selecionado={duracao === d} onClick={() => setDuracao(d)} />
                        ))}
                      </div>
                      <BtnAvancar disabled={!duracao} onClick={() => setEtapa(2)} />
                    </Etapa>
                  )}
                  {etapa === 2 && (
                    <Etapa titulo="Salário mensal (R$)">
                      <div style={styles.inputHint}>Mínimo esperado: R$ {jogadorSel.salarioMin.toLocaleString('pt-BR')}</div>
                      <input type="number" placeholder="Ex: 50000" value={salario}
                        onChange={e => setSalario(e.target.value)} style={styles.input} />
                      <BtnAvancar disabled={!salario} onClick={() => setEtapa(3)} />
                    </Etapa>
                  )}
                  {etapa === 3 && (
                    <Etapa titulo="Luvas de assinatura (R$)">
                      <div style={styles.inputHint}>Mínimo esperado: R$ {jogadorSel.luviasMin.toLocaleString('pt-BR')}</div>
                      <input type="number" placeholder="Ex: 100000" value={luvas}
                        onChange={e => setLuvas(e.target.value)} style={styles.input} />
                      <button style={styles.avancarBtn} disabled={!luvas}
                        onClick={() => { setResposta(avaliarOfertas()); setEtapa(4); }}>
                        Fazer proposta
                      </button>
                    </Etapa>
                  )}
                  {etapa === 4 && resposta && (
                    <Etapa titulo="Resposta do jogador">
                      <div style={styles.respostaBubble}>
                        {resposta === 'aceite' && `"Perfeito! Estou dentro. Vamos trabalhar juntos!" 🤝`}
                        {resposta === 'hesita' && `"Quase lá... uma das condições ficou abaixo do que esperava. Que tal rever a proposta?" 🤔`}
                        {resposta === 'recusa' && `"Infelizmente essa proposta não me agrada. Preciso de melhores condições." ❌`}
                      </div>
                      {resposta === 'aceite' && (
                        <button style={styles.avancarBtn} onClick={confirmarContrato}>✅ Confirmar contrato</button>
                      )}
                      {resposta !== 'aceite' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={styles.tentarBtn} onClick={() => { setEtapa(2); setResposta(null); setSalario(''); setLuvas(''); }}>
                            Renegociar
                          </button>
                          <button style={styles.fecharBtn} onClick={fecharNegociacao}>Desistir</button>
                        </div>
                      )}
                    </Etapa>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Etapa({ titulo, children }) {
  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{titulo}</div>
      {children}
    </div>
  );
}

function OpcaoBtn({ label, selecionado, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: selecionado ? '#1D9E75' : 'rgba(255,255,255,0.05)',
      border: `0.5px solid ${selecionado ? '#1D9E75' : 'rgba(255,255,255,0.12)'}`,
      color: selecionado ? '#E1F5EE' : 'rgba(255,255,255,0.7)',
      padding: '8px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
    }}>{label}</button>
  );
}

function BtnAvancar({ disabled, onClick }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{
      ...styles.avancarBtn, opacity: disabled ? 0.4 : 1,
    }}>Continuar →</button>
  );
}

const styles = {
  wrap: { padding: 28, minHeight: '100vh' },
  header: { marginBottom: 24 },
  kicker: { fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: 500, margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  card: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 11, color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  filtros: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  filtro: { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer' },
  filtroActive: { background: '#1D9E75', border: '0.5px solid #1D9E75', color: '#E1F5EE', padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer' },
  lista: { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 480, overflowY: 'auto' },
  jogadorRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 8, cursor: 'pointer' },
  posBadge: { fontSize: 10, fontWeight: 600, color: '#5DCAA5', background: 'rgba(29,158,117,0.15)', padding: '2px 6px', borderRadius: 4, minWidth: 28, textAlign: 'center' },
  jogadorInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  jogadorNome: { color: '#fff', fontSize: 13, fontWeight: 500 },
  jogadorMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  ovrBadge: { fontSize: 14, fontWeight: 700 },
  negBtn: { background: 'rgba(29,158,117,0.15)', border: '0.5px solid rgba(29,158,117,0.4)', color: '#5DCAA5', padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer' },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', marginTop: 20 },
  emptyNeg: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 },
  emptyIcon: { fontSize: 40 },
  negWrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  negHeader: { padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.08)' },
  negNome: { color: '#fff', fontSize: 16, fontWeight: 600 },
  negMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  atribGrid: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6 },
  atribBox: { background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '6px 4px', textAlign: 'center' },
  atribLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  atribVal: { fontSize: 13, fontWeight: 600, color: '#fff' },
  inputHint: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 12px', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  avancarBtn: { width: '100%', background: '#1D9E75', border: 'none', color: '#E1F5EE', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  tentarBtn: { flex: 1, background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.15)', color: '#fff', padding: '9px', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  fecharBtn: { flex: 1, background: 'rgba(163,45,45,0.2)', border: '0.5px solid rgba(163,45,45,0.3)', color: '#e07b39', padding: '9px', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  respostaBubble: { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#fff', lineHeight: 1.5 },
  sucesso: { display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', padding: '20px 0', color: '#5DCAA5', fontSize: 14, fontWeight: 500, textAlign: 'center' },
};
