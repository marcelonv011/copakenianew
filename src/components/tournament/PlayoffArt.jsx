import PosterTypography from './PosterTypography';
import { useId } from 'react';
import { textLines, displayDate } from '@/lib/poster';
import { loserOf, winnerOf } from '@/lib/playoffs';
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

export function GoldChampionPoster({ tournament, matches }) {
  const id = useId().replace(/:/g, '');
  const final = matches.find((match) => match.cup === 'oro' && match.phase === 'final');
  const champion = winnerOf(final);
  const runnerUp = loserOf(final);
  const championName = champion?.name || 'Campeón a confirmar';
  const initial = championName.trim().charAt(0).toUpperCase() || '★';
  const result = final ? `${final.home_team_name} ${final.home_score} – ${final.away_score} ${final.away_team_name}` : '';
  const schedule = final?.date
    ? `${displayDate(final.date)}${final.time ? ` · ${final.time}` : ''}${final.venue ? ` · ${final.venue}` : ''}`
    : (final?.venue || '');

  return <svg className='playoff-type' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1350' role='img' aria-label={`Campeón de Copa Oro de ${tournament.name}`} style={{ width: '100%', display: 'block', fontFamily: 'PosterInter, sans-serif' }}>
    <PosterTypography />
    <defs>
      <linearGradient id={`${id}-champion-bg`} x1='0' y1='1' x2='1' y2='0'>
        <stop stopColor='#071832' />
        <stop offset='.42' stopColor='#301054' />
        <stop offset='.75' stopColor='#97166e' />
        <stop offset='1' stopColor='#ef6b58' />
      </linearGradient>
      <radialGradient id={`${id}-gold-glow`}>
        <stop stopColor='#fff2ad' stopOpacity='.95' />
        <stop offset='.35' stopColor='#e9b93d' stopOpacity='.48' />
        <stop offset='1' stopColor='#e9b93d' stopOpacity='0' />
      </radialGradient>
      <linearGradient id={`${id}-gold`} x1='0' y1='0' x2='0' y2='1'>
        <stop stopColor='#fff4b8' />
        <stop offset='.5' stopColor='#ffd361' />
        <stop offset='1' stopColor='#c98b20' />
      </linearGradient>
      <filter id={`${id}-shadow`} x='-30%' y='-30%' width='160%' height='160%'>
        <feDropShadow dx='0' dy='12' stdDeviation='18' floodColor='#000000' floodOpacity='.55' />
      </filter>
      <pattern id={`${id}-sparkles`} width='90' height='90' patternUnits='userSpaceOnUse'>
        <circle cx='12' cy='14' r='2' fill='#fff4bd' opacity='.6' />
        <circle cx='68' cy='51' r='1.5' fill='white' opacity='.45' />
      </pattern>
    </defs>
    <rect width='1080' height='1350' fill={`url(#${id}-champion-bg)`} />
    <image href='/images/playoff-trophy-stage.png' x='0' y='0' width='1080' height='1350' preserveAspectRatio='xMidYMid slice' opacity='.22' />
    <rect width='1080' height='1350' fill='#040918' opacity='.23' />
    <rect width='1080' height='1350' fill={`url(#${id}-sparkles)`} />
    <circle cx='540' cy='690' r='370' fill={`url(#${id}-gold-glow)`} />
    <path d='M 95 1090 C 300 1025, 780 1025, 985 1090 L 985 1350 L 95 1350 Z' fill='#050b1f' fillOpacity='.86' />
    <rect x='24' y='24' width='1032' height='1302' rx='18' fill='none' stroke={`url(#${id}-gold)`} strokeWidth='3' opacity='.8' />

    <TournamentLogo tournament={tournament} x={42} y={38} size={128} />
    <text x='540' y='58' fill='#fae8f5' fontSize='15' textAnchor='middle' letterSpacing='3'>TORNEO INTERNACIONAL FEMENINO</text>
    <ArtText text={tournament.name.replace(/ Femenino/i, '').toUpperCase()} x={540} y={107} max={30} size={31} anchor='middle' />
    <text x='540' y='157' fill='#dce6ff' fontSize='23' textAnchor='middle' fontWeight='700' letterSpacing='4'>{tournament.category}</text>

    <path d='M 104 229 H 338 M 742 229 H 976' stroke='#f8d870' strokeWidth='2' opacity='.75' />
    <text x='540' y='245' fill={`url(#${id}-gold)`} fontSize='35' className='poster-title' fontWeight='600' textAnchor='middle' letterSpacing='7'>COPA ORO</text>
    <text x='540' y='342' fill='white' fontSize='80' className='poster-title' fontWeight='600' textAnchor='middle' letterSpacing='2'>CAMPEONAS</text>

    <g filter={`url(#${id}-shadow)`}>
      <circle cx='540' cy='650' r='222' fill='#08142c' stroke={`url(#${id}-gold)`} strokeWidth='8' />
      <circle cx='540' cy='650' r='198' fill='#ffffff' fillOpacity='.08' stroke='#fff0aa' strokeOpacity='.28' strokeWidth='2' />
      <text x='540' y='716' fill='#fff0aa' opacity='.55' fontSize='190' textAnchor='middle' className='poster-title' fontWeight='600'>{initial}</text>
      {champion?.logo && <image href={champion.logo} x='372' y='482' width='336' height='336' preserveAspectRatio='xMidYMid meet' />}
    </g>
    <path d='M 390 448 L 425 390 L 483 430 L 540 370 L 597 430 L 655 390 L 690 448 Z' fill={`url(#${id}-gold)`} stroke='#fff1a9' strokeWidth='3' filter={`url(#${id}-shadow)`} />

    <ArtText text={championName.toUpperCase()} x={540} y={960} max={26} size={48} anchor='middle' color='#ffffff' />
    <text x='540' y='1061' fill='#f4d56d' fontSize='22' className='poster-title' fontWeight='600' textAnchor='middle' letterSpacing='4'>CAMPEÓN COPA ORO</text>

    {result && <ArtText text={`FINAL · ${result}`} x={540} y={1151} max={54} size={22} anchor='middle' color='#ffffff' />}
    {runnerUp && <text x='540' y='1203' fill='#becae3' fontSize='17' textAnchor='middle'>Subcampeón: {runnerUp.name}</text>}
    {schedule && <ArtText text={schedule} x={540} y={1251} max={64} size={17} anchor='middle' color='#d9e2f3' />}
    <text x='540' y='1302' fill='#f4d56d' fontSize='15' textAnchor='middle' letterSpacing='4'>LA COPA TIENE CAMPEÓN</text>
  </svg>;
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
