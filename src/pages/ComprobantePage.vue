<template>
  <q-page class="q-pa-lg comprobante-page">
    <q-btn flat color="amber" icon="arrow_back" label="Volver" @click="$router.back()" />

    <div class="text-h5 text-white text-weight-bold q-mt-md">Subir comprobante</div>
    <div class="text-grey-5 q-mb-lg">
      Primero paga con los datos del vendedor y luego adjunta tu comprobante.
    </div>

    <q-card v-if="operacion" class="panel q-pa-lg q-mb-md">
      <div class="row items-center q-mb-sm">
        <q-icon name="payments" color="amber" size="24px" class="q-mr-sm" />
        <div>
          <div class="text-white text-subtitle1 text-weight-bold">Datos para realizar el pago</div>
          <div class="text-grey-5 text-caption">Operación {{ operacion.codigoOperacion }}</div>
        </div>
      </div>

      <div class="payment-detail-card q-pa-md q-mt-md">
        <div class="detail-row">
          <span>Método:</span>
          <span>{{ operacion.metodoPagoNombre || '—' }}</span>
        </div>

        <div class="detail-row">
          <span>Resumen:</span>
          <span>{{ operacion.resumenPagoVendedor || '—' }}</span>
        </div>

        <div class="detail-row">
          <span>Alias:</span>
          <span>{{ operacion.aliasPagoVendedor || '—' }}</span>
        </div>

        <div class="detail-row">
          <span>Datos de recepción:</span>
          <span>{{ operacion.datosRecepcionVendedor || '—' }}</span>
        </div>
      </div>

      <q-banner dense class="bg-blue-grey-10 text-grey-4 q-mt-md rounded-borders">
        {{ instruccionesPago }}
      </q-banner>
    </q-card>

    <q-card class="panel q-pa-lg">
      <q-file
        v-model="archivo"
        label="Arrastra tu comprobante aquí o haz clic para seleccionar"
        dark
        outlined
        accept=".jpg,.jpeg,.png,.pdf"
        max-file-size="5242880"
        @rejected="onRechazado"
      >
        <template v-slot:prepend><q-icon name="cloud_upload" color="amber" /></template>
      </q-file>

      <div class="text-grey-6 text-caption q-mt-sm">
        Formatos aceptados: JPG, PNG, PDF (máx. 5MB)
      </div>

      <q-banner
        v-if="mensaje"
        class="q-mt-md"
        :class="ok ? 'bg-green text-white' : 'bg-red text-white'"
      >
        {{ mensaje }}
      </q-banner>

      <q-btn
        class="q-mt-lg full-width"
        color="amber"
        text-color="black"
        label="Enviar comprobante"
        :loading="loading"
        :disable="!archivo || !operacion"
        @click="guardar"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const operacionId = Number(route.query.operacion)

const archivo = ref(null)
const operacion = ref(null)
const loading = ref(false)
const mensaje = ref('')
const ok = ref(false)

const instruccionesPago = computed(
  () =>
    operacion.value?.instruccionesPagoVendedor ||
    'Realiza el pago exacto con los datos mostrados. Conserva tu comprobante para que el vendedor pueda validarlo.',
)

function onRechazado() {
  ok.value = false
  mensaje.value = 'Archivo inválido: revisa el formato (JPG, PNG, PDF) y que pese menos de 5MB.'
}

async function guardar() {
  mensaje.value = ''

  if (!archivo.value) {
    ok.value = false
    mensaje.value = 'Selecciona un archivo.'
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('operacionId', operacionId)
    formData.append('archivo', archivo.value)

    await api.post('/comprobantepago/subir', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    ok.value = true
    mensaje.value = 'Comprobante enviado. El vendedor fue notificado.'

    setTimeout(() => {
      router.push('/operacion/' + operacionId)
    }, 1200)
  } catch (e) {
    ok.value = false
    mensaje.value = e.response?.data?.mensaje || 'Error al enviar el comprobante.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!operacionId) {
    router.push('/operacion')
    return
  }

  try {
    const res = await api.get(`/operacion/${operacionId}`)
    operacion.value = res.data
  } catch {
    router.push('/operacion')
  }
})
</script>

<style scoped>
.comprobante-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}

.payment-detail-card {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #8b949e;
  padding: 4px 0;
}

.detail-row span:last-child {
  color: #f0f6fc;
  font-weight: 700;
  text-align: right;
}
</style>
