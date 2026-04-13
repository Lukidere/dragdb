import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PanelZarzadzania() {
    const [uzytkownicy, setUzytkownicy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Stany dla Modali
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(null); // przechowuje login usera któremu zmieniamy hasło

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // 1. POBIERANIE LISTY (GET)
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/uzytkownicy', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Błąd pobierania użytkowników');
            const data = await response.json();
            setUzytkownicy(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return navigate('/login');
        fetchUsers();
    }, []);

    // 2. TWORZENIE (POST)
    const handleCreateUser = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/admin/uzytkownicy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 409) throw new Error('Ten login jest już zajęty!');
            if (!response.ok) throw new Error('Błąd podczas tworzenia konta');

            alert('Użytkownik utworzony!');
            setShowCreateModal(false);
            fetchUsers(); // Odświeżamy listę
        } catch (err) {
            alert(err.message);
        }
    };

    // 3. ZMIANA HASŁA (PUT)
    const handleChangePassword = async (e) => {
        e.preventDefault();
        const nowoHaslo = e.target.nowe_haslo.value;

        try {
            const response = await fetch('/api/admin/uzytkownicy/haslo', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    login: showPasswordModal, 
                    nowe_haslo: nowoHaslo 
                })
            });

            if (!response.ok) throw new Error('Nie udało się zmienić hasła');

            alert('Hasło zmienione pomyślnie');
            setShowPasswordModal(null);
        } catch (err) {
            alert(err.message);
        }
    };

    // 4. USUWANIE (DELETE)
    const handleDeleteUser = async (login) => {
        if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${login}?`)) return;

        try {
            const response = await fetch(`/api/admin/uzytkownicy/${login}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Błąd podczas usuwania');

            setUzytkownicy(uzytkownicy.filter(u => u.login !== login));
            alert('Użytkownik usunięty');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Ładowanie systemu...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Zarządzanie Użytkownikami</h2>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    + Dodaj użytkownika
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Imię i Nazwisko</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Login</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {uzytkownicy.map((user) => (
                        <tr key={user.login}>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.imie} {user.nazwisko}</td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>{user.login}</td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                <button 
                                    onClick={() => setShowPasswordModal(user.login)}
                                    style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer' }}
                                >
                                    Zmień hasło
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user.login)}
                                    style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                                >
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL: TWORZENIE UŻYTKOWNIKA */}
            {showCreateModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>Nowy Użytkownik</h3>
                        <form onSubmit={handleCreateUser} style={formStyle}>
                            <input name="login" placeholder="Login" required style={inputStyle} />
                            <input name="haslo_jawne" type="password" placeholder="Hasło" required style={inputStyle} />
                            <select name="rola" required style={inputStyle}>
                                <option value="UCZEN">Uczeń</option>
                                <option value="NAUCZYCIEL">Nauczyciel</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Anuluj</button>
                                <button type="submit" style={{ flex: 1, backgroundColor: '#007bff', color: 'white' }}>Stwórz</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: ZMIANA HASŁA */}
            {showPasswordModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>Zmień hasło dla: {showPasswordModal}</h3>
                        <form onSubmit={handleChangePassword} style={formStyle}>
                            <input name="nowe_haslo" type="password" placeholder="Nowe hasło" required style={inputStyle} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowPasswordModal(null)} style={{ flex: 1 }}>Anuluj</button>
                                <button type="submit" style={{ flex: 1, backgroundColor: '#007bff', color: 'white' }}>Zapisz</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Proste style dla UI
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '350px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = { padding: '10px', fontSize: '14px' };