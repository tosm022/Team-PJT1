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
export function filterPlaces({ region }) {
  if (!region) return [];

  const keyword = region.trim().toLowerCase();

  return allPlaces.filter((place) =>
    (place.addr1 || "").toLowerCase().includes(keyword)
  );
}

// -----------------------------
// 최신순 후보 추출
// -----------------------------
export function topN(candidates, n = 20) {
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
async function recommendWithOpenAI(places) {
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
당신은 서울 여행 전문가이다.

사용자가 가장 만족할 만한 장소 5개를 추천한다.

반드시 JSON만 출력한다.
`,
      },

      {
        role: "user",
        content: `
후보 장소는 아래와 같다.

${JSON.stringify(candidateList)}

추천 기준

- 여행 매력도
- 유명도
- 접근성
- 다양한 연령이 만족할 가능성

반드시 상위 5개만 선택한다.
`,
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
    await recommendWithOpenAI(candidates);

  const finalResult = aiResult
    .map((item) => {
      const place = candidates.find(
        (p) =>
          String(p.contentid) ===
          String(item.contentid)
      );

      if (!place) return null;

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