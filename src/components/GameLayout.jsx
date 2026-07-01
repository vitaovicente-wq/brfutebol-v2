import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function GameLayout() {
  return (
    <div style={styles.wrap}>
      <Sidebar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    minHeight: '100vh',
    background: '#111c16',
    fontFamily: 'Arial, sans-serif',
    color: '#fff',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    minHeight: '100vh',
  },
};
