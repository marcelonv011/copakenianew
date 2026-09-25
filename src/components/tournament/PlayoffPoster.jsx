import { useId } from 'react';
import { textLines, displayDate } from '@/lib/poster';
import { CUPS, winnerOf } from '@/lib/playoffs';

function Lines({ value, x, y, size = 22, max = 25, fill = 'white', anchor = 'start' }) {
  return <text x={x} y={y} fill={fill} fontSize={size} fontWeight='700' textAnchor={anchor}>{textLines(value, max).map((line, i) => <tspan x={x} dy={i ? size + 4 : 0} key={i}>{line}</tspan>)}</text>;
}
function Game({ match, x, y, label, color }) {
  const win = winnerOf(match);
  return <g>
    <text x={x} y={y - 14} fill={color} fontSize='18' fontWeight='800'>{label}</text>
    <rect x={x} y={y} width='410' height='152' rx='14' fill='#091631' stroke={color} strokeWidth='2' />
    {['home', 'away'].map((side, index) => <g key={side}>
      <circle cx={x + 32} cy={y + 36 + index * 61} r='21' fill='#263667' />
      <text x={x + 32} y={y + 43 + index * 61} textAnchor='middle' fill='white' fontSize='18'>{match?.[`${side}_team_name`]?.[0] || '?'}</text>
      {match?.[`${side}_team_logo`] && <image href={match[`${side}_team_logo`]} x={x + 11} y={y + 15 + index * 61} width='42' height='42' />}
      <Lines value={match?.[`${side}_team_id`] ? match[`${side}_team_name`] : `Ganador semifinal ${index + 1}`} x={x + 64} y={y + 28 + index * 61} size={19} max={24} fill={win?.id && win.id === match?.[`${side}_team_id`] ? '#52f0ad' : 'white'} />
      <text x={x + 389} y={y + 38 + index * 61} textAnchor='end' fill={color} fontSize='25' fontWeight='800'>{match?.status === 'finalizado' ? match[`${side}_score`] : ''}</text>
    </g>)}
    <text x={x + 16} y={y + 137} fill='#bcd2ed' fontSize='15'>{match?.date ? `${displayDate(match.date)} · ${match.time || 'Hora a confirmar'}` : 'Fecha y hora a confirmar'}</text>
  </g>;
}
export default function PlayoffPoster({ tournament, matches, cup: selectedCup }) {
  const id = useId().replace(/:/g, '');
  const colors = { oro: '#ffdf69', plata: '#dbe9ff', bronce: '#ffc08a' };
  if (selectedCup) {
    const color = colors[selectedCup];
    const games = matches.filter((m) => m.cup === selectedCup);
    const semis = games.filter((m) => m.phase === 'semifinal').sort((a, b) => a.playoff_slot.localeCompare(b.playoff_slot));
    const final = games.find((m) => m.phase === 'final');
    const champion = winnerOf(final);
    return <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1350' role='img' aria-label={`Playoffs copa ${selectedCup} de ${tournament.name}`} style={{ width: '100%', display: 'block', fontFamily: 'Arial, sans-serif' }}>
      <defs><linearGradient id={id} x1='0' y1='1' x2='1' y2='0'><stop stopColor='#0758df' /><stop offset='.4' stopColor='#341089' /><stop offset='.78' stopColor='#fa39b5' /><stop offset='1' stopColor='#ff983b' /></linearGradient></defs>
      <rect width='1080' height='1350' fill={`url(#${id})`} />
      <circle cx='1030' cy='60' r='260' fill='none' stroke='white' strokeOpacity='.13' strokeWidth='40' />
      <text x='540' y='85' textAnchor='middle' fill='white' fontSize='23' letterSpacing='5'>TORNEO INTERNACIONAL</text>
      <Lines value={tournament.name} x={540} y={153} max={34} size={42} anchor='middle' />
      <text x='540' y='290' textAnchor='middle' fill='white' fontSize='65' fontWeight='900'>{tournament.category} · PLAYOFFS</text>
      <text x='540' y='370' textAnchor='middle' fill={color} fontSize='55' fontWeight='900'>COPA {selectedCup.toUpperCase()}</text>
      <rect x='25' y='423' width='1030' height='865' rx='35' fill='#121442' fillOpacity='.8' stroke='white' strokeOpacity='.6' strokeWidth='2' />
      {semis.length > 0 && <>
        <path d='M 260 692 V 737 H 820 V 692 M 540 737 V 810' stroke={color} strokeWidth='4' fill='none' />
        {semis.map((match, i) => <Game key={match.id} match={match} x={55 + i * 560} y={540} label={`SEMIFINAL ${i + 1}`} color={color} />)}
      </>}
      <Game match={final} x={335} y={semis.length ? 810 : 600} label='FINAL' color={color} />
      <path d={`M 540 ${semis.length ? 962 : 752} V 1020`} stroke={color} strokeWidth='4' />
      <path d='M 480 1020 H 600 L 582 1100 Q 540 1144 498 1100 Z M 540 1128 V 1160 M 499 1165 H 581' fill='none' stroke={color} strokeWidth='7' />
      <Lines value={champion ? `CAMPEÓN · ${champion.name}` : 'CAMPEÓN POR DEFINIR'} x={540} y={1215} max={38} size={28} fill={color} anchor='middle' />
    </svg>;
  }
  return <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1820' role='img' aria-label={`Cuadro de playoffs de ${tournament.name}`} style={{ width: '100%', display: 'block', fontFamily: 'Arial, sans-serif' }}>
    <defs><linearGradient id={id} x1='0' y1='1' x2='1' y2='0'><stop stopColor='#0758df' /><stop offset='.4' stopColor='#341089' /><stop offset='.78' stopColor='#fa39b5' /><stop offset='1' stopColor='#ff983b' /></linearGradient></defs>
    <rect width='1080' height='1820' fill={`url(#${id})`} />
    <circle cx='1000' cy='80' r='200' fill='none' stroke='white' strokeOpacity='.12' strokeWidth='35' />
    <text x='50' y='65' fill='white' fontSize='22' letterSpacing='5'>TORNEO INTERNACIONAL</text>
    <Lines value={tournament.name} x={50} y={125} max={34} size={40} />
    <text x='50' y='240' fill='#fff' fontSize='58' fontWeight='900'>{tournament.category} · PLAYOFFS</text>
    {CUPS.map((cup, index) => {
      const y = 290 + index * 485;
      const games = matches.filter((m) => m.cup === cup);
      const semis = games.filter((m) => m.phase === 'semifinal').sort((a, b) => a.playoff_slot.localeCompare(b.playoff_slot));
      const final = games.find((m) => m.phase === 'final');
      const champion = winnerOf(final);
      const color = colors[cup];
      return <g key={cup}>
        <rect x='25' y={y} width='1030' height='460' rx='30' fill='#131443' fillOpacity='.82' stroke='white' strokeOpacity='.6' strokeWidth='2' />
        <text x='55' y={y + 48} fill={color} fontSize='33' fontWeight='900'>COPA {cup.toUpperCase()}</text>
        {semis.length ? <>
          <path d={`M 465 ${y + 165} H 515 V ${y + 359} H 465 M 515 ${y + 262} H 585`} fill='none' stroke={color} strokeWidth='4' />
          {semis.map((match, i) => <Game key={match.id} match={match} x={55} y={y + 89 + i * 194} label={`SEMIFINAL ${i + 1}`} color={color} />)}
          <Game match={final} x={585} y={y + 186} label='FINAL' color={color} />
          <Lines value={champion ? `CAMPEÓN · ${champion.name}` : 'CAMPEÓN POR DEFINIR'} x={790} y={y + 388} max={28} size={20} fill={color} anchor='middle' />
        </> : <>
          <Game match={final} x={80} y={y + 140} label='FINAL' color={color} />
          <path d={`M 490 ${y + 216} H 565`} stroke={color} strokeWidth='4' />
          <path d={`M 690 ${y + 122} H 810 L 792 ${y + 211} Q 750 ${y + 255} 708 ${y + 211} Z M 750 ${y + 239} V ${y + 269} M 709 ${y + 274} H 791`} fill='none' stroke={color} strokeWidth='8' />
          <Lines value={champion ? `CAMPEÓN · ${champion.name}` : 'CAMPEÓN POR DEFINIR'} x={750} y={y + 325} max={27} size={23} fill={color} anchor='middle' />
        </>}
      </g>;
    })}
    <text x='540' y='1785' textAnchor='middle' fill='white' fontSize='20'>ORO · PLATA · BRONCE</text>
  </svg>;
}
