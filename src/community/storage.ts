import type {
  Post,
  NewPost,
  SortBy
} from "./type"

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const POSTS_KEY = "localhub_posts"
const CHATS_KEY = "localhub_chats"

// function saveMessages() {
//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
//   } catch (e) {
//     console.error('save chat failed', e)
//   }
// }
function safeParse<T>(data: string | null): T[] {
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

/* ==========================================================================
   게시글 (Post) 관련 함수
   ========================================================================== */
export function getPosts(): Post[] {
  return safeParse<Post>(localStorage.getItem(POSTS_KEY))
}

export function savePosts(posts: Post[]) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  } catch (e) {
    console.error('게시글 저장 실패:', e)
  }
}

function generateId() {
  const posts = getPosts()
  return posts.length
    ? Math.max(...posts.map(p => p.id)) + 1
    : 1
}

export function getPostById(id: number) {
  return getPosts().find(post => post.id === id)
}

export function getPostsByContentId(contentid: string) {
  return getPosts().filter(post => post.place?.contentid === contentid)
}

export function getSortedPosts(sortBy: SortBy = "latest") {
  const posts = getPosts()

  if (sortBy === "popular") {
    // 원본 배열이 변하지 않도록 복사 후 정렬
    return [...posts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
  }

  return [...posts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function addPost(post: NewPost) {
  const posts = getPosts()
  const newPost: Post = {
    ...post,
    id: generateId(),
    createdAt: new Date().toISOString(),
    likes: 0
  }

  posts.push(newPost)
  savePosts(posts)
  return newPost
}

export function updatePost(updatedPost: Post) {
  const posts = getPosts()
  savePosts(
    posts.map(post => post.id === updatedPost.id ? updatedPost : post)
  )
}

export function deletePost(id: number) {
  savePosts(getPosts().filter(post => post.id !== id))
}

export function incrementLike(id: number) {
  const posts = getPosts()
  const updated = posts.map(post => {
    if (post.id === id) {
      return {
        ...post,
        likes: (post.likes ?? 0) + 1
      }
    }
    return post
  })

  savePosts(updated)
  return updated.find(post => post.id === id)
}

/* ==========================================================================
   채팅 히스토리 (Chat) 관련 함수 추가 ⭐
   ========================================================================== */

// 1. 기존 저장된 모든 채팅 메시지 목록 불러오기
export function getChats(): ChatMessage[] {
  return safeParse<ChatMessage>(localStorage.getItem(CHATS_KEY))
}

// 2. 전체 채팅 메시지 배열 저장하기
export function saveChats(messages: ChatMessage[]) {
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(messages))
  } catch (e) {
    console.error('채팅 기록 저장 실패:', e)
  }
}

// 3. 새로운 채팅 메시지 한 개를 추가하기
export function addChatMessage(sender: 'user' | 'bot', text: string): ChatMessage {
  const chats = getChats()
  const newMessage: ChatMessage = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 고유 ID 생성
    sender,
    text,
    timestamp: new Date().toISOString()
  }

  chats.push(newMessage)
  saveChats(chats)
  return newMessage
}

// 4. 채팅방 대화 기록 전체 초기화하기
export function clearChats() {
  localStorage.removeItem(CHATS_KEY)
}