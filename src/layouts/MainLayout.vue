<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-custom">
    <q-header elevated class="bg-header q-px-md">
      <q-toolbar class="row justify-between items-center q-py-xs">
        <div
          class="row items-center q-gutter-xs cursor-pointer"
          @click="$router.push('/seleccion')"
        >
          <q-icon name="shield" size="28px" color="amber" />
          <span class="text-h6 text-weight-bold text-white">
            CambioSeguro <span class="text-amber">P2P</span>
          </span>
        </div>

        <div class="row items-center q-gutter-md gt-xs">
          <q-btn
            flat
            no-caps
            label="Inicio"
            class="text-grey-4"
            @click="$router.push('/seleccion')"
          />
          <q-btn
            flat
            no-caps
            label="Marketplace"
            class="text-grey-4"
            @click="$router.push('/marketplace')"
          />
          <q-btn
            flat
            no-caps
            label="Publicar oferta"
            class="text-grey-4"
            @click="$router.push('/publicar')"
          />
          <q-btn
            v-if="auth.usuario?.rol === 'Administrador'"
            flat
            no-caps
            label="Dashboard Administrativo"
            class="text-grey-4"
            @click="$router.push('/admin')"
          />
        </div>

        <div class="row items-center q-gutter-sm">
          <q-btn dense flat round icon="notifications" color="grey-4">
            <q-badge
              v-if="
                (!auth.esAdmin && auth.usuario?.estadoVerificacion === 'Pendiente') ||
                notificacionesNoLeidas > 0
              "
              color="red"
              floating
              rounded
            >
              {{ notificacionesNoLeidas > 0 ? notificacionesNoLeidas : '' }}
            </q-badge>

            <q-menu
              anchor="bottom right"
              self="top right"
              style="width: 340px"
              @show="marcarVistas"
            >
              <q-list separator>
                <q-item v-if="!auth.esAdmin && auth.usuario?.estadoVerificacion === 'Pendiente'">
                  <q-item-section avatar>
                    <q-icon color="orange" name="warning" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">Verificación pendiente</q-item-label>

                    <q-item-label caption>
                      Tu identidad aún no ha sido aprobada. Algunas funciones estarán deshabilitadas
                      hasta que un administrador revise tu solicitud.
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-for="n in notificaciones"
                  :key="n.id"
                  clickable
                  v-close-popup
                  @click="irANotificacion(n)"
                >
                  <q-item-section avatar>
                    <q-icon :color="n.leida ? 'grey-6' : 'amber'" name="notifications" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="n.leida ? 'text-grey-5' : 'text-weight-bold'">
                      {{ n.titulo }}
                    </q-item-label>
                    <q-item-label caption>{{ n.mensaje }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-if="
                    notificaciones.length === 0 &&
                    (auth.esAdmin || auth.usuario?.estadoVerificacion !== 'Pendiente')
                  "
                >
                  <q-item-section>No tienes notificaciones.</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn flat no-caps class="user-menu-btn q-px-sm">
            <q-avatar color="amber" text-color="black" size="42px" class="q-mr-sm avatar-shadow">
              {{ inicialUsuario }}
            </q-avatar>

            <div class="user-menu-trigger gt-xs">
              <div class="user-menu-trigger__name">
                {{ nombreUsuario }}
              </div>

              <div class="user-menu-trigger__status">
                {{ auth.esAdmin ? 'Administrador' : estadoUsuario }}
              </div>
            </div>

            <q-icon name="keyboard_arrow_down" color="white" size="20px" class="q-ml-xs" />

            <q-menu
              anchor="bottom right"
              self="top right"
              :offset="[0, 10]"
              content-class="user-dropdown"
            >
              <div class="user-dropdown-panel">
                <div class="user-dropdown-header">
                  <div class="row items-center no-wrap q-gutter-sm">
                    <q-avatar color="amber" text-color="black" size="50px" class="avatar-shadow">
                      {{ inicialUsuario }}
                    </q-avatar>

                    <div class="col">
                      <div class="user-dropdown-name">
                        {{ nombreUsuario }}
                      </div>

                      <div class="user-dropdown-subtitle">
                        {{ auth.esAdmin ? 'Administrador del sistema' : 'Cuenta personal' }}
                      </div>

                      <div class="user-status-chip q-mt-xs">
                        <q-icon
                          :name="estadoCuenta.icono"
                          :color="estadoCuenta.color"
                          size="16px"
                          class="q-mr-xs"
                        />
                        <span>{{ auth.esAdmin ? 'Administrador' : estadoUsuario }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="user-dropdown-body">
                  <q-list class="dropdown-list" padding>
                    <q-item
                      clickable
                      v-close-popup
                      class="dropdown-link"
                      @click="$router.push('/mis-ofertas')"
                    >
                      <q-item-section avatar>
                        <div class="dropdown-icon-box">
                          <q-icon name="storefront" color="amber" />
                        </div>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="dropdown-title">Mis ofertas</q-item-label>
                        <q-item-label caption class="dropdown-caption">
                          Historial de anuncios publicados
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item
                      clickable
                      v-close-popup
                      class="dropdown-link"
                      @click="$router.push('/metodos-pago')"
                    >
                      <q-item-section avatar>
                        <div class="dropdown-icon-box">
                          <q-icon name="payments" color="amber" />
                        </div>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="dropdown-title">Métodos de pago</q-item-label>
                        <q-item-label caption class="dropdown-caption">
                          Datos guardados para operar
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="user-dropdown-footer">
                  <q-list padding>
                    <q-item
                      clickable
                      v-close-popup
                      class="dropdown-link logout-link"
                      @click="cerrarSesion"
                    >
                      <q-item-section avatar>
                        <div class="dropdown-icon-box logout-icon-box">
                          <q-icon name="logout" color="red-4" />
                        </div>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="dropdown-title text-red-4">Cerrar sesión</q-item-label>
                        <q-item-label caption class="dropdown-caption">
                          Salir de tu cuenta actual
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-dark">
      <q-list class="q-px-sm q-pt-md">
        <q-item
          v-for="(item, index) in menuItems"
          :key="index"
          clickable
          :active="$route.path === item.route"
          active-class="menu-active-item"
          class="menu-item q-mb-sm rounded-borders"
          @click="$router.push(item.route)"
        >
          <q-item-section avatar min-width="40px">
            <q-icon :name="item.icon" :color="$route.path === item.route ? 'amber' : 'grey-4'" />
          </q-item-section>

          <q-item-section>
            <q-item-label
              class="text-weight-medium"
              :class="$route.path === item.route ? 'text-amber' : 'text-grey-4'"
            >
              {{ item.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="absolute-bottom q-pa-md">
        <div class="verified-card q-pa-sm row items-center q-gutter-sm">
          <q-icon :name="estadoCuenta.icono" :color="estadoCuenta.color" size="24px" />

          <div>
            <div class="text-weight-bold text-caption" :class="estadoCuenta.textClass">
              {{ estadoCuenta.titulo }}
            </div>

            <div class="text-grey-5 text-caption" style="font-size: 11px">
              {{ estadoCuenta.subtitulo }}
            </div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '@/services/api'

const router = useRouter()
const auth = useAuthStore()
const leftDrawerOpen = ref(true)

const nombreUsuario = computed(() => {
  return auth.usuario?.nombreCompleto || auth.usuario?.nombre || auth.usuario?.correo || 'Usuario'
})

const inicialUsuario = computed(() => {
  return nombreUsuario.value.charAt(0).toUpperCase()
})

const estadoUsuario = computed(() => {
  return auth.usuario?.estadoVerificacion || 'Pendiente'
})

const estadoCuenta = computed(() => {
  if (auth.esAdmin) {
    return {
      titulo: 'Administrador',
      subtitulo: 'KYC no requerido',
      icono: 'admin_panel_settings',
      color: 'blue',
      textClass: 'text-blue',
    }
  }

  const estado = auth.usuario?.estadoVerificacion || 'Pendiente'

  if (estado === 'Verificado') {
    return {
      titulo: 'Verificado',
      subtitulo: 'Cuenta verificada',
      icono: 'verified',
      color: 'green',
      textClass: 'text-green',
    }
  }

  if (estado === 'Rechazado') {
    return {
      titulo: 'Rechazado',
      subtitulo: 'Revisa tu verificación',
      icono: 'cancel',
      color: 'red',
      textClass: 'text-red',
    }
  }

  return {
    titulo: 'Pendiente',
    subtitulo: 'Cuenta pendiente',
    icono: 'schedule',
    color: 'orange',
    textClass: 'text-orange',
  }
})

const notificaciones = ref([])

const notificacionesNoLeidas = computed(() => {
  return notificaciones.value.filter((n) => !n.leida).length
})

let intervaloNotificaciones = null

async function cargarNotificaciones() {
  if (!auth.usuario) return

  try {
    const res = await api.get('/notificacion')

    notificaciones.value = res.data
      .filter((n) => Number(n.usuarioId) === Number(auth.usuario.id))
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
      .slice(0, 15)
  } catch {
    // Si falla, no rompemos el layout.
  }
}

async function marcarVistas() {
  const noLeidas = notificaciones.value.filter((n) => !n.leida)

  for (const n of noLeidas) {
    n.leida = true

    try {
      await api.put(`/notificacion/${n.id}`, { ...n, leida: true })
    } catch {
      // Si falla, se reintentará en la siguiente carga.
    }
  }
}

function irANotificacion(n) {
  if (n.operacionId) {
    router.push('/operacion/' + n.operacionId)
  }
}

const menuItems = computed(() =>
  [
    { title: 'Inicio', icon: 'home', route: '/seleccion' },
    { title: 'Marketplace', icon: 'language', route: '/marketplace' },
    { title: 'Publicar oferta', icon: 'attach_money', route: '/publicar' },
    { title: 'Operación activa', icon: 'schedule', route: '/operacion' },
    { title: 'Verificación', icon: 'verified_user', route: '/verificacion' },
    { title: 'Calificación', icon: 'star', route: '/calificacion' },
    { title: 'Disputa', icon: 'gavel', route: '/disputa' },
    { title: 'Chat', icon: 'chat', route: '/chat' },
  ].filter((item) => !(auth.esAdmin && item.route === '/verificacion')),
)

function cerrarSesion() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  cargarNotificaciones()
  intervaloNotificaciones = setInterval(cargarNotificaciones, 15000)
})

onUnmounted(() => {
  if (intervaloNotificaciones) clearInterval(intervaloNotificaciones)
})
</script>

<style scoped>
.bg-dark-custom {
  background: #0d1117;
}

.bg-header {
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.bg-sidebar {
  background: #161b22;
  border-right: 1px solid #30363d;
}

.menu-item {
  color: #c9d1d9;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(242, 192, 55, 0.05);
}

.menu-active-item {
  background: rgba(242, 192, 55, 0.1) !important;
  border-left: 3px solid #f2c037;
}

.verified-card {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
}

.user-menu-btn {
  border-radius: 999px;
  min-height: 52px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.user-menu-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.user-menu-trigger {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.user-menu-trigger__name {
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
}

.user-menu-trigger__status {
  color: #8b949e;
  font-size: 12px;
  margin-top: 3px;
}

.avatar-shadow {
  box-shadow: 0 6px 18px rgba(242, 192, 55, 0.16);
}

.user-dropdown {
  min-width: 310px;
  background: transparent;
  box-shadow: none;
}

.user-dropdown-panel {
  background: linear-gradient(180deg, #161b22 0%, #11161d 100%);
  color: #e6edf3;
  border: 1px solid #30363d;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35);
}

.user-dropdown-header {
  background:
    radial-gradient(circle at top right, rgba(242, 192, 55, 0.14), transparent 38%), #0f141b;
  padding: 16px;
  border-bottom: 1px solid #2a313a;
}

.user-dropdown-name {
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
}

.user-dropdown-subtitle {
  color: #8b949e;
  font-size: 12px;
  margin-top: 2px;
}

.user-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.04);
  color: #d0d7de;
  border: 1px solid #30363d;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}

.user-dropdown-body {
  padding-top: 6px;
  padding-bottom: 6px;
}

.user-dropdown-footer {
  border-top: 1px solid #2a313a;
  background: rgba(255, 255, 255, 0.015);
}

.dropdown-list {
  padding-top: 0;
  padding-bottom: 0;
}

.dropdown-link {
  border-radius: 12px;
  margin: 4px 10px;
  min-height: 62px;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.dropdown-link:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateX(2px);
}

.dropdown-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 192, 55, 0.1);
  border: 1px solid rgba(242, 192, 55, 0.18);
}

.logout-icon-box {
  background: rgba(248, 81, 73, 0.08);
  border-color: rgba(248, 81, 73, 0.22);
}

.dropdown-title {
  color: #f0f6fc;
  font-weight: 600;
  font-size: 14px;
}

.dropdown-caption {
  color: #8b949e !important;
  font-size: 12px;
}
</style>
