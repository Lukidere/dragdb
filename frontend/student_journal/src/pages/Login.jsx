import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Inicjalizacja funkcji nawigacji
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError('');

        try {
           // Symulacja komunikacji z backendem i sprawdzania ról
           if (username === 'admin' && password === '123') {
               // Jeśli to admin, przekierowujemy na panel zarządzania
               navigate('/admin'); 
           } 
           else if (username === 'nauczyciel' && password === '123') {
               // Jeśli to nauczyciel, przekierowujemy do dziennika
               navigate('/nauczyciel'); 
           }
           else if (username === 'uczen' && password === '123') {
               // Jeśli to uczeń, przekierowujemy do jego ocen
               navigate('/uczen'); 
           }
           else {
               // Błędne dane
               setError('Błędne dane logowania!');
           }

        } catch (err) {
            setError('Wystąpił błąd podczas logowania.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Panel logowania</h2>
            <p>Wprowadź swoje dane, aby wejść do dziennika.</p>

            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="login">Login:</label>
                    <input 
                        type="text" id="login" value={username} 
                        onChange={(e) => setUsername(e.target.value)} required 
                        style={{ padding: '8px', fontSize: '16px' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="haslo">Hasło:</label>
                    <input 
                        type="password" id="haslo" value={password} 
                        onChange={(e) => setPassword(e.target.value)} required 
                        style={{ padding: '8px', fontSize: '16px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Zaloguj się
                </button>
            </form>
        </div>
    );
}