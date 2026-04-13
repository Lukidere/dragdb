import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MojeOceny() {
    const [ocenyPoPrzedmiotach, setOcenyPoPrzedmiotach] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    // Pobieramy login z pamięci, żeby móc przywitać użytkownika
    const loginUcznia = localStorage.getItem('login');

    const obliczSredniaWazona = (listaOcen) => {
        if (!listaOcen || listaOcen.length === 0) return '-';
        
        let sumaIloczynow = 0;
        let sumaWag = 0;

        listaOcen.forEach(ocena => {
            sumaIloczynow += (ocena.wartosc * ocena.waga);
            sumaWag += ocena.waga;
        });

        return sumaWag > 0 ? (sumaIloczynow / sumaWag).toFixed(2) : '-';
    };

    useEffect(() => {
        const pobierzDane = async () => {
            const token = localStorage.getItem('token');
            const idUcznia = localStorage.getItem('id_ucznia'); 
            
            if (!token || !idUcznia) {
                navigate('/login');
                return;
            }

            try {
                // pobranie ocen
                const resOceny = await fetch(`/api/uczen/oceny/${idUcznia}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (resOceny.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                    throw new Error('Sesja wygasła.');
                }

                if (!resOceny.ok) throw new Error('Nie udało się pobrać ocen.');
                
                const daneOcen = await resOceny.json();
                setOcenyPoPrzedmiotach(daneOcen);

            } catch (err) {
                setError(err.message || 'Wystąpił nieoczekiwany błąd.');
            } finally {
                setLoading(false); 
            }
        };

        pobierzDane();
    }, [navigate]);

    if (loading) {
        return <div style={{ padding: '20px' }}>Ładowanie danych...</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>Błąd: {error}</div>}

            {/* Zmienione przywitanie - używamy loginu z localStorage, wcześniej było z profilu, ale w nowym API zniknęło */}
            <h2>Panel Ucznia {loginUcznia ? `(${loginUcznia})` : ''}</h2>
            
            <p>Witaj! Poniżej znajduje się zestawienie Twoich ocen. Najedź myszką na ocenę, aby zobaczyć szczegóły.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd', width: '25%' }}>Przedmiot</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', width: '60%' }}>Oceny</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', width: '15%', textAlign: 'center' }}>Średnia ważona</th>
                    </tr>
                </thead>
                <tbody>
                    {ocenyPoPrzedmiotach.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                                Brak ocen do wyświetlenia.
                            </td>
                        </tr>
                    ) : (
                        ocenyPoPrzedmiotach.map((przedmiot, index) => (
                            <tr key={index}>
                                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                    {przedmiot.nazwa_przedmiotu}
                                </td>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {przedmiot.oceny.map((ocena, idx) => (
                                            <span 
                                                key={idx}
                                                title={`Typ: ${ocena.nazwa_typu} | Waga: ${ocena.waga} | Data: ${ocena.data_wystawienia}`}
                                                style={{ 
                                                    padding: '4px 8px', 
                                                    backgroundColor: '#e9ecef', 
                                                    borderRadius: '4px',
                                                    cursor: 'help',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {ocena.wartosc}
                                            </span>
                                        ))}
                                        {przedmiot.oceny.length === 0 && <span style={{ color: '#aaa' }}>Brak ocen</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold', textAlign: 'center', fontSize: '18px' }}>
                                    {obliczSredniaWazona(przedmiot.oceny)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}