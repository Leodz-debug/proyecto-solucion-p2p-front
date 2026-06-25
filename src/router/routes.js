const routes = [
  // --- 1. Rutas PÚBLICAS (Sin Login) ---
  {
    path: '/login',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/LoginPage.vue') },
    ],
  },
  {
    path: '/registro',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/RegisterPage.vue') },
    ],
  },

  // --- 2. Flujo Intermedio de Verificación (Requieren Token) ---
  {
    path: '/verificacion',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      { path: '', component: () => import('../pages/VerificacionPage.vue') },
    ],
  },
  {
    path: '/seleccion',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      { path: '', component: () => import('../pages/SeleccionPage.vue') },
    ],
  },

  // --- 3. Rutas PROTEGIDAS (Panel Principal / Dashboard) ---
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue') },
      { path: 'second', component: () => import('../pages/SecondPage.vue') },
    ],
  },

  // --- 4. 404 Not Found ---
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue'),
  },
]

export default routes