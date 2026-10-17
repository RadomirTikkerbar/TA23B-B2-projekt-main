<template>
  <v-app>
    <Navbar />
    <Suspense>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
      <template #fallback>
        <main class="page-loading">{{ t('home.loading') }}</main>
      </template>
    </Suspense>
  </v-app>
</template>

<script setup>
import { Suspense } from 'vue';
import Navbar from '@/components/Navbar.vue';
import { useI18n } from '@/i18n';

const { t } = useI18n();
</script>

<style>
.page-loading {
  min-height: 100vh;
  padding: 24px;
  background: #111;
  color: white;
}
</style>
