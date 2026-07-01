<template>
  <q-page class="oper-page q-pa-lg">
    <q-btn
      flat
      no-caps
      color="amber"
      icon="arrow_back"
      label="Volver al marketplace"
      class="q-mb-md q-px-none"
      @click="$router.push('/marketplace')"
    />

    <div class="text-h5 text-weight-bold text-white q-mb-lg">Operaciones Activas</div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="40px" />
    </div>

    <div v-else-if="operaciones.length === 0" class="text-grey-5">
      No tienes operaciones activas en este momento.
    </div>

    <div v-else class="row q-col-gutter-lg">
      <div v-for="op in operaciones" :key="op.id" class="col-12 col-md-6">
        <q-card class="panel q-pa-md">
          <div class="text-white text-weight-bold">Código: {{ op.codigoOperacion }}</div>
          <div class="text-grey-4 q-mb-sm row items-center q-gutter-x-xs">
            <span>Estado: {{ op.estado }}</span>
            <q-badge v-if="op.estado === 'En proceso'" color="amber" text-color="black">
              {{ formatearSegundos(op.segundosRestantes) }}
            </q-badge>
          </div>
          <q-btn
            v-if="op.estado === 'En proceso'"
            class="full-width q-mb-sm"
            color="amber"
            text-color="black"
            label="Ver temporizador"
            @click="$router.push('/operacion/' + op.id)"
          />
          <div class="row justify-between text-grey-4">
            <span>Monto:</span><span class="text-white">{{ op.monto }}</span>
          </div>
          <div class="row justify-between text-grey-4">
            <span>ID Comprador:</span><span class="text-white">{{ op.compradorId }}</span>
          </div>
          <div class="row q-col-gutter-sm q-mt-md">
            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-6">
                <q-btn
                  class="full-width"
                  color="amber"
                  text-color="black"
                  label="Comprobante"
                  @click="$router.push('/comprobante?operacion=' + op.id)"
                />
              </div>

              <div class="col-6">
                <q-btn
                  class="full-width"
                  color="green"
                  label="Calificar"
                  @click="$router.push('/calificacion?operacion=' + op.id)"
                />
              </div>

              <div class="col-6">
                <q-btn
                  class="full-width"
                  color="red"
                  label="Disputa"
                  @click="$router.push('/disputa?operacion=' + op.id)"
                />
              </div>

              <div class="col-6">
                <q-btn
                  class="full-width"
                  color="blue"
                  label="Chat"
                  @click="$router.push('/chat?operacion=' + op.id)"
                />
              </div>
            </div>
          </div>
          <div class="row justify-between text-grey-4">
            <span>Vendedor:</span>

            <span class="text-white">
              {{ op.vendedorNombre }}
            </span>
          </div>

          <div class="row justify-between text-grey-4">
            <span>Comprador:</span>

            <span class="text-white">
              {{ op.compradorNombre }}
            </span>
          </div>

          <div class="row justify-between text-grey-4">
            <span>Código:</span>

            <span class="text-white">
              {{ op.codigoOperacion }}
            </span>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()
const operaciones = ref([])
const cargando = ref(true)

async function cargarOperaciones() {
  cargando.value = true
  try {
    // Llamamos al endpoint general
    const res = await api.get('/operacion')

    // Filtramos los datos.
    // NOTA: Si en consola ves que las propiedades tienen mayúsculas (ej: CompradorId),
    // cambia 'op.compradorId' por 'op.CompradorId' aquí abajo.
    if (res.data && Array.isArray(res.data)) {
      operaciones.value = res.data.filter(
        (op) => op.compradorId === auth.usuario.id || op.vendedorId === auth.usuario.id,
      )
    }
  } catch (error) {
    console.error('Error al cargar operaciones:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarOperaciones)

function formatearSegundos(s) {
  const total = Math.max(0, s ?? 0)
  const min = Math.floor(total / 60)
    .toString()
    .padStart(2, '0')
  const seg = (total % 60).toString().padStart(2, '0')
  return `${min}:${seg}`
}
</script>

<style scoped>
.oper-page {
  background: #0d1117;
  min-height: 100vh;
}
.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}
</style>