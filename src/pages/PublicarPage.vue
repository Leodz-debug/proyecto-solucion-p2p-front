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

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="text-grey-5 text-caption q-mb-xs">Moneda que vendo</div>
              <q-select
                v-model="monedaOrigen"
                :options="monedas"
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
                :options="monedas"
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

          <div class="text-grey-5 text-caption q-mb-xs q-mt-md">Tasa de cambio</div>
          <q-input
            v-model.number="tasaCambio"
            type="number"
            placeholder="3.75"
            dark
            outlined
            color="amber"
          />

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <div class="text-grey-5 text-caption q-mb-xs">Monto mínimo (mínimo 10)</div>
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

          <div class="text-grey-5 text-caption q-mb-xs q-mt-md">Método de pago</div>
          <q-select
            v-model="metodoPago"
            :options="['Transferencia bancaria', 'Yape', 'Plin', 'PayPal']"
            dark
            outlined
            color="amber"
          />

          <q-banner
            v-if="mensaje"
            dense
            class="q-mt-md rounded-borders"
            :class="exito ? 'bg-green-9 text-white' : 'bg-red-9 text-white'"
            >{{ mensaje }}</q-banner
          >

          <q-btn
            label="Publicar oferta"
            color="amber"
            text-color="black"
            class="full-width text-weight-bold q-mt-md q-py-sm"
            :loading="cargando"
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
          <div class="text-grey-4 q-mb-sm">• Tu oferta será visible para todos los usuarios</div>
          <div class="text-grey-4 q-mb-sm">
            • Asegúrate de tener los fondos disponibles antes de publicar
          </div>
          <div class="text-grey-4">• El tiempo de respuesta debe ser menor a 15 minutos</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const auth = useAuthStore()

const monedas = ref([])
const monedaOrigen = ref(null)
const monedaDestino = ref(null)
const tasaCambio = ref(null)
const montoMinimo = ref(10)
const montoMaximo = ref(null)
const montoDisponible = ref(null)
const metodoPago = ref(null)
const mensaje = ref('')
const exito = ref(false)
const cargando = ref(false)

async function cargarMonedas() {
  try {
    const res = await api.get('/moneda')
    monedas.value = res.data
  } catch {
    console.error('Error al cargar monedas')
  }
}

async function publicar() {
  mensaje.value = ''

  // Validaciones
  if (
    tasaCambio.value <= 0 ||
    montoMinimo.value < 10 ||
    (montoMaximo.value !== null && montoMaximo.value <= montoMinimo.value)
  ) {
    exito.value = false
    mensaje.value = 'Revisa los montos: Mínimo 10, máximo mayor al mínimo, y tasa positiva.'
    return
  }

  cargando.value = true
  try {
    // Enviamos los campos que tu DTO (OfertaDto) espera en C#
    await api.post('/oferta', {
      usuarioId: auth.usuario.id,
      monedaOrigenId: monedaOrigen.value,
      monedaDestinoId: monedaDestino.value,
      monedaOrigenNombre: '', // Requerido por el DTO
      monedaDestinoNombre: '', // Requerido por el DTO
      tipoOperacion: 'Venta',
      tasaCambio: tasaCambio.value,
      montoMinimo: montoMinimo.value,
      montoMaximo: montoMaximo.value,
      montoDisponible: montoDisponible.value,
      metodoPago: metodoPago.value,
      estado: 'Activa',
      fechaCreacion: new Date().toISOString(), // Requerido por el DTO
    })
    exito.value = true
    mensaje.value = 'Oferta publicada con éxito.'
    setTimeout(() => router.push('/marketplace'), 1200)
  } catch {
    exito.value = false
    mensaje.value = 'Error al publicar la oferta.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarMonedas)
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
</style>
