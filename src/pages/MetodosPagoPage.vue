<template>
  <q-page class="metodos-page q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-white">Métodos de pago</div>
        <div class="text-grey-5">Revisa los métodos que guardaste para próximas operaciones.</div>
      </div>

      <q-btn
        color="amber"
        text-color="black"
        icon="refresh"
        label="Actualizar"
        class="text-weight-bold"
        :loading="cargando"
        @click="cargarMetodosGuardados"
      />
    </div>

    <q-card class="panel q-pa-md q-mb-lg">
      <div class="row items-center q-mb-md">
        <q-icon name="info" color="amber" size="22px" class="q-mr-sm" />
        <div class="text-white text-weight-bold">Importante</div>
      </div>

      <div class="text-grey-4">
        Los métodos guardados se crean cuando inicias una operación y marcas “Guardar estos datos
        para próximas operaciones”.
      </div>

      <div class="text-grey-5 text-caption q-mt-sm">
        Por seguridad, no se debe guardar CVV ni número completo de tarjeta.
      </div>
    </q-card>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="amber" size="40px" />
      <div class="text-grey-5 q-mt-sm">Cargando métodos...</div>
    </div>

    <q-card v-else-if="metodos.length === 0" class="panel q-pa-xl text-center">
      <q-icon name="credit_card_off" size="52px" color="grey-6" />
      <div class="text-white text-weight-bold q-mt-md">Aún no tienes métodos guardados</div>
      <div class="text-grey-5 q-mt-xs">
        Cuando inicies una operación podrás guardar tus datos de pago.
      </div>

      <q-btn
        color="amber"
        text-color="black"
        label="Ir al marketplace"
        class="q-mt-md text-weight-bold"
        @click="$router.push('/marketplace')"
      />
    </q-card>

    <div v-else class="row q-col-gutter-md">
      <div v-for="metodo in metodos" :key="metodo.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="metodo-card q-pa-md">
          <div class="row items-start">
            <q-avatar color="amber" text-color="black" size="42px">
              <q-icon :name="iconoMetodo(metodo.metodoPagoNombre)" />
            </q-avatar>

            <div class="q-ml-md col">
              <div class="text-white text-weight-bold">
                {{ metodo.alias || metodo.metodoPagoNombre }}
              </div>

              <div class="text-grey-5 text-caption">
                {{ metodo.metodoPagoNombre }}
              </div>
            </div>

            <q-badge :color="metodo.activo ? 'green-8' : 'grey-7'" text-color="white">
              {{ metodo.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </div>

          <q-separator dark class="q-my-md" />

          <div class="text-grey-5 text-caption q-mb-xs">Resumen</div>
          <div class="text-white">
            {{ metodo.resumenPublico || 'Sin resumen registrado' }}
          </div>

          <div class="text-grey-6 text-caption q-mt-md">
            Creado: {{ formatearFecha(metodo.fechaCreacion) }}
          </div>

          <q-btn
            outline
            color="red-4"
            icon="delete"
            label="Eliminar"
            class="full-width q-mt-md"
            :loading="eliminandoId === metodo.id"
            @click="eliminarMetodo(metodo)"
          />
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="mensaje"
      dense
      class="q-mt-md rounded-borders"
      :class="ok ? 'bg-green-9 text-white' : 'bg-red-9 text-white'"
    >
      {{ mensaje }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const metodos = ref([])
const cargando = ref(false)
const eliminandoId = ref(null)
const mensaje = ref('')
const ok = ref(false)

async function cargarMetodosGuardados() {
  cargando.value = true
  mensaje.value = ''

  try {
    const res = await api.get('/usuariometodopago/mis-metodos')
    metodos.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Error al cargar métodos guardados:', error)
    ok.value = false
    mensaje.value = 'No se pudieron cargar tus métodos de pago.'
  } finally {
    cargando.value = false
  }
}

async function eliminarMetodo(metodo) {
  const confirmado = window.confirm(
    `¿Eliminar "${metodo.alias || metodo.metodoPagoNombre}" de tus métodos guardados?`,
  )

  if (!confirmado) return

  eliminandoId.value = metodo.id
  mensaje.value = ''

  try {
    await api.delete(`/usuariometodopago/${metodo.id}`)

    metodos.value = metodos.value.filter((m) => m.id !== metodo.id)

    ok.value = true
    mensaje.value = 'Método eliminado correctamente.'
  } catch (error) {
    console.error('Error al eliminar método:', error)
    ok.value = false
    mensaje.value = 'No se pudo eliminar el método de pago.'
  } finally {
    eliminandoId.value = null
  }
}

function iconoMetodo(nombre) {
  const texto = String(nombre || '').toLowerCase()

  if (texto.includes('yape') || texto.includes('plin')) return 'phone_iphone'
  if (texto.includes('transferencia') || texto.includes('banco')) return 'account_balance'
  if (texto.includes('paypal')) return 'alternate_email'
  if (texto.includes('tarjeta')) return 'credit_card'

  return 'payments'
}

function formatearFecha(fecha) {
  if (!fecha) return '—'

  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(cargarMetodosGuardados)
</script>

<style scoped>
.metodos-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel,
.metodo-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}

.metodo-card {
  transition:
    border 0.2s,
    transform 0.2s;
}

.metodo-card:hover {
  border-color: #f2c037;
  transform: translateY(-2px);
}
</style>
