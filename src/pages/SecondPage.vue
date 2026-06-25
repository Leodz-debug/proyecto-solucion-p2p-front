<template>
  <q-page class="publicar-page q-pa-lg">
    <div class="q-mb-md">
      <q-btn 
        flat 
        color="amber" 
        icon="arrow_back" 
        label="Volver al marketplace" 
        no-caps 
        class="text-weight-bold"
        @click="$router.push('/')"
      />
    </div>

    <div class="row q-col-gutter-xl">
      <div class="col-12 col-md-8">
        <q-card class="panel-card q-pa-xl">
          <div class="text-h4 text-weight-bold text-white q-mb-xl">Publicar oferta</div>
          
          <q-form @submit.prevent="handlePublicar" class="q-gutter-y-lg">
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey-4 q-mb-xs">Moneda que vendo</div>
                <q-select
                  v-model="form.monedaOrigenId"
                  :options="monedas"
                  option-value="id"
                  option-label="nombre"
                  emit-value
                  map-options
                  dark
                  outlined
                  color="amber"
                  popup-content-class="bg-panel-dropdown"
                  placeholder="Seleccionar"
                />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey-4 q-mb-xs">Moneda que recibo</div>
                <q-select
                  v-model="form.monedaDestinoId"
                  :options="monedas"
                  option-value="id"
                  option-label="nombre"
                  emit-value
                  map-options
                  dark
                  outlined
                  color="amber"
                  popup-content-class="bg-panel-dropdown"
                  placeholder="Seleccionar"
                />
              </div>
            </div>

            <div>
              <div class="text-subtitle2 text-grey-4 q-mb-xs">Tasa de cambio</div>
              <q-input
                v-model.number="form.tasaCambio"
                type="number"
                step="0.01"
                dark
                outlined
                color="amber"
                placeholder="3.75"
              />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey-4 q-mb-xs">Monto mínimo</div>
                <q-input
                  v-model.number="form.montoMinimo"
                  type="number"
                  step="0.01"
                  dark
                  outlined
                  color="amber"
                  placeholder="100"
                />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey-4 q-mb-xs">Monto máximo</div>
                <q-input
                  v-model.number="form.montoMaximo"
                  type="number"
                  step="0.01"
                  dark
                  outlined
                  color="amber"
                  placeholder="5000"
                />
              </div>
            </div>

            <div>
              <div class="text-subtitle2 text-grey-4 q-mb-xs">Método de pago</div>
              <q-input
                v-model="metodoPagoTexto"
                dark
                outlined
                color="amber"
                placeholder="Transferencia bancaria, Yape, Plin"
              />
            </div>

            <q-banner v-if="feedback.mensaje" dense class="rounded-borders text-white q-mt-md" :class="feedback.esExito ? 'bg-green-9' : 'bg-red-9'">
              <template v-slot:avatar>
                <q-icon :name="feedback.esExito ? 'check_circle' : 'error'" color="white" />
              </template>
              {{ feedback.mensaje }}
            </q-banner>

            <div class="q-pt-md">
              <q-btn
                label="Publicar oferta"
                color="amber"
                text-color="black"
                class="text-weight-bold full-width btn-submit text-subtitle1"
                type="submit"
                no-caps
                :loading="loading"
              />
            </div>

          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="important-card q-pa-lg text-grey-4">
          <div class="text-amber text-weight-bold text-subtitle1 q-mb-md row items-center">
            <q-icon name="info" color="amber" size="22px" class="q-mr-xs" /> 
            Importante
          </div>
          <ul class="q-pl-md q-gutter-y-md custom-list">
            <li>Tu oferta será visible para todos los usuarios</li>
            <li>Asegúrate de tener los fondos disponibles antes de publicar</li>
            <li>El tiempo de respuesta debe ser menor a 15 minutos</li>
          </ul>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const monedas = ref([])
const metodoPagoTexto = ref('Transferencia bancaria, Yape, Plin')

const feedback = ref({
  mensaje: '',
  esExito: false
})

// Configuración directa de Axios apuntando al puerto de tu backend .NET
const api = axios.create({
  baseURL: 'https://localhost:7231' // Cambia el puerto si tu backend usa otro diferente
})

// Estructura exacta que espera recibir tu OfertaDto en el backend
const form = ref({
  id: 0,
  usuarioId: 1, // Se asigna el ID del usuario logueado (ejemplo: Juan Pérez)
  monedaOrigenId: null,
  monedaDestinoId: null,
  monedaOrigenNombre: "",
  monedaDestinoNombre: "",
  tipoOperacion: 'Venta', // 'Venta' u 'Compra' según lo que vendes
  tasaCambio: null,
  montoMinimo: null,
  montoMaximo: null,
  montoDisponible: 5000, // Se inicializa con el máximo disponible por defecto
  estado: 'Activa',
  fechaCreacion: new Date().toISOString()
})

onMounted(async () => {
  try {
    // Intenta traer las monedas dinámicamente desde SQL si tienes un controlador mapeado
    const resMonedas = await api.get('/api/monedas')
    monedas.value = resMonedas.data
  } catch (error) {
    console.warn('Usando monedas locales de respaldo para el formulario.', error)
    // Monedas espejo que se ven en tu imagen
    monedas.value = [
      { id: 1, nombre: 'USD' },
      { id: 2, nombre: 'PEN' },
      { id: 3, nombre: 'EUR' }
    ]
  }
})

async function handlePublicar() {
  feedback.value.mensaje = ''
  
  if (!form.value.monedaOrigenId || !form.value.monedaDestinoId) {
    showError('Debes seleccionar ambas monedas.')
    return
  }
  if (form.value.monedaOrigenId === form.value.monedaDestinoId) {
    showError('La moneda de origen y destino no pueden ser iguales.')
    return
  }
  if (!form.value.tasaCambio || form.value.tasaCambio <= 0) {
    showError('Por favor ingresa una tasa de cambio válida.')
    return
  }
  if (form.value.montoMinimo > form.value.montoMaximo) {
    showError('El monto mínimo no puede ser mayor que el monto máximo.')
    return
  }

  // Sincronizar el monto disponible con el monto máximo para la publicación inicial
  form.value.montoDisponible = form.value.montoMaximo

  loading.value = true
  try {
    // Envía el JSON exacto al método [HttpPost] de tu OfertaController
    await api.post('/api/Oferta', form.value)
    
    feedback.value.esExito = true
    feedback.value.mensaje = '¡Oferta publicada de manera exitosa!'
    
    setTimeout(() => {
      router.push('/') // Redirige al Marketplace principal tras el éxito
    }, 1500)

  } catch (err) {
    console.error(err)
    showError('Hubo un error de comunicación con el servidor SQL.')
  } finally {
    loading.value = false
  }
}

function showError(msg) {
  feedback.value.esExito = false
  feedback.value.mensaje = msg
}
</script>

<style scoped>
.publicar-page {
  background: #0d1117;
  min-height: 100vh;
}
.panel-card {
  background: #161b22;
  border: 1px solid #21262d;
  border-radius: 8px;
}
.important-card {
  background: #161b22;
  border: 1px solid #b38f00; /* Borde sutil dorado/ámbar acorde a tu imagen */
  border-radius: 8px;
}
.btn-submit {
  height: 50px;
  border-radius: 6px;
}
.custom-list {
  list-style-type: disc;
}
.custom-list li {
  line-height: 1.5;
}
:deep(.bg-panel-dropdown) {
  background-color: #161b22 !important;
  border: 1px solid #30363d !important;
  color: white !important;
}
</style>