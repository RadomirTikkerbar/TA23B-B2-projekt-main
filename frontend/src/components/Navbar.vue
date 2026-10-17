<template>
  <v-app-bar color="dark" dark>
    <template #prepend>
      <router-link class="navbar-brand" to="/">
        <span class="title">🎬 Slopfest Cinema</span>
      </router-link>
    </template>

    <v-spacer />

    <nav :aria-label="t('cinema.sections')" class="section-nav">
      <v-btn
        v-for="tab in sectionTabs"
        :key="tab.section"
        :aria-current="route.path === `/${tab.section}` ? 'page' : undefined"
        color="#e50914"
        :to="`/${tab.section}`"
        :variant="route.path === `/${tab.section}` ? 'flat' : 'text'"
      >
        {{ t(tab.label) }}
      </v-btn>
    </nav>

    <select
      v-model="locale"
      :aria-label="t('nav.language')"
      class="language-selector"
      @change="setLocale($event.target.value)"
    >
      <option v-for="language in languages" :key="language.code" :value="language.code">
        {{ language.label }}
      </option>
    </select>

    <div v-if="!isLoggedIn" class="auth-buttons">
      <v-btn color="primary" @click="openRegister">{{ t('nav.register') }}</v-btn>
      <v-btn color="success" @click="openLogin">{{ t('nav.login') }}</v-btn>
    </div>

    <div v-else class="user-menu">
      <span class="user-email">{{ currentUser?.email }}</span>
      <v-btn color="error" @click="logout">{{ t('nav.logout') }}</v-btn>
    </div>
  </v-app-bar>

  <RegisterModal v-model="showRegister" @close="showRegister = false" @success="handleRegisterSuccess" />
  <LoginModal v-model="showLogin" @close="showLogin = false" @success="handleLoginSuccess" />
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from '@/i18n'
  import LoginModal from './LoginModal.vue'
  import RegisterModal from './RegisterModal.vue'

  const { locale, languages, setLocale, t } = useI18n()
  const route = useRoute()
  const sectionTabs = [
    { section: 'sessions', label: 'cinema.sessions' },
    { section: 'events', label: 'cinema.events' },
    { section: 'locations', label: 'cinema.locations' },
  ]
  const showRegister = ref(false)
  const showLogin = ref(false)
  const currentUser = ref(null)

  const isLoggedIn = computed(() => !!currentUser.value)

  function openRegister () {
    showRegister.value = true
  }

  function openLogin () {
    showLogin.value = true
  }

  function handleRegisterSuccess () {
    // После регистрации можно открыть логин
    showRegister.value = false
    showLogin.value = true
  }

  function handleLoginSuccess (data) {
    currentUser.value = data.user
    showLogin.value = false
  // Можете добавить редирект или другие действия
  }

  function logout () {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    currentUser.value = null
  }

  // При загрузке компонента проверяем, авторизован ли пользователь
  onMounted(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        currentUser.value = JSON.parse(user)
      } catch (error) {
        console.error(error)
      }
    }
  })
</script>

<style scoped>
.navbar-brand {
  text-decoration: none;
  color: white;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #e50914;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.section-nav {
  display: flex;
  flex: 0 1 auto;
  gap: 2px;
  overflow-x: auto;
}

.language-selector {
  margin: 0 12px;
  padding: 8px;
  border-radius: 4px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-email {
  color: white;
  margin-right: 10px;
}

@media (max-width: 900px) {
  .section-nav :deep(.v-btn) {
    padding-inline: 8px;
    min-width: 0;
  }
}
</style>
