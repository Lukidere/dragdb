import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Nauczyciel() {
    const [klasy, setKlasy] = useState([]);
    const [wybranaKlasa, setWybranaKlasa] = useState(null);
    const [uczenDoOceny, setUczenDoOceny] = useState(null); // Trzyma dane ucznia, któremu właśnie wystawiamy ocenę
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // Pobieranie klas i uczniów po wejściu na stronę
    useEffect(() => {
        const pobierzKlasy = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            try {
                const response = await fetch('/api/nauczyciel/klasy', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Błąd autoryzacji lub serwera.');

                const data = await response.json();
                setKlasy(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        pobierzKlasy();
    }, [navigate]);

    // Funkcja do wysyłania nowej oceny na backend
    const handleWystawOcene = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        // Zbieramy dane z formularza
        const nowaOcenaPayload = {
            id_ucznia: uczenDoOceny.id_ucznia,
            id_przedmiotu: parseInt(e.target.przedmiot.value), // Swagger oczekuje integera
            id_typu_oceny: parseInt(e.target.typ_oceny.value), // Swagger oczekuje integera
            ocena: parseFloat(e.target.ocena.value) // Swagger oczekuje floata
        };

        try {
            const response = await fetch('/api/nauczyciel/oceny', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nowaOcenaPayload)
            });

            if (!response.ok) throw new Error('Nie udało się dodać oceny.');

            alert('Ocena dodana pomyślnie!'); // Możesz to potem zamienić na ładnego Toasta
            setUczenDoOceny(null); // Zamykamy modal

        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Ładowanie klas...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Panel Nauczyciela</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* KROK 1: Wybór klasy */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Wybierz klasę:</label>
                <select 
                    onChange={(e) => setWybranaKlasa(klasy[e.target.value])}
                    defaultValue=""
                    style={{ padding: '8px', fontSize: '16px' }}
                >
                    <option value="" disabled>-- wybierz --</option>
                    {klasy.map((klasa, index) => (
                        <option key={klasa.nazwa_klasy} value={index}>
                            Klasa {klasa.nazwa_klasy}
                        </option>
                    ))}
                </select>
            </div>

            {/* KROK 2: Lista uczniów wybranej klasy */}
            {wybranaKlasa && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Uczeń</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Akcja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wybranaKlasa.uczniowie.map(uczen => (
                            <tr key={uczen.id_ucznia}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{uczen.id_ucznia}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{uczen.imie} {uczen.nazwisko}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <button 
                                        onClick={() => setUczenDoOceny(uczen)}
                                        style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Wstaw ocenę
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* KROK 3: Modal do wstawiania oceny (wyświetla się tylko, gdy uczenDoOceny nie jest nullem) */}
            {uczenDoOceny && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', minWidth: '300px' }}>
                        <h3>Oceniasz: {uczenDoOceny.imie} {uczenDoOceny.nazwisko}</h3>
                        
                        <form onSubmit={handleWystawOcene} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            {/* Tymczasowe dane dla ID przedmiotu (w realu pobierane z API) */}
                            <select name="przedmiot" required style={{ padding: '8px' }}>
                                <option value="">-- Wybierz przedmiot --</option>
                                <option value="1">Matematyka</option>
                                <option value="2">Język Polski</option>
                            </select>

                            {/* Tymczasowe dane dla Typu oceny */}
                            <select name="typ_oceny" required style={{ padding: '8px' }}>
                                <option value="">-- Wybierz typ --</option>
                                <option value="1">Sprawdzian</option>
                                <option value="2">Kartkówka</option>
                                <option value="3">Odpowiedź ustna</option>
                            </select>

                            <input type="number" name="ocena" step="0.5" min="1" max="6" required placeholder="Wpisz ocenę (np. 4.5)" style={{ padding: '8px' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <button type="button" onClick={() => setUczenDoOceny(null)} style={{ padding: '10px', cursor: 'pointer' }}>Anuluj</button>
                                <button type="submit" style={{ padding: '10px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Zapisz</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}