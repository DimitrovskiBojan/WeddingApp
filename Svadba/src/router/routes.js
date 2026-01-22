const routes = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', component: () => import('pages/MainPage.vue') }],
  },
  {
    path: '/gallery',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', component: () => import('pages/Gallery.vue') }],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
