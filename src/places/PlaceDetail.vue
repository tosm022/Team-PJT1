<template>
  <main class="place-detail">
    <div class="container" v-if="place">
      <div class="layout">
        <div
          class="thumb"
          :style="place.firstimage ? `background-image: url(${place.firstimage})` : ''"
        >
          <span v-if="!place.firstimage" class="thumb-fallback">📍</span>
        </div>

        <div class="info">
          <h1 class="title">{{ place.title }}</h1>

          <div class="chips">
            <span v-if="place.addr1" class="chip">📍 {{ place.addr1 }}</span>
            <span v-if="place.tel" class="chip">☎ {{ place.tel }}</span>
          </div>

          <p v-if="place.overview" class="overview">{{ place.overview }}</p>
          <p v-else class="overview muted">등록된 상세 설명이 없어요.</p>

          <div class="actions">
            <router-link :to="{ name: 'CommunityList', query: { contentid: place.contentid } }">
              <button>관련 게시글 보기</button>
            </router-link>

            <router-link :to="{ name: 'CommunityWrite', query: { placeId: place.contentid } }">
              <button class="secondary">이 장소로 글쓰기</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="container empty-state" v-else>
      <p>장소 정보를 찾을 수 없습니다.</p>
      <button @click="openChat">AI 추천 다시 받기</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPlaceByContentId } from './PlaceCard.js'
import { openChat } from '../chat/chatWidgetState'

const route = useRoute()

const place = computed(() => getPlaceByContentId(route.params.contentid as string))
</script>

<style scoped>
.place-detail { min-height: 60vh; padding: 32px 0 80px; }
.container { max-width: 900px; margin: 0 auto; padding: 0 16px; }

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.06);
}

.thumb {
  width: 100%;
  height: 220px;
  border-radius: 14px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-fallback { font-size: 40px; opacity: .5; }

.info { display: flex; flex-direction: column; }
.title { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 12px; }

.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.chip {
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
}

.overview { margin: 0 0 20px; line-height: 1.7; color: #374151; font-size: 14.5px; }
.overview.muted { color: #9ca3af; }

.actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: auto; }
.actions .secondary { background: #6b7280; }

.empty-state {
  text-align: center;
  padding: 60px 16px;
  color: #6b7280;
}
.empty-state button { margin-top: 16px; }

@media (min-width: 640px) {
  .layout { grid-template-columns: 280px 1fr; padding: 28px; }
  .thumb { height: 100%; min-height: 240px; }
}
</style>
