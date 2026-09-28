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

export function clearEdgeConnectedWhite(data, width, height, threshold = 185) {
  const visited = new Uint8Array(width * height);
  const queue = [];
  const isExteriorWhite = (pixel) => {
    const offset = pixel * 4;
    if (data[offset + 3] === 0) return false;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    return Math.min(red, green, blue) >= threshold && Math.max(red, green, blue) - Math.min(red, green, blue) <= 30;
  };
  const enqueue = (pixel) => {
    if (visited[pixel] || !isExteriorWhite(pixel)) return;
    visited[pixel] = 1;
    queue.push(pixel);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const pixel = queue[cursor];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    data[pixel * 4 + 3] = 0;
    if (x > 0) enqueue(pixel - 1);
    if (x + 1 < width) enqueue(pixel + 1);
    if (y > 0) enqueue(pixel - width);
    if (y + 1 < height) enqueue(pixel + width);
  }
  return data;
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function removeEdgeWhiteFromBlob(blob) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const source = new Image();
    await new Promise((resolve, reject) => {
      source.onload = resolve;
      source.onerror = reject;
      source.src = objectUrl;
    });
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1024 / Math.max(source.naturalWidth, source.naturalHeight));
    canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    clearEdgeConnectedWhite(pixels.data, canvas.width, canvas.height);
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const transparentLogoCache = new Map();
export function removeEdgeWhiteBackground(source) {
  if (!source) return Promise.resolve(source);
  if (!transparentLogoCache.has(source)) transparentLogoCache.set(source, fetch(source, { signal: AbortSignal.timeout(5000) })
    .then((response) => {
      if (!response.ok) throw new Error('Logo unavailable');
      return response.blob();
    })
    .then(removeEdgeWhiteFromBlob));
  return transparentLogoCache.get(source);
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
  const removeWhite = image.getAttribute('data-remove-edge-white') === 'true';
  if (!href || (href.startsWith('data:') && !removeWhite)) return;
  try {
    if (removeWhite) {
      image.setAttribute('href', await removeEdgeWhiteBackground(href));
      image.removeAttribute('data-remove-edge-white');
      return;
    }
    const response = await fetch(href, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Logo unavailable');
    const blob = await response.blob();
    image.setAttribute('href', await blobToDataUrl(blob));
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
