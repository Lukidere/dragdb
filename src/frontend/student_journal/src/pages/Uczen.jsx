export default function MojeOceny() {
    // Tymczasowe dane, docelowo przyjdą z backendu
    const oceny = [
        { przedmiot: 'Matematyka', oceny: [4, 5, 3.5], srednia: 4.17 },
        { przedmiot: 'Język Polski', oceny: [5, 4, 4.5], srednia: 4.5 },
        { przedmiot: 'Informatyka', oceny: [5, 5, 5], srednia: 5.0 },
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Panel Ucznia - Moje Oceny</h2>
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