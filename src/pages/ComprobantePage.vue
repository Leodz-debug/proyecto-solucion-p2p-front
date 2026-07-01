<template>
  <q-page class="q-pa-lg comprobante-page">
    <q-btn flat color="amber" icon="arrow_back" label="Volver" @click="$router.back()" />

    <div class="text-h5 text-white text-weight-bold q-mt-md">Subir comprobante</div>
    <div class="text-grey-5 q-mb-lg">Adjunta el comprobante de tu pago para continuar</div>

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
        :disable="!archivo"
        @click="guardar"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const operacionId = Number(route.query.operacion)

const archivo = ref(null)
const loading = ref(false)
const mensaje = ref('')
const ok = ref(false)

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
  try {
    await api.get(`/operacion/${operacionId}`)
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
</style>