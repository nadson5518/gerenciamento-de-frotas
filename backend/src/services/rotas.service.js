import { pool } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { ensureNonNegative, ensureRequired } from '../utils/http.js';
import { buildUpdateQuery } from './sql.js';

function withLucro(row) {
  return {
    ...row,
    lucro: Number(row.valor_cobrado) - Number(row.valor_pago)
  };
}

function validate(payload) {
  ensureRequired(payload.data, 'data');
  ensureRequired(payload.motorista_id, 'motorista_id');
  ensureRequired(payload.rota_modelo_id, 'rota_modelo_id');
  ensureRequired(payload.valor_cobrado, 'valor_cobrado');
  ensureRequired(payload.valor_pago, 'valor_pago');
  ensureNonNegative(payload.valor_cobrado, 'valor_cobrado');
  ensureNonNegative(payload.valor_pago, 'valor_pago');
}

export async function listRotas() {
  const { rows } = await pool.query('SELECT * FROM rotas ORDER BY data DESC, id DESC');
  return rows.map(withLucro);
}

export async function getRotaById(id) {
  const { rows } = await pool.query('SELECT * FROM rotas WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError('Rota não encontrada.', 404);
  return withLucro(rows[0]);
}

export async function createRota(payload) {
  validate(payload);

  const { rows } = await pool.query(
    `INSERT INTO rotas (data, motorista_id, rota_modelo_id, valor_cobrado, valor_pago)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [payload.data, payload.motorista_id, payload.rota_modelo_id, payload.valor_cobrado, payload.valor_pago]
  );

  return withLucro(rows[0]);
}

export async function updateRota(id, payload) {
  ensureNonNegative(payload.valor_cobrado, 'valor_cobrado');
  ensureNonNegative(payload.valor_pago, 'valor_pago');

  const query = buildUpdateQuery('rotas', id, payload, [
    'data',
    'motorista_id',
    'rota_modelo_id',
    'valor_cobrado',
    'valor_pago'
  ]);

  const { rows } = await pool.query(query);
  if (!rows[0]) throw new AppError('Rota não encontrada.', 404);
  return withLucro(rows[0]);
}

export async function deleteRota(id) {
  const { rowCount } = await pool.query('DELETE FROM rotas WHERE id = $1', [id]);
  if (rowCount === 0) throw new AppError('Rota não encontrada.', 404);
}
