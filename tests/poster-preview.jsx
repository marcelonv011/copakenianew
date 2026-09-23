import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import MatchPoster from '../src/components/tournament/MatchPoster';
import { downloadPoster } from '../src/lib/poster';

export default function Preview() {
  const [qr, setQr] = useState('');
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState('');
  const ref = useRef(null);
  useEffect(() => { QRCode.toDataURL(`${window.location.origin}/tests/poster-preview.html`, { width: 640, margin: 4 }).then(setQr); }, []);
  const matches = Array.from({ length: 8 }, (_, index) => ({ id: String(index), date: '2026-09-23', time: `${12 + index}:30`,
    home_team_name: index === 6 ? 'Club deportivo de nombre muy largo' : `Club Norte ${index + 1}`,
    away_team_name: `Club Sur ${index + 1}`, venue: 'Polideportivo Iguazú', group_name: 'Zona A',
    status: index < 2 || (index === 2 && finished) ? 'finalizado' : index === 2 ? 'en_curso' : 'programado',
    home_score: 62, away_score: 78,
  }));
  return <main style={{ maxWidth: 720, margin: '20px auto', padding: 12, color: 'white', fontFamily: 'Arial' }}>
    <p>PRUEBA LOCAL · Datos ficticios · QR de demostración</p>
    <button onClick={() => setFinished((value) => !value)}>Alternar tercer resultado</button>{' '}
    <button disabled={!qr} onClick={async () => { try { await downloadPoster(ref.current.querySelector('svg'), 'cartelera-prueba.png'); setMessage('PNG generado correctamente'); } catch (error) { setMessage(error.message); } }}>Probar descarga PNG</button>
    <p role='status'>{message}</p>
    <div ref={ref}><MatchPoster tournament={{ name: 'Copa Kenia · Demostración', category: 'U13', year: 2026 }} matches={matches} qr={qr} date='2026-09-23' page={0} pages={1} updatedLabel='23/09/2026, 15:00' /></div>
  </main>;
}

createRoot(document.getElementById('root')).render(<Preview />);
