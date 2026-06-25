import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'

import routes from './routes.js'

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })

  // ===== GUARD: Protege y guía el flujo de la aplicación =====
  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const necesitaLogin = to.matched.some((r) => r.meta.requiereAuth)

    if (necesitaLogin && !token) {
      // 1. Intenta entrar a una ruta protegida sin token -> Al Login
      next('/login')
    } else if ((to.path === '/login' || to.path === '/registro') && token) {
      // 2. CORRECCIÓN: Si ya está logueado e intenta ir a login/registro,
      // lo redirigimos al inicio de tu flujo unificado, NO a la raíz antigua.
      next('/verificacion')
    } else {
      // 3. De lo contrario, continúa libremente
      next()
    }
  })

  return Router
})