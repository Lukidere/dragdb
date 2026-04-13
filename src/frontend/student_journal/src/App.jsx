import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Uczen from './pages/Uczen';
import Nauczyciel from './pages/Nauczyciel';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/uczen" element={<Uczen />} />
          <Route path="/nauczyciel" element={<Nauczyciel />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<h2 style={{textAlign: 'center', marginTop: '50px'}}>404 - Nie znaleziono strony</h2>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;