import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { formatarData } from '../engine/calendarEngine';
import { getClubeById } from '../data/clubsData';

function gerarMensagensIniciais(estado) {
  const clube = getClubeById(estado.carreira.clubeAtualId);
  const data = estado.carreira.dataAtual;
  return [
    {
      id: 'boas-vindas',
      tipo: 'diretoria',
      assunto: `Bem-vindo ao ${clube?.nome}!`,
      remetente: 'Diretoria do Clube',
      data,
      lida: false,
      corpo: `Prezado ${estado.treinador.nome},\n\nÉ com grande satisfação que damos as boas-vindas ao nosso novo treinador. O ${clube?.nome} tem grandes expectativas para esta temporada e confiamos em seu trabalho.\n\nNosso objetivo é claro: ${clube?.objetivoTemporada}. Contamos com você para liderar nosso grupo com garra e determinação.\n\nO elenco está à sua disposição. Bom trabalho!\n\nAtenciosamente,\nDiretoria ${clube?.nome}`,
    },
    {
      id: 'patrocinio',
      tipo: 'contrato',
      assunto: 'Proposta de Patrocínio Master',
      remetente: 'Departamento Comercial',
      data,
      lida: false,
      corpo: `Treinador,\n\nRecebemos uma proposta de patrocínio master de uma grande empresa do setor automotivo.\n\nCondições oferecidas:\n• Luvas de assinatura: R$ 2.000.000\n• Mensalidade: R$ 500.000\n• Duração: 1 temporada\n\nAguardamos sua aprovação para prosseguir com a negociação.\n\nDepartamento Comercial`,
      acao: { label: 'Aceitar patrocínio', tipo: 'patrocinio' },
    },
    {
      id: 'mercado-info',
      tipo: 'scout',
      assunto: 'Relatório do Departamento de Scout',
      remetente: 'Coordenador de Scout',
      data,
      lida: false,
      corpo: `Treinador,\n\nIdentificamos alguns jogadores interessantes disponíveis no mercado que podem reforçar nosso elenco. Acesse a seção Mercado para ver os agentes livres disponíveis.\n\nDestaque: há um atacante experiente com OVR acima de 80 disponível para contratação imediata.\n\nCoordenador de Scout`,
    },
  ];
}

export default function MessagesScreen() {
  const { estado, atualizarEstado } = useGame();
  const [mensagemAberta, setMensagemAberta] = useState(null);
  const [mensagens, setMensagens] = useState(() => {
    if (estado.mensagens && estado.mensagens.length > 0) return estado.mensagens;
    return gerarMensagensIniciais(estado);
  });

  function abrirMensagem(msg) {
    setMensagemAberta(msg);
    if (!msg.lida) {
      setMensagens(prev => prev.map(m => m.id === msg.id ? { ...m, lida: true } : m));
      atualizarEstado(atual => ({
        ...atual,
        mensagens: mensagens.map(m => m.id === msg.id ? { ...m, lida: true } : m),
      }));
    }
  }

  function executarAcao(acao, msgId) {
    if (acao.tipo === 'patrocinio') {
      atualizarEstado(atual => ({
        ...atual,
        financas: {
          historico: [...atual.financas.historico, {
            texto: 'Luvas — Patrocínio Master',
            valor: 2000000,
            tipo: 'entrada',
            data: atual.carreira.dataAtual,
          }],
        },
      }));
      setMensagens(prev => prev.map(m => m.id === msgId
        ? { ...m, acao: { ...m.acao, executada: true, label: '✓ Patrocínio aceito!' } }
        : m
      ));
      setMensagemAberta(prev => prev ? { ...prev, acao: { ...prev.acao, executada: true, label: '✓ Patrocínio aceito!' } } : null);
    }
  }

  const naoLidas = mensagens.filter(m => !m.lida).length;

  const TIPO_COR = {
    diretoria: '#185FA5',
    contrato: '#1D9E75',
    scout: '#854F0B',
    narrativa: '#534AB7',
    imprensa: '#993C1D',
  };

  const TIPO_ICON = {
    diretoria: '🏛',
    contrato: '📋',
    scout: '🔍',
    narrativa: '⚡',
    imprensa: '📰',
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.kicker}>Comunicações</div>
        <h1 style={styles.title}>
          Mensagens
          {naoLidas > 0 && <span style={styles.badge}>{naoLidas}</span>}
        </h1>
      </div>

      <div style={styles.grid}>
        {/* Lista de mensagens */}
        <div style={styles.lista}>
          {mensagens.map(msg => (
            <div key={msg.id}
              onClick={() => abrirMensagem(msg)}
              style={{
                ...styles.msgRow,
                borderLeft: `3px solid ${TIPO_COR[msg.tipo] ?? '#5DCAA5'}`,
                background: mensagemAberta?.id === msg.id
                  ? 'rgba(29,158,117,0.1)'
                  : msg.lida ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
              }}>
              <div style={styles.msgIcon}>{TIPO_ICON[msg.tipo] ?? '✉'}</div>
              <div style={styles.msgInfo}>
                <div style={styles.msgAssunto}>
                  {!msg.lida && <span style={styles.naoLidaDot} />}
                  {msg.assunto}
                </div>
                <div style={styles.msgMeta}>{msg.remetente}</div>
              </div>
              <div style={styles.msgData}>
                {formatarData(msg.data, { curto: true })}
              </div>
            </div>
          ))}
        </div>

        {/* Corpo da mensagem */}
        <div style={styles.corpo}>
          {!mensagemAberta ? (
            <div style={styles.emptyCorpo}>
              <div style={styles.emptyIcon}>✉️</div>
              <div style={styles.emptyText}>Selecione uma mensagem para ler</div>
            </div>
          ) : (
            <>
              <div style={styles.corpoHeader}>
                <div style={styles.corpoAssunto}>{mensagemAberta.assunto}</div>
                <div style={styles.corpoMeta}>
                  <span style={{ ...styles.tipoBadge, background: `${TIPO_COR[mensagemAberta.tipo]}22`, color: TIPO_COR[mensagemAberta.tipo] }}>
                    {TIPO_ICON[mensagemAberta.tipo]} {mensagemAberta.tipo}
                  </span>
                  <span style={styles.corpoRemetente}>{mensagemAberta.remetente}</span>
                  <span style={styles.corpoData}>{formatarData(mensagemAberta.data, { comDiaSemana: true })}</span>
                </div>
              </div>
              <div style={styles.corpoTexto}>
                {mensagemAberta.corpo.split('\n').map((linha, i) => (
                  <p key={i} style={styles.corpoLinha}>{linha}</p>
                ))}
              </div>
              {mensagemAberta.acao && (
                <div style={styles.acaoWrap}>
                  <button
                    disabled={mensagemAberta.acao.executada}
                    onClick={() => executarAcao(mensagemAberta.acao, mensagemAberta.id)}
                    style={{
                      ...styles.acaoBtn,
                      opacity: mensagemAberta.acao.executada ? 0.6 : 1,
                      background: mensagemAberta.acao.executada ? '#0F6E56' : '#1D9E75',
                    }}>
                    {mensagemAberta.acao.label}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: 28, minHeight: '100vh' },
  header: { marginBottom: 24 },
  kicker: { fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: 10 },
  badge: { background: '#A32D2D', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10 },
  grid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' },
  lista: { display: 'flex', flexDirection: 'column', gap: 4 },
  msgRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, cursor: 'pointer', border: '0.5px solid rgba(255,255,255,0.06)', transition: 'background .15s' },
  msgIcon: { fontSize: 18, flexShrink: 0 },
  msgInfo: { flex: 1, minWidth: 0 },
  msgAssunto: { color: '#fff', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 },
  msgMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  msgData: { color: 'rgba(255,255,255,0.3)', fontSize: 10, flexShrink: 0 },
  naoLidaDot: { width: 7, height: 7, borderRadius: '50%', background: '#5DCAA5', flexShrink: 0, display: 'inline-block' },
  corpo: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, minHeight: 400 },
  emptyCorpo: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
  corpoHeader: { marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid rgba(255,255,255,0.08)' },
  corpoAssunto: { color: '#fff', fontSize: 17, fontWeight: 600, marginBottom: 8 },
  corpoMeta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  tipoBadge: { fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' },
  corpoRemetente: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  corpoData: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  corpoTexto: { lineHeight: 1.7 },
  corpoLinha: { color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '4px 0' },
  acaoWrap: { marginTop: 20, paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.08)' },
  acaoBtn: { border: 'none', color: '#E1F5EE', padding: '11px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
};
