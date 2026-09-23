import { displayDate, matchDisplay, textLines } from '@/lib/poster';

function Lines({ text, x, y, max = 20, size = 22, fill = 'white' }) {
  return <text x={x} y={y} fill={fill} fontSize={size} fontWeight='700'>{textLines(text, max).map((line, index) => <tspan key={index} x={x} dy={index ? size + 5 : 0}>{line}</tspan>)}</text>;
}

function Team({ name, logo, x, y }) {
  return <g>
    <rect x={x} y={y - 26} width='44' height='44' rx='12' fill='#173358' />
    <text x={x + 22} y={y + 3} textAnchor='middle' fill='white' fontSize='20'>{(name || '?')[0]}</text>
    {logo && <image href={logo} x={x} y={y - 26} width='44' height='44' preserveAspectRatio='xMidYMid meet' />}
    <Lines text={name || 'Equipo a confirmar'} x={x + 54} y={y - 5} max={17} size={20} />
  </g>;
}

export default function MatchPoster({ tournament, matches, date, qr, page, pages, updatedLabel }) {
  return <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1350' role='img' aria-label={`Horarios y resultados de ${tournament.name}`} style={{ width: '100%', height: 'auto', display: 'block', fontFamily: 'Arial, sans-serif' }}>
    <defs>
      <linearGradient id='poster-bg' x1='0' y1='1' x2='1' y2='0'><stop stopColor='#0755d8' /><stop offset='.42' stopColor='#291087' /><stop offset='.78' stopColor='#ed24ad' /><stop offset='1' stopColor='#ff894c' /></linearGradient>
      <linearGradient id='poster-footer'><stop stopColor='#1857e4' /><stop offset='1' stopColor='#e72eb3' /></linearGradient>
    </defs>
    <rect width='1080' height='1350' fill='url(#poster-bg)' />
    <circle cx='1040' cy='50' r='230' fill='none' stroke='white' strokeOpacity='.12' strokeWidth='35' />
    <circle cx='1040' cy='50' r='160' fill='none' stroke='white' strokeOpacity='.12' strokeWidth='24' />
    <text x='40' y='57' fill='#cdeaff' fontSize='20' fontWeight='700' letterSpacing='5'>COPA KENIA · BÁSQUET</text>
    <Lines text={tournament.name || 'Copa Kenia'} x={40} y={113} max={34} size={38} />
    <text x='40' y='205' fill='white' fontSize='24' fontWeight='700'>{[tournament.category, tournament.year].filter(Boolean).join(' · ')}</text>
    <image href='/logos.jpeg' x='916' y='70' width='120' height='120' preserveAspectRatio='xMidYMid meet' />
    <text x='40' y='259' fill='white' fontSize='25' fontWeight='700'>{date ? displayDate(date, true).toUpperCase() : 'HORARIOS Y RESULTADOS'}</text>
    <rect x='24' y='286' width='1032' height='824' rx='12' fill='#031222' />
    <rect x='24' y='286' width='1032' height='54' rx='12' fill='#0757a3' />
    {[[42, 'HORA / DÍA'], [210, 'LOCAL'], [490, 'VISITANTE'], [762, 'MARCADOR'], [913, 'CANCHA / ZONA']].map(([x, text]) => <text key={text} x={x} y='320' fill='white' fontSize='16' fontWeight='700'>{text}</text>)}
    {matches.map((match, index) => {
      const y = 341 + index * 95;
      const display = matchDisplay(match);
      return <g key={match.id}>
        <rect x='25' y={y} width='1030' height='94' fill={index % 2 ? '#081e34' : '#031222'} />
        <line x1='25' x2='1055' y1={y + 94} y2={y + 94} stroke='#13528a' />
        <text x='42' y={y + 37} fill='white' fontSize='23' fontWeight='700'>{display.time}</text>
        <text x='42' y={y + 63} fill='#a6c5df' fontSize='18'>{displayDate(match.date)}</text>
        <Team name={match.home_team_name} logo={match.home_team_logo} x={210} y={y + 41} />
        <Team name={match.away_team_name} logo={match.away_team_logo} x={490} y={y + 41} />
        <text x='820' y={y + 39} textAnchor='middle' fill={display.result ? '#33e393' : '#e2e8f0'} fontSize='29' fontWeight='800'>{display.result || 'VS'}</text>
        <text x='820' y={y + 66} textAnchor='middle' fill={display.result ? '#33e393' : '#9cbddd'} fontSize='11' fontWeight='700'>{display.label}</text>
        <Lines text={match.venue || 'A confirmar'} x={913} y={y + 28} max={13} size={16} />
        <text x='913' y={y + 78} fill='#a6c5df' fontSize='14'>{textLines(match.group_name || match.phase || '', 16, 1)[0]}</text>
      </g>;
    })}
    {!matches.length && <text x='540' y='570' textAnchor='middle' fill='#c9ddee' fontSize='26'>No hay partidos para esta fecha.</text>}
    <rect x='24' y='1130' width='1032' height='196' rx='16' fill='url(#poster-footer)' />
    <text x='48' y='1174' fill='white' fontSize='27' fontWeight='800'>DOS CIUDADES, UNA PASIÓN</text>
    <text x='48' y='1215' fill='white' fontSize='21'>Escaneá el QR para ver los últimos resultados.</text>
    <text x='48' y='1252' fill='#e7e7ff' fontSize='16'>{updatedLabel ? `Datos recibidos: ${updatedLabel}` : 'Horarios sujetos a actualización'}</text>
    <text x='48' y='1294' fill='white' fontSize='16'>COPA KENIA · {page + 1} / {pages} · La imagen es una captura del momento.</text>
    {qr && <image href={qr} x='856' y='1148' width='160' height='160' />}
  </svg>;
}
