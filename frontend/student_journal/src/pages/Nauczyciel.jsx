import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Nauczyciel() {
    const [klasy, setKlasy] = useState([]);
    const [przedmioty, setPrzedmioty] = useState([]); // NOWY STAN: Trzyma listę przedmiotów z bazy
    const [wybranaKlasa, setWybranaKlasa] = useState(null);
    const [uczenDoOceny, setUczenDoOceny] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // Pobranie klas i przedmiotów z bazy danych
    useEffect(() => {
        const pobierzDane = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            try {
                // 1. Pobieranie klas
                const resKlasy = await fetch('/api/nauczyciel/klasy', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!resKlasy.ok) throw new Error('Błąd pobierania klas.');
                const daneKlasy = await resKlasy.json();
                setKlasy(daneKlasy);

                // 2. Pobieranie przedmiotów
                const resPrzedmioty = await fetch('/api/nauczyciel/przedmioty', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (resPrzedmioty.ok) {
                    const danePrzedmiotow = await resPrzedmioty.json();
                    setPrzedmioty(danePrzedmiotow);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        pobierzDane();
    }, [navigate]);

    // Wysłanie nowej oceny
    const handleWystawOcene = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        // Upewnienie się ,że dane pasują do formularza
        const nowaOcenaPayload = {
            id_ucznia: uczenDoOceny.id_ucznia,
            id_przedmiotu: parseInt(e.target.przedmiot.value),
            id_typu_oceny: parseInt(e.target.typ_oceny.value), 
            ocena: parseFloat(e.target.ocena.value) 
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

            alert('Ocena dodana pomyślnie!');
            setUczenDoOceny(null);

        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Ładowanie danych...</div>;

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

            {/* KROK 3: Modal do wstawiania oceny */}
            {uczenDoOceny && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', minWidth: '300px' }}>
                        <h3>Oceniasz: {uczenDoOceny.imie} {uczenDoOceny.nazwisko}</h3>
                        
                        <form onSubmit={handleWystawOcene} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            
                            {/* DYNAMICZNA LISTA PRZEDMIOTÓW + POLSKA WALIDACJA */}
                            <select 
                                name="przedmiot" 
                                required 
                                style={{ padding: '8px' }}
                                onInvalid={(e) => e.target.setCustomValidity('Wybierz przedmiot z listy!')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            >
                                <option value="">-- Wybierz przedmiot --</option>
                                {przedmioty.map(p => (
                                    <option key={p.id_przedmiotu} value={p.id_przedmiotu}>
                                        {p.nazwa}
                                    </option>
                                ))}
                            </select>

                            {/* TYPY OCEN */}
                            <select 
                                name="typ_oceny" 
                                required 
                                style={{ padding: '8px' }}
                                onInvalid={(e) => e.target.setCustomValidity('Wybierz typ oceny!')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            >
                                <option value="">-- Wybierz typ --</option>
                                <option value="1">Sprawdzian</option>
                                <option value="2">Kartkówka</option>
                                <option value="3">Odpowiedź ustna</option>
                            </select>

                            {/* INPUT Z OCENĄ*/}
                            <input 
                                type="number" 
                                name="ocena" 
                                step="0.5" 
                                min="1" 
                                max="6" 
                                required 
                                placeholder="Wpisz ocenę (np. 4.5)" 
                                style={{ padding: '8px' }} 
                                onInvalid={(e) => e.target.setCustomValidity('Wpisz poprawną ocenę od 1 do 6!')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />

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