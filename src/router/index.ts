import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", name: "home", component: () => import("@/views/HomePage.vue") },
  { path: "/map", name: "map", component: () => import("@/views/MapPage.vue") },
  { path: "/city/:cityId", name: "city", component: () => import("@/views/CityDetail.vue") },
  { path: "/blog", name: "blog", component: () => import("@/views/BlogList.vue") },
  { path: "/blog/:slug", name: "post", component: () => import("@/views/BlogPost.vue") },
  { path: "/archive", name: "archive", component: () => import("@/views/ArchivePage.vue") },
  { path: "/tags", name: "tags", component: () => import("@/views/TagsPage.vue") },
  { path: "/about", name: "about", component: () => import("@/views/AboutPage.vue") },
  { path: "/games", name: "games", component: () => import("@/views/GamesPage.vue") },
  { path: "/toolbox", name: "toolbox", component: () => import("@/views/ToolboxPage.vue") },
  { path: "/admin", name: "admin", component: () => import("@/views/AdminPage.vue") },
]

export default createRouter({ history: createWebHistory(), routes })
