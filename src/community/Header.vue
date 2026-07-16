<template>
  <header class="site-header">
    <router-link :to="{ name: 'Home' }" class="logo" aria-label="LocalHub 홈으로 이동">
    <span class="logo-mark">🏙️</span>
    <span class="site-name">서울로그</span>
  </router-link>

    <nav class="nav" :class="{ open: mobileOpen }" aria-label="주 메뉴">
      <ul class="nav-list">
        <li><button class="nav-btn" @click="onClick('home')">홈</button></li>
        <li><button class="nav-btn" @click="onClick('community')">커뮤니티</button></li>
      </ul>
    </nav>

    <div class="right">

      <button class="mobile-toggle" @click="toggleMobile" aria-label="메뉴 열기">
        <span class="bar" :class="{ active: mobileOpen }"></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileOpen = ref(false)

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function onClick(target) {
  mobileOpen.value = false
  if (target === 'home') {
    router.push({ name: 'Home' })
  } else if (target === 'community') {
    router.push({ name: 'CommunityList' })
  }
}

</script>

<style scoped>
.site-header{
  position:sticky;
  top:0;
  z-index:40;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:14px 24px;
  background:rgba(255,255,255,0.92);
  backdrop-filter:blur(8px);
  border-bottom:1px solid var(--border, #e5e7eb);
  box-shadow:0 1px 2px rgba(15,23,42,0.03);
  gap:12px;
}

/* 왼쪽: 로고 */
.logo{
  display:flex;
  align-items:center;
  gap:8px;
  font-weight:700;
  color:var(--primary, #2563eb);
}
.logo-mark{ font-size:24px; }
.site-name{ font-size:19px; letter-spacing:-0.2px; }

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
  padding:8px 12px;
  cursor:pointer;
  font-size:14px;
  font-weight:600;
  color:#374151;
  border-radius:8px;
  transition:background .15s ease, color .15s ease;
}
.nav-btn:hover{
  background:#eff6ff;
  color:var(--primary, #2563eb);
}

/* 오른쪽 영역: 검색 + 모바일 토글 */
.right{
  display:flex;
  align-items:center;
  gap:8px;
}
.search-btn{
  background:#eff6ff;
  border:1px solid #dbeafe;
  width:38px;
  height:38px;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  color:var(--primary, #2563eb);
  transition:background .15s ease, transform .15s ease;
}
.search-btn:hover{ background:#dbeafe; transform:translateY(-1px); }
.search-icon{ font-size:16px; line-height:1; }

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