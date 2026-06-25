<template>
  <q-page class="admin-page q-pa-lg">
    <div class="text-h4 text-white text-weight-bold">Dashboard Administrativo</div>

    <div class="text-grey-5 q-mb-xl">Resumen general de la plataforma</div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="amber" size="40px" />
    </div>

    <div v-else class="row q-col-gutter-lg">
      <div class="col-12 col-md-4">
        <q-card class="panel q-pa-lg text-center">
          <q-icon name="people" size="50px" color="amber" />

          <div class="text-h3 text-white q-mt-md">
            {{ reporte.totalUsuarios }}
          </div>

          <div class="text-grey-5">Usuarios registrados</div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="panel q-pa-lg text-center">
          <q-icon name="currency_exchange" size="50px" color="green" />

          <div class="text-h3 text-white q-mt-md">
            {{ reporte.totalOperaciones }}
          </div>

          <div class="text-grey-5">Operaciones</div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="panel q-pa-lg text-center">
          <q-icon name="report_problem" size="50px" color="red" />

          <div class="text-h3 text-white q-mt-md">
            {{ reporte.totalDisputas }}
          </div>

          <div class="text-grey-5">Disputas</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import api from '@/services/api'

const reporte = ref({})

const loading = ref(true)

async function cargar() {
  loading.value = true

  try {
    const res = await api.get('/reporteadministrativo')

    reporte.value = res.data[0]
  } catch (e) {
    console.error(e)
  }

  loading.value = false
}

onMounted(cargar)
</script>

<style scoped>
.admin-page {
  background: #0d1117;

  min-height: 100vh;
}

.panel {
  background: #161b22;

  border: 1px solid #30363d;

  border-radius: 12px;
}
</style>
