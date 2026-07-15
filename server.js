import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 안전한 확인용 로그 (키 전체는 출력하지 않음)
console.log('OPENAI_API_KEY set on process:', !!process.env.OPENAI_API_KEY);
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);
console.log('.env exists at cwd:', existsSync(join(process.cwd(), '.env')));
console.log('.env exists at __dirname:', existsSync(join(__dirname, '.env')));
try {
  const envText = readFileSync(join(__dirname, '.env'), 'utf8');
  const m = envText.match(/^OPENAI_API_KEY\s*=\s*(.*)$/m);
  console.log('_.env contains OPENAI_API_KEY line?', !!m);
  if (m) console.log('OPENAI_API_KEY length (chars):', String(m[1]).length);
} catch (e) {
  console.log('Could not read .env file text for debug:', e?.message || e);
}

function loadJson(name) {
  const p = join(__dirname, 'src', 'data', name);
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('Failed to load', p, e);
    return null;
  }
}

function extractKeyFromDotenv() {
  try {
    const text = readFileSync(join(__dirname, '.env'), 'utf8');
    const lines = text.split(/\r?\n/);
    for (let line of lines) {
      if (!line) continue;
      // remove BOM and trim
      line = line.replace(/^\uFEFF/, '').trim();
      if (line.startsWith('OPENAI_API_KEY')) {
        const idx = line.indexOf('=');
        if (idx >= 0) return line.slice(idx + 1).trim();
      }
      // also accept VITE_OPENAI_API_KEY
      if (line.startsWith('VITE_OPENAI_API_KEY')) {
        const idx = line.indexOf('=');
        if (idx >= 0) return line.slice(idx + 1).trim();
      }
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
}

function normalize(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (data.response && data.response.body && data.response.body.items && Array.isArray(data.response.body.items.item)) {
    return data.response.body.items.item;
  }
  return [];
}

const tour = loadJson('서울_관광지.json');
const culture = loadJson('서울_문화시설.json');
const sports = loadJson('서울_레포츠.json');

const allPlaces = [
  ...normalize(tour),
  ...normalize(culture),
  ...normalize(sports),
];

function filterPlaces({ region }) {
  if (!region) return [];
  const regionLower = region.toLowerCase();
  return allPlaces.filter(p => {
    const addr1 = (p.addr1 || '').toLowerCase();
    return addr1.includes(regionLower);
  });
}

function topN(candidates, n = 20) {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];
  const withTime = candidates.filter(p => p.modifiedtime || p.createdtime);
  if (withTime.length >= Math.min(n, candidates.length)) {
    return [...withTime]
      .sort((a, b) => {
        const ta = parseInt(a.modifiedtime || a.createdtime || '0', 10);
        const tb = parseInt(b.modifiedtime || b.createdtime || '0', 10);
        return tb - ta;
      })
      .slice(0, n);
  }
  const arr = [...candidates];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

async function scorePlaceWithOpenAI(place, { apiKey, model } = {}) {
  const client = new OpenAI({ apiKey });
  const system = `You are a concise Korean travel recommender. You must reply only in JSON format.`;
  const userPromptBase = `\n사용자 요구: 장소가 해당 사용자가 좋아할지 0에서 100까지 숫자로 평가하고, 한두 문장 이유를 제시하세요.\n출력은 반드시 JSON 형태로만 반환하세요: {"contentid":"...", "score":NUMBER, "reason":"..."}.\n\n아래 제공된 장소가 이 사용자에게 얼마나 적합한지 0에서 100까지 숫자로 평가하고, 친절한 어조의 한두 문장으로 이유를 제시하세요.\n\n[장소 정보]\n- 장소 제목: ${place.title || ''}\n- 주소(addr1): ${place.addr1 || ''}\n- 간단 정보: ${place.overview || place.tel || '서울시 대표 관광지입니다.'}\n\n출력은 반드시 다른 부연 설명 없이 오직 JSON 형태로만 반환하세요.\n[출력 형식]\n{\"contentid\":\"${place.contentid || place.contentId}\", \"score\": 숫자, \"reason\":\"이유\"}\n`;

  const m = model || 'gpt-5-mini';
  console.log('Using single OpenAI model:', m);
  try {
    const resp = await client.chat.completions.create({
      model: m,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPromptBase },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 250,
      temperature: 0.0,
    });

    const text = resp.choices?.[0]?.message?.content ?? resp.choices?.[0]?.text ?? '';
    const json = JSON.parse(text);
    const score = Math.max(0, Math.min(100, Number(json.score) || 0));
    return {
      contentid: String(json.contentid ?? place.contentid ?? place.contentId ?? ''),
      score,
      reason: String(json.reason ?? '').trim(),
      model: m,
    };
  } catch (err) {
    const msg = String(err?.message || err);
    return {
      contentid: String(place.contentid ?? place.contentId ?? ''),
      score: 50,
      reason: `AI 호출 실패: ${msg}`,
    };
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/recommend', async (req, res) => {
  const { region, model } = req.body || {};
  let apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) apiKey = extractKeyFromDotenv();
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set on server' });
  if (!region) return res.status(400).json({ error: 'region required' });

  const candidates = filterPlaces({ region });
  // 디버그 출력: 후보 개수 및 샘플 주소 (민감정보 제외)
  console.log('/api/recommend region=', region);
  try {
    console.log('  region (json)=', JSON.stringify(region));
    console.log('  region codePoints=', Array.from(String(region)).map(c => c.codePointAt(0)));
  } catch (e) {
    console.log('  region debug failed', e?.message || e);
  }
  console.log('  candidates length=', candidates.length);
  console.log('  sample addr1s=', candidates.slice(0, 5).map(p => p.addr1));
  if (candidates.length === 0) return res.json({ ok: true, result: [] });

  const top20 = topN(candidates, 20);
  const results = [];
  const concurrency = 5;
  for (let i = 0; i < top20.length; i += concurrency) {
    const slice = top20.slice(i, i + concurrency);
    const promises = slice.map(p => scorePlaceWithOpenAI(p, { apiKey, model }));
    const scored = await Promise.all(promises);
    scored.forEach(s => {
      const place = top20.find(t => String(t.contentid) === String(s.contentid) || String(t.contentId) === String(s.contentid));
      if (place) results.push({ ...place, score: s.score, reason: s.reason, model: s.model });
    });
  }

  const final = results.sort((a, b) => b.score - a.score).slice(0, 5);
  res.json({ ok: true, result: final });
});

// 디버그: 필터된 후보 개수와 샘플 항목 반환
app.post('/api/debug-count', (req, res) => {
  const { region } = req.body || {};
  if (!region) return res.status(400).json({ error: 'region required' });
  const candidates = filterPlaces({ region });
  const sample = candidates.slice(0, 3);
  res.json({ ok: true, count: candidates.length, sample });
});

app.get('/api/debug-all', (req, res) => {
  res.json({ ok: true, total: allPlaces.length, sample: allPlaces.slice(0, 5).map(p => ({ title: p.title, addr1: p.addr1, contenttypeid: p.contenttypeid || p.contentId || p.contentId })) });
});

app.post('/api/debug-search', (req, res) => {
  const { region } = req.body || {};
  if (!region) return res.status(400).json({ error: 'region required' });
  const regionLower = region.toLowerCase();
  const found = allPlaces.filter(p => (p.addr1 || '').toLowerCase().includes(regionLower));
  res.json({ ok: true, count: found.length, sample: found.slice(0, 5).map(p => ({ title: p.title, addr1: p.addr1, contenttypeid: p.contenttypeid })) });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));
