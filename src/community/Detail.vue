<!-- 글 상세 -->
<template>
  <div v-if="post">
    <h1>{{ post.title }}</h1>
    <p>작성자 : {{ post.author }}</p>
    <p>{{ formattedDate }}</p>

    <div v-if="post.place">
      <h3>태그된 장소</h3>
      <p>📍 {{ post.place.title }}</p>
      <p>{{ post.place.address }}</p>
    </div>

    <div class="content">
      {{ post.content }}
    </div>

    <!-- 🔑 비밀번호 입력 영역 (prompt를 대신하는 인풋 창) -->
    <div v-if="showPasswordInput" class="password-confirm-box">
      <p>
        <strong>{{ pendingAction === 'edit' ? '게시글 수정' : '게시글 삭제' }}</strong>을 위해 비밀번호를 입력해 주세요.
      </p>
      <div class="password-input-row">
        <input 
          v-model="passwordInput" 
          type="password" 
          placeholder="비밀번호 입력" 
          @keyup.enter="confirmPassword"
          ref="passwordField"
        />
        <button @click="confirmPassword" class="confirm-btn">확인</button>
        <button @click="cancelPasswordInput" class="cancel-btn">취소</button>
      </div>
    </div>

    <div class="actions">
      <button @click="like">
        👍 좋아요 {{ post.likes || 0 }}
      </button>

      <!-- 수정/삭제 버튼을 누르면 인풋 창이 나타납니다 -->
      <button @click="triggerAction('edit')">수정</button>
      <button @click="triggerAction('delete')">삭제</button>

      <router-link
        :to="{
          name: 'CommunityList',
          query: {
            contentid: post.place?.contentid
          }
        }"
      >
        <button>같은 장소 게시글 보기</button>
      </router-link>
    </div>
  </div>

  <div v-else>
    게시글을 찾을 수 없습니다.
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Post } from './type'
import { getPostById, updatePost, deletePost } from './storage'

const route = useRoute()
const router = useRouter()

const id = Number(route.params.id)
const post = ref<Post | null>(null)

// 비밀번호 확인용 상태값들
const showPasswordInput = ref(false)
const passwordInput = ref('')
const pendingAction = ref<'edit' | 'delete' | null>(null) // 현재 수행하려는 동작 ('edit' 또는 'delete')
const passwordField = ref<HTMLInputElement | null>(null)

onMounted(() => {
  post.value = getPostById(id) || null
})

const formattedDate = computed(() => {
  return post.value
    ? new Date(post.value.createdAt).toLocaleString()
    : ''
})

function like() {
  if (!post.value) return

  const updated = {
    ...post.value,
    likes: (post.value.likes || 0) + 1
  }

  updatePost(updated)
  post.value = updated
}

// 1. 수정/삭제 버튼을 눌렀을 때 입력 폼 열기
function triggerAction(action: 'edit' | 'delete') {
  if (!post.value) return
  
  // 상태 초기화 및 활성화
  passwordInput.value = ''
  pendingAction.value = action
  showPasswordInput.value = true

  // 입력창에 자동으로 포커스 주기
  nextTick(() => {
    if (passwordField.value) {
      passwordField.value.focus()
    }
  })
}

// 2. 취소 버튼 클릭 시 폼 닫기
function cancelPasswordInput() {
  showPasswordInput.value = false
  passwordInput.value = ''
  pendingAction.value = null
}

// 3. 비밀번호 확인 버튼 클릭 시 실행
function confirmPassword() {
  if (!post.value || !pendingAction.value) return

  const trimmedInput = passwordInput.value.trim()
  if (!trimmedInput) {
    alert('비밀번호를 입력해 주세요.')
    return
  }

  const storedPassword = (post.value as any).password ?? ''

  if (trimmedInput === storedPassword) {
    const action = pendingAction.value
    // 성공 시 입력창 먼저 닫기
    cancelPasswordInput()

    if (action === 'edit') {
      // 수정 페이지로 이동
      router.push({
        name: 'CommunityWrite',
        params: { id: post.value.id }
      })
    } else if (action === 'delete') {
      // 삭제 처리
      deletePost(post.value.id)
      router.push({ name: 'CommunityList' })
    }
  } else {
    alert('비밀번호가 일치하지 않습니다.')
  }
}
</script>

<style scoped>
/* 1. 원래 가지고 계시던 원본 스타일 완벽 복원 ⭐ */
.place-result {
  padding: 12px;
  border: 1px solid #ddd;
  margin-top: 8px;
  border-radius: 8px;
  cursor: pointer;
  background: white;
}

.place-result:hover {
  background: #f1f5f9;
}

.place-result p {
  margin: 5px 0;
  color: #666;
}

.place-selected {
  margin-top: 15px;
  padding: 15px;
  border-radius: 10px;
  background: #eff6ff;
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.place-result * {
  pointer-events: none; /* 카드 내부의 글자나 아이콘이 클릭을 방해하지 못하게 막음 */
}


/* 2. 상세 페이지 전용 하단 버튼 레이아웃만 조정 (원래 색상에 영향 주지 않음) */
.actions {
  margin-top: 24px;
  display: flex;
  gap: 10px;
}


/* 3. 🔑 비밀번호 입력 영역 스타일 (이 부분만 새로 추가된 것입니다) */
.password-confirm-box {
  margin: 20px 0;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.password-confirm-box p {
  margin: 0 0 10px 0;
  color: #334155;
  font-size: 14px;
}

.password-input-row {
  display: flex;
  gap: 8px;
}

.password-input-row input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  color: #334155;
}

.password-input-row input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.confirm-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.confirm-btn:hover {
  background: #2563eb;
}

.cancel-btn {
  background: #e2e8f0;
  color: #475569;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #cbd5e1;
}
</style>