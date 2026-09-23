import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  }, () => setError('No pudimos cargar la cartelera pública. Revisá la conexión o consultá con la organización.')), [id]);

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

  async function exportImage() {
    if (exporting) return;
    setExporting(true);
    setNotice('');
    try {
      await downloadPoster(posterRef.current.querySelector('svg'), `copa-kenia-${date || 'cartelera'}-${currentPage + 1}.png`);
      setNotice('Imagen descargada. El QR abre la cartelera actualizada; la imagen conserva estos resultados.');
    } catch {
      setNotice('No se pudo descargar la imagen. Intentá nuevamente o compartí el enlace.');
    } finally {
      setExporting(false);
    }
  }

  if (error) return <main className='max-w-xl mx-auto p-8 text-center space-y-4'><h1 className='text-2xl font-bold'>Cartelera no disponible</h1><p role='alert'>{error}</p><Button onClick={() => window.location.reload()}>Volver a intentar</Button><p><Link to='/torneos' className='underline'>Ver torneos</Link></p></main>;
  if (tournament === null) return <main className='p-8 text-center'><h1 className='text-2xl font-bold'>No encontramos este torneo</h1><Link to='/torneos' className='underline'>Ver torneos</Link></main>;
  if (!tournament || matches === null) return <main className='p-8 text-center' role='status'>Cargando horarios y resultados…</main>;

  return <main className='min-h-screen bg-slate-950 text-white px-3 py-6 sm:px-6'>
    <div className='max-w-5xl mx-auto space-y-5'>
      <header className='flex flex-wrap justify-between gap-3 items-center'>
        <div><h1 className='text-xl font-bold'>Cartelera del torneo</h1><p className='text-sm text-slate-300'>{online && !cached ? 'Se actualiza automáticamente al cargar resultados.' : 'Sin confirmar conexión: los datos pueden estar desactualizados.'}</p></div>
        <Link className='text-sm underline text-sky-300' to={`/torneos/${id}`}>Ver torneo y posiciones</Link>
      </header>
      <div className='flex flex-wrap items-end gap-3'>
        <label className='text-sm'>Fecha<select aria-label='Fecha de la cartelera' value={date} onChange={(e) => { setDate(e.target.value); setPage(0); }} className='block mt-1 rounded-lg bg-slate-900 border border-slate-600 px-3 py-2'><option value=''>Todas las fechas</option>{dates.map((day) => <option key={day} value={day}>{displayDate(day, true)}</option>)}</select></label>
        <Button disabled={!qr || exporting} onClick={exportImage}>{exporting ? 'Preparando imagen…' : 'Descargar imagen'}</Button>
        <Button disabled={!qr} onClick={() => saveDataUrl(qr, 'qr-copa-kenia.png')}>Descargar QR</Button>
        <Button onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setNotice('Enlace copiado.'); } catch { setNotice(`Copiá este enlace: ${shareUrl}`); } }}>Copiar enlace</Button>
      </div>
      {notice && <p role='status' className='rounded-lg bg-slate-800 p-3 text-sm break-words'>{notice}</p>}
      <div className='grid lg:grid-cols-[minmax(0,1fr)_210px] gap-5 items-start'>
        <div>
          <div ref={posterRef} className='rounded-xl overflow-hidden shadow-2xl border border-white/10'><MatchPoster tournament={tournament} matches={visible} date={date} qr={qr} page={currentPage} pages={pages} updatedLabel={cached || !online ? 'Sin conexión confirmada' : received} /></div>
          <section aria-label='Detalle de partidos de esta página' className='mt-4 space-y-3 sm:sr-only'>
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
          {pages > 1 && <nav aria-label='Páginas de partidos' className='flex justify-between items-center gap-3 mt-4'><Button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</Button><span className='text-sm'>{currentPage + 1} / {pages}</span><Button disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)}>Siguiente</Button></nav>}
        </div>
        <aside className='rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3'>
          {qr && <img src={qr} alt='QR para abrir esta cartelera' className='w-40 h-40 mx-auto' />}
          <h2 className='font-semibold'>Un QR para todo el torneo</h2>
          <p className='text-sm text-slate-300'>Compartilo o imprimilo una vez. Al abrirlo, la gente ve los horarios y resultados que vas cargando.</p>
          <a href={shareUrl} className='block break-all text-xs text-sky-300 underline'>{shareUrl}</a>
          <p className='text-xs text-slate-400'>La imagen PNG es una captura. Descargá una nueva después de actualizar los partidos.</p>
        </aside>
      </div>
    </div>
  </main>;
}
