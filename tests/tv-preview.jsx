import { createRoot } from 'react-dom/client';
import TvPlayer from '../src/components/tournament/TvPlayer';
import { FEMALE_TOURNAMENTS } from '../src/lib/femaleTournaments';

const entries = Object.fromEntries(FEMALE_TOURNAMENTS.map((cup) => {
  const teams = Array.from({ length: 14 }, (_, i) => ({ id: String(i), name: i === 0 ? 'Club de nombre extenso para revisar dos líneas' : `Club ${i + 1}` }));
  const matches = Array.from({ length: 7 }, (_, i) => ({ id: String(i), home_team_id: String(i * 2), away_team_id: String(i * 2 + 1), home_team_name: teams[i * 2].name, away_team_name: teams[i * 2 + 1].name, phase: 'grupos', group_name: 'Zona A', date: '2026-09-23', time: `${12 + i}:30`, venue: 'Polideportivo Iguazú', status: i < 2 ? 'finalizado' : 'programado', home_score: 80, away_score: 70 }));
  return [cup.id, { tournament: { team_ids: teams.map((t) => t.id) }, teams, matches, cached: false, received: 'PRUEBA · DATOS FICTICIOS' }];
}));
createRoot(document.getElementById('root')).render(<TvPlayer entries={entries} date='2026-09-23' seconds={5} />);
