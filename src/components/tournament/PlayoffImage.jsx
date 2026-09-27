import { useRef, useState } from 'react';
import PlayoffPoster from './PlayoffPoster';
import { downloadPoster } from '@/lib/poster';
import { Button } from '@/components/ui/button';
import { CUPS, winnerOf } from '@/lib/playoffs';
import { GoldChampionPoster } from './PlayoffArt';

export default function PlayoffImage({ tournament, matches }) {
  const ref = useRef(null);
  const instagramAll = useRef(null);
  const goldChampionRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('all');
  const exports = useRef({});
  const goldFinal = matches.find((match) => match.cup === 'oro' && match.phase === 'final');
  const goldChampion = winnerOf(goldFinal);
  return <section className='space-y-3'>
    <Button disabled={busy} onClick={async () => {
      setBusy(true); setError('');
      try { await downloadPoster(ref.current.querySelector('svg'), `playoffs-${tournament.category}-${tournament.id}.png`); }
      catch { setError('No se pudo descargar la imagen. Volvé a intentar.'); }
      finally { setBusy(false); }
    }}>{busy ? 'Preparando imagen…' : 'Descargar cuadro de playoffs'}</Button>
    <div className='flex flex-wrap gap-2'><Button variant='outline' disabled={busy} onClick={async () => {
      setBusy(true); setError('');
      try { await downloadPoster(instagramAll.current.querySelector('svg'), `instagram-${tournament.category}-todos-los-cuadros.png`); }
      catch { setError('No se pudo guardar la imagen. Volvé a intentar.'); }
      finally { setBusy(false); }
    }}>Instagram · Todos los cuadros</Button>{CUPS.map((cup) => <Button key={cup} variant='outline' disabled={busy} onClick={async () => {
      setBusy(true); setError('');
      try { await downloadPoster(exports.current[cup].querySelector('svg'), `instagram-${tournament.category}-copa-${cup}.png`); }
      catch { setError('No se pudo descargar la imagen. Volvé a intentar.'); }
      finally { setBusy(false); }
    }}>Instagram · Copa {cup}</Button>)}{goldChampion && <Button variant='outline' disabled={busy} onClick={async () => {
      setBusy(true); setError('');
      try { await downloadPoster(goldChampionRef.current.querySelector('svg'), `instagram-${tournament.category}-campeon-copa-oro.png`); }
      catch { setError('No se pudo descargar la imagen del campeón. Volvé a intentar.'); }
      finally { setBusy(false); }
    }}>Instagram · Campeón Copa Oro</Button>}</div>
    <p className='text-sm text-muted-foreground'>Instagram: imágenes verticales de 1080 × 1350. En iPhone se abre el menú Compartir: elegí “Guardar imagen”.</p>
    <div style={{ display: 'none' }} aria-hidden='true'><div ref={instagramAll}><PlayoffPoster tournament={tournament} matches={matches} instagramAll /></div>{CUPS.map((cup) => <div key={cup} ref={(element) => { exports.current[cup] = element; }}><PlayoffPoster tournament={tournament} matches={matches} cup={cup} /></div>)}{goldChampion && <div ref={goldChampionRef}><GoldChampionPoster tournament={tournament} matches={matches} /></div>}</div>
    {error && <p role='alert'>{error}</p>}
    <div ref={ref} style={{ display: 'none' }} aria-hidden='true'><PlayoffPoster tournament={tournament} matches={matches} /></div>
    <label className='block text-sm'>Vista previa <select value={preview} onChange={(event) => setPreview(event.target.value)} className='ml-2 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white'><option value='all'>Todos los cuadros</option>{CUPS.map((cup) => <option key={cup} value={cup}>Copa {cup}</option>)}{goldChampion && <option value='champion-oro'>Campeón Copa Oro</option>}</select></label>
    <div className='max-w-3xl mx-auto rounded-xl overflow-hidden'>{preview === 'champion-oro' && goldChampion
      ? <GoldChampionPoster tournament={tournament} matches={matches} />
      : <PlayoffPoster tournament={tournament} matches={matches} instagramAll={preview === 'all'} cup={preview === 'all' ? undefined : preview} />}</div>
  </section>;
}
