import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/scroll',
      name: 'scrollView',
      component: ()=>import('@/views/ScrollView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/scripts',
      name: 'scripts',
      redirect: '/scripts/welcome',
    },
    {
      path: '/scripts/welcome',
      name: 'scripts-welcome',
      component: () => import('@/views/ScriptsView.vue'),
    },
  ],
})

export default router
