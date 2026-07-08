<template>
  <q-page class="disputa-page q-pa-lg">
    <q-btn
      flat
      no-caps
      icon="arrow_back"
      color="amber"
      label="Volver"
      class="q-px-none q-mb-md"
      @click="router.back()"
    />

    <div class="row items-start justify-between q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h5 text-white text-weight-bold">
          {{ modoAbrir ? 'Abrir disputa' : 'Mis disputas' }}
        </div>
        <div class="text-grey-5">
          Puedes abrir una disputa durante la operación o hasta {{ DIAS_LIMITE_DISPUTA }} días
          calendario después de que quede cerrada. La evidencia es obligatoria.
        </div>
      </div>

      <div class="col-12 col-md-auto">
        <q-badge v-if="operacion" :color="colorEstado(operacion.estado)" class="q-pa-sm">
          {{ operacion.estado }}
        </q-badge>
      </div>
    </div>

    <q-banner dense rounded class="bg-blue-grey-10 text-grey-4 q-mb-lg">
      Adjunta un comprobante, captura del chat, constancia de pago o documento que permita validar
      el caso. Si la operación ya terminó, el plazo máximo interno es de
      <b>{{ DIAS_LIMITE_DISPUTA }} días calendario</b> desde el cierre.
    </q-banner>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="42px" />
      <div class="text-grey-5 q-mt-sm">Cargando información...</div>
    </div>

    <template v-else-if="!modoAbrir">
      <q-card class="panel q-pa-lg q-mb-lg">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <div class="metric-card q-pa-md">
              <div class="text-grey-5 text-caption">Abiertas o en revisión</div>
              <div class="text-white text-h5 text-weight-bold">{{ disputasActivas.length }}</div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="metric-card q-pa-md">
              <div class="text-grey-5 text-caption">Cerradas últimos 30 días</div>
              <div class="text-white text-h5 text-weight-bold">
                {{ disputasCerradasRecientes.length }}
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="metric-card q-pa-md">
              <div class="text-grey-5 text-caption">Total visibles</div>
              <div class="text-white text-h5 text-weight-bold">{{ disputasVisibles.length }}</div>
            </div>
          </div>
        </div>
      </q-card>

      <q-card v-if="disputasVisibles.length === 0" class="panel q-pa-xl text-center">
        <q-icon name="gavel" color="amber" size="54px" />
        <div class="text-white text-h6 q-mt-md">No tienes disputas registradas</div>
        <div class="text-grey-5 q-mt-xs">
          Abre una disputa desde la card de una operación cuando tengas un problema real y
          evidencia.
        </div>
        <q-btn
          color="amber"
          text-color="black"
          label="Ir a operaciones"
          class="q-mt-lg"
          @click="router.push('/operacion')"
        />
      </q-card>

      <div v-else class="column q-gutter-md">
        <q-card v-for="disputa in disputasVisibles" :key="disputa.id" class="panel q-pa-lg">
          <disputa-detalle
            :disputa="disputa"
            :usuario-actual-id="usuarioActualId"
            :api-origin="apiOrigin"
          />
        </q-card>
      </div>
    </template>

    <q-card v-else-if="!operacion" class="panel q-pa-xl text-center">
      <q-icon name="error_outline" color="red-4" size="54px" />
      <div class="text-white text-h6 q-mt-md">No se encontró la operación</div>
      <div class="text-grey-5 q-mt-xs">
        Vuelve a tus operaciones y abre la disputa desde la operación correcta.
      </div>
      <q-btn
        color="amber"
        text-color="black"
        label="Ir a operaciones"
        class="q-mt-lg"
        @click="router.push('/operacion')"
      />
    </q-card>

    <div v-else class="row q-col-gutter-lg">
      <div class="col-12 col-md-5">
        <q-card class="panel q-pa-lg">
          <div class="row items-center q-mb-md">
            <q-avatar color="amber" text-color="black" size="46px">
              <q-icon name="receipt_long" />
            </q-avatar>

            <div class="q-ml-md">
              <div class="text-white text-weight-bold">
                {{ operacion.codigoOperacion || `Operación #${operacion.id}` }}
              </div>
              <div class="text-grey-5 text-caption">Operación #{{ operacion.id }}</div>
            </div>
          </div>

          <q-separator dark class="q-my-md" />

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Monto:</span>
            <span class="text-white text-weight-bold">{{ formatearMonto(operacion.monto) }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Tu rol:</span>
            <span class="text-white">{{ rolUsuario }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Contraparte:</span>
            <span class="text-white text-right">{{ contraparteNombre }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Método:</span>
            <span class="text-white text-right">
              {{ operacion.metodoPagoNombre || 'No especificado' }}
            </span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Inicio:</span>
            <span class="text-white text-right">{{ formatearFecha(operacion.fechaInicio) }}</span>
          </div>

          <div v-if="fechaBasePlazo" class="row justify-between text-grey-4 q-mb-sm">
            <span>{{ operacionFinalizada ? 'Cierre:' : 'Referencia:' }}</span>
            <span class="text-white text-right">{{ formatearFecha(fechaBasePlazo) }}</span>
          </div>

          <div v-if="fechaLimiteDisputa" class="row justify-between text-grey-4 q-mb-sm">
            <span>Límite disputa:</span>
            <span class="text-white text-right">{{ formatearFecha(fechaLimiteDisputa) }}</span>
          </div>

          <q-banner dense rounded class="bg-blue-grey-10 text-grey-4 q-mt-md">
            {{ textoPlazo }}
          </q-banner>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card class="panel q-pa-lg">
          <template v-if="disputaExistente">
            <q-banner dense rounded class="bg-orange-9 text-white q-mb-md">
              {{ textoDisputaExistente }}
            </q-banner>

            <disputa-detalle
              :disputa="disputaExistente"
              :usuario-actual-id="usuarioActualId"
              :api-origin="apiOrigin"
            />

            <q-btn
              outline
              color="grey-5"
              label="Volver a operaciones"
              class="full-width q-mt-lg"
              @click="router.push('/operacion')"
            />
          </template>

          <template v-else>
            <div class="text-white text-subtitle1 text-weight-bold q-mb-xs">
              Información de la disputa
            </div>
            <div class="text-grey-5 text-caption q-mb-md">
              Sé concreta: qué ocurrió, cuándo ocurrió, qué esperabas que pase y qué evidencia
              adjuntas. Sin evidencia no se registra la disputa.
            </div>

            <q-banner v-if="!esParticipante" dense rounded class="bg-red-9 text-white q-mb-md">
              No puedes abrir una disputa porque no participas en esta operación.
            </q-banner>

            <q-banner
              v-else-if="operacion.estado === 'En disputa'"
              dense
              rounded
              class="bg-orange-9 text-white q-mb-md"
            >
              Esta operación ya está en disputa. Espera la revisión de administración.
            </q-banner>

            <q-banner
              v-else-if="!estadoPermiteDisputa"
              dense
              rounded
              class="bg-orange-9 text-white q-mb-md"
            >
              Esta operación está en estado <b>{{ operacion.estado }}</b> y no admite una nueva
              disputa.
            </q-banner>

            <q-banner
              v-else-if="!estaDentroDelPlazo"
              dense
              rounded
              class="bg-red-9 text-white q-mb-md"
            >
              El plazo de {{ DIAS_LIMITE_DISPUTA }} días calendario para abrir disputa ya venció.
            </q-banner>

            <q-select
              v-model="tipoProblema"
              :options="tiposProblema"
              label="Tipo de problema"
              dark
              outlined
              color="amber"
              popup-content-class="bg-dark text-white"
              :disable="!puedeEditar"
            />

            <q-input
              v-model.trim="motivo"
              type="textarea"
              autogrow
              outlined
              dark
              color="amber"
              label="Describe qué ocurrió"
              class="q-mt-md"
              counter
              maxlength="900"
              :disable="!puedeEditar"
              hint="Mínimo 20 caracteres. Evita insultos y explica los hechos."
            />

            <q-input
              v-model.trim="evidenciaTexto"
              type="textarea"
              autogrow
              outlined
              dark
              color="amber"
              label="Pruebas o referencias"
              class="q-mt-md"
              counter
              maxlength="500"
              :disable="!puedeEditar"
              hint="Ejemplo: número de operación bancaria, hora exacta, captura del chat o comprobante adjunto."
            />

            <q-file
              v-model="archivoEvidencia"
              label="Adjuntar evidencia obligatoria"
              dark
              outlined
              color="amber"
              class="q-mt-md"
              accept=".jpg,.jpeg,.png,.pdf"
              max-file-size="5242880"
              :disable="!puedeEditar"
              @rejected="onArchivoRechazado"
            >
              <template #prepend>
                <q-icon name="attach_file" color="amber" />
              </template>
            </q-file>

            <div class="text-grey-6 text-caption q-mt-xs">
              Formatos aceptados: JPG, PNG o PDF. Tamaño máximo: 5 MB.
            </div>

            <q-input
              v-model.trim="solicitud"
              type="textarea"
              autogrow
              outlined
              dark
              color="amber"
              label="Qué solución esperas"
              class="q-mt-md"
              counter
              maxlength="400"
              :disable="!puedeEditar"
              hint="Ejemplo: revisión del comprobante, devolución, liberación de la operación o contacto con la contraparte."
            />

            <q-banner
              v-if="mensaje"
              dense
              rounded
              class="q-mt-md"
              :class="ok ? 'bg-green-9 text-white' : 'bg-red-9 text-white'"
            >
              {{ mensaje }}
            </q-banner>

            <q-separator dark class="q-my-lg" />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-btn
                  outline
                  color="grey-5"
                  label="Cancelar"
                  class="full-width"
                  @click="router.push('/operacion')"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-btn
                  color="red"
                  label="Enviar disputa"
                  class="full-width text-weight-bold"
                  :loading="loading"
                  :disable="!puedeEnviar"
                  @click="guardar"
                />
              </div>
            </div>
          </template>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const DIAS_LIMITE_DISPUTA = 30
const MS_DIA = 24 * 60 * 60 * 1000
const ESTADOS_ACTIVOS_DISPUTA = ['En proceso', 'Pago enviado']
const ESTADOS_FINALIZADOS_DISPUTA = ['Completada', 'Cancelada', 'Expirada']

const DisputaDetalle = defineComponent({
  name: 'DisputaDetalle',
  props: {
    disputa: { type: Object, required: true },
    usuarioActualId: { type: Number, required: true },
    apiOrigin: { type: String, required: true },
  },
  setup(props) {
    const esComprador = computed(() => Number(props.disputa.compradorId) === props.usuarioActualId)
    const rol = computed(() => (esComprador.value ? 'Comprador' : 'Vendedor'))
    const contraparte = computed(() =>
      esComprador.value
        ? props.disputa.vendedorNombre || `Usuario #${props.disputa.vendedorId}`
        : props.disputa.compradorNombre || `Usuario #${props.disputa.compradorId}`,
    )

    function fmtFecha(valor) {
      if (!valor) return '—'
      return new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(valor),
      )
    }

    function fmtMonto(valor) {
      return new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(valor || 0))
    }

    function evidenciaUrl(ruta) {
      if (!ruta) return '#'
      if (ruta.startsWith('http')) return ruta
      return `${props.apiOrigin}${ruta}`
    }

    function dato(label, value) {
      return h('div', { class: 'row justify-between text-grey-4 q-mb-xs detail-row' }, [
        h('span', label),
        h('span', { class: 'text-white text-right' }, value || '—'),
      ])
    }

    return () =>
      h('div', [
        h('div', { class: 'row items-center justify-between q-mb-md' }, [
          h('div', [
            h(
              'div',
              { class: 'text-white text-weight-bold' },
              props.disputa.codigoOperacion || `Operación #${props.disputa.operacionId}`,
            ),
            h('div', { class: 'text-grey-5 text-caption' }, `Disputa #${props.disputa.id}`),
          ]),
          h(
            'span',
            {
              class: `estado-pill ${String(props.disputa.estado || '')
                .toLowerCase()
                .replaceAll(' ', '-')}`,
            },
            props.disputa.estado || 'Sin estado',
          ),
        ]),
        h('div', { class: 'detail-grid' }, [
          dato('Estado operación:', props.disputa.estadoOperacion),
          dato('Monto:', fmtMonto(props.disputa.monto)),
          dato('Tu rol:', rol.value),
          dato('Contraparte:', contraparte.value),
          dato('Método:', props.disputa.metodoPagoNombre || 'No especificado'),
          dato('Inicio:', fmtFecha(props.disputa.fechaInicio)),
          dato('Cierre:', fmtFecha(props.disputa.fechaFin || props.disputa.fechaLiberacion)),
          dato('Registro disputa:', fmtFecha(props.disputa.fechaRegistro)),
        ]),
        h('div', { class: 'q-mt-md' }, [
          h('div', { class: 'text-grey-5 text-caption q-mb-xs' }, 'Detalle registrado'),
          h('div', { class: 'motivo-box' }, props.disputa.motivo || '—'),
        ]),
        props.disputa.resolucion
          ? h('div', { class: 'q-mt-md' }, [
              h('div', { class: 'text-grey-5 text-caption q-mb-xs' }, 'Resolución'),
              h('div', { class: 'motivo-box' }, props.disputa.resolucion),
            ])
          : null,
        h('div', { class: 'q-mt-md' }, [
          h('div', { class: 'text-grey-5 text-caption q-mb-xs' }, 'Evidencia adjunta'),
          Array.isArray(props.disputa.evidencias) && props.disputa.evidencias.length > 0
            ? h(
                'div',
                { class: 'q-gutter-sm' },
                props.disputa.evidencias.map((ev) =>
                  h(
                    'a',
                    {
                      class: 'evidence-link',
                      href: evidenciaUrl(ev.rutaArchivo),
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    },
                    `Evidencia #${ev.id} · ${fmtFecha(ev.fechaSubida)}`,
                  ),
                ),
              )
            : h('div', { class: 'text-red-4 text-caption' }, 'No hay evidencia registrada.'),
        ]),
      ])
  },
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const operacion = ref(null)
const disputaExistente = ref(null)
const historial = ref([])
const cargando = ref(true)
const loading = ref(false)
const mensaje = ref('')
const ok = ref(false)

const tipoProblema = ref('No recibí el pago')
const motivo = ref('')
const evidenciaTexto = ref('')
const solicitud = ref('')
const archivoEvidencia = ref(null)

const tiposProblema = [
  'No recibí el pago',
  'Comprobante incorrecto o ilegible',
  'Monto diferente al acordado',
  'La contraparte no responde',
  'Datos de pago incorrectos',
  'Problema detectado después del cierre',
  'Otro problema',
]

const operacionId = computed(() => Number(route.query.operacion))
const modoAbrir = computed(() => Number.isFinite(operacionId.value) && operacionId.value > 0)
const usuarioActualId = computed(() => Number(auth.usuario?.id || 0))
const apiOrigin = computed(() => String(api.defaults.baseURL || '').replace(/\/api\/?$/, ''))

const disputasActivas = computed(() => historial.value.filter((d) => esDisputaActiva(d.estado)))
const disputasCerradasRecientes = computed(() =>
  historial.value.filter(
    (d) => !esDisputaActiva(d.estado) && fechaEnUltimosDias(d.fechaRegistro, 30),
  ),
)
const disputasVisibles = computed(() => [
  ...disputasActivas.value,
  ...disputasCerradasRecientes.value,
])

const esComprador = computed(
  () => operacion.value && Number(operacion.value.compradorId) === usuarioActualId.value,
)
const esVendedor = computed(
  () => operacion.value && Number(operacion.value.vendedorId) === usuarioActualId.value,
)
const esParticipante = computed(() => Boolean(esComprador.value || esVendedor.value))
const rolUsuario = computed(() =>
  esComprador.value ? 'Comprador' : esVendedor.value ? 'Vendedor' : 'No participante',
)
const contraparteNombre = computed(() => {
  if (!operacion.value || !esParticipante.value) return 'No disponible'
  return esComprador.value
    ? operacion.value.vendedorNombre || `Usuario #${operacion.value.vendedorId}`
    : operacion.value.compradorNombre || `Usuario #${operacion.value.compradorId}`
})

const operacionFinalizada = computed(() =>
  ESTADOS_FINALIZADOS_DISPUTA.includes(operacion.value?.estado),
)
const estadoPermiteDisputa = computed(() =>
  [...ESTADOS_ACTIVOS_DISPUTA, ...ESTADOS_FINALIZADOS_DISPUTA].includes(operacion.value?.estado),
)
const fechaBasePlazo = computed(() => obtenerFechaBaseDisputa(operacion.value))
const fechaLimiteDisputa = computed(() => {
  if (!operacionFinalizada.value || !fechaBasePlazo.value) return null
  const limite = new Date(fechaBasePlazo.value)
  limite.setDate(limite.getDate() + DIAS_LIMITE_DISPUTA)
  return limite
})
const estaDentroDelPlazo = computed(() => {
  if (!operacion.value) return false
  if (ESTADOS_ACTIVOS_DISPUTA.includes(operacion.value.estado)) return true
  if (!fechaLimiteDisputa.value) return false
  return Date.now() <= fechaLimiteDisputa.value.getTime()
})
const diasRestantes = computed(() => {
  if (!fechaLimiteDisputa.value) return null
  return Math.max(0, Math.ceil((fechaLimiteDisputa.value.getTime() - Date.now()) / MS_DIA))
})
const textoPlazo = computed(() => {
  if (!operacion.value) return ''
  if (disputaExistente.value) return 'Esta operación ya tiene una disputa registrada.'
  if (ESTADOS_ACTIVOS_DISPUTA.includes(operacion.value.estado)) {
    return 'La operación aún está en curso. Si abres disputa, se congela hasta revisión de administración.'
  }
  if (!fechaLimiteDisputa.value) {
    return `No se encontró una fecha válida para calcular el plazo de ${DIAS_LIMITE_DISPUTA} días.`
  }
  if (!estaDentroDelPlazo.value) {
    return `El plazo para abrir disputa venció el ${formatearFecha(fechaLimiteDisputa.value)}.`
  }
  return `Aún puedes abrir disputa. Quedan ${diasRestantes.value} día(s) calendario.`
})
const textoDisputaExistente = computed(() => {
  if (!disputaExistente.value) return ''
  return esDisputaActiva(disputaExistente.value.estado)
    ? 'Ya tienes una disputa en revisión para esta operación. No se puede abrir otra.'
    : 'Esta operación ya tuvo una disputa registrada. Puedes revisar el detalle abajo.'
})
const motivoCompuesto = computed(() =>
  [
    `Tipo de problema: ${tipoProblema.value}`,
    `Detalle: ${motivo.value.trim()}`,
    `Pruebas o referencias: ${evidenciaTexto.value.trim() || 'Ver archivo adjunto.'}`,
    `Solución esperada: ${solicitud.value.trim() || 'Revisión por administración.'}`,
  ].join('\n'),
)
const puedeEditar = computed(
  () =>
    esParticipante.value &&
    estadoPermiteDisputa.value &&
    estaDentroDelPlazo.value &&
    !disputaExistente.value &&
    !ok.value,
)
const puedeEnviar = computed(
  () =>
    puedeEditar.value &&
    motivo.value.trim().length >= 20 &&
    Boolean(archivoEvidencia.value) &&
    !loading.value,
)

async function cargar() {
  cargando.value = true
  mensaje.value = ''
  ok.value = false

  try {
    await cargarHistorial()

    if (!modoAbrir.value) return

    const [resOperacion, resDisputa] = await Promise.allSettled([
      api.get(`/operacion/${operacionId.value}`),
      api.get(`/disputa/por-operacion/${operacionId.value}`),
    ])

    operacion.value = resOperacion.status === 'fulfilled' ? resOperacion.value.data : null
    disputaExistente.value = resDisputa.status === 'fulfilled' ? resDisputa.value.data : null
  } catch (error) {
    console.error('Error al cargar disputa:', error)
    operacion.value = null
  } finally {
    cargando.value = false
  }
}

async function cargarHistorial() {
  try {
    const res = await api.get('/disputa/mis-disputas')
    historial.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Error al cargar historial de disputas:', error)
    historial.value = []
  }
}

async function guardar() {
  mensaje.value = ''
  ok.value = false

  if (!puedeEnviar.value) {
    mensaje.value = 'Completa el detalle y adjunta una evidencia antes de enviar la disputa.'
    return
  }

  loading.value = true

  try {
    const formData = new FormData()
    formData.append('operacionId', String(operacionId.value))
    formData.append('motivo', motivoCompuesto.value)
    formData.append('archivo', archivoEvidencia.value)

    await api.post('/disputa/abrir', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    ok.value = true
    mensaje.value = 'Disputa registrada con evidencia. Administración revisará el caso.'

    await cargarHistorial()

    setTimeout(() => {
      router.push('/disputa')
    }, 1200)
  } catch (e) {
    ok.value = false
    mensaje.value = e.response?.data?.mensaje || 'No fue posible registrar la disputa.'
  } finally {
    loading.value = false
  }
}

function onArchivoRechazado() {
  mensaje.value = 'El archivo no cumple el formato o supera los 5 MB.'
  ok.value = false
}

function obtenerFechaBaseDisputa(op) {
  const valor = op?.fechaFin || op?.fechaLiberacion || op?.fechaInicio
  if (!valor) return null

  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

function fechaEnUltimosDias(valor, dias) {
  if (!valor) return false
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return false
  return Date.now() - fecha.getTime() <= dias * MS_DIA
}

function esDisputaActiva(estado) {
  const valor = normalizarTexto(estado)
  return ['abierta', 'en revision', 'pendiente'].includes(valor)
}

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function formatearMonto(valor) {
  if (valor === null || valor === undefined) return '—'
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor))
}

function formatearFecha(valor) {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor))
}

function colorEstado(estado) {
  if (estado === 'Completada') return 'positive'
  if (estado === 'En proceso') return 'amber'
  if (estado === 'Pago enviado') return 'green'
  if (estado === 'En disputa') return 'orange'
  if (estado === 'Cancelada' || estado === 'Expirada') return 'red'
  return 'blue-grey'
}

onMounted(cargar)
</script>

<style scoped>
.disputa-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}

.metric-card,
.motivo-box {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 12px;
}

:deep(.motivo-box) {
  background: #0b1118;
  border: 1px solid #30363d;
  border-radius: 10px;
  color: #e6edf3 !important;
  padding: 12px;
  white-space: pre-wrap;
  line-height: 1.45;
}

:deep(.detail-grid) {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
}

:deep(.detail-row) {
  color: #c9d1d9 !important;
}

:deep(.detail-row span:first-child) {
  color: #c9d1d9 !important;
}

:deep(.detail-row span:last-child) {
  color: #ffffff !important;
  max-width: 62%;
  text-align: right;
  font-weight: 700;
}

:deep(.estado-pill) {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  background: #263238;
  color: #e6edf3 !important;
}

:deep(.estado-pill.abierta),
:deep(.estado-pill.pendiente),
:deep(.estado-pill.en-revisión),
:deep(.estado-pill.en-revision) {
  background: #7c4d00;
  color: #fff3cd !important;
}

:deep(.estado-pill.resuelta),
:deep(.estado-pill.cerrada) {
  background: #0f5132;
  color: #d1e7dd !important;
}

:deep(.evidence-link) {
  display: inline-block;
  background: rgba(255, 193, 7, 0.08);
  color: #ffc107 !important;
  border: 1px solid rgba(255, 193, 7, 0.45);
  border-radius: 999px;
  padding: 6px 10px;
  text-decoration: none;
  font-weight: 700;
}

:deep(.evidence-link:hover) {
  background: rgba(255, 193, 7, 0.16);
  text-decoration: underline;
}
</style>
