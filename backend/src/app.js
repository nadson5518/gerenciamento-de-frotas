import cors from 'cors';
import express from 'express';
import { AppError } from './errors/app-error.js';
import apiRouter from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

app.use((error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error.code === '23505') {
    return res.status(409).json({ message: 'Violação de unicidade.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Erro interno no servidor.' });
});

export default app;
