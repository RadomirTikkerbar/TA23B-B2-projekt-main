<template>
  <div class="payment-page">
    <div class="payment-container">
      <h1>{{ t('payment.title') }}</h1>

      <div v-if="movie" class="content">
        <div class="booking-info">
          <p><strong>{{ t('payment.movie') }}:</strong> {{ movie.title }}</p>
          <p><strong>{{ t('payment.time') }}:</strong> {{ time }}</p>
          <p><strong>{{ t('payment.seats') }}:</strong> {{ seats.join(', ') }}</p>
        </div>

        <h2>{{ t('payment.details') }}</h2>
        <form class="payment-form" @submit.prevent="payTicket">
          <div class="form-group">
            <label for="cardName">{{ t('payment.cardName') }}</label>
            <input
              id="cardName"
              v-model="cardName"
              :placeholder="t('payment.cardNamePlaceholder')"
              required
              type="text"
            >
          </div>

          <div class="form-group">
            <label for="cardNumber">{{ t('payment.cardNumber') }}</label>
            <input
              id="cardNumber"
              v-model="cardNumber"
              maxlength="16"
              placeholder="1234 5678 9012 3456"
              required
              type="text"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="expiry">{{ t('payment.expiry') }}</label>
              <input id="expiry" v-model="expiry" placeholder="01/25" required type="text">
            </div>
            <div class="form-group">
              <label for="cvv">{{ t('payment.cvv') }}</label>
              <input id="cvv" v-model="cvv" class="short" placeholder="123" required type="text">
            </div>
          </div>
          <div class="form-group">
            <label for="email">{{ t('payment.email') }}</label>
            <input
              id="email"
              v-model="email"
              placeholder="example@mail.com"
              required
              type="email"
            >
          </div>

          <button class="btn" type="submit">{{ t('payment.pay') }}</button>
        </form>
      </div>

      <div v-else>
        <p>{{ t('payment.bookingNotFound') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from '@/i18n'

  const { t } = useI18n()
  const route = useRoute()
  const movie = ref(null)
  const time = ref('')
  const seats = ref([])

  const cardName = ref('')
  const cardNumber = ref('')
  const expiry = ref('')
  const cvv = ref('')
  const email = ref('')

  onMounted(() => {
    const query = route.query
    if (query.movieId && query.title && query.time && query.seats) {
      movie.value = { id: query.movieId, title: query.title }
      time.value = query.time
      seats.value = query.seats.split(',')
    }
  })

  function payTicket () {
    if (!cardName.value || !cardNumber.value || !expiry.value || !cvv.value || !email.value) {
      alert(t('payment.fillAll'))
      return
    }

    alert(t('payment.success', {
      title: movie.value.title,
      seats: seats.value.join(', '),
      email: email.value,
    }))

    cardName.value = ''
    cardNumber.value = ''
    expiry.value = ''
    cvv.value = ''
    email.value = ''
  }
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #111;
  font-family: 'Segoe UI', sans-serif;
  color: white;
}

.payment-container {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background: #1c1c1c;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0,0,0,0.8);
  text-align: center;
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.booking-info p {
  font-size: 1.4rem;
  margin: 10px 0;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  margin-bottom: 8px;
  font-size: 1.2rem;
}

.form-group input {
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-size: 1.2rem;
  background: #333;
  color: white;
}

.form-group input::placeholder {
  color: #bbb;
}

.form-row {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 16px;
  background: #ff4500;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.5rem;
  transition: background 0.3s, transform 0.2s;
}

.btn:hover {
  background: #ff5722;
  transform: scale(1.05);
}

.form-row input.short {
  width: 100px;
}
</style>
