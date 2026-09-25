import { createRoot } from 'react-dom/client';
import PlayoffImage from '../src/components/tournament/PlayoffImage';
import '../src/index.css';
const tournament = { id: 'prueba', name: 'Copa Comercial Eldorado Femenino', category: 'U17' };
const matches = ['oro', 'plata', 'bronce'].flatMap((cup) => (cup === 'bronce' ? ['final'] : ['semifinal_1', 'semifinal_2', 'final']).map((slot) => ({ id: `${cup}_${slot}`, cup, playoff_slot: `${cup}_${slot}`, phase: slot.startsWith('semifinal') ? 'semifinal' : 'final', home_team_id: slot === 'final' && cup !== 'bronce' ? '' : 'a', away_team_id: slot === 'final' && cup !== 'bronce' ? '' : 'b', home_team_name: 'Equipo de nombre extenso A', away_team_name: 'Equipo de nombre extenso B', status: 'programado' })));
createRoot(document.getElementById('root')).render(<div style={{ maxWidth: 750, margin: 'auto' }}><PlayoffImage tournament={tournament} matches={matches} /></div>);
