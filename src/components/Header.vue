<template>
  <header class="site-header">
    <div class="left">
      <div class="logo" role="img" aria-label="LocalHub 로고">
        <span class="logo-mark">🏙️</span>
        <span class="site-name">서울로그</span>
      </div>
    </div>

    <nav class="nav" :class="{ open: mobileOpen }" aria-label="주 메뉴">
      <ul class="nav-list">
        <li><button class="nav-btn" @click="onClick('home')">홈</button></li>
        <li><button class="nav-btn" @click="onClick('community')">커뮤니티</button></li>
      </ul>
    </nav>

    <div class="right">
      <button class="search-btn" @click="onSearch" aria-label="검색">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M11 19a8 8 0 1 1 5.293-14.293A8 8 0 0 1 11 19z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button class="mobile-toggle" @click="toggleMobile" aria-label="메뉴 열기">
        <span class="bar" :class="{ active: mobileOpen }"></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const mobileOpen = ref(false)

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function onClick(target) {
  // 현재는 UI 용도만: 클릭 로그만 남깁니다.
  mobileOpen.value = false
  if (target === 'home') {
    console.log('nav: home')
  } else if (target === 'community') {
    console.log('nav: community')
  }
}

function onSearch() {
  // 검색 UI 클릭 로그 (기능은 추후 연결)
  console.log('search clicked')
}
</script>

<style scoped>
.site-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:12px 16px;
  background:#fff;
  border-bottom:1px solid #eee;
  gap:12px;
}

/* 왼쪽: 로고 */
.logo{
  display:flex;
  align-items:center;
  gap:8px;
  font-weight:700;
  color:#1f6feb;
}
.logo-mark{ font-size:60px; }
.site-name{ font-size:30px; }

/* 내비게이션 (데스크탑) */
.nav-list{
  display:flex;
  gap:18px;
  list-style:none;
  margin:0;
  padding:0;
}
.nav-btn{
  background:transparent;
  border:none;
  padding:8px 10px;
  cursor:pointer;
  font-size:14px;
  color:#333;
  border-radius:6px;
}
.nav-btn:hover{
  background:#f2f2f2;
}

/* 오른쪽 영역: 검색 + 모바일 토글 */
.right{
  display:flex;
  align-items:center;
  gap:8px;
}
.search-btn{
  background:transparent;
  border:1px solid rgba(0,0,0,0.06);
  width:40px;
  height:40px;
  border-radius:8px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  color:#444;
}
.search-btn:hover{ background:#f8fafc; }

/* 모바일 토글 (휴대폰에서 메뉴 열기) */
.mobile-toggle{
  display:none;
  background:transparent;
  border:none;
  padding:8px;
  cursor:pointer;
}
.bar{
  display:inline-block;
  width:22px;
  height:2px;
  background:#333;
  transition:transform .2s ease, opacity .2s ease;
}
.bar.active{
  transform:rotate(90deg);
}

/* 반응형: 작은 화면에서는 메뉴 숨기고 토글로 전환 */
@media (max-width:640px){
  .nav{
    position:absolute;
    top:56px;
    right:12px;
    background:white;
    border:1px solid #eee;
    border-radius:8px;
    box-shadow:0 6px 18px rgba(0,0,0,0.06);
    overflow:hidden;
    transform-origin:top right;
    display:none;
  }
  .nav.open{
    display:block;
  }
  .nav-list{
    flex-direction:column;
    padding:8px;
  }
  .mobile-toggle{ display:block; }
}
</style>