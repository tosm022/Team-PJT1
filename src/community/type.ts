export interface PlaceTag {

  contentid:string

  title:string

  address:string

}



export interface Post {

  id:number

  title:string

  content:string

  author:string

  password:string

  createdAt:string

  place?:PlaceTag

  likes?:number

}



export type NewPost =
Omit<Post,'id'|'createdAt'>



export type SortBy =
'latest'|'popular'



export interface Recommendation {

  contentid:string

  title:string

  reason?:string

  score?:number

}