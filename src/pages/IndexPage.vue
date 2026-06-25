<template>
  <q-page class="marketplace-page q-pa-lg">
    <div class="row justify-between items-center q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-white">Marketplace P2P</div>
        <div class="text-grey-5 q-mt-xs">Encuentra las mejores ofertas de cambio</div>
      </div>
      
      <q-btn 
        color="amber" 
        text-color="black" 
        icon="style" 
        label="Publicar oferta" 
        class="text-weight-bold q-px-md button-publish"
        no-caps
        @click="$router.push('/publicar')"
      />
    </div>

    <q-card class="filter-card q-pa-md q-mb-lg">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-sm-3">
          <div class="text-caption text-grey-5 text-weight-bold q-mb-xs text-uppercase tracking-wider">Tengo</div>
          <q-select v-model="filtros.tengo" :options="opcionesMonedas" dark outlined dense color="amber" />
        </div>
        <div class="col-12 col-sm-3">
          <div class="text-caption text-grey-5 text-weight-bold q-mb-xs text-uppercase tracking-wider">Quiero</div>
          <q-select v-model="filtros.quiero" :options="opcionesMonedas" dark outlined dense color="amber" />
        </div>
        <div class="col-12 col-sm-3">
          <div class="text-caption text-grey-5 text-weight-bold q-mb-xs text-uppercase tracking-wider">Ordenar por</div>
          <q-select v-model="filtros.ordenar" :options="['Mejor tasa', 'Monto disponible', 'Fecha']" dark outlined dense color="amber" />
        </div>
        <div class="col-12 col-sm-3 text-right">
          <q-btn outline color="grey-5" icon="tune" label="Filtros" class="full-width text-weight-medium" no-caps />
        </div>
      </div>
    </q-card>

    <q-card class="table-card">
      <div class="row table-header q-pa-md text-grey-5 text-caption text-weight-bold text-uppercase">
        <div class="col-3">Vendedor</div>
        <div class="col-2 text-center">Tipo de Cambio</div>
        <div class="col-3 text-center">Disponible / Límites</div>
        <div class="col-2 text-center">Método de Pago</div>
        <div class="col-2 text-right">Acción</div>
      </div>

      <q-separator dark class="separator-border" />

      <div v-for="oferta in ofertasFiltradas" :key="oferta.id" class="row table-row q-pa-md items-center">
        <div class="col-3 row items-center no-wrap">
          <q-avatar size="40px" color="amber-10" text-color="amber" class="text-weight-bold q-mr-md">
            {{ oferta.usuarioId?.toString().slice(-1) || 'U' }}
          </q-avatar>
          <div>
            <div class="text-white text-weight-bold">User #{{ oferta.usuarioId }}</div>
          </div>
        </div>
        <div class="col-2 text-center">
          <div class="text-h6 text-weight-bold text-amber">{{ oferta.tasaCambio?.toFixed(2) }}</div>
        </div>
        <div class="col-3 text-center text-white">{{ oferta.montoDisponible }} {{ oferta.monedaOrigenNombre }}</div>
        <div class="col-2 text-center text-grey-3">Bancaria</div>
        <div class="col-2 text-right">
          <q-btn color="amber" text-color="black" label="Comprar" class="text-weight-bold" no-caps />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const ofertas = ref([])
const filtros = ref({ tengo: 'USD', quiero: 'PEN', ordenar: 'Mejor tasa' })
const opcionesMonedas = ['USD', 'PEN', 'EUR']
const api = axios.create({ baseURL: 'https://localhost:7231' })

onMounted(async () => {
  try {
    const response = await api.get('/api/Oferta')
    ofertas.value = response.data
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
})

const ofertasFiltradas = computed(() => {
  return ofertas.value.filter(o => o.estado === 'Activa')
})
</script>

<style scoped>
.marketplace-page { background: #0d1117; min-height: 100vh; }
.filter-card, .table-card { background: #161b22; border-radius: 12px; border: 1px solid #30363d; }
.table-row { border-bottom: 1px solid #21262d; }
.button-publish { border-radius: 8px; }
</style>