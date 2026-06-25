<template>
  <q-page class="login-page flex flex-center">
    <div class="login-container row items-center justify-center">

      <div class="col-12 col-md-6 text-center q-pa-xl branding">
        <q-icon name="shield" size="64px" color="amber" />
        <div class="text-h4 text-weight-bold q-mt-md text-white">
          CambioSeguro <span class="text-amber">P2P</span>
        </div>
        <div class="text-grey-5 q-mt-sm">
          Intercambia divisas de forma segura, rápida y confiable entre usuarios verificados
        </div>

        <div class="row q-gutter-sm justify-center q-mt-lg">
          <q-chip color="grey-9" text-color="amber" icon="lock">100% Seguro</q-chip>
          <q-chip color="grey-9" text-color="amber" icon="bolt">Rápido</q-chip>
          <q-chip color="grey-9" text-color="amber" icon="verified">Verificados</q-chip>
        </div>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="login-card q-pa-lg">
          <div class="text-h6 text-weight-bold text-white">Iniciar sesión</div>
          <div class="text-grey-5 q-mb-md">Bienvenido de nuevo a tu cuenta</div>

          <q-input
            v-model="correo"
            label="Correo electrónico"
            type="email"
            dark outlined
            color="amber"
            class="q-mb-md"
          >
            <template v-slot:prepend><q-icon name="mail" /></template>
          </q-input>

          <q-input
            v-model="password"
            label="Contraseña"
            :type="verPass ? 'text' : 'password'"
            dark outlined
            color="amber"
            class="q-mb-md"
            @keyup.enter="ingresar"
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

          <q-banner v-if="error" dense class="bg-red-9 text-white q-mb-md rounded-borders">
            {{ error }}
          </q-banner>

          <q-btn
            label="Ingresar"
            color="amber"
            text-color="black"
            class="full-width q-py-sm text-weight-bold"
            :loading="cargando"
            @click="ingresar"
          />

          <div class="text-center q-mt-md text-grey-5">
            ¿No tienes cuenta?
            <span class="text-amber cursor-pointer" @click="irARegistro">Crear cuenta</span>
          </div>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// Cambiado alias por ruta relativa por si Vite reclama la @
import { useAuthStore } from '../stores/auth' 

const router = useRouter()
const auth = useAuthStore()

const correo = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const verPass = ref(false)

async function ingresar() {
  error.value = ''
  cargando.value = true
  try {
    await auth.login(correo.value, password.value)
    // CAMBIO CLAVE: Te manda directo a verificación tras iniciar sesión con éxito
    router.push('/verificacion') 
  } catch (e) {
    if (e.response?.status === 401) {
      error.value = 'Correo o contraseña incorrectos.'
    } else {
      error.value = 'Error de conexión con el servidor.'
    }
  } finally {
    cargando.value = false
  }
}

function irARegistro() {
  router.push('/registro')
}
</script>

<style scoped>
.login-page {
  background: #0d1117;
  min-height: 100vh;
}
.login-container {
  max-width: 1000px;
  width: 100%;
}
.login-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: white !important;
  -webkit-box-shadow: 0 0 0 1000px #161b22 inset !important;
  caret-color: white;
}
.branding {
  border-right: 1px solid #21262d;
}
</style>