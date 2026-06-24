const routes = [
  // --- Rutas PÚBLICAS (sin login) ---
  {
    path: '/login',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/LoginPage.vue') },
    ],
  },
  {
    path: '/registro',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/RegisterPage.vue') },
    ],
  },

  // --- Rutas PROTEGIDAS (requieren login) ---
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: 'second', component: () => import('@/pages/SecondPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes