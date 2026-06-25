const routes = [
  // --- 1. Rutas PÚBLICAS ---
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
    { path: '', component: () => import('../pages/IndexPage.vue') },
    { path: 'publicar', component: () => import('../pages/SecondPage.vue') }, 
  ],
},

  // --- 4. 404 ---
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue'),
  },
]

export default routes