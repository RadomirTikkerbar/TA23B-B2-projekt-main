<template>
  <div v-if="loading" class="movie-page">{{ t('home.loading') }}</div>
  <div v-else-if="errorMessage" class="movie-page" role="alert">{{ errorMessage }}</div>
  <div v-else-if="movie" class="movie-page">

    <div
      class="banner"
      :style="{ backgroundImage: `url(${movie.banner || movie.posterSmall})` }"
    >
      <h1>{{ movie.title }}</h1>
    </div>

    <div class="content">

      <div class="video">
        <h2>{{ t('movie.trailer') }}</h2>
        <div class="video-wrapper">
          <template v-if="trailerEmbedUrl">
            <iframe
              :src="trailerEmbedUrl"
              :title="`${movie.title} trailer`"
              referrerpolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
            <a
              class="trailer-link"
              :href="movie.trailer"
              target="_blank"
              rel="noopener noreferrer"
            >{{ t('movie.watchYoutube') }}</a>
          </template>
          <video v-else-if="isDirectVideo" controls>
            <source :src="movie.trailer">
            {{ t('movie.videoUnsupported') }}
          </video>
          <a
            v-else-if="movie.trailer"
            class="trailer-link"
            :href="movie.trailer"
            target="_blank"
            rel="noopener noreferrer"
          >{{ t('movie.openTrailer') }}</a>
          <p v-else>{{ t('movie.noTrailer') }}</p>
        </div>
      </div>

      <div class="details">
        <h3>{{ t('movie.description') }}</h3>
        <p><strong>{{ t('movie.genre') }}:</strong> {{ movie?.genre }}</p>
        <p><strong>{{ t('movie.duration') }}:</strong> {{ movie?.length || movie?.durationMin }}</p>
        <p><strong>{{ t('movie.language') }}:</strong> {{ movie?.language }}</p>
        <p><strong>{{ t('movie.description') }}:</strong></p>
        <p>{{ movie.description }}</p>

        <div class="buttons">
          <router-link :to="`/movie-select/${movie.id}`">
            <button class="btn booking-btn">{{ t('movie.book') }}</button>
          </router-link>
          <router-link to="/">
            <button class="btn back-btn">{{ t('movie.back') }}</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { API_URL } from '@/main'
  import { useI18n } from '@/i18n'

  const route = useRoute()
  const { t } = useI18n()
  const movie = ref(null)
  const loading = ref(true)
  const errorMessage = ref('')
  const trailerEmbedUrl = computed(() => {
    if (!movie.value.trailer) return ''

    let url
    try {
      url = new URL(movie.value.trailer)
    } catch {
      return ''
    }

    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    let videoId = ''

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] || ''
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v') || ''
      } else {
        videoId = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] || ''
      }
    }

    return /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : ''
  })
  const isDirectVideo = computed(() =>
    /\.(?:mp4|webm|ogg|m3u8)(?:$|[?#])/i.test(movie.value.trailer || '')
  )

  watch(() => route.params.id, async (id) => {
    loading.value = true
    errorMessage.value = ''
    movie.value = null
    try {
      const response = await fetch(`${API_URL}/movies/${encodeURIComponent(id)}`)
      if (response.status === 404) {
        errorMessage.value = t('movie.notFound')
        return
      }
      if (!response.ok) {
        throw new Error(`Could not load movie (HTTP ${response.status})`)
      }
      movie.value = await response.json()
    } catch (error) {
      console.error('Failed to load movie from the database', error)
      errorMessage.value = t('movie.loadError')
    } finally {
      loading.value = false
    }
  }, { immediate: true })
</script>

<style scoped>
.movie-page {
  min-height: 100vh;
  background: #111;
  color: white;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', sans-serif;
}

.banner {
  height: 400px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 30px 40px;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 10px black;
}

.content {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  padding: 40px;
  flex: 1;
}

.video, .details {
  flex: 1 1 500px;
}

.video-wrapper {
  width: 900px;
  max-width: 100%;
  height: 506px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 0 40px rgba(0,0,0,0.7);
  margin-top: 10px;
}

.video-wrapper iframe,
.video-wrapper video {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
}

.trailer-link {
  color: white;
  display: inline-block;
  padding: 20px;
}

.details {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #1c1c1c;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,0,0,0.7);
}

.details h3 {
  margin-bottom: 15px;
}

.buttons {
  margin-top: 30px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 6px;
  background: #e50914;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.3s, transform 0.2s;
}

.btn:hover {
  background: #f6121d;
  transform: scale(1.05);
}

.booking-btn {
  background: #ff4500;
}

.booking-btn:hover {
  background: #ff5722;
}
</style>
