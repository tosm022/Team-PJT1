import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 주소창에 /api로 시작하는 요청을 공공데이터포털 주소로 프록시(우회) 시켜줍니다.
      '/api': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, // SSL 인증서 무시
      }
    }
  }
})