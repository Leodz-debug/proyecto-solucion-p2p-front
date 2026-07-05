const routes = [
  // --- 1. Rutas PÚBLICAS ---
  {
    path: '/login',
    component: () => import('../layouts/AuthLayout.vue'),

    children: [{ path: '', component: () => import('../pages/LoginPage.vue') }],
  },
  {
    path: '/registro',
    component: () => import('../layouts/AuthLayout.vue'),

    children: [{ path: '', component: () => import('../pages/RegisterPage.vue') }],
  },

  // --- 2. Flujo Intermedio ---
  {
    path: '/verificacion',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [{ path: '', component: () => import('../pages/VerificacionPage.vue') }],
  },
  {
    path: '/seleccion',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [{ path: '', component: () => import('../pages/SeleccionPage.vue') }],
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
      { path: 'mis-ofertas', component: () => import('../pages/MisOfertasPage.vue') },
      { path: 'metodos-pago', component: () => import('../pages/MetodosPagoPage.vue') },
      { path: 'operacion/:id', component: () => import('../pages/OperacionDetallePage.vue') },
      { path: 'comprobante', component: () => import('../pages/ComprobantePage.vue') },
      { path: 'calificacion', component: () => import('../pages/CalificacionPage.vue') },
      { path: 'disputa', component: () => import('../pages/DisputaPage.vue') },
      { path: 'chat', component: () => import('../pages/ChatPage.vue') },
      {
        path: 'admin',
        component: () => import('../pages/DashboardAdministrativoPage.vue'),
        meta: { requiereAuth: true, requiereAdmin: true },
      },
    ],
  },

  // --- 4. 404 ---
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue'),
  },
]

export default routes