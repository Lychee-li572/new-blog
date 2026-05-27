import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", name: "home", component: () => import("@/views/HomePage.vue") },
  { path: "/city/:cityId", name: "city", component: () => import("@/views/CityDetail.vue") },
  { path: "/blog", name: "blog", component: () => import("@/views/BlogList.vue") },
  { path: "/blog/:slug", name: "post", component: () => import("@/views/BlogPost.vue") },
]

export default createRouter({ history: createWebHistory(), routes })
