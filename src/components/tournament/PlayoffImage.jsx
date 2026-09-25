import { useRef, useState } from 'react';
import PlayoffPoster from './PlayoffPoster';
import { downloadPoster } from '@/lib/poster';
import { Button } from '@/components/ui/button';
import { CUPS } from '@/lib/playoffs';

export default function PlayoffImage({ tournament, matches }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const exports = useRef({});
  return <section className='space-y-3'>
    <Button disabled={busy} onClick={async () => {
      setBusy(true); setError('');
      try { await downloadPoster(ref.current.querySelector('svg'), `playoffs-${tournament.category}-${tournament.id}.png`); }
      catch { setError('No se pudo descargar la imagen. Volvé a intentar.'); }
      finally { setBusy(false); }
    }}>{busy ? 'Preparando imagen…' : 'Descargar cuadro de playoffs'}</Button>
    <div className='flex flex-wrap gap-2'>{CUPS.map((cup) => <Button key={cup} variant='outline' disabled={busy} onClick={async () => {
      setBusy(true); setError('');
      try { await downloadPoster(exports.current[cup].querySelector('svg'), `instagram-${tournament.category}-copa-${cup}.png`); }
      catch { setError('No se pudo descargar la imagen. Volvé a intentar.'); }
      finally { setBusy(false); }
    }}>Instagram · Copa {cup}</Button>)}</div>
    <p className='text-sm text-muted-foreground'>Instagram: imagen vertical de 1080 × 1350 para cada copa.</p>
    <div style={{ display: 'none' }} aria-hidden='true'>{CUPS.map((cup) => <div key={cup} ref={(element) => { exports.current[cup] = element; }}><PlayoffPoster tournament={tournament} matches={matches} cup={cup} /></div>)}</div>
    {error && <p role='alert'>{error}</p>}
    <div ref={ref} className='max-w-3xl mx-auto rounded-xl overflow-hidden'><PlayoffPoster tournament={tournament} matches={matches} /></div>
  </section>;
}
