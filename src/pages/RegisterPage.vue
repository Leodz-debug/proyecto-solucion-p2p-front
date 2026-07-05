<template>
  <q-page class="register-page flex flex-center">
    <q-card class="register-card q-pa-lg">
      <div class="text-center q-mb-md">
        <q-icon name="shield" size="48px" color="amber" />
        <div class="text-h6 text-weight-bold text-white q-mt-sm">Crear cuenta</div>
        <div class="text-grey-5">Únete a miles de usuarios que ya intercambian divisas</div>
      </div>

      <q-input
        v-model="nombreCompleto"
        label="Nombre completo"
        dark
        outlined
        color="amber"
        class="q-mb-md"
      >
        <template v-slot:prepend><q-icon name="person" /></template>
      </q-input>

      <q-input
        v-model="correo"
        label="Correo electrónico"
        type="email"
        dark
        outlined
        color="amber"
        class="q-mb-md"
      >
        <template v-slot:prepend><q-icon name="mail" /></template>
      </q-input>

      <q-input v-model="telefono" label="Teléfono" dark outlined color="amber" class="q-mb-md">
        <template v-slot:prepend><q-icon name="phone" /></template>
      </q-input>

      <q-input
        v-model="password"
        label="Contraseña"
        :type="verPass ? 'text' : 'password'"
        dark
        outlined
        color="amber"
        class="q-mb-xs"
        :rules="passwordRules"
        lazy-rules
      >
        <template v-slot:prepend><q-icon name="lock" /></template>
        <template v-slot:append>
          <q-icon
            :name="verPass ? 'visibility' : 'visibility_off'"
            class="cursor-pointer"
            @click="verPass = !verPass"
          />
        </template>
      </q-input>

      <div class="q-mb-md q-px-xs">
        <div
          v-for="req in requisitos"
          :key="req.label"
          class="text-caption row items-center q-gutter-x-xs"
          :class="req.cumplido ? 'text-positive' : 'text-grey-6'"
        >
          <q-icon :name="req.cumplido ? 'check_circle' : 'radio_button_unchecked'" size="14px" />
          <span>{{ req.label }}</span>
        </div>
      </div>

      <q-banner v-if="error" dense class="bg-red-9 text-white q-mb-md rounded-borders">
        {{ error }}
      </q-banner>

      <q-btn
        label="Crear cuenta"
        color="amber"
        text-color="black"
        class="full-width q-py-sm text-weight-bold"
        :loading="cargando"
        :disable="!passwordEsSegura || !correo || !nombreCompleto"
        @click="crear"
      />

      <div class="text-center q-mt-md text-grey-5">
        ¿Ya tienes cuenta?
        <span class="text-amber cursor-pointer" @click="$router.push('/login')"
          >Iniciar sesión</span
        >
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const nombreCompleto = ref('')
const correo = ref('')
const telefono = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const verPass = ref(false)

const requisitos = computed(() => [
  { label: 'Mínimo 8 caracteres', cumplido: password.value.length >= 8 },
  { label: 'Al menos una mayúscula', cumplido: /[A-Z]/.test(password.value) },
  { label: 'Al menos una minúscula', cumplido: /[a-z]/.test(password.value) },
  { label: 'Al menos un número', cumplido: /[0-9]/.test(password.value) },
  {
    label: 'Al menos un carácter especial (!@#$%...)',
    cumplido: /[^A-Za-z0-9]/.test(password.value),
  },
])

const passwordEsSegura = computed(() => requisitos.value.every((r) => r.cumplido))

const passwordRules = [
  (val) => !!val || 'La contraseña es obligatoria',
  () => passwordEsSegura.value || 'La contraseña no cumple los requisitos de seguridad',
]

async function crear() {
  error.value = ''

  if (!passwordEsSegura.value) {
    error.value = 'Tu contraseña debe cumplir todos los requisitos de seguridad.'
    return
  }

  cargando.value = true
  try {
    await auth.registrar({
      nombreCompleto: nombreCompleto.value,
      correo: correo.value,
      password: password.value,
      telefono: telefono.value,
    })

    // Forzar login manual limpiando tokens automáticos del backend
    localStorage.removeItem('token')
    if (auth.logout) auth.logout()

    router.push('/login')
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
:deep(input:-webkit-autofill) {
  -webkit-text-fill-color: white !important;
  -webkit-box-shadow: 0 0 0 1000px #161b22 inset !important;
}
</style>