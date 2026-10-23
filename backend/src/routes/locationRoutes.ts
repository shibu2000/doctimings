import { Hono } from 'hono';
import { locationController } from '../controllers/locationController.js';

export const locationRoutes = new Hono();

locationRoutes.get('/towns', locationController.getTowns);
locationRoutes.get('/approx', locationController.getApproxLocation);
