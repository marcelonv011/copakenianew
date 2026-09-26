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
export function TrophyArt({ x, y, scale = 1, color = '#ffda74' }) {
  const id = useId().replace(/:/g, '');
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <defs><linearGradient id={id}><stop stopColor='#65436c' /><stop offset='.25' stopColor={color} /><stop offset='.48' stopColor='#fff9e7' /><stop offset='.65' stopColor={color} /><stop offset='1' stopColor='#805075' /></linearGradient></defs>
    <ellipse cx='100' cy='330' rx='110' ry='18' fill={color} opacity='.16' />
    <path d='M 42 30 H 0 V 98 Q 0 160 66 165 M 158 30 H 200 V 98 Q 200 160 134 165' fill='none' stroke={`url(#${id})`} strokeWidth='15' />
    <path d='M 30 10 H 170 L 151 151 Q 145 190 110 202 V 264 L 156 286 V 302 H 44 V 286 L 90 264 V 202 Q 55 190 49 151 Z' fill={`url(#${id})`} stroke={color} strokeWidth='3' />
    <path d='M 60 28 L 74 146 Q 78 164 89 170 M 139 27 L 126 150' fill='none' stroke='white' strokeOpacity='.5' strokeWidth='5' />
    <path d='M 100 56 L 111 81 L 140 84 L 119 104 L 124 132 L 100 119 L 76 132 L 81 104 L 60 84 L 89 81 Z' fill='#794769' opacity='.75' />
    <rect x='32' y='302' width='136' height='25' rx='4' fill='#171831' stroke={color} strokeWidth='2' />
  </g>;
}
export function ArtBackground({ id, height = 1350 }) {
  return <>
    <defs>
      <linearGradient id={`${id}-bg`} x1='0' y1='1' x2='1' y2='0'><stop stopColor='#0368ec' /><stop offset='.35' stopColor='#281079' /><stop offset='.72' stopColor='#a41a91' /><stop offset='1' stopColor='#ff726d' /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor='#ff9cdd' stopOpacity='.8' /><stop offset='1' stopColor='#e943dd' stopOpacity='0' /></radialGradient>
      <pattern id={`${id}-lines`} width='30' height='30' patternUnits='userSpaceOnUse' patternTransform='rotate(35)'><line x1='0' y1='0' x2='0' y2='30' stroke='white' strokeOpacity='.06' strokeWidth='2' /></pattern>
    </defs>
    <rect width='1080' height={height} fill={`url(#${id}-bg)`} />
    <rect width='1080' height={height} fill={`url(#${id}-lines)`} />
    <ellipse cx='540' cy={height * .58} rx='500' ry='600' fill={`url(#${id}-glow)`} />
    <path d={`M 0 330 L 370 0 M 0 460 L 520 0 M 680 ${height} L 1080 ${height - 380}`} stroke='#75cfff' strokeOpacity='.22' strokeWidth='8' />
    <rect x='14' y='14' width='1052' height={height - 28} rx='10' fill='none' stroke='#ffb1e2' strokeOpacity='.45' strokeWidth='2' />
    {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={(i * 163 + 19) % 1080} cy={(i * 277 + 350) % height} r={i % 3 + 1} fill='white' opacity='.35' />)}
  </>;
}
export function BracketCard({ match, x, y, width = 410, height = 166, label, color = '#ffda74', schedule = true, size = 19 }) {
  const win = winnerOf(match);
  const row = schedule ? 60 : (height - 12) / 2;
  return <g>
    <text x={x} y={y - 13} fill={color} fontSize={size} fontWeight='900' letterSpacing='1'>{label}</text>
    <rect x={x} y={y} width={width} height={height} rx='12' fill='#0b1430' fillOpacity='.95' stroke={color} strokeWidth='2' />
    <rect x={x} y={y + 12} width='4' height={height - 24} fill={color} />
    {['home', 'away'].map((side, i) => {
      const name = match?.[`${side}_team_id`] ? match[`${side}_team_name`] : `${isThirdPlace(match) ? 'Perdedor' : 'Ganador'} semifinal ${i + 1}`;
      return <g key={side}>
        {!match?.[`${side}_team_logo`] && <text x={x + 32} y={y + 37 + i * row} fill='#a6bce5' textAnchor='middle' fontSize={size}>{match?.[`${side}_team_id`] ? name[0] : '?'}</text>}
        {match?.[`${side}_team_logo`] && <image href={match[`${side}_team_logo`]} x={x + 12} y={y + 12 + i * row} width='42' height='42' preserveAspectRatio='xMidYMid meet' />}
        <ArtText text={name} x={x + 65} y={y + 27 + i * row} size={size} max={Math.floor((width - 113) / (size * .56))} color={win?.id && win.id === match?.[`${side}_team_id`] ? '#63f2ba' : 'white'} />
        <text x={x + width - 14} y={y + 39 + i * row} fill={color} textAnchor='end' fontSize={size + 6} fontWeight='900'>{match?.status === 'finalizado' ? match[`${side}_score`] : ''}</text>
      </g>;
    })}
    {schedule && <><text x={x + 14} y={y + 137} fill='#ced9f1' fontSize='14'>{match?.date ? `${displayDate(match.date)} · ${match.time || 'Hora a confirmar'}` : 'Fecha y hora a confirmar'}</text><text x={x + 14} y={y + 156} fill='#ced9f1' fontSize='14'>{textLines(match?.venue || 'Sede a confirmar', 40, 1)[0]}</text></>}
  </g>;
}
export default function InstagramBracket({ tournament, matches, cup }) {
  const id = useId().replace(/:/g, '');
  const { semis, final, third } = cupBracket(matches, cup);
  const color = CUP_COLORS[cup];
  const champion = winnerOf(final);
  return <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1350' role='img' aria-label={`Playoffs copa ${cup} de ${tournament.name}`} style={{ width: '100%', display: 'block', fontFamily: 'Arial, sans-serif' }}>
    <ArtBackground id={id} />
    <TournamentLogo tournament={tournament} x={42} y={42} size={180} />
    <text x='640' y='80' fill='#ffdee9' fontSize='21' textAnchor='middle' letterSpacing='5'>TORNEO INTERNACIONAL</text>
    <ArtText text={tournament.name.toUpperCase()} x={640} y={133} max={29} size={34} anchor='middle' />
    <text x='640' y='258' fill='white' fontSize='66' fontWeight='900' textAnchor='middle'>{tournament.category} · PLAYOFFS</text>
    <path d='M 55 314 H 300 M 780 314 H 1025' stroke={color} strokeWidth='3' />
    <text x='540' y='333' fill={color} fontSize='49' fontWeight='900' textAnchor='middle'>COPA {cup.toUpperCase()}</text>
    <TrophyArt x={440} y={405} color={color} />
    {semis.length > 0 && <>
      <path d='M 220 616 V 749 H 860 V 616 M 540 749 V 799' stroke={color} fill='none' strokeWidth='3' />
      {semis.map((m, i) => <BracketCard key={m.id} match={m} x={40 + i * 640} y={450} width={360} size={17} label={`SEMIFINAL ${i + 1}`} color={color} />)}
    </>}
    <BracketCard match={final} x={335} y={805} label='FINAL' color={color} />
    <ArtText text={champion ? `CAMPEÓN · ${champion.name}` : '¿QUIÉN SERÁ EL CAMPEÓN?'} x={540} y={1024} max={39} size={26} color={color} anchor='middle' />
    {third && <BracketCard match={third} x={335} y={1120} label='TERCER Y CUARTO PUESTO' color={color} />}
    {!third && <text x='540' y='1190' textAnchor='middle' fill='white' fontSize='23' letterSpacing='5'>LA COPA SE DEFINE EN LA CANCHA</text>}
  </svg>;
}
