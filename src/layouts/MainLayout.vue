<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-custom">
    <q-header elevated class="bg-header q-px-md">
      <q-toolbar class="row justify-between items-center q-py-xs">
        
        <div class="row items-center q-gutter-xs cursor-pointer" @click="$router.push('/')">
          <q-icon name="shield" size="28px" color="amber" />
          <span class="text-h6 text-weight-bold text-white">
            CambioSeguro <span class="text-amber">P2P</span>
          </span>
        </div>

        <div class="row items-center q-gutter-md gt-xs">
          <q-btn flat no-caps label="Inicio" class="text-weight-medium rounded-borders" :class="{ 'bg-amber text-black': $route.path === '/seleccion' }" @click="$router.push('/seleccion')" />
          <q-btn flat no-caps label="Marketplace" class="text-grey-4" @click="$router.push('/')" />
          <q-btn flat no-caps label="Publicar oferta" class="text-grey-4" @click="$router.push('/publicar')" />
        </div>

        <div class="row items-center q-gutter-md">
          <q-btn dense flat round icon="notifications" color="grey-4">
            <q-badge color="red" floating dotted />
          </q-btn>
          
          <div class="row items-center q-gutter-sm cursor-pointer">
            <q-avatar size="32px" color="amber" text-color="black" class="text-weight-bold">
              {{ nombreAvatar }}
            </q-avatar>
            <span class="text-white text-weight-medium gt-xs">{{ nombreCompleto }}</span>
            <q-icon name="expand_more" color="grey-4" class="gt-xs" />
          </div>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      dark
      :width="260"
      class="bg-sidebar"
    >
      <q-list class="q-px-sm q-pt-md">
        <q-item clickable v-for="(item, index) in menuItems" :key="index" 
                :active="$route.path === item.route"
                active-class="menu-active-item"
                class="menu-item q-mb-sm rounded-borders"
                @click="$router.push(item.route)">
          <q-item-section avatar min-width="40px">
            <q-icon :name="item.icon" :color="$route.path === item.route ? 'amber' : 'grey-4'" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium" :class="$route.path === item.route ? 'text-amber' : 'text-grey-4'">
              {{ item.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="absolute-bottom q-pa-md">
        <div class="verified-card q-pa-sm row items-center q-gutter-sm">
          <q-icon name="verified" color="green" size="24px" />
          <div>
            <div class="text-green text-weight-bold text-caption">Verificado</div>
            <div class="text-grey-5 text-caption" style="font-size: 11px;">Cuenta verificada y activa</div>
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const leftDrawerOpen = ref(true)

const nombreCompleto = computed(() => auth.usuario?.nombreCompleto || 'Juan Pérez')
const nombreAvatar = computed(() => nombreCompleto.value.charAt(0).toUpperCase())

const menuItems = [
  { title: 'Inicio', icon: 'home', route: '/seleccion' },
  { title: 'Marketplace', icon: 'language', route: '/' },
  { title: 'Publicar oferta', icon: 'attach_money', route: '/publicar' },
  { title: 'Operación activa', icon: 'schedule', route: '/operacion' },
  { title: 'Chat', icon: 'chat_bubble_outline', route: '/chat' },
  { title: 'Disputas', icon: 'gavel', route: '/disputas' },
  { title: 'Dashboard Admin', icon: 'apps', route: '/admin' }
]
</script>

<style scoped>
.bg-dark-custom { background: #0d1117; }
.bg-header { background: #161b22; border-bottom: 1px solid #30363d; }
.bg-sidebar { background: #161b22; border-right: 1px solid #30363d; }

.menu-item { color: #c9d1d9; transition: all 0.2s ease; }
.menu-item:hover { background: rgba(242, 192, 55, 0.05); }
.menu-active-item { background: rgba(242, 192, 55, 0.1) !important; border-left: 3px solid #f2c037; }

.verified-card { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; }
</style>