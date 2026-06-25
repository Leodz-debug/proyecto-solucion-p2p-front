<template>
  <q-page class="verif-page q-pa-lg">
    <div class="text-h5 text-weight-bold text-white">Verificación de identidad</div>
    <div class="text-grey-5 q-mb-lg">Completa tu verificación KYC para operar en la plataforma</div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-7">
        <q-card class="panel q-pa-md q-mb-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="schedule" color="amber" size="28px" />
            <div>
              <div class="text-white text-weight-bold">Estado: {{ estado }}</div>
              <div class="text-grey-5 text-caption">Completa la verificación para operar</div>
            </div>
          </div>
          <q-linear-progress :value="progreso" color="amber" class="q-mt-md" size="10px" rounded />
          <div class="text-right text-grey-5 text-caption q-mt-xs">{{ Math.round(progreso * 100) }}%</div>
        </q-card>

        <q-card class="panel q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-card clickable class="doc-option q-pa-md text-center"
                :class="{ 'doc-selected': tipoDoc === 'DNI' }" @click="tipoDoc = 'DNI'">
                <q-icon name="badge" size="32px" color="amber" />
                <div class="text-white text-weight-bold q-mt-sm">Subir DNI</div>
                <div class="text-grey-5 text-caption">Documento Nacional de Identidad</div>
              </q-card>
            </div>
            <div class="col-6">
              <q-card clickable class="doc-option q-pa-md text-center"
                :class="{ 'doc-selected': tipoDoc === 'Pasaporte' }" @click="tipoDoc = 'Pasaporte'">
                <q-icon name="travel_explore" size="32px" color="amber" />
                <div class="text-white text-weight-bold q-mt-sm">Subir Pasaporte</div>
                <div class="text-grey-5 text-caption">Pasaporte internacional</div>
              </q-card>
            </div>
          </div>

          <q-input v-model="numeroDoc" label="Número de documento" dark outlined color="amber" class="q-mt-md" />

          <q-banner v-if="mensaje" dense class="q-mt-md rounded-borders"
            :class="exito ? 'bg-green-9 text-white' : 'bg-red-9 text-white'">{{ mensaje }}</q-banner>

          <div class="row q-gutter-sm q-mt-md">
            <q-btn label="Enviar verificación" color="amber" text-color="black"
              class="text-weight-bold col" :loading="cargando" @click="enviarVerificacion" />
            <q-btn label="Más tarde" outline color="grey-5" @click="$router.push('/')" />
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="panel q-pa-md">
          <div class="text-white text-weight-bold q-mb-md">¿Por qué verificarse?</div>
          <div v-for="(b, i) in beneficios" :key="i" class="row items-center q-mb-sm">
            <q-icon name="check_circle" color="green" size="20px" class="q-mr-sm" />
            <span class="text-grey-4">{{ b }}</span>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()
const tipoDoc = ref('DNI')
const numeroDoc = ref('')
const estado = ref(auth.usuario?.estadoVerificacion || 'Pendiente')
const mensaje = ref('')
const exito = ref(false)
const cargando = ref(false)

const beneficios = [
  'Acceso a todos los límites de operación',
  'Mayor confianza de otros usuarios',
  'Protección contra fraudes',
  'Cumplimiento regulatorio',
]

const progreso = computed(() => {
  if (estado.value === 'Verificado') return 1
  if (estado.value === 'Pendiente') return 0.3
  return 0
})

async function enviarVerificacion() {
  mensaje.value = ''
  if (!numeroDoc.value) {
    exito.value = false
    mensaje.value = 'Ingresa el número de tu documento.'
    return
  }
  cargando.value = true
  try {
    await api.post('/verificacionidentidad', {
      usuarioId: auth.usuario.id,
      documentoIdentidad: numeroDoc.value,
      tipoDocumento: tipoDoc.value,
      estadoVerificacion: 'Pendiente',
    })
    exito.value = true
    mensaje.value = 'Verificación enviada. Estado: Pendiente de revisión.'
    estado.value = 'Pendiente'
  } catch {
    exito.value = false
    mensaje.value = 'Error al enviar la verificación.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.verif-page { background: #0d1117; min-height: 100vh; }
.panel { background: #161b22; border: 1px solid #30363d; border-radius: 12px; }
.doc-option { background: #0d1117; border: 1px solid #30363d; border-radius: 10px; }
.doc-selected { border: 2px solid #f2c037; }
</style>