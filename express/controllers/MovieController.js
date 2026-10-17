import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();
export default router;

// Поля, которые разрешено создавать/обновлять через API
const validFields = {
  title: 'string',
  description: 'string',
  durationMin: 'number',
  basePrice: 'number',
  posterSmall: 'string',
  banner: 'string',
  trailer: 'string',
  genre: 'string',
  length: 'string',
  language: 'string'
};

function buildCleanData(body) {
  const cleanData = {};

  for (const field in validFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== validFields[field]) {
        throw new Error(
          `Invalid type for field ${field}, should be ${validFields[field]}.`
        );
      }
      cleanData[field] = body[field];
    }
  }

  return cleanData;
}

function validateMovieData(data, requireCoreFields = false) {
  if (requireCoreFields) {
    for (const field of ['title', 'durationMin', 'basePrice']) {
      if (data[field] === undefined) {
        return `${field} is required`;
      }
    }
  }

  if (data.title !== undefined && !data.title.trim()) {
    return 'title cannot be empty';
  }
  if (data.durationMin !== undefined &&
      (!Number.isInteger(data.durationMin) || data.durationMin <= 0)) {
    return 'durationMin must be a positive integer';
  }
  if (data.basePrice !== undefined &&
      (!Number.isFinite(data.basePrice) || data.basePrice < 0)) {
    return 'basePrice must be a non-negative number';
  }

  return null;
}

// GET /movies – список всех фильмов
router.get('/', async function (req, res) {
  try {
    const movies = await prisma.movie.findMany();
    res.json(movies);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// GET /movies/:id – один фильм по id
router.get('/:id', async function (req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid movie id' });
  }

  try {
    const movie = await prisma.movie.findUnique({
      where: { id }
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// POST /movies – создание фильма
router.post('/', async function (req, res) {
  let cleanData;
  try {
    cleanData = buildCleanData(req.body);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const validationError = validateMovieData(cleanData, true);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const newMovie = await prisma.movie.create({
      data: cleanData
    });
    res.status(201).json(newMovie);
  } catch (e) {
    console.error(e);
    if (e.code === 'P2021') {
      return res.status(503).json({
        error: 'Movie database is not initialized. Run "npm run db:setup" from the express folder.'
      });
    }
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

// PUT /movies/:id – полное обновление фильма
router.put('/:id', async function (req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid movie id' });
  }

  let cleanData;
  try {
    cleanData = buildCleanData(req.body);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const validationError = validateMovieData(cleanData);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const updated = await prisma.movie.update({
      where: { id },
      data: cleanData
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    if (e.code === 'P2025') {
      // Prisma "record not found"
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// DELETE /movies/:id – удаление фильма
router.delete('/:id', async function (req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid movie id' });
  }

  try {
    await prisma.movie.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (e) {
    console.error(e);
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Movie not found' });
    }
    if (e.code === 'P2003') {
      return res.status(409).json({
        error: 'Cannot delete this movie while showtimes or tickets are linked to it.'
      });
    }
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});