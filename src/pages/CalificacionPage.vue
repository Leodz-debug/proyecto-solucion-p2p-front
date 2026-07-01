<template>
  <q-page class="q-pa-lg calificacion-page">
    <q-btn flat icon="arrow_back" color="amber" label="Volver" @click="$router.back()" />

    <div class="text-h5 text-white text-weight-bold q-mt-md">Calificar usuario</div>
    <div class="text-grey-5 q-mb-lg">Tu opinión ayuda a mejorar la comunidad</div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="40px" />
    </div>

    <q-card v-else-if="!operacion" class="panel q-pa-lg text-center">
      <div class="text-grey-5">No se encontró la operación.</div>
    </q-card>

    <q-card v-else class="panel q-pa-lg">
      <div class="row items-center q-mb-md">
        <q-avatar color="amber" text-color="black" size="42px">
          {{ contraparteNombre.charAt(0) }}
        </q-avatar>
        <div class="q-ml-sm">
          <div class="text-white text-weight-bold">{{ contraparteNombre }}</div>
          <div class="text-grey-5 text-caption">Operación {{ operacion.codigoOperacion }}</div>
        </div>
      </div>

      <div class="text-grey-4 q-mb-xs">¿Cómo fue tu experiencia?</div>
      <q-rating v-model="puntaje" size="40px" color="amber" :max="5" />

      <div class="q-mt-md" />

      <q-input
        v-model="comentario"
        label="Comentarios (opcional)"
        type="textarea"
        dark
        outlined
      />

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
        label="Enviar calificación"
        :loading="loading"
        @click="guardar"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const operacionId = Number(route.query.operacion)

const operacion = ref(null)
const cargando = ref(true)
const puntaje = ref(5)
const comentario = ref('')
const mensaje = ref('')
const ok = ref(false)
const loading = ref(false)

// La contraparte se detecta sola: si yo soy el comprador, califico al vendedor y viceversa.
const usuarioCalificadoId = computed(() => {
  if (!operacion.value) return null
  return auth.usuario.id === operacion.value.compradorId
    ? operacion.value.vendedorId
    : operacion.value.compradorId
})

const contraparteNombre = computed(() => {
  if (!operacion.value) return ''
  return auth.usuario.id === operacion.value.compradorId
    ? operacion.value.vendedorNombre
    : operacion.value.compradorNombre
})

async function guardar() {
  mensaje.value = ''

  if (!usuarioCalificadoId.value) {
    ok.value = false
    mensaje.value = 'No se pudo determinar al usuario a calificar.'
    return
  }

  loading.value = true
  try {
    await api.post('/calificacion', {
      operacionId: operacionId,
      usuarioCalificadoId: usuarioCalificadoId.value,
      puntaje: puntaje.value,
      comentario: comentario.value,
      fechaRegistro: new Date().toISOString(),
    })

    ok.value = true
    mensaje.value = 'Calificación registrada. ¡Gracias!'

    setTimeout(() => {
      router.push('/operacion')
    }, 1200)
  } catch {
    ok.value = false
    mensaje.value = 'Error al registrar la calificación.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/operacion/${operacionId}`)
    operacion.value = res.data
  } catch {
    operacion.value = null
  } finally {
    cargando.value = false
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
  border-radius: 12px;
}
</style>