// 글 목록
<template>
  <div class="community-list">

    <h1>서울 지역 커뮤니티</h1>

    <div class="controls">

      <select v-model="sortBy">
        <option value="latest">
          최신순
        </option>

        <option value="popular">
          인기순
        </option>
      </select>


      <router-link :to="{ name:'CommunityWrite' }">
        <button>
          글 작성
        </button>
      </router-link>

    </div>


    <p v-if="posts.length === 0">
      작성된 게시글이 없습니다.
    </p>


    <ul v-else>

      <li
        v-for="post in posts"
        :key="post.id"
      >

        <router-link
          :to="{
            name:'CommunityDetail',
            params:{
              id:post.id
            }
          }"
        >

          <h3>
            {{ post.title }}
          </h3>

        </router-link>


        <p>
          작성자 : {{ post.author }}
        </p>


        <p>
          {{ new Date(post.createdAt).toLocaleString() }}
        </p>


        <p v-if="post.place">
          📍 {{ post.place.title }}
        </p>


        <p>
          👍 {{ post.likes || 0 }}
        </p>


      </li>

    </ul>


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