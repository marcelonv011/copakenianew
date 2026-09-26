import PosterTypography from './PosterTypography';
import { useId } from 'react';
import { textLines, displayDate } from '@/lib/poster';
import { CUPS, winnerOf } from '@/lib/playoffs';
import InstagramBracket, { TournamentLogo, ArtBackground } from './PlayoffArt';

function Lines({ value, x, y, size = 22, max = 25, count = 2, fill = 'white', anchor = 'start', centered = false }) {
  const lines = textLines(value, max, count);
  return <text x={x} y={centered ? y - (lines.length - 1) * (size + 4) / 2 : y} fill={fill} fontSize={size} fontWeight='700' textAnchor={anchor}>{lines.map((line, i) => <tspan x={x} dy={i ? size + 4 : 0} key={i}>{line}</tspan>)}</text>;
}
function Game({ match, x, y, label, color }) {
  const win = winnerOf(match);
  const sourceLabel = match?.phase === 'tercer_puesto' ? 'Perdedor' : 'Ganador';
  return <g>
    <text x={x} y={y - 14} fill={color} fontSize='18' fontWeight='800'>{label}</text>
    <rect x={x} y={y} width='410' height='166' rx='14' fill='#091631' stroke={color} strokeWidth='2' />
    {['home', 'away'].map((side, index) => <g key={side}>
      <circle cx={x + 32} cy={y + 36 + index * 61} r='21' fill='#263667' />
      <text x={x + 32} y={y + 43 + index * 61} textAnchor='middle' fill='white' fontSize='18'>{match?.[`${side}_team_name`]?.[0] || '?'}</text>
      {match?.[`${side}_team_logo`] && <image href={match[`${side}_team_logo`]} x={x + 11} y={y + 15 + index * 61} width='42' height='42' />}
      <Lines value={match?.[`${side}_team_id`] ? match[`${side}_team_name`] : `${sourceLabel} semifinal ${index + 1}`} x={x + 64} y={y + 28 + index * 61} size={19} max={24} fill={win?.id && win.id === match?.[`${side}_team_id`] ? '#52f0ad' : 'white'} />
      <text x={x + 389} y={y + 38 + index * 61} textAnchor='end' fill={color} fontSize='25' fontWeight='800'>{match?.status === 'finalizado' ? match[`${side}_score`] : ''}</text>
    </g>)}
    <text x={x + 16} y={y + 133} fill='#bcd2ed' fontSize='15'>{match?.date ? `${displayDate(match.date)} · ${match.time || 'Hora a confirmar'}` : 'Fecha y hora a confirmar'}</text>
    <Lines value={`SEDE · ${match?.venue || 'A confirmar'}`} x={x + 16} y={y + 156} size={15} max={43} count={1} fill='#bcd2ed' />
  </g>;
}
function CompactGame({ match, x, y, label, color }) {
  const sourceLabel = match?.phase === 'tercer_puesto' ? 'Perdedor' : 'Ganador';
  const schedule = match?.date ? `${displayDate(match.date)} · ${match.time || 'Hora a confirmar'}` : 'Fecha y hora a confirmar';
  return <g>
    <text x={x + 225} y={y - 10} textAnchor='middle' fill={color} fontSize='16' className='poster-title'>{label}</text>
    <rect x={x} y={y} width='450' height='112' rx='14' fill='#0b102b' fillOpacity='.92' stroke={color} strokeOpacity='.65' />
    <path d={`M ${x + 52} ${y + 43} H ${x + 398} M ${x + 16} ${y + 82} H ${x + 434}`} stroke={color} strokeOpacity='.16' />
    {['home', 'away'].map((side, index) => <g key={side}>
      <circle cx={x + 24} cy={y + 24 + index * 39} r='15' fill='#263667' />
      <text x={x + 24} y={y + 30 + index * 39} textAnchor='middle' fill='white' fontSize='14'>{match?.[`${side}_team_name`]?.[0] || '?'}</text>
      {match?.[`${side}_team_logo`] && <image href={match[`${side}_team_logo`]} x={x + 9} y={y + 9 + index * 39} width='30' height='30' />}
      <Lines value={match?.[`${side}_team_id`] ? match[`${side}_team_name`] : `${sourceLabel} semifinal ${index + 1}`} x={x + 225} y={y + 29 + index * 39} size={16} max={34} count={2} centered anchor='middle' />
      <text x={x + 432} y={y + 30 + index * 39} textAnchor='end' fill={color} fontSize='19' fontWeight='800'>{match?.status === 'finalizado' ? match[`${side}_score`] : ''}</text>
    </g>)}
    <text x={x + 225} y={y + 95} textAnchor='middle' fill='#dae0f3' fontSize='11'>{schedule}</text>
    <Lines value={match?.venue || 'Sede a confirmar'} x={x + 225} y={y + 108} anchor='middle' size={10} max={65} count={1} fill='#aab7d4' />
  </g>;
}
export default function PlayoffPoster({ tournament, matches, cup: selectedCup, instagramAll = false }) {
  const id = useId().replace(/:/g, '');
  const colors = { oro: '#ffdf69', plata: '#dbe9ff', bronce: '#ffc08a' };
  if (instagramAll) {
    return <svg className='playoff-type' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1350' role='img' aria-label={`Todos los cuadros de playoffs de ${tournament.name}`} style={{ width: '100%', display: 'block', fontFamily: 'PosterInter, sans-serif' }}>
    <PosterTypography />
      <defs><linearGradient id={id} x1='0' y1='1' x2='1' y2='0'><stop stopColor='#0758df' /><stop offset='.4' stopColor='#341089' /><stop offset='.78' stopColor='#fa39b5' /><stop offset='1' stopColor='#ff983b' /></linearGradient></defs>
      <ArtBackground id={`${id}-art`} />
      <circle cx='1030' cy='55' r='230' fill='none' stroke='white' strokeOpacity='.13' strokeWidth='38' />
      <TournamentLogo tournament={tournament} x={35} y={25} size={120} />
      <text x='540' y='51' textAnchor='middle' fill='#facbed' fontSize='16' letterSpacing='4'>TORNEO INTERNACIONAL</text>
      <Lines value={tournament.name.replace(/ Femenino/i, '').toUpperCase()} x={540} y={94} max={30} size={28} anchor='middle' />
      <text x='540' y='190' textAnchor='middle' fill='white' fontSize='50' className='poster-title' fontWeight='600'>{tournament.category} · PLAYOFFS</text>
      <text x='540' y='240' textAnchor='middle' fill='#e6c9e9' fontSize='17' letterSpacing='4'>FEMENINO · TODOS LOS CUADROS</text>
      {CUPS.map((cup, index) => {
        const y = 270 + index * 345;
        const games = matches.filter((match) => match.cup === cup);
        const semis = games.filter((match) => match.phase === 'semifinal').sort((a, b) => a.playoff_slot.localeCompare(b.playoff_slot));
        const final = games.find((match) => match.phase === 'final');
        const third = games.find((match) => match.phase === 'tercer_puesto');
        const champion = winnerOf(final);
        const color = colors[cup];
        return <g key={cup}>
          <rect x='25' y={y} width='1030' height='330' rx='22' fill='#15102f' fillOpacity='.78' stroke={color} strokeOpacity='.38' />
          <path d={`M 60 ${y + 30} H 380 M 700 ${y + 30} H 1020`} stroke={color} strokeOpacity='.4' />
          <text x='540' textAnchor='middle' y={y + 40} fill={color} fontSize='32' className='poster-title' fontWeight='600'>COPA {cup.toUpperCase()}</text>
          {semis.length ? <>
            <path d={`M 490 ${y + 126} H 550 V ${y + 266} H 490 M 550 ${y + 126} H 590`} fill='none' stroke={color} strokeWidth='2' />
            {third && <path d={`M 550 ${y + 196} H 570 V ${y + 266} H 590`} fill='none' stroke={color} strokeOpacity='.6' strokeDasharray='5 5' strokeWidth='2' />}
            {semis.map((match, gameIndex) => <CompactGame key={match.id} match={match} x={40} y={y + 70 + gameIndex * 140} label={`SEMIFINAL ${gameIndex + 1}`} color={color} />)}
            <CompactGame match={final} x={590} y={y + 70} label='FINAL' color={color} />
            {third && <CompactGame match={third} x={590} y={y + 210} label='3ER Y 4TO PUESTO' color={color} />}
          </> : <>
            <CompactGame match={final} x={315} y={y + 95} label='FINAL' color={color} />
            <Lines value={champion ? `CAMPEÓN · ${champion.name}` : 'CAMPEÓN POR DEFINIR'} x={540} y={y + 260} max={34} size={23} fill={color} anchor='middle' />
          </>}
        </g>;
      })}
      <text x='540' y='1328' textAnchor='middle' fill='white' fontSize='18'>ORO · PLATA · BRONCE</text>
    </svg>;
  }
  if (selectedCup) return <InstagramBracket tournament={tournament} matches={matches} cup={selectedCup} />;
  return <svg className='playoff-type' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 2220' role='img' aria-label={`Cuadro de playoffs de ${tournament.name}`} style={{ width: '100%', display: 'block', fontFamily: 'PosterInter, sans-serif' }}>
    <PosterTypography />
    <defs><linearGradient id={id} x1='0' y1='1' x2='1' y2='0'><stop stopColor='#0758df' /><stop offset='.4' stopColor='#341089' /><stop offset='.78' stopColor='#fa39b5' /><stop offset='1' stopColor='#ff983b' /></linearGradient></defs>
    <ArtBackground id={`${id}-art`} height={2220} />
    <circle cx='1000' cy='80' r='200' fill='none' stroke='white' strokeOpacity='.12' strokeWidth='35' />
    <TournamentLogo tournament={tournament} x={930} y={35} size={115} />
    <text x='50' y='65' fill='white' fontSize='22' letterSpacing='5'>TORNEO INTERNACIONAL</text>
    <Lines value={tournament.name} x={50} y={125} max={34} size={40} />
    <text x='50' y='240' fill='#fff' fontSize='58' className='poster-title' fontWeight='600'>{tournament.category} · PLAYOFFS</text>
    {CUPS.map((cup, index) => {
      const y = 290 + index * 605;
      const games = matches.filter((m) => m.cup === cup);
      const semis = games.filter((m) => m.phase === 'semifinal').sort((a, b) => a.playoff_slot.localeCompare(b.playoff_slot));
      const final = games.find((m) => m.phase === 'final');
      const third = games.find((m) => m.phase === 'tercer_puesto');
      const champion = winnerOf(final);
      const color = colors[cup];
      return <g key={cup}>
        <rect x='25' y={y} width='1030' height='590' rx='30' fill='#131443' fillOpacity='.82' stroke='white' strokeOpacity='.6' strokeWidth='2' />
        <text x='55' y={y + 48} fill={color} fontSize='33' className='poster-title' fontWeight='600'>COPA {cup.toUpperCase()}</text>
        {semis.length ? <>
          <path d={`M 465 ${y + 163} H 515 V ${y + 378} H 465 M 515 ${y + 271} H 585`} fill='none' stroke={color} strokeWidth='4' />
          {semis.map((match, i) => <Game key={match.id} match={match} x={55} y={y + 80 + i * 215} label={`SEMIFINAL ${i + 1}`} color={color} />)}
          <Game match={final} x={585} y={y + 188} label='FINAL' color={color} />
          <Lines value={champion ? `CAMPEÓN · ${champion.name}` : 'CAMPEÓN POR DEFINIR'} x={790} y={y + 375} max={28} size={17} fill={color} anchor='middle' />
          {third && <Game match={third} x={585} y={y + 416} label='3ER Y 4TO PUESTO' color={color} />}
        </> : <>
          <Game match={final} x={80} y={y + 190} label='FINAL' color={color} />
          <path d={`M 490 ${y + 273} H 565`} stroke={color} strokeWidth='4' />
          <image href='/images/playoff-trophy-stage.png' x='575' y={y + 65} width='360' height='310' preserveAspectRatio='xMidYMid slice' />
          <Lines value={champion ? `CAMPEÓN · ${champion.name}` : 'CAMPEÓN POR DEFINIR'} x={750} y={y + 375} max={27} size={23} fill={color} anchor='middle' />
        </>}
      </g>;
    })}
    <text x='540' y='2185' textAnchor='middle' fill='white' fontSize='20'>ORO · PLATA · BRONCE</text>
  </svg>;
}
