import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({

  history: createWebHistory(),

  routes: [

    {
      path: '/',
      name: 'Home',
      component: () => import('../pages/Home.vue')
    },

    {
      path: '/place/:contentid',
      name: 'PlaceDetail',
      component: () => import('../places/PlaceDetail.vue')
    },

    {
      path: '/community',
      name: 'CommunityList',
      component: () => import('../community/List.vue')
    },

    {
      path: '/community/write/:id?',
      name: 'CommunityWrite',
      component: () => import('../community/Write.vue')
    },

    {
      path: '/community/:id',
      name: 'CommunityDetail',
      component: () => import('../community/Detail.vue')
    }

  ]

})

export default router
