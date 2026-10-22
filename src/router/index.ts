import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/css',
      redirect: '/css/flex',
    },
    {
      path: '/css/flex',
      name: 'css-flex',
      component: () => import('@/views/css/FlexView.vue'),
    },
    {
      path: '/css/grid',
      name: 'css-grid',
      component: () => import('@/views/css/GridView.vue'),
    },
    {
      path: '/mock',
      name: 'mock',
      component: () => import('@/views/MockView.vue'),
    },
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
