import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: () => import('@/pages/Main.vue'),
  },
  {
    path: '/movie/:id',
    name: 'MoviePage',
    component: () => import('@/pages/MoviePage.vue'),
  },
  {
    path: '/movie-select/:id',
    name: 'MovieSelect',
    component: () => import('@/pages/MovieSelect.vue'),
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('@/pages/PaymentPage.vue'),
  },
  {
    path: '/admin/add-film',
    name: 'AdminAddFilm',
    component: () => import('@/pages/AdminAddFilm.vue'),
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: () => import('@/pages/CinemaInfo.vue'),
    props: { section: 'sessions' },
  },
  {
    path: '/events',
    name: 'Events',
    component: () => import('@/pages/CinemaInfo.vue'),
    props: { section: 'events' },
  },
  {
    path: '/locations',
    name: 'Locations',
    component: () => import('@/pages/CinemaInfo.vue'),
    props: { section: 'locations' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
