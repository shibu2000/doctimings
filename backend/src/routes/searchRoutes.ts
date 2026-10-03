import { Hono } from 'hono';
import { searchController } from '../controllers/searchController.js';
import { validateQuery } from '../middleware/validator.js';
import { searchQuerySchema } from '../validators/searchValidator.js';

export const searchRoutes = new Hono();

searchRoutes.get('/', validateQuery(searchQuerySchema), searchController.searchDoctors);
