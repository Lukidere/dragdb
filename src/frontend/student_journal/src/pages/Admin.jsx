export default function PanelZarzadzania() {
    const uzytkownicy = [
        { id: 1, login: 'jkowalski', rola: 'Uczeń', status: 'Aktywny' },
        { id: 2, login: 'anowak', rola: 'Nauczyciel', status: 'Aktywny' },
        { id: 3, login: 'admin_glowny', rola: 'Admin', status: 'Aktywny' },
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Panel Administratora - Zarządzanie Użytkownikami</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#ffe5e5', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Login</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Rola</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {uzytkownicy.map((user) => (
                        <tr key={user.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{user.login}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.rola}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', color: 'green' }}>{user.status}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <button style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}>Edytuj</button>
                                <button style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Zablokuj</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}