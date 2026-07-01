import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './store/GameContext';
import GameLayout from './components/GameLayout';
import CareerSelectScreen from './pages/CareerSelectScreen';
import Dashboard from './pages/Dashboard';
import MatchScreen from './pages/MatchScreen';
import StandingsScreen from './pages/StandingsScreen';
import CalendarScreen from './pages/CalendarScreen';
import FinancesScreen from './pages/FinancesScreen';
import CoachScreen from './pages/CoachScreen';
import { LineupScreen, MarketScreen, StadiumScreen, MessagesScreen } from './pages/PlaceholderScreens';

function AppRoutes() {
  const { temJogoSalvo } = useGame();

  if (!temJogoSalvo) {
    return (
      <Routes>
        <Route path="*" element={<CareerSelectScreen />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<GameLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/escalacao" element={<LineupScreen />} />
        <Route path="/partida" element={<MatchScreen />} />
        <Route path="/calendario" element={<CalendarScreen />} />
        <Route path="/classificacao" element={<StandingsScreen />} />
        <Route path="/mercado" element={<MarketScreen />} />
        <Route path="/financas" element={<FinancesScreen />} />
        <Route path="/estadio" element={<StadiumScreen />} />
        <Route path="/mensagens" element={<MessagesScreen />} />
        <Route path="/treinador" element={<CoachScreen />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <GameProvider>
        <AppRoutes />
      </GameProvider>
    </HashRouter>
  );
}
