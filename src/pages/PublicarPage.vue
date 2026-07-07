<template>
  <q-page class="publicar-page q-pa-lg">
    <q-btn
      flat
      no-caps
      color="amber"
      icon="arrow_back"
      label="Volver al marketplace"
      class="q-mb-md q-px-none"
      @click="$router.push('/marketplace')"
    />

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-7">
        <q-card class="panel q-pa-lg">
          <div class="text-h6 text-weight-bold text-white q-mb-md">Publicar oferta</div>

          <q-banner
            v-if="!auth.puedeOperar"
            dense
            class="bg-orange-9 text-white rounded-borders q-mb-md"
          >
            Tu cuenta todavía está pendiente de verificación. Puedes revisar el marketplace, pero no
            publicar ofertas hasta que el administrador apruebe tu cuenta.
          </q-banner>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="text-grey-5 text-caption q-mb-xs">Moneda que vendo</div>
              <q-select
                v-model="monedaOrigen"
                :options="monedasOrigen"
                option-label="codigo"
                option-value="id"
                emit-value
                map-options
                dark
                outlined
                color="amber"
              />
            </div>

            <div class="col-6">
              <div class="text-grey-5 text-caption q-mb-xs">Moneda que recibo</div>
              <q-select
                v-model="monedaDestino"
                :options="monedasDestino"
                option-label="codigo"
                option-value="id"
                emit-value
                map-options
                dark
                outlined
                color="amber"
              />
            </div>
          </div>

          <div class="row justify-between items-center q-mb-xs">
  <div class="text-grey-5">
    Tasa de cambio
  </div>

  <div
    v-if="monedaOrigen && monedaDestino && tasaMercado"
    class="text-caption text-green"
  >
    Tasa actual del mercado:
    <strong>{{ tasaMercado.toFixed(4) }}</strong>
  </div>
</div>
          <q-input
            v-model.number="tasaCambio"
            type="number"
            step="0.01"
            min="0"
            dark
            outlined
            color="amber"
          />

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <div class="text-grey-5 text-caption q-mb-xs">Monto mínimo</div>
              <q-input
                v-model.number="montoMinimo"
                type="number"
                placeholder="10"
                dark
                outlined
                color="amber"
              />
            </div>

            <div class="col-6">
              <div class="text-grey-5 text-caption q-mb-xs">Monto máximo</div>
              <q-input
                v-model.number="montoMaximo"
                type="number"
                placeholder="5000"
                dark
                outlined
                color="amber"
              />
            </div>
          </div>

          <div class="text-grey-5 text-caption q-mb-xs q-mt-md">Monto disponible</div>
          <q-input
            v-model.number="montoDisponible"
            type="number"
            placeholder="5000"
            dark
            outlined
            color="amber"
          />

          <q-separator dark class="q-my-lg" />

          <div class="text-white text-subtitle2 text-weight-bold q-mb-xs">
            Métodos de pago que aceptas
          </div>

          <div class="text-grey-5 text-caption q-mb-sm">
            El comprador solo podrá iniciar la operación usando uno de estos métodos.
          </div>

          <q-select
            v-model="metodoPagoIds"
            :options="metodosPago"
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            multiple
            use-chips
            dark
            outlined
            color="amber"
            popup-content-class="bg-dark text-white"
            :loading="cargandoMetodos"
            @update:model-value="sincronizarMetodosOferta"
          />

          <div
            v-for="metodoOferta in metodosOferta"
            :key="metodoOferta.metodoPagoId"
            class="payment-method-card q-pa-md q-mt-md"
          >
            <div class="row items-center q-mb-sm">
              <q-icon name="payments" color="amber" size="22px" class="q-mr-sm" />

              <div>
                <div class="text-white text-weight-bold">
                  {{ metodoOferta.metodoPagoNombre }}
                </div>

                <div class="text-grey-5 text-caption">
                  Datos que verá el comprador cuando inicie trato.
                </div>
              </div>
            </div>

            <div class="text-grey-5 text-caption q-mb-xs">Alias</div>
            <q-input
              v-model.trim="metodoOferta.alias"
              dark
              outlined
              color="amber"
              placeholder="Ejemplo: Mi Yape principal, BCP soles, PayPal personal"
            />

            <div class="text-grey-5 text-caption q-mb-xs q-mt-md">
              {{ etiquetaDatoRecepcion(metodoOferta.metodoPagoNombre) }}
            </div>

            <q-input
              v-model.trim="metodoOferta.datosRecepcion"
              dark
              outlined
              color="amber"
              :placeholder="placeholderDatoRecepcion(metodoOferta.metodoPagoNombre)"
            />

            <div class="text-grey-5 text-caption q-mb-xs q-mt-md">
              Instrucciones para el comprador
            </div>

            <q-input
              v-model.trim="metodoOferta.instrucciones"
              type="textarea"
              autogrow
              dark
              outlined
              color="amber"
              maxlength="500"
              counter
              placeholder="Ejemplo: Yapea exactamente el monto de la operación y coloca el código del trato en la descripción."
            />
          </div>

          <q-banner dense class="bg-blue-grey-10 text-grey-4 q-mt-md rounded-borders">
            En el marketplace solo se verán los métodos como etiquetas. Tus datos completos se
            mostrarán cuando un comprador inicie una operación.
          </q-banner>

          <q-banner
            v-if="mensaje"
            dense
            class="q-mt-md rounded-borders"
            :class="exito ? 'bg-green-9 text-white' : 'bg-red-9 text-white'"
          >
            {{ mensaje }}
          </q-banner>

          <q-btn
            label="Publicar oferta"
            color="amber"
            text-color="black"
            class="full-width text-weight-bold q-mt-md q-py-sm"
            :loading="cargando"
            :disable="!auth.puedeOperar"
            @click="publicar"
          />
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="panel q-pa-md">
          <div class="row items-center q-mb-md">
            <q-icon name="info" color="amber" size="22px" class="q-mr-sm" />
            <span class="text-white text-weight-bold">Importante</span>
          </div>

          <div class="text-grey-4 q-mb-sm">• Tu oferta será visible para otros usuarios.</div>
          <div class="text-grey-4 q-mb-sm">
            • Solo podrán comprar usando los métodos que aceptaste.
          </div>
          <div class="text-grey-4 q-mb-sm">• No guardes CVV ni número completo de tarjeta.</div>
          <div class="text-grey-4">
            • El comprador subirá comprobante después de pagar por fuera de la plataforma.
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const auth = useAuthStore()

const monedas = ref([])

const monedasOrigen = computed(() => {
  return monedas.value.filter((m) => m.id !== monedaDestino.value)
})

const monedasDestino = computed(() => {
  return monedas.value.filter((m) => m.id !== monedaOrigen.value)
})

const monedaOrigen = ref(null)
const monedaDestino = ref(null)
const tasaMercado = ref(null)
const tasaCambio = ref(null)
const montoMinimo = ref(10)
const montoMaximo = ref(null)
const montoDisponible = ref(null)

const metodosPago = ref([])
const metodoPagoIds = ref([])
const metodosOferta = ref([])
const cargandoMetodos = ref(false)

const mensaje = ref('')
const exito = ref(false)
const cargando = ref(false)

async function cargarMonedas() {
  try {
    const res = await api.get('/moneda')
    monedas.value = res.data
  } catch {
    mensaje.value = 'No se pudieron cargar las monedas.'
    exito.value = false
  }
}

async function cargarMetodosPago() {
  cargandoMetodos.value = true

  try {
    const res = await api.get('/metodopago')
    metodosPago.value = res.data.filter((m) => m.activo !== false)
  } catch {
    mensaje.value = 'No se pudieron cargar los métodos de pago.'
    exito.value = false
  } finally {
    cargandoMetodos.value = false
  }
}

async function actualizarTasaCambio() {
  if (!monedaOrigen.value || !monedaDestino.value) return

  if (monedaOrigen.value === monedaDestino.value) {
    tasaMercado.value = 1
    tasaCambio.value = 1
    return
  }

  const origen = monedas.value.find((m) => m.id === monedaOrigen.value)
  const destino = monedas.value.find((m) => m.id === monedaDestino.value)

  if (!origen || !destino) return

  try {
  const res = await fetch(
    `https://open.er-api.com/v6/latest/${origen.codigo}`
  )

  const data = await res.json()

  if (data.result === 'success') {
    tasaMercado.value = Number(data.rates[destino.codigo].toFixed(4))
    tasaCambio.value = tasaMercado.value
  }
} catch (error) {
  console.error('Error obteniendo tasa:', error)
}
}

function sincronizarMetodosOferta(idsSeleccionados) {
  const anteriores = [...metodosOferta.value]

  metodosOferta.value = idsSeleccionados.map((id) => {
    const existente = anteriores.find((m) => m.metodoPagoId === id)

    if (existente) return existente

    const metodo = metodosPago.value.find((m) => m.id === id)

    return {
      metodoPagoId: id,
      metodoPagoNombre: metodo?.nombre || 'Método de pago',
      alias: metodo?.nombre || '',
      datosRecepcion: '',
      instrucciones: '',
    }
  })
}

function normalizarTexto(valor) {
  return String(valor || '').toLowerCase()
}

function etiquetaDatoRecepcion(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin')) {
    return 'Número celular donde recibirás el pago'
  }

  if (nombre.includes('transferencia') || nombre.includes('banco')) {
    return 'Cuenta bancaria o CCI donde recibirás el pago'
  }

  if (nombre.includes('paypal')) {
    return 'Correo PayPal donde recibirás el pago'
  }

  if (nombre.includes('tarjeta')) {
    return 'Referencia de tarjeta o últimos 4 dígitos'
  }

  return 'Datos para recibir el pago'
}

function placeholderDatoRecepcion(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin')) {
    return 'Ejemplo: 987654321'
  }

  if (nombre.includes('transferencia') || nombre.includes('banco')) {
    return 'Ejemplo: BCP 191-00000000-0-00 / CCI 002...'
  }

  if (nombre.includes('paypal')) {
    return 'Ejemplo: correo@paypal.com'
  }

  if (nombre.includes('tarjeta')) {
    return 'Ejemplo: Visa terminada en 1234'
  }

  return 'Escribe tus datos de recepción'
}

function crearResumenPublico(metodoOferta) {
  const dato = metodoOferta.datosRecepcion || ''

  if (dato.length <= 4) {
    return `${metodoOferta.metodoPagoNombre}: ${dato}`
  }

  return `${metodoOferta.metodoPagoNombre}: ****${dato.slice(-4)}`
}

function validarFormulario() {
  if (!auth.puedeOperar) {
    return 'Tu cuenta debe estar verificada antes de publicar ofertas.'
  }

  if (!monedaOrigen.value || !monedaDestino.value) {
    return 'Selecciona la moneda que vendes y la moneda que recibes.'
  }

  if (monedaOrigen.value === monedaDestino.value) {
    return 'La moneda que vendes y la moneda que recibes deben ser diferentes.'
  }

  if (!tasaCambio.value || tasaCambio.value <= 0) {
    return 'La tasa de cambio debe ser mayor a 0.'
  }

  if (!montoMinimo.value || montoMinimo.value < 10) {
    return 'El monto mínimo debe ser al menos 10.'
  }

  if (!montoMaximo.value || montoMaximo.value <= montoMinimo.value) {
    return 'El monto máximo debe ser mayor al monto mínimo.'
  }

  if (!montoDisponible.value || montoDisponible.value < montoMinimo.value) {
    return 'El monto disponible debe ser mayor o igual al monto mínimo.'
  }

  if (metodosOferta.value.length === 0) {
    return 'Selecciona al menos un método de pago.'
  }

  const incompleto = metodosOferta.value.find(
    (m) => !m.alias || !m.datosRecepcion || !m.instrucciones,
  )

  if (incompleto) {
    return `Completa alias, datos e instrucciones para ${incompleto.metodoPagoNombre}.`
  }

  return ''
}

async function publicar() {
  mensaje.value = ''
  exito.value = false

  const error = validarFormulario()

  if (error) {
    mensaje.value = error
    return
  }

  cargando.value = true

  try {
    await api.post('/oferta', {
      usuarioId: auth.usuario.id,
      monedaOrigenId: monedaOrigen.value,
      monedaDestinoId: monedaDestino.value,
      monedaOrigenNombre: '',
      monedaDestinoNombre: '',
      tipoOperacion: 'Venta',
      tasaCambio: tasaCambio.value,
      montoMinimo: montoMinimo.value,
      montoMaximo: montoMaximo.value,
      montoDisponible: montoDisponible.value,
      estado: 'Activa',
      fechaCreacion: new Date().toISOString(),

      metodoPagoIds: metodoPagoIds.value,

      metodosPago: metodosOferta.value.map((m) => ({
        metodoPagoId: m.metodoPagoId,
        metodoPagoNombre: m.metodoPagoNombre,
        alias: m.alias,
        datosRecepcion: m.datosRecepcion,
        instrucciones: m.instrucciones,
        resumenPublico: crearResumenPublico(m),
      })),
    })

    exito.value = true
    mensaje.value = 'Oferta publicada con éxito.'

    setTimeout(() => router.push('/marketplace'), 1200)
  } catch (e) {
    exito.value = false
    mensaje.value = e.response?.data?.mensaje || 'Error al publicar la oferta.'
  } finally {
    cargando.value = false
  }
}

watch([monedaOrigen, monedaDestino], () => {
  actualizarTasaCambio()
})

onMounted(() => {
  cargarMonedas()
  cargarMetodosPago()
})
</script>

<style scoped>
.publicar-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}

.payment-method-card {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 12px;
}
</style>
