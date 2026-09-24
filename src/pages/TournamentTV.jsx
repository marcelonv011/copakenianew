import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { FEMALE_TOURNAMENTS } from '@/lib/femaleTournaments';
import { localDay, slideSeconds } from '@/lib/tvSlides';
import { watchPoster } from '@/services/posterService';
import TvPlayer from '@/components/tournament/TvPlayer';
import { usePosterRefresh } from '@/lib/usePosterRefresh';

export default function TournamentTV() {
  const refreshRevision = usePosterRefresh();
  const [entries, setEntries] = useState({});
  const [qrs, setQrs] = useState({});
  const [today, setToday] = useState(localDay);
  const [online, setOnline] = useState(navigator.onLine);
  const params = new URLSearchParams(window.location.search);
  const requestedDate = params.get('fecha');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate || '') ? requestedDate : today;
  const seconds = slideSeconds(params.get('segundos'));

  useEffect(() => {
    const stops = FEMALE_TOURNAMENTS.map((cup) => {
      const update = (patch) => setEntries((previous) => ({ ...previous, [cup.id]: { ...previous[cup.id], ...patch } }));
      return watchPoster(cup.id,
        (tournament) => update({ tournament }),
        (matches, cached) => update({ matches, cached, error: false, received: cached ? '' : new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) }),
        (teams) => update({ teams }),
        () => update({ error: true }));
    });
    return () => stops.forEach((stop) => stop());
  }, [refreshRevision]);

  useEffect(() => {
    let active = true;
    Promise.all(FEMALE_TOURNAMENTS.map(async (cup) => [cup.id, await QRCode.toDataURL(`${window.location.origin}/cartelera/${cup.id}`, { width: 540, margin: 4, errorCorrectionLevel: 'M' })]))
      .then((pairs) => { if (active) setQrs(Object.fromEntries(pairs)); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const update = () => { setOnline(navigator.onLine); setToday(localDay()); };
    const timer = setInterval(update, 30000);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { clearInterval(timer); window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  return <TvPlayer entries={entries} date={date} seconds={seconds} qrs={qrs} online={online} />;
}
