// 글 목록
<template>
  <div class="community-list">

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="경로">
      <router-link to="/">홈</router-link>
      <span class="sep">›</span>
      <span>커뮤니티</span>
    </nav>

    <!-- Title + Controls -->
    <div class="header-row">
      <h1 class="page-title">서울 지역 커뮤니티</h1>

      <div class="actions">
        <div class="search-wrap">
          <input class="search-input" type="search" placeholder="게시글 검색어를 입력하세요" />
          <button class="search-btn" type="button">검색</button>
        </div>

        <div class="control-row">
          <select v-model="sortBy" class="sort-select">
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
          </select>

          <router-link :to="{ name:'CommunityWrite' }">
            <button class="write-btn">+ 글쓰기</button>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Table list -->
    <div class="table-wrap" v-if="posts.length > 0">
      <table class="board-table">
        <thead>
          <tr>
            <th class="col-no">번호</th>
            <th class="col-title">제목</th>
            <th class="col-place">장소</th>
            <th class="col-likes">좋아요</th>
            <th class="col-date">작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(post, index) in posts" :key="post.id">
            <td class="col-no">{{ posts.length-index }}</td>
            <td class="col-title">
              <router-link
                :to="{ name:'CommunityDetail', params: { id: post.id } }"
                class="title-link"
              >
                {{ post.title }}
              </router-link>
            </td>
            <td class="col-place">
              <span v-if="post.place">📍 {{ post.place.title }}</span>
              <span v-else>-</span>
            </td>
            <td class="col-likes">👍 {{ post.likes || 0 }}</td>
            <td class="col-date">{{ post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty">작성된 게시글이 없습니다.</p>

  </div>
</template>

<script setup lang="ts">

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import {
  getSortedPosts,
  getPostsByContentId
} from './storage'


const sortBy = ref<'latest'|'popular'>('latest')


const route = useRoute()



const posts = computed(()=>{


  const contentid =
    route.query.contentid as string | undefined



  if(contentid){

    const result =
      getPostsByContentId(contentid)


    return result.sort((a,b)=>{


      if(sortBy.value==='popular'){

        return (
          (b.likes || 0)
          -
          (a.likes || 0)
        )

      }


      return (
        new Date(b.createdAt).getTime()
        -
        new Date(a.createdAt).getTime()
      )

    })

  }



  return getSortedPosts(sortBy.value)

})

</script>

<style scoped>
.community-list { max-width: 1100px; margin: 0 auto; padding: 18px; color: #222; }

/* Breadcrumb */
.breadcrumb { font-size: 13px; color: #6b7280; margin-bottom: 12px; display:flex; gap:8px; align-items:center; }
.breadcrumb a { color: #6b7280; text-decoration:none; }
.breadcrumb .sep { color: #d1d5db; }

/* Header row */
.header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom: 14px; }
.page-title { margin: 0; font-size: 20px; font-weight:700; color:#111827; }

/* Actions: search + controls */
.actions { display:flex; gap:12px; align-items:center; }
.search-wrap { display:flex; gap:8px; align-items:center; }
.search-input {
  width: 360px;
  max-width: 60vw;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}
.search-btn {
  padding: 8px 12px;
  border: 1px solid #9ca3af;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
}

/* control row (select + write) */
.control-row { display:flex; gap:10px; align-items:center; }
.sort-select {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
}
.write-btn {
  padding: 8px 12px;
  background: #0b69ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Table */
.table-wrap { overflow-x:auto; margin-top: 8px; }
.board-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.board-table thead th {
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #e5e7eb;
  background: #fafafa;
  font-size: 14px;
  color: #374151;
}
.board-table tbody td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  font-size: 14px;
  color: #111827;
}
.col-no { width: 64px; text-align: center; color:#6b7280; }
.col-title { }
.col-place { width: 180px; color:#6b7280; }
.col-likes { width: 96px; text-align: center; color:#6b7280; }
.col-date { width: 120px; text-align: right; color:#6b7280; }

/* Title link style */
/* Title link style */
.title-link { color: inherit; text-decoration: none; display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.title-link:hover { text-decoration: underline; color: #0b69ff; }

/* Row hover */
.board-table tbody tr:hover { background: #f9fafb; }

/* Remove underline for write link anchor */
.control-row a { text-decoration: none; }

/* Empty state */
.empty { margin-top: 18px; color: #6b7280; }

/* Responsive: hide some columns on small screens */
@media (max-width: 820px) {
  .search-input { width: 220px; }
  .col-place { display: none; }
  .col-date { display: none; }
}
@media (max-width: 520px) {
  .header-row { flex-direction: column; align-items: stretch; gap:10px; }
  /* Stack search and controls vertically on small screens */
  .actions { flex-direction: column; align-items: stretch; gap:8px; }
  .search-wrap { width: 100%; }
  .control-row { width: 100%; justify-content: space-between; }
  .search-input { width: 100%; }
  .col-likes { display: none; }
  .col-no { width: 48px; font-size:13px; }
  .board-table thead th, .board-table tbody td { padding: 10px 8px; font-size:13px; }
}
</style>