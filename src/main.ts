import './style.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'


const routes = [

  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/Home.vue')
  },

  {
    path: '/place/:id?',
    name: 'Place',
    component: () => import('./pages/Place.vue')
  },

  {
    path: '/community/write/:id?',
    name: 'CommunityWrite',
    component: () => import('./community/Write.vue')
  },

  {
    path: '/community/:id',
    name: 'CommunityDetail',
    component: () => import('./community/Detail.vue')
  },

  {
    path: '/community',
    name: 'CommunityList',
    component: () => import('./community/List.vue')
  }

]


const router = createRouter({

  history:createWebHistory(),

  routes

})


createApp(App)
.use(router)
.mount('#app')