import { createRouter, createWebHistory } from "vue-router"

import CommunityList from "@/community/List.vue"
import CommunityDetail from "@/community/Detail.vue"
import CommunityWrite from "@/community/Write.vue"


const router = createRouter({

  history:createWebHistory(),

  routes:[

    {
      path:"/",
      redirect:"/community"
    },

    {
      path:"/community",
      name:"CommunityList",
      component:CommunityList
    },
    {
      path:"/community/write",
      name:"CommunityWrite",
      component:CommunityWrite
    },
    {
      path:"/community/:id",
      name:"CommunityDetail",
      component:CommunityDetail
    }

  ]

})


export default router