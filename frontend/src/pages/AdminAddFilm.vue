<template>
  <div class="admin-add-film">
    <h1>{{ t(isEditing ? 'admin.editTitle' : 'admin.title') }}</h1>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">{{ t('admin.titleField') }}:</label>
        <input id="title" v-model="form.title" required type="text">
      </div>
      <div class="form-group">
        <label for="genre">{{ t('admin.genre') }}:</label>
        <input id="genre" v-model="form.genre" required type="text">
      </div>
      <div class="form-group">
        <label for="durationMin">{{ t('admin.duration') }}:</label>
        <input id="durationMin" v-model.number="form.durationMin" min="1" required type="number">
      </div>
      <div class="form-group">
        <label for="basePrice">{{ t('admin.price') }}:</label>
        <input id="basePrice" v-model.number="form.basePrice" min="0" step="0.01" required type="number">
      </div>
      <div class="form-group">
        <label for="description">{{ t('admin.description') }}:</label>
        <textarea id="description" v-model="form.description" required />
      </div>
      <div class="form-group">
        <label for="posterSmall">{{ t('admin.poster') }}:</label>
        <input id="posterSmall" v-model="form.posterSmall" type="url">
      </div>
      <div class="form-group">
        <label for="banner">{{ t('admin.banner') }}:</label>
        <input id="banner" v-model="form.banner" type="url">
      </div>
      <div class="form-group">
        <label for="trailer">{{ t('admin.trailer') }}:</label>
        <input id="trailer" v-model="form.trailer" type="url">
        <small>{{ t('admin.trailerHelp') }}</small>
      </div>
      <div class="form-group">
        <label for="language">{{ t('admin.language') }}:</label>
        <input id="language" v-model="form.language" type="text">
      </div>
      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
      <button class="btn" type="submit" :disabled="submitting">
        {{ submitting ? t('admin.saving') : t(isEditing ? 'admin.save' : 'admin.add') }}
      </button>
      <button v-if="isEditing" class="btn cancel-btn" type="button" @click="cancelEdit">
        {{ t('admin.cancel') }}
      </button>
      <p v-if="successMessage" class="success-message" role="status">{{ successMessage }}</p>
    </form>

    <section class="movie-management">
      <h2>{{ t('admin.movieList') }}</h2>
      <p v-if="loadingMovies">{{ t('home.loading') }}</p>
      <p v-else-if="loadError" class="error-message" role="alert">{{ loadError }}</p>
      <p v-else-if="movies.length === 0">{{ t('admin.noMovies') }}</p>
      <article v-for="movie in movies" :key="movie.id" class="movie-row">
        <img v-if="movie.posterSmall" :src="movie.posterSmall" :alt="movie.title" class="movie-poster">
        <div class="movie-summary">
          <h3>{{ movie.title }}</h3>
          <p>{{ t('movie.genre') }}: {{ movie.genre || '—' }} · {{ t('movie.duration') }}: {{ movie.durationMin }}</p>
        </div>
        <div class="movie-actions">
          <button class="btn" type="button" @click="editMovie(movie)">{{ t('admin.edit') }}</button>
          <button class="btn delete-btn" type="button" :disabled="deletingId === movie.id" @click="deleteMovie(movie)">
            {{ t('admin.delete') }}
          </button>
        </div>
      </article>
    </section>

    <router-link to="/">
      <button class="btn back-btn">{{ t('admin.back') }}</button>
    </router-link>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { API_URL } from '@/main'
  import { useI18n } from '@/i18n'

  const { t } = useI18n()
  const submitting = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const movies = ref([])
  const loadingMovies = ref(true)
  const loadError = ref('')
  const deletingId = ref(null)
  const editingMovieId = ref(null)
  const isEditing = computed(() => editingMovieId.value !== null)

  const emptyForm = () => ({
    title: '',
    genre: '',
    durationMin: 0,
    basePrice: 0,
    description: '',
    posterSmall: '',
    banner: '',
    trailer: '',
    language: '',
  })
  const form = ref(emptyForm())

  onMounted(loadMovies)

  async function loadMovies() {
    loadingMovies.value = true
    loadError.value = ''
    try {
      const response = await fetch(`${API_URL}/movies`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('admin.loadError'))
      movies.value = data
    } catch (error) {
      console.error('Failed to load movies for admin management', error)
      loadError.value = error.message || t('admin.loadError')
    } finally {
      loadingMovies.value = false
    }
  }

  async function submitForm () {
    submitting.value = true
    errorMessage.value = ''
    successMessage.value = ''
    const durationHours = Math.floor(form.value.durationMin / 60)
    const durationRemainder = form.value.durationMin % 60
    const movieData = {
      ...form.value,
      length: durationHours > 0
        ? `${durationHours}h ${durationRemainder}min`
        : `${durationRemainder}min`,
    }

    try {
      let response
      try {
        response = await fetch(`${API_URL}/movies${isEditing.value ? `/${editingMovieId.value}` : ''}`, {
          method: isEditing.value ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(movieData),
        })
      } catch {
        throw new Error(t('admin.apiUnavailable'))
      }

      const responseText = await response.text()
      let responseData = {}
      if (responseText) {
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = {}
        }
      }
      if (!response.ok) {
        throw new Error(
          responseData.error ||
          `${t('admin.saveError')} (HTTP ${response.status})`
        )
      }
      successMessage.value = t(isEditing.value ? 'admin.updated' : 'admin.added')
      cancelEdit()
      await loadMovies()
    } catch (error) {
      console.error(error)
      errorMessage.value = error.message || t('admin.saveError')
    } finally {
      submitting.value = false
    }
  }

  function editMovie(movie) {
    editingMovieId.value = movie.id
    form.value = {
      title: movie.title || '',
      genre: movie.genre || '',
      durationMin: Number(movie.durationMin),
      basePrice: Number(movie.basePrice),
      description: movie.description || '',
      posterSmall: movie.posterSmall || '',
      banner: movie.banner || '',
      trailer: movie.trailer || '',
      language: movie.language || '',
    }
    errorMessage.value = ''
    successMessage.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    editingMovieId.value = null
    form.value = emptyForm()
  }

  async function deleteMovie(movie) {
    if (!window.confirm(t('admin.confirmDelete'))) return
    deletingId.value = movie.id
    errorMessage.value = ''
    successMessage.value = ''
    try {
      const response = await fetch(`${API_URL}/movies/${movie.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        if (response.status === 409) throw new Error(t('admin.deleteConflict'))
        throw new Error(data.error || t('admin.deleteError'))
      }
      if (editingMovieId.value === movie.id) cancelEdit()
      successMessage.value = t('admin.deleted')
      await loadMovies()
    } catch (error) {
      console.error('Failed to delete movie', error)
      errorMessage.value = error.message || t('admin.deleteError')
    } finally {
      deletingId.value = null
    }
  }
</script>

<style scoped>
.admin-add-film {
  min-height: 100vh;
  background: #111;
  color: white;
  padding: 20px;
}

form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #1c1c1c;
  color: white;
}

textarea {
  height: 100px;
  resize: vertical;
}

.btn {
  padding: 10px 20px;
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

.btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.error-message {
  color: #ff6b6b;
  margin-bottom: 12px;
}

.success-message {
  color: #66bb6a;
}

.movie-management {
  max-width: 900px;
  margin: 40px auto;
}

.movie-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  margin: 12px 0;
  background: #1c1c1c;
  border-radius: 6px;
}

.movie-poster {
  width: 56px;
  height: 80px;
  object-fit: cover;
}

.movie-summary {
  flex: 1;
}

.movie-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  background: #9d1820;
}

.cancel-btn {
  margin-left: 8px;
  background: #444;
}

.back-btn {
  margin-top: 20px;
  background: #333;
}

.back-btn:hover {
  background: #555;
}
</style>
