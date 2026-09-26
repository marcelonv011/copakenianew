import { BracketCard, ArtText } from './PlayoffArt';
import { cupBracket, phaseLabel, CUP_COLORS } from '@/lib/playoffDisplay';
import { matchDisplay, textLines } from '@/lib/poster';

export default function TvPlayoffs({ slide }) {
  const { semis, final, third } = cupBracket(slide.bracket, slide.tier === 'playoffs' ? undefined : slide.tier);
  const color = CUP_COLORS[slide.tier] || '#d8eeff';
  return <g>
    {semis.length > 0 ? <>
      <path d='M 555 378 H 665 V 345 H 740 M 1365 378 H 1255 V 345 H 1180' fill='none' stroke={color} strokeWidth='3' />
      {semis.slice(0, 2).map((m, i) => <BracketCard key={m.id} match={m} x={75 + i * 1290} y={305} width={480} height={140} schedule={false} size={23} label={`SEMIFINAL ${i + 1}`} color={color} />)}
      <BracketCard match={final} x={740} y={285} width={440} height={125} schedule={false} size={21} label='FINAL' color={color} />
      {third && <>
        <path d='M 315 445 V 520 H 740 M 1605 445 V 520 H 1180' fill='none' stroke={color} strokeOpacity='.5' strokeDasharray='8 7' strokeWidth='2' />
        <BracketCard match={third} x={740} y={467} width={440} height={125} schedule={false} size={21} label='TERCER Y CUARTO PUESTO' color={color} />
      </>}
    </> : final ? <BracketCard match={final} x={640} y={330} width={640} height={170} schedule={false} size={29} label='FINAL' color={color} /> : <ArtText text='Cuadro de playoffs · partidos programados abajo' x={960} y={425} size={32} anchor='middle' max={60} />}
    <rect x='65' y='615' width='1790' height='40' rx='8' fill='#164880' />
    {[[85, 'HORA'], [245, 'PARTIDO'], [1030, 'RESULTADO'], [1260, 'FASE'], [1570, 'CANCHA']].map(([x, label]) => <text key={label} x={x} y='644' fill='white' fontSize='22' fontWeight='800'>{label}</text>)}
    {slide.rows.map((match, row) => {
      const y = 655 + row * 84;
      const display = matchDisplay(match);
      return <g key={match.id}>
        <rect x='65' y={y} width='1790' height='83' fill={row % 2 ? '#102642' : '#091a30'} />
        <text x='85' y={y + 47} fill='white' fontSize='27' fontWeight='700'>{match.time || '—'}</text>
        <ArtText text={`${match.home_team_name || 'Por definir'} vs ${match.away_team_name || 'Por definir'}`} x={245} y={y + 31} max={46} size={25} />
        <text x='1120' y={y + 36} fill='#63f2ba' fontSize='29' fontWeight='800' textAnchor='middle'>{display.result || 'VS'}</text>
        <text x='1120' y={y + 63} fill='#b9cfe9' fontSize='16' textAnchor='middle'>{display.label}</text>
        <ArtText text={phaseLabel(match)} x={1260} y={y + 33} size={24} max={20} color={color} />
        <ArtText text={textLines(match.venue || 'A confirmar', 20).join(' ')} x={1570} y={y + 32} size={23} max={20} />
      </g>;
    })}
    {!slide.rows.length && <text x='960' y='757' textAnchor='middle' fill='#ced9f1' fontSize='28'>No hay partidos de esta copa para la fecha seleccionada.</text>}
  </g>;
}
