import OpenAI from "openai";
import { allPlaces } from "./PlaceCard.js";

// -----------------------------
// OpenAI Client (지연 생성: 키가 없을 때 모듈 로드 자체가 깨지지 않도록)
// -----------------------------
let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

// -----------------------------
// 지역 필터
// -----------------------------
// export function filterPlaces({ region }) {
//   if (!region) return [];

//   const q = String(region).trim().toLowerCase();

//   const regionCandidates = Array.from(
//     new Set(
//       allPlaces
//         .map(p => (p.addr1 || '').toLowerCase())
//         .filter(Boolean)
//         .flatMap(addr => addr.split(/[,\/\s]+/).slice(0, 3))
//     )
//   ).sort((a, b) => b.length - a.length);

//   let regionKeyword = '';
//   for (const cand of regionCandidates) {
//     if (!cand) continue;
//     if (q.includes(cand)) {
//       regionKeyword = cand;
//       break;
//     }
//   }

//   const keyword = regionKeyword || q;

//   return allPlaces.filter((place) =>
//     (place.addr1 || "").toLowerCase().includes(keyword)
//   );
// }

export function filterPlaces({ region }) {
  if (!region) return [];

  const normalize = (s) =>
    String(s || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/(특별시|광역시|시|도|구|군|동|읍|면|역)$/g, '');

  const q = String(region).trim().toLowerCase();
  const qTokens = q.split(/[,\/\s]+/).map(t => normalize(t)).filter(Boolean);

  const regionCandidates = Array.from(
    new Set(
      allPlaces
        .map(p => p.addr1 || '')
        .filter(Boolean)
        .flatMap(addr => addr.split(/[,\/\s]+/).slice(0, 3))
        .map(t => normalize(t))
        .filter(Boolean)
    )
  ).sort((a, b) => b.length - a.length);

  // 1) 쿼리 토큰으로 후보 찾기
  let matched = '';
  for (const qt of qTokens) {
    for (const cand of regionCandidates) {
      if (!cand) continue;
      if (qt === cand || cand.includes(qt) || qt.includes(cand)) {
        matched = cand;
        break;
      }
    }
    if (matched) break;
  }

  // 2) 쿼리 전체에서 후보 찾기 (fallback)
  if (!matched) {
    for (const cand of regionCandidates) {
      if (!cand) continue;
      if (q.replace(/\s+/g, '').includes(cand)) {
        matched = cand;
        break;
      }
    }
  }

  const keyword = matched || qTokens.join(' ') || q;

  return allPlaces.filter((place) =>
    (place.addr1 || '').toLowerCase().replace(/\s+/g, '').includes(keyword)
  );
}

// -----------------------------
// 최신순 후보 추출
// -----------------------------
export function topN(candidates, n = 10) {
  if (!Array.isArray(candidates)) return [];

  return [...candidates]
    .sort((a, b) => {
      const ta = Number(a.modifiedtime || a.createdtime || 0);
      const tb = Number(b.modifiedtime || b.createdtime || 0);
      return tb - ta;
    })
    .slice(0, n);
}

// -----------------------------
// OpenAI 추천
// -----------------------------
async function recommendWithOpenAI(places, userQuery) {
  const uq = String(userQuery || '').trim();
  const candidateList = places.map((p) => ({
    contentid: String(p.contentid),
    title: p.title,
    address: p.addr1 || "",
    description:
      p.overview ||
      p.tel ||
      "서울의 관광 명소입니다.",
  }));

  const response = await getClient().responses.create({
    model: "gpt-5-mini",

    input: [
      {
        role: "system",
        content: `
당신은 서울 투어 전문가이다.

사용자가 가장 만족할 만한 장소 5개를 추천한다.

반드시 JSON만 출력한다.
`,
      },

      {
        role: "user",
        content: `사용자 요구: ${String(userQuery).trim()}\n\n후보 장소는 아래와 같다.\n\n${JSON.stringify(candidateList)}\n\n추천 기준\n- 사용자 요구 만족\n- 매력도\n- 접근성\n- 유명도\n\n반드시 상위 5개만 선택한다.`,
      },
    ],

    text: {
      format: {
        type: "json_schema",

        name: "travel_recommend",

        strict: true,

        schema: {
          type: "object",

          properties: {
            recommendations: {
              type: "array",

              minItems: 5,

              maxItems: 5,

              items: {
                type: "object",

                properties: {
                  contentid: {
                    type: "string",
                  },

                  score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },

                  reason: {
                    type: "string",
                  },
                },

                required: [
                  "contentid",
                  "score",
                  "reason",
                ],

                additionalProperties: false,
              },
            },
          },

          required: ["recommendations"],

          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.output_text).recommendations;
}

// -----------------------------
// 메인 추천 함수
// -----------------------------
export async function recommendPlaces({
  region,
}) {
  if (!region) {
    throw new Error("region is required");
  }

  const filtered = filterPlaces({
    region,
  });

  if (filtered.length === 0) {
    return [];
  }

  const candidates = topN(filtered, 20);

  const aiResult =
    await recommendWithOpenAI(candidates, region);

  const finalResult = aiResult
    .map((item) => {
      const place = candidates.find(
        (p) =>
          String(p.contentid) ===
          String(item.contentid)
      );

      if (!place) return null;

      if (!place.overview) {
      place.overview = item.reason;
      }

      return {
        ...place,
        score: item.score,
        reason: item.reason,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return finalResult;
}