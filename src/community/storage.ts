import type {
  Post,
  NewPost,
  SortBy
} from "./type"



const STORAGE_KEY="localhub_posts"



function safeParse(
  data:string|null
):Post[]{

  if(!data) return []


  try{

    return JSON.parse(data)

  }catch{

    return []

  }

}



export function getPosts():Post[]{

  return safeParse(
    localStorage.getItem(STORAGE_KEY)
  )

}



export function savePosts(
  posts:Post[]
){

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(posts)
  )

}



function generateId(){

  const posts=getPosts()

  return posts.length
  ? Math.max(...posts.map(p=>p.id))+1
  : 1

}



export function getPostById(
  id:number
){

  return getPosts()
  .find(
    post=>post.id===id
  )

}



export function getPostsByContentId(
  contentid:string
){

  return getPosts()
  .filter(
    post=>post.place?.contentid===contentid
  )

}



export function getSortedPosts(
  sortBy:SortBy="latest"
){

  const posts=getPosts()


  if(sortBy==="popular"){

    return posts.sort(
      (a,b)=>
      (b.likes??0)-(a.likes??0)
    )

  }


  return posts.sort(
    (a,b)=>
    new Date(b.createdAt).getTime()
    -
    new Date(a.createdAt).getTime()
  )

}



export function addPost(
  post:NewPost
){

  const posts=getPosts()


  const newPost:Post={

    ...post,

    id:generateId(),

    createdAt:new Date()
    .toISOString(),

    likes:0

  }


  posts.push(newPost)

  savePosts(posts)

  return newPost

}



export function updatePost(
  updatedPost:Post
){

  const posts=getPosts()


  savePosts(

    posts.map(
      post=>
      post.id===updatedPost.id
      ? updatedPost
      : post
    )

  )

}



export function deletePost(
  id:number
){

  savePosts(

    getPosts()
    .filter(
      post=>post.id!==id
    )

  )

}



export function incrementLike(
  id:number
){

  const posts=getPosts()


  const updated=posts.map(post=>{

    if(post.id===id){

      return {

        ...post,

        likes:(post.likes??0)+1

      }

    }


    return post

  })


  savePosts(updated)


  return updated.find(
    post=>post.id===id
  )

}