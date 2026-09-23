import QRCode from 'qrcode';
import { mkdir, writeFile } from 'node:fs/promises';

const output = new URL('../tests/qr-posters/', import.meta.url);
await mkdir(output, { recursive: true });
const tournaments = [
  { category: 'U13', title: ['COPA COMERCIAL ELDORADO', 'FEMENINO'], id: 'RnnbaaTuiT5jgcvvYAL1' },
  { category: 'U15', title: ['COPA KENIA', 'FEMENINO'], id: 'HSdtj05khaRuTnTi6EUk' },
  { category: 'U17', title: ['COPA COMERCIAL ELDORADO', 'FEMENINO'], id: 'maPFi2PUXTUojwKOgJMU' },
];
for (const tournament of tournaments) {
  tournament.url = `https://copakenianew.vercel.app/cartelera/${tournament.id}`;
  tournament.qr = await QRCode.toDataURL(tournament.url, { width: 1200, margin: 4, errorCorrectionLevel: 'M' });
}

function poster(landscape) {
  const width = landscape ? 3840 : 2480;
  const height = landscape ? 2160 : 3508;
  const cards = tournaments.map((t, i) => {
    const x = landscape ? 150 + i * 1190 : 150;
    const y = landscape ? 580 : 660 + i * 870;
    const w = landscape ? 1160 : 2180;
    const h = landscape ? 1370 : 810;
    const size = landscape ? 790 : 660;
    const qx = landscape ? x + (w - size) / 2 : x + w - size - 75;
    const qy = landscape ? y + 430 : y + 75;
    const textX = landscape ? x + w / 2 : x + 100;
    const align = landscape ? 'middle' : 'start';
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="#04172c" stroke="#2564ab" stroke-width="4"/>
      <text x="${textX}" y="${y + (landscape ? 180 : 225)}" text-anchor="${align}" fill="#33e393" font-size="${landscape ? 150 : 165}" font-weight="900">${t.category}</text>
      ${t.title.map((line, index) => `<text x="${textX}" y="${y + (landscape ? 282 : 360) + index * 72}" text-anchor="${align}" fill="white" font-size="${landscape ? 53 : 63}" font-weight="700">${line}</text>`).join('')}
      <image href="${t.qr}" x="${qx}" y="${qy}" width="${size}" height="${size}"/>
      <text x="${textX}" y="${landscape ? y + 1290 : y + 600}" text-anchor="${align}" fill="#b6d4ef" font-size="${landscape ? 43 : 48}">ESCANEÁ PARA VER LA CARTELERA</text></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Arial, sans-serif">
    <defs><linearGradient id="bg" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#0755d8"/><stop offset=".45" stop-color="#291087"/><stop offset=".8" stop-color="#ed24ad"/><stop offset="1" stop-color="#ff894c"/></linearGradient></defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/><circle cx="${width - 80}" cy="60" r="420" fill="none" stroke="white" stroke-opacity=".1" stroke-width="70"/>
    <text x="${width / 2}" y="${landscape ? 205 : 230}" fill="white" text-anchor="middle" font-size="${landscape ? 138 : 116}" font-weight="900">BÁSQUET FEMENINO</text>
    <text x="${width / 2}" y="${landscape ? 345 : 370}" fill="white" text-anchor="middle" font-size="${landscape ? 94 : 83}" font-weight="700">HORARIOS · RESULTADOS · POSICIONES</text>
    <text x="${width / 2}" y="${landscape ? 455 : 505}" fill="#d9eaff" text-anchor="middle" font-size="${landscape ? 59 : 60}">Elegí tu categoría y escaneá el QR</text>
    ${cards}
    <text x="${width / 2}" y="${height - 90}" fill="white" text-anchor="middle" font-size="${landscape ? 49 : 45}">CARTELERAS ACTUALIZADAS</text>
  </svg>`;
}
await writeFile(new URL('qr-femenino-imprimir.svg', output), poster(false));
await writeFile(new URL('qr-femenino-pantalla.svg', output), poster(true));
await writeFile(new URL('enlaces.json', output), JSON.stringify(tournaments.map(({ category, title, url }) => ({ category, title: title.join(' '), url })), null, 2));
await writeFile(new URL('index.html', output), `<!doctype html><html lang="es"><meta charset="utf-8"><title>Carteleras femeninas · QR</title><body style="background:#071426;color:white;font-family:Arial"><h1>Carteleras femeninas</h1><p id="status"></p><div style="display:flex;gap:20px;align-items:start">${['imprimir','pantalla'].map((type) => `<section style="width:48%"><button onclick="download('${type}')">Descargar PNG ${type}</button><br><img style="width:100%" src="qr-femenino-${type}.svg"></section>`).join('')}</div><script>async function download(type){try{const image=new Image();image.src='qr-femenino-'+type+'.svg';await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='qr-femenino-'+type+'.png';a.click();document.getElementById('status').textContent='PNG '+type+' descargado · '+canvas.width+' × '+canvas.height;}catch(e){document.getElementById('status').textContent=e.message;}}</script></body></html>`);
