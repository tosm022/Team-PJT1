// 글 작성
<template>

<form
@submit.prevent="submit">


<h2>
{{isEdit?'수정':'작성'}}
</h2>


<input
v-model="form.title"
placeholder="제목"
/>


<input
v-model="form.author"
placeholder="작성자"
/>


<textarea
v-model="form.content"
placeholder="내용"
/>



<h3>
장소 태그
</h3>


<input
v-model="form.place.contentid"
placeholder="contentid"
/>


<input
v-model="form.place.title"
placeholder="장소명"
/>


<input
v-model="form.place.address"
placeholder="주소"
/>



<button>
저장
</button>



</form>

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

Object.assign(
form,
post
)

}

}

})



function submit(){


if(isEdit.value && id){


updatePost({

...form,

id,

createdAt:new Date()
.toISOString()

} as Post)



}else{


addPost(form)


}


router.push({
name:"CommunityList"
})


}


</script>