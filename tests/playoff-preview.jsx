import { createRoot } from 'react-dom/client';
import PlayoffImage from '../src/components/tournament/PlayoffImage';
import '../src/index.css';
const tournament = { id: 'prueba', name: 'Copa Comercial Eldorado Femenino', category: 'U17' };
const matches = ['oro', 'plata', 'bronce'].flatMap((cup) => (cup === 'bronce' ? ['final'] : ['semifinal_1', 'semifinal_2', 'final', 'tercer_puesto']).map((slot, index) => ({ id: `${cup}_${slot}`, cup, playoff_slot: `${cup}_${slot}`, phase: slot.startsWith('semifinal') ? 'semifinal' : slot === 'tercer_puesto' ? 'tercer_puesto' : 'final', home_team_id: !slot.startsWith('semifinal') && cup !== 'bronce' ? '' : 'a', away_team_id: !slot.startsWith('semifinal') && cup !== 'bronce' ? '' : 'b', home_team_name: 'Equipo de nombre extenso A', away_team_name: 'Equipo de nombre extenso B', date: '2026-09-26', time: `${18 + index}:00`, venue: index % 2 ? 'Polideportivo Iguazú' : 'Club Social Eldorado', status: 'programado' })));
createRoot(document.getElementById('root')).render(<div style={{ maxWidth: 750, margin: 'auto' }}><PlayoffImage tournament={tournament} matches={matches} /></div>);
