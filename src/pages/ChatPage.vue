<template>
  <q-page class="chat-page q-pa-lg">
    <q-btn flat icon="arrow_back" color="amber" label="Volver" @click="$router.back()" />

    <div class="text-h5 text-white text-weight-bold q-mt-md">Chat de la operación</div>

    <div class="text-grey-5">Operación #{{ operacionId }}</div>

    <q-card class="panel q-pa-md q-mt-lg">
      <div v-for="m in mensajes" :key="m.id" class="q-mb-md">
        <div class="text-amber">
          {{ m.remitenteNombre }}
        </div>

        <div class="text-white">
          {{ m.contenido }}
        </div>

        <div class="text-grey-6 text-caption">
          {{ m.fechaEnvio }}
        </div>

        <q-separator class="q-mt-sm" />
      </div>

      <q-input v-model="texto" dark outlined label="Escriba un mensaje" class="q-mt-md" />

      <q-btn
        class="full-width q-mt-md"
        color="amber"
        text-color="black"
        label="Enviar"
        @click="enviar"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import api from '@/services/api'

const auth = useAuthStore()

const route = useRoute()

const operacionId = Number(route.query.operacion)

const mensajes = ref([])

const texto = ref('')

async function cargar() {
  const res = await api.get('/mensaje')

  mensajes.value = res.data.filter((x) => x.operacionId == operacionId)
}

async function enviar() {
  if (texto.value == '') return

  const operacion = await api.get(`/operacion/${operacionId}`)

  await api.post('/mensaje', {
    remitenteId: auth.usuario.id,

    destinatarioId:
      auth.usuario.id == operacion.data.compradorId
        ? operacion.data.vendedorId
        : operacion.data.compradorId,

    operacionId: operacionId,

    contenido: texto.value,

    fechaEnvio: new Date().toISOString(),

    remitenteNombre: '',

    destinatarioNombre: '',
  })

  texto.value = ''

  await cargar()
}

onMounted(cargar)
</script>

<style scoped>
.chat-page {
  background: #0d1117;

  min-height: 100vh;
}

.panel {
  background: #161b22;

  border: 1px solid #30363d;
}
</style>
