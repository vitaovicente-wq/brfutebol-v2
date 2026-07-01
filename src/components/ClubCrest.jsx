// Brasão genérico do clube, desenhado em SVG a partir de cores e iniciais —
// não reproduz nenhum escudo real. Pode ser substituído por upload próprio
// quando o Editor de Universo for implementado.

export default function ClubCrest({ brasao, size = 48 }) {
  const { cor1, cor2, iniciais } = brasao;
  const h = size * 1.125;
  return (
    <svg width={size} height={h} viewBox="0 0 48 54">
      <path
        d="M24 2 L44 9 L44 26 C44 40 35 49 24 52 C13 49 4 40 4 26 L4 9 Z"
        fill={cor1}
        stroke={cor2}
        strokeWidth="2"
      />
      <path
        d="M24 7 L39 12.5 L39 26 C39 37 32 44.5 24 47 C16 44.5 9 37 9 26 L9 12.5 Z"
        fill="none"
        stroke={cor2}
        strokeWidth="1"
        opacity="0.5"
      />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontSize="14"
        fontWeight="500"
        fill="#fff"
      >
        {iniciais}
      </text>
    </svg>
  );
}
