import PosterTypography from './PosterTypography';
import { useId } from 'react';
import { textLines, displayDate } from '@/lib/poster';
import { winnerOf } from '@/lib/playoffs';
import { cupBracket, isThirdPlace, CUP_COLORS } from '@/lib/playoffDisplay';

export function ArtText({ text, x, y, size = 22, max = 26, anchor = 'start', color = 'white' }) {
  return <text x={x} y={y} fill={color} fontSize={size} fontWeight='800' textAnchor={anchor}>{textLines(text, max).map((line, i) => <tspan key={i} x={x} dy={i ? size + 5 : 0}>{line}</tspan>)}</text>;
}
export function TournamentLogo({ tournament, x, y, size }) {
  return <image href={/kenia/i.test(tournament.name || '') ? '/images/copa-kenia-logo.png' : '/images/copa-comercial-eldorado-logo.png'} x={x} y={y} width={size} height={size} preserveAspectRatio='xMidYMid meet' />;
}
export function ArtBackground({ id, height = 1350 }) {
  return <>
    <defs>
      <linearGradient id={`${id}-bg`} x1='0' y1='1' x2='1' y2='0'><stop stopColor='#0368ec' /><stop offset='.35' stopColor='#281079' /><stop offset='.72' stopColor='#a41a91' /><stop offset='1' stopColor='#ff726d' /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor='#ff9cdd' stopOpacity='.8' /><stop offset='1' stopColor='#e943dd' stopOpacity='0' /></radialGradient>
      <pattern id={`${id}-lines`} width='30' height='30' patternUnits='userSpaceOnUse' patternTransform='rotate(35)'><line x1='0' y1='0' x2='0' y2='30' stroke='white' strokeOpacity='.06' strokeWidth='2' /></pattern>
    </defs>
    <rect width='1080' height={height} fill='#070a22' />
    <image href='/images/playoff-trophy-stage.png' width='1080' height={height} preserveAspectRatio='xMidYMid slice' opacity='.42' />
    <rect width='1080' height={height} fill='#0a0620' opacity='.28' />
    <rect x='18' y='18' width='1044' height={height - 36} fill='none' stroke='#f2c7eb' strokeOpacity='.3' />
  </>;
}
export function BracketCard({ match, x, y, width = 410, height = 166, label, color = '#ffda74', schedule = true, size = 19, centered = false }) {
  const win = winnerOf(match);
  const row = schedule ? 60 : (height - 12) / 2;
  return <g>
    <text x={centered ? x + width / 2 : x} textAnchor={centered ? 'middle' : 'start'} y={y - 13} fill={color} fontSize={size} className='poster-title' fontWeight='600' letterSpacing='1'>{label}</text>
    <rect x={x} y={y} width={width} height={height} rx='12' fill='#0b1430' fillOpacity='.95' stroke={color} strokeWidth='2' />
    <rect x={x} y={y + 12} width='4' height={height - 24} fill={color} />
    {['home', 'away'].map((side, i) => {
      const name = match?.[`${side}_team_id`] ? match[`${side}_team_name`] : `${isThirdPlace(match) ? 'Perdedor' : 'Ganador'} semifinal ${i + 1}`;
      return <g key={side}>
        {!match?.[`${side}_team_logo`] && <text x={x + 32} y={y + 37 + i * row} fill='#a6bce5' textAnchor='middle' fontSize={size}>{match?.[`${side}_team_id`] ? name[0] : '?'}</text>}
        {match?.[`${side}_team_logo`] && <image href={match[`${side}_team_logo`]} x={x + 12} y={y + 12 + i * row} width='42' height='42' preserveAspectRatio='xMidYMid meet' />}
        <ArtText text={name} anchor={centered ? 'middle' : 'start'} x={centered ? x + (width + 17) / 2 : x + 65} y={y + (centered && textLines(name, Math.floor((width - 113) / (size * .56))).length === 1 ? 38 : 27) + i * row} size={size} max={Math.floor((width - 113) / (size * .56))} color={win?.id && win.id === match?.[`${side}_team_id`] ? '#63f2ba' : 'white'} />
        <text x={x + width - 14} y={y + 39 + i * row} fill={color} textAnchor='end' fontSize={size + 6} className='poster-title' fontWeight='600'>{match?.status === 'finalizado' ? match[`${side}_score`] : ''}</text>
      </g>;
    })}
    {schedule && <><text x={centered ? x + width / 2 : x + 14} textAnchor={centered ? 'middle' : 'start'} y={y + 137} fill='#ced9f1' fontSize='14'>{match?.date ? `${displayDate(match.date)} · ${match.time || 'Hora a confirmar'}` : 'Fecha y hora a confirmar'}</text><text x={centered ? x + width / 2 : x + 14} textAnchor={centered ? 'middle' : 'start'} y={y + 156} fill='#ced9f1' fontSize='14'>{textLines(match?.venue || 'Sede a confirmar', Math.floor((width - 28) / 8), 1)[0]}</text></>}
  </g>;
}
export default function InstagramBracket({ tournament, matches, cup }) {
  const id = useId().replace(/:/g, '');
  const { semis, final, third } = cupBracket(matches, cup);
  const color = CUP_COLORS[cup];
  const champion = winnerOf(final);
  return <svg className='playoff-type' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1350' role='img' aria-label={`Playoffs copa ${cup} de ${tournament.name}`} style={{ width: '100%', display: 'block', fontFamily: 'PosterInter, sans-serif' }}>
    <PosterTypography />
    <defs>
      <linearGradient id={`${id}-fade`}><stop stopColor='black' /><stop offset='.14' stopColor='white' /><stop offset='.86' stopColor='white' /><stop offset='1' stopColor='black' /></linearGradient>
      <linearGradient id={`${id}-vertical`} x1='0' y1='0' x2='0' y2='1'><stop stopColor='black' /><stop offset='.12' stopColor='white' /><stop offset='.88' stopColor='white' /><stop offset='1' stopColor='black' /></linearGradient>
      <mask id={`${id}-photo`}><rect x='108' y='110' width='864' height='1080' fill={`url(#${id}-fade)`} /></mask>
      <mask id={`${id}-edges`}><rect x='108' y='110' width='864' height='1080' fill={`url(#${id}-vertical)`} /></mask>
    </defs>
    <rect width='1080' height='1350' fill='#05071b' />
    <image href='/images/playoff-trophy-stage.png' width='1080' height='1350' opacity='.12' />
    <g mask={`url(#${id}-edges)`}><image href='/images/playoff-trophy-stage.png' x='108' y='110' width='864' height='1080' mask={`url(#${id}-photo)`} /></g>
    <TournamentLogo tournament={tournament} x={38} y={28} size={125} />
    <text x='540' y='48' fill='#facbed' fontSize='15' textAnchor='middle' letterSpacing='3'>TORNEO INTERNACIONAL FEMENINO</text>
    <ArtText text={tournament.name.replace(/ Femenino/i, '').toUpperCase()} x={540} y={97} max={30} size={30} anchor='middle' />
    <text x='540' y='191' fill='white' fontSize='70' className='poster-title' fontWeight='600' textAnchor='middle' letterSpacing='-2'>{tournament.category} · PLAYOFFS</text>
    <path d='M 35 237 H 240 M 840 237 H 1045' stroke={color} strokeOpacity='.65' strokeWidth='2' />
    <text x='540' y='255' fill={color} fontSize='49' className='poster-title' fontWeight='600' textAnchor='middle' letterSpacing='4'>COPA {cup.toUpperCase()}</text>
    {semis.length > 0 && <>
      <path d='M 210 666 V 895 H 315 M 870 666 V 895 H 765 M 315 895 V 922 M 765 895 V 922' stroke={color} fill='none' strokeWidth='2' />
      {semis.map((m, i) => <BracketCard centered key={m.id} match={m} x={35 + i * 660} y={500} width={350} size={17} label={`SEMIFINAL ${i + 1}`} color={color} />)}
    </>}
    <BracketCard centered match={final} x={315} y={930} width={450} label='FINAL' color={color} />
    {champion && <text x='540' y='1130' textAnchor='middle' fill={color} fontSize='22' className='poster-title' fontWeight='600'>{textLines(`CAMPEÓN · ${champion.name}`, 45, 1)[0]}</text>}
    {third && <BracketCard centered match={third} x={315} y={1170} width={450} label='TERCER Y CUARTO PUESTO' color={color} />}
    {!third && !champion && <text x='540' y='1190' textAnchor='middle' fill={color} fontSize='26' className='poster-title' fontWeight='600' letterSpacing='2'>¿QUIÉN SERÁ EL CAMPEÓN?</text>}
  </svg>;
}
