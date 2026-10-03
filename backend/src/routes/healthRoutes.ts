import { Hono } from 'hono';
import { healthController } from '../controllers/healthController.js';

export const healthRoutes = new Hono();

healthRoutes.get('/', healthController.systemHealth);
healthRoutes.get('/topics', healthController.getTopics);
healthRoutes.get('/articles', healthController.getArticles);
healthRoutes.get('/articles/:slug', healthController.getArticleBySlug);
