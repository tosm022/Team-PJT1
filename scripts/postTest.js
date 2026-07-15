import fetch from 'node-fetch';

async function run(){
  const res = await fetch('http://localhost:3005/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ region: '영등포구' }),
  });
  const j = await res.json();
  console.log('response:', j);
}
run().catch(e=>console.error(e));
