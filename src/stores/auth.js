import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: JSON.parse(localStorage.getItem('usuario')) || null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    estaLogueado: (state) => !!state.token,
    esAdmin: (state) => state.usuario?.rol === 'Administrador',
    esUsuarioOperativo: (state) => state.usuario?.rol !== 'Administrador',
    estaVerificado: (state) => state.usuario?.estadoVerificacion === 'Verificado',

    // Importante: un administrador gestiona la plataforma, pero NO actúa como comprador/vendedor.
    // Por eso no puede publicar ofertas, iniciar operaciones ni calificar como usuario normal.
    puedeOperar: (state) =>
      state.usuario?.rol !== 'Administrador' && state.usuario?.estadoVerificacion === 'Verificado',
  },

  actions: {
    async login(correo, password) {
      const res = await api.post('/usuario/login', { correo, password })
      this.token = res.data.token
      this.usuario = res.data.usuario
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
    },

    async registrar(datos) {
      await api.post('/usuario/registrar', datos)
      await this.login(datos.correo, datos.password)
    },

    logout() {
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    },
  },
})
