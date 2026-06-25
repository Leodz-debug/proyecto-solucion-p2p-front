const routes = [
  // --- 1. Rutas PÚBLICAS ---
  {
    path: '/login',
    component: () => import('../layouts/AuthLayout.vue'),
  
    children: [
      { path: '', component: () => import('../pages/LoginPage.vue') },
    ],
  },
  {
    path: '/registro',
    component: () => import('../layouts/AuthLayout.vue'),
    
    children: [
      { path: '', component: () => import('../pages/RegisterPage.vue') },
    ],
  },

  // --- 2. Flujo Intermedio ---
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

  // --- 3. Rutas PROTEGIDAS (Panel Principal) ---
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      { path: '', redirect: '/seleccion' },
      { path: 'publicar', component: () => import('../pages/PublicarPage.vue') },
      { path: 'marketplace', component: () => import('../pages/MarketplacePage.vue') },
      { path: 'operacion', component: () => import('../pages/OperacionPage.vue') },
    ],
  },

  // --- 4. 404 ---
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue'),
  },
]

export default routes