<!-- 글 상세 -->
<template>
  <div class="detail-page" v-if="post">
    <nav class="breadcrumb" aria-label="경로">
      <router-link to="/">홈</router-link>
      <span class="sep">›</span>
      <router-link :to="{ name: 'CommunityList' }">커뮤니티</router-link>
      <span class="sep">›</span>
      <span>게시글 상세</span>
    </nav>

    <main class="container">
      <header class="post-header">
        <h1 class="title">{{ post.title }}</h1>
        <div class="meta">
          <span class="author">작성자: {{ post.author }}</span>
          <span class="date" v-if="post.createdAt">{{ new Date(post.createdAt).toLocaleString() }}</span>
        </div>
      </header>

      <section class="place" v-if="post.place">
        <h2 class="section-title">방문 장소</h2>
        <div class="place-info">
          <div class="place-name">📍 {{ post.place.title }}</div>
          <div class="place-address" v-if="post.place.address">{{ post.place.address }}</div>
        </div>
      </section>

      <section class="content">
        <h2 class="section-title">본문</h2>
        <div class="body" v-if="post.content">{{ post.content }}</div>
      </section>

      <section class="actions">
        <button class="btn like" @click="like">👍 {{ post.likes || 0 }}</button>

        <button
          class="btn edit"
          @click="confirmEdit"
        >
          수정
        </button>

        <button class="btn delete" @click="confirmRemove">삭제</button>

        <router-link class="btn back" :to="{ name: 'CommunityList' }">목록으로</router-link>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted
} from "vue"

import {
  useRoute,
  useRouter
} from "vue-router"

import {
  getPostById,
  incrementLike,
  deletePost
} from "./storage"

import type {
  Post
} from "./type"

const route = useRoute()
const router = useRouter()

const post = ref<Post | null>(null)

onMounted(() => {
  post.value =
    getPostById(
      Number(route.params.id)
    )
    ?? null
})

function like() {
  if (!post.value) return

  post.value =
    incrementLike(
      post.value.id
    )
    ?? null
}

function remove() {
  if (!post.value) return

  deletePost(
    post.value.id
  )

  router.push({
    name: "CommunityList"
  })
}

// 삭제 전에 확인창을 보여주고, 확인하면 기존 remove() 호출
function confirmRemove() {
  if (!post.value) return
  const ok = window.confirm('정말로 이 게시물을 삭제하시겠습니까?')
  if (ok) remove()
}

// 수정 전 비밀번호 확인(prompt). 일치하면 CommunityWrite로 이동, 취소시 아무 동작 없음.
function confirmEdit() {
  if (!post.value) return

  const input = window.prompt('비밀번호를 입력해 주세요.')
  if (input === null) return // 취소

  const stored = (post.value.password ?? '')
  if (input === stored) {
    router.push({ name: 'CommunityWrite', params: { id: post.value.id } })
  } else {
    alert('비밀번호가 일치하지 않습니다.')
  }
}
</script>

<style scoped>
.detail-page { padding: 20px; display:flex; justify-content:center; }
.container { width:100%; max-width:800px; background:#fff; border-radius:8px; padding:18px; box-sizing:border-box; border:1px solid #eef2f6; }

/* Breadcrumb */
.breadcrumb { max-width:800px; margin:0 auto 12px; font-size:13px; color:#6b7280; display:flex; gap:8px; align-items:center; }
.breadcrumb a { color:#6b7280; text-decoration:none; }
.breadcrumb .sep { color:#d1d5db; }

/* Header */
.post-header { margin-bottom:14px; }
.title { margin:0 0 8px; font-size:20px; color:#111827; }
.meta { display:flex; gap:12px; color:#6b7280; font-size:13px; }

/* Place */
.section-title { margin:0 0 8px; font-size:14px; color:#374151; font-weight:600; }
.place { margin-bottom:14px; padding:12px; border-radius:6px; background:#fafafa; border:1px solid #f3f4f6; }
.place-info { display:flex; flex-direction:column; gap:6px; color:#374151; }
.place-name { font-weight:600; }
.place-address { color:#6b7280; font-size:13px; }

/* Content */
.content { margin-bottom:16px; }
.body {
  white-space: pre-wrap; /* 줄바꿈 유지 */
  line-height:1.6;
  padding:12px;
  border-radius:6px;
  border:1px solid #f3f4f6;
  background:#fff;
  color:#111827;
  font-size:14px;
  min-height:120px;
}

/* Actions */
.actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:12px; justify-content:flex-end; }
.btn { padding:8px 12px; border-radius:6px; font-size:14px; border:1px solid transparent; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
.like { background:transparent; border:1px solid #e5e7eb; color:#111827; }
.edit { background:#fff; color:#0b69ff; border:1px solid #d1d5db; }
.delete { background:#ff4d4f; color:#fff; border:1px solid rgba(0,0,0,0.06); }
.back { background:transparent; color:#374151; border:1px solid #d1d5db; }

/* Responsive: 버튼 쌓임 */
@media (max-width: 520px) {
  .actions { justify-content:stretch; }
  .btn { flex:1 1 auto; }
  .meta { flex-direction:column; gap:4px; }
}
</style>