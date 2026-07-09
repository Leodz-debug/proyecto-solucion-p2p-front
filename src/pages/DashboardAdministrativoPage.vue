<template>
  <q-page class="admin-page q-pa-lg">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold text-white">Dashboard Administrativo</div>
        <div class="text-grey-5">
          Monitoreo general de operaciones, usuarios, disputas y reportes
        </div>
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
          <q-card class="panel stat-card q-pa-md cursor-pointer" @click="cambiarTab('disputas')">
            <q-icon name="report_problem" size="42px" color="red" />
            <div class="text-h4 text-white text-weight-bold q-mt-sm">
              {{ reporte.totalDisputas }}
            </div>
            <div class="text-grey-5">Disputas</div>
            <div class="text-caption text-grey-6">Activas: {{ disputasActivas }}</div>
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
                <q-badge color="blue-grey-8" text-color="white">{{
                  formatearMonto(moneda.volumen)
                }}</q-badge>
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
                @click="cambiarTab('usuarios')"
              />
              <q-btn
                outline
                color="amber"
                icon="storefront"
                label="Ofertas"
                @click="cambiarTab('ofertas')"
              />
              <q-btn
                outline
                color="amber"
                icon="receipt_long"
                label="Operaciones"
                @click="cambiarTab('operaciones')"
              />
              <q-btn
                outline
                color="amber"
                icon="gavel"
                label="Disputas"
                @click="cambiarTab('disputas')"
              />
              <q-btn
                outline
                color="amber"
                icon="assessment"
                label="Reportes"
                @click="cambiarTab('reportes')"
              />
              <q-btn
                outline
                color="amber"
                icon="verified"
                label="Verificaciones"
                @click="cambiarTab('resumen')"
              />
            </div>
          </q-card>
        </div>
      </div>

      <q-card class="panel q-mt-xl">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey-5 admin-tabs"
          active-color="amber"
          indicator-color="amber"
          align="left"
        >
          <q-tab name="resumen" icon="dashboard" label="Resumen" />
          <q-tab name="usuarios" icon="people" label="Usuarios" />
          <q-tab name="ofertas" icon="storefront" label="Ofertas" />
          <q-tab name="operaciones" icon="receipt_long" label="Operaciones" />
          <q-tab name="disputas" icon="gavel" label="Disputas" />
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
                class="admin-search"
              >
                <template #prepend><q-icon name="search" /></template>
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
                    <q-avatar color="amber" text-color="black" size="48px">{{
                      obtenerInicial(v.nombreCompleto)
                    }}</q-avatar>
                    <div class="q-ml-md col">
                      <div class="text-white text-weight-bold ellipsis">{{ v.nombreCompleto }}</div>
                      <div class="text-grey-5 text-caption ellipsis">{{ v.correo }}</div>
                    </div>
                  </div>

                  <q-separator dark class="q-my-md" />

                  <div class="detail-row">
                    <span>Documento:</span
                    ><span>{{ v.tipoDocumento }} {{ v.documentoIdentidad }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Fecha:</span><span>{{ formatearFecha(v.fechaRegistro) }}</span>
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
                <q-banner class="bg-blue-grey-10 text-grey-4 rounded-borders"
                  >No hay solicitudes que coincidan con la búsqueda.</q-banner
                >
              </div>
            </div>

            <q-separator dark class="q-my-lg" />

            <div class="text-h6 text-white q-mb-md">Actividad reciente</div>
            <q-list separator bordered class="activity-list">
              <q-item v-for="(item, index) in actividad" :key="index">
                <q-item-section avatar
                  ><q-icon :name="item.icono" :color="item.color"
                /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">{{ item.texto }}</q-item-label>
                  <q-item-label caption class="text-grey-5">{{ item.fecha }}</q-item-label>
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
                class="admin-search"
              >
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </div>

            <div class="row q-col-gutter-md">
              <div v-for="u in usuariosFiltrados" :key="u.id" class="col-12 col-md-6 col-lg-4">
                <q-card class="inner-card q-pa-md">
                  <div class="row items-center no-wrap">
                    <q-avatar color="blue-grey-8" text-color="white" size="44px">{{
                      obtenerInicial(u.nombreCompleto)
                    }}</q-avatar>
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
                <div class="text-grey-5 text-caption">
                  Revisión de ofertas publicadas por usuarios
                </div>
              </div>
              <q-space />
              <q-input
                v-model="buscarOferta"
                outlined
                dense
                dark
                color="amber"
                placeholder="Buscar moneda, vendedor o estado..."
                class="admin-search"
              >
                <template #prepend><q-icon name="search" /></template>
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
                    <q-chip dense :color="colorOferta(oferta.estado)" text-color="white">{{
                      oferta.estado
                    }}</q-chip>
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
                      text-color="white"
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

          <q-tab-panel name="operaciones">
            <div class="row items-center q-mb-md">
              <div>
                <div class="text-h6 text-white">Operaciones</div>
                <div class="text-grey-5 text-caption">
                  Control de operaciones registradas en la plataforma
                </div>
              </div>
              <q-space />
              <q-input
                v-model="buscarOperacion"
                outlined
                dense
                dark
                color="amber"
                placeholder="Buscar código, usuario, estado..."
                class="admin-search"
              >
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </div>

            <div class="row q-col-gutter-md">
              <div v-for="op in operacionesFiltradas" :key="op.id" class="col-12 col-md-6 col-lg-4">
                <q-card class="inner-card q-pa-md">
                  <div class="row items-start justify-between q-mb-sm">
                    <div>
                      <div class="text-white text-weight-bold">
                        {{ op.codigoOperacion || `Operación #${op.id}` }}
                      </div>
                      <div class="text-grey-5 text-caption">
                        {{ formatearFechaHora(op.fechaInicio) }}
                      </div>
                    </div>
                    <q-chip dense :color="colorOperacion(op.estado)" text-color="white">{{
                      op.estado
                    }}</q-chip>
                  </div>
                  <div class="detail-row">
                    <span>Monto:</span><span>{{ formatearMonto(op.monto) }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Comprador:</span
                    ><span>{{ op.compradorNombre || `#${op.compradorId}` }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Vendedor:</span
                    ><span>{{ op.vendedorNombre || `#${op.vendedorId}` }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Método:</span><span>{{ op.metodoPagoNombre || '—' }}</span>
                  </div>
                </q-card>
              </div>

              <div v-if="operacionesFiltradas.length === 0" class="col-12 text-grey-5">
                No hay operaciones para mostrar.
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="disputas">
            <div class="row items-center q-mb-md">
              <div>
                <div class="text-h6 text-white">Gestión de disputas</div>
                <div class="text-grey-5 text-caption">
                  Revisa evidencia, operación relacionada y registra la resolución administrativa.
                </div>
              </div>
              <q-space />
              <q-select
                v-model="filtroEstadoDisputa"
                :options="opcionesEstadoDisputa"
                dense
                outlined
                dark
                color="amber"
                emit-value
                map-options
                class="admin-filter q-mr-sm"
              />
              <q-input
                v-model="buscarDisputa"
                outlined
                dense
                dark
                color="amber"
                placeholder="Buscar disputa..."
                class="admin-search"
              >
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </div>

            <div class="row q-col-gutter-md">
              <div v-for="d in disputasFiltradas" :key="d.id" class="col-12 col-lg-6">
                <q-card class="inner-card q-pa-md dispute-card">
                  <div class="row items-start justify-between q-mb-sm">
                    <div>
                      <div class="text-white text-weight-bold">
                        {{ d.codigoOperacion || `Operación #${d.operacionId}` }}
                      </div>
                      <div class="text-grey-5 text-caption">
                        Registrada: {{ formatearFechaHora(d.fechaRegistro) }}
                      </div>
                    </div>
                    <q-chip dense :color="colorDisputa(d.estado)" text-color="white">{{
                      d.estado || '—'
                    }}</q-chip>
                  </div>

                  <div class="detail-row">
                    <span>Monto:</span><span>{{ formatearMonto(d.monto) }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Comprador:</span
                    ><span>{{ d.compradorNombre || `#${d.compradorId}` }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Vendedor:</span><span>{{ d.vendedorNombre || `#${d.vendedorId}` }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Método:</span><span>{{ d.metodoPagoNombre || '—' }}</span>
                  </div>

                  <q-separator dark class="q-my-md" />

                  <div class="text-grey-5 text-caption q-mb-xs">Motivo</div>
                  <div class="text-white dispute-text">{{ d.motivo || '—' }}</div>

                  <div v-if="d.resolucion" class="q-mt-md">
                    <div class="text-grey-5 text-caption q-mb-xs">Resolución</div>
                    <div class="resolution-box">{{ d.resolucion }}</div>
                  </div>

                  <div class="q-mt-md">
                    <div class="text-grey-5 text-caption q-mb-xs">Evidencias</div>
                    <div v-if="d.evidencias?.length" class="q-gutter-xs">
                      <q-btn
                        v-for="ev in d.evidencias"
                        :key="ev.id"
                        dense
                        outline
                        color="amber"
                        icon="attach_file"
                        label="Abrir evidencia"
                        @click="abrirArchivo(ev.rutaArchivo)"
                      />
                    </div>
                    <div v-else class="text-grey-6">Sin evidencias cargadas.</div>
                  </div>

                  <div class="row q-gutter-sm q-mt-md">
                    <q-btn
                      v-if="!esDisputaResuelta(d.estado)"
                      color="positive"
                      icon="check_circle"
                      label="Resolver a favor vendedor"
                      no-caps
                      @click="abrirResolver(d, 'Resuelta a favor vendedor')"
                    />
                    <q-btn
                      v-if="!esDisputaResuelta(d.estado)"
                      color="negative"
                      outline
                      icon="person"
                      label="Resolver a favor comprador"
                      no-caps
                      @click="abrirResolver(d, 'Resuelta a favor comprador')"
                    />
                  </div>
                </q-card>
              </div>

              <div v-if="disputasFiltradas.length === 0" class="col-12">
                <q-banner class="bg-blue-grey-10 text-grey-4 rounded-borders">
                  No hay disputas que coincidan con el filtro.
                </q-banner>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="reportes">
            <div class="row items-center q-mb-md">
              <div>
                <div class="text-h6 text-white">Reportes</div>
                <div class="text-grey-5 text-caption">
                  Los reportes se guardan cuando presionas “Generar reporte”. Si la lista está
                  vacía, no es error: todavía no se generó ninguno.
                </div>
              </div>
              <q-space />
              <div class="row q-gutter-sm">
                <q-btn
                  color="amber"
                  text-color="black"
                  icon="add_chart"
                  label="Generar reporte"
                  :loading="generandoReporte"
                  @click="generarReporte"
                />
                <q-btn
                  outline
                  color="amber"
                  icon="table_view"
                  label="Exportar Excel"
                  @click="exportarExcel"
                />
                <q-btn
                  outline
                  color="amber"
                  icon="picture_as_pdf"
                  label="PDF / imprimir"
                  @click="exportarPdf"
                />
              </div>
            </div>

            <q-banner class="bg-blue-grey-10 text-grey-4 rounded-borders q-mb-md">
              El resumen superior siempre se calcula en tiempo real. Esta pestaña guarda una
              fotografía de esos datos para sustentar el reporte administrativo.
            </q-banner>

            <div class="row q-col-gutter-md">
              <div v-for="r in reportes" :key="r.id" class="col-12 col-md-6 col-lg-4">
                <q-card class="inner-card q-pa-md">
                  <div class="text-white text-weight-bold">Reporte #{{ r.id }}</div>
                  <div class="text-grey-5 text-caption q-mb-md">
                    {{ formatearFechaHora(r.fechaGeneracion) }}
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
                  <div class="detail-row">
                    <span>Generado por:</span><span>#{{ r.generadoPorUsuarioId }}</span>
                  </div>
                </q-card>
              </div>

              <div v-if="reportes.length === 0" class="col-12">
                <q-banner class="bg-blue-grey-10 text-grey-4 rounded-borders">
                  No existen reportes guardados todavía. Presiona “Generar reporte” para guardar el
                  estado actual del dashboard.
                </q-banner>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </template>

    <q-dialog v-model="resolverDialog">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6 text-white">Resolver disputa</div>
          <div class="text-grey-5 text-caption">
            {{
              disputaSeleccionada?.codigoOperacion ||
              `Operación #${disputaSeleccionada?.operacionId}`
            }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-grey-5 text-caption q-mb-xs">Resultado</div>
          <q-select
            v-model="resolucionForm.estado"
            :options="['Resuelta a favor vendedor', 'Resuelta a favor comprador']"
            outlined
            dark
            color="amber"
          />

          <div class="text-grey-5 text-caption q-mb-xs q-mt-md">Comentario de resolución</div>
          <q-input
            v-model.trim="resolucionForm.resolucion"
            type="textarea"
            autogrow
            outlined
            dark
            color="amber"
            maxlength="1000"
            counter
            placeholder="Explica brevemente por qué se resolvió así."
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="grey-4" label="Cancelar" v-close-popup />
          <q-btn
            color="amber"
            text-color="black"
            label="Guardar resolución"
            :loading="guardandoResolucion"
            @click="resolverDisputa"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const tab = ref(route.query.tab || 'resumen')

const reporte = ref(crearReporteVacio())
const verificaciones = ref([])
const usuarios = ref([])
const ofertas = ref([])
const operaciones = ref([])
const disputas = ref([])
const reportes = ref([])
const actividad = ref([])

const buscarVerificacion = ref('')
const buscarUsuario = ref('')
const buscarOferta = ref('')
const buscarOperacion = ref('')
const buscarDisputa = ref('')
const filtroEstadoDisputa = ref('todas')

const generandoReporte = ref(false)
const resolverDialog = ref(false)
const guardandoResolucion = ref(false)
const disputaSeleccionada = ref(null)
const resolucionForm = ref({ estado: 'Resuelta a favor vendedor', resolucion: '' })

const opcionesEstadoDisputa = [
  { label: 'Todas', value: 'todas' },
  { label: 'Activas', value: 'activas' },
  { label: 'Resueltas', value: 'resueltas' },
]

const verificacionesPendientes = computed(
  () => verificaciones.value.filter((x) => x.estadoVerificacion === 'Pendiente').length,
)

const disputasActivas = computed(
  () => disputas.value.filter((d) => !esDisputaResuelta(d.estado)).length,
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

const operacionesFiltradas = computed(() => {
  const texto = buscarOperacion.value.toLowerCase().trim()
  if (!texto) return operaciones.value

  return operaciones.value.filter((o) =>
    [o.codigoOperacion, o.estado, o.compradorNombre, o.vendedorNombre, o.metodoPagoNombre, o.monto]
      .join(' ')
      .toLowerCase()
      .includes(texto),
  )
})

const disputasFiltradas = computed(() => {
  const texto = buscarDisputa.value.toLowerCase().trim()

  return disputas.value.filter((d) => {
    const resuelta = esDisputaResuelta(d.estado)

    if (filtroEstadoDisputa.value === 'activas' && resuelta) return false
    if (filtroEstadoDisputa.value === 'resueltas' && !resuelta) return false

    if (!texto) return true

    return [
      d.codigoOperacion,
      d.estado,
      d.motivo,
      d.resolucion,
      d.compradorNombre,
      d.vendedorNombre,
      d.metodoPagoNombre,
      d.operacionId,
    ]
      .join(' ')
      .toLowerCase()
      .includes(texto)
  })
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

function cambiarTab(nombre) {
  tab.value = nombre
  router.replace({ path: '/admin', query: { tab: nombre } })
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

function formatearFechaHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
    case 'Finalizada':
      return 'blue-grey-8'
    default:
      return 'grey'
  }
}

function colorOperacion(estado) {
  switch (estado) {
    case 'Completada':
      return 'green'
    case 'En disputa':
      return 'red'
    case 'Pago enviado':
      return 'orange'
    case 'En proceso':
      return 'blue'
    case 'Cancelada':
    case 'Expirada':
      return 'blue-grey-8'
    default:
      return 'grey'
  }
}

function colorDisputa(estado) {
  if (esDisputaResuelta(estado)) return 'green'
  return 'red'
}

function esDisputaResuelta(estado) {
  const valor = String(estado || '').toLowerCase()
  return valor.includes('resuelta')
}

function normalizarDisputa(d) {
  return {
    ...d,
    codigoOperacion: d.codigoOperacion || '',
    compradorNombre: d.compradorNombre || '',
    vendedorNombre: d.vendedorNombre || '',
    metodoPagoNombre: d.metodoPagoNombre || '',
    evidencias: Array.isArray(d.evidencias) ? d.evidencias : [],
  }
}

function urlArchivo(ruta) {
  if (!ruta) return '#'
  if (ruta.startsWith('http')) return ruta

  const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '')
  return `${base}${ruta}`
}

function abrirArchivo(ruta) {
  window.open(urlArchivo(ruta), '_blank', 'noopener,noreferrer')
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

async function cargarOperaciones() {
  const res = await api.get('/operacion')
  operaciones.value = Array.isArray(res.data) ? res.data : []
}

async function cargarDisputas() {
  try {
    const res = await api.get('/disputa/admin/historial')
    disputas.value = Array.isArray(res.data) ? res.data.map(normalizarDisputa) : []
  } catch {
    const res = await api.get('/disputa')
    disputas.value = Array.isArray(res.data) ? res.data.map(normalizarDisputa) : []
  }
}

async function cargarReportes() {
  const res = await api.get('/reporteadministrativo')
  reportes.value = Array.isArray(res.data)
    ? res.data.sort((a, b) => new Date(b.fechaGeneracion) - new Date(a.fechaGeneracion))
    : []
}

async function aprobar(verificacion) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Deseas aprobar a ${verificacion.nombreCompleto}?`,
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
    message: `¿Deseas rechazar la verificación de ${verificacion.nombreCompleto}?`,
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

function abrirResolver(disputa, estado) {
  disputaSeleccionada.value = disputa
  resolucionForm.value = {
    estado,
    resolucion: disputa.resolucion || '',
  }
  resolverDialog.value = true
}

async function resolverDisputa() {
  if (!disputaSeleccionada.value) return

  if (!resolucionForm.value.resolucion || resolucionForm.value.resolucion.length < 10) {
    $q.notify({ type: 'warning', message: 'Escribe una resolución de al menos 10 caracteres.' })
    return
  }

  guardandoResolucion.value = true

  try {
    await api.put(`/disputa/${disputaSeleccionada.value.id}/resolver`, resolucionForm.value)
    $q.notify({ type: 'positive', message: 'Disputa resuelta correctamente.' })
    resolverDialog.value = false
    await cargarTodo()
  } catch (error) {
    console.error(error)

    // Respaldo para APIs antiguas que aún no tengan /resolver.
    try {
      await api.put(`/disputa/${disputaSeleccionada.value.id}`, {
        ...disputaSeleccionada.value,
        estado: resolucionForm.value.estado,
        resolucion: resolucionForm.value.resolucion,
      })
      $q.notify({ type: 'positive', message: 'Disputa actualizada correctamente.' })
      resolverDialog.value = false
      await cargarTodo()
    } catch (fallbackError) {
      console.error(fallbackError)
      $q.notify({ type: 'negative', message: 'No fue posible resolver la disputa.' })
    }
  } finally {
    guardandoResolucion.value = false
  }
}

async function generarReporte() {
  if (!auth.usuario?.id) {
    $q.notify({ type: 'negative', message: 'No se encontró el usuario administrador.' })
    return
  }

  generandoReporte.value = true

  try {
    await api.post('/reporteadministrativo', {
      generadoPorUsuarioId: auth.usuario.id,
      fechaGeneracion: new Date().toISOString(),
      totalOperaciones: reporte.value.totalOperaciones,
      totalDisputas: reporte.value.totalDisputas,
      totalUsuarios: reporte.value.totalUsuarios,
    })

    $q.notify({ type: 'positive', message: 'Reporte generado correctamente.' })
    await cargarReportes()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'No fue posible generar el reporte.' })
  } finally {
    generandoReporte.value = false
  }
}

function descargarArchivo(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function exportarExcel() {
  const filas = reportes.value.length
    ? reportes.value
    : [
        {
          id: 'Actual',
          fechaGeneracion: new Date().toISOString(),
          totalUsuarios: reporte.value.totalUsuarios,
          totalOperaciones: reporte.value.totalOperaciones,
          totalDisputas: reporte.value.totalDisputas,
          generadoPorUsuarioId: auth.usuario?.id || '',
        },
      ]

  const filasHtml = filas
    .map(
      (r) => `
        <tr>
          <td>${r.id}</td>
          <td>${formatearFechaHora(r.fechaGeneracion)}</td>
          <td>${r.totalUsuarios}</td>
          <td>${r.totalOperaciones}</td>
          <td>${r.totalDisputas}</td>
          <td>${r.generadoPorUsuarioId}</td>
        </tr>`,
    )
    .join('')

  const html = `
    <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>Reporte</th>
              <th>Fecha</th>
              <th>Total usuarios</th>
              <th>Total operaciones</th>
              <th>Total disputas</th>
              <th>Generado por</th>
            </tr>
          </thead>
          <tbody>${filasHtml}</tbody>
        </table>
      </body>
    </html>`

  descargarArchivo('reporte_administrativo.xls', html, 'application/vnd.ms-excel;charset=utf-8')
}

function exportarPdf() {
  const ventana = window.open('', '_blank')
  if (!ventana) {
    $q.notify({ type: 'warning', message: 'El navegador bloqueó la ventana de impresión.' })
    return
  }

  const filasReportes = reportes.value
    .map(
      (r) => `
        <tr>
          <td>#${r.id}</td>
          <td>${formatearFechaHora(r.fechaGeneracion)}</td>
          <td>${r.totalUsuarios}</td>
          <td>${r.totalOperaciones}</td>
          <td>${r.totalDisputas}</td>
        </tr>`,
    )
    .join('')

  ventana.document.write(`
    <html>
      <head>
        <title>Reporte Administrativo</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
          h1 { margin-bottom: 4px; }
          .muted { color: #555; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .card { border: 1px solid #ccc; border-radius: 10px; padding: 12px; }
          .value { font-size: 28px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Reporte Administrativo - CambioSeguro P2P</h1>
        <div class="muted">Generado: ${formatearFechaHora(new Date())}</div>
        <div class="grid">
          <div class="card"><div>Usuarios activos</div><div class="value">${reporte.value.usuariosActivos}</div></div>
          <div class="card"><div>Operaciones completadas</div><div class="value">${reporte.value.operacionesCompletadas}</div></div>
          <div class="card"><div>Disputas</div><div class="value">${reporte.value.totalDisputas}</div></div>
          <div class="card"><div>Volumen</div><div class="value">${formatearMonto(reporte.value.volumenIntercambio)}</div></div>
        </div>
        <h2>Reportes guardados</h2>
        <table>
          <thead><tr><th>Reporte</th><th>Fecha</th><th>Usuarios</th><th>Operaciones</th><th>Disputas</th></tr></thead>
          <tbody>${filasReportes || '<tr><td colspan="5">No hay reportes guardados.</td></tr>'}</tbody>
        </table>
      </body>
    </html>
  `)

  ventana.document.close()
  ventana.focus()

  // Se imprime después de que el navegador termina de pintar el HTML.
  // Así evitamos meter una etiqueta <script> dentro del .vue, que puede marcar error.
  setTimeout(() => {
    ventana.print()
  }, 300)
}

function cargarActividad() {
  const actividadVerificaciones = [...verificaciones.value]
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .slice(0, 3)
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

  const actividadDisputas = [...disputas.value]
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .slice(0, 2)
    .map((d) => ({
      icono: esDisputaResuelta(d.estado) ? 'gavel' : 'report_problem',
      color: esDisputaResuelta(d.estado) ? 'green' : 'red',
      texto: esDisputaResuelta(d.estado)
        ? `Disputa ${d.codigoOperacion || '#' + d.operacionId} fue resuelta.`
        : `Disputa ${d.codigoOperacion || '#' + d.operacionId} requiere revisión.`,
      fecha: formatearFecha(d.fechaRegistro),
    }))

  actividad.value = [...actividadDisputas, ...actividadVerificaciones].slice(0, 5)
}

async function cargarTodo() {
  loading.value = true

  const resultados = await Promise.allSettled([
    cargarReporte(),
    cargarVerificaciones(),
    cargarUsuarios(),
    cargarOfertas(),
    cargarOperaciones(),
    cargarDisputas(),
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

watch(
  () => route.query.tab,
  (nuevoTab) => {
    if (nuevoTab && nuevoTab !== tab.value) tab.value = nuevoTab
  },
)

watch(tab, (nuevoTab) => {
  if ((route.query.tab || 'resumen') !== nuevoTab) {
    router.replace({ path: '/admin', query: { tab: nuevoTab } })
  }
})

onMounted(cargarTodo)
</script>

<style scoped>
.admin-page {
  background: #0d1117;
  min-height: 100vh;
}

.panel,
.inner-card,
.dialog-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
}

.inner-card,
.dialog-card {
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

.dispute-text {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 10px;
  white-space: pre-wrap;
}

.resolution-box {
  background: rgba(35, 134, 54, 0.12);
  border: 1px solid rgba(35, 134, 54, 0.35);
  border-radius: 10px;
  color: #d1f7d6;
  padding: 10px;
  white-space: pre-wrap;
}

.admin-search {
  width: 320px;
  max-width: 100%;
}

.admin-filter {
  width: 160px;
}

.q-btn {
  border-radius: 10px;
}

:deep(.q-field__native),
:deep(.q-field__input),
:deep(.q-field__label),
:deep(.q-placeholder),
:deep(.q-item__label),
:deep(.q-item__label--caption),
:deep(.q-tab__label) {
  color: #e6edf3 !important;
}

:deep(.q-field__control) {
  color: #e6edf3 !important;
}

:deep(.q-field__native::placeholder),
:deep(.q-field__input::placeholder) {
  color: #8b949e !important;
  opacity: 1;
}

:deep(.q-tab:not(.q-tab--active) .q-tab__label),
:deep(.q-tab:not(.q-tab--active) .q-icon) {
  color: #8b949e !important;
}

@media (max-width: 700px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .admin-search,
  .admin-filter {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
