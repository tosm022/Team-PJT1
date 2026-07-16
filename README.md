# 서울로그 (LocalHub)

공공데이터(TourAPI 4.0) 기반으로 서울의 장소를 AI가 추천해주고, 사용자들이 방문 경험을 공유하는 지역 정보 커뮤니티입니다.

- 프레임워크: Vue 3 (`<script setup>`) + TypeScript + Vite
- 라우팅: Vue Router 5
- 데이터 저장: 브라우저 `localStorage` (별도 백엔드 없음)
- AI 추천: OpenAI API (`gpt-5-mini`, Structured Output)

## 시작하기

```bash
npm install
cp .env.example .env   # VITE_OPENAI_API_KEY 에 발급받은 키 입력
npm run dev
```

- `npm run build`: 타입 체크(`tsc`) 후 프로덕션 빌드
- `npm run preview`: 빌드 결과 미리보기

## 폴더 구조

```
travel-project/
├── .env.example            # 필요한 환경변수 목록 (실제 값은 .env에 직접 입력, git 미포함)
├── index.html               # Vite 진입 HTML, #app 마운트 지점
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts               # 앱 부트스트랩: style.css 로드, App 마운트, router 연결
    ├── App.vue                # 최상위 레이아웃: Header + <router-view> + Footer + ChatWidget
    ├── style.css               # 전역 CSS 변수(색상·테두리) 및 공통 엘리먼트/유틸리티 스타일
    ├── vite-env.d.ts            # Vite 클라이언트 타입 + *.vue 모듈 타입 선언(shim)
    │
    ├── router/
    │   └── index.ts             # 전체 라우트 테이블 (단일 라우터, 아래 "라우트 목록" 참고)
    │
    ├── pages/
    │   └── Home.vue              # 홈 화면: 히어로 CTA, 최신/인기 게시글 3개씩 미리보기
    │
    ├── components/
    │   ├── Header.vue             # 상단 고정(sticky) 헤더: 로고, 홈/커뮤니티 내비게이션, AI 챗봇 여는 버튼
    │   ├── Footer.vue             # 하단 푸터: 브랜드 소개, 카피라이트 (정적)
    │   └── PostCard.vue           # 게시글 미리보기 카드 (제목/요약/태그/날짜/좋아요), 홈 화면에서 사용
    │
    ├── community/                # 커뮤니티(게시판) 기능 — localStorage CRUD
    │   ├── type.ts                 # Post/NewPost/SortBy/PlaceTag/Recommendation 타입 정의
    │   ├── storage.ts               # localStorage 기반 CRUD: getPosts/addPost/updatePost/deletePost/
    │   │                            #   getPostById/getPostsByContentId/getSortedPosts/incrementLike
    │   ├── List.vue                 # 게시글 목록: 최신순/인기순 정렬, contentid로 특정 장소 관련 글만 필터링
    │   ├── Write.vue                # 게시글 작성/수정 폼, 장소 검색·태그 지정,
    │   │                            #   URL 쿼리 placeId로 진입 시 장소 자동 태그(AI 추천 → 글쓰기 연동)
    │   └── Detail.vue               # 게시글 상세: 좋아요, 수정/삭제, "같은 장소 게시글 보기" 이동
    │
    ├── places/                    # 장소 데이터 + AI 추천 엔진
    │   ├── PlaceCard.js              # data/*.json 3종을 병합해 allPlaces 배열 생성,
    │   │                              #   getPlaceByContentId(id)로 단건 조회
    │   ├── openaiService.js          # AI 추천 로직: filterPlaces(지역 필터) → topN(최신순 추출)
    │   │                              #   → OpenAI Structured Output 호출(recommendWithOpenAI)
    │   │                              #   → recommendPlaces()가 전체 파이프라인 실행 후 점수순 정렬 반환
    │   └── PlaceDetail.vue           # 장소 상세 페이지: allPlaces에서 조회, 관련 게시글 보기/
    │                                  #   이 장소로 글쓰기 버튼, 이미지 없을 시 플레이스홀더 처리
    │
    ├── chat/                      # 우하단 플로팅 AI 챗봇 위젯
    │   ├── chatWidgetState.ts        # 위젯 열림/닫힘 공유 상태(모듈 전역 ref) + openChat/closeChat/toggleChat
    │   ├── ChatBot.vue                # 채팅 패널 내부: 메시지 스레드, 지역 입력 → recommendPlaces 호출,
    │   │                               #   추천 카드 렌더링, 카드 클릭 시 위젯 닫고 PlaceDetail로 이동
    │   └── ChatWidget.vue             # 우하단 원형 FAB 버튼 + 펼쳐지는 채팅 패널(헤더/닫기 버튼),
    │                                   #   App.vue에 비동기 컴포넌트로 전역 마운트
    │
    └── data/                      # TourAPI 원본 수집 데이터 (공공누리 제3유형)
        ├── 서울_관광지.json           # 관광지 783건
        ├── 서울_문화시설.json          # 문화시설 566건
        ├── 서울_레포츠.json            # 레포츠 126건
        ├── SCHEMA.md                  # 원본 JSON 필드 정의 (contentid, addr1, mapx/mapy 등)
        └── SOURCE.md                  # 데이터 출처(한국관광공사)·라이선스·출처 표기 안내
```

## 라우트 목록 (`src/router/index.ts`)

| 경로 | 이름 | 컴포넌트 | 설명 |
|------|------|----------|------|
| `/` | `Home` | `pages/Home.vue` | 홈 |
| `/place/:contentid` | `PlaceDetail` | `places/PlaceDetail.vue` | 장소 상세 (AI 추천 카드 클릭 시 이동) |
| `/community` | `CommunityList` | `community/List.vue` | 게시글 목록 |
| `/community/write/:id?` | `CommunityWrite` | `community/Write.vue` | 게시글 작성(`id` 없음) / 수정(`id` 있음) |
| `/community/:id` | `CommunityDetail` | `community/Detail.vue` | 게시글 상세 |

## 핵심 데이터 흐름

1. **AI 추천**: `Header`의 ✨ 버튼 또는 `Home`의 "AI 추천받기" 버튼 → `chatWidgetState.openChat()` → `ChatWidget`이 패널 표시 → `ChatBot`에서 지역 입력 → `openaiService.recommendPlaces()`가 `PlaceCard.allPlaces`(로컬 JSON)를 지역명으로 필터링 후 OpenAI에 후보를 넘겨 상위 5곳 추천 → 카드 클릭 시 `PlaceDetail`로 이동.
2. **게시글 작성 ↔ 장소 태깅**: `PlaceDetail`의 "이 장소로 글쓰기" → `CommunityWrite`에 `?placeId=` 쿼리로 진입 → `Write.vue`가 `getPlaceByContentId`로 장소를 자동 태그. 직접 검색해 태그하는 것도 가능(`PlaceCard.allPlaces` 기반 자동완성).
3. **커뮤니티 데이터**: 모든 게시글은 `community/storage.ts`를 통해 브라우저 `localStorage`(`localhub_posts` 키)에 저장·조회되며, 백엔드 서버는 없습니다. `Home`은 `getSortedPosts('latest'|'popular')`로 최신/인기 글을 가져와 미리보기로 노출합니다.
4. **관련 게시글 보기**: 게시글의 태그된 장소 또는 `PlaceDetail`에서 "관련 게시글 보기" 클릭 시 `CommunityList`에 `?contentid=` 쿼리로 이동, 해당 장소가 태그된 글만 필터링합니다.

## 환경변수

| 변수 | 설명 |
|------|------|
| `VITE_OPENAI_API_KEY` | AI 장소 추천(챗봇)에서 사용하는 OpenAI API 키. `.env`에 설정하며 `openaiService.js`가 지연 생성 방식으로 클라이언트를 초기화합니다(키가 없어도 페이지 자체는 정상 렌더링). |

TourAPI 서비스 키는 필요 없습니다 — `src/data/*.json`에 미리 수집된 데이터만 사용합니다.
