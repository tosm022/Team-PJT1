<template>
  <div id="app-root">
    <Header />
    <router-view />
    <Footer />
    <ChatWidget />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const ChatWidget = defineAsyncComponent(() => import('./chat/ChatWidget.vue'))
</script>
