import express from 'express';
import cors from 'cors';
import { buildRecommendation, validateAssessment } from './recommendationEngine.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.post('/api/recommendations', (request, response) => {
    const errors = validateAssessment(request.body);

    if (errors.length) {
      return response.status(400).json({
        message: 'Please correct the highlighted fields.',
        errors
      });
    }

    return response.json(buildRecommendation(request.body));
  });

  app.use((_request, response) => {
    response.status(404).json({ message: 'Route not found.' });
  });

  app.use((error, _request, response, _next) => {
    response.status(500).json({
      message: 'Unexpected server error.',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  });

  return app;
}
