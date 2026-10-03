import { serve } from '@hono/node-server';
import app from './index.js';

const PORT = Number(process.env.PORT) || 4000;

serve(
  {
    fetch: app.fetch,
    port: PORT
  },
  (info) => {
    console.log(`DocTimings backend listening on port ${info.port}`);
  }
);
