import { recommendPlaces } from '../src/places/openaiService.js';

async function run() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY 환경변수를 설정하세요. 예: export OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  try {
    const result = await recommendPlaces({ region: '서울특별시 강남구', apiKey });
    console.log('추천 결과:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('추천 호출 중 오류 발생:', err);
    process.exit(1);
  }
}

run();
