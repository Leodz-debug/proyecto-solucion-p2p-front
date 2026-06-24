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
  },

  actions: {
    async login(correo, password) {
      const res = await api.post('/usuario/login', { correo, password })
      // Guarda token y usuario
      this.token = res.data.token
      this.usuario = res.data.usuario
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
    },

    logout() {
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    },
  },
})