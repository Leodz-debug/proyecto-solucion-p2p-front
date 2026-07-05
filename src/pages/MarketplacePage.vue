<template>
  <q-page class="market-page q-pa-lg">
    <div class="text-h5 text-weight-bold text-white">Marketplace</div>
    <div class="text-grey-5 q-mb-lg">Explora las ofertas disponibles y elige la mejor para ti</div>

    <q-card class="panel q-pa-md q-mb-lg">
      <div class="row q-col-gutter-md items-end">
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

    <div class="text-grey-5 q-mb-md">{{ ofertasFiltradas.length }} oferta(s) encontrada(s)</div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="40px" />
      <div class="text-grey-5 q-mt-sm">Cargando ofertas...</div>
    </div>

    <q-card v-else-if="ofertasFiltradas.length === 0" class="panel q-pa-xl text-center">
      <q-icon name="storefront" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-md">No hay ofertas que coincidan con los filtros.</div>
    </q-card>

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
            <span>Disponible:</span>
            <span class="text-white">{{ oferta.montoDisponible ?? '—' }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-xs">
            <span>Límites:</span>
            <span class="text-white">{{ oferta.montoMinimo }} - {{ oferta.montoMaximo }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-md">
            <span>Estado:</span>
            <span class="text-white">{{ oferta.estado }}</span>
          </div>

          <div class="text-grey-5 text-caption q-mb-xs">Métodos aceptados</div>

          <div v-if="obtenerMetodosOferta(oferta).length" class="q-gutter-xs q-mb-md">
            <q-badge
              v-for="metodo in obtenerMetodosOferta(oferta)"
              :key="metodo.id || metodo.metodoPagoId || nombreMetodoOferta(metodo)"
              color="blue-grey-8"
              text-color="white"
              class="q-pa-xs"
            >
              {{ nombreMetodoOferta(metodo) }}
            </q-badge>
          </div>

          <div v-else class="text-grey-6 text-caption q-mb-md">
            Esta oferta no tiene métodos publicados.
          </div>

          <q-banner
            v-if="esMiOferta(oferta)"
            dense
            class="bg-blue-grey-10 text-grey-4 rounded-borders"
          >
            Esta oferta fue publicada por ti. No puedes iniciar trato contigo mismo.
          </q-banner>

          <q-btn
            v-else
            label="Iniciar trato"
            color="amber"
            text-color="black"
            class="full-width text-weight-bold"
            :disable="
              !auth.puedeOperar ||
              oferta.estado !== 'Activa' ||
              !obtenerMetodosOferta(oferta).length
            "
            @click="iniciarTrato(oferta)"
          >
            <q-tooltip v-if="!auth.puedeOperar">
              Debes verificar tu cuenta antes de iniciar un trato.
            </q-tooltip>
          </q-btn>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const auth = useAuthStore()

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

function limpiarFiltros() {
  filtroTipo.value = 'Todas'
  filtroOrigen.value = null
  filtroDestino.value = null
  ordenarPor.value = 'Mejor tasa'
}

function esMiOferta(oferta) {
  return Number(oferta?.usuarioId) === Number(auth.usuario?.id)
}

function obtenerMetodosOferta(oferta) {
  if (!oferta) return []

  if (Array.isArray(oferta.metodosPago) && oferta.metodosPago.length > 0) {
    return oferta.metodosPago
  }

  if (oferta.metodoPago) {
    return [
      {
        id: null,
        metodoPagoId: null,
        metodoPagoNombre: oferta.metodoPago,
      },
    ]
  }

  return []
}

function nombreMetodoOferta(metodo) {
  return (
    metodo?.metodoPagoNombre || metodo?.nombre || metodo?.metodoPago?.nombre || 'Método de pago'
  )
}

function iniciarTrato(oferta) {
  router.push('/operacion?oferta=' + oferta.id)
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
