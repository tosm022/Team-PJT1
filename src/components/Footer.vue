<template>
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="brand">
        <div class="site-name">서울로그</div>
        <div class="tagline">공공데이터 기반 서울 코스 공유 커뮤니티</div>
      </div>

      <div class="info">
        <p class="intro">서울 여행 정보와 소식을 나누는 커뮤니티입니다.</p>
        <p class="copyright">© 2026 서울로그. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 이 컴포넌트는 정적 표시만 담당하므로 스크립트 로직은 필요 없습니다.
// 추후 동적 데이터(예: 연도 자동화)를 넣고 싶으면 여기에서 처리하세요.
</script>

<style scoped>
.site-footer{
  background: #fff;
  border-top: 1px solid #eee;
  padding: 14px 16px;
  color: #333;
  font-size: 14px;
}

.container{
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

/* 브랜드(왼쪽) */
.brand .site-name{
  font-weight: 600;
  font-size: 16px;
  color: #222;
}
.brand .tagline{
  margin-top: 4px;
  font-size: 13px;
  color: #666;
}

/* 설명 및 카피라이트(오른쪽) */
.info{
  text-align: right;
}
.intro{
  margin: 0;
  color: #666;
  font-size: 13px;
}
.copyright{
  margin: 6px 0 0;
  color: #999;
  font-size: 12px;
}

/* 모바일: 세로 정렬, 텍스트 왼쪽 정렬 */
@media (max-width: 640px){
  .container{
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  .info{
    width: 100%;
    margin-top: 8px;
    text-align: left;
  }
}
</style>