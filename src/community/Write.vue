<!-- 글 작성 -->
<template>
  <div class="write-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="경로">
      <router-link to="/">홈</router-link>
      <span class="sep">›</span>
      <router-link :to="{ name: 'CommunityList' }">커뮤니티</router-link>
      <span class="sep">›</span>
      <span>{{ isEdit ? '게시글 수정' : '게시글 작성' }}</span>
    </nav>

    <main class="form-wrap">
      <header class="form-header">
        <h1 class="form-title">{{ isEdit ? '게시글 수정' : '게시글 작성' }}</h1>
        <p class="form-desc">
          {{ isEdit ? '기존 내용을 수정한 뒤 저장하세요.' : '공유할 장소와 경험을 자세히 적어주세요.' }}
        </p>
      </header>

      <form class="post-form" @submit.prevent="submit">
        <!-- 기본 정보 -->
        <section class="section">
          <h2 class="section-title">기본 정보</h2>

          <label class="field">
            <span class="label">제목</span>
            <input
              v-model="form.title"
              type="text"
              placeholder="예) 한강 뷰 카페 추천"
              required
            />
          </label>

          <label class="field">
            <span class="label">작성자</span>
            <input
              v-model="form.author"
              type="text"
              placeholder="작성자 이름을 입력하세요"
              required
            />
          </label>

          <label class="field">
            <span class="label">비밀번호 (수정/삭제 용도)</span>
            <input
              v-model="form.password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
            />
            <small class="note">※ 이 비밀번호로 작성 후 수정·삭제를 할 수 있습니다.</small>
          </label>
        </section>

        <!-- 내용 -->
        <section class="section">
          <h2 class="section-title">내용</h2>
          <label class="field full">
            <span class="label sr-only">내용</span>
            <textarea
              v-model="form.content"
              placeholder="장소에서의 경험, 팁, 추천 이유 등을 자유롭게 작성하세요."
              rows="8"
              required
            ></textarea>
          </label>
        </section>

        <!-- 방문 장소 -->
        <section class="section">
          <h2 class="section-title">방문 장소</h2>

          <div class="place-grid">
            <label class="field">
              <span class="label">장소명</span>
              <input
                v-model="form.place.title"
                type="text"
                placeholder="예) 한강공원 카페"
                required
              />
            </label>

            <label class="field">
              <span class="label">주소</span>
              <input
                v-model="form.place.address"
                type="text"
                placeholder="예) 서울특별시 강서구 ... "
              />
            </label>

            <label class="field">
              <span class="label">장소 고유 ID</span>
              <input
                v-model="form.place.contentid"
                type="text"
                placeholder="장소 고유 ID (나중에 자동 매핑 가능)"
                required
              />
              <small class="note">※ 장소 검색 기능이 연결되면 자동으로 채워집니다.</small>
            </label>
          </div>
        </section>

        <!-- 버튼 그룹 -->
        <div class="actions">
          <router-link :to="{ name: 'CommunityList' }" class="btn btn-cancel">취소</router-link>
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? '수정 완료' : '등록하기' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">

import {
reactive,
computed,
onMounted
} from "vue"

import {
useRoute,
useRouter
} from "vue-router"


import {
addPost,
getPostById,
updatePost
} from "./storage"


import type {
Post
} from "./type"



const router=useRouter()

const route=useRoute()

const id=
route.params.id
?
Number(route.params.id)
:
null

const isEdit=
computed(()=>!!id)

const form=
reactive<any>({
  title:"",
  content:"",
  author:"",
  password:"",             // 추가된 비밀번호 필드
  place:{
    contentid:"",
    title:"",
    address:""
  },
  likes:0
})

onMounted(()=>{
  if(id){
    const post=getPostById(id)
    if(post){
      Object.assign(form, post)
    }
  }
})

function submit(){
  // Trim values
  const trimmedTitle = (form.title ?? '').toString().trim()
  const trimmedAuthor = (form.author ?? '').toString().trim()
  const trimmedContent = (form.content ?? '').toString().trim()
  const trimmedPlaceTitle = ((form.place && form.place.title) ?? '').toString().trim()
  const trimmedPlaceContentId = ((form.place && form.place.contentid) ?? '').toString().trim()
  const trimmedPassword = (form.password ?? '').toString().trim()

  // Validate required fields
  if(!trimmedTitle){
    alert('제목을 입력해 주세요.')
    return
  }
  if(!trimmedAuthor){
    alert('작성자를 입력해 주세요.')
    return
  }
  if(!trimmedContent){
    alert('내용을 입력해 주세요.')
    return
  }

  // Password required
  if(!trimmedPassword){
    alert('비밀번호를 입력해 주세요.')
    return
  }

  // Place fields required per request (keep existing)
  if(!trimmedPlaceTitle || !trimmedPlaceContentId){
    alert('방문 장소를 선택해주세요.')
    return
  }

  // Write trimmed values back to form
  form.title = trimmedTitle
  form.author = trimmedAuthor
  form.content = trimmedContent
  form.password = trimmedPassword
  form.place.title = trimmedPlaceTitle
  form.place.contentid = trimmedPlaceContentId

  // Preserve existing flow: update or add, then navigate
  if(isEdit.value && id){
    updatePost({
      ...form,
      id,
      createdAt:new Date().toISOString()
    } as Post)
  }else{
    addPost(form)
  }

  router.push({
    name:"CommunityList"
  })
}

</script>

<style scoped>
.write-page { padding: 20px; display:flex; justify-content:center; }
.form-wrap { width:100%; max-width:800px; }

.breadcrumb { font-size:13px; color:#6b7280; margin-bottom:14px; display:flex; gap:8px; align-items:center; }
.breadcrumb a { color:#6b7280; text-decoration:none; }
.breadcrumb .sep { color:#d1d5db; }

.form-header { margin-bottom: 18px; }
.form-title { margin: 0 0 6px; font-size:20px; color:#111827; }
.form-desc { margin:0; color:#6b7280; font-size:13px; }

.section { background: #fff; padding: 14px; border-radius:8px; border:1px solid #eef2f6; margin-bottom:14px; }
.section-title { margin:0 0 10px; font-size:14px; color:#374151; font-weight:600; }

.field { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.field.full { width:100%; }
.label { font-size:13px; color:#374151; font-weight:500; }
input[type="text"],
input[type="password"],
input[type="search"],
textarea {
  width:100%;
  box-sizing:border-box;
  padding:10px 12px;
  border:1px solid #d1d5db;
  border-radius:6px;
  font-size:14px;
  color:#111827;
  background:#fff;
}
textarea { resize:vertical; min-height:140px; }

.place-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; align-items:start; }
.place-grid .field { margin-bottom:0; }
.note { display:block; margin-top:6px; color:#9ca3af; font-size:12px; }

.actions { display:flex; gap:10px; justify-content:flex-end; margin-top:8px; }
.btn { padding:8px 14px; border-radius:6px; font-size:14px; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
.btn-cancel { background:transparent; color:#374151; border:1px solid #d1d5db; }
.btn-primary { background:#0b69ff; color:#fff; border: none; cursor:pointer; }

@media (max-width: 740px) {
  .place-grid { grid-template-columns: 1fr; }
  .actions { flex-direction:column-reverse; align-items:stretch; gap:8px; }
  .btn { width:100%; }
  textarea { min-height:120px; }
}
</style>