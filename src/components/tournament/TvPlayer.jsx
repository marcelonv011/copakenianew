import { useEffect, useState } from 'react';
import { buildTvSlides } from '@/lib/tvSlides';
import { displayDate, matchDisplay, textLines } from '@/lib/poster';

function Name({ value, x, y, max = 25, size = 32 }) {
  return <text x={x} y={y} fill='white' fontSize={size} fontWeight='700'>{textLines(value, max).map((line, index) => <tspan key={index} x={x} dy={index ? size + 5 : 0}>{line}</tspan>)}</text>;
}

export default function TvPlayer({ entries, date, seconds = 15, qrs = {}, online = true }) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = buildTvSlides(entries, date);
  const index = step % slides.length;
  const slide = slides[index];
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setStep((previous) => previous + 1), seconds * 1000);
    return () => clearInterval(timer);
  }, [seconds, paused]);
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); setStep((n) => n + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); setStep((n) => (n % slides.length + slides.length - 1) % slides.length); }
      if (event.code === 'Space') { event.preventDefault(); setPaused((value) => !value); }
      if (event.key.toLowerCase() === 'f' && document.fullscreenEnabled) {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length]);
  const title = slide.type === 'standings' ? `POSICIONES · ${slide.group || 'GRUPOS'}` : 'FIXTURE Y RESULTADOS';
  return <main aria-label='Presentación automática de las copas femeninas' style={{ width: '100vw', height: '100dvh', background: '#020617', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
    <svg viewBox='0 0 1920 1080' role='img' aria-label={`${slide.cup.category} · ${slide.cup.name} · ${title} · Diapositiva ${index + 1} de ${slides.length}`} style={{ width: '100%', height: '100%', fontFamily: 'Arial, sans-serif' }}>
      <defs><linearGradient id='tv-bg' x1='0' y1='1' x2='1' y2='0'><stop stopColor='#0755d8' /><stop offset='.45' stopColor='#291087' /><stop offset='.8' stopColor='#ed24ad' /><stop offset='1' stopColor='#ff894c' /></linearGradient></defs>
      <rect width='1920' height='1080' fill='url(#tv-bg)' />
      <clipPath id='tv-frame'><rect width='1920' height='1080' /></clipPath>
      <circle cx='1860' cy='40' r='330' fill='none' stroke='white' strokeOpacity='.12' strokeWidth='45' clipPath='url(#tv-frame)' />
      <text x='65' y='93' fill='#33e393' fontSize='65' fontWeight='900'>{slide.cup.category}</text>
      <Name value={slide.cup.name.toUpperCase()} x={245} y={90} max={53} size={46} />
      <text x='65' y='180' fill='white' fontSize='40' fontWeight='800'>{title}</text>
      <text x='65' y='226' fill='#d7e9ff' fontSize='27'>{slide.type === 'standings' ? 'Acumulado del torneo' : displayDate(date, true)}</text>
      <rect x='50' y='263' width='1820' height='651' rx='20' fill='#031222' />
      {slide.type === 'message' && <text x='960' y='580' fill='white' textAnchor='middle' fontSize='38'>{slide.message}</text>}
      {slide.type === 'fixture' && <g>
        <rect x='50' y='263' width='1820' height='58' rx='18' fill='#0757a3' />
        {[[80, 'HORA'], [275, 'LOCAL'], [760, 'VISITANTE'], [1250, 'MARCADOR'], [1530, 'CANCHA / ZONA']].map(([x, label]) => <text key={label} x={x} y='303' fill='white' fontSize='26' fontWeight='700'>{label}</text>)}
        {slide.rows.map((match, row) => {
          const y = 321 + row * 98;
          const display = matchDisplay(match);
          return <g key={match.id}>
            <rect x='51' y={y} width='1818' height='97' fill={row % 2 ? '#081e34' : '#031222'} />
            <text x='80' y={y + 51} fill='white' fontSize='31' fontWeight='700'>{display.time}</text>
            <Name value={match.home_team_name || 'Local'} x={275} y={y + 36} max={23} />
            <Name value={match.away_team_name || 'Visitante'} x={760} y={y + 36} max={23} />
            <text x='1340' y={y + 44} textAnchor='middle' fill={display.result ? '#33e393' : 'white'} fontSize='40' fontWeight='800'>{display.result || 'VS'}</text>
            <text x='1340' y={y + 78} textAnchor='middle' fill='#a6c5df' fontSize='18'>{display.label}</text>
            <Name value={match.venue || 'A confirmar'} x={1530} y={y + 31} max={21} size={25} />
            <text x='1530' y={y + 83} fill='#a6c5df' fontSize='19'>{textLines(match.group_name || match.phase || '', 28, 1)[0]}</text>
          </g>;
        })}
        {!slide.rows.length && <text x='960' y='580' fill='white' textAnchor='middle' fontSize='38'>No hay partidos programados para esta fecha.</text>}
      </g>}
      {slide.type === 'standings' && <g>
        <rect x='50' y='263' width='1820' height='58' rx='18' fill='#0757a3' />
        {[[80, '#'], [180, 'EQUIPO'], [840, 'PJ'], [980, 'PG'], [1120, 'PP'], [1260, 'PF'], [1410, 'PC'], [1560, 'DIF'], [1750, 'PTS']].map(([x, label]) => <text key={label} x={x} y='303' fill='white' fontSize='27' fontWeight='700'>{label}</text>)}
        {slide.rows.map((team, row) => {
          const y = 321 + row * 73;
          return <g key={team.id}>
            <rect x='51' y={y} width='1818' height='72' fill={row % 2 ? '#081e34' : '#031222'} />
            <text x='80' y={y + 48} fill='white' fontSize='32'>{slide.offset + row + 1}</text>
            <Name value={team.name} x={180} y={y + 29} max={32} size={28} />
            {[[840, team.pj], [980, team.pg], [1120, team.pp], [1260, team.pf], [1410, team.pc], [1560, team.diff], [1750, team.pts]].map(([x, value]) => <text key={x} x={x} y={y + 48} fill={x === 1750 ? '#33e393' : 'white'} fontSize='32' fontWeight={x === 1750 ? '800' : '400'}>{value}</text>)}
          </g>;
        })}
        {!slide.rows.length && <text x='960' y='580' fill='white' textAnchor='middle' fontSize='38'>Sin equipos asignados a grupos.</text>}
      </g>}
      <text x='65' y='980' fill='white' fontSize='25'>{!online || slide.cached ? 'Sin conexión confirmada · Los datos pueden estar desactualizados' : slide.received ? `Actualizado: ${slide.received}` : ''}</text>
      <text x='65' y='1030' fill='#d7e9ff' fontSize='23'>{paused ? 'En pausa · ' : ''}{index + 1} / {slides.length}{slide.pages ? ` · Página ${slide.page} de ${slide.pages}` : ''}</text>
      {qrs[slide.cup.id] && <image href={qrs[slide.cup.id]} x='1740' y='929' width='135' height='135' />}
      <text x='1705' y='999' textAnchor='end' fill='white' fontSize='23'>QR · {slide.cup.category}</text>
    </svg>
  </main>;
}
