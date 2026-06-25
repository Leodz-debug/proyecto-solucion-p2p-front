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
            flat
            no-caps
            label="Dashboard Administrativo"
            class="text-grey-4"
            @click="$router.push('/admin')"
          />
        </div>

        <div class="row items-center q-gutter-md">
          <q-btn dense flat round icon="notifications" color="grey-4">
            <q-badge color="red" floating dotted />
          </q-btn>

          <!-- Avatar con menú desplegable (logout) -->
          <div class="row items-center q-gutter-sm cursor-pointer">
            <q-avatar size="32px" color="amber" text-color="black" class="text-weight-bold">
              {{ nombreAvatar }}
            </q-avatar>
            <span class="text-white text-weight-medium gt-xs">{{ nombreCompleto }}</span>
            <q-icon name="expand_more" color="grey-4" class="gt-xs" />

            <q-menu dark>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="cerrarSesion">
                  <q-item-section avatar><q-icon name="logout" color="red-4" /></q-item-section>
                  <q-item-section class="text-red-4">Cerrar sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 2. MENÚ LATERAL IZQUIERDO -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered dark :width="260" class="bg-sidebar">
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

      <!-- Estado Verificado abajo -->
      <div class="absolute-bottom q-pa-md">
        <div class="verified-card q-pa-sm row items-center q-gutter-sm">
          <q-icon name="verified" color="green" size="24px" />
          <div>
            <div class="text-green text-weight-bold text-caption">{{ estadoVerif }}</div>
            <div class="text-grey-5 text-caption" style="font-size: 11px">
              Cuenta {{ estadoVerif.toLowerCase() }}
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

const nombreCompleto = computed(() => auth.usuario?.nombreCompleto || 'Usuario')
const nombreAvatar = computed(() => nombreCompleto.value.charAt(0).toUpperCase())
const estadoVerif = computed(() => auth.usuario?.estadoVerificacion || 'Pendiente')

const menuItems = [
  { title: 'Inicio', icon: 'home', route: '/seleccion' },
  { title: 'Marketplace', icon: 'language', route: '/marketplace' },
  { title: 'Publicar oferta', icon: 'attach_money', route: '/publicar' },
  { title: 'Operación activa', icon: 'schedule', route: '/operacion' },
  { title: 'Verificación', icon: 'verified_user', route: '/verificacion' },
  { title: 'Comprobante', icon: 'description', route: '/comprobante' },
  { title: 'Calificación', icon: 'star', route: '/calificacion' },
  { title: 'Disputa', icon: 'gavel', route: '/disputa' },
  { title: 'Chat', icon: 'chat', route: '/chat' },
]

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
</style>
