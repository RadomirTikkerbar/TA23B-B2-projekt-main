<template>
  <div class="main-page">
    <h1>{{ t('home.title') }}</h1>
    <router-link to="/admin/add-film">
      <button class="btn admin-btn">{{ t('home.admin') }}</button>
    </router-link>

    <p v-if="loading">{{ t('home.loading') }}</p>
    <p v-else-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p v-else-if="movies.length === 0">{{ t('home.empty') }}</p>

    <div class="movie-list">
      <div v-for="movie in movies" :key="movie.id" class="movie-item">

        <img alt="" class="poster" :src="movie.posterSmall">

        <div class="info">
          <h2>{{ movie.title }}</h2>
          <p><strong>{{ t('movie.genre') }}:</strong> {{ movie?.genre }}</p>
          <p><strong>{{ t('movie.duration') }}:</strong> {{ movie.durationMin }}</p>
          <p>{{ movie?.description?.substring(0, 120) }}...</p>

          <router-link :to="`/movie/${movie.id}`">
            <button class="btn">{{ t('movie.more') }}</button>
          </router-link>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { API_URL } from '@/main'
  import { useI18n } from '@/i18n'

  const { t } = useI18n()
  const movies = ref([])
  const loading = ref(true)
  const errorMessage = ref('')

  onMounted(async () => {
    try {
      const response = await fetch(`${API_URL}/movies`)
      if (!response.ok) {
        throw new Error(`Could not load movies (HTTP ${response.status})`)
      }
      movies.value = await response.json()
    } catch (error) {
      console.error('Failed to load movies from the database', error)
      errorMessage.value = t('home.loadError')
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>

.main-page {
  min-height: 100vh;
  background: #111;
  color: white;
  padding: 20px;
}

.movie-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.movie-item {
  display: flex;
  background: #1c1c1c;
  border-radius: 8px;
  overflow: hidden;
  padding: 10px;
  gap: 20px;
}

.poster {
  width: 200px;
  object-fit: cover;
  border-radius: 6px;
}

.info {
  flex: 1;
}

.btn {
  margin-top: 10px;
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  background: #e50914;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.btn:hover {
  background: #f6121d;
}

.admin-btn {
  margin-bottom: 20px;
  background: #007bff;
}

.admin-btn:hover {
  background: #0056b3;
}
</style>
