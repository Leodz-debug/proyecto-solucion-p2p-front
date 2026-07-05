<template>
  <q-page class="oper-page q-pa-lg">
    <q-btn
      flat
      no-caps
      color="amber"
      icon="arrow_back"
      :label="modoInicio ? 'Volver al marketplace' : 'Volver'"
      class="q-mb-md q-px-none"
      @click="modoInicio ? $router.push('/marketplace') : $router.back()"
    />
    
<template v-if="modoInicio">
  <div class="text-h5 text-weight-bold text-white q-mb-sm">Iniciar operación</div>

  <div class="text-grey-5 q-mb-lg">
    Elige uno de los métodos aceptados por el vendedor para esta oferta.
  </div>

  <div v-if="cargando" class="text-center q-pa-xl">
    <q-spinner color="amber" size="40px" />
  </div>

  <q-card v-else-if="!ofertaSeleccionada" class="panel q-pa-lg">
    <div class="text-red-4">No se encontró la oferta seleccionada.</div>
  </q-card>

  <div v-else class="row q-col-gutter-lg">
    <div class="col-12 col-md-5">
      <q-card class="panel q-pa-md">
        <div class="text-white text-weight-bold q-mb-md">Resumen de oferta</div>

        <div class="tasa-box q-pa-md q-mb-md text-center">
          <div class="text-grey-5 text-caption">Tipo de cambio</div>

          <div class="text-h5 text-amber text-weight-bold">
            {{ ofertaSeleccionada.tasaCambio }}
          </div>

          <div class="text-grey-5 text-caption">
            {{ ofertaSeleccionada.monedaOrigenNombre }} →
            {{ ofertaSeleccionada.monedaDestinoNombre }}
          </div>
        </div>

        <div class="row justify-between text-grey-4 q-mb-xs">
          <span>Vendedor:</span>
          <span class="text-white">
            {{ ofertaSeleccionada.nombreVendedor || `#${ofertaSeleccionada.usuarioId}` }}
          </span>
        </div>

        <div class="row justify-between text-grey-4 q-mb-xs">
          <span>Monto mínimo:</span>
          <span class="text-white">{{ ofertaSeleccionada.montoMinimo }}</span>
        </div>

        <div class="row justify-between text-grey-4 q-mb-xs">
          <span>Monto máximo:</span>
          <span class="text-white">{{ ofertaSeleccionada.montoMaximo }}</span>
        </div>

        <div class="row justify-between text-grey-4 q-mb-md">
          <span>Disponible:</span>
          <span class="text-white">
            {{ ofertaSeleccionada.montoDisponible ?? '—' }}
            {{ ofertaSeleccionada.monedaOrigenNombre }}
          </span>
        </div>

        <div class="text-grey-5 text-caption q-mb-xs">Métodos aceptados</div>

        <div v-if="metodosOferta.length" class="q-gutter-xs">
          <q-badge
            v-for="metodo in metodosOferta"
            :key="metodo.id || metodo.metodoPagoId || nombreMetodoOferta(metodo)"
            color="blue-grey-8"
            text-color="white"
            class="q-pa-xs"
          >
            {{ nombreMetodoOferta(metodo) }}
          </q-badge>
        </div>

        <div v-else class="text-grey-6 text-caption">
          Esta oferta no tiene métodos publicados.
        </div>
      </q-card>
    </div>

    <div class="col-12 col-md-7">
      <q-card class="panel q-pa-lg">
        <div class="text-white text-weight-bold q-mb-md">Datos de la operación</div>

        <div class="text-grey-5 text-caption q-mb-xs">Monto a operar</div>

        <q-input
          v-model.number="montoTrato"
          type="number"
          dark
          outlined
          color="amber"
          :placeholder="String(ofertaSeleccionada.montoMinimo)"
        />

        <div class="text-grey-5 text-caption q-mb-xs q-mt-md">
          Método de pago para esta operación
        </div>

        <q-select
          v-model="metodoOfertaSeleccionado"
          :options="opcionesMetodosOferta"
          option-label="label"
          dark
          outlined
          color="amber"
          popup-content-class="bg-dark text-white"
          @update:model-value="prepararDatosComprador"
        />

        <q-banner
          v-if="metodoOfertaSeleccionado"
          dense
          class="bg-blue-grey-10 text-grey-4 q-mt-md rounded-borders"
        >
          Elegiste pagar por <b>{{ metodoOfertaSeleccionado.label }}</b>.
          Los datos completos del vendedor aparecerán cuando se cree la operación.
        </q-banner>

        <template v-if="metodoOfertaSeleccionado">
          <q-separator dark class="q-my-md" />

          <div class="text-white text-subtitle2 text-weight-bold q-mb-xs">
            Tus datos de pago
          </div>

          <div class="text-grey-5 text-caption q-mb-sm">
            Puedes ingresar tus datos solo para esta operación. Si marcas guardar, el backend
            los guardará para próximas operaciones.
          </div>

          <q-option-group
            v-model="modoDatosComprador"
            :options="opcionesModoDatos"
            color="amber"
            dark
            @update:model-value="prepararDatosComprador"
          />

          <q-select
            v-if="modoDatosComprador === 'guardado'"
            v-model="metodoGuardadoSeleccionado"
            :options="metodosGuardadosCompatibles"
            option-label="alias"
            dark
            outlined
            color="amber"
            class="q-mt-md"
            popup-content-class="bg-dark text-white"
          />

          <template v-else>
            <div v-for="campo in camposComprador" :key="campo.key" class="q-mt-md">
              <div class="text-grey-5 text-caption q-mb-xs">{{ campo.label }}</div>

              <q-input
                v-model.trim="datosComprador[campo.key]"
                :type="campo.type || 'text'"
                dark
                outlined
                color="amber"
                :maxlength="campo.maxlength"
                :placeholder="campo.placeholder"
              />
            </div>

            <q-checkbox
              v-model="guardarMetodoComprador"
              dark
              color="amber"
              class="q-mt-sm"
              label="Guardar estos datos para próximas operaciones"
            />

            <q-banner
              v-if="esTarjetaSeleccionada"
              dense
              class="bg-orange-9 text-white q-mt-md rounded-borders"
            >
              Para tarjeta no se debe guardar CVV ni número completo. Solo marca, titular y
              últimos 4 dígitos.
            </q-banner>
          </template>
        </template>

        <q-banner
          v-if="mensaje"
          dense
          class="q-mt-md rounded-borders"
          :class="ok ? 'bg-green-9 text-white' : 'bg-red-9 text-white'"
        >
          {{ mensaje }}
        </q-banner>

        <q-btn
          label="Confirmar operación"
          color="amber"
          text-color="black"
          class="full-width text-weight-bold q-mt-lg"
          :loading="guardando"
          @click="confirmarTrato"
        />
      </q-card>
    </div>
  </div>
</template>

<template v-else>
  <div class="text-h5 text-weight-bold text-white q-mb-lg">Operaciones Activas</div>

  <div v-if="cargando" class="text-center q-pa-xl">
    <q-spinner color="amber" size="40px" />
  </div>

  <div v-else-if="operaciones.length === 0" class="text-grey-5">
    No tienes operaciones activas en este momento.
  </div>

  <div v-else class="row q-col-gutter-lg">
    <div v-for="op in operaciones" :key="op.id" class="col-12 col-md-6">
      <q-card class="panel q-pa-md">
        <div class="text-white text-weight-bold">Código: {{ op.codigoOperacion }}</div>

        <div class="text-grey-4 q-mb-sm row items-center q-gutter-x-xs">
          <span>Estado: {{ op.estado }}</span>

          <q-badge v-if="op.estado === 'En proceso'" color="amber" text-color="black">
            {{ formatearSegundos(op.segundosRestantes) }}
          </q-badge>
        </div>

        <q-btn
          v-if="op.estado === 'En proceso'"
          class="full-width q-mb-sm"
          color="amber"
          text-color="black"
          label="Ver temporizador"
          @click="$router.push('/operacion/' + op.id)"
        />

        <div class="row justify-between text-grey-4">
          <span>Monto:</span>
          <span class="text-white">{{ op.monto }}</span>
        </div>

        <div class="row justify-between text-grey-4">
          <span>Vendedor:</span>
          <span class="text-white">{{ op.vendedorNombre || op.vendedorId }}</span>
        </div>

        <div class="row justify-between text-grey-4">
          <span>Comprador:</span>
          <span class="text-white">{{ op.compradorNombre || op.compradorId }}</span>
        </div>

        <q-card
          v-if="Number(op.compradorId) === Number(auth.usuario?.id)"
          flat
          bordered
          class="payment-box q-pa-md q-mt-md"
        >
          <div class="text-white text-weight-bold q-mb-xs">Pago seleccionado</div>

          <div class="text-grey-5 text-caption q-mb-sm">
            Operación creada. Sube tu comprobante cuando realices el pago.
          </div>

          <q-banner dense class="bg-blue-grey-10 text-grey-4 rounded-borders">
            Operación #{{ op.id }} creada. Sube tu comprobante cuando realices el pago.
          </q-banner>
        </q-card>

        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-6">
            <q-btn
              class="full-width"
              color="amber"
              text-color="black"
              label="Comprobante"
              @click="$router.push('/comprobante?operacion=' + op.id)"
            />
          </div>

          <div class="col-6">
            <q-btn
              class="full-width"
              color="green"
              label="Calificar"
              @click="$router.push('/calificacion?operacion=' + op.id)"
            />
          </div>

          <div class="col-6">
            <q-btn
              class="full-width"
              color="red"
              label="Disputa"
              @click="$router.push('/disputa?operacion=' + op.id)"
            />
          </div>

          <div class="col-6">
            <q-btn
              class="full-width"
              color="blue"
              label="Chat"
              @click="$router.push('/chat?operacion=' + op.id)"
            />
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const operaciones = ref([])
const ofertaSeleccionada = ref(null)
const metodosGuardados = ref([])

const cargando = ref(true)
const guardando = ref(false)
const mensaje = ref('')
const ok = ref(false)

const montoTrato = ref(null)
const metodoOfertaSeleccionado = ref(null)
const modoDatosComprador = ref('temporal')
const metodoGuardadoSeleccionado = ref(null)
const guardarMetodoComprador = ref(false)
const datosComprador = ref({})

const opcionesModoDatos = [
  { label: 'Ingresar para esta operación', value: 'temporal' },
  { label: 'Usar método guardado', value: 'guardado' },
]

const modoInicio = computed(() => !!route.query.oferta)

const metodosOferta = computed(() => obtenerMetodosOferta(ofertaSeleccionada.value))

const opcionesMetodosOferta = computed(() =>
  metodosOferta.value.map((metodo) => ({
    label: nombreMetodoOferta(metodo),
    metodo,
  })),
)

const metodoPagoIdSeleccionado = computed(() => {
  const metodo = metodoOfertaSeleccionado.value?.metodo
  return metodo?.metodoPagoId || metodo?.id || null
})

const metodosGuardadosCompatibles = computed(() =>
  metodosGuardados.value.filter(
    (m) => Number(m.metodoPagoId) === Number(metodoPagoIdSeleccionado.value),
  ),
)

const camposComprador = computed(() => camposPorMetodo(metodoOfertaSeleccionado.value?.label))

const esTarjetaSeleccionada = computed(() =>
  normalizarTexto(metodoOfertaSeleccionado.value?.label).includes('tarjeta'),
)

async function cargarPantalla() {
  mensaje.value = ''
  ok.value = false

  if (modoInicio.value) {
    await cargarOfertaParaIniciar()
  } else {
    await cargarOperaciones()
  }
}

async function cargarOfertaParaIniciar() {
  cargando.value = true

  try {
    const ofertaId = Number(route.query.oferta)

    const res = await api.get(`/oferta/${ofertaId}`)
    ofertaSeleccionada.value = res.data
    montoTrato.value = res.data.montoMinimo

    await cargarMetodosGuardados()
  } catch (error) {
    console.error('Error al cargar oferta:', error)
    ofertaSeleccionada.value = null
  } finally {
    cargando.value = false
  }
}

async function cargarOperaciones() {
  cargando.value = true

  try {
    const res = await api.get('/operacion')

    if (res.data && Array.isArray(res.data)) {
      operaciones.value = res.data.filter(
        (op) =>
          Number(op.compradorId) === Number(auth.usuario?.id) ||
          Number(op.vendedorId) === Number(auth.usuario?.id),
      )
    }
  } catch (error) {
    console.error('Error al cargar operaciones:', error)
  } finally {
    cargando.value = false
  }
}

async function cargarMetodosGuardados() {
  try {
    const res = await api.get('/usuariometodopago/mis-metodos')
    metodosGuardados.value = Array.isArray(res.data) ? res.data : []
  } catch {
    metodosGuardados.value = []
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

function normalizarTexto(valor) {
  return String(valor || '').toLowerCase()
}

function camposPorMetodo(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin')) {
    return [
      {
        key: 'titular',
        label: 'Nombre del titular',
        placeholder: 'Ejemplo: Ana Torres',
      },
      {
        key: 'telefono',
        label: 'Número celular asociado',
        placeholder: 'Ejemplo: 987654321',
        maxlength: 9,
      },
    ]
  }

  if (nombre.includes('transferencia') || nombre.includes('banco')) {
    return [
      {
        key: 'titular',
        label: 'Nombre del titular',
        placeholder: 'Ejemplo: Ana Torres',
      },
      {
        key: 'banco',
        label: 'Banco',
        placeholder: 'Ejemplo: BCP, Interbank, BBVA',
      },
      {
        key: 'cuenta',
        label: 'Cuenta o CCI de origen',
        placeholder: 'Ejemplo: 191-xxxx o CCI 002...',
      },
    ]
  }

  if (nombre.includes('paypal')) {
    return [
      {
        key: 'titular',
        label: 'Nombre del titular',
        placeholder: 'Ejemplo: Ana Torres',
      },
      {
        key: 'correo',
        label: 'Correo PayPal',
        placeholder: 'Ejemplo: correo@dominio.com',
        type: 'email',
      },
    ]
  }

  if (nombre.includes('tarjeta')) {
    return [
      {
        key: 'titular',
        label: 'Nombre del titular',
        placeholder: 'Como aparece en la tarjeta',
      },
      {
        key: 'marca',
        label: 'Marca',
        placeholder: 'Ejemplo: Visa, Mastercard',
      },
      {
        key: 'ultimos4',
        label: 'Últimos 4 dígitos',
        placeholder: 'Ejemplo: 1234',
        maxlength: 4,
      },
    ]
  }

  return [
    {
      key: 'titular',
      label: 'Nombre del titular',
      placeholder: 'Nombre asociado al método de pago',
    },
    {
      key: 'referencia',
      label: 'Referencia del método',
      placeholder: 'Número, cuenta, correo o referencia',
    },
  ]
}

function prepararDatosComprador() {
  metodoGuardadoSeleccionado.value = null
  guardarMetodoComprador.value = false
  datosComprador.value = {}

  if (metodosGuardadosCompatibles.value.length === 0) {
    modoDatosComprador.value = 'temporal'
  }
}

function validarDatosComprador() {
  if (!metodoOfertaSeleccionado.value) {
    return 'Selecciona un método de pago disponible para esta oferta.'
  }

  if (modoDatosComprador.value === 'guardado') {
    if (!metodoGuardadoSeleccionado.value) {
      return 'Selecciona un método guardado o ingresa datos para esta operación.'
    }

    return ''
  }

  const faltante = camposComprador.value.find((campo) => !datosComprador.value[campo.key])

  if (faltante) {
    return `Completa el campo: ${faltante.label}.`
  }

  if (esTarjetaSeleccionada.value && datosComprador.value.ultimos4?.length !== 4) {
    return 'Para tarjeta, ingresa exactamente los últimos 4 dígitos.'
  }

  return ''
}

async function confirmarTrato() {
  mensaje.value = ''
  ok.value = false

  const oferta = ofertaSeleccionada.value

  if (!auth.puedeOperar) {
    mensaje.value = 'Debes verificar tu cuenta antes de iniciar una operación.'
    return
  }

  if (!oferta) {
    mensaje.value = 'No hay oferta seleccionada.'
    return
  }

  if (Number(oferta.usuarioId) === Number(auth.usuario?.id)) {
    mensaje.value = 'No puedes iniciar un trato con tu propia oferta.'
    return
  }

  if (
    !montoTrato.value ||
    montoTrato.value < oferta.montoMinimo ||
    montoTrato.value > oferta.montoMaximo
  ) {
    mensaje.value = `El monto debe estar entre ${oferta.montoMinimo} y ${oferta.montoMaximo}.`
    return
  }

  const errorDatos = validarDatosComprador()

  if (errorDatos) {
    mensaje.value = errorDatos
    return
  }

  const metodoOferta = metodoOfertaSeleccionado.value.metodo

  guardando.value = true

  try {
    const res = await api.post('/operacion/iniciar-trato', {
      ofertaId: oferta.id,
      monto: montoTrato.value,

      ofertaMetodoPagoId: metodoOferta.id || null,
      metodoPagoId: metodoOferta.metodoPagoId || metodoOferta.id,

      usuarioMetodoPagoId:
        modoDatosComprador.value === 'guardado' ? metodoGuardadoSeleccionado.value?.id : null,

      guardarMetodoComprador:
        modoDatosComprador.value === 'temporal' ? guardarMetodoComprador.value : false,

      datosPagoComprador: modoDatosComprador.value === 'temporal' ? datosComprador.value : null,
    })

    ok.value = true
    mensaje.value = 'Operación iniciada correctamente.'

    setTimeout(() => {
      router.push('/operacion')
    }, 900)

    console.log('Operación creada:', res.data)
  } catch (e) {
    ok.value = false
    mensaje.value = e.response?.data?.mensaje || 'No se pudo iniciar el trato.'
  } finally {
    guardando.value = false
  }
}

function formatearSegundos(s) {
  const total = Math.max(0, s ?? 0)
  const min = Math.floor(total / 60)
    .toString()
    .padStart(2, '0')
  const seg = (total % 60).toString().padStart(2, '0')
  return `${min}:${seg}`
}

watch(
  () => route.query.oferta,
  () => cargarPantalla(),
)

onMounted(cargarPantalla)
</script>

<style scoped>
.oper-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}

.tasa-box {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
}

.payment-box {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
}
</style>
