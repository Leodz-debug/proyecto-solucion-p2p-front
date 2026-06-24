import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'

import routes from './routes.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })

  // ===== GUARD: protege las rutas que requieren login =====
  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const necesitaLogin = to.matched.some((r) => r.meta.requiereAuth)

    if (necesitaLogin && !token) {
      // Quiere entrar a algo protegido pero NO está logueado → al login
      next('/login')
    } else if ((to.path === '/login' || to.path === '/registro') && token) {
      // Si ya está logueado y trata de ir al login/registro → al inicio
      next('/')
    } else {
      next()
    }
  })

  return Router
})