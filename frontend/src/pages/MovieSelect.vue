<template>
  <div class="movie-page">

    <div
      v-if="movieId == 1"
      class="banner"
      :style="{ backgroundImage: `url('https://images.markus.live/mcswebsites.blob.core.windows.net/1013/Event_9644/landscape_billboard_wide/RunningMan_3840x750.png?width=3360&height=640&format=jpg&quality=90')` }"
    >
      <h1>{{ movie.title }}</h1>
    </div>

    <div
      v-else
      class="banner"
      :style="{ backgroundImage: `url(${movie.banner || movie.posterSmall})` }"
    >
      <h1>{{ movie.title }}</h1>
    </div>
    <div class="content">

      <div class="details">
        <p v-if="loading">{{ t('home.loading') }}</p>
        <p v-else-if="errorMessage" role="alert">{{ errorMessage }}</p>
        <template v-else>
        <h3>{{ t('booking.showtime') }}</h3>

        <div class="time-list">
          <button
            v-for="t in times"
            :key="t"
            class="time-btn"
            :class="{ active: selectedTime === t }"
            @click="selectedTime = t"
          >
            {{ t }}
          </button>
        </div>

        <h3 style="margin-top: 25px;">{{ t('booking.seats') }}</h3>

        <div class="seats">
          <div
            v-for="seat in seats"
            :key="seat.id"
            class="seat"
            :class="{ selected: selectedSeats.includes(seat.id), taken: seat.taken }"
            @click="toggleSeat(seat)"
          >
            {{ seat.label }}
          </div>
        </div>

        <div class="buttons" style="margin-top: 30px;">
          <button class="btn booking-btn" @click="confirmBooking">
            {{ t('booking.confirm') }}
          </button>

          <router-link to="/">
            <button class="btn back-btn">{{ t('booking.back') }}</button>
          </router-link>
        </div>
        </template>

      </div>

    </div>

  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { API_URL } from '@/main'
  import { useI18n } from '@/i18n'

  const route = useRoute()
  const router = useRouter()
  const movieId = Number(route.params.id)
  const { t } = useI18n()

  const movie = ref({})
  const loading = ref(true)
  const errorMessage = ref('')
  const times = ref(['12:30', '14:10', '16:00', '18:45', '21:15'])
  const selectedTime = ref(null)
  const seats = ref([])
  const selectedSeats = ref([])

  onMounted(async () => {
    try {
      const response = await fetch(`${API_URL}/movies/${movieId}`)
      if (response.status === 404) {
        errorMessage.value = t('booking.notFound')
        return
      }
      if (!response.ok) throw new Error(`Could not load movie (HTTP ${response.status})`)
      movie.value = await response.json()

      seats.value = Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        label: i + 1,
        taken: Math.random() < 0.15,
      }))
    } catch (error) {
      console.error('Failed to load movie for booking', error)
      errorMessage.value = t('movie.loadError')
    } finally {
      loading.value = false
    }
  })

  function toggleSeat (seat) {
    if (seat.taken) return

    const index = selectedSeats.value.indexOf(seat.id)
    if (index === -1) {
      selectedSeats.value.push(seat.id)
    } else {
      selectedSeats.value.splice(index, 1)
    }
  }

  function confirmBooking () {
    if (!selectedTime.value) {
      window.alert(t('booking.selectTime'))
      return
    }

    if (selectedSeats.value.length === 0) {
      window.alert(t('booking.selectSeat'))
      return
    }

    router.push({
      name: 'Payment',
      query: {
        movieId: movie.value.id,
        title: movie.value.title,
        time: selectedTime.value,
        seats: selectedSeats.value.join(','),
      },
    })
  }
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
  height: 300px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 30px 40px;
  font-size: 2.3rem;
  font-weight: bold;
  text-shadow: 2px 2px 10px black;
}

.content {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.details {
  width: 600px;
  background: #1c1c1c;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,0,0,0.7);
}

.time-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.time-btn {
  padding: 10px 18px;
  background: #333;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s;
}

.time-btn:hover {
  background: #444;
}

.time-btn.active {
  background: #ff4500;
}

.seats {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
}

.seat {
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.seat.selected {
  background: #ff4500;
}

.seat.taken {
  background: #555;
  cursor: not-allowed;
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
