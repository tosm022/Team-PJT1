// Usage: node scripts/sendRecommend.js "영등포구"
const region = process.argv[2] || '서울특별시 강남구';

async function run() {
  const res = await fetch('http://localhost:3005/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ region }),
  });
  const j = await res.json();
  console.log(JSON.stringify(j, null, 2));
}

run().catch(e => { console.error(e); process.exit(1); });
