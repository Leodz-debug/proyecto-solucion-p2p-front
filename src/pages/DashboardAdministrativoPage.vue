<template>
  <q-page class="admin-page q-pa-lg">
    <!-- Título -->
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold text-white">Dashboard Administrativo</div>

        <div class="text-grey-5">Panel de administración de CambioSeguro P2P</div>
      </div>

      <q-space />

      <q-btn
        color="amber"
        text-color="black"
        icon="refresh"
        label="Actualizar"
        @click="cargarTodo"
      />
    </div>

    <!-- Loading -->

    <div v-if="loading" class="flex flex-center" style="height: 300px">
      <q-spinner color="amber" size="60px" />
    </div>

    <template v-else>
      <!-- TARJETAS -->

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="panel stat-card">
            <q-card-section class="text-center">
              <q-icon name="people" size="55px" color="amber" />

              <div class="text-h3 text-white q-mt-sm">
                {{ reporte.totalUsuarios }}
              </div>

              <div class="text-grey-5">Usuarios</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="panel stat-card">
            <q-card-section class="text-center">
              <q-icon name="currency_exchange" size="55px" color="green" />

              <div class="text-h3 text-white q-mt-sm">
                {{ reporte.totalOperaciones }}
              </div>

              <div class="text-grey-5">Operaciones</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="panel stat-card">
            <q-card-section class="text-center">
              <q-icon name="report_problem" size="55px" color="red" />

              <div class="text-h3 text-white q-mt-sm">
                {{ reporte.totalDisputas }}
              </div>

              <div class="text-grey-5">Disputas</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="panel stat-card">
            <q-card-section class="text-center">
              <q-icon name="verified_user" size="55px" color="blue" />

              <div class="text-h3 text-white q-mt-sm">
                {{ verificacionesPendientes }}
              </div>

              <div class="text-grey-5">Pendientes</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- VERIFICACIONES -->

      <q-card class="panel q-mt-xl">
        <q-card-section class="row items-center">
          <div class="text-h6 text-white">Solicitudes de Verificación</div>

          <q-space />

          <q-input
            outlined
            dense
            dark
            color="amber"
            v-model="buscar"
            placeholder="Buscar usuario..."
            style="width: 280px"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>

        <q-separator dark />

        <div class="row q-col-gutter-lg q-pa-md">
          <div class="col-12 col-md-6 col-lg-4" v-for="v in listaFiltrada" :key="v.id">
            <q-card class="panel usuario-card">
              <q-card-section>
                <div class="row items-center">
                  <q-avatar color="amber" text-color="black" size="55px">
                    {{ obtenerInicial(v.nombreCompleto) }}
                  </q-avatar>

                  <div class="q-ml-md">
                    <div class="text-h6 text-white">
                      {{ v.nombreCompleto }}
                    </div>

                    <div class="text-grey-5">
                      {{ v.correo }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator dark />

              <q-card-section>
                <div class="text-grey-5">Documento</div>

                <div class="text-white text-weight-medium">
                  {{ v.tipoDocumento }}
                </div>

                <div class="text-grey-4">
                  {{ v.documentoIdentidad }}
                </div>
              </q-card-section>

              <q-separator dark />

              <q-card-section>
                <div class="row items-center justify-between">
                  <q-chip
                    :color="colorEstado(v.estadoVerificacion)"
                    text-color="white"
                    icon="verified_user"
                  >
                    {{ v.estadoVerificacion }}
                  </q-chip>

                  <div class="text-caption text-grey-5">
                    {{ formatearFecha(v.fechaRegistro) }}
                  </div>
                </div>
              </q-card-section>

              <q-separator dark />

              <q-card-actions align="right">
                <q-btn
                  color="positive"
                  icon="check"
                  label="Aprobar"
                  no-caps
                  unelevated
                  @click="aprobar(v)"
                  :disable="v.estadoVerificacion === 'Verificado'"
                />

                <q-btn
                  color="negative"
                  icon="close"
                  label="Rechazar"
                  outline
                  no-caps
                  @click="rechazar(v)"
                  :disable="v.estadoVerificacion === 'Rechazado'"
                />
              </q-card-actions>
            </q-card>
          </div>

          <div v-if="listaFiltrada.length === 0" class="col-12">
            <q-card class="panel">
              <q-card-section class="text-center q-pa-xl">
                <q-icon name="verified" color="grey" size="70px" />

                <div class="text-grey-5 q-mt-md">No existen solicitudes pendientes.</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card>

      <!-- ACTIVIDAD -->

      <q-card class="panel q-mt-xl">
        <q-card-section>
          <div class="text-h6 text-white">Actividad reciente</div>
        </q-card-section>

        <q-separator dark />

        <q-list separator>
          <q-item v-for="(item, index) in actividad" :key="index">
            <q-item-section avatar>
              <q-icon :name="item.icono" :color="item.color" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-white">
                {{ item.texto }}
              </q-item-label>

              <q-item-label caption>
                {{ item.fecha }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <div v-if="actividad.length === 0" class="text-center text-grey-5 q-pa-lg">
            No hay actividad reciente.
          </div>
        </q-list>
      </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/services/api'

const $q = useQuasar()

const loading = ref(true)

const reporte = ref({
  totalUsuarios: 0,
  totalOperaciones: 0,
  totalDisputas: 0,
})

const verificaciones = ref([])

const actividad = ref([])

const buscar = ref('')

const verificacionesPendientes = computed(() => {
  return verificaciones.value.filter((x) => x.estadoVerificacion === 'Pendiente').length
})

const listaFiltrada = computed(() => {
  if (!buscar.value) return verificaciones.value

  const texto = buscar.value.toLowerCase()

  return verificaciones.value.filter((v) => {
    return (
      (v.nombreCompleto || '').toLowerCase().includes(texto) ||
      (v.correo || '').toLowerCase().includes(texto) ||
      (v.documentoIdentidad || '').includes(texto)
    )
  })
})

function obtenerInicial(nombre) {
  if (!nombre) return '?'
  return nombre.charAt(0).toUpperCase()
}

function formatearFecha(fecha) {
  if (!fecha) return ''

  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',

    month: 'short',

    year: 'numeric',
  })
}

function colorEstado(estado) {
  switch (estado) {
    case 'Pendiente':
      return 'orange'

    case 'Verificado':
      return 'green'

    case 'Rechazado':
      return 'red'

    default:
      return 'grey'
  }
}

async function cargarReporte() {
  try {
    const res = await api.get('/reporteadministrativo/dashboard')

    console.log(res.data)

    reporte.value = res.data
  } catch (err) {
    console.error('ERROR DASHBOARD')
    console.error(err)
  }
}

async function cargarVerificaciones() {
  try {
    const res = await api.get('/verificacionidentidad')

    verificaciones.value = res.data
  } catch (err) {
    console.error(err)

    $q.notify({
      color: 'negative',
      message: 'No se pudieron cargar las verificaciones.',
    })
  }
}

async function aprobar(verificacion) {
  $q.dialog({
    title: 'Confirmar',

    message: `¿Desea aprobar a ${verificacion.nombreCompleto}?`,

    cancel: true,

    persistent: true,

    ok: {
      label: 'Aprobar',
      color: 'positive',
    },
  }).onOk(async () => {
    console.log('Entró a aprobar')
    try {
      await api.put(`/verificacionidentidad/aprobar/${verificacion.id}`)
      console.log(verificacion)
      console.log(verificacion.id)
      $q.notify({
        type: 'positive',

        message: 'Usuario aprobado correctamente.',
      })

      await cargarTodo()
    } catch (error) {
      console.error(error)

      $q.notify({
        type: 'negative',

        message: 'No fue posible aprobar.',
      })
    }
  })
}

async function rechazar(verificacion) {
  $q.dialog({
    title: 'Confirmar',

    message: `¿Desea rechazar la verificación de ${verificacion.nombreCompleto}?`,

    cancel: true,

    persistent: true,

    ok: {
      label: 'Rechazar',
      color: 'negative',
    },
  }).onOk(async () => {
    try {
      await api.put(`/verificacionidentidad/rechazar/${verificacion.id}`)

      $q.notify({
        type: 'warning',

        message: 'Solicitud rechazada.',
      })

      await cargarTodo()
    } catch (error) {
      console.error(error)

      $q.notify({
        type: 'negative',

        message: 'No fue posible rechazar.',
      })
    }
  })
}

async function cargarActividad() {
  actividad.value = verificaciones.value
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .slice(0, 5)
    .map((v) => ({
      icono:
        v.estadoVerificacion === 'Pendiente'
          ? 'hourglass_empty'
          : v.estadoVerificacion === 'Verificado'
            ? 'verified'
            : 'cancel',

      color:
        v.estadoVerificacion === 'Pendiente'
          ? 'orange'
          : v.estadoVerificacion === 'Verificado'
            ? 'green'
            : 'red',

      texto:
        v.estadoVerificacion === 'Pendiente'
          ? `${v.nombreCompleto} envió su verificación.`
          : v.estadoVerificacion === 'Verificado'
            ? `${v.nombreCompleto} fue verificado.`
            : `${v.nombreCompleto} fue rechazado.`,

      fecha: formatearFecha(v.fechaRegistro),
    }))
}

async function cargarTodo() {
  loading.value = true

  await Promise.all([cargarReporte(), cargarVerificaciones()])

  cargarActividad()

  loading.value = false
}

onMounted(() => {
  cargarTodo()
})
</script>

<style scoped>
.admin-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
  transition: all 0.25s ease;
}

.panel:hover {
  border-color: #f2c037;
  transform: translateY(-2px);
}

.stat-card {
  cursor: default;
}

.text-grey-5 {
  color: #8b949e !important;
}

.q-item {
  transition: all 0.2s ease;
}

.q-item:hover {
  background: rgba(242, 192, 55, 0.05);
}

.q-avatar {
  font-weight: bold;
}

.q-chip {
  font-weight: bold;
}

.q-btn {
  border-radius: 10px;
}

.q-card-section {
  padding: 20px;
}

.q-list {
  max-height: 500px;
  overflow-y: auto;
}

/* Scroll bonito */

.q-list::-webkit-scrollbar {
  width: 7px;
}

.q-list::-webkit-scrollbar-track {
  background: transparent;
}

.q-list::-webkit-scrollbar-thumb {
  background: #3b434d;
  border-radius: 20px;
}

.q-list::-webkit-scrollbar-thumb:hover {
  background: #5b6572;
}

.actividad-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1f2937;
}

.estado-pendiente {
  background: #d97706;
}

.estado-verificado {
  background: #15803d;
}

.estado-rechazado {
  background: #b91c1c;
}

.usuario-card {
  transition: 0.25s;

  cursor: pointer;
}

.usuario-card:hover {
  transform: translateY(-6px);

  border: 1px solid #f2c037;

  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
}

@media (max-width: 900px) {
  .q-list {
    max-height: none;
  }
}
</style>
