import request from 'supertest';
import app from '../index.js';
import prisma from '../prismaClient.js';

describe('Express backend API', () => {
  it('should return backend hello text at root GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('This is backend API');
  });

  it('should persist, update, and delete movies through the movie API', async () => {
    const title = `CRUD test movie ${Date.now()}`;
    let movieId;

    try {
      const created = await request(app)
        .post('/movies')
        .send({
          title,
          description: 'Test description',
          durationMin: 100,
          basePrice: 9.5,
          trailer: 'https://youtu.be/gn2o3shXU8U',
        });

      expect(created.status).toBe(201);
      expect(created.body.title).toBe(title);
      movieId = created.body.id;

      const updated = await request(app)
        .put(`/movies/${movieId}`)
        .send({
          title: `${title} updated`,
          durationMin: 100,
          basePrice: 9.5,
        });

      expect(updated.status).toBe(200);
      expect(updated.body.title).toBe(`${title} updated`);

      const persisted = await request(app).get(`/movies/${movieId}`);
      expect(persisted.status).toBe(200);
      expect(persisted.body.title).toBe(`${title} updated`);

      const removed = await request(app).delete(`/movies/${movieId}`);
      expect(removed.status).toBe(204);

      const missing = await request(app).get(`/movies/${movieId}`);
      expect(missing.status).toBe(404);
    } finally {
      if (movieId !== undefined) {
        await prisma.movie.deleteMany({ where: { id: movieId } });
      }
    }
  });
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8', // or c8
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      all: true,
      include: ['**/*.js'],
      exclude: ['node_modules/**', 'tests/**'],
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
});