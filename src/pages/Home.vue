<template>
  <div>
    <h1>LocalHub</h1>
    <p>서울 장소 공유 플랫폼</p>
    <div style="margin-top:20px">
      <label>지역: <input v-model="region" placeholder="서울특별시 강남구" /></label>
      <label style="margin-left:12px">동행: 
        <select v-model="companion">
          <option value="couple">couple</option>
          <option value="family">family</option>
          <option value="friends">friends</option>
          <option value="alone">alone</option>
        </select>
      </label>
      <button @click="getRecommend" style="margin-left:12px">추천 받기</button>
    </div>

    <div v-if="loading" style="margin-top:12px">로딩중...</div>
    <ul v-if="results.length" style="margin-top:12px">
      <li v-for="r in results" :key="r.contentid" style="margin-bottom:8px">
        <strong>{{ r.title }}</strong> — 점수: {{ r.score }}<br />
        <em>{{ r.reason }}</em>
      </li>
    </ul>
    <div v-else-if="!loading" style="margin-top:12px">추천 결과가 없습니다.</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const region = ref('서울특별시 강남구');
const companion = ref('couple');
const results = ref([] as any[]);
const loading = ref(false);

async function getRecommend() {
  loading.value = true;
  results.value = [];
  try {
    const resp = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region: region.value, companion: companion.value }),
    });
    const json = await resp.json();
    if (json.ok && Array.isArray(json.result)) {
      results.value = json.result;
    } else if (json.result) {
      results.value = json.result;
    } else {
      console.error('API error', json);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>