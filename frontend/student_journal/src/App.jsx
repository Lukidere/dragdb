import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      {/* Menu nawigacji */}
      <nav style={{ padding: '15px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
      <strong>Dziennik Szkolny</strong>
      <Link to="/login" style={{ marginRight: '15px', marginLeft: '15px' }}>Logowanie</Link>
      <Link to="/dashboard">Panel Ucznia</Link>
      </nav>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;