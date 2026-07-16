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
          :value="keyword"
          @input="keyword = ($event.target as HTMLInputElement).value"
          placeholder="장소명을 검색하세요"
        />



        <div
          v-for="place in filteredPlaces"
          :key="place.contentid || place.contentId || place.title"
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
  allPlaces,
  getPlaceByContentId
} from "../places/PlaceCard.js"



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



// const filteredPlaces =
//   computed(()=>{


//     if(!keyword.value){

//       return []

//     }


//     return allPlaces

//       .filter((place:any)=>{


//         const title =
//           (
//             place.title
//             ||
//             place.name
//             ||
//             ""
//           )
//           .toLowerCase()



//         return title.includes(
//           keyword.value.toLowerCase()
//         )

//       })

//       .slice(0,10)


//   })
const filteredPlaces = computed(() => {
  // 검색어가 없거나 한 글자 미만(공백 등)이면 바로 빈 배열 반환
  const searchKeyword = keyword.value.trim().toLowerCase()
  if (!searchKeyword) {
    return []
  }

  return allPlaces
    .filter((place: any) => {
      const title = (place.title || place.name || "").toLowerCase()
      const address = (place.addr1 || place.address || "").toLowerCase()

      // 1. 장소 이름에 검색어가 완벽하게 포함되어 있는지 확인
      const isTitleMatch = title.includes(searchKeyword)
      
      // 2. 혹은 주소(예: 서울시 강남구...)에 검색어가 포함되어 있는지 확인 (선택 사항, 검색 품질 향상)
      const isAddressMatch = address.includes(searchKeyword)

      return isTitleMatch || isAddressMatch
    })
    .slice(0, 10) // 너무 많은 결과가 뜨지 않도록 상위 10개만 유지
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
  else if(route.query.placeId){


    const place = getPlaceByContentId(route.query.placeId as string)

    if (place) {
      form.place = {
        contentid: String(place.contentid || place.contentId || ""),
        title: place.title || place.name || "",
        address: place.addr1 || place.address || ""
      }
    }


  }


})





function selectPlace(place: any) {
  const safeContentId = String(place.contentid || place.contentId || "");
  const safeAddress = place.addr1 || place.address || place.addr2 || "";
  const safeTitle = place.title || place.name || "";

  // 객체를 통째로 바꾸는 대신, 내부 프로퍼티에 직접 갱신 (반응성 강제 보장)
  form.place = {
    contentid: safeContentId,
    title: safeTitle,
    address: safeAddress
  };

  keyword.value = "";
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

.place-result * {
  pointer-events: none; /* 카드 내부의 글자나 아이콘이 클릭을 방해하지 못하게 막음 */
}


</style>