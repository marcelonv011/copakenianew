import { useId } from 'react';
import { textLines, displayDate } from '@/lib/poster';
import { CUPS, winnerOf } from '@/lib/playoffs';
import { cupBracket, CUP_COLORS, isThirdPlace } from '@/lib/playoffDisplay';

function Text({ children, x, y, size = 24, color = 'white', max = 32, spacing = 0 }) {
  return <text x={x} y={y} fill={color} fontSize={size} fontWeight='800' letterSpacing={spacing}>{textLines(children, max).map((line, i) => <tspan x={x} dy={i ? size + 4 : 0} key={i}>{line}</tspan>)}</text>;
}
function Card({ match, x, y, label, color, compact = false, width = 438 }) {
  const height = compact ? 142 : 184;
  const row = compact ? 43 : 58;
  const size = compact ? 17 : 22;
  const winner = winnerOf(match);
  return <g>
    <rect x={x} y={y} width={width} height={height} rx='8' fill='#141b38' stroke='#67708b' strokeOpacity='.35' />
    <path d={`M ${x + 8} ${y} H ${x + 85}`} stroke={color} strokeWidth='3' />
    <text x={x + 16} y={y + 20} fill={color} fontSize={compact ? 12 : 14} fontWeight='800' letterSpacing='1.8'>{label}</text>
    {['home', 'away'].map((side, index) => {
      const name = match?.[`${side}_team_id`] ? match[`${side}_team_name`] : `${isThirdPlace(match) ? 'Perdedor' : 'Ganador'} semifinal ${index + 1}`;
      const baseline = y + (compact ? 45 : 53) + index * row;
      const logo = match?.[`${side}_team_logo`];
      return <g key={side}>
        {logo ? <image href={logo} x={x + 15} y={baseline - 18} width={compact ? 28 : 36} height={compact ? 28 : 36} preserveAspectRatio='xMidYMid meet' /> : <circle cx={x + 29} cy={baseline - 3} r='4' fill={color} opacity='.6' />}
        <Text x={x + 59} y={baseline} size={size} max={compact ? 31 : 25} color={winner?.id && winner.id === match?.[`${side}_team_id`] ? '#8af5c3' : '#f7f5ff'}>{name}</Text>
        <text x={x + width - 18} y={baseline + 7} textAnchor='end' fill={color} fontSize={compact ? 22 : 30} fontWeight='900'>{match?.status === 'finalizado' ? match[`${side}_score`] : ''}</text>
      </g>;
    })}
    <line x1={x + 15} x2={x + width - 15} y1={y + height - 29} y2={y + height - 29} stroke='#ffffff' strokeOpacity='.1' />
    <text x={x + 16} y={y + height - 11} fill='#b9bfd4' fontSize={compact ? 12 : 14}>{textLines(`${match?.date ? displayDate(match.date) : 'Fecha a confirmar'} · ${match?.time || '—'} · ${match?.venue || 'Sede a confirmar'}`, compact ? 60 : 51, 1)[0]}</text>
  </g>;
}
export default function InstagramDesign({ tournament, matches, cup, all = false }) {
  const id = useId().replace(/:/g, '');
  const color = CUP_COLORS[cup] || '#fcb6e3';
  const { semis, final, third } = cupBracket(matches, cup);
  const champion = winnerOf(final);
  const logo = /kenia/i.test(tournament.name) ? '/images/copa-kenia-logo.png' : '/images/copa-comercial-eldorado-logo.png';
  return <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1350' role='img' aria-label={`${all ? 'Todos los cuadros' : `Copa ${cup}`} · ${tournament.name}`} style={{ width: '100%', display: 'block', fontFamily: 'Arial, sans-serif' }}>
    <defs>
      <linearGradient id={`${id}-ink`} x2='1' y2='1'><stop stopColor='#111738' /><stop offset='.6' stopColor='#100a24' /><stop offset='1' stopColor='#310f38' /></linearGradient>
      <linearGradient id={`${id}-pink`}><stop stopColor='#9375ff' /><stop offset='1' stopColor='#ff78b9' /></linearGradient>
      <radialGradient id={`${id}-fade`}><stop offset='.5' stopColor='white' /><stop offset='1' stopColor='black' /></radialGradient>
      <mask id={`${id}-hero`}><rect x={all ? 710 : 325} y={all ? 0 : 0} width={all ? 360 : 800} height={all ? 325 : 900} fill={`url(#${id}-fade)`} /></mask>
    </defs>
    <rect width='1080' height='1350' fill={`url(#${id}-ink)`} />
    <path d='M 0 0 H 1080 V 8 H 0 Z' fill={`url(#${id}-pink)`} />
    <image href='/images/playoff-trophy-stage.png' x={all ? 710 : 325} y={all ? 0 : 0} width={all ? 360 : 800} height={all ? 325 : 900} preserveAspectRatio='xMidYMid meet' mask={`url(#${id}-hero)`} />
    <image href={logo} x='52' y='38' width='82' height='94' preserveAspectRatio='xMidYMid meet' />
    <text x='158' y='69' fill='#efb3d6' fontSize='15' fontWeight='700' letterSpacing='3'>TORNEO INTERNACIONAL</text>
    <Text x={158} y={98} size={19} max={all ? 37 : 36}>{tournament.name.replace(/ Femenino/i, '').toUpperCase()}</Text>
    <text x='52' y='237' fill='white' fontSize={all ? 105 : 100} fontWeight='900' letterSpacing='-7'>PLAYOFFS</text>
    <rect x='57' y='264' width='185' height='39' rx='19' fill={`url(#${id}-pink)`} />
    <text x='149' y='290' textAnchor='middle' fill='#150e2f' fontSize='22' fontWeight='900'>{tournament.category} FEMENINO</text>
    {all ? <>
      <text x='270' y='290' fill='#b9bed5' fontSize='17' letterSpacing='2'>EL CAMINO A LA COPA</text>
      {CUPS.map((tier, index) => {
        const bracket = cupBracket(matches, tier);
        const y = 334 + index * 355;
        const accent = CUP_COLORS[tier];
        return <g key={tier}>
          <text x='55' y={y + 25} fill={accent} fontSize='30' fontWeight='900' letterSpacing='2'>COPA {tier.toUpperCase()}</text>
          <text x='1020' y={y + 23} textAnchor='end' fill='#69718c' fontSize='19' letterSpacing='3'>0{index + 1}</text>
          <line x1='310' x2='954' y1={y + 16} y2={y + 16} stroke={accent} strokeOpacity='.25' />
          {bracket.semis.length ? <>
            <path d={`M 492 ${y + 117} H 540 V ${y + 273} H 492 M 540 ${y + 117} H 586`} stroke={accent} fill='none' strokeWidth='2' />
            {bracket.third && <path d={`M 540 ${y + 182} H 563 V ${y + 273} H 586`} stroke={accent} strokeOpacity='.45' strokeDasharray='4 5' fill='none' />}
            {bracket.semis.map((m, i) => <Card key={m.id} match={m} x={54} y={y + 46 + i * 156} color={accent} label={`SEMIFINAL ${i + 1}`} compact />)}
            <Card match={bracket.final} x={586} y={y + 46} color={accent} label='FINAL' compact />
            {bracket.third && <Card match={bracket.third} x={586} y={y + 202} color={accent} label='TERCER Y CUARTO PUESTO' compact />}
          </> : <>
            <Card match={bracket.final} x={54} y={y + 49} color={accent} label='FINAL' compact />
            <Text x={586} y={y + 86} size={24} max={25} color={accent}>{winnerOf(bracket.final) ? `CAMPEÓN · ${winnerOf(bracket.final).name}` : 'UNA FINAL. UNA COPA.'}</Text>
            <text x='586' y={y + 150} fill='#a6aec5' fontSize='16'>Horarios y resultados del torneo</text>
          </>}
        </g>;
      })}
    </> : <>
      <text x='55' y='383' fill={color} fontSize='25' fontWeight='800' letterSpacing='6'>COPA</text>
      <text x='49' y='484' fill={color} fontSize={cup === 'bronce' ? 83 : 110} fontWeight='900' letterSpacing='-4'>{cup.toUpperCase()}</text>
      <line x1='57' x2='225' y1='520' y2='520' stroke={color} strokeWidth='2' />
      <text x='57' y='556' fill='#aeb6d0' fontSize='19'>EL CAMINO A LA FINAL</text>
      <rect x='32' y='703' width='1016' height='608' rx='20' fill='#060b1b' fillOpacity='.86' stroke='#eeafff' strokeOpacity='.13' />
      {semis.length ? <>
        {semis.map((m, i) => <Card key={m.id} match={m} x={55 + i * 530} y={734} color={color} label={`SEMIFINAL ${i + 1}`} />)}
        <path d='M 274 918 V 954 H 804 V 918 M 539 954 V 981 H 274 V 1009' stroke={color} strokeWidth='2' fill='none' />
        {third && <path d='M 539 954 V 981 H 804 V 1009' stroke={color} strokeOpacity='.5' strokeDasharray='5 6' fill='none' />}
      </> : <text x='55' y='775' fill={color} fontSize='30' fontWeight='900'>LA FINAL</text>}
      <Card match={final} x={55} y={semis.length ? 1011 : 832} color={color} label='FINAL' />
      {third && <Card match={third} x={585} y={1011} color={color} label='TERCER Y CUARTO PUESTO' />}
      {!third && <Text x={585} y={semis.length ? 1070 : 907} size={29} max={22} color={color}>{champion ? `CAMPEÓN · ${champion.name}` : '¿QUIÉN LEVANTARÁ LA COPA?'}</Text>}
      <text x='55' y='1262' fill='#b1b8cf' fontSize='16' letterSpacing='2'>{champion && third ? textLines(`CAMPEÓN · ${champion.name}`, 60, 1)[0] : 'PASIÓN EN CADA PARTIDO.'}</text>
    </>}
  </svg>;
}
