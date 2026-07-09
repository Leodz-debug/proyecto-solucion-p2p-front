import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'

import routes from './routes.js'

function leerUsuarioLocal() {
  try {
    return JSON.parse(localStorage.getItem('usuario'))
  } catch {
    return null
  }
}

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

  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const usuario = leerUsuarioLocal()
    const esAdmin = usuario?.rol === 'Administrador'

    const necesitaLogin = to.matched.some((r) => r.meta.requiereAuth)
    const necesitaAdmin = to.matched.some((r) => r.meta.requiereAdmin)
    const bloqueaAdmin = to.matched.some((r) => r.meta.noAdmin)

    if (necesitaLogin && !token) {
      next('/login')
      return
    }

    if ((to.path === '/login' || to.path === '/registro') && token) {
      next(esAdmin ? '/admin' : '/verificacion')
      return
    }

    if (token && esAdmin && bloqueaAdmin) {
      next('/admin')
      return
    }

    if (token && necesitaAdmin && !esAdmin) {
      next('/seleccion')
      return
    }

    next()
  })

  return Router
})
