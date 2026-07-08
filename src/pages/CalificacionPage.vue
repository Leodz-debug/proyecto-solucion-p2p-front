<template>
  <q-page class="calificacion-page q-pa-lg">
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
          {{ modoCalificar ? 'Calificar usuario' : 'Mis calificaciones' }}
        </div>
        <div class="text-grey-5">
          {{
            modoCalificar
              ? 'Tu opinión ayuda a que otros usuarios sepan con quién están operando.'
              : 'Historial de calificaciones dadas y recibidas en los últimos 30 días.'
          }}
        </div>
      </div>

      <div v-if="operacion" class="col-12 col-md-auto">
        <q-badge :color="colorEstado(operacion.estado)" class="q-pa-sm">
          {{ operacion.estado }}
        </q-badge>
      </div>
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="42px" />
      <div class="text-grey-5 q-mt-sm">Cargando información...</div>
    </div>

    <template v-else-if="!modoCalificar">
      <q-card class="panel q-pa-lg q-mb-lg">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <div class="metric-card q-pa-md">
              <div class="text-grey-5 text-caption">Dadas</div>
              <div class="text-white text-h5 text-weight-bold">
                {{ calificacionesDadas.length }}
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="metric-card q-pa-md">
              <div class="text-grey-5 text-caption">Recibidas</div>
              <div class="text-white text-h5 text-weight-bold">
                {{ calificacionesRecibidas.length }}
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="metric-card q-pa-md">
              <div class="text-grey-5 text-caption">Promedio recibido</div>
              <div class="text-white text-h5 text-weight-bold">{{ promedioRecibido }}</div>
            </div>
          </div>
        </div>
      </q-card>

      <q-card v-if="historialCalificaciones.length === 0" class="panel q-pa-xl text-center">
        <q-icon name="star" color="amber" size="54px" />
        <div class="text-white text-h6 q-mt-md">No hay calificaciones recientes</div>
        <div class="text-grey-5 q-mt-xs">
          Cuando completes una operación podrás calificar a la contraparte desde Mis operaciones.
        </div>
        <q-btn
          color="amber"
          text-color="black"
          label="Ir a operaciones"
          class="q-mt-lg"
          @click="router.push('/operacion')"
        />
      </q-card>

      <div v-else class="row q-col-gutter-md">
        <div v-for="cal in historialCalificaciones" :key="cal.id" class="col-12 col-md-6">
          <q-card class="panel q-pa-lg full-height">
            <div class="row items-start justify-between q-mb-md">
              <div>
                <div class="text-white text-weight-bold">
                  {{ cal.tipo === 'Recibida' ? 'Calificación recibida' : 'Calificación dada' }}
                </div>
                <div class="text-grey-5 text-caption">
                  Operación {{ cal.codigoOperacion || `#${cal.operacionId}` }}
                </div>
              </div>

              <q-badge :color="cal.tipo === 'Recibida' ? 'green' : 'blue-grey'" class="q-pa-sm">
                {{ cal.tipo }}
              </q-badge>
            </div>

            <q-rating
              :model-value="Number(cal.puntaje)"
              readonly
              size="26px"
              color="amber"
              icon="star_border"
              icon-selected="star"
            />

            <div class="row justify-between text-grey-4 q-mt-md q-mb-xs">
              <span>Calificado:</span>
              <span class="text-white text-right">{{ cal.usuarioCalificadoNombre }}</span>
            </div>

            <div class="row justify-between text-grey-4 q-mb-xs">
              <span>Calificador:</span>
              <span class="text-white text-right">{{ cal.usuarioCalificadorNombre }}</span>
            </div>

            <div class="row justify-between text-grey-4 q-mb-xs">
              <span>Monto:</span>
              <span class="text-white">{{ formatearMonto(cal.monto) }}</span>
            </div>

            <div class="row justify-between text-grey-4 q-mb-xs">
              <span>Fecha:</span>
              <span class="text-white text-right">{{ formatearFecha(cal.fechaRegistro) }}</span>
            </div>

            <div class="comentario-box q-mt-md">
              {{ cal.comentario || 'Sin comentario.' }}
            </div>
          </q-card>
        </div>
      </div>
    </template>

    <q-card v-else-if="!operacion" class="panel q-pa-xl text-center">
      <q-icon name="error_outline" color="red-4" size="54px" />
      <div class="text-white text-h6 q-mt-md">No se encontró la operación</div>
      <div class="text-grey-5 q-mt-xs">
        Ingresa desde operaciones para calificar a la contraparte correcta.
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
            <q-avatar color="amber" text-color="black" size="54px">
              {{ inicialContraparte }}
            </q-avatar>

            <div class="q-ml-md">
              <div class="text-white text-weight-bold text-subtitle1">
                {{ contraparteNombre }}
              </div>
              <div class="text-grey-5 text-caption">{{ rolContraparte }} de la operación</div>
            </div>
          </div>

          <q-separator dark class="q-my-md" />

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Código:</span>
            <span class="text-white text-weight-bold">{{ operacion.codigoOperacion }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Monto:</span>
            <span class="text-white">{{ formatearMonto(operacion.monto) }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Tu rol:</span>
            <span class="text-white">{{ rolUsuario }}</span>
          </div>

          <div class="row justify-between text-grey-4 q-mb-sm">
            <span>Finalizó:</span>
            <span class="text-white text-right">{{ formatearFecha(operacion.fechaFin) }}</span>
          </div>

          <q-banner dense rounded class="bg-blue-grey-10 text-grey-4 q-mt-md">
            Se califica a la contraparte, no a ti mismo. Por eso el usuario se detecta desde la
            operación.
          </q-banner>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card class="panel q-pa-lg">
          <q-banner v-if="!esParticipante" dense rounded class="bg-red-9 text-white q-mb-md">
            No puedes calificar esta operación porque no participas en ella.
          </q-banner>

          <q-banner v-else-if="!esCompletada" dense rounded class="bg-orange-9 text-white q-mb-md">
            Solo puedes calificar cuando la operación esté completada. Estado actual:
            <b>{{ operacion.estado }}</b
            >.
          </q-banner>

          <q-banner v-else-if="yaCalificada" dense rounded class="bg-green-9 text-white q-mb-md">
            Ya registraste la calificación para esta contraparte en esta operación.
          </q-banner>

          <template v-if="puedeEditar">
            <div class="text-white text-subtitle1 text-weight-bold q-mb-xs">
              ¿Cómo fue tu experiencia con {{ contraparteNombre }}?
            </div>
            <div class="text-grey-5 text-caption q-mb-md">
              Elige de 1 a 5 estrellas. Sé justo: esto alimenta la reputación pública del usuario.
            </div>

            <div class="rating-box q-pa-md text-center q-mb-md">
              <q-rating
                v-model="puntaje"
                size="44px"
                color="amber"
                icon="star_border"
                icon-selected="star"
                :max="5"
              />
              <div class="text-amber text-weight-bold q-mt-sm">
                {{ textoPuntaje }}
              </div>
            </div>

            <q-input
              v-model.trim="comentario"
              label="Comentario público opcional"
              type="textarea"
              autogrow
              dark
              outlined
              color="amber"
              counter
              maxlength="300"
              placeholder="Ejemplo: respondió rápido y confirmó el pago sin problemas."
            />
          </template>

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
                label="Volver a operaciones"
                class="full-width"
                @click="router.push('/operacion')"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-btn
                color="amber"
                text-color="black"
                label="Enviar calificación"
                class="full-width text-weight-bold"
                :loading="loading"
                :disable="!puedeEnviar"
                @click="guardar"
              />
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const operacion = ref(null)
const historialCalificaciones = ref([])
const cargando = ref(true)
const loading = ref(false)
const puntaje = ref(5)
const comentario = ref('')
const mensaje = ref('')
const ok = ref(false)

const operacionId = computed(() => Number(route.query.operacion))
const modoCalificar = computed(() => Number.isFinite(operacionId.value) && operacionId.value > 0)
const usuarioActualId = computed(() => Number(auth.usuario?.id))

const calificacionesDadas = computed(() =>
  historialCalificaciones.value.filter((c) => c.tipo === 'Dada'),
)
const calificacionesRecibidas = computed(() =>
  historialCalificaciones.value.filter((c) => c.tipo === 'Recibida'),
)
const promedioRecibido = computed(() => {
  if (calificacionesRecibidas.value.length === 0) return 'Sin datos'
  const total = calificacionesRecibidas.value.reduce((sum, c) => sum + Number(c.puntaje || 0), 0)
  return (total / calificacionesRecibidas.value.length).toFixed(1)
})

const esComprador = computed(
  () => operacion.value && Number(operacion.value.compradorId) === usuarioActualId.value,
)

const esVendedor = computed(
  () => operacion.value && Number(operacion.value.vendedorId) === usuarioActualId.value,
)

const esParticipante = computed(() => Boolean(esComprador.value || esVendedor.value))
const esCompletada = computed(() => operacion.value?.estado === 'Completada')

const usuarioCalificadoId = computed(() => {
  if (!operacion.value || !esParticipante.value) return null
  return esComprador.value ? operacion.value.vendedorId : operacion.value.compradorId
})

const contraparteNombre = computed(() => {
  if (!operacion.value || !esParticipante.value) return 'No disponible'
  return esComprador.value
    ? operacion.value.vendedorNombre || `Usuario #${operacion.value.vendedorId}`
    : operacion.value.compradorNombre || `Usuario #${operacion.value.compradorId}`
})

const inicialContraparte = computed(() => contraparteNombre.value.charAt(0).toUpperCase() || 'U')
const rolUsuario = computed(() =>
  esComprador.value ? 'Comprador' : esVendedor.value ? 'Vendedor' : 'No participante',
)
const rolContraparte = computed(() =>
  esComprador.value ? 'Vendedor' : esVendedor.value ? 'Comprador' : 'Usuario',
)

const yaCalificada = computed(() => {
  if (!usuarioCalificadoId.value) return false

  return historialCalificaciones.value.some(
    (c) =>
      Number(c.operacionId) === Number(operacionId.value) &&
      Number(c.usuarioCalificadoId) === Number(usuarioCalificadoId.value),
  )
})

const puedeEditar = computed(
  () => esParticipante.value && esCompletada.value && !yaCalificada.value && !ok.value,
)

const puedeEnviar = computed(
  () =>
    puedeEditar.value &&
    !loading.value &&
    Number.isInteger(Number(puntaje.value)) &&
    Number(puntaje.value) >= 1 &&
    Number(puntaje.value) <= 5 &&
    usuarioCalificadoId.value !== null &&
    Number(usuarioCalificadoId.value) !== usuarioActualId.value,
)

const textoPuntaje = computed(() => {
  const textos = {
    1: 'Muy mala experiencia',
    2: 'Mala experiencia',
    3: 'Regular',
    4: 'Buena experiencia',
    5: 'Excelente experiencia',
  }

  return textos[Number(puntaje.value)] || 'Selecciona una calificación'
})

async function cargar() {
  cargando.value = true
  mensaje.value = ''

  try {
    await cargarHistorialCalificaciones()

    if (!modoCalificar.value) return

    const resOperacion = await api.get(`/operacion/${operacionId.value}`)
    operacion.value = resOperacion.data
  } catch (error) {
    console.error('Error al cargar pantalla de calificación:', error)
    operacion.value = null
  } finally {
    cargando.value = false
  }
}

async function cargarHistorialCalificaciones() {
  try {
    const res = await api.get('/calificacion/mis-calificaciones?dias=30')
    historialCalificaciones.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Error al cargar historial de calificaciones:', error)
    historialCalificaciones.value = []
  }
}

async function guardar() {
  mensaje.value = ''
  ok.value = false

  if (!puedeEnviar.value) {
    mensaje.value = 'La operación no está lista para ser calificada.'
    return
  }

  loading.value = true

  try {
    await api.post('/calificacion', {
      operacionId: operacionId.value,
      usuarioCalificadoId: usuarioCalificadoId.value,
      puntaje: Number(puntaje.value),
      comentario: comentario.value.trim() || null,
      fechaRegistro: new Date().toISOString(),
    })

    ok.value = true
    mensaje.value = 'Calificación registrada. ¡Gracias por ayudar a la comunidad!'

    setTimeout(() => {
      router.push('/calificacion')
    }, 1200)
  } catch (e) {
    ok.value = false
    mensaje.value = e.response?.data?.mensaje || 'Error al registrar la calificación.'
  } finally {
    loading.value = false
  }
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
.calificacion-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}

.rating-box,
.metric-card,
.comentario-box {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 14px;
}

.comentario-box {
  color: #e6edf3;
  padding: 12px;
  min-height: 48px;
  white-space: pre-wrap;
}
</style>
