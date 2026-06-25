<template>
  <q-page class="disputa-page q-pa-lg">
    <q-btn flat icon="arrow_back" color="amber" label="Volver" @click="$router.back()" />

    <div class="text-h5 text-white text-weight-bold q-mt-md">Abrir disputa</div>

    <div class="text-grey-5">Operación #{{ operacionId }}</div>

    <q-card class="panel q-pa-lg q-mt-lg">
      <q-input v-model="motivo" type="textarea" outlined dark label="Motivo de la disputa" />

      <q-banner
        v-if="mensaje"
        class="q-mt-md"
        :class="ok ? 'bg-green text-white' : 'bg-red text-white'"
      >
        {{ mensaje }}
      </q-banner>

      <q-btn
        class="full-width q-mt-lg"
        color="red"
        label="Enviar disputa"
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

const router = useRouter()

const route = useRoute()

const operacionId = Number(route.query.operacion)

const motivo = ref('')

const mensaje = ref('')

const ok = ref(false)

const loading = ref(false)

async function guardar() {
  mensaje.value = ''

  if (motivo.value == '') {
    ok.value = false

    mensaje.value = 'Ingrese un motivo.'

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
    await api.post('/disputa', {
      operacionId: operacionId,

      motivo: motivo.value,

      estado: 'Pendiente',

      resolucion: null,

      fechaRegistro: new Date().toISOString(),
    })

    ok.value = true

    mensaje.value = 'Disputa registrada.'

    setTimeout(() => {
      router.push('/operacion')
    }, 1200)
  } catch {
    ok.value = false

    mensaje.value = 'No fue posible registrar.'
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
.disputa-page {
  background: #0d1117;

  min-height: 100vh;
}

.panel {
  background: #161b22;

  border: 1px solid #30363d;
}
</style>
