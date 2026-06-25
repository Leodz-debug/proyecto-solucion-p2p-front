<template>
  <q-page class="q-pa-lg calificacion-page">
    <q-btn flat icon="arrow_back" color="amber" label="Volver" @click="$router.back()" />

    <div class="text-h5 text-white text-weight-bold q-mt-md">Calificar usuario</div>

    <div class="text-grey-5 q-mb-lg">Operación #{{ operacionId }}</div>

    <q-card class="panel q-pa-lg">
      <q-input v-model.number="usuarioId" label="ID Usuario" dark outlined />

      <div class="q-mt-md" />

      <q-rating v-model="puntaje" size="40px" color="amber" :max="5" />

      <div class="q-mt-md" />

      <q-input v-model="comentario" label="Comentario" type="textarea" dark outlined />

      <q-banner
        v-if="mensaje"
        class="q-mt-md"
        :class="ok ? 'bg-green text-white' : 'bg-red text-white'"
      >
        {{ mensaje }}
      </q-banner>

      <q-btn
        class="full-width q-mt-lg"
        color="amber"
        text-color="black"
        label="Guardar calificación"
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

const usuarioId = ref()

const puntaje = ref(5)

const comentario = ref('')

const mensaje = ref('')

const ok = ref(false)

const loading = ref(false)

async function guardar() {
  mensaje.value = ''

  if (!usuarioId.value) {
    ok.value = false

    mensaje.value = 'Ingrese el usuario.'

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
    await api.post('/calificacion', {
      operacionId: operacionId,

      usuarioCalificadoId: usuarioId.value,

      puntaje: puntaje.value,

      comentario: comentario.value,

      fechaRegistro: new Date().toISOString(),
    })

    ok.value = true

    mensaje.value = 'Calificación registrada.'

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
.calificacion-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
}
</style>
