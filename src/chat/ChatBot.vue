<template>
  <div class="chatbot">
    <div class="messages" ref="messagesEl">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="message"
        :class="msg.role"
      >
        <p v-if="msg.text" class="bubble">{{ msg.text }}</p>

        <div v-if="msg.recommendations" class="rec-cards">
          <button
            v-for="place in msg.recommendations"
            :key="place.contentid"
            class="rec-card"
            @click="goToPlace(place.contentid)"
          >
            <strong class="rec-title">{{ place.title }}</strong>
            <p class="rec-reason">{{ place.reason }}</p>
            <span class="rec-score">추천 점수 {{ place.score }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="message assistant">
        <p class="bubble typing">
          <span></span><span></span><span></span>
        </p>
      </div>
    </div>

    <form class="input-row" @submit.prevent="send">
      <input
        v-model="input"
        placeholder="예: 강남, 종로, 한강..."
        :disabled="loading"
      />
      <button type="submit" class="send-btn" :disabled="loading || !input.trim()" aria-label="보내기">
        ➤
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { recommendPlaces } from '../places/openaiService.js'
import { closeChat } from './chatWidgetState'

type Recommendation = {
  contentid: string
  title: string
  reason: string
  score: number
}

type ChatMessage = {
  role: 'user' | 'assistant'
  text?: string
  recommendations?: Recommendation[]
}

const router = useRouter()
const input = ref('')
const loading = ref(false)
const messagesEl = ref<HTMLDivElement | null>(null)
const messages = ref<ChatMessage[]>([
  { role: 'assistant', text: '안녕하세요! 가고 싶은 지역을 알려주시면 어울리는 장소를 추천해드릴게요.' },
])

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

watch([messages, loading], scrollToBottom, { deep: true })

async function send() {
  const region = input.value.trim()
  if (!region || loading.value) return

  messages.value.push({ role: 'user', text: region })
  input.value = ''
  loading.value = true

  try {
    const results = await recommendPlaces({ region })

    if (results.length === 0) {
      messages.value.push({
        role: 'assistant',
        text: `'${region}'에 해당하는 장소를 찾지 못했어요. 다른 지역으로 다시 시도해보세요.`,
      })
    } else {
      messages.value.push({
        role: 'assistant',
        text: `'${region}' 근처에서 이런 곳들은 어떠세요?`,
        recommendations: results,
      })
    }
  } catch (err) {
    console.error('추천 실패', err)
    messages.value.push({
      role: 'assistant',
      text: '추천을 불러오는 중 문제가 발생했어요. API 키 설정을 확인하고 잠시 후 다시 시도해주세요.',
    })
  } finally {
    loading.value = false
  }
}

function goToPlace(contentid: string) {
  closeChat()
  router.push({ name: 'PlaceDetail', params: { contentid } })
}
</script>

<style scoped>
.chatbot {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message.user { align-self: flex-end; }
.message.assistant { align-self: flex-start; }

.bubble {
  margin: 0;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.5;
  max-width: 260px;
}
.message.user .bubble { background: var(--primary); color: #fff; border-bottom-right-radius: 4px; }
.message.assistant .bubble { background: #fff; color: #111827; border: 1px solid var(--border); border-bottom-left-radius: 4px; }

.bubble.typing { display: flex; gap: 4px; align-items: center; padding: 12px 16px; }
.bubble.typing span {
  width: 6px; height: 6px; border-radius: 50%; background: #9ca3af;
  animation: bounce 1.2s infinite ease-in-out;
}
.bubble.typing span:nth-child(2) { animation-delay: .15s; }
.bubble.typing span:nth-child(3) { animation-delay: .3s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: .5; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.rec-cards {
  display: grid;
  gap: 8px;
  margin-top: 8px;
  max-width: 280px;
}

.rec-card {
  text-align: left;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color .15s ease, transform .15s ease, box-shadow .15s ease;
}
.rec-card:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37,99,235,0.12);
}

.rec-title { display: block; font-size: 13.5px; color: #111827; }
.rec-reason { margin: 4px 0; font-size: 12px; color: #6b7280; line-height: 1.4; }
.rec-score { font-size: 11px; color: var(--primary); font-weight: 600; }

.input-row {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid var(--border);
  background: #fff;
}
.input-row input { margin-bottom: 0; flex: 1; background: #f8fafc; }
.send-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send-btn:disabled { opacity: .4; cursor: not-allowed; }
</style>
