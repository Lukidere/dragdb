export default function Dziennik() {
    const uczniowie = [
        { id: 1, imie: 'Jan', nazwisko: 'Kowalski', klasa: '1A' },
        { id: 2, imie: 'Anna', nazwisko: 'Nowak', klasa: '1A' },
        { id: 3, imie: 'Michał', nazwisko: 'Wiśniewski', klasa: '1A' },
    ];

    const handleDodajOcene = (imie, nazwisko) => {
        // Docelowo tutaj otworzy się ładny Modal (okienko popup)
        alert(`Otwieram formularz dodawania oceny dla: ${imie} ${nazwisko}`);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Panel Nauczyciela - Dziennik Klasy 1A</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#eef', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Imię i Nazwisko</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {uczniowie.map((uczen) => (
                        <tr key={uczen.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{uczen.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{uczen.imie} {uczen.nazwisko}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <button 
                                    onClick={() => handleDodajOcene(uczen.imie, uczen.nazwisko)}
                                    style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}
                                >
                                    + Dodaj ocenę
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}