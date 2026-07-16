<template>
  <main class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">서울의 하루를 발견하고 공유하세요</h1>
        <p class="hero-sub">공공데이터로 찾은 장소와 실제 경험을 함께 나눠보세요</p>
        <div class="hero-actions">
          <router-link :to="{ name: 'CommunityWrite' }">
            <button class="hero-btn primary">✏️ 글쓰기</button>
          </router-link>
          <button class="hero-btn secondary" @click="openChat">🤖 AI 추천받기</button>
        </div>
      </div>
    </section>

    <!-- Section: 최신 게시글 -->
    <section class="posts">
      <div class="container">
        <h2 class="section-title">최신 게시글</h2>
        <p v-if="posts.length === 0" class="empty">아직 작성된 게시글이 없습니다.</p>
        <div v-else class="cards">
          <router-link
            v-for="post in posts"
            :key="'new-' + post.id"
            :to="{ name: 'CommunityDetail', params: { id: post.id } }"
            class="card-link"
          >
            <PostCard :post="post" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- Section: 좋아요 많은 게시글 -->
    <section class="posts">
      <div class="container">
        <h2 class="section-title">좋아요 많은 게시글</h2>
        <p v-if="popularPosts.length === 0" class="empty">아직 작성된 게시글이 없습니다.</p>
        <div v-else class="cards">
          <router-link
            v-for="post in popularPosts"
            :key="'pop-' + post.id"
            :to="{ name: 'CommunityDetail', params: { id: post.id } }"
            class="card-link"
          >
            <PostCard :post="post" />
          </router-link>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PostCard from '../components/PostCard.vue'
import { getSortedPosts } from '../community/storage'
import type { Post } from '../community/type'
import { openChat } from '../chat/chatWidgetState'

function toCard(post: Post) {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.content.length > 80 ? post.content.slice(0, 80) + '…' : post.content,
    tags: post.place ? [post.place.title] : [],
    date: new Date(post.createdAt).toLocaleDateString(),
    likes: post.likes ?? 0,
  }
}

const posts = computed(() => getSortedPosts('latest').slice(0, 3).map(toCard))
const popularPosts = computed(() => getSortedPosts('popular').slice(0, 3).map(toCard))
</script>

<style scoped>
.home { color: #222; min-height: 60vh; padding-bottom: 80px; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 16px; }

/* Hero banner */
.hero {
  background: linear-gradient(135deg, #eaf4ff, #f5f9ff);
  padding: 44px 0;
  border-radius: 20px;
  margin-bottom: 32px;
  border: 1px solid rgba(37,99,235,0.08);
}
.hero-title { margin: 0 0 8px; font-size: 28px; font-weight: 700; color: #1f6feb; }
.hero-sub { margin: 0; font-size: 14px; color: #4b5563; }

.hero-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.hero-btn { border-radius: 999px; padding: 11px 20px; font-size: 14px; }
.hero-btn.primary { background: var(--primary); color: #fff; }
.hero-btn.secondary { background: #fff; color: var(--primary); border: 1px solid #dbeafe; }
.hero-btn.secondary:hover { background: #eff6ff; }

/* Section title */
.section-title { font-size: 18px; font-weight: 700; margin: 8px 0 12px; color: #222; }
.empty { color: #6b7280; font-size: 14px; margin-bottom: 18px; }

/* Cards grid */
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 18px; }

/* router-link wrapping card */
.card-link { display: block; color: inherit; text-decoration: none; }

/* Responsive */
@media (max-width: 740px) {
  .cards { grid-template-columns: 1fr; }
  .hero { padding: 28px 0; }
  .hero-title { font-size: 20px; }
}
</style>