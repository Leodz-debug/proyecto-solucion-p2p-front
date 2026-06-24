<template>
  <q-page class="flex flex-center column q-gutter-md">
    <h5>Prueba de conexión con la API</h5>
    <q-btn color="primary" label="Traer monedas" @click="traerMonedas" />
    <div v-if="monedas.length">
      <div v-for="m in monedas" :key="m.id">{{ m.codigo }} - {{ m.nombre }}</div>
    </div>
    <div v-if="error" class="text-red">{{ error }}</div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const monedas = ref([])
const error = ref('')

async function traerMonedas() {
  try {
    const res = await api.get('/moneda')
    monedas.value = res.data
    error.value = ''
  } catch (e) {
    error.value = 'Error: ' + e.message
  }
}
</script>