<template>
  <q-page class="seleccion-page q-pa-lg">
    <div class="text-h5 text-weight-bold text-white">
      Bienvenido, {{ nombre }}
    </div>
    <div class="text-grey-5 q-mb-lg">¿Qué deseas hacer hoy?</div>

    <div class="row q-col-gutter-lg">
      <!-- COMPRAR -->
      <div class="col-12 col-md-6">
        <q-card class="opcion-card q-pa-lg" clickable @click="irAComprar">
          <q-icon name="trending_up" size="40px" color="green" />
          <div class="text-h6 text-weight-bold text-white q-mt-md">Comprar divisas</div>
          <div class="text-grey-5 q-mt-sm">
            Adquiere divisas al mejor tipo de cambio del mercado P2P
          </div>
          <q-btn
            flat
            color="amber"
            label="Ver ofertas disponibles  ›"
            class="q-mt-md q-px-none"
            no-caps
          />
        </q-card>
      </div>

      <!-- VENDER -->
      <div class="col-12 col-md-6">
        <q-card class="opcion-card q-pa-lg" clickable @click="irAVender">
          <q-icon name="attach_money" size="40px" color="amber" />
          <div class="text-h6 text-weight-bold text-white q-mt-md">Vender divisas</div>
          <div class="text-grey-5 q-mt-sm">
            Publica tu oferta y vende tus divisas al mejor precio
          </div>
          <q-btn
            flat
            color="amber"
            label="Publicar oferta  ›"
            class="q-mt-md q-px-none"
            no-caps
          />
        </q-card>
      </div>
    </div>

    <!-- Badges de confianza -->
    <div class="row q-col-gutter-md q-mt-lg">
      <div class="col-12 col-md-4">
        <q-card class="info-card q-pa-md row items-center q-gutter-sm">
          <q-icon name="shield" color="amber" size="28px" />
          <div>
            <div class="text-white text-weight-bold">100% Seguro</div>
            <div class="text-grey-5 text-caption">Escrow automático en cada operación</div>
          </div>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="info-card q-pa-md row items-center q-gutter-sm">
          <q-icon name="bolt" color="amber" size="28px" />
          <div>
            <div class="text-white text-weight-bold">Transacciones rápidas</div>
            <div class="text-grey-5 text-caption">Promedio de 5 minutos por operación</div>
          </div>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="info-card q-pa-md row items-center q-gutter-sm">
          <q-icon name="verified" color="amber" size="28px" />
          <div>
            <div class="text-white text-weight-bold">Usuarios verificados</div>
            <div class="text-grey-5 text-caption">KYC obligatorio para todos</div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const nombre = computed(() => auth.usuario?.nombreCompleto?.split(' ')[0] || 'Usuario')

function irAComprar() {
  router.push('/marketplace')
}
function irAVender() {
  router.push('/publicar')
}
</script>

<style scoped>
.seleccion-page { background: #0d1117; min-height: 100vh; }
.opcion-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  transition: border 0.2s;
}
.opcion-card:hover { border: 1px solid #f2c037; }
.info-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; }
</style>
