<template>
  <q-page class="market-page q-pa-lg">
    <div class="text-h5 text-weight-bold text-white">Marketplace</div>
    <div class="text-grey-5 q-mb-lg">Explora las ofertas disponibles y elige la mejor para ti</div>

    <!-- ===== BARRA DE FILTROS ===== -->
    <q-card class="panel q-pa-md q-mb-lg">
      <div class="row q-col-gutter-md items-end">
        <!-- Tipo -->
        <div class="col-12 col-md-3">
          <div class="text-grey-5 text-caption q-mb-xs">Tipo</div>
          <q-select
            v-model="filtroTipo"
            :options="['Todas', 'Venta', 'Compra']"
            dark
            outlined
            dense
            color="amber"
          />
        </div>

        <!-- Moneda origen -->
        <div class="col-12 col-md-3">
          <div class="text-grey-5 text-caption q-mb-xs">Moneda origen</div>
          <q-select
            v-model="filtroOrigen"
            :options="opcionesMoneda"
            emit-value
            map-options
            dark
            outlined
            dense
            color="amber"
          />
        </div>

        <!-- Moneda destino -->
        <div class="col-12 col-md-3">
          <div class="text-grey-5 text-caption q-mb-xs">Moneda destino</div>
          <q-select
            v-model="filtroDestino"
            :options="opcionesMoneda"
            emit-value
            map-options
            dark
            outlined
            dense
            color="amber"
          />
        </div>

        <!-- Ordenar -->
        <div class="col-12 col-md-3">
          <div class="text-grey-5 text-caption q-mb-xs">Ordenar por</div>
          <q-select
            v-model="ordenarPor"
            :options="['Mejor tasa', 'Tasa más alta', 'Más reciente']"
            dark
            outlined
            dense
            color="amber"
          />
        </div>
      </div>

      <div class="row q-mt-md">
        <q-btn label="Limpiar filtros" outline color="amber" @click="limpiarFiltros" />
      </div>
    </q-card>

    <!-- Contador -->
    <div class="text-grey-5 q-mb-md">{{ ofertasFiltradas.length }} oferta(s) encontrada(s)</div>

    <!-- Cargando -->
    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="40px" />
      <div class="text-grey-5 q-mt-sm">Cargando ofertas...</div>
    </div>

    <!-- Sin resultados -->
    <q-card v-else-if="ofertasFiltradas.length === 0" class="panel q-pa-xl text-center">
      <q-icon name="storefront" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-md">No hay ofertas que coincidan con los filtros.</div>
    </q-card>

    <!-- Lista de ofertas -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="oferta in ofertasFiltradas" :key="oferta.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="oferta-card q-pa-md">
          <div class="row items-center q-mb-md">
            <q-avatar color="amber" text-color="black" size="38px">V</q-avatar>
            <div class="q-ml-sm">
              <div class="text-white text-weight-bold">Vendedor #{{ oferta.usuarioId }}</div>
              <div class="text-amber text-caption">
                <q-icon name="star" size="14px" /> Reputación
              </div>
            </div>
            <q-space />
            <q-badge
              :color="oferta.tipoOperacion === 'Venta' ? 'green-9' : 'blue-9'"
              class="q-pa-sm"
            >
              {{ oferta.tipoOperacion }}
            </q-badge>
          </div>

          <div class="tasa-box q-pa-sm q-mb-md text-center">
            <div class="text-grey-5 text-caption">Tipo de cambio</div>
            <div class="text-h6 text-amber text-weight-bold">{{ oferta.tasaCambio }}</div>
          </div>

          <div class="row justify-between text-grey-4 q-mb-xs">
            <span>Disponible:</span
            ><span class="text-white">{{ oferta.montoDisponible ?? '—' }}</span>
          </div>
          <div class="row justify-between text-grey-4 q-mb-xs">
            <span>Límites:</span
            ><span class="text-white">{{ oferta.montoMinimo }} - {{ oferta.montoMaximo }}</span>
          </div>
          <div class="row justify-between text-grey-4 q-mb-md">
            <span>Estado:</span><span class="text-white">{{ oferta.estado }}</span>
          </div>

          <q-btn
            label="Iniciar trato"
            color="amber"
            text-color="black"
            class="full-width text-weight-bold"
            @click="abrirDialogoTrato(oferta)"
          />
        </q-card>
      </div>
    </div>

    <!-- ===== DIÁLOGO: confirmar monto e iniciar trato ===== -->
    <q-dialog v-model="dialogoAbierto">
      <q-card class="panel q-pa-lg" style="min-width: 320px">
        <div class="text-h6 text-white q-mb-sm">Confirmar trato</div>
        <div class="text-grey-5 q-mb-md">
          Tasa: <span class="text-amber">{{ ofertaSeleccionada?.tasaCambio }}</span> · Límites:
          {{ ofertaSeleccionada?.montoMinimo }} - {{ ofertaSeleccionada?.montoMaximo }}
        </div>

        <q-input
          v-model.number="montoTrato"
          type="number"
          label="Monto a operar"
          dark
          outlined
          color="amber"
          :rules="[
            (v) => v > 0 || 'Ingresa un monto',
            (v) => v >= ofertaSeleccionada?.montoMinimo || 'Monto menor al mínimo permitido',
            (v) => v <= ofertaSeleccionada?.montoMaximo || 'Monto mayor al máximo permitido',
          ]"
        />

        <q-banner v-if="errorDialogo" dense class="bg-red-9 text-white q-mt-md rounded-borders">
          {{ errorDialogo }}
        </q-banner>

        <div class="row q-gutter-sm q-mt-lg">
          <q-btn flat color="grey-5" label="Cancelar" v-close-popup class="col" />
          <q-btn
            color="amber"
            text-color="black"
            label="Confirmar"
            class="col text-weight-bold"
            :loading="iniciando"
            @click="confirmarTrato"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const ofertas = ref([])
const monedas = ref([])
const cargando = ref(true)

const filtroTipo = ref('Todas')
const filtroOrigen = ref(null)
const filtroDestino = ref(null)
const ordenarPor = ref('Mejor tasa')

const opcionesMoneda = computed(() => [
  { label: 'Todas', value: null },
  ...monedas.value.map((m) => ({ label: m.codigo + ' - ' + m.nombre, value: m.id })),
])

async function cargarDatos() {
  cargando.value = true
  try {
    const [resOfertas, resMonedas] = await Promise.all([api.get('/oferta'), api.get('/moneda')])
    ofertas.value = resOfertas.data
    monedas.value = resMonedas.data
  } catch (e) {
    console.error('Error al cargar datos:', e)
  } finally {
    cargando.value = false
  }
}

const ofertasFiltradas = computed(() => {
  let lista = [...ofertas.value]

  if (filtroTipo.value !== 'Todas') {
    lista = lista.filter((o) => o.tipoOperacion === filtroTipo.value)
  }
  if (filtroOrigen.value !== null) {
    lista = lista.filter((o) => o.monedaOrigenId === filtroOrigen.value)
  }
  if (filtroDestino.value !== null) {
    lista = lista.filter((o) => o.monedaDestinoId === filtroDestino.value)
  }

  if (ordenarPor.value === 'Mejor tasa') {
    lista.sort((a, b) => a.tasaCambio - b.tasaCambio)
  } else if (ordenarPor.value === 'Tasa más alta') {
    lista.sort((a, b) => b.tasaCambio - a.tasaCambio)
  } else if (ordenarPor.value === 'Más reciente') {
    lista.sort((a, b) => b.id - a.id)
  }

  return lista
})

function limpiarFiltros() {
  filtroTipo.value = 'Todas'
  filtroOrigen.value = null
  filtroDestino.value = null
  ordenarPor.value = 'Mejor tasa'
}

const dialogoAbierto = ref(false)
const ofertaSeleccionada = ref(null)
const montoTrato = ref(0)
const iniciando = ref(false)
const errorDialogo = ref('')

function abrirDialogoTrato(oferta) {
  ofertaSeleccionada.value = oferta
  montoTrato.value = oferta.montoMinimo
  errorDialogo.value = ''
  dialogoAbierto.value = true
}

async function confirmarTrato() {
  errorDialogo.value = ''
  const oferta = ofertaSeleccionada.value
  if (
    !montoTrato.value ||
    montoTrato.value < oferta.montoMinimo ||
    montoTrato.value > oferta.montoMaximo
  ) {
    errorDialogo.value = `El monto debe estar entre ${oferta.montoMinimo} y ${oferta.montoMaximo}.`
    return
  }

  iniciando.value = true
  try {
    const res = await api.post('/operacion/iniciar-trato', {
      ofertaId: oferta.id,
      monto: montoTrato.value,
    })
    dialogoAbierto.value = false
    router.push('/operacion/' + res.data.id)
  } catch (e) {
    errorDialogo.value = e.response?.data?.mensaje || 'No se pudo iniciar el trato.'
  } finally {
    iniciando.value = false
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.market-page {
  background: #0d1117;
  min-height: 100vh;
}
.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}
.oferta-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  transition: border 0.2s;
}
.oferta-card:hover {
  border: 1px solid #f2c037;
}
.tasa-box {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
}
</style>