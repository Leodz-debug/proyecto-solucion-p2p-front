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
              Elegiste pagar por <b>{{ metodoOfertaSeleccionado.label }}</b
              >. Los datos completos del vendedor aparecerán cuando se cree la operación.
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
      <div class="text-h5 text-weight-bold text-white q-mb-sm">Mis operaciones</div>

      <q-banner dense rounded class="notice-banner q-mb-lg">
        Puedes abrir disputa mientras la operación está en curso o hasta 30 días calendario después
        de que quede cerrada. La evidencia será obligatoria si reportas un problema.
      </q-banner>

      <div v-if="cargando" class="text-center q-pa-xl">
        <q-spinner color="amber" size="40px" />
      </div>

      <div v-else-if="operaciones.length === 0" class="text-grey-5">
        No tienes operaciones registradas en este momento.
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div v-for="op in operaciones" :key="op.id" class="col-12 col-md-6">
          <q-card class="panel operacion-card q-pa-md" :class="claseCardPorRol(op)">
            <div class="row items-start justify-between q-col-gutter-md">
              <div class="col">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <div class="text-white text-weight-bold">Código: {{ op.codigoOperacion }}</div>

                  <q-badge
                    rounded
                    :color="esComprador(op) ? 'green' : 'blue'"
                    text-color="white"
                    class="role-badge"
                  >
                    {{ etiquetaRolOperacion(op) }}
                  </q-badge>

                  <q-btn
                    dense
                    flat
                    round
                    size="sm"
                    icon="info"
                    color="grey-5"
                    class="info-role-btn"
                  >
                    <q-tooltip max-width="260px">
                      {{ descripcionRolOperacion(op) }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div class="column items-end q-gutter-xs">
                <q-badge
                  rounded
                  :color="colorEstadoOperacion(op)"
                  :text-color="colorTextoEstadoOperacion(op)"
                  class="estado-badge"
                >
                  {{ op.estado }}
                </q-badge>

                <q-badge
                  v-if="op.estado === 'En proceso'"
                  color="amber"
                  text-color="black"
                  class="timer-badge"
                >
                  {{ formatearSegundos(op.segundosRestantes) }}
                </q-badge>
              </div>
            </div>

            <q-btn
              v-if="op.estado === 'En proceso'"
              class="full-width q-mt-sm q-mb-sm"
              color="amber"
              text-color="black"
              label="Ver temporizador"
              @click="$router.push('/operacion/' + op.id)"
            />

            <div class="detail-grid q-mt-sm">
              <div class="detail-row">
                <span>Monto:</span>
                <span>{{ op.monto }}</span>
              </div>

              <div class="detail-row">
                <span>Vendedor:</span>
                <span>{{ nombreParticipante(op.vendedorNombre, op.vendedorId) }}</span>
              </div>

              <div class="detail-row">
                <span>Comprador:</span>
                <span>{{ nombreParticipante(op.compradorNombre, op.compradorId) }}</span>
              </div>
            </div>

            <q-banner v-if="disputaDeOperacion(op)" dense rounded class="dispute-banner q-mt-md">
              {{ textoAvisoDisputaExistente(op) }}
            </q-banner>

            <q-banner
              v-else-if="mostrarAvisoDisputaCierre(op)"
              dense
              rounded
              class="notice-banner q-mt-md"
            >
              {{ textoAvisoDisputaCierre(op) }}
            </q-banner>

            <div class="acciones-grid q-mt-md">
              <q-btn
                v-if="mostrarBotonComprobante(op)"
                class="action-btn"
                :color="colorBotonComprobante(op)"
                :text-color="esComprador(op) && op.estado === 'En proceso' ? 'black' : 'white'"
                :label="textoBotonComprobante(op)"
                :disable="!puedeAbrirComprobante(op)"
                @click="abrirComprobante(op)"
              >
                <q-tooltip v-if="!puedeAbrirComprobante(op)">
                  {{ textoTooltipComprobante(op) }}
                </q-tooltip>
              </q-btn>

              <q-btn
                class="action-btn"
                color="green"
                label="Calificar"
                :disable="!puedeCalificar(op)"
                @click="$router.push('/calificacion?operacion=' + op.id)"
              >
                <q-tooltip v-if="!puedeCalificar(op)">
                  {{ textoTooltipCalificar(op) }}
                </q-tooltip>
              </q-btn>

              <q-btn
                class="action-btn"
                color="red"
                :label="disputaDeOperacion(op) ? 'Ver disputa' : 'Disputa'"
                :disable="!puedeVerODisputar(op)"
                @click="abrirDisputaDesdeOperacion(op)"
              >
                <q-tooltip v-if="!puedeVerODisputar(op)">
                  {{ textoTooltipDisputa(op) }}
                </q-tooltip>
              </q-btn>

              <q-btn
                class="action-btn"
                color="blue"
                label="Chat"
                @click="$router.push('/chat?operacion=' + op.id)"
              />
            </div>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
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
const disputas = ref([])
const comprobantesPorOperacion = ref({})
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
    const [resOperaciones, resDisputas] = await Promise.allSettled([
      api.get('/operacion'),
      api.get('/disputa/mis-disputas'),
    ])

    const listaOperaciones =
      resOperaciones.status === 'fulfilled' && Array.isArray(resOperaciones.value.data)
        ? resOperaciones.value.data
        : []

    operaciones.value = listaOperaciones.filter(
      (op) =>
        Number(op.compradorId) === Number(auth.usuario?.id) ||
        Number(op.vendedorId) === Number(auth.usuario?.id),
    )

    disputas.value =
      resDisputas.status === 'fulfilled' && Array.isArray(resDisputas.value.data)
        ? resDisputas.value.data
        : []

    await cargarComprobantesOperaciones(operaciones.value)
  } catch (error) {
    console.error('Error al cargar operaciones:', error)
  } finally {
    cargando.value = false
  }
}

async function cargarComprobantesOperaciones(lista) {
  const mapa = {}

  const candidatos = lista.filter((op) =>
    ['Pago enviado', 'Completada', 'En disputa'].includes(op?.estado),
  )

  const resultados = await Promise.allSettled(
    candidatos.map((op) => api.get(`/comprobantepago/operacion/${op.id}`)),
  )

  resultados.forEach((resultado, index) => {
    const operacionId = candidatos[index]?.id

    if (!operacionId) return

    mapa[operacionId] = resultado.status === 'fulfilled' ? resultado.value.data : null
  })

  comprobantesPorOperacion.value = mapa
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
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
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
    await api.post('/operacion/iniciar-trato', {
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

function esComprador(op) {
  return Number(op?.compradorId) === Number(auth.usuario?.id)
}

function esVendedor(op) {
  return Number(op?.vendedorId) === Number(auth.usuario?.id)
}

function nombreParticipante(nombre, id) {
  const esYo = Number(id) === Number(auth.usuario?.id)
  return `${nombre || id}${esYo ? ' (Tú)' : ''}`
}

function etiquetaRolOperacion(op) {
  if (esComprador(op)) return 'TU COMPRA'
  if (esVendedor(op)) return 'TU VENTA'
  return 'OPERACIÓN'
}

function descripcionRolOperacion(op) {
  if (esComprador(op)) {
    return 'Tú eres quien paga. Solo tú puedes subir el comprobante mientras la operación está en proceso.'
  }

  if (esVendedor(op)) {
    return 'Tú eres quien recibe el pago. El botón de comprobante aparece solo cuando el comprador ya subió evidencia.'
  }

  return 'Operación asociada a tu cuenta.'
}

function claseCardPorRol(op) {
  if (esComprador(op)) return 'operacion-card--buyer'
  if (esVendedor(op)) return 'operacion-card--seller'
  return ''
}

function colorEstadoOperacion(op) {
  const estado = op?.estado

  if (estado === 'Completada') return 'green'
  if (estado === 'Pago enviado') return 'blue'
  if (estado === 'En proceso') return 'amber'
  if (estado === 'En disputa') return 'deep-orange'
  if (estado === 'Cancelada') return 'red'
  if (estado === 'Expirada') return 'grey-7'

  return 'blue-grey'
}

function colorTextoEstadoOperacion(op) {
  return op?.estado === 'En proceso' ? 'black' : 'white'
}

function comprobanteDeOperacion(op) {
  return comprobantesPorOperacion.value[op?.id] || null
}

function tieneComprobante(op) {
  return Boolean(comprobanteDeOperacion(op)?.rutaArchivo)
}

function urlComprobanteDeOperacion(op) {
  const comprobante = comprobanteDeOperacion(op)
  if (!comprobante?.rutaArchivo) return ''

  const base = api.defaults.baseURL.replace(/\/api\/?$/, '')
  return base + comprobante.rutaArchivo
}

function mostrarBotonComprobante(op) {
  if (esComprador(op)) {
    return op?.estado === 'En proceso' || tieneComprobante(op)
  }

  if (esVendedor(op)) {
    return tieneComprobante(op) && ['Pago enviado', 'Completada'].includes(op?.estado)
  }

  return false
}

function textoBotonComprobante(op) {
  if (esComprador(op) && op?.estado === 'En proceso') {
    return 'Subir comprobante'
  }

  if (esVendedor(op) && op?.estado === 'Pago enviado') {
    return 'Revisar comprobante'
  }

  return 'Ver comprobante'
}

function colorBotonComprobante(op) {
  if (esComprador(op) && op?.estado === 'En proceso') return 'amber'
  if (esVendedor(op) && op?.estado === 'Pago enviado') return 'deep-orange'
  return 'blue-grey-8'
}

function abrirComprobante(op) {
  if (esComprador(op) && op.estado === 'En proceso') {
    router.push('/comprobante?operacion=' + op.id)
    return
  }

  if (esVendedor(op) && op.estado === 'Pago enviado') {
    router.push('/operacion/' + op.id)
    return
  }

  const url = urlComprobanteDeOperacion(op)

  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function puedeAbrirComprobante(op) {
  if (esComprador(op) && op?.estado === 'En proceso') return true
  if (esVendedor(op) && op?.estado === 'Pago enviado' && tieneComprobante(op)) return true
  return tieneComprobante(op)
}

function textoTooltipComprobante(op) {
  if (esComprador(op) && op?.estado === 'En proceso') {
    return 'Sube el comprobante después de realizar el pago.'
  }

  if (!tieneComprobante(op)) {
    return 'Aún no existe un comprobante para esta operación.'
  }

  if (esVendedor(op)) {
    return 'Revisa el comprobante enviado por el comprador.'
  }

  return 'Ver comprobante enviado.'
}

function puedeCalificar(op) {
  return op?.estado === 'Completada' && (esComprador(op) || esVendedor(op))
}

function textoTooltipCalificar(op) {
  if (op?.estado !== 'Completada') {
    return 'Solo puedes calificar cuando la operación esté completada.'
  }

  return 'No participas en esta operación.'
}

const DIAS_LIMITE_DISPUTA = 30
const MS_DIA = 24 * 60 * 60 * 1000
const ESTADOS_ACTIVOS_DISPUTA = ['En proceso', 'Pago enviado']
const ESTADOS_FINALIZADOS_DISPUTA = ['Completada', 'Cancelada', 'Expirada']

function esParticipanteOperacion(op) {
  return esComprador(op) || esVendedor(op)
}

function esEstadoFinalizadoParaDisputa(op) {
  return ESTADOS_FINALIZADOS_DISPUTA.includes(op?.estado)
}

function obtenerFechaBaseDisputa(op) {
  const valor = op?.fechaFin || op?.fechaLiberacion || op?.fechaInicio
  if (!valor) return null

  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

function obtenerFechaLimiteDisputa(op) {
  if (!esEstadoFinalizadoParaDisputa(op)) return null

  const base = obtenerFechaBaseDisputa(op)
  if (!base) return null

  const limite = new Date(base)
  limite.setDate(limite.getDate() + DIAS_LIMITE_DISPUTA)
  return limite
}

function diasRestantesDisputa(op) {
  const limite = obtenerFechaLimiteDisputa(op)
  if (!limite) return null

  return Math.max(0, Math.ceil((limite.getTime() - Date.now()) / MS_DIA))
}

function dentroDelPlazoDisputa(op) {
  if (ESTADOS_ACTIVOS_DISPUTA.includes(op?.estado)) return true

  const limite = obtenerFechaLimiteDisputa(op)
  if (!limite) return false

  return Date.now() <= limite.getTime()
}

function disputaDeOperacion(op) {
  return disputas.value.find((d) => Number(d.operacionId) === Number(op?.id)) || null
}

function esDisputaActiva(estado) {
  const valor = normalizarTexto(estado)
  return ['abierta', 'en revision', 'pendiente'].includes(valor)
}

function puedeDisputar(op) {
  if (!esParticipanteOperacion(op)) return false
  if (disputaDeOperacion(op)) return false
  if (op?.estado === 'En disputa') return false
  if (ESTADOS_ACTIVOS_DISPUTA.includes(op?.estado)) return true
  if (esEstadoFinalizadoParaDisputa(op)) return dentroDelPlazoDisputa(op)

  return false
}

function puedeVerODisputar(op) {
  return Boolean(disputaDeOperacion(op)) || puedeDisputar(op)
}

function abrirDisputaDesdeOperacion(op) {
  if (disputaDeOperacion(op) || puedeDisputar(op)) {
    router.push('/disputa?operacion=' + op.id)
  }
}

function textoAvisoDisputaExistente(op) {
  const disputa = disputaDeOperacion(op)
  if (!disputa) return ''

  if (esDisputaActiva(disputa.estado)) {
    return `Ya tienes una disputa procesándose para esta operación. Estado: ${disputa.estado}.`
  }

  return `Esta operación ya tuvo una disputa registrada. Estado: ${disputa.estado}.`
}

function textoTooltipDisputa(op) {
  const disputa = disputaDeOperacion(op)

  if (disputa) {
    return esDisputaActiva(disputa.estado)
      ? 'Ya tienes una disputa procesándose. Puedes abrirla para ver el historial.'
      : 'Esta operación ya tuvo una disputa. Puedes abrirla para ver el detalle.'
  }

  if (!esParticipanteOperacion(op)) {
    return 'No participas en esta operación.'
  }

  if (op?.estado === 'En disputa') {
    return 'Esta operación ya tiene una disputa abierta.'
  }

  if (esEstadoFinalizadoParaDisputa(op) && !dentroDelPlazoDisputa(op)) {
    return `El plazo de ${DIAS_LIMITE_DISPUTA} días calendario para disputar ya venció.`
  }

  if (esEstadoFinalizadoParaDisputa(op)) {
    return 'Puedes abrir disputa porque la operación cerró hace menos de 30 días.'
  }

  if (!ESTADOS_ACTIVOS_DISPUTA.includes(op?.estado)) {
    return 'Este estado no admite una nueva disputa.'
  }

  return 'Abrir disputa'
}

function mostrarAvisoDisputaCierre(op) {
  return esEstadoFinalizadoParaDisputa(op)
}

function textoAvisoDisputaCierre(op) {
  const limite = obtenerFechaLimiteDisputa(op)

  if (!limite) {
    return `Operación cerrada. No se encontró una fecha válida para calcular el plazo de ${DIAS_LIMITE_DISPUTA} días.`
  }

  const fecha = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(limite)

  if (!dentroDelPlazoDisputa(op)) {
    return `El plazo para abrir disputa venció el ${fecha}.`
  }

  return `Operación cerrada. Puedes abrir disputa hasta el ${fecha}. Quedan ${diasRestantesDisputa(op)} día(s).`
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

.operacion-card {
  border-left: 4px solid #30363d;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.operacion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
}

.operacion-card--buyer {
  border-left-color: #2ea043;
}

.operacion-card--seller {
  border-left-color: #1f6feb;
}

.role-badge,
.estado-badge,
.timer-badge {
  font-weight: 700;
}

.info-role-btn {
  margin-left: 2px;
}

.detail-grid {
  display: grid;
  gap: 7px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  color: #8b949e;
}

.detail-row span:last-child {
  color: #f0f6fc;
  font-weight: 700;
  text-align: right;
}

.notice-banner {
  background: #23313a;
  color: #dce9ef;
}

.dispute-banner {
  background: rgba(251, 133, 0, 0.18);
  color: #ffd8a8;
  border: 1px solid rgba(251, 133, 0, 0.35);
}

.acciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.action-btn {
  width: 100%;
  font-weight: 700;
}

@media (max-width: 700px) {
  .acciones-grid {
    grid-template-columns: 1fr;
  }
}
</style>
