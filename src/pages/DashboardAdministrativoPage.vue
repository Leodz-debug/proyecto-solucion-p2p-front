<template>
  <q-page class="admin-page q-pa-lg">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold text-white">Dashboard Administrativo</div>
        <div class="text-grey-5">Monitoreo general de operaciones, usuarios y reportes</div>
      </div>

      <q-space />

      <q-btn
        color="amber"
        text-color="black"
        icon="refresh"
        label="Actualizar"
        :loading="loading"
        @click="cargarTodo"
      />
    </div>

    <div v-if="loading" class="flex flex-center" style="height: 300px">
      <q-spinner color="amber" size="60px" />
    </div>

    <template v-else>
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="panel stat-card q-pa-md">
            <q-icon name="verified_user" size="42px" color="green" />
            <div class="text-h4 text-white text-weight-bold q-mt-sm">
              {{ reporte.usuariosActivos }}
            </div>
            <div class="text-grey-5">Usuarios activos</div>
            <div class="text-caption text-grey-6">
              Total registrados: {{ reporte.totalUsuarios }}
            </div>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="panel stat-card q-pa-md">
            <q-icon name="task_alt" size="42px" color="positive" />
            <div class="text-h4 text-white text-weight-bold q-mt-sm">
              {{ reporte.operacionesCompletadas }}
            </div>
            <div class="text-grey-5">Operaciones completadas</div>
            <div class="text-caption text-grey-6">
              Total operaciones: {{ reporte.totalOperaciones }}
            </div>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="panel stat-card q-pa-md">
            <q-icon name="report_problem" size="42px" color="red" />
            <div class="text-h4 text-white text-weight-bold q-mt-sm">
              {{ reporte.totalDisputas }}
            </div>
            <div class="text-grey-5">Disputas</div>
            <div class="text-caption text-grey-6">Casos registrados</div>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="panel stat-card q-pa-md">
            <q-icon name="paid" size="42px" color="amber" />
            <div class="text-h4 text-white text-weight-bold q-mt-sm">
              {{ formatearMonto(reporte.volumenIntercambio) }}
            </div>
            <div class="text-grey-5">Volumen de intercambio</div>
            <div class="text-caption text-grey-6">
              Ofertas activas: {{ reporte.ofertasActivas }}
            </div>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-lg q-mt-sm">
        <div class="col-12 col-lg-7">
          <q-card class="panel q-pa-md full-height">
            <div class="row items-center q-mb-md">
              <q-icon name="currency_exchange" color="amber" size="24px" class="q-mr-sm" />
              <div>
                <div class="text-white text-h6">Monedas más usadas</div>
                <div class="text-grey-5 text-caption">
                  Principal: {{ reporte.monedaMasUsada || '—' }}
                </div>
              </div>
            </div>

            <div v-if="reporte.monedasMasUsadas.length" class="column q-gutter-sm">
              <div
                v-for="moneda in reporte.monedasMasUsadas"
                :key="moneda.codigo || moneda.nombre"
                class="currency-row"
              >
                <div>
                  <div class="text-white text-weight-bold">
                    {{ moneda.codigo || '—' }} · {{ moneda.nombre || 'Moneda' }}
                  </div>
                  <div class="text-grey-5 text-caption">
                    {{ moneda.cantidadOperaciones }} operación(es)
                  </div>
                </div>
                <q-badge color="blue-grey-8" text-color="white">
                  {{ formatearMonto(moneda.volumen) }}
                </q-badge>
              </div>
            </div>

            <div v-else class="text-grey-5">
              Aún no hay operaciones suficientes para calcular uso.
            </div>
          </q-card>
        </div>

        <div class="col-12 col-lg-5">
          <q-card class="panel q-pa-md full-height">
            <div class="text-white text-h6 q-mb-md">Accesos rápidos</div>
            <div class="quick-grid">
              <q-btn
                outline
                color="amber"
                icon="people"
                label="Usuarios"
                @click="tab = 'usuarios'"
              />
              <q-btn
                outline
                color="amber"
                icon="storefront"
                label="Ofertas"
                @click="tab = 'ofertas'"
              />
              <q-btn
                outline
                color="amber"
                icon="assessment"
                label="Reportes"
                @click="tab = 'reportes'"
              />
              <q-btn
                outline
                color="amber"
                icon="verified"
                label="Verificaciones"
                @click="tab = 'resumen'"
              />
            </div>
          </q-card>
        </div>
      </div>

      <q-card class="panel q-mt-xl">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey-5"
          active-color="amber"
          indicator-color="amber"
          align="left"
        >
          <q-tab name="resumen" icon="dashboard" label="Resumen" />
          <q-tab name="usuarios" icon="people" label="Usuarios" />
          <q-tab name="ofertas" icon="storefront" label="Ofertas" />
          <q-tab name="reportes" icon="assessment" label="Reportes" />
        </q-tabs>

        <q-separator dark />

        <q-tab-panels v-model="tab" animated class="bg-transparent text-white">
          <q-tab-panel name="resumen">
            <div class="row items-center q-mb-md">
              <div>
                <div class="text-h6 text-white">Solicitudes de verificación</div>
                <div class="text-grey-5 text-caption">
                  Pendientes: {{ verificacionesPendientes }}
                </div>
              </div>
              <q-space />
              <q-input
                v-model="buscarVerificacion"
                outlined
                dense
                dark
                color="amber"
                placeholder="Buscar usuario..."
                style="width: 280px"
              >
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>

            <div class="row q-col-gutter-lg">
              <div
                v-for="v in listaVerificacionesFiltrada"
                :key="v.id"
                class="col-12 col-md-6 col-lg-4"
              >
                <q-card class="inner-card q-pa-md">
                  <div class="row items-center no-wrap">
                    <q-avatar color="amber" text-color="black" size="48px">
                      {{ obtenerInicial(v.nombreCompleto) }}
                    </q-avatar>
                    <div class="q-ml-md col">
                      <div class="text-white text-weight-bold ellipsis">{{ v.nombreCompleto }}</div>
                      <div class="text-grey-5 text-caption ellipsis">{{ v.correo }}</div>
                    </div>
                  </div>

                  <q-separator dark class="q-my-md" />

                  <div class="detail-row">
                    <span>Documento:</span>
                    <span>{{ v.tipoDocumento }} {{ v.documentoIdentidad }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Fecha:</span>
                    <span>{{ formatearFecha(v.fechaRegistro) }}</span>
                  </div>

                  <div class="row items-center justify-between q-mt-md">
                    <q-chip
                      dense
                      :color="colorEstado(v.estadoVerificacion)"
                      text-color="white"
                      icon="verified_user"
                    >
                      {{ v.estadoVerificacion }}
                    </q-chip>

                    <div class="row q-gutter-sm">
                      <q-btn
                        dense
                        color="positive"
                        icon="check"
                        label="Aprobar"
                        no-caps
                        :disable="v.estadoVerificacion === 'Verificado'"
                        @click="aprobar(v)"
                      />
                      <q-btn
                        dense
                        color="negative"
                        icon="close"
                        label="Rechazar"
                        outline
                        no-caps
                        :disable="v.estadoVerificacion === 'Rechazado'"
                        @click="rechazar(v)"
                      />
                    </div>
                  </div>
                </q-card>
              </div>

              <div v-if="listaVerificacionesFiltrada.length === 0" class="col-12">
                <q-banner class="bg-blue-grey-10 text-grey-4 rounded-borders">
                  No hay solicitudes que coincidan con la búsqueda.
                </q-banner>
              </div>
            </div>

            <q-separator dark class="q-my-lg" />

            <div class="text-h6 text-white q-mb-md">Actividad reciente</div>
            <q-list separator bordered class="activity-list">
              <q-item v-for="(item, index) in actividad" :key="index">
                <q-item-section avatar>
                  <q-icon :name="item.icono" :color="item.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">{{ item.texto }}</q-item-label>
                  <q-item-label caption>{{ item.fecha }}</q-item-label>
                </q-item-section>
              </q-item>

              <div v-if="actividad.length === 0" class="text-center text-grey-5 q-pa-lg">
                No hay actividad reciente.
              </div>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="usuarios">
            <div class="row items-center q-mb-md">
              <div>
                <div class="text-h6 text-white">Usuarios</div>
                <div class="text-grey-5 text-caption">Consulta de usuarios registrados</div>
              </div>
              <q-space />
              <q-input
                v-model="buscarUsuario"
                outlined
                dense
                dark
                color="amber"
                placeholder="Buscar por nombre, correo o rol..."
                style="width: 320px"
              >
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>

            <div class="row q-col-gutter-md">
              <div v-for="u in usuariosFiltrados" :key="u.id" class="col-12 col-md-6 col-lg-4">
                <q-card class="inner-card q-pa-md">
                  <div class="row items-center no-wrap">
                    <q-avatar color="blue-grey-8" text-color="white" size="44px">
                      {{ obtenerInicial(u.nombreCompleto) }}
                    </q-avatar>
                    <div class="q-ml-md col">
                      <div class="text-white text-weight-bold ellipsis">{{ u.nombreCompleto }}</div>
                      <div class="text-grey-5 text-caption ellipsis">{{ u.correo }}</div>
                    </div>
                  </div>
                  <q-separator dark class="q-my-md" />
                  <div class="detail-row">
                    <span>Rol:</span><span>{{ u.rol }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Verificación:</span><span>{{ u.estadoVerificacion || '—' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Reputación:</span><span>{{ u.reputacion ?? '—' }}</span>
                  </div>
                </q-card>
              </div>

              <div v-if="usuariosFiltrados.length === 0" class="col-12 text-grey-5">
                No hay usuarios para mostrar.
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="ofertas">
            <div class="row items-center q-mb-md">
              <div>
                <div class="text-h6 text-white">Ofertas</div>
                <div class="text-grey-5 text-caption">Acceso de revisión a ofertas publicadas</div>
              </div>
              <q-space />
              <q-input
                v-model="buscarOferta"
                outlined
                dense
                dark
                color="amber"
                placeholder="Buscar moneda, vendedor o estado..."
                style="width: 320px"
              >
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>

            <div class="row q-col-gutter-md">
              <div v-for="oferta in ofertasFiltradas" :key="oferta.id" class="col-12 col-md-6">
                <q-card class="inner-card q-pa-md">
                  <div class="row items-start justify-between q-mb-sm">
                    <div>
                      <div class="text-white text-weight-bold">
                        {{ oferta.monedaOrigenNombre }} → {{ oferta.monedaDestinoNombre }}
                      </div>
                      <div class="text-grey-5 text-caption">
                        {{ oferta.nombreVendedor || `Usuario #${oferta.usuarioId}` }}
                      </div>
                    </div>
                    <q-chip dense :color="colorOferta(oferta.estado)" text-color="white">
                      {{ oferta.estado }}
                    </q-chip>
                  </div>

                  <div class="detail-row">
                    <span>Tasa:</span><span>{{ oferta.tasaCambio }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Rango:</span
                    ><span>{{ oferta.montoMinimo }} - {{ oferta.montoMaximo }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Disponible:</span><span>{{ oferta.montoDisponible ?? '—' }}</span>
                  </div>

                  <div class="q-mt-sm q-gutter-xs">
                    <q-badge
                      v-for="metodo in oferta.metodosPago || []"
                      :key="metodo.id || metodo.metodoPagoId"
                      color="blue-grey-8"
                    >
                      {{ metodo.metodoPagoNombre || 'Método' }}
                    </q-badge>
                  </div>
                </q-card>
              </div>

              <div v-if="ofertasFiltradas.length === 0" class="col-12 text-grey-5">
                No hay ofertas para mostrar.
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="reportes">
            <div class="row items-center q-mb-md">
              <div>
                <div class="text-h6 text-white">Reportes</div>
                <div class="text-grey-5 text-caption">Historial de reportes administrativos</div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div v-for="r in reportes" :key="r.id" class="col-12 col-md-6 col-lg-4">
                <q-card class="inner-card q-pa-md">
                  <div class="text-white text-weight-bold">Reporte #{{ r.id }}</div>
                  <div class="text-grey-5 text-caption q-mb-md">
                    {{ formatearFecha(r.fechaGeneracion) }}
                  </div>
                  <div class="detail-row">
                    <span>Usuarios:</span><span>{{ r.totalUsuarios }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Operaciones:</span><span>{{ r.totalOperaciones }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Disputas:</span><span>{{ r.totalDisputas }}</span>
                  </div>
                </q-card>
              </div>

              <div v-if="reportes.length === 0" class="col-12">
                <q-banner class="bg-blue-grey-10 text-grey-4 rounded-borders">
                  No existen reportes guardados todavía. El resumen superior se calcula en tiempo
                  real.
                </q-banner>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
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
const tab = ref('resumen')

const reporte = ref(crearReporteVacio())
const verificaciones = ref([])
const usuarios = ref([])
const ofertas = ref([])
const reportes = ref([])
const actividad = ref([])

const buscarVerificacion = ref('')
const buscarUsuario = ref('')
const buscarOferta = ref('')

const verificacionesPendientes = computed(
  () => verificaciones.value.filter((x) => x.estadoVerificacion === 'Pendiente').length,
)

const listaVerificacionesFiltrada = computed(() => {
  const texto = buscarVerificacion.value.toLowerCase().trim()
  if (!texto) return verificaciones.value

  return verificaciones.value.filter((v) =>
    [v.nombreCompleto, v.correo, v.documentoIdentidad, v.estadoVerificacion]
      .join(' ')
      .toLowerCase()
      .includes(texto),
  )
})

const usuariosFiltrados = computed(() => {
  const texto = buscarUsuario.value.toLowerCase().trim()
  if (!texto) return usuarios.value

  return usuarios.value.filter((u) =>
    [u.nombreCompleto, u.correo, u.rol, u.estadoVerificacion]
      .join(' ')
      .toLowerCase()
      .includes(texto),
  )
})

const ofertasFiltradas = computed(() => {
  const texto = buscarOferta.value.toLowerCase().trim()
  if (!texto) return ofertas.value

  return ofertas.value.filter((o) =>
    [
      o.nombreVendedor,
      o.monedaOrigenNombre,
      o.monedaDestinoNombre,
      o.estado,
      o.tipoOperacion,
      ...(o.metodosPago || []).map((m) => m.metodoPagoNombre),
    ]
      .join(' ')
      .toLowerCase()
      .includes(texto),
  )
})

function crearReporteVacio() {
  return {
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalOperaciones: 0,
    operacionesCompletadas: 0,
    totalDisputas: 0,
    verificacionesPendientes: 0,
    ofertasActivas: 0,
    volumenIntercambio: 0,
    monedaMasUsada: '—',
    monedasMasUsadas: [],
  }
}

function obtenerInicial(nombre) {
  if (!nombre) return '?'
  return nombre.charAt(0).toUpperCase()
}

function formatearFecha(fecha) {
  if (!fecha) return '—'

  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatearMonto(valor) {
  const numero = Number(valor || 0)
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: numero % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numero)
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

function colorOferta(estado) {
  switch (estado) {
    case 'Activa':
      return 'green'
    case 'Reservada':
      return 'orange'
    case 'Cerrada':
      return 'blue-grey-8'
    default:
      return 'grey'
  }
}

async function cargarReporte() {
  const res = await api.get('/reporteadministrativo/dashboard')
  reporte.value = {
    ...crearReporteVacio(),
    ...res.data,
    monedasMasUsadas: Array.isArray(res.data?.monedasMasUsadas) ? res.data.monedasMasUsadas : [],
  }
}

async function cargarVerificaciones() {
  const res = await api.get('/verificacionidentidad')
  verificaciones.value = Array.isArray(res.data) ? res.data : []
}

async function cargarUsuarios() {
  const res = await api.get('/usuario')
  usuarios.value = Array.isArray(res.data) ? res.data : []
}

async function cargarOfertas() {
  const res = await api.get('/oferta')
  ofertas.value = Array.isArray(res.data) ? res.data : []
}

async function cargarReportes() {
  const res = await api.get('/reporteadministrativo')
  reportes.value = Array.isArray(res.data) ? res.data : []
}

async function aprobar(verificacion) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Desea aprobar a ${verificacion.nombreCompleto}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Aprobar', color: 'positive' },
  }).onOk(async () => {
    try {
      await api.put(`/verificacionidentidad/aprobar/${verificacion.id}`)
      $q.notify({ type: 'positive', message: 'Usuario aprobado correctamente.' })
      await cargarTodo()
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'No fue posible aprobar.' })
    }
  })
}

async function rechazar(verificacion) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Desea rechazar la verificación de ${verificacion.nombreCompleto}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Rechazar', color: 'negative' },
  }).onOk(async () => {
    try {
      await api.put(`/verificacionidentidad/rechazar/${verificacion.id}`)
      $q.notify({ type: 'warning', message: 'Solicitud rechazada.' })
      await cargarTodo()
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'No fue posible rechazar.' })
    }
  })
}

function cargarActividad() {
  actividad.value = [...verificaciones.value]
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

  const resultados = await Promise.allSettled([
    cargarReporte(),
    cargarVerificaciones(),
    cargarUsuarios(),
    cargarOfertas(),
    cargarReportes(),
  ])

  const fallo = resultados.some((resultado) => resultado.status === 'rejected')

  if (fallo) {
    $q.notify({
      type: 'warning',
      message: 'Algunos datos del dashboard no pudieron cargarse. Revisa permisos o conexión.',
    })
  }

  cargarActividad()
  loading.value = false
}

onMounted(cargarTodo)
</script>

<style scoped>
.admin-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel,
.inner-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
}

.inner-card {
  background: #0d1117;
}

.stat-card,
.inner-card,
.currency-row {
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover,
.inner-card:hover,
.currency-row:hover {
  transform: translateY(-2px);
  border-color: #f2c037;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
}

.text-grey-5 {
  color: #8b949e !important;
}

.currency-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  border: 1px solid #30363d;
  border-radius: 12px;
  background: #0d1117;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #8b949e;
  padding: 3px 0;
}

.detail-row span:last-child {
  color: #f0f6fc;
  text-align: right;
  font-weight: 700;
}

.activity-list {
  border-color: #30363d;
  border-radius: 12px;
  overflow: hidden;
}

.q-btn {
  border-radius: 10px;
}

@media (max-width: 700px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
