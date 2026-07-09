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

          <div class="row justify-between items-center q-mb-xs q-mt-md">
            <div class="text-grey-5">Tasa de cambio</div>

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
            Formas en las que recibirás el pago
          </div>

          <div class="text-grey-5 text-caption q-mb-sm">
            El comprador solo podrá iniciar la operación usando uno de estos métodos. Puedes
            rellenar los datos desde tus métodos guardados o escribirlos manualmente para esta
            oferta.
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
              <q-avatar color="amber" text-color="black" size="38px" class="q-mr-sm">
                <q-icon :name="iconoMetodo(metodoOferta.metodoPagoNombre)" />
              </q-avatar>

              <div class="col">
                <div class="text-white text-weight-bold">
                  {{ metodoOferta.metodoPagoNombre }}
                </div>

                <div class="text-grey-5 text-caption">
                  Datos que verá el comprador cuando inicie el trato.
                </div>
              </div>

              <q-badge
                v-if="metodoOferta.metodoGuardado"
                color="green-8"
                text-color="white"
                class="q-pa-xs"
              >
                Rellenado desde guardado
              </q-badge>
            </div>

            <div class="text-grey-5 text-caption q-mb-xs">Usar un método guardado de este tipo</div>

            <q-select
              v-model="metodoOferta.metodoGuardado"
              :options="metodosGuardadosCompatibles(metodoOferta.metodoPagoId)"
              option-label="alias"
              clearable
              dark
              outlined
              color="amber"
              popup-content-class="bg-dark text-white"
              :disable="metodosGuardadosCompatibles(metodoOferta.metodoPagoId).length === 0"
              @update:model-value="aplicarMetodoGuardado(metodoOferta)"
            >
              <template #selected-item="scope">
                <q-chip dense color="blue-grey-8" text-color="white">
                  {{ scope.opt.alias || scope.opt.metodoPagoNombre }}
                </q-chip>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="iconoMetodo(scope.opt.metodoPagoNombre)" color="amber" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.alias || scope.opt.metodoPagoNombre }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.resumenPublico }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div
              v-if="metodosGuardadosCompatibles(metodoOferta.metodoPagoId).length === 0"
              class="text-grey-6 text-caption q-mt-xs"
            >
              No tienes métodos guardados de este tipo. Puedes escribir los datos manualmente.
            </div>

            <div class="text-grey-5 text-caption q-mb-xs q-mt-md">Alias que verá el comprador</div>
            <q-input
              v-model.trim="metodoOferta.alias"
              dark
              outlined
              color="amber"
              placeholder="Ejemplo: Yape Juliet, BCP soles, PayPal personal"
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
              :placeholder="instruccionesSugeridas(metodoOferta.metodoPagoNombre)"
            />
          </div>

          <q-banner dense class="bg-blue-grey-10 text-grey-4 q-mt-md rounded-borders">
            En el marketplace solo se verán etiquetas como Yape o Plin. Tus datos completos se
            mostrarán recién cuando un comprador inicie una operación contigo.
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

          <div class="text-grey-4 q-mb-sm">
            • Cuando vendes, tú defines dónde recibirás el dinero.
          </div>
          <div class="text-grey-4 q-mb-sm">
            • Cuando compras, no registras método de pago: pagas al vendedor por fuera y subes
            voucher.
          </div>
          <div class="text-grey-4 q-mb-sm">
            • Yape/Plin aquí son manuales. No hay confirmación automática como una pasarela
            empresarial.
          </div>
          <div class="text-grey-4 q-mb-sm">• No guardes CVV ni número completo de tarjeta.</div>
          <q-btn
            outline
            color="amber"
            icon="settings"
            label="Gestionar métodos guardados"
            class="full-width q-mt-md"
            @click="$router.push('/metodos-pago')"
          />
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
import {
  crearResumenPublico,
  datoRecepcionDesdeDatos,
  etiquetaDatoRecepcion,
  iconoMetodo,
  instruccionesSugeridas,
  placeholderDatoRecepcion,
} from '@/utils/paymentMethods'

const router = useRouter()
const auth = useAuthStore()

const monedas = ref([])

const monedasOrigen = computed(() => monedas.value.filter((m) => m.id !== monedaDestino.value))
const monedasDestino = computed(() => monedas.value.filter((m) => m.id !== monedaOrigen.value))

const monedaOrigen = ref(null)
const monedaDestino = ref(null)
const tasaMercado = ref(null)
const tasaCambio = ref(null)
const montoMinimo = ref(10)
const montoMaximo = ref(null)
const montoDisponible = ref(null)

const metodosPago = ref([])
const metodosGuardados = ref([])
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
    const [resCatalogo, resGuardados] = await Promise.all([
      api.get('/metodopago'),
      api.get('/usuariometodopago/mis-metodos'),
    ])

    metodosPago.value = Array.isArray(resCatalogo.data)
      ? resCatalogo.data.filter((m) => m.activo !== false)
      : []

    metodosGuardados.value = Array.isArray(resGuardados.data) ? resGuardados.data : []
  } catch {
    mensaje.value = 'No se pudieron cargar los métodos de recepción.'
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
    const res = await fetch(`https://open.er-api.com/v6/latest/${origen.codigo}`)
    const data = await res.json()

    if (data.result === 'success' && data.rates?.[destino.codigo]) {
      tasaMercado.value = Number(data.rates[destino.codigo].toFixed(4))
      tasaCambio.value = tasaMercado.value
    }
  } catch (error) {
    console.error('Error obteniendo tasa:', error)
  }
}

function sincronizarMetodosOferta(idsSeleccionados = []) {
  const anteriores = [...metodosOferta.value]

  metodosOferta.value = idsSeleccionados.map((id) => {
    const existente = anteriores.find((m) => m.metodoPagoId === id)
    if (existente) return existente

    const metodo = metodosPago.value.find((m) => m.id === id)
    const nombre = metodo?.nombre || 'Método de pago'
    const compatibles = metodosGuardadosCompatibles(id)
    const guardado = compatibles[0] || null

    const nuevo = {
      metodoPagoId: id,
      metodoPagoNombre: nombre,
      metodoGuardado: guardado,
      alias: nombre,
      datosRecepcion: '',
      instrucciones: instruccionesSugeridas(nombre),
      resumenPublico: '',
    }

    if (guardado) aplicarMetodoGuardado(nuevo)

    return nuevo
  })
}

function metodosGuardadosCompatibles(metodoPagoId) {
  return metodosGuardados.value.filter(
    (metodo) => metodo.activo !== false && Number(metodo.metodoPagoId) === Number(metodoPagoId),
  )
}

function obtenerDatosGuardados(metodoGuardado) {
  const datos = metodoGuardado?.datosPago

  if (!datos) return {}
  if (typeof datos === 'object') return datos

  try {
    return JSON.parse(datos)
  } catch {
    return {}
  }
}

function aplicarMetodoGuardado(metodoOferta) {
  const guardado = metodoOferta.metodoGuardado

  if (!guardado) {
    metodoOferta.resumenPublico = crearResumenPublico(
      metodoOferta.metodoPagoNombre,
      { referencia: metodoOferta.datosRecepcion },
      metodoOferta.alias,
    )
    return
  }

  const datos = obtenerDatosGuardados(guardado)

  metodoOferta.alias = guardado.alias || metodoOferta.metodoPagoNombre
  metodoOferta.datosRecepcion = datoRecepcionDesdeDatos(metodoOferta.metodoPagoNombre, datos)
  metodoOferta.instrucciones ||= instruccionesSugeridas(metodoOferta.metodoPagoNombre)
  metodoOferta.resumenPublico =
    guardado.resumenPublico ||
    crearResumenPublico(metodoOferta.metodoPagoNombre, datos, metodoOferta.alias)
}

function crearResumenMetodoOferta(metodoOferta) {
  if (metodoOferta.resumenPublico && metodoOferta.metodoGuardado) return metodoOferta.resumenPublico

  return crearResumenPublico(
    metodoOferta.metodoPagoNombre,
    { referencia: metodoOferta.datosRecepcion },
    metodoOferta.alias,
  )
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
    return 'Selecciona al menos una forma de recepción de dinero.'
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
        resumenPublico: crearResumenMetodoOferta(m),
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
