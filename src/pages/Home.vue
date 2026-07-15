<template>
  <main class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">서울의 하루를 발견하고 공유하세요</h1>
        <p class="hero-sub">공공데이터로 찾은 장소와 실제 경험을 함께 나눠보세요</p>
      </div>
    </section>

    <!-- Section: 최신 게시글 -->
    <section class="posts">
      <div class="container">
        <h2 class="section-title">최신 게시글</h2>
        <div class="cards">
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
        <div class="cards">
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

    <router-link :to="{ name: 'CommunityWrite' }" class="write-link">
      <button class="write-btn">글쓰기</button>
    </router-link>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PostCard from '../components/PostCard.vue'

const posts = ref([
  {
    id: 1,
    tags: ['카페', '한강'],
    title: '한강 뷰 카페에서의 여유로운 오후',
    excerpt: '한강 근처에 새로 생긴 카페를 다녀왔습니다. 창가 자리가 특히 좋아요. 좌석 배치와 음료가 인상적이었어요.',
    date: '2026-07-10',
    likes: 12,
  },
  {
    id: 2,
    tags: ['맛집'],
    title: '숨겨진 골목식당 리뷰',
    excerpt: '작은 골목에 자리한 식당으로 음식이 정성스럽고 가격도 합리적이었습니다. 특별한 메뉴 추천합니다.',
    date: '2026-07-08',
    likes: 8,
  },
  {
    id: 3,
    tags: ['전시', '문화'],
    title: '추천 전시 후기 — 가족과 함께',
    excerpt: '사진과 미디어 아트가 조화로운 전시였어요. 볼거리가 많아 주말 나들이로 좋습니다.',
    date: '2026-07-04',
    likes: 21,
  },
])

const popularPosts = ref([
  {
    id: 11,
    tags: ['도보여행'],
    title: '숨은 골목길 산책 코스',
    excerpt: '아직 많은 사람이 모르는 루트지만 풍경이 아름답고 사진 찍기 좋습니다.',
    date: '2026-06-28',
    likes: 142,
  },
  {
    id: 12,
    tags: ['박물관'],
    title: '아이와 함께한 박물관 탐방',
    excerpt: '아이와 함께 보기 좋은 전시와 편의시설이 잘 갖춰져 있었습니다.',
    date: '2026-06-20',
    likes: 98,
  },
  {
    id: 13,
    tags: ['야경', '카페'],
    title: '야경 좋은 루프탑 카페 추천',
    excerpt: '도심 야경을 보며 쉬기 좋은 루프탑 카페를 정리했습니다. 예약 팁 포함.',
    date: '2026-06-15',
    likes: 87,
  },
])
</script>

<style scoped>
.home { color: #222; min-height: 60vh; padding-bottom: 80px; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 16px; }

/* Hero banner */
.hero {
  background: #eaf4ff;
  padding: 40px 0;
  border-radius: 6px;
  margin-bottom: 28px;
  border: 1px solid rgba(0,0,0,0.04);
}
.hero-title { margin: 0 0 8px; font-size: 28px; font-weight: 700; color: #1f6feb; }
.hero-sub { margin: 0; font-size: 14px; color: #4b5563; }

/* Section title */
.section-title { font-size: 18px; font-weight: 700; margin: 8px 0 12px; color: #222; }

/* Cards grid */
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 18px; }

/* router-link wrapping card */
.card-link { display: block; color: inherit; text-decoration: none; }

/* Write button */
.write-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #0b69ff;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 28px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  cursor: pointer;
}
.write-link { display: inline-block; }

/* Responsive */
@media (max-width: 740px) {
  .cards { grid-template-columns: 1fr; }
  .hero { padding: 28px 0; }
  .hero-title { font-size: 20px; }
  .write-btn { right: 14px; bottom: 14px; }
}
</style>