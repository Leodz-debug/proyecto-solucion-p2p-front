<template>
  <q-page class="register-page flex flex-center">
    <q-card class="register-card q-pa-lg">
      <div class="text-center q-mb-md">
        <q-icon name="shield" size="48px" color="amber" />
        <div class="text-h6 text-weight-bold text-white q-mt-sm">Crear cuenta</div>
        <div class="text-grey-5">Únete a miles de usuarios que ya intercambian divisas</div>
      </div>

      <q-input v-model="nombreCompleto" label="Nombre completo" dark outlined color="amber" class="q-mb-md">
        <template v-slot:prepend><q-icon name="person" /></template>
      </q-input>

      <q-input v-model="correo" label="Correo electrónico" type="email" dark outlined color="amber" class="q-mb-md">
        <template v-slot:prepend><q-icon name="mail" /></template>
      </q-input>

      <q-input v-model="telefono" label="Teléfono" dark outlined color="amber" class="q-mb-md">
        <template v-slot:prepend><q-icon name="phone" /></template>
      </q-input>

      <q-input v-model="password" label="Contraseña" type="password" dark outlined color="amber" class="q-mb-md">
        <template v-slot:prepend><q-icon name="lock" /></template>
      </q-input>

      <q-banner v-if="error" dense class="bg-red-9 text-white q-mb-md rounded-borders">
        {{ error }}
      </q-banner>

      <q-btn
        label="Crear cuenta"
        color="amber"
        text-color="black"
        class="full-width q-py-sm text-weight-bold"
        :loading="cargando"
        @click="crear"
      />

      <div class="text-center q-mt-md text-grey-5">
        ¿Ya tienes cuenta?
        <span class="text-amber cursor-pointer" @click="$router.push('/login')">Iniciar sesión</span>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const nombreCompleto = ref('')
const correo = ref('')
const telefono = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)

async function crear() {
  error.value = ''
  cargando.value = true
  try {
    await auth.registrar({
      nombreCompleto: nombreCompleto.value,
      correo: correo.value,
      password: password.value,
      telefono: telefono.value,
    })
    router.push('/') // registrado y logueado, va al inicio
  } catch (e) {
    if (e.response?.status === 400) {
      error.value = 'El correo ya está registrado.'
    } else {
      error.value = 'Error al crear la cuenta.'
    }
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.register-page {
  background: #0d1117;
  min-height: 100vh;
}
.register-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  width: 420px;
}
/* Evita que el autocompletar del navegador pinte los campos de blanco */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: white !important;
  -webkit-box-shadow: 0 0 0 1000px #161b22 inset !important;
  caret-color: white;
}
</style>