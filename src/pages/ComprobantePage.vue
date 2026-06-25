<template>
  <q-page class="q-pa-lg comprobante-page">
    <q-btn flat color="amber" icon="arrow_back" label="Volver" @click="$router.back()" />

    <div class="text-h5 text-white text-weight-bold q-mt-md">Subir comprobante</div>

    <div class="text-grey-5 q-mb-lg">Operación #{{ operacionId }}</div>

    <q-card class="panel q-pa-lg">
      <q-input v-model="rutaArchivo" label="Ruta del archivo" outlined dark />

      <q-banner
        v-if="mensaje"
        class="q-mt-md"
        :class="ok ? 'bg-green text-white' : 'bg-red text-white'"
      >
        {{ mensaje }}
      </q-banner>

      <q-btn
        class="q-mt-lg full-width"
        color="amber"
        text-color="black"
        label="Guardar comprobante"
        :loading="loading"
        @click="guardar"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const operacionId = Number(route.query.operacion)

const rutaArchivo = ref('')
const loading = ref(false)
const mensaje = ref('')
const ok = ref(false)

async function guardar() {
  mensaje.value = ''

  if (!rutaArchivo.value) {
    ok.value = false
    mensaje.value = 'Ingrese la ruta del archivo'
    return
  }

  loading.value = true

  try {
    await api.get(`/operacion/${operacionId}`)
  } catch {
    ok.value = false
    mensaje.value = 'La operación no existe.'
    loading.value = false
    return
  }

  try {
    await api.post('/comprobantepago', {
      operacionId: operacionId,
      rutaArchivo: rutaArchivo.value,
      fechaSubida: new Date().toISOString(),
    })

    ok.value = true
    mensaje.value = 'Comprobante registrado.'

    setTimeout(() => {
      router.push('/operacion')
    }, 1200)
  } catch {
    ok.value = false
    mensaje.value = 'Error al registrar.'
  }

  loading.value = false
}

onMounted(async () => {
  try {
    await api.get(`/operacion/${operacionId}`)
  } catch {
    router.push('/operacion')
  }
})
</script>

<style scoped>
.comprobante-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
}
</style>
