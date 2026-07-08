<template>
  <q-page class="market-page q-pa-lg">
    <div class="row items-start justify-between q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h5 text-weight-bold text-white">Marketplace</div>
        <div class="text-grey-5">
          Explora las ofertas disponibles y revisa la reputación antes de iniciar un trato.
        </div>
      </div>

      <div class="col-12 col-md-auto">
        <q-btn
          outline
          color="amber"
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          @click="cargarDatos"
        />
      </div>
    </div>

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

    <div class="row items-center justify-between q-mb-md">
      <div class="text-grey-5">{{ ofertasFiltradas.length }} oferta(s) encontrada(s)</div>

      <div v-if="cargandoReputaciones" class="text-grey-5 text-caption row items-center">
        <q-spinner color="amber" size="16px" class="q-mr-xs" />
        Cargando reputación...
      </div>
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="42px" />
      <div class="text-grey-5 q-mt-sm">Cargando ofertas...</div>
    </div>

    <q-card v-else-if="ofertasFiltradas.length === 0" class="panel q-pa-xl text-center">
      <q-icon name="storefront" size="54px" color="grey-6" />
      <div class="text-white text-h6 q-mt-md">No hay ofertas disponibles</div>
      <div class="text-grey-5 q-mt-xs">Prueba con otros filtros o vuelve a actualizar.</div>
    </q-card>

    <div v-else class="row q-col-gutter-md">
      <div v-for="oferta in ofertasFiltradas" :key="oferta.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="oferta-card q-pa-md">
          <div class="row items-start no-wrap q-mb-md">
            <q-avatar color="amber" text-color="black" size="46px" class="shadow-2">
              {{ inicialVendedor(oferta) }}
            </q-avatar>

            <div class="q-ml-md col">
              <div class="text-white text-weight-bold text-subtitle1 ellipsis">
                {{ nombreVendedor(oferta) }}
              </div>

              <div class="row items-center q-gutter-xs q-mt-xs">
                <template v-if="reputacionDeOferta(oferta)?.cantidadCalificaciones > 0">
                  <q-rating
                    :model-value="Number(reputacionDeOferta(oferta).calificacionPromedio)"
                    readonly
                    size="15px"
                    color="amber"
                  />
                  <span class="text-amber text-caption text-weight-bold">
                    {{ formatearDecimal(reputacionDeOferta(oferta).calificacionPromedio, 1) }}
                  </span>
                  <span class="text-grey-5 text-caption">
                    ({{ reputacionDeOferta(oferta).cantidadCalificaciones }})
                  </span>
                </template>

                <template v-else>
                  <q-icon name="star_border" size="15px" color="grey-6" />
                  <span class="text-grey-5 text-caption">Sin calificación</span>
                </template>
              </div>
            </div>

<div class="text-amber text-caption row items-center">
  <q-icon name="star" size="14px" class="q-mr-xs" />

  <template v-if="Number(oferta.calificacionPromedio) > 0">
    <span class="text-weight-bold">
      {{ Number(oferta.calificacionPromedio).toFixed(1) }}
    </span>

    <span class="text-grey-5 q-ml-xs">
      ({{ oferta.cantidadCalificaciones || 0 }})
    </span>
  </template>

  <span v-else class="text-grey-5">
    Sin calificación
  </span>
</div>
</div>

<q-space />

<q-btn
  flat
  round
  dense
  icon="visibility"
  color="grey-5"
  size="sm"
  @click="abrirPerfil(oferta)"
>
  <q-tooltip>Ver información del vendedor</q-tooltip>
</q-btn>

<q-badge
  :color="oferta.tipoOperacion === 'Venta' ? 'green' : 'deep-orange'"
  class="q-pa-sm"
>
  {{ oferta.tipoOperacion }}
</q-badge>
</div>

          <div class="row items-center justify-between q-mb-md">
            <q-badge
              :color="oferta.tipoOperacion === 'Venta' ? 'green' : 'deep-orange'"
              class="q-pa-sm"
            >
              {{ oferta.tipoOperacion }}
            </q-badge>

            <q-badge :color="oferta.estado === 'Activa' ? 'positive' : 'blue-grey'" class="q-pa-sm">
              {{ oferta.estado }}
            </q-badge>
          </div>

          <div class="tasa-box q-pa-md q-mb-md text-center">
            <div class="text-grey-5 text-caption">Tipo de cambio</div>
            <div class="text-h5 text-amber text-weight-bold">
              {{ formatearDecimal(oferta.tasaCambio, 4) }}
            </div>
            <div class="text-caption text-grey-5">
              {{ oferta.monedaOrigenNombre }} → {{ oferta.monedaDestinoNombre }}
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-4">
              <div class="mini-stat q-pa-sm text-center">
                <div class="text-caption text-grey-5">Éxito</div>
                <div class="text-white text-weight-bold">
                  {{ textoTasaExito(reputacionDeOferta(oferta)) }}
                </div>
              </div>
            </div>

            <div class="col-4">
              <div class="mini-stat q-pa-sm text-center">
                <div class="text-caption text-grey-5">Promedio</div>
                <div class="text-white text-weight-bold">
                  {{ textoTiempoPromedio(reputacionDeOferta(oferta)) }}
                </div>
              </div>
            </div>

            <div class="col-4">
              <div class="mini-stat q-pa-sm text-center">
                <div class="text-caption text-grey-5">Completadas</div>
                <div class="text-white text-weight-bold">
                  {{ reputacionDeOferta(oferta)?.operacionesCompletadas ?? '—' }}
                </div>
              </div>
            </div>
          </div>

          <div class="row justify-between text-grey-4 q-mb-xs">
            <span>Disponible:</span>
            <span class="text-white text-weight-bold text-right">
              {{ formatearMonto(oferta.montoDisponible) }} {{ oferta.monedaOrigenNombre }}
            </span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-xs">
            <span>Límites:</span>
            <span class="text-white text-right">
              {{ formatearMonto(oferta.montoMinimo) }} - {{ formatearMonto(oferta.montoMaximo) }}
            </span>
          </div>

          <div class="text-grey-5 text-caption q-mt-md q-mb-xs">Métodos aceptados</div>

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
            rounded
            class="bg-blue-grey-10 text-grey-4 q-mb-sm"
          >
            Esta oferta fue publicada por ti. No puedes iniciar trato contigo mismo.
          </q-banner>

          <q-btn
            v-if="!esMiOferta(oferta)"
            label="Iniciar trato"
            color="amber"
            text-color="black"
            class="full-width text-weight-bold"
            :disable="!puedeIniciarTrato(oferta)"
            @click="iniciarTrato(oferta)"
          >
            <q-tooltip v-if="!auth.puedeOperar">
              Debes verificar tu cuenta antes de iniciar un trato.
            </q-tooltip>
            <q-tooltip v-else-if="oferta.estado !== 'Activa'">
              Esta oferta ya no está activa.
            </q-tooltip>
            <q-tooltip v-else-if="!obtenerMetodosOferta(oferta).length">
              Esta oferta no tiene métodos de pago publicados.
            </q-tooltip>
          </q-btn>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="mostrarPerfil" transition-show="scale" transition-hide="scale">
      <q-card class="perfil-card" style="width: 820px; max-width: 95vw">
        <q-card-section class="row items-center q-pa-lg">
          <q-avatar size="72px" color="amber" text-color="black" class="shadow-2">
            {{ vendedorSeleccionado ? inicialVendedor(vendedorSeleccionado) : 'V' }}
          </q-avatar>

          <div class="q-ml-md col">
            <div class="text-h5 text-weight-bold text-white">
              {{ vendedorSeleccionado ? nombreVendedor(vendedorSeleccionado) : 'Vendedor' }}
            </div>

            <div class="row items-center q-gutter-sm q-mt-xs">
              <q-badge color="positive" rounded label="Cuenta verificada" />
              <q-badge v-if="vendedorSeleccionado" color="blue-grey-8" rounded>
                Vendedor #{{ vendedorSeleccionado.usuarioId }}
              </q-badge>
            </div>

            <div class="row items-center q-gutter-xs q-mt-sm">
              <template v-if="reputacionVendedor?.cantidadCalificaciones > 0">
                <q-rating
                  :model-value="Number(reputacionVendedor.calificacionPromedio)"
                  readonly
                  size="18px"
                  color="amber"
                />
                <span class="text-amber text-weight-bold">
                  {{ formatearDecimal(reputacionVendedor.calificacionPromedio, 1) }}
                </span>
                <span class="text-grey-5">
                  ({{ reputacionVendedor.cantidadCalificaciones }}
                  {{
                    reputacionVendedor.cantidadCalificaciones === 1
                      ? 'calificación'
                      : 'calificaciones'
                  }})
                </span>
              </template>

              <template v-else>
                <q-icon name="star_border" color="grey-6" size="18px" />
                <span class="text-grey-5">Sin calificación pública</span>
              </template>
            </div>
          </div>
        </q-card-section>

        <q-separator dark />

        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
            <q-icon name="analytics" color="amber" class="q-mr-sm" />
            Reputación y desempeño
          </div>

          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-3">
              <q-card flat bordered class="info-card">
                <q-card-section class="text-center">
                  <q-icon name="check_circle" color="positive" size="24px" />
                  <div class="text-caption text-grey-5 q-mt-xs">Operaciones completadas</div>
                  <div class="text-white text-weight-bold text-h6">
                    {{ reputacionVendedor?.operacionesCompletadas ?? '—' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-3">
              <q-card flat bordered class="info-card">
                <q-card-section class="text-center">
                  <q-icon name="verified" color="amber" size="24px" />
                  <div class="text-caption text-grey-5 q-mt-xs">Tasa de éxito</div>
                  <div class="text-white text-weight-bold text-h6">
                    {{ textoTasaExito(reputacionVendedor) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-3">
              <q-card flat bordered class="info-card">
                <q-card-section class="text-center">
                  <q-icon name="schedule" color="amber" size="24px" />
                  <div class="text-caption text-grey-5 q-mt-xs">Tiempo promedio</div>
                  <div class="text-white text-weight-bold text-h6">
                    {{ textoTiempoPromedio(reputacionVendedor) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-3">
              <q-card flat bordered class="info-card">
                <q-card-section class="text-center">
                  <q-icon name="reviews" color="amber" size="24px" />
                  <div class="text-caption text-grey-5 q-mt-xs">Calificaciones</div>
                  <div class="text-white text-weight-bold text-h6">
                    {{ reputacionVendedor?.cantidadCalificaciones ?? '—' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
            <q-icon name="account_balance_wallet" color="amber" class="q-mr-sm" />
            Métodos de pago
          </div>

          <div v-if="obtenerMetodosOferta(vendedorSeleccionado).length" class="q-gutter-xs q-mb-lg">
            <q-badge
              v-for="metodo in obtenerMetodosOferta(vendedorSeleccionado)"
              :key="metodo.id || metodo.metodoPagoId || nombreMetodoOferta(metodo)"
              color="blue-grey-8"
              text-color="white"
              class="q-pa-sm"
            >
              {{ nombreMetodoOferta(metodo) }}
            </q-badge>
          </div>

          <div v-else class="text-grey-5 q-mb-lg">Esta oferta no tiene métodos publicados.</div>

          <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
            <q-icon name="receipt_long" color="amber" class="q-mr-sm" />
            Resumen de la oferta
          </div>

          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-md-4">
              <q-card flat bordered class="info-card">
                <q-card-section class="text-center">
                  <div class="text-caption text-grey-5">Tipo de cambio</div>
                  <div class="text-weight-bold text-amber text-h6">
                    {{ formatearDecimal(vendedorSeleccionado?.tasaCambio, 4) }}
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">
                    {{ vendedorSeleccionado?.monedaOrigenNombre }} →
                    {{ vendedorSeleccionado?.monedaDestinoNombre }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card flat bordered class="info-card">
                <q-card-section class="text-center">
                  <div class="text-caption text-grey-5">Disponible</div>
                  <div class="text-weight-bold text-white text-h6">
                    {{ formatearMonto(vendedorSeleccionado?.montoDisponible) }}
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">
                    {{ vendedorSeleccionado?.monedaOrigenNombre }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card flat bordered class="info-card">
                <q-card-section class="text-center">
                  <div class="text-caption text-grey-5">Límites</div>
                  <div class="text-white text-weight-bold">
                    {{ formatearMonto(vendedorSeleccionado?.montoMinimo) }} -
                    {{ formatearMonto(vendedorSeleccionado?.montoMaximo) }}
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">
                    {{ vendedorSeleccionado?.monedaOrigenNombre }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
            <q-icon name="star" color="amber" class="q-mr-sm" />
            Comentarios recientes
          </div>

          <q-banner dense rounded class="bg-blue-grey-10 text-grey-3 q-mb-lg">
            <template v-if="comentariosVisibles.length">
              <div
                v-for="(comentario, index) in comentariosVisibles"
                :key="index"
                class="comentario-item q-mb-sm"
              >
                <q-icon name="format_quote" color="amber" size="16px" class="q-mr-xs" />
                {{ comentario }}
              </div>
            </template>

            <template v-else> Este vendedor aún no cuenta con comentarios públicos. </template>
          </q-banner>

          <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
            <q-icon name="verified_user" color="green" class="q-mr-sm" />
            Seguridad
          </div>

          <q-banner rounded class="bg-grey-10 text-grey-3">
            Todas las operaciones iniciadas desde el Marketplace se realizan dentro de CambioSeguro
            P2P. Revisa cuidadosamente el tipo de cambio, los límites y el método de pago antes de
            iniciar un trato.
          </q-banner>
        </q-card-section>

        <q-card-actions class="q-pa-md">
          <q-btn flat color="grey-5" label="Cerrar" v-close-popup />
          <q-space />
          <q-btn
            color="amber"
            text-color="black"
            label="Iniciar trato"
            :disable="
              !vendedorSeleccionado ||
              esMiOferta(vendedorSeleccionado) ||
              !puedeIniciarTrato(vendedorSeleccionado)
            "
            @click="iniciarTratoDesdePerfil"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const auth = useAuthStore()

const ofertas = ref([])
const monedas = ref([])
const cargando = ref(true)
const cargandoReputaciones = ref(false)

const mostrarPerfil = ref(false)
const vendedorSeleccionado = ref(null)
const reputacionVendedor = ref(null)
const reputacionesPorUsuario = ref({})

const filtroTipo = ref('Todas')
const filtroOrigen = ref(null)
const filtroDestino = ref(null)
const ordenarPor = ref('Mejor tasa')

const opcionesMoneda = computed(() => [
  { label: 'Todas', value: null },
  ...monedas.value.map((m) => ({ label: `${m.codigo} - ${m.nombre}`, value: m.id })),
])

const ofertasFiltradas = computed(() => {
  let lista = [...ofertas.value]

  if (filtroTipo.value !== 'Todas') {
    lista = lista.filter((o) => o.tipoOperacion === filtroTipo.value)
  }

  if (filtroOrigen.value !== null) {
    lista = lista.filter((o) => Number(o.monedaOrigenId) === Number(filtroOrigen.value))
  }

  if (filtroDestino.value !== null) {
    lista = lista.filter((o) => Number(o.monedaDestinoId) === Number(filtroDestino.value))
  }

  if (ordenarPor.value === 'Mejor tasa') {
    lista.sort((a, b) => Number(a.tasaCambio) - Number(b.tasaCambio))
  } else if (ordenarPor.value === 'Tasa más alta') {
    lista.sort((a, b) => Number(b.tasaCambio) - Number(a.tasaCambio))
  } else if (ordenarPor.value === 'Más reciente') {
    lista.sort((a, b) => Number(b.id) - Number(a.id))
  }

  return lista
})

const comentariosVisibles = computed(() => {
  if (!Array.isArray(reputacionVendedor.value?.comentarios)) return []
  return reputacionVendedor.value.comentarios.filter((c) => String(c || '').trim().length > 0)
})

async function cargarDatos() {
  cargando.value = true

  try {
    const [resOfertas, resMonedas] = await Promise.all([api.get('/oferta'), api.get('/moneda')])
    ofertas.value = Array.isArray(resOfertas.data) ? resOfertas.data : []
    monedas.value = Array.isArray(resMonedas.data) ? resMonedas.data : []

    await cargarReputacionesDeOfertas()
  } catch (e) {
    console.error('Error al cargar datos:', e)
    ofertas.value = []
    monedas.value = []
  } finally {
    cargando.value = false
  }
}

async function cargarReputacionesDeOfertas() {
  const ids = [...new Set(ofertas.value.map((o) => Number(o.usuarioId)).filter(Boolean))]

  if (!ids.length) {
    reputacionesPorUsuario.value = {}
    return
  }

  cargandoReputaciones.value = true

  try {
    const resultados = await Promise.allSettled(
      ids.map((id) => api.get(`/usuario/${id}/reputacion`).then((res) => [id, res.data])),
    )

    const mapa = {}

    resultados.forEach((resultado) => {
      if (resultado.status === 'fulfilled') {
        const [id, reputacion] = resultado.value
        mapa[id] = reputacion
      }
    })

    reputacionesPorUsuario.value = mapa
  } finally {
    cargandoReputaciones.value = false
  }
}

async function abrirPerfil(oferta) {
  vendedorSeleccionado.value = oferta
  reputacionVendedor.value = reputacionDeOferta(oferta)
  mostrarPerfil.value = true

  try {
    const res = await api.get(`/usuario/${oferta.usuarioId}/reputacion`)
    reputacionVendedor.value = res.data
    reputacionesPorUsuario.value = {
      ...reputacionesPorUsuario.value,
      [Number(oferta.usuarioId)]: res.data,
    }
  } catch (error) {
    console.error('Error obteniendo reputación:', error)
  }
}

function limpiarFiltros() {
  filtroTipo.value = 'Todas'
  filtroOrigen.value = null
  filtroDestino.value = null
  ordenarPor.value = 'Mejor tasa'
}

function reputacionDeOferta(oferta) {
  if (!oferta) return null
  return reputacionesPorUsuario.value[Number(oferta.usuarioId)] || null
}

function nombreVendedor(oferta) {
  return oferta?.nombreVendedor || `Vendedor #${oferta?.usuarioId || '—'}`
}

function inicialVendedor(oferta) {
  return nombreVendedor(oferta).charAt(0).toUpperCase() || 'V'
}

function esMiOferta(oferta) {
  return Number(oferta?.usuarioId) === Number(auth.usuario?.id)
}

function puedeIniciarTrato(oferta) {
  return (
    auth.puedeOperar &&
    oferta?.estado === 'Activa' &&
    !esMiOferta(oferta) &&
    obtenerMetodosOferta(oferta).length > 0
  )
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
  if (!puedeIniciarTrato(oferta)) return
  router.push('/operacion?oferta=' + oferta.id)
}

function iniciarTratoDesdePerfil() {
  if (!vendedorSeleccionado.value) return
  mostrarPerfil.value = false
  iniciarTrato(vendedorSeleccionado.value)
}

function formatearMonto(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor))
}

function formatearDecimal(valor, decimales = 2) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Number(valor))
}

function textoTasaExito(reputacion) {
  if (!reputacion) return '—'

  const tieneOperaciones =
    Number(reputacion.operacionesFinalizadas ?? reputacion.operacionesCompletadas ?? 0) > 0

  if (!tieneOperaciones) return 'Sin datos'
  return `${formatearDecimal(reputacion.tasaExito, 1)}%`
}

function textoTiempoPromedio(reputacion) {
  if (!reputacion) return '—'

  const minutos = Number(
    reputacion.tiempoPromedioOperacionMinutos ?? reputacion.tiempoPromedioMinutos ?? 0,
  )

  if (!minutos || minutos <= 0) return 'Sin datos'
  if (minutos < 1) return '< 1 min'
  if (minutos < 60) return `${Math.round(minutos)} min`

  const horas = Math.floor(minutos / 60)
  const resto = Math.round(minutos % 60)

  return resto > 0 ? `${horas} h ${resto} min` : `${horas} h`
}

onMounted(cargarDatos)
</script>

<style scoped>
.market-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel,
.oferta-card,
.perfil-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}

.oferta-card {
  transition:
    border 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}

.oferta-card:hover {
  border-color: #f2c037;
  transform: translateY(-4px);
  box-shadow: 0 8px 22px rgba(242, 192, 55, 0.18);
}

.tasa-box,
.info-card,
.mini-stat {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 12px;
}

.info-card {
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.info-card:hover {
  border-color: #f2c037;
  transform: translateY(-2px);
}

.comentario-item:last-child {
  margin-bottom: 0;
}
</style>
