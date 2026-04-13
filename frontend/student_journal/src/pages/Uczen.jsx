import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MojeOceny() {
    // Stany dla danych z API
    const [profil, setProfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    // Tymczasowe dane dopóki backend nie uzupełni endpointu ocen
    const oceny = [
        { przedmiot: 'Matematyka', oceny: [4, 5, 3.5], srednia: 4.17 },
        { przedmiot: 'Język Polski', oceny: [5, 4, 4.5], srednia: 4.5 },
        { przedmiot: 'Informatyka', oceny: [5, 5, 5], srednia: 5.0 },
    ];

    // useEffect odpali się raz, po zamontowaniu komponentu
    useEffect(() => {
        const pobierzDane = async () => {
            // Wyciągamy token zapisany podczas logowania
            const token = localStorage.getItem('token');
            
            if (!token) {
                // Jeśli ktoś wbił na /uczen bez logowania, wyrzucamy go za drzwi
                navigate('/login');
                return;
            }

            try {
                // Uderzamy do API po profil ucznia
                const response = await fetch('/api/uczen/profil', {
                    headers: {
                        'Content-Type': 'application/json',
                        // DODAJEMY TOKEN DO NAGŁÓWKA - to jest kluczowe!
                        'Authorization': `Bearer ${token}` 
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        // Token jest nieważny lub wygasł
                        localStorage.removeItem('token');
                        navigate('/login');
                    }
                    throw new Error('Nie udało się pobrać danych profilu.');
                }

                const data = await response.json();
                setProfil(data); // Zapisujemy dane ucznia w stanie

            } catch (err) {
                setError(err.message);
            } finally {
                // Zdejmujemy ekran ładowania niezależnie czy się udało, czy nie
                setLoading(false); 
            }
        };

        pobierzDane();
    }, [navigate]);

    // Ekran ładowania (żeby nie mrugał pusty interfejs)
    if (loading) {
        return <div style={{ padding: '20px' }}>Ładowanie danych...</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            {/* Wyświetlamy błąd z API, jeśli jakiś wystąpił */}
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>Błąd: {error}</div>}

            {/* Renderujemy nagłówek z prawdziwymi danymi z bazy */}
            {profil ? (
                <h2>Panel Ucznia - {profil.imie} {profil.nazwisko} (Klasa {profil.nazwa_klasy})</h2>
            ) : (
                <h2>Panel Ucznia</h2>
            )}
            
            <p>Witaj! Poniżej znajduje się zestawienie Twoich ocen.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Przedmiot</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Oceny</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Średnia</th>
                    </tr>
                </thead>
                <tbody>
                    {oceny.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.przedmiot}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.oceny.join(', ')}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{item.srednia}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}