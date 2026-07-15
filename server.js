import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadJson(name) {
  const p = join(__dirname, 'src', 'data', name);
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('Failed to load', p, e);
    return null;
  }
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

const COMPANION_MAP = {
  family: new Set(['12', '14', '39']),
  friends: new Set(['28', '39']),
  alone: new Set(['28', '14', '39']),
  couple: new Set(['14', '39']),
};

function filterPlaces({ region, companion }) {
  if (!region || !companion) return [];
  const set = COMPANION_MAP[companion];
  if (!set) return [];
  const regionLower = region.toLowerCase();
  return allPlaces.filter(p => {
    const addr1 = (p.addr1 || '').toLowerCase();
    const ct = String(p.contenttypeid ?? p.contentTypeId ?? '');
    return addr1.includes(regionLower) && set.has(ct);
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

async function scorePlaceWithOpenAI(place, { apiKey, model = 'gpt-5-nano' } = {}) {
  const client = new OpenAI({ apiKey });
  const system = `You are a concise Korean travel recommender. You must reply only in JSON format.`;
  const userPrompt = `\n사용자 요구: 장소가 해당 사용자가 좋아할지 0에서 100까지 숫자로 평가하고, 한두 문장 이유를 제시하세요.\n출력은 반드시 JSON 형태로만 반환하세요: {"contentid":"...", "score":NUMBER, "reason":"..."}.\n\n사용자가 '${place.companion || ''}'와 함께 갈 서울 여행지를 찾고 있습니다. \n아래 제공된 장소가 이 동행자 구성에 얼마나 적합한지 0에서 100까지 숫자로 평가하고, 친절한 어조의 한두 문장으로 이유를 제시하세요.\n\n[장소 정보]\n- 장소 제목: ${place.title || ''}\n- 주소(addr1): ${place.addr1 || ''}\n- 간단 정보: ${place.overview || place.tel || '서울시 대표 관광지입니다.'}\n\n출력은 반드시 다른 부연 설명 없이 오직 JSON 형태로만 반환하세요.\n[출력 형식]\n{"contentid":"${place.contentid || place.contentId}", "score": 숫자, "reason":"이유"}\n`;

  try {
    const resp = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
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
    };
  } catch (err) {
    return {
      contentid: String(place.contentid ?? place.contentId ?? ''),
      score: 50,
      reason: `AI 호출 실패: ${err?.message || 'unknown'}`,
    };
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/recommend', async (req, res) => {
  const { region, companion, model } = req.body || {};
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set on server' });
  if (!region || !companion) return res.status(400).json({ error: 'region and companion required' });

  const candidates = filterPlaces({ region, companion });
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
      if (place) results.push({ ...place, score: s.score, reason: s.reason });
    });
  }

  const final = results.sort((a, b) => b.score - a.score).slice(0, 5);
  res.json({ ok: true, result: final });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));
