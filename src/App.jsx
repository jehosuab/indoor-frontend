import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Logbook from './pages/Logbook';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/bitacora" element={<Logbook />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;