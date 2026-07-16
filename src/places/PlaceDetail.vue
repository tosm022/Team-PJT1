<template>
  <main class="place-detail">
    <div class="container loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>장소 상세 정보를 불러오는 중입니다...</p>
    </div>

    <div class="container" v-else-if="place">
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

          <p v-if="overview" class="overview" v-html="overview"></p>
          <p v-else-if="place.overview" class="overview">{{ place.overview }}</p>
          <p v-else class="overview muted">등록된 상세 설명이 없어요.</p>

          <p v-if="apiError" class="api-error-message">
            API 알림: {{ apiError }}
          </p>

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
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPlaceByContentId } from './PlaceCard.js'
import { openChat } from '../chat/chatWidgetState'

const route = useRoute()

// 1. 기본 장소 정보 로드
const place = computed(() => getPlaceByContentId(route.params.contentid as string))

// 2. 동적 API 조회를 위한 상태 정의
const overview = ref('')
const loading = ref(false)
const apiError = ref('')

// 3. CORS 회피형 TourAPI 호출 함수 구성 ⭐
async function fetchPlaceOverview(contentId: string) {
  if (!contentId) return
  
  loading.value = true
  overview.value = ''
  apiError.value = ''
  
  // 💡 [필수 입력] 발급받으신 진짜 공공데이터포털 일반 인증키(Encoding Key)를 여기에 넣어주세요!
  const serviceKey = import.meta.env.VITE_TOUR_API_KEY || "4732dbaf18f5efe8a5824b07fa95e838223a7ec738853aa861587a4714105ac6";
  
  // CORS 에러 우회를 위한 Vite 프록시 주소(/api)와 최신 KorService2 규격 사용
  const url = `/api/B551011/KorService2/detailCommon2?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=LocalHub&_type=json&contentId=${contentId}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP 에러! 상태코드: ${res.status}`)
    
    const textData = await res.text()
    
    // 혹시 XML 형태로 에러 메시지가 날아오는 경우 감지
    if (textData.includes('<errMsg>') || textData.includes('<returnAuthMsg>')) {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(textData, "text/xml")
      const errMsg = xmlDoc.getElementsByTagName("returnAuthMsg")[0]?.textContent || 
                     xmlDoc.getElementsByTagName("errMsg")[0]?.textContent || "인증 키 오류"
      throw new Error(`[공공데이터포털] ${errMsg}`)
    }

    const data = JSON.parse(textData)
    const items = data.response?.body?.items?.item
    
    if (items && items.length > 0) {
      overview.value = items[0].overview || ''
    } else {
      apiError.value = "이 장소의 상세 설명 정보가 데이터베이스에 존재하지 않습니다."
    }
  } catch (error: any) {
    console.error('TourAPI overview 로드 에러:', error)
    // 인증키가 아직 더미 상태일 때 에러 글씨로 사용자 화면을 해치지 않게 가볍게만 세팅
    apiError.value = "CORS 정책 우회 혹은 인증키 검증이 필요합니다."
  } finally {
    loading.value = false
  }
}

// 4. 최초 진입 시 및 장소 변경 시 실시간 호출 트리거
onMounted(() => {
  if (route.params.contentid) {
    fetchPlaceOverview(route.params.contentid as string)
  }
})

watch(() => route.params.contentid, (newId) => {
  if (newId) {
    fetchPlaceOverview(newId as string)
  }
})
</script>

<style scoped>
/* 🎨 원래 가지고 계시던 고유한 테마 색상과 디자인 디테일 100% 보존 ⭐ */
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

/* 🌀 로딩 스피너 디자인 (깔끔한 블루 컬러 적용) */
.loading-state {
  text-align: center;
  padding: 100px 16px;
  color: #6b7280;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ⚠️ 디버깅용 가이드 텍스트 스타일 */
.api-error-message {
  font-size: 11px;
  color: #94a3b8;
  margin-top: -10px;
  margin-bottom: 15px;
}
</style>