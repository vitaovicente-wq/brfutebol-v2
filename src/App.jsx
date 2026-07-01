import { GameProvider, useGame } from './store/GameContext';
import CareerSelectScreen from './pages/CareerSelectScreen';
import CareerStartedScreen from './pages/CareerStartedScreen';

function AppContent() {
  const { temJogoSalvo } = useGame();
  return temJogoSalvo ? <CareerStartedScreen /> : <CareerSelectScreen />;
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
