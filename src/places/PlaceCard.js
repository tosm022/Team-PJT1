import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadJsonFile(name) {
  try {
    const p = join(__dirname, '..', 'data', name);
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

const tour = loadJsonFile('서울_관광지.json');
const culture = loadJsonFile('서울_문화시설.json');
const sports = loadJsonFile('서울_레포츠.json');

const normalize = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  // 일부 JSON은 {response:{body:{items:{item:[...]}}}} 형태일 수 있으므로 안전 장치 추가
  if (data.response && data.response.body && data.response.body.items && Array.isArray(data.response.body.items.item)) {
    return data.response.body.items.item;
  }
  return [];
};

export const allPlaces = [
  ...normalize(tour),
  ...normalize(culture),
  ...normalize(sports),
];

// contentid로 장소 하나를 찾음 (문자/숫자 유연 지원)
export function getPlaceByContentId(contentId) {
  if (contentId == null) return null;
  const idStr = String(contentId);
  return allPlaces.find(p => {
    // 다양한 데이터 키 가능성 처리
    return String(p.contentid || p.contentId || p.id || p._id || '') === idStr;
  }) || null;
}

// 예: 외부 API로 더 상세 정보(별도 endpoint)가 필요하면 비동기 fetch 함수 예시
export async function fetchPlaceDetailFromApi(contentId, apiUrl, apiParams = {}) {
  const url = new URL(apiUrl);
  url.searchParams.set('contentId', contentId);
  Object.entries(apiParams).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}