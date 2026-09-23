import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { calculateStandingsByGroup } from '@/lib/standings';
import QRCode from 'qrcode';
import { watchPoster } from '@/services/posterService';
import MatchPoster from '@/components/tournament/MatchPoster';
import { displayDate, downloadPoster, matchDisplay, orderedMatches, POSTER_PAGE_SIZE, saveDataUrl } from '@/lib/poster';
import { Button } from '@/components/ui/button';

export default function TournamentPoster() {
  const { id } = useParams();
  return <PosterContent key={id} id={id} />;
}

function PosterContent({ id }) {
  const [tournament, setTournament] = useState(undefined);
  const [matches, setMatches] = useState(null);
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [received, setReceived] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(0);
  const [qr, setQr] = useState('');
  const [notice, setNotice] = useState('');
  const [exporting, setExporting] = useState(false);
  const posterRef = useRef(null);
  const shareUrl = `${window.location.origin}/cartelera/${encodeURIComponent(id)}`;

  useEffect(() => watchPoster(id, setTournament, (items, fromCache) => {
    setMatches(items);
    setCached(fromCache);
    if (!fromCache) setReceived(new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }));
  }, setTeams, () => setError('No pudimos cargar la cartelera pública. Revisá la conexión o consultá con la organización.')), [id]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(shareUrl, { width: 640, margin: 4, errorCorrectionLevel: 'M' })
      .then((url) => { if (active) setQr(url); })
      .catch(() => { if (active) setNotice('No se pudo generar el QR. Podés copiar el enlace.'); });
    return () => { active = false; };
  }, [shareUrl]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  const sorted = orderedMatches(matches || [], date);
  const dates = [...new Set((matches || []).map((match) => match.date).filter(Boolean))].sort();
  const pages = Math.max(1, Math.ceil(sorted.length / POSTER_PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const visible = sorted.slice(currentPage * POSTER_PAGE_SIZE, (currentPage + 1) * POSTER_PAGE_SIZE);
  const standings = calculateStandingsByGroup(matches || [], (teams || []).filter((team) => tournament?.team_ids?.includes(team.id)), tournament?.group_config?.groupNames?.length ? tournament.group_config.groupNames : ['Zona A']);

  async function exportImage() {
    if (exporting) return;
    setExporting(true);
    setNotice('');
    try {
      await downloadPoster(posterRef.current.querySelector('svg'), `copa-kenia-${date || 'cartelera'}-${currentPage + 1}.png`);
      setNotice('Imagen descargada.');
    } catch {
      setNotice('No se pudo descargar la imagen. Intentá nuevamente o compartí el enlace.');
    } finally {
      setExporting(false);
    }
  }

  async function sharePoster() {
    try {
      if (navigator.share) {
        await navigator.share({ title: tournament.name, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setNotice('Enlace copiado.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') setNotice(`Copiá este enlace: ${shareUrl}`);
    }
  }

  if (error) return <main className='max-w-xl mx-auto p-8 text-center space-y-4'><h1 className='text-2xl font-bold'>Cartelera no disponible</h1><p role='alert'>{error}</p><Button onClick={() => window.location.reload()}>Volver a intentar</Button></main>;
  if (tournament === null) return <main className='p-8 text-center'><h1 className='text-2xl font-bold'>No encontramos este torneo</h1></main>;
  if (!tournament || matches === null || teams === null) return <main className='p-8 text-center' role='status'>Cargando cartelera…</main>;

  return <main className='min-h-screen bg-slate-950 text-white px-3 py-6 sm:px-6'>
    <div className='max-w-4xl mx-auto space-y-5'>
      <h1 className='sr-only'>Cartelera de {tournament.name}</h1>
      {(!online || cached) && <p role='status' className='text-sm text-slate-300'>Sin conexión confirmada: los datos pueden estar desactualizados.</p>}
      <div className='flex flex-wrap items-end gap-3'>
        <label className='text-sm'>Fecha<select aria-label='Fecha de la cartelera' value={date} onChange={(e) => { setDate(e.target.value); setPage(0); }} className='block mt-1 rounded-lg bg-slate-900 border border-slate-600 px-3 py-2'><option value=''>Todas las fechas</option>{dates.map((day) => <option key={day} value={day}>{displayDate(day, true)}</option>)}</select></label>
          <Button onClick={sharePoster}>Compartir cartelera</Button>
          <Button disabled={!qr || exporting} onClick={exportImage}>{exporting ? 'Preparando imagen…' : 'Descargar imagen'}</Button>
          <Button disabled={!qr} onClick={() => saveDataUrl(qr, 'qr-copa-kenia.png')}>Descargar QR</Button>
          <Button onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setNotice('Enlace copiado.'); } catch { setNotice(`Copiá este enlace: ${shareUrl}`); } }}>Copiar enlace</Button>
      </div>
      {notice && <p role='status' className='rounded-lg bg-slate-800 p-3 text-sm break-words'>{notice}</p>}
      <div>
        <div>
          <div ref={posterRef} className='rounded-xl overflow-hidden shadow-2xl border border-white/10'><MatchPoster tournament={tournament} matches={visible} date={date} standings={standings} qr={qr} page={currentPage} pages={pages} updatedLabel={cached || !online ? 'Sin conexión confirmada' : received} /></div>
          <section aria-label='Detalle de partidos de esta página' className='sr-only'>
            <h2 className='font-semibold'>Partidos</h2>
            {visible.map((match) => {
              const display = matchDisplay(match);
              return <article key={match.id} className='rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm'>
                <p className='text-slate-300'>{displayDate(match.date)} · {display.time} · {display.label}</p>
                <p className='font-semibold mt-2'>{match.home_team_name || 'Local'} vs {match.away_team_name || 'Visitante'}</p>
                {display.result && <p className='text-2xl font-bold text-emerald-400 my-2'>{display.result}</p>}
                <p className='text-slate-300 mt-1'>{match.venue || 'Cancha a confirmar'}{match.group_name ? ` · ${match.group_name}` : ''}</p>
              </article>;
            })}
          </section>
          <section className='sr-only' aria-label='Tabla de posiciones'>{standings.map((group) => <div key={group.groupName}><h2>{group.groupName}</h2><table><thead><tr>{['Equipo', 'PJ', 'PG', 'PP', 'PF', 'PC', 'DIF', 'PTS'].map((title) => <th key={title}>{title}</th>)}</tr></thead><tbody>{group.standings.map((team) => <tr key={team.id}><th>{team.name}</th>{['pj', 'pg', 'pp', 'pf', 'pc', 'diff', 'pts'].map((key) => <td key={key}>{team[key]}</td>)}</tr>)}</tbody></table></div>)}</section>
          {pages > 1 && <nav aria-label='Páginas de partidos' className='flex justify-between items-center gap-3 mt-4'><Button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</Button><span className='text-sm'>{currentPage + 1} / {pages}</span><Button disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)}>Siguiente</Button></nav>}
        </div>
      </div>
    </div>
  </main>;
}
