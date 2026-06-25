<template>
  <q-page class="q-pa-lg bg-dark-custom">
    <div class="q-mb-md">
      <q-btn flat icon="arrow_back" label="Volver al marketplace" color="amber" @click="$router.push('/')" />
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card class="bg-card q-pa-xl">
          <div class="text-h4 text-white text-weight-bold q-mb-lg">Publicar oferta</div>
          
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-grey-5 q-mb-sm">Moneda que vendo</div>
                <q-select v-model="form.monedaVenta" :options="monedas" outlined dark color="amber" />
              </div>
              <div class="col-6">
                <div class="text-grey-5 q-mb-sm">Moneda que recibo</div>
                <q-select v-model="form.monedaCompra" :options="monedas" outlined dark color="amber" />
              </div>
            </div>

            <div>
              <div class="text-grey-5 q-mb-sm">Tasa de cambio</div>
              <q-input v-model.number="form.tasa" type="number" outlined dark color="amber" :rules="[val => !!val || 'Requerido', val => val > 0 || 'Debe ser mayor a 0']" />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-grey-5 q-mb-sm">Monto mínimo</div>
                <q-input v-model.number="form.minimo" type="number" outlined dark color="amber" :rules="[val => !!val || 'Requerido', val => val >= 10 || 'El mínimo es 10']" />
              </div>
              <div class="col-6">
                <div class="text-grey-5 q-mb-sm">Monto máximo</div>
                <q-input v-model.number="form.maximo" type="number" outlined dark color="amber" :rules="[val => !!val || 'Requerido', val => val > form.minimo || 'Debe ser mayor al mínimo']" />
              </div>
            </div>

            <div>
              <div class="text-grey-5 q-mb-sm">Método de pago</div>
              <q-select 
                v-model="form.metodoPago" 
                :options="['Transferencia bancaria', 'Yape', 'Plin', 'PayPal']" 
                outlined dark color="amber" 
                :rules="[val => !!val || 'Selecciona un método']"
              />
            </div>

            <q-btn label="Publicar oferta" type="submit" color="amber" text-color="black" class="full-width text-weight-bold q-mt-lg" size="lg" no-caps />
          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-card q-pa-md">
          <div class="text-h6 text-amber q-mb-md">⚠️ Importante</div>
          <ul class="text-grey-4 text-caption q-pl-md">
            <li class="q-mb-sm">Tu oferta será visible para todos los usuarios.</li>
            <li class="q-mb-sm">Asegúrate de tener los fondos disponibles antes de publicar.</li>
            <li>El tiempo de respuesta debe ser menor a 15 minutos.</li>
          </ul>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const api = axios.create({ baseURL: 'https://localhost:7196' })

const monedas = ['USD', 'PEN', 'EUR', 'BTC']

const form = ref({
  monedaVenta: 'USD',
  monedaCompra: 'PEN',
  tasa: null,
  minimo: 10,
  maximo: null,
  metodoPago: null
})

const onSubmit = async () => {
  try {
    await api.post('/api/Oferta', {
      monedaOrigen: form.value.monedaVenta,
      monedaDestino: form.value.monedaCompra,
      tasaCambio: form.value.tasa,
      montoMinimo: form.value.minimo,
      montoMaximo: form.value.maximo,
      metodoPago: form.value.metodoPago
    })

    $q.notify({
      type: 'positive',
      message: '¡Éxito! Oferta generada correctamente.',
      caption: 'Tu oferta ya está disponible en el marketplace.',
      icon: 'check_circle'
    })
    
    // Limpiar formulario
    form.value.tasa = null
    form.value.maximo = null
    form.value.metodoPago = null
  } catch (error) {
    console.error("Error al enviar:", error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar la oferta.',
      caption: 'Revisa la consola (F12) para ver el detalle del error.'
    })
  }
}
</script>

<style scoped>
.bg-dark-custom { background: #0d1117; min-height: 100vh; }
.bg-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; }
</style>