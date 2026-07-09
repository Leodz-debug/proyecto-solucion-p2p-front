<template>
  <q-page class="metodos-page q-pa-lg">
    <div class="row items-center justify-between q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md">
        <div class="text-h5 text-weight-bold text-white">Mis métodos para recibir pagos</div>
        <div class="text-grey-5">
          Guarda tus datos de recepción como vendedor: Yape, Plin, transferencia, PayPal o una
          referencia segura. Cuando publiques una oferta podrás reutilizarlos.
        </div>
      </div>

      <div class="col-12 col-md-auto">
        <q-btn
          color="amber"
          text-color="black"
          icon="refresh"
          label="Actualizar"
          class="text-weight-bold"
          :loading="cargando"
          @click="cargarTodo"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-lg-5">
        <q-card class="panel q-pa-lg">
          <div class="row items-center q-mb-md">
            <q-avatar color="amber" text-color="black" size="44px" class="q-mr-md">
              <q-icon name="add_card" />
            </q-avatar>
            <div>
              <div class="text-white text-subtitle1 text-weight-bold">
                Agregar método de recepción
              </div>
              <div class="text-grey-5 text-caption">
                Estos datos son tuyos como vendedor; no son datos del comprador.
              </div>
            </div>
          </div>

          <div class="text-grey-5 text-caption q-mb-xs">Tipo de método</div>
          <q-select
            v-model="metodoSeleccionado"
            :options="catalogoMetodos"
            option-label="nombre"
            dark
            outlined
            color="amber"
            popup-content-class="bg-dark text-white"
            :loading="cargandoCatalogo"
            @update:model-value="limpiarFormulario"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="iconoMetodo(scope.opt.nombre)" color="amber" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                  <q-item-label caption>{{ descripcionMetodo(scope.opt.nombre) }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-banner v-if="metodoSeleccionado" dense class="info-banner q-mt-md rounded-borders">
            <div class="text-weight-bold text-white">
              {{ metodoSeleccionado.nombre }}
            </div>
            <div class="text-grey-4 text-caption">
              {{ descripcionMetodo(metodoSeleccionado.nombre) }}
            </div>
          </q-banner>

          <template v-if="metodoSeleccionado">
            <div class="text-grey-5 text-caption q-mb-xs q-mt-md">Alias para reconocerlo</div>
            <q-input
              v-model.trim="alias"
              dark
              outlined
              color="amber"
              maxlength="100"
              placeholder="Ejemplo: Mi Yape principal, BCP soles, PayPal personal"
            />

            <div v-for="campo in camposFormulario" :key="campo.key" class="q-mt-md">
              <div class="text-grey-5 text-caption q-mb-xs">{{ campo.label }}</div>
              <q-input
                v-model.trim="datosFormulario[campo.key]"
                :type="campo.type || 'text'"
                dark
                outlined
                color="amber"
                :maxlength="campo.maxlength"
                :placeholder="campo.placeholder"
              />
            </div>

            <q-banner
              v-if="esTarjetaSeleccionada"
              dense
              class="bg-orange-9 text-white q-mt-md rounded-borders"
            >
              Este proyecto no procesa tarjetas como pasarela real. Si registras tarjeta, guarda
              solo marca, titular y últimos 4 dígitos. Nunca CVV ni número completo.
            </q-banner>

            <q-card flat bordered class="preview-card q-pa-md q-mt-md">
              <div class="text-grey-5 text-caption q-mb-xs">Vista previa</div>
              <div class="text-white text-weight-bold">
                {{ resumenPreview }}
              </div>
              <div class="text-grey-5 text-caption q-mt-xs">
                Este resumen se usa como etiqueta. Los datos completos se copian a la oferta solo
                cuando tú los eliges al publicar.
              </div>
            </q-card>
          </template>

          <q-banner
            v-if="mensaje"
            dense
            class="q-mt-md rounded-borders"
            :class="ok ? 'bg-green-9 text-white' : 'bg-red-9 text-white'"
          >
            {{ mensaje }}
          </q-banner>

          <q-btn
            color="amber"
            text-color="black"
            icon="save"
            label="Guardar método de recepción"
            class="full-width q-mt-md text-weight-bold"
            :loading="guardando"
            :disable="!metodoSeleccionado"
            @click="guardarMetodo"
          />
        </q-card>

        <q-card class="panel q-pa-md q-mt-lg">
          <div class="row items-center q-mb-sm">
            <q-icon name="shield" color="amber" size="22px" class="q-mr-sm" />
            <div class="text-white text-weight-bold">Regla del flujo P2P</div>
          </div>
          <div class="text-grey-4 text-body2">
            Un mismo usuario puede comprar o vender. Cuando compras, solo ves los datos del vendedor
            y pagas fuera de la plataforma. Cuando vendes, usas estos métodos guardados para indicar
            dónde recibirás el dinero.
          </div>
        </q-card>
      </div>

      <div class="col-12 col-lg-7">
        <q-card class="panel q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-white text-subtitle1 text-weight-bold">Métodos guardados</div>
              <div class="text-grey-5 text-caption">
                Los podrás seleccionar al publicar una oferta.
              </div>
            </div>
            <q-badge color="blue-grey-8" text-color="white" class="q-pa-sm">
              {{ metodos.length }} registrado(s)
            </q-badge>
          </div>

          <div v-if="cargando" class="text-center q-pa-xl">
            <q-spinner color="amber" size="40px" />
            <div class="text-grey-5 q-mt-sm">Cargando métodos...</div>
          </div>

          <q-card
            v-else-if="metodos.length === 0"
            flat
            bordered
            class="empty-card q-pa-xl text-center"
          >
            <q-icon name="credit_card_off" size="52px" color="grey-6" />
            <div class="text-white text-weight-bold q-mt-md">
              Aún no tienes métodos de recepción
            </div>
            <div class="text-grey-5 q-mt-xs">
              Agrega uno aquí o escribe los datos manualmente al publicar una oferta.
            </div>
          </q-card>

          <div v-else class="row q-col-gutter-md">
            <div v-for="metodo in metodos" :key="metodo.id" class="col-12 col-md-6">
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
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import {
  camposPorMetodo,
  crearResumenPublico,
  descripcionMetodo,
  iconoMetodo,
  normalizarTexto,
  validarDatosMetodo,
} from '@/utils/paymentMethods'

const metodos = ref([])
const catalogoMetodos = ref([])
const cargando = ref(false)
const cargandoCatalogo = ref(false)
const guardando = ref(false)
const eliminandoId = ref(null)
const mensaje = ref('')
const ok = ref(false)

const metodoSeleccionado = ref(null)
const alias = ref('')
const datosFormulario = ref({})

const camposFormulario = computed(() => camposPorMetodo(metodoSeleccionado.value?.nombre))
const esTarjetaSeleccionada = computed(() =>
  normalizarTexto(metodoSeleccionado.value?.nombre).includes('tarjeta'),
)
const resumenPreview = computed(() =>
  crearResumenPublico(
    metodoSeleccionado.value?.nombre,
    datosFormulario.value,
    alias.value || metodoSeleccionado.value?.nombre,
  ),
)

async function cargarMetodosGuardados() {
  cargando.value = true
  mensaje.value = ''

  try {
    const res = await api.get('/usuariometodopago/mis-metodos')
    metodos.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Error al cargar métodos guardados:', error)
    ok.value = false
    mensaje.value = 'No se pudieron cargar tus métodos de recepción.'
  } finally {
    cargando.value = false
  }
}

async function cargarCatalogo() {
  cargandoCatalogo.value = true

  try {
    const res = await api.get('/metodopago')
    catalogoMetodos.value = Array.isArray(res.data)
      ? res.data.filter((m) => m.activo !== false)
      : []
  } catch (error) {
    console.error('Error al cargar catálogo de métodos:', error)
    ok.value = false
    mensaje.value = 'No se pudo cargar el catálogo de métodos.'
  } finally {
    cargandoCatalogo.value = false
  }
}

async function cargarTodo() {
  await Promise.all([cargarCatalogo(), cargarMetodosGuardados()])
}

function limpiarFormulario() {
  mensaje.value = ''
  ok.value = false
  alias.value = metodoSeleccionado.value?.nombre || ''
  datosFormulario.value = {}
}

function validarFormulario() {
  if (!metodoSeleccionado.value) return 'Selecciona un tipo de método.'
  if (!alias.value) return 'Ingresa un alias para reconocer el método.'

  return validarDatosMetodo(metodoSeleccionado.value.nombre, datosFormulario.value)
}

async function guardarMetodo() {
  mensaje.value = ''
  ok.value = false

  const error = validarFormulario()
  if (error) {
    mensaje.value = error
    return
  }

  guardando.value = true

  try {
    await api.post('/usuariometodopago', {
      metodoPagoId: metodoSeleccionado.value.id,
      alias: alias.value,
      datosPago: datosFormulario.value,
      resumenPublico: resumenPreview.value,
    })

    ok.value = true
    mensaje.value = 'Método de recepción guardado correctamente.'
    metodoSeleccionado.value = null
    alias.value = ''
    datosFormulario.value = {}
    await cargarMetodosGuardados()
  } catch (error) {
    console.error('Error al guardar método:', error)
    ok.value = false
    mensaje.value = error.response?.data?.mensaje || 'No se pudo guardar el método de recepción.'
  } finally {
    guardando.value = false
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
    mensaje.value = error.response?.data?.mensaje || 'No se pudo eliminar el método de recepción.'
  } finally {
    eliminandoId.value = null
  }
}

function formatearFecha(fecha) {
  if (!fecha) return '—'

  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(cargarTodo)
</script>

<style scoped>
.metodos-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel,
.metodo-card,
.empty-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
}

.metodo-card,
.preview-card {
  transition:
    border 0.2s,
    transform 0.2s;
}

.metodo-card:hover {
  border-color: #f2c037;
  transform: translateY(-2px);
}

.preview-card,
.empty-card {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
}

.info-banner {
  background: #23313a;
  color: #dce9ef;
}
</style>
