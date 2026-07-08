<template>
  <q-page class="oper-detalle-page q-pa-lg flex flex-center">
    <div v-if="cargando" class="text-center">
      <q-spinner color="amber" size="40px" />
    </div>

    <q-card v-else-if="!operacion" class="panel q-pa-xl text-center" style="max-width: 480px">
      <q-icon name="error_outline" size="48px" color="red" />
      <div class="text-white text-h6 q-mt-md">No se encontró la operación</div>
      <q-btn
        flat
        color="amber"
        label="Volver al marketplace"
        class="q-mt-md"
        @click="$router.push('/marketplace')"
      />
    </q-card>

    <q-card v-else class="panel q-pa-xl" style="max-width: 520px; width: 100%">
      <template v-if="operacion.estado === 'En proceso'">
        <div class="text-h6 text-white text-weight-bold">Operación en proceso</div>
        <div class="text-grey-5 q-mb-lg">Realiza el pago antes de que expire el tiempo</div>

        <div class="text-center q-my-lg">
          <div class="text-h2 text-weight-bold" :class="colorTiempo">
            {{ tiempoFormateado }}
          </div>
          <div class="text-grey-5 q-mt-xs">{{ etiquetaTiempo }}</div>
        </div>

        <q-separator dark class="q-my-md" />
        <datos-operacion :operacion="operacion" :contraparte="contraparte" />

        <q-banner dense rounded class="bg-blue-grey-10 text-grey-4 q-mt-md text-left">
          {{ textoAvisoDisputa }}
        </q-banner>

        <q-banner v-if="mensaje" dense class="bg-red-9 text-white q-mt-md rounded-borders">
          {{ mensaje }}
        </q-banner>

        <template v-if="esComprador">
          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-md q-mb-sm"
            color="positive"
            label="Ya realicé el pago"
            @click="$router.push('/comprobante?operacion=' + operacion.id)"
          />

          <div class="row q-col-gutter-sm">
            <div class="col">
              <q-btn
                class="full-width q-py-sm text-weight-bold"
                color="red"
                outline
                label="Cancelar"
                :loading="cancelando"
                @click="cancelar"
              />
            </div>
            <div class="col">
              <q-btn
                class="full-width q-py-sm text-weight-bold"
                color="grey-7"
                outline
                label="Disputa"
                @click="$router.push('/disputa?operacion=' + operacion.id)"
              />
            </div>
          </div>
        </template>

        <template v-else>
          <q-banner class="bg-grey-9 text-white q-mt-md rounded-borders">
            Esperando que el comprador realice el pago...
          </q-banner>
        </template>
      </template>

      <template v-else-if="operacion.estado === 'Pago enviado'">
        <div class="text-h6 text-white text-weight-bold">Pago enviado</div>
        <div class="text-grey-5 q-mb-lg">
          {{
            esVendedor
              ? 'El comprador subió el comprobante. Verifícalo antes de confirmar.'
              : 'Esperando que el vendedor confirme la recepción del pago.'
          }}
        </div>

        <q-separator dark class="q-my-md" />
        <datos-operacion :operacion="operacion" :contraparte="contraparte" />

        <q-card v-if="comprobante" flat bordered class="comprobante-card q-pa-md q-mt-md">
          <div class="text-grey-5 text-caption q-mb-xs">Comprobante de pago</div>
          <a :href="urlComprobante" target="_blank" class="text-amber text-weight-bold">
            <q-icon name="description" /> Ver comprobante
          </a>
        </q-card>

        <q-banner v-else dense class="bg-red-9 text-white q-mt-md rounded-borders">
          No se encontró el archivo del comprobante. Pide al comprador que lo vuelva a subir.
        </q-banner>

        <q-banner v-if="mensaje" dense class="bg-red-9 text-white q-mt-md rounded-borders">
          {{ mensaje }}
        </q-banner>

        <template v-if="esVendedor">
          <q-banner dense class="bg-orange-9 text-white q-mt-md rounded-borders">
            Verifica que hayas recibido el pago completo antes de confirmar. Esta acción no se puede
            deshacer.
          </q-banner>
          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-md q-mb-sm"
            color="positive"
            label="Confirmar pago recibido"
            :loading="confirmando"
            :disable="!comprobante"
            @click="confirmarRecepcion"
          />
          <q-btn
            class="full-width q-py-sm text-weight-bold"
            color="red"
            outline
            label="Abrir disputa"
            @click="$router.push('/disputa?operacion=' + operacion.id)"
          />
        </template>
        <template v-else>
          <q-spinner color="amber" size="24px" class="q-mt-md" />
        </template>
      </template>

      <template v-else-if="operacion.estado === 'Completada'">
        <div class="text-center">
          <q-icon name="check_circle" size="56px" color="positive" />
          <div class="text-white text-h6 q-mt-md">Intercambio completado correctamente</div>
          <div class="text-grey-5 q-mt-xs">Tu operación se realizó exitosamente</div>

          <q-separator dark class="q-my-md" />
          <datos-operacion :operacion="operacion" :contraparte="contraparte" />

          <q-card
            v-if="comprobante"
            flat
            bordered
            class="comprobante-card q-pa-md q-mt-md text-left"
          >
            <div class="text-grey-5 text-caption q-mb-xs">Comprobante asociado</div>
            <a :href="urlComprobante" target="_blank" class="text-amber text-weight-bold">
              <q-icon name="description" /> Ver comprobante
            </a>
          </q-card>

          <q-banner dense rounded class="bg-blue-grey-10 text-grey-4 q-mt-md text-left">
            {{ textoAvisoDisputa }}
          </q-banner>

          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-lg"
            color="amber"
            text-color="black"
            label="Calificar usuario"
            @click="$router.push('/calificacion?operacion=' + operacion.id)"
          />

          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-sm"
            color="red"
            outline
            label="Abrir disputa"
            :disable="!puedeDisputar"
            @click="$router.push('/disputa?operacion=' + operacion.id)"
          >
            <q-tooltip v-if="!puedeDisputar">
              {{ textoTooltipDisputa }}
            </q-tooltip>
          </q-btn>
        </div>
      </template>

      <template v-else-if="operacion.estado === 'En disputa'">
        <div class="text-center">
          <q-icon name="gavel" size="56px" color="orange" />
          <div class="text-white text-h6 q-mt-md">Operación en disputa</div>
          <div class="text-grey-5 q-mt-sm">
            Un administrador está revisando el caso. Te notificaremos la resolución.
          </div>
          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-lg"
            color="amber"
            text-color="black"
            label="Volver a mis operaciones"
            @click="$router.push('/operacion')"
          />
        </div>
      </template>

      <template v-else-if="operacion.estado === 'Expirada'">
        <div class="text-center">
          <q-icon name="schedule" size="56px" color="orange" />
          <div class="text-white text-h6 q-mt-md">El tiempo expiró</div>
          <div class="text-grey-5 q-mt-sm">
            No se confirmó el pago a tiempo. La oferta fue liberada nuevamente.
          </div>

          <q-banner dense rounded class="bg-blue-grey-10 text-grey-4 q-mt-md text-left">
            {{ textoAvisoDisputa }}
          </q-banner>

          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-lg"
            color="red"
            outline
            label="Abrir disputa"
            :disable="!puedeDisputar"
            @click="$router.push('/disputa?operacion=' + operacion.id)"
          >
            <q-tooltip v-if="!puedeDisputar">
              {{ textoTooltipDisputa }}
            </q-tooltip>
          </q-btn>

          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-sm"
            color="amber"
            text-color="black"
            label="Volver al marketplace"
            @click="$router.push('/marketplace')"
          />
        </div>
      </template>

      <template v-else-if="operacion.estado === 'Cancelada'">
        <div class="text-center">
          <q-icon name="cancel" size="56px" color="red" />
          <div class="text-white text-h6 q-mt-md">Operación cancelada</div>

          <q-banner dense rounded class="bg-blue-grey-10 text-grey-4 q-mt-md text-left">
            {{ textoAvisoDisputa }}
          </q-banner>

          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-lg"
            color="red"
            outline
            label="Abrir disputa"
            :disable="!puedeDisputar"
            @click="$router.push('/disputa?operacion=' + operacion.id)"
          >
            <q-tooltip v-if="!puedeDisputar">
              {{ textoTooltipDisputa }}
            </q-tooltip>
          </q-btn>

          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-sm"
            color="amber"
            text-color="black"
            label="Volver al marketplace"
            @click="$router.push('/marketplace')"
          />
        </div>
      </template>

      <template v-else>
        <div class="text-center">
          <q-icon name="info" size="56px" color="amber" />
          <div class="text-white text-h6 q-mt-md">Estado: {{ operacion.estado }}</div>
          <div class="text-grey-5 q-mt-sm">Código: {{ operacion.codigoOperacion }}</div>
          <q-btn
            class="full-width q-py-sm text-weight-bold q-mt-lg"
            color="amber"
            text-color="black"
            label="Ver mis operaciones"
            @click="$router.push('/operacion')"
          />
        </div>
      </template>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const DatosOperacion = {
  props: ['operacion', 'contraparte'],
  render() {
    return h('div', { class: 'q-mb-sm' }, [
      h('div', { class: 'row justify-between text-grey-4 q-mb-xs' }, [
        h('span', 'Código de operación:'),
        h('span', { class: 'text-white text-weight-bold' }, this.operacion.codigoOperacion),
      ]),
      h('div', { class: 'row justify-between text-grey-4 q-mb-xs' }, [
        h('span', 'Monto:'),
        h('span', { class: 'text-white' }, String(this.operacion.monto)),
      ]),
      h('div', { class: 'row justify-between text-grey-4 q-mb-xs' }, [
        h('span', 'Contraparte:'),
        h('span', { class: 'text-white' }, this.contraparte),
      ]),
    ])
  },
}

const route = useRoute()
const auth = useAuthStore()

const operacionId = Number(route.params.id)

const operacion = ref(null)
const comprobante = ref(null)
const cargando = ref(true)
const cancelando = ref(false)
const confirmando = ref(false)
const mensaje = ref('')

const segundosRestantes = ref(0)
let intervaloCountdown = null
let intervaloSync = null

const esComprador = computed(
  () => operacion.value && Number(auth.usuario.id) === Number(operacion.value.compradorId),
)
const esVendedor = computed(
  () => operacion.value && Number(auth.usuario.id) === Number(operacion.value.vendedorId),
)

const contraparte = computed(() => {
  if (!operacion.value) return ''
  return Number(auth.usuario.id) === Number(operacion.value.compradorId)
    ? operacion.value.vendedorNombre
    : operacion.value.compradorNombre
})

const urlComprobante = computed(() => {
  if (!comprobante.value) return '#'
  const base = api.defaults.baseURL.replace(/\/api\/?$/, '')
  return base + comprobante.value.rutaArchivo
})

const tiempoFormateado = computed(() => {
  const s = Math.max(0, segundosRestantes.value)
  const min = Math.floor(s / 60)
    .toString()
    .padStart(2, '0')
  const seg = (s % 60).toString().padStart(2, '0')
  return `${min}:${seg}`
})

const colorTiempo = computed(() => {
  if (segundosRestantes.value <= 60) return 'text-red'
  if (segundosRestantes.value <= 300) return 'text-orange'
  return 'text-amber'
})

const etiquetaTiempo = computed(() =>
  segundosRestantes.value > 0 ? 'Tiempo restante' : 'Tiempo expirado',
)

const DIAS_LIMITE_DISPUTA = 30
const MS_DIA = 24 * 60 * 60 * 1000
const ESTADOS_ACTIVOS_DISPUTA = ['En proceso', 'Pago enviado']
const ESTADOS_FINALIZADOS_DISPUTA = ['Completada', 'Cancelada', 'Expirada']

const esParticipante = computed(() => Boolean(esComprador.value || esVendedor.value))

const fechaBaseDisputa = computed(() => {
  if (!operacion.value || !ESTADOS_FINALIZADOS_DISPUTA.includes(operacion.value.estado)) {
    return null
  }

  const valor =
    operacion.value.fechaFin || operacion.value.fechaLiberacion || operacion.value.fechaInicio
  if (!valor) return null

  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
})

const fechaLimiteDisputa = computed(() => {
  if (!fechaBaseDisputa.value) return null

  const limite = new Date(fechaBaseDisputa.value)
  limite.setDate(limite.getDate() + DIAS_LIMITE_DISPUTA)
  return limite
})

const dentroDelPlazoDisputa = computed(() => {
  if (!operacion.value) return false
  if (ESTADOS_ACTIVOS_DISPUTA.includes(operacion.value.estado)) return true
  if (!fechaLimiteDisputa.value) return false

  return Date.now() <= fechaLimiteDisputa.value.getTime()
})

const diasRestantesDisputa = computed(() => {
  if (!fechaLimiteDisputa.value) return null

  return Math.max(0, Math.ceil((fechaLimiteDisputa.value.getTime() - Date.now()) / MS_DIA))
})

const puedeDisputar = computed(() => {
  if (!operacion.value || !esParticipante.value) return false
  if (operacion.value.estado === 'En disputa') return false
  if (ESTADOS_ACTIVOS_DISPUTA.includes(operacion.value.estado)) return true
  if (ESTADOS_FINALIZADOS_DISPUTA.includes(operacion.value.estado))
    return dentroDelPlazoDisputa.value

  return false
})

const textoTooltipDisputa = computed(() => {
  if (!esParticipante.value) return 'No participas en esta operación.'
  if (operacion.value?.estado === 'En disputa')
    return 'Esta operación ya tiene una disputa abierta.'
  if (
    ESTADOS_FINALIZADOS_DISPUTA.includes(operacion.value?.estado) &&
    !dentroDelPlazoDisputa.value
  ) {
    return `El plazo de ${DIAS_LIMITE_DISPUTA} días calendario para disputar ya venció.`
  }
  return 'Abrir disputa'
})

const textoAvisoDisputa = computed(() => {
  if (!operacion.value) return ''

  if (ESTADOS_ACTIVOS_DISPUTA.includes(operacion.value.estado)) {
    return `Puedes abrir disputa durante la operación. Si el trato se cierra, tendrás ${DIAS_LIMITE_DISPUTA} días calendario desde el cierre para reportar un problema con pruebas.`
  }

  if (operacion.value.estado === 'En disputa') {
    return 'La operación ya está en disputa. Administración revisará el caso y te notificará la resolución.'
  }

  if (!ESTADOS_FINALIZADOS_DISPUTA.includes(operacion.value.estado)) {
    return 'Este estado no admite apertura de disputa.'
  }

  if (!fechaLimiteDisputa.value) {
    return `Operación cerrada. No se encontró una fecha válida para calcular el plazo de ${DIAS_LIMITE_DISPUTA} días.`
  }

  const fecha = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fechaLimiteDisputa.value)

  if (!dentroDelPlazoDisputa.value) {
    return `El plazo para abrir disputa venció el ${fecha}.`
  }

  return `Si detectas un problema, puedes abrir disputa hasta el ${fecha}. Quedan ${diasRestantesDisputa.value} día(s).`
})

async function cargar() {
  try {
    const res = await api.get(`/operacion/${operacionId}`)
    operacion.value = res.data
    segundosRestantes.value = res.data.segundosRestantes ?? 0

    if (res.data.estado !== 'En proceso') {
      detenerTemporizadores()
    }

    if (['Pago enviado', 'Completada', 'En disputa'].includes(res.data.estado)) {
      try {
        const c = await api.get(`/comprobantepago/operacion/${operacionId}`)
        comprobante.value = c.data
      } catch {
        comprobante.value = null
      }
    } else {
      comprobante.value = null
    }
  } catch {
    operacion.value = null
  } finally {
    cargando.value = false
  }
}

async function cancelar() {
  mensaje.value = ''
  cancelando.value = true
  try {
    await api.put(`/operacion/${operacionId}/cancelar`)
    await cargar()
  } catch (e) {
    mensaje.value = e.response?.data?.mensaje || 'No se pudo cancelar la operación.'
  } finally {
    cancelando.value = false
  }
}

async function confirmarRecepcion() {
  mensaje.value = ''
  confirmando.value = true
  try {
    await api.put(`/operacion/${operacionId}/confirmar-recepcion`)
    await cargar()
  } catch (e) {
    mensaje.value = e.response?.data?.mensaje || 'No se pudo confirmar el pago.'
  } finally {
    confirmando.value = false
  }
}

function detenerTemporizadores() {
  if (intervaloCountdown) clearInterval(intervaloCountdown)
  if (intervaloSync) clearInterval(intervaloSync)
}

onMounted(async () => {
  await cargar()

  intervaloCountdown = setInterval(() => {
    if (segundosRestantes.value > 0) segundosRestantes.value -= 1
  }, 1000)

  intervaloSync = setInterval(cargar, 8000)
})

onUnmounted(detenerTemporizadores)
</script>

<style scoped>
.oper-detalle-page {
  background: #0d1117;
  min-height: 100vh;
}
.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}
.comprobante-card {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
}
</style>
