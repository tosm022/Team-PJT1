import OpenAI from "openai";
import { allPlaces } from "./PlaceCard.js";

/**
 * companion 매핑 (요청한 규칙)
 */
const COMPANION_MAP = {
  family: new Set(["12", "14", "39"]),
  friends: new Set(["28", "39"]),
  alone: new Set(["28", "14", "39"]),
  couple: new Set(["14", "39"]),
};

/**
 * 지역 + 동행자 1차 필터
 * - region: 문자열(예: "서울특별시 강남구" 또는 "강남구" 등 addr1 포함 검색)
 * - companion: "family" | "friends" | "alone" | "couple"
 */
export function filterPlaces({ region, companion }) {
  if (!region || !companion) return [];
  const set = COMPANION_MAP[companion];
  if (!set) return [];

  const regionLower = region.toLowerCase();
  return allPlaces.filter(p => {
    const addr1 = (p.addr1 || "").toLowerCase();
    const ct = String(p.contenttypeid ?? p.contentTypeId ?? "");
    return addr1.includes(regionLower) && set.has(ct);
  });
}

/**
 * Top-N 추출: 가능하면 modifiedtime/createdtime로 최신순, 없으면 랜덤
 */
export function topN(candidates, n = 20) {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];
  const withTime = candidates.filter(p => p.modifiedtime || p.createdtime);
  if (withTime.length >= Math.min(n, candidates.length)) {
    return [...withTime]
      .sort((a, b) => {
        const ta = parseInt(a.modifiedtime || a.createdtime || "0", 10);
        const tb = parseInt(b.modifiedtime || b.createdtime || "0", 10);
        return tb - ta;
      })
      .slice(0, n);
  }
  // fallback: 랜덤 샘플
  const arr = [...candidates];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

/**
 * OpenAI로 개별 장소 적합도(0-100)와 이유 요청
 * - expects `apiKey` string
 * - model 기본값을 필요에 따라 바꿔 쓰세요.
 */
async function scorePlaceWithOpenAI(place, { apiKey, model = "gpt-5-nano" } = {}) {
  const client = new OpenAI({ apiKey });

  const system = `You are a concise Korean travel recommender. You must reply only in JSON format.`;
  const userPrompt = `
사용자 요구: 장소가 해당 사용자가 좋아할지 0에서 100까지 숫자로 평가하고, 한두 문장 이유를 제시하세요.
출력은 반드시 JSON 형태로만 반환하세요: {"contentid":"...", "score":NUMBER, "reason":"..."}.

사용자가 '${companion}'와 함께 갈 서울 여행지를 찾고 있습니다. 
아래 제공된 장소가 이 동행자 구성에 얼마나 적합한지 0에서 100까지 숫자로 평가하고, 친절한 어조의 한두 문장으로 이유를 제시하세요.

[장소 정보]
- 장소 제목: ${place.title || ""}
- 주소(addr1): ${place.addr1 || ""}
- 간단 정보: ${place.overview || place.tel || "서울시 대표 관광지입니다."}

출력은 반드시 다른 부연 설명 없이 오직 JSON 형태로만 반환하세요.
[출력 형식]
{"contentid":"${place.contentid || place.contentId}", "score": 숫자, "reason":"이유"}
`;

  try {
    const resp = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 250,
      temperature: 0.0,
    });

    const text = resp.choices?.[0]?.message?.content ?? resp.choices?.[0]?.text ?? "";
    const json = JSON.parse(text);
    // 보정: score가 0~100 범위인지 확인
    const score = Math.max(0, Math.min(100, Number(json.score) || 0));
    return {
      contentid: String(json.contentid ?? place.contentid ?? place.contentId ?? ""),
      score,
      reason: String(json.reason ?? "").trim(),
    };
  } catch (err) {
    // 실패 시 중립 점수 반환(예: 50) — 호출 문제 발생하면 로그 확인
    return {
      contentid: String(place.contentid ?? place.contentId ?? ""),
      score: 50,
      reason: `AI 호출 실패: ${err?.message || "unknown"}`,
    };
  }
}

/**
 * 메인 추천 함수
 * - region: addr1 포함 검색 문자열
 * - companion: family|friends|alone|couple
 * - apiKey: OpenAI API key (string)
 * - options.model: 모델명 (선택)
 *
 * 반환: 최종 Top 5 배열 (각 항목에 원본 place + score + reason 포함)
 */
export async function recommendPlaces({ region, companion, apiKey, options = {} }) {
  if (!region || !companion || !apiKey) {
    throw new Error("region, companion, apiKey are required");
  }

  const candidates = filterPlaces({ region, companion });
  if (candidates.length === 0) return [];

  const top20 = topN(candidates, 20);

  const results = [];
  const concurrency = 5;
  for (let i = 0; i < top20.length; i += concurrency) {
    const slice = top20.slice(i, i + concurrency);
    const promises = slice.map(p => scorePlaceWithOpenAI(p, companion, { apiKey, model: options.model }));
    const scored = await Promise.all(promises);
    scored.forEach(s => {
      const place = top20.find(t => String(t.contentid) === String(s.contentid) || String(t.contentId) === String(s.contentid));
      if (place) results.push({ ...place, score: s.score, reason: s.reason });
    });
  }

  // score로 정렬 후 Top 5 반환
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}