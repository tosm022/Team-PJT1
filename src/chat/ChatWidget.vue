<template>
  <div class="chat-widget">
    <transition name="panel">
      <div v-if="isChatOpen" class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">🤖</span>
            <div>
              <strong>AI 장소 추천</strong>
              <p>서울 어디로 가볼까요?</p>
            </div>
          </div>
          <button class="close-btn" @click="closeChat" aria-label="닫기">✕</button>
        </div>
        <ChatBot />
      </div>
    </transition>

    <button
      class="fab"
      :class="{ active: isChatOpen }"
      @click="toggleChat"
      :aria-label="isChatOpen ? '챗봇 닫기' : 'AI 추천 챗봇 열기'"
    >
      <span v-if="!isChatOpen" class="fab-icon">💬</span>
      <span v-else class="fab-icon">✕</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import ChatBot from './ChatBot.vue'
import { isChatOpen, toggleChat, closeChat } from './chatWidgetState'
</script>

<style scoped>
.chat-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

.fab {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.38);
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
}
.fab-icon { font-size: 26px; line-height: 1; }
.fab:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(37, 99, 235, 0.45); }
.fab.active { background: #1e40af; }

.panel {
  position: absolute;
  right: 0;
  bottom: 80px;
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 560px;
  max-height: calc(100vh - 140px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  flex-shrink: 0;
}
.panel-title { display: flex; align-items: center; gap: 10px; }
.panel-icon { font-size: 22px; }
.panel-title strong { display: block; font-size: 15px; }
.panel-title p { margin: 2px 0 0; font-size: 12px; opacity: .85; }
.close-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  font-size: 13px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.close-btn:hover { background: rgba(255,255,255,0.25); }

.panel-enter-active, .panel-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.panel-enter-from, .panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(.97);
}

@media (max-width: 480px) {
  .chat-widget { right: 16px; bottom: 16px; }
  .panel {
    right: -16px;
    bottom: 76px;
    width: calc(100vw - 16px);
    height: calc(100vh - 116px);
    border-radius: 18px 18px 0 0;
  }
}
</style>
