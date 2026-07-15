<template>
  <article class="card post-card">
    <div
      class="card-thumb"
      :style="post.image ? `background-image: url(${post.image})` : ''"
      aria-hidden="true"
    />

    <div class="card-body">
      <h3 class="card-title">{{ post.title }}</h3>
      <p class="card-excerpt">{{ post.excerpt }}</p>

      <div class="card-footer">
        <div class="tags">
          <span class="tag" v-for="(t, i) in (post.tags || []).slice(0, 3)" :key="i">{{ t }}</span>
        </div>
        <div class="meta">
          <span class="date">{{ post.date }}</span>
          <span class="likes">❤ {{ post.likes }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

type Post = {
  id: number
  title: string
  excerpt: string
  tags?: string[]
  date: string
  likes: number
  image?: string
}

const props = defineProps<{ post: Post }>()
</script>

<style scoped>
.card {
  display:flex;
  gap:12px;
  align-items:flex-start;
  background:#fff;
  border:1px solid #eee;
  padding:12px;
  border-radius:8px;
  min-height:104px;
}

.card-thumb {
  width:100px;
  height:100px;
  background:linear-gradient(135deg,#efefef,#e8e8e8);
  border-radius:6px;
  flex-shrink:0;
  background-size:cover;
  background-position:center;
}

.card-body { flex:1; display:flex; flex-direction:column; }

.card-title { margin:0 0 6px; font-size:15px; font-weight:700; color:#111827; }

.card-excerpt {
  margin:0 0 10px;
  color:#6b7280;
  font-size:13px;
  line-height:1.4;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
  text-overflow:ellipsis;
  flex:1;
}

.card-footer { display:flex; justify-content:space-between; align-items:center; gap:12px; }

.tags { display:flex; gap:8px; flex-wrap:wrap; }
.tag { background:#f3f4f6; color:#374151; font-size:12px; padding:4px 8px; border-radius:12px; white-space:nowrap; }

.meta { font-size:12px; color:#9ca3af; display:flex; gap:10px; align-items:center; }
.likes { background:rgba(0,0,0,0.04); padding:4px 8px; border-radius:12px; color:#374151; }

@media (max-width:740px){
  .card { align-items:stretch; }
  .card-thumb { width:72px; height:72px; }
}
</style>