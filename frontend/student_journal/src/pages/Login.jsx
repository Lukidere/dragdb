import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError('');

        try {
            // Połączenie z API do API
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({ 
                    login: username, 
                    haslo: password 
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Błędny login lub hasło!');
                } else {
                    throw new Error('Błąd serwera. Spróbuj ponownie później.');
                }
            }

            const data = await response.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('rola', data.rola);
            // uczeń ma otrzymać id_ucznia aby pobrać swoje oceny
            if (data.id_ucznia) {
                localStorage.setItem('id_ucznia', data.id_ucznia); 
            }

            // Dynamiczne przekierowanie na podstawie roli z bazy danych
            switch (data.rola) {
                case 'ADMIN':
                    navigate('/admin'); 
                    break;
                case 'NAUCZYCIEL':
                    navigate('/nauczyciel'); 
                    break;
                case 'UCZEN':
                    navigate('/uczen'); 
                    break;
                default:
                    setError('Błąd: Nieznana rola użytkownika.');
            }

        } catch (err) {
            setError(err.message || 'Wystąpił błąd podczas logowania.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Panel logowania</h2>
            <p>Wprowadź swoje dane, aby wejść do dziennika.</p>

            {error && <p style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>{error}</p>}

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