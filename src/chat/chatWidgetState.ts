import { ref } from 'vue'

export const isChatOpen = ref(false)

export function openChat() {
  isChatOpen.value = true
}

export function closeChat() {
  isChatOpen.value = false
}

export function toggleChat() {
  isChatOpen.value = !isChatOpen.value
}
