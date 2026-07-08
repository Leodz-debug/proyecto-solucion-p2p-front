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
  <q-avatar color="amber" text-color="black" size="42px">
    {{ (oferta.nombreVendedor || 'V').charAt(0).toUpperCase() }}
  </q-avatar>

  <div class="q-ml-md">
    <div class="text-white text-weight-bold text-subtitle1">
      {{ oferta.nombreVendedor || `Vendedor #${oferta.usuarioId}` }}
    </div>

<div class="text-amber text-caption row items-center">

  <q-icon
    name="star"
    size="14px"
    class="q-mr-xs"
  />

  <template v-if="oferta.calificacionPromedio > 0">

    <span class="text-weight-bold">

      {{ oferta.calificacionPromedio }}

    </span>

    <span class="text-grey-5 q-ml-xs">

      ({{ oferta.cantidadCalificaciones }})

    </span>

  </template>

  <span v-else>

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
    color="grey-7"
    size="sm"
    @click="abrirPerfil(oferta)"
  >
    <q-tooltip>
      Ver información del vendedor
    </q-tooltip>
  </q-btn>

  <q-badge
    :color="oferta.tipoOperacion === 'Venta' ? 'green' : 'deep-orange'"
    class="q-pa-sm"
  >
    {{ oferta.tipoOperacion }}
  </q-badge>
</div>

          <div class="tasa-box q-pa-md q-mb-md text-center">

            <div class="text-grey-5 text-caption">
              Tipo de cambio
            </div>

            <div class="text-h5 text-amber text-weight-bold">
              {{ oferta.tasaCambio }}
            </div>

            <div class="text-caption text-grey-5">
              {{ oferta.monedaOrigenNombre }}
              →
              {{ oferta.monedaDestinoNombre }}
            </div>

          </div>

          <div class="row justify-between text-grey-4 q-mb-xs">
            <span>Disponible:</span>

            <span class="text-white text-weight-bold">
                {{ oferta.montoDisponible ?? '—' }}
                {{ oferta.monedaOrigenNombre }}
            </span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-xs">
      <span>Límites:</span>

  <div class="text-right">
    <div class="text-white">
      Min: {{ oferta.montoMinimo }}
    </div>

    <div class="text-white">
      Máx: {{ oferta.montoMaximo }}
    </div>
  </div>
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

    <!-- Modal Perfil del Vendedor -->

<q-dialog
  v-model="mostrarPerfil"
  transition-show="scale"
  transition-hide="scale"
>

<q-card
  class="perfil-card"
  style="width: 760px; max-width: 95vw;"
>

  <q-card-section class="row items-center q-pa-lg">

    <q-avatar
      size="72px"
      color="amber"
      text-color="black"
      class="shadow-2"
    >
      {{ vendedorSeleccionado?.nombreVendedor?.charAt(0).toUpperCase() || 'V' }}
    </q-avatar>

    <div class="q-ml-md">

      <div class="text-h5 text-weight-bold text-white">
        {{ vendedorSeleccionado?.nombreVendedor }}
      </div>

      <div class="row items-center q-gutter-sm q-mt-xs">

        <q-badge
          color="positive"
          rounded
          label="Cuenta verificada"
        />



      </div>

      <div class="row items-center q-mt-sm">

  <div class="row items-center q-mt-sm">


    
<span class="text-amber q-ml-sm">

  <template v-if="reputacionVendedor">

<div class="row items-center q-gutter-xs">

  <q-rating
    :model-value="reputacionVendedor.calificacionPromedio"
    readonly
    size="18px"
    color="amber"
  />

  <span class="text-amber text-weight-bold">

    {{ reputacionVendedor.calificacionPromedio }}

  </span>

  <span class="text-grey-5">

    ({{ reputacionVendedor.cantidadCalificaciones }}
    {{ reputacionVendedor.cantidadCalificaciones === 1 ? 'calificación' : 'calificaciones' }})

  </span>

</div>

  </template>

  <template v-else>

    Sin calificación

  </template>

</span>

  </div>

      </div>

    </div>

  </q-card-section>

  <q-separator dark />

<q-card-section>

  <!-- Información -->

  <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
    <q-icon name="info" color="amber" class="q-mr-sm"/>
    Información
  </div>

  <div class="row q-col-gutter-md q-mb-lg">

    <div class="col-12 col-sm-4">

      <q-card flat bordered class="info-card">

        <q-card-section class="text-center">

          <div class="text-caption text-grey-5">
            Operaciones
          </div>

          <div class="text-grey">
            {{ reputacionVendedor?.operacionesCompletadas ?? "No disponible" }}
          </div>

        </q-card-section>

      </q-card>

    </div>

    <div class="col-12 col-sm-4">

      <q-card flat bordered class="info-card">

        <q-card-section class="text-center">

          <div class="text-caption text-grey-5">
            Tasa de éxito
          </div>

          <div class="text-grey">
            {{
            reputacionVendedor
              ? reputacionVendedor.tasaExito + "%"
              : "No disponible"
          }}
          </div>

        </q-card-section>

      </q-card>

    </div>

    <div class="col-12 col-sm-4">

      <q-card flat bordered class="info-card">

        <q-card-section class="text-center">

          <div class="text-caption text-grey-5">
            Tiempo respuesta
          </div>

          <div class="text-grey">
            No disponible
          </div>

        </q-card-section>

      </q-card>

    </div>

  </div>

  <!-- Métodos -->

  <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
    <q-icon name="account_balance_wallet" color="amber" class="q-mr-sm"/>
    Métodos de pago
  </div>

  <div class="q-gutter-xs q-mb-lg">

    <q-badge
      v-for="metodo in obtenerMetodosOferta(vendedorSeleccionado)"
      :key="nombreMetodoOferta(metodo)"
      color="blue-grey-8"
      text-color="white"
    >
      {{ nombreMetodoOferta(metodo) }}
    </q-badge>

  </div>

  <!-- Cambio -->

  <div class="text-subtitle1 text-weight-bold text-white q-mb-md">

    <q-icon name="currency_exchange" color="amber" class="q-mr-sm"/>

    Cambio disponible
      <div class="row items-center q-mb-lg">

    <q-badge color="amber" text-color="black">

      {{ vendedorSeleccionado?.monedaOrigenNombre }}

    </q-badge>

    <q-icon
      name="arrow_forward"
      color="grey-5"
      class="q-mx-sm"
    />

    <q-badge color="amber" text-color="black">

      {{ vendedorSeleccionado?.monedaDestinoNombre }}

    </q-badge>

  </div>
    <!-- Resumen de la oferta -->

<div class="text-subtitle1 text-weight-bold text-white q-mb-md">

  <q-icon
    name="receipt_long"
    color="amber"
    class="q-mr-sm"
  />

  Resumen de la oferta

</div>

<div class="row q-col-gutter-md q-mb-lg">



  <div class="col-12 col-md-4">

    <q-card flat bordered class="info-card">

      <q-card-section class="text-center">

        <div class="text-caption text-grey-5">

          Tipo de cambio

        </div>

        <div class="text-weight-bold text-amber">

          {{ vendedorSeleccionado?.tasaCambio }}

        </div>

      </q-card-section>

    </q-card>

  </div>

  <div class="col-12 col-md-4">

    <q-card flat bordered class="info-card">

      <q-card-section class="text-center">

        <div class="text-caption text-grey-5">

          Disponible

        </div>

        <div class="text-weight-bold text-white">

          {{ vendedorSeleccionado?.montoDisponible }}

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

        <div class="text-caption text-grey-5">

          Límites

        </div>

        <div class="text-white">

          {{ vendedorSeleccionado?.montoMinimo }}

          -

          {{ vendedorSeleccionado?.montoMaximo }}

        </div>

        <div class="text-caption text-grey-5 q-mt-xs">

          {{ vendedorSeleccionado?.monedaOrigenNombre }}

        </div>

      </q-card-section>

    </q-card>

  </div>

</div>

  </div>



  <!-- Calificaciones -->

  <div class="text-subtitle1 text-weight-bold text-white q-mb-md">

    <q-icon name="star" color="amber" class="q-mr-sm"/>

    Calificaciones

  </div>

  <q-banner
    dense
    rounded
    class="bg-blue-grey-9 text-grey-3 q-mb-lg"
  >

    <q-banner
  dense
  rounded
  class="bg-blue-grey-9 text-grey-3 q-mb-lg"
>

  <template
    v-if="
      reputacionVendedor &&
      reputacionVendedor.comentarios.length
    "
  >

    <div
      v-for="(comentario,index) in reputacionVendedor.comentarios"
      :key="index"
      class="q-mb-sm"
    >

      ⭐ {{ comentario }}

    </div>

  </template>

  <template v-else>

    Este vendedor aún no cuenta con calificaciones públicas.

  </template>

</q-banner>

  </q-banner>

  <!-- Seguridad -->

  <div class="text-subtitle1 text-weight-bold text-white q-mb-md">

    <q-icon
      name="verified_user"
      color="green"
      class="q-mr-sm"
    />

    Seguridad

  </div>

  <q-banner
    rounded
    class="bg-grey-10 text-grey-3"
  >

    Todas las operaciones iniciadas desde el Marketplace se realizan
    dentro de CambioSeguro P2P.

    <br><br>

    Revisa cuidadosamente el tipo de cambio,
    los límites y el método de pago antes de iniciar un trato.

  </q-banner>

</q-card-section>

<q-card-actions class="q-pa-md">

  <q-btn
    flat
    color="grey-5"
    label="Cerrar"
    v-close-popup
  />

  <q-space />

  <q-btn
    color="amber"
    text-color="black"
    label="Iniciar trato"
    @click="
      mostrarPerfil = false;
      iniciarTrato(vendedorSeleccionado)
    "
  />

</q-card-actions>

</q-card>

    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const abrirPerfil = async (oferta) => {

  vendedorSeleccionado.value = oferta

  reputacionVendedor.value = null

  try {

    const res = await api.get(`/usuario/${oferta.usuarioId}/reputacion`)

    reputacionVendedor.value = res.data

  } catch (error) {

    console.error("Error obteniendo reputación:", error)

  }

  mostrarPerfil.value = true

}

const router = useRouter()
const auth = useAuthStore()

const ofertas = ref([])
const monedas = ref([])
const cargando = ref(true)

// Dialog del perfil
const mostrarPerfil = ref(false)
const vendedorSeleccionado = ref(null)
const reputacionVendedor = ref(null)

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
const [resOfertas, resMonedas] = await Promise.all([
  api.get('/oferta'),
  api.get('/moneda')
])

const ofertasConReputacion = await Promise.all(

  resOfertas.data.map(async (oferta) => {

    try {

      const res = await api.get(`/usuario/${oferta.usuarioId}/reputacion`)

      return {

        ...oferta,

        calificacionPromedio: res.data.calificacionPromedio,

        cantidadCalificaciones: res.data.cantidadCalificaciones

      }

    } catch {

      return {

        ...oferta,

        calificacionPromedio: 0,

        cantidadCalificaciones: 0

      }

    }

  })

)

ofertas.value = ofertasConReputacion

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

.info-card{
  background:#0d1117;
  border:1px solid #30363d;
  border-radius:12px;
}

.market-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 16px;
  box-shadow:0 4px 18px rgba(0,0,0,.35);
}

.oferta-card {
  transition:.25s;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 16px;
  transition: border 0.2s;
  box-shadow:0 4px 18px rgba(0,0,0,.35);
}

.oferta-card:hover {
  border: 1px solid #f2c037;
  transform: translateY(-4px);

box-shadow:0 8px 22px rgba(242,192,55,.18);
}

.tasa-box {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
}

.perfil-card{
  background:#161b22;
  border:1px solid #30363d;
  border-radius:18px;
  box-shadow:0 8px 30px rgba(0,0,0,.45);
}

.info-card{
  background:#0d1117;
  border:1px solid #30363d;
  border-radius:12px;
  transition:.2s;
}

.info-card:hover{

  border-color:#f2c037;

  transform:translateY(-2px);

}
</style>