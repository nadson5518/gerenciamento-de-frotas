import { pool } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { ensureNonNegative, ensureRequired } from '../utils/http.js';
import { buildUpdateQuery } from './sql.js';

function validateValores(payload) {
  ensureNonNegative(payload.valor_cobrado, 'valor_cobrado');
  ensureNonNegative(payload.valor_pago, 'valor_pago');
}

export async function listRotasModelo() {
  const { rows } = await pool.query('SELECT * FROM rotas_modelo ORDER BY id DESC');
  return rows;
}

export async function getRotaModeloById(id) {
  const { rows } = await pool.query('SELECT * FROM rotas_modelo WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError('Rota modelo não encontrada.', 404);
  return rows[0];
}

export async function createRotaModelo(payload) {
  ensureRequired(payload.nome, 'nome');
  validateValores(payload);

  const { rows } = await pool.query(
    `INSERT INTO rotas_modelo (nome, descricao, valor_cobrado, valor_pago, status)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [
      payload.nome,
      payload.descricao ?? null,
      payload.valor_cobrado ?? 0,
      payload.valor_pago ?? 0,
      payload.status ?? 'ATIVO'
    ]
  );

  return rows[0];
}

export async function updateRotaModelo(id, payload) {
  validateValores(payload);

  const query = buildUpdateQuery('rotas_modelo', id, payload, [
    'nome',
    'descricao',
    'valor_cobrado',
    'valor_pago',
    'status'
  ]);

  const { rows } = await pool.query(query);
  if (!rows[0]) throw new AppError('Rota modelo não encontrada.', 404);

  return rows[0];
}

export async function deleteRotaModelo(id) {
  const { rowCount } = await pool.query('DELETE FROM rotas_modelo WHERE id = $1', [id]);
  if (rowCount === 0) throw new AppError('Rota modelo não encontrada.', 404);
}
