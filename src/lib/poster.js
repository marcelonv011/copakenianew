export const POSTER_PAGE_SIZE = 8;

export function orderedMatches(matches, date = '') {
  return matches.filter((m) => !date || m.date === date).slice().sort((a, b) =>
    (a.date || '9999').localeCompare(b.date || '9999') ||
    (a.time || '99:99').localeCompare(b.time || '99:99') || String(a.id).localeCompare(String(b.id)));
}

export function matchDisplay(match) {
  const finished = match.status === 'finalizado';
  const valid = [match.home_score, match.away_score].every((n) => typeof n === 'number' && Number.isFinite(n));
  return {
    result: finished && valid ? `${match.home_score} – ${match.away_score}` : null,
    label: finished ? (valid ? 'FINALIZADO' : 'RESULTADO PENDIENTE') : match.status === 'en_curso' ? 'EN CURSO' : 'PROGRAMADO',
    time: match.time || 'A confirmar',
  };
}

export function displayDate(value, long = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return 'Fecha a confirmar';
  const [year, month, day] = value.split('-').map(Number);
  if (!long) return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function textLines(text, max = 20, count = 2) {
  const words = String(text || '').trim().split(/\s+/);
  const lines = [''];
  for (const word of words) {
    const last = lines.length - 1;
    if (lines[last] && `${lines[last]} ${word}`.length > max && lines.length < count) lines.push(word);
    else lines[last] = `${lines[last]} ${word}`.trim();
  }
  return lines.map((line) => line.length > max ? `${line.slice(0, max - 1)}…` : line);
}

export function saveDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen PNG.')), 'image/png'));
}

async function savePosterBlob(blob, filename) {
  const file = new File([blob], filename, { type: 'image/png' });
  const isAppleMobile = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  if (isAppleMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename.replace(/\.png$/i, '') });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// External logos may not allow CORS. Export their text fallback instead of failing the poster.
async function embedImage(image) {
  const href = image.getAttribute('href');
  if (!href || href.startsWith('data:')) return;
  try {
    const response = await fetch(href, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Logo unavailable');
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    image.setAttribute('href', dataUrl);
  } catch {
    image.remove();
  }
}

export async function downloadPoster(svg, filename) {
  const clone = svg.cloneNode(true);
  const height = Number(svg.getAttribute('viewBox').split(/\s+/)[3]);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', '1080');
  clone.setAttribute('height', String(height));
  await Promise.all([...clone.querySelectorAll('image')].map(embedImage));
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    await savePosterBlob(await canvasBlob(canvas), filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}
