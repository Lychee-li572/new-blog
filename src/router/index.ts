import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", name: "home", component: () => import("@/views/HomePage.vue") },
  { path: "/map", name: "map", component: () => import("@/features/map/views/MapPage.vue") },
  { path: "/city/:cityId", name: "city", component: () => import("@/features/map/views/CityDetail.vue") },
  { path: "/blog", name: "blog", component: () => import("@/views/BlogList.vue") },
  { path: "/blog/:slug", name: "post", component: () => import("@/views/BlogPost.vue") },
  { path: "/archive", name: "archive", component: () => import("@/views/ArchivePage.vue") },
  { path: "/tags", name: "tags", component: () => import("@/views/TagsPage.vue") },
  { path: "/about", name: "about", component: () => import("@/views/AboutPage.vue") },
  { path: "/games", name: "games", component: () => import("@/features/games/views/GamesPage.vue") },
  { path: "/toolbox", name: "toolbox", component: () => import("@/features/toolbox/views/ToolboxPage.vue") },
  { path: "/toolbox/json-parser", name: "json-parser", component: () => import("@/features/toolbox/views/JsonParserPage.vue") },
  { path: "/admin", name: "admin", component: () => import("@/views/AdminPage.vue") },
  { path: "/admin/login", name: "admin-login", component: () => import("@/views/AdminLogin.vue") },
]

export default createRouter({ history: createWebHistory(), routes })
