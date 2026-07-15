// 글 작성
<template>
  <div class="write">

    <h1>
      {{ isEdit ? '게시글 수정' : '게시글 작성' }}
    </h1>


    <form @submit.prevent="submit">

      <div>
        <label>제목</label>

        <input
          v-model="form.title"
          required
          placeholder="제목을 입력하세요"
        />

      </div>


      <div>
        <label>작성자</label>

        <input
          v-model="form.author"
          required
          placeholder="작성자"
        />

      </div>


      <div>
        <label>내용</label>

        <textarea
          v-model="form.content"
          rows="8"
          required
          placeholder="방문 경험을 공유해주세요"></textarea>

      </div>



      <!-- 장소 검색 -->

      <div class="place-search">

        <label>
          장소 태그
        </label>


        <input
          v-model="keyword"
          placeholder="장소명을 검색하세요"
        />



        <div
          v-for="place in filteredPlaces"
          :key="place.contentid"
          class="place-result"
          @click="selectPlace(place)"
        >

          <strong>
            📍 {{ place.title }}
          </strong>

          <p>
            {{ place.addr1 }}
          </p>

        </div>


        <div
          v-if="form.place"
          class="place-selected"
        >

          <strong>
            선택된 장소
          </strong>

          <p>
            {{ form.place.title }}
          </p>

          <small>
            {{ form.place.address }}
          </small>

        </div>


      </div>



      <div class="buttons">

        <button type="submit">

          {{ isEdit ? '수정 저장' : '작성' }}

        </button>


        <router-link
          :to="{name:'CommunityList'}"
        >

          <button
            type="button"
          >
            취소
          </button>

        </router-link>


      </div>


    </form>


  </div>
</template>



<script setup lang="ts">

import {
  reactive,
  onMounted,
  computed,
  ref
} from "vue"


import {
  useRouter,
  useRoute
} from "vue-router"



import type {
  Post
} from "./type"



import {
  addPost,
  getPostById,
  updatePost
} from "./storage"


import {
  allPlaces
} from "../places/PlaceCard"



const router = useRouter()

const route = useRoute()



const id =
  route.params.id
    ? Number(route.params.id)
    : null



const isEdit =
  computed(
    () => !!id
  )



const keyword = ref("")



const filteredPlaces =
  computed(()=>{


    if(!keyword.value){

      return []

    }


    return allPlaces

      .filter((place:any)=>{


        const title =
          (
            place.title
            ||
            place.name
            ||
            ""
          )
          .toLowerCase()



        return title.includes(
          keyword.value.toLowerCase()
        )

      })

      .slice(0,10)


  })




const form =
  reactive<Omit<Post,"id"|"createdAt">>({

    title:"",

    content:"",

    author:"",

    place:undefined,

    likes:0

  })





onMounted(()=>{


  if(id){


    const post =
      getPostById(id)



    if(post){


      form.title =
        post.title


      form.content =
        post.content


      form.author =
        post.author


      form.place =
        post.place



      form.likes =
        post.likes ?? 0


    }


  }


})





function selectPlace(place:any){


  form.place = {


    contentid:
      String(
        place.contentid
        ||
        place.contentId
      ),


    title:
      place.title,


    address:
      place.addr1
      ||
      ""

  }



  keyword.value=""


}






function submit(){



  if(isEdit.value && id){


    updatePost({

      id,

      createdAt:
        new Date()
        .toISOString(),

      ...form

    } as Post)


  }

  else{


    addPost(

      form as Omit<Post,"id"|"createdAt">

    )


  }



  router.push({

    name:"CommunityList"

  })


}


</script>



<style scoped>

.place-result {

  padding:12px;

  border:1px solid #ddd;

  margin-top:8px;

  border-radius:8px;

  cursor:pointer;

  background:white;

}


.place-result:hover {

  background:#f1f5f9;

}



.place-result p {

  margin:5px 0;

  color:#666;

}



.place-selected {

  margin-top:15px;

  padding:15px;

  border-radius:10px;

  background:#eff6ff;

}



.buttons {

  margin-top:20px;

  display:flex;

  gap:10px;

}


</style>