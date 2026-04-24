import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool PostgreSQL:', err);
});

export async function checkDatabaseConnection() {
  console.log('A - Iniciando teste de conexão');
  const client = await pool.connect();
  console.log('B - Cliente conectado no startup');

  try {
    await client.query('SELECT 1');
    console.log('C - SELECT 1 executado no startup');
    return true;
  } finally {
    console.log('D - Liberando cliente do startup');
    client.release();
  }
}