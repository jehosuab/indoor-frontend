import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Logs from './pages/Logs';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock" element={<Inventory />} />
          <Route path="/registros" element={<Logs />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;