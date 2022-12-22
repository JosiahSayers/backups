import express from 'express';
import cors from 'cors';
import { serverAdapter } from './bull-board';

export async function startApp() {
  const app = express();

  app.use(cors());
  app.disable('x-powered-by');

  app.use('/', serverAdapter.getRouter());

  return app;
}
