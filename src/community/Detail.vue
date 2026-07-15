// 글 상세
<template>

<div v-if="post">


<h1>
{{post.title}}
</h1>


<p>
{{post.author}}
</p>



<p>
{{post.content}}
</p>



<p v-if="post.place">

📍 {{post.place.title}}

</p>



<button
@click="like">

👍 {{post.likes}}

</button>



<button
@click="remove">

삭제

</button>



</div>


</template>



<script setup lang="ts">

import {
ref,
onMounted
} from "vue"


import {
useRoute,
useRouter
} from "vue-router"


import {
getPostById,
incrementLike,
deletePost
} from "./storage"


import type {
Post
} from "./type"



const route=useRoute()

const router=useRouter()


const post=
ref<Post|null>(null)



onMounted(()=>{

post.value=
getPostById(
Number(route.params.id)
)
??null

})



function like(){

if(!post.value)return


post.value=
incrementLike(
post.value.id
)
??null

}



function remove(){

if(!post.value)return


deletePost(
post.value.id
)


router.push({
name:"CommunityList"
})

}


</script>