<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-custom">
    <q-header elevated class="bg-header q-px-md">
      <q-toolbar class="row justify-between items-center q-py-xs">
        <!-- Logo Izquierda -->
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

        <div class="row items-center q-gutter-md">
          <!-- Botón de Notificaciones-->
          <q-btn dense flat round icon="notifications" color="grey-4">
            <q-badge
              v-if="!auth.esAdmin && auth.usuario?.estadoVerificacion === 'Pendiente'"
              color="red"
              floating
              rounded
            />

            <q-menu anchor="bottom right" self="top right" style="width: 320px">
              <q-list separator>
                <q-item v-if="!auth.esAdmin && auth.usuario?.estadoVerificacion === 'Pendiente'">
                  <q-item-section avatar>
                    <q-icon color="orange" name="warning" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold"> Verificación pendiente </q-item-label>

                    <q-item-label caption>
                      Tu identidad aún no ha sido aprobada. Algunas funciones estarán deshabilitadas
                      hasta que un administrador revise tu solicitud.
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="auth.usuario?.estadoVerificacion === 'Verificado'">
                  <q-item-section avatar>
                    <q-icon color="green" name="verified" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label> Tu cuenta ya fue verificada. </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-if="
                    auth.esAdmin ||
                    (auth.usuario?.estadoVerificacion !== 'Pendiente' &&
                      auth.usuario?.estadoVerificacion !== 'Verificado')
                  "
                >
                  <q-item-section> No tienes notificaciones. </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Avatar con menú desplegable (logout) -->
          <!-- Avatar con menú desplegable -->
          <q-btn flat no-caps class="user-menu-btn q-px-sm">
            <q-avatar color="amber" text-color="black" size="40px" class="q-mr-sm">
              {{ inicialUsuario }}
            </q-avatar>

            <div class="text-white text-weight-bold gt-xs">
              {{ nombreUsuario }}
            </div>

            <q-icon name="keyboard_arrow_down" color="white" size="20px" class="q-ml-xs" />

            <q-menu anchor="bottom right" self="top right" class="user-dropdown" :offset="[0, 8]">
              <q-list style="min-width: 230px">
                <q-item class="user-dropdown-header">
                  <q-item-section avatar>
                    <q-avatar color="amber" text-color="black">
                      {{ inicialUsuario }}
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-white text-weight-bold">
                      {{ nombreUsuario }}
                    </q-item-label>

                    <q-item-label caption class="text-grey-5">
                      {{ auth.esAdmin ? 'Administrador' : estadoUsuario }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator dark />

                <q-item clickable v-close-popup @click="$router.push('/mis-ofertas')">
                  <q-item-section avatar>
                    <q-icon name="storefront" color="amber" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>Mis ofertas</q-item-label>
                    <q-item-label caption>Historial de anuncios publicados</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="$router.push('/metodos-pago')">
                  <q-item-section avatar>
                    <q-icon name="payments" color="amber" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>Métodos de pago</q-item-label>
                    <q-item-label caption>Datos guardados para operar</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator dark />

                <q-item clickable v-close-popup @click="cerrarSesion">
                  <q-item-section avatar>
                    <q-icon name="logout" color="red-4" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-red-4">Cerrar sesión</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 2. MENÚ LATERAL IZQUIERDO -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-dark">
      <q-list class="q-px-sm q-pt-md">
        <q-item
          clickable
          v-for="(item, index) in menuItems"
          :key="index"
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

      <!-- Estado de cuenta abajo -->
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

    <!-- 3. CONTENEDOR PRINCIPAL -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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

const menuItems = computed(() =>
  [
    { title: 'Inicio', icon: 'home', route: '/seleccion' },
    { title: 'Marketplace', icon: 'language', route: '/marketplace' },
    { title: 'Publicar oferta', icon: 'attach_money', route: '/publicar' },
    { title: 'Operación activa', icon: 'schedule', route: '/operacion' },
    { title: 'Verificación', icon: 'verified_user', route: '/verificacion' },
    { title: 'Comprobante', icon: 'description', route: '/comprobante' },
    { title: 'Calificación', icon: 'star', route: '/calificacion' },
    { title: 'Disputa', icon: 'gavel', route: '/disputa' },
    { title: 'Chat', icon: 'chat', route: '/chat' },
  ].filter((item) => !(auth.esAdmin && item.route === '/verificacion')),
)

function cerrarSesion() {
  auth.logout()
  router.push('/login')
}
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
}

.user-menu-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.user-dropdown {
  background: #161b22;
  color: white;
  border: 1px solid #30363d;
  border-radius: 12px;
  overflow: hidden;
}

.user-dropdown-header {
  background: #0d1117;
  padding-top: 12px;
  padding-bottom: 12px;
}
</style>
