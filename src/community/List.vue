// 글 목록
<template>

<div>

  <div class="controls">

    <select v-model="sortBy">

      <option value="latest">
        최신순
      </option>

      <option value="popular">
        인기순
      </option>

    </select>


    <router-link
    :to="{name:'CommunityWrite'}">

      <button>
        글 작성
      </button>

    </router-link>

  </div>



  <ul>

    <li
    v-for="post in posts"
    :key="post.id">


      <router-link
      :to="{
        name:'CommunityDetail',
        params:{
          id:post.id
        }
      }">


      <h3>
        {{post.title}}
      </h3>


      </router-link>


      <p>

        {{post.author}}

        |

        {{post.createdAt}}

      </p>


      <p v-if="post.place">

        📍 {{post.place.title}}

      </p>


      <p>
        👍 {{post.likes??0}}
      </p>


    </li>


  </ul>


</div>

</template>



<script setup lang="ts">

import {
computed,
ref
} from "vue"

import {
getSortedPosts
} from "./storage"



const sortBy=
ref<'latest'|'popular'>(
'latest'
)



const posts=computed(()=>{

return getSortedPosts(
sortBy.value
)

})


</script>