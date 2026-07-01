import { NavLink } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { getClubeById } from '../data/clubsData';
import ClubCrest from './ClubCrest';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/escalacao', icon: '⚽', label: 'Escalação' },
  { to: '/partida', icon: '▶', label: 'Partida' },
  { to: '/calendario', icon: '📅', label: 'Calendário' },
  { to: '/classificacao', icon: '🏆', label: 'Classificação' },
  { to: '/mercado', icon: '🔄', label: 'Mercado' },
  { to: '/financas', icon: '💰', label: 'Finanças' },
  { to: '/estadio', icon: '🏟', label: 'Estádio' },
  { to: '/mensagens', icon: '✉', label: 'Mensagens' },
  { to: '/treinador', icon: '👤', label: 'Treinador' },
];

export default function Sidebar() {
  const { estado } = useGame();
  const clube = estado ? getClubeById(estado.carreira.clubeAtualId) : null;

  return (
    <nav style={styles.sidebar}>
      <div style={styles.brand}>
        {clube && <ClubCrest brasao={clube.brasao} size={32} />}
        <span style={styles.brandName}>BRFutebol</span>
      </div>

      <div style={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {estado && (
        <div style={styles.footer}>
          <div style={styles.footerClub}>{clube?.nome}</div>
          <div style={styles.footerCoach}>{estado.treinador.nome}</div>
        </div>
      )}
    </nav>
  );
}

const styles = {
  sidebar: {
    width: 200,
    minHeight: '100vh',
    background: '#0d1b14',
    borderRight: '0.5px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px',
    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
  },
  brandName: { color: '#5DCAA5', fontWeight: 700, fontSize: 14, letterSpacing: 1 },
  navList: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    transition: 'all .15s',
  },
  navItemActive: {
    background: 'rgba(29,158,117,0.15)',
    color: '#5DCAA5',
  },
  navIcon: { fontSize: 15, width: 20, textAlign: 'center' },
  navLabel: {},
  footer: {
    padding: '14px 16px',
    borderTop: '0.5px solid rgba(255,255,255,0.08)',
  },
  footerClub: { color: '#fff', fontSize: 12, fontWeight: 500 },
  footerCoach: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
};
