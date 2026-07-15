import { readFileSync } from 'fs';
import { join } from 'path';

function getServiceKey() {
  // try env first
  if (process.env.VITE_TOUR_API_KEY) return process.env.VITE_TOUR_API_KEY;
  if (process.env.TOUR_API_KEY) return process.env.TOUR_API_KEY;
  if (process.env.TOUR_SERVICE_KEY) return process.env.TOUR_SERVICE_KEY;
  if (process.env.SERVICE_KEY) return process.env.SERVICE_KEY;
  // read .env
  try {
    const p = join(process.cwd(), '.env');
    const txt = readFileSync(p, 'utf8');
    const names = ['VITE_TOUR_API_KEY','TOUR_API_KEY','TOUR_SERVICE_KEY','SERVICE_KEY'];
    for (const n of names) {
      const re = new RegExp('^'+n+'\\s*=\\s*(.*)$','m');
      const mm = txt.match(re);
      if (mm) return mm[1].trim();
    }
  } catch (e) {}
  return null;
}

async function run(contentId = '2723499') {
  const key = getServiceKey();
  if (!key) {
    console.error('VITE_TOUR_API_KEY not found in env or .env');
    process.exit(1);
  }
  const base = 'https://apis.data.go.kr/B551011/KorService1/detailCommon1';
  const url = new URL(base);
  url.searchParams.set('serviceKey', key);
  url.searchParams.set('contentId', contentId);
  url.searchParams.set('MobileOS', 'ETC');
  url.searchParams.set('MobileApp', 'TravelApp');
  url.searchParams.set('_type', 'json');
  url.searchParams.set('defaultYN', 'Y');
  url.searchParams.set('firstImageYN', 'Y');
  url.searchParams.set('addrYN', 'Y');
  url.searchParams.set('overviewYN', 'Y');

  console.log('Request URL:', url.toString());
  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error('API error', res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const item = data.response?.body?.items?.item?.[0] ?? null;
  const out = { raw: data, item };
  // write preview HTML
  const html = `<!doctype html><meta charset="utf-8"><title>Detail ${contentId}</title><h1>${item?.title ?? 'No title'}</h1><p><strong>addr1:</strong> ${item?.addr1 ?? ''}</p>${item?.firstimage ? `<p><img src="${item.firstimage}" style="max-width:100%"></p>` : ''}<p>${item?.overview ?? ''}</p>`;
  const outPath = join(process.cwd(), 'out');
  try { await import('fs').then(fs=>fs.promises.mkdir(outPath, { recursive: true })); } catch(e){}
  const filePath = join(outPath, `detail_${contentId}.html`);
  readFileSync; // noop to keep sync
  await import('fs').then(fs=>fs.promises.writeFile(filePath, html, 'utf8'));
  console.log('Wrote preview HTML to', filePath);
  console.log('Result item:');
  console.log(JSON.stringify(item, null, 2));
}

const cid = process.argv[2] || '2723499';
run(cid).catch(e=>{console.error(e); process.exit(1)});
