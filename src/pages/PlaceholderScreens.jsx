// Telas placeholder — estrutura e navegação prontas, lógica específica em breve.

function Placeholder({ titulo, descricao }) {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ fontSize: 11, color: '#5DCAA5', letterSpacing: 1, marginBottom: 4 }}>Em desenvolvimento</div>
      <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 500, margin: '0 0 12px' }}>{titulo}</h1>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{descricao}</div>
    </div>
  );
}

export function LineupScreen() {
  return <Placeholder titulo="Escalação" descricao="Posicionamento por quadrantes com impacto no rendimento dos jogadores — em breve." />;
}

export function MarketScreen() {
  return <Placeholder titulo="Mercado de Transferências" descricao="Agentes livres e transferências com negociação interativa — em breve." />;
}

export function StadiumScreen() {
  return <Placeholder titulo="Estádio" descricao="Gestão de bilheteria, obras e aluguéis — em breve." />;
}

export function MessagesScreen() {
  return <Placeholder titulo="Mensagens" descricao="Comunicados, eventos narrativos e propostas de outros clubes — em breve." />;
}
