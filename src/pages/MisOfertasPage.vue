<template>
  <q-page class="mis-ofertas-page q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-white">Mis ofertas</div>
        <div class="text-grey-5">Revisa las ofertas que publicaste y su estado actual.</div>
      </div>

      <q-btn
        color="amber"
        text-color="black"
        icon="add"
        label="Publicar nueva"
        class="text-weight-bold"
        @click="$router.push('/publicar')"
      />
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="summary-card q-pa-md text-center">
          <q-icon name="storefront" color="amber" size="34px" />
          <div class="text-h5 text-white text-weight-bold q-mt-sm">
            {{ misOfertas.length }}
          </div>
          <div class="text-grey-5">Total publicadas</div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="summary-card q-pa-md text-center">
          <q-icon name="check_circle" color="green" size="34px" />
          <div class="text-h5 text-white text-weight-bold q-mt-sm">
            {{ totalActivas }}
          </div>
          <div class="text-grey-5">Activas</div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="summary-card q-pa-md text-center">
          <q-icon name="schedule" color="orange" size="34px" />
          <div class="text-h5 text-white text-weight-bold q-mt-sm">
            {{ totalReservadas }}
          </div>
          <div class="text-grey-5">Reservadas</div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="summary-card q-pa-md text-center">
          <q-icon name="paid" color="blue" size="34px" />
          <div class="text-h5 text-white text-weight-bold q-mt-sm">
            {{ montoTotalDisponible }}
          </div>
          <div class="text-grey-5">Disponible total</div>
        </q-card>
      </div>
    </div>

    <q-card class="panel q-pa-md q-mb-lg">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-4">
          <div class="text-grey-5 text-caption q-mb-xs">Filtrar por estado</div>

          <q-select
            v-model="filtroEstado"
            :options="['Todas', 'Activa', 'Reservada', 'Cerrada', 'Cancelada']"
            dark
            outlined
            dense
            color="amber"
          />
        </div>

        <div class="col-12 col-md-4">
          <div class="text-grey-5 text-caption q-mb-xs">Ordenar por</div>

          <q-select
            v-model="orden"
            :options="['Más recientes', 'Mayor monto', 'Mejor tasa']"
            dark
            outlined
            dense
            color="amber"
          />
        </div>

        <div class="col-12 col-md-4">
          <q-btn
            outline
            color="amber"
            icon="refresh"
            label="Actualizar"
            class="full-width"
            :loading="cargando"
            @click="cargarOfertas"
          />
        </div>
      </div>
    </q-card>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="40px" />
      <div class="text-grey-5 q-mt-sm">Cargando tus ofertas...</div>
    </div>

    <q-card v-else-if="ofertasFiltradas.length === 0" class="panel q-pa-xl text-center">
      <q-icon name="inventory_2" size="52px" color="grey-6" />

      <div class="text-white text-weight-bold q-mt-md">No tienes ofertas en este filtro</div>

      <div class="text-grey-5 q-mt-xs">
        Publica una oferta para que otros usuarios puedan iniciar trato contigo.
      </div>

      <q-btn
        color="amber"
        text-color="black"
        label="Publicar oferta"
        class="q-mt-md text-weight-bold"
        @click="$router.push('/publicar')"
      />
    </q-card>

    <div v-else class="row q-col-gutter-md">
      <div v-for="oferta in ofertasFiltradas" :key="oferta.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="oferta-card q-pa-md">
          <div class="row items-start q-mb-md">
            <q-avatar color="amber" text-color="black" size="42px">
              <q-icon name="currency_exchange" />
            </q-avatar>

            <div class="q-ml-md col">
              <div class="text-white text-weight-bold">Oferta #{{ oferta.id }}</div>

              <div class="text-grey-5 text-caption">
                {{ formatearFecha(oferta.fechaCreacion) }}
              </div>
            </div>

            <q-badge :color="colorEstado(oferta.estado)" text-color="white" class="q-pa-sm">
              {{ oferta.estado }}
            </q-badge>
          </div>

          <div class="tasa-box q-pa-md q-mb-md text-center">
            <div class="text-grey-5 text-caption">Tipo de cambio</div>

            <div class="text-h5 text-amber text-weight-bold">
              {{ oferta.tasaCambio }}
            </div>

            <div class="text-grey-5 text-caption">
              {{ oferta.monedaOrigenNombre }} → {{ oferta.monedaDestinoNombre }}
            </div>
          </div>

          <div class="row justify-between text-grey-4 q-mb-xs">
            <span>Tipo:</span>
            <span class="text-white">{{ oferta.tipoOperacion }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-xs">
            <span>Disponible:</span>
            <span class="text-white">
              {{ oferta.montoDisponible ?? '—' }}
            </span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-md">
            <span>Límites:</span>
            <span class="text-white"> {{ oferta.montoMinimo }} - {{ oferta.montoMaximo }} </span>
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

          <div v-else class="text-grey-6 text-caption q-mb-md">Sin métodos registrados.</div>

          <q-expansion-item
            v-if="obtenerMetodosOferta(oferta).length"
            dark
            dense
            expand-separator
            icon="lock"
            label="Ver datos de recepción"
            class="datos-expansion q-mb-md"
          >
            <div
              v-for="metodo in obtenerMetodosOferta(oferta)"
              :key="'detalle-' + (metodo.id || metodo.metodoPagoId)"
              class="payment-detail q-pa-sm q-mt-sm"
            >
              <div class="text-white text-weight-bold">
                {{ metodo.alias || nombreMetodoOferta(metodo) }}
              </div>

              <div class="text-grey-5 text-caption q-mt-xs">
                Resumen: {{ metodo.resumenPublico || '—' }}
              </div>

              <div class="text-grey-5 text-caption q-mt-xs">
                Datos: {{ metodo.datosRecepcion || '—' }}
              </div>

              <div class="text-grey-5 text-caption q-mt-xs">
                Instrucciones: {{ metodo.instrucciones || '—' }}
              </div>
            </div>
          </q-expansion-item>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn
                outline
                color="amber"
                label="Marketplace"
                class="full-width"
                @click="$router.push('/marketplace')"
              />
            </div>

            <div class="col-6">
              <q-btn
                color="blue"
                label="Operaciones"
                class="full-width"
                @click="$router.push('/operacion')"
              />
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <q-banner v-if="mensaje" dense class="q-mt-md rounded-borders bg-red-9 text-white">
      {{ mensaje }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()

const ofertas = ref([])
const cargando = ref(false)
const mensaje = ref('')

const filtroEstado = ref('Todas')
const orden = ref('Más recientes')

const misOfertas = computed(() =>
  ofertas.value.filter((oferta) => Number(oferta.usuarioId) === Number(auth.usuario?.id)),
)

const totalActivas = computed(
  () => misOfertas.value.filter((oferta) => oferta.estado === 'Activa').length,
)

const totalReservadas = computed(
  () => misOfertas.value.filter((oferta) => oferta.estado === 'Reservada').length,
)

const montoTotalDisponible = computed(() => {
  const total = misOfertas.value.reduce((sum, oferta) => {
    return sum + Number(oferta.montoDisponible || 0)
  }, 0)

  return total.toFixed(2)
})

const ofertasFiltradas = computed(() => {
  let lista = [...misOfertas.value]

  if (filtroEstado.value !== 'Todas') {
    lista = lista.filter((oferta) => oferta.estado === filtroEstado.value)
  }

  if (orden.value === 'Más recientes') {
    lista.sort((a, b) => Number(b.id) - Number(a.id))
  }

  if (orden.value === 'Mayor monto') {
    lista.sort((a, b) => Number(b.montoDisponible || 0) - Number(a.montoDisponible || 0))
  }

  if (orden.value === 'Mejor tasa') {
    lista.sort((a, b) => Number(b.tasaCambio || 0) - Number(a.tasaCambio || 0))
  }

  return lista
})

async function cargarOfertas() {
  cargando.value = true
  mensaje.value = ''

  try {
    const res = await api.get('/oferta')
    ofertas.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Error al cargar mis ofertas:', error)
    mensaje.value = 'No se pudieron cargar tus ofertas.'
  } finally {
    cargando.value = false
  }
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

function colorEstado(estado) {
  if (estado === 'Activa') return 'green-8'
  if (estado === 'Reservada') return 'orange-8'
  if (estado === 'Cerrada') return 'blue-grey-8'
  if (estado === 'Cancelada') return 'red-8'

  return 'grey-8'
}

function formatearFecha(fecha) {
  if (!fecha) return '—'

  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(cargarOfertas)
</script>

<style scoped>
.mis-ofertas-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel,
.summary-card,
.oferta-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}

.oferta-card {
  transition:
    border 0.2s,
    transform 0.2s;
}

.oferta-card:hover {
  border-color: #f2c037;
  transform: translateY(-2px);
}

.tasa-box,
.payment-detail {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
}

.datos-expansion {
  background: #0d1117;
  border-radius: 8px;
}
</style>
