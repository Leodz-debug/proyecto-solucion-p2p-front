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

  // --- 2. Flujo de usuario normal ---
  {
    path: '/verificacion',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true, noAdmin: true },
    children: [{ path: '', component: () => import('../pages/VerificacionPage.vue') }],
  },
  {
    path: '/seleccion',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true, noAdmin: true },
    children: [{ path: '', component: () => import('../pages/SeleccionPage.vue') }],
  },

  // --- 3. Rutas PROTEGIDAS ---
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      { path: '', redirect: '/seleccion' },

      // Rutas de comprador/vendedor. El admin no entra a este flujo.
      {
        path: 'publicar',
        component: () => import('../pages/PublicarPage.vue'),
        meta: { noAdmin: true },
      },
      {
        path: 'marketplace',
        component: () => import('../pages/MarketplacePage.vue'),
        meta: { noAdmin: true },
      },
      {
        path: 'operacion',
        component: () => import('../pages/OperacionPage.vue'),
        meta: { noAdmin: true },
      },
      {
        path: 'mis-ofertas',
        component: () => import('../pages/MisOfertasPage.vue'),
        meta: { noAdmin: true },
      },
      {
        path: 'metodos-pago',
        component: () => import('../pages/MetodosPagoPage.vue'),
        meta: { noAdmin: true },
      },
      {
        path: 'operacion/:id',
        component: () => import('../pages/OperacionDetallePage.vue'),
        meta: { noAdmin: true },
      },
      {
        path: 'comprobante',
        component: () => import('../pages/ComprobantePage.vue'),
        meta: { noAdmin: true },
      },
      {
        path: 'calificacion',
        component: () => import('../pages/CalificacionPage.vue'),
        meta: { noAdmin: true },
      },
      {
        path: 'disputa',
        component: () => import('../pages/DisputaPage.vue'),
        meta: { noAdmin: true },
      },
      { path: 'chat', component: () => import('../pages/ChatPage.vue'), meta: { noAdmin: true } },

      // Ruta administrativa.
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
