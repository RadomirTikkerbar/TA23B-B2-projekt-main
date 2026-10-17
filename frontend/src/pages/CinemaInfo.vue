<template>
  <main class="cinema-page">
    <h1>{{ t(sectionTitle) }}</h1>

    <nav :aria-label="t('cinema.sections')" class="section-tabs">
      <router-link
        v-for="tab in sectionTabs"
        :key="tab.section"
        :aria-current="section === tab.section ? 'page' : undefined"
        class="section-tab"
        :class="{ active: section === tab.section }"
        :to="`/${tab.section}`"
      >
        {{ t(tab.label) }}
      </router-link>
    </nav>

    <h2 class="cinema-heading">{{ t('cinema.choose') }}</h2>
    <div :aria-label="t('cinema.choose')" class="cinema-picker" role="group">
      <button
        v-for="cinema in cinemas"
        :key="cinema.id"
        :aria-pressed="selectedCinemaId === cinema.id"
        class="cinema-choice"
        :class="{ active: selectedCinemaId === cinema.id }"
        @click="selectedCinemaId = cinema.id"
      >
        {{ t(cinema.name) }}
      </button>
    </div>

    <section v-if="section === 'sessions'" class="content-panel">
      <h2>{{ t(selectedCinema.name) }} · {{ t('cinema.sessions') }}</h2>
      <p v-if="loading" role="status">{{ t('cinema.loading') }}</p>
      <p v-else-if="errorMessage" role="alert">{{ errorMessage }}</p>
      <p v-else-if="movies.length === 0">{{ t('cinema.noMovies') }}</p>
      <div v-else class="movie-list">
        <article v-for="movie in movies" :key="movie.id" class="movie-card">
          <img v-if="movie.posterSmall" :alt="movie.title" class="poster" :src="movie.posterSmall">
          <div class="movie-details">
            <h3>{{ movie.title }}</h3>
            <p>{{ t('movie.duration') }}: {{ movie.durationMin }} min</p>
            <p class="showtimes-label">{{ t('cinema.sampleTimes') }}</p>
            <div class="showtimes">
              <span v-for="time in selectedCinema.times" :key="time" class="showtime">{{ time }}</span>
            </div>
            <router-link class="book-link" :to="`/movie-select/${movie.id}`">
              {{ t('cinema.book') }}
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <section v-else-if="section === 'events'" class="content-panel">
      <h2>{{ t(selectedCinema.name) }} · {{ t('cinema.events') }}</h2>
      <article v-for="event in selectedCinema.events" :key="event.title" class="event-card">
        <p class="event-date">{{ t(event.date) }}</p>
        <h3>{{ t(event.title) }}</h3>
        <p>{{ t(event.description) }}</p>
      </article>
    </section>

    <section v-else class="content-panel">
      <h2>{{ t(selectedCinema.name) }} · {{ t('cinema.locations') }}</h2>
      <address class="location-card">
        <p><strong>{{ t('cinema.address') }}:</strong> {{ t(selectedCinema.address) }}</p>
        <p><strong>{{ t('cinema.hours') }}:</strong> {{ t(selectedCinema.hours) }}</p>
        <p><strong>{{ t('cinema.phone') }}:</strong> {{ selectedCinema.phone }}</p>
      </address>
    </section>

    <p class="sample-note">{{ t('cinema.sampleNote') }}</p>
  </main>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useI18n } from '@/i18n'
  import { API_URL } from '@/main'

  const props = defineProps({
    section: {
      type: String,
      required: true,
      validator: value => ['sessions', 'events', 'locations'].includes(value),
    },
  })

  const { t } = useI18n()
  const sectionTabs = [
    { section: 'sessions', label: 'cinema.sessions' },
    { section: 'events', label: 'cinema.events' },
    { section: 'locations', label: 'cinema.locations' },
  ]
  const cinemas = [
    {
      id: 'tallinn',
      name: 'cinema.tallinn',
      address: 'cinema.tallinnAddress',
      hours: 'cinema.tallinnHours',
      phone: '+372 5550 0101',
      times: ['12:30', '15:00', '18:15', '21:00'],
      events: [
        { date: 'event.dateFriday', title: 'event.tallinnTitle', description: 'event.tallinnDescription' },
      ],
    },
    {
      id: 'tartu',
      name: 'cinema.tartu',
      address: 'cinema.tartuAddress',
      hours: 'cinema.tartuHours',
      phone: '+372 5550 0102',
      times: ['13:00', '16:00', '19:00', '21:30'],
      events: [
        { date: 'event.dateSaturday', title: 'event.tartuTitle', description: 'event.tartuDescription' },
      ],
    },
    {
      id: 'parnu',
      name: 'cinema.parnu',
      address: 'cinema.parnuAddress',
      hours: 'cinema.parnuHours',
      phone: '+372 5550 0103',
      times: ['12:00', '14:45', '17:30', '20:15'],
      events: [
        { date: 'event.dateSunday', title: 'event.parnuTitle', description: 'event.parnuDescription' },
      ],
    },
  ]
  const selectedCinemaId = ref(cinemas[0].id)
  const selectedCinema = computed(() => cinemas.find(cinema => cinema.id === selectedCinemaId.value))
  const sectionTitle = computed(() => ({
    sessions: 'cinema.sessionsTitle',
    events: 'cinema.eventsTitle',
    locations: 'cinema.locationsTitle',
  }[props.section]))
  const movies = ref([])
  const loading = ref(false)
  const errorMessage = ref('')
  const sessionsLoaded = ref(false)

  watch(() => props.section, async section => {
    if (section !== 'sessions' || sessionsLoaded.value) return

    loading.value = true
    errorMessage.value = ''
    try {
      const response = await fetch(`${API_URL}/movies`)
      if (!response.ok) {
        throw new Error(`Could not load movies (HTTP ${response.status})`)
      }
      movies.value = await response.json()
      sessionsLoaded.value = true
    } catch (error) {
      console.error('Failed to load session movies', error)
      errorMessage.value = t('cinema.loadError')
    } finally {
      loading.value = false
    }
  }, { immediate: true })
</script>

<style scoped>
.cinema-page {
  min-height: 100vh;
  padding: 28px;
  background: #111;
  color: white;
}

.section-tabs,
.cinema-picker,
.showtimes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.section-tabs {
  margin: 20px 0 30px;
  border-bottom: 1px solid #444;
}

.section-tab {
  padding: 12px 18px;
  color: #ddd;
  text-decoration: none;
  border-bottom: 3px solid transparent;
}

.section-tab.active {
  color: white;
  border-bottom-color: #e50914;
}

.cinema-heading {
  font-size: 1.1rem;
}

.cinema-picker {
  margin: 14px 0 28px;
}

.cinema-choice,
.showtime {
  padding: 10px 16px;
  border: 1px solid #555;
  border-radius: 6px;
  background: #242424;
  color: white;
}

.cinema-choice {
  cursor: pointer;
}

.cinema-choice.active {
  border-color: #e50914;
  background: #471217;
}

.content-panel {
  max-width: 1000px;
  padding: 24px;
  border-radius: 10px;
  background: #1c1c1c;
}

.movie-list {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.movie-card {
  display: flex;
  gap: 18px;
  padding: 14px;
  border-radius: 8px;
  background: #292929;
}

.poster {
  width: 100px;
  object-fit: cover;
  border-radius: 5px;
}

.movie-details {
  flex: 1;
}

.showtimes-label {
  margin-bottom: 8px;
}

.showtimes {
  margin-bottom: 14px;
}

.showtime {
  padding: 6px 10px;
}

.book-link {
  color: #ff6971;
}

.event-card,
.location-card {
  display: block;
  margin-top: 18px;
  padding: 18px;
  border-radius: 8px;
  background: #292929;
  font-style: normal;
}

.event-date {
  color: #ff6971;
}

.sample-note {
  max-width: 1000px;
  margin-top: 18px;
  color: #aaa;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .cinema-page {
    padding: 18px;
  }

  .movie-card {
    align-items: flex-start;
  }

  .poster {
    width: 72px;
  }
}
</style>
