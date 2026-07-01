// Mapa-múndi estilizado e clicável para seleção de continente.
// Formas simplificadas (não é um mapa geograficamente preciso) — o objetivo
// é dar a sensação de "escolher uma região no globo", não cartografia exata.

const REGIOES = [
  { id: 'america-norte', nome: 'América do Norte', path: 'M70 50 L160 40 L190 70 L185 110 L150 130 L130 160 L90 150 L60 110 Z', labelX: 125, labelY: 95 },
  { id: 'america-sul', nome: 'América do Sul', path: 'M150 170 L195 160 L210 200 L195 250 L165 270 L140 230 L145 195 Z', labelX: 175, labelY: 215 },
  { id: 'europa', nome: 'Europa', path: 'M330 50 L390 45 L400 80 L380 100 L340 95 L320 75 Z', labelX: 358, labelY: 73 },
  { id: 'asia', nome: 'Ásia', path: 'M420 50 L540 45 L570 90 L530 140 L460 130 L410 95 Z', labelX: 488, labelY: 92 },
];

export default function WorldMap({ continenteAtivo, onSelecionar }) {
  return (
    <svg width="100%" viewBox="0 0 680 300" role="img" aria-label="Mapa-múndi para seleção de continente">
      {REGIOES.map((regiao) => {
        const ativo = regiao.id === continenteAtivo;
        return (
          <g
            key={regiao.id}
            onClick={() => onSelecionar(regiao.id)}
            style={{ cursor: 'pointer' }}
          >
            <path
              d={regiao.path}
              fill={ativo ? 'rgba(29,158,117,0.55)' : 'rgba(93,202,165,0.18)'}
              stroke={ativo ? '#5DCAA5' : 'rgba(93,202,165,0.5)'}
              strokeWidth={ativo ? 2 : 1.5}
              style={{ transition: 'all .15s' }}
            />
            <text
              x={regiao.labelX}
              y={regiao.labelY}
              textAnchor="middle"
              fontSize="11"
              fontWeight="500"
              fill={ativo ? '#fff' : 'rgba(255,255,255,0.7)'}
              style={{ pointerEvents: 'none' }}
            >
              {regiao.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
