import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Logbook from './pages/Logbook';
// 1. Importamos las nuevas páginas
import PlantingPage from './pages/PlantingPage';
import WateringPage from './pages/WateringPage';
import PreventivePage from './pages/PreventivePage';
import EventPage from './pages/EventPage';
import HarvestPage from './pages/HarvestPage';
import LotStatusPage from './pages/LotStatusPage';
import DailyTasks from './pages/DailyTasks';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/bitacora" element={<Logbook />} />
          <Route path="/tareas-diarias" element={<DailyTasks />} />
          {/* Nuevas rutas */}
          <Route path="/siembra" element={<PlantingPage />} />
          <Route path="/riego" element={<WateringPage />} />
          <Route path="/preventivos" element={<PreventivePage />} />
          <Route path="/evento" element={<EventPage />} />
          <Route path="/cosecha" element={<HarvestPage />} />
          <Route path="/estado-lotes" element={<LotStatusPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;