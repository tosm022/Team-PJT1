// 글 상세
<template>

<div v-if="post">


<h1>
{{ post.title }}
</h1>


<p>

작성자 :
{{ post.author }}

</p>



<p>

{{ formattedDate }}

</p>




<div v-if="post.place">


<h3>
태그된 장소
</h3>


<p>

📍
{{post.place.title}}

</p>


<p>

{{post.place.address}}

</p>


</div>




<div class="content">

{{post.content}}

</div>




<div class="actions">


<button @click="like">

👍 좋아요
{{post.likes || 0}}

</button>




<button @click="goEdit">

수정

</button>




<button @click="remove">

삭제

</button>




<router-link

:to="{

name:'CommunityList',

query:{

contentid:
post.place?.contentid

}

}"

>

<button>

같은 장소 게시글 보기

</button>


</router-link>


</div>


</div>



<div v-else>

게시글을 찾을 수 없습니다.

</div>


</template>




<script setup lang="ts">


import {
  computed,
  ref,
  onMounted
} from 'vue'


import {
  useRoute,
  useRouter
} from 'vue-router'


import type {Post} from './type'


import {
  getPostById,
  updatePost,
  deletePost
} from './storage'



const route = useRoute()

const router = useRouter()



const id =
Number(route.params.id)



const post =
ref<Post|null>(null)

onMounted(()=>{

  post.value =
  getPostById(id)
  ||
  null

})

const formattedDate =
computed(()=>{

  return post.value
  ?
  new Date(
    post.value.createdAt
  )
  .toLocaleString()
  :''
})

function like(){

  if(!post.value) return

  const updated = {
    ...post.value,
    likes: (post.value.likes || 0) + 1
  }

  updatePost(updated)
  post.value = updated
}

// 수정 전 비밀번호 확인: prompt로 입력받아 일치하면 이동
function goEdit(){

  if(!post.value) return

  const input = window.prompt('비밀번호를 입력해 주세요.')
  if (input === null) return // 취소

  const stored = (post.value as any).password ?? ''
  if (input === stored) {
    router.push({
      name:'CommunityWrite',
      params:{
        id: post.value.id
      }
    })
  } else {
    alert('비밀번호가 일치하지 않습니다.')
  }

}

function remove(){

  if(!post.value)
  return

  // 비밀번호 입력(prompt)
  const input = window.prompt('비밀번호를 입력해 주세요.')
  if (input === null) return // 취소한 경우 아무 동작도 하지 않음

  const stored = (post.value as any).password ?? ''
  if (input !== stored) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  // 비밀번호 일치 시 삭제 진행
  deletePost(
    post.value.id
  )

  router.push({
    name:'CommunityList'
  })

}

</script>