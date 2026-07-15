<template>
  <div class="container">
    <h1>LocalHub</h1>
    <p>서울 장소 AI 추천</p>

    <div class="search">
      <input
        v-model="region"
        placeholder="예) 서울특별시 강남구"
      />

      <button
        @click="getRecommend"
        :disabled="loading"
      >
        {{ loading ? "추천 중..." : "추천받기" }}
      </button>
    </div>

    <div
      v-if="loading"
      class="loading"
    >
      AI가 추천 중입니다...
    </div>

    <div
      v-else-if="results.length === 0"
      class="empty"
    >
      추천 결과가 없습니다.
    </div>

    <div
      v-else
      class="list"
    >
      <div
        class="card"
        v-for="place in results"
        :key="place.contentid"
      >
        <h3>{{ place.title }}</h3>

        <p>{{ place.addr1 }}</p>

        <p class="reason">
          {{ place.reason }}
        </p>

        <button
          @click="showDetail(place.contentid)"
        >
          상세보기
        </button>
      </div>
    </div>

    <!-- Modal -->

    <div
      v-if="isModalOpen"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal">

        <button
          class="close"
          @click="closeModal"
        >
          ✕
        </button>

        <div v-if="modalLoading">
          불러오는 중...
        </div>

        <div
          v-else-if="selectedPlace"
        >
          <h2>{{ selectedPlace.title }}</h2>

          <p>
            {{ selectedPlace.addr1 }}
          </p>

          <img
            v-if="selectedPlace.firstimage"
            :src="selectedPlace.firstimage"
          />

          <div
            class="overview"
            v-html="selectedPlace.overview"
          />
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { fetchPlaceDetail } from "../places/placeService";

interface RecommendPlace {
  contentid: string;
  title: string;
  addr1: string;
  reason: string;
}

interface DetailPlace {
  title: string;
  addr1: string;
  overview: string;
  firstimage: string;
}

const region = ref("서울특별시 강남구");

const loading = ref(false);

const results = ref<RecommendPlace[]>([]);

const isModalOpen = ref(false);

const modalLoading = ref(false);

const selectedPlace =
  ref<DetailPlace | null>(null);

async function getRecommend() {

  loading.value = true;

  results.value = [];

  try {

    const response = await fetch(
      "/api/recommend",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          region: region.value,
        }),
      }
    );

    const json = await response.json();

    if (json.ok) {
      results.value = json.result;
    }

  } catch (err) {

    console.error(err);

  } finally {

    loading.value = false;

  }
}

async function showDetail(
  contentid: string
) {

  isModalOpen.value = true;

  modalLoading.value = true;

  selectedPlace.value = null;

  try {

    selectedPlace.value =
      await fetchPlaceDetail(
        contentid
      );

  } catch (e) {

    console.error(e);

  } finally {

    modalLoading.value = false;

  }

}

function closeModal() {

  isModalOpen.value = false;

  selectedPlace.value = null;

}
</script>

<style scoped>

.container{
    max-width:900px;
    margin:auto;
    padding:30px;
}

.search{
    display:flex;
    gap:10px;
    margin:20px 0;
}

.search input{
    flex:1;
    padding:10px;
}

.card{
    border:1px solid #ddd;
    border-radius:10px;
    padding:15px;
    margin-bottom:15px;
}

.reason{
    color:#666;
}

.modal-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.4);
    display:flex;
    justify-content:center;
    align-items:center;
}

.modal{
    width:700px;
    max-height:80vh;
    overflow:auto;
    background:white;
    padding:20px;
    border-radius:10px;
    position:relative;
}

.close{
    position:absolute;
    right:15px;
    top:10px;
}

img{
    width:100%;
    border-radius:10px;
    margin:15px 0;
}

.overview{
    line-height:1.7;
}

</style>