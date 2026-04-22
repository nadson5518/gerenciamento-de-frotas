import { pool } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { ensureRequired } from '../utils/http.js';
import { buildUpdateQuery } from './sql.js';

function validateNota(nota) {
  if (nota !== undefined && (Number(nota) < 0 || Number(nota) > 10)) {
    throw new AppError('nota deve estar entre 0 e 10.', 400);
  }
}

export async function listMotoristas() {
  const { rows } = await pool.query('SELECT * FROM motoristas ORDER BY id DESC');
  return rows;
}

export async function getMotoristaById(id) {
  const { rows } = await pool.query('SELECT * FROM motoristas WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError('Motorista não encontrado.', 404);
  return rows[0];
}

export async function createMotorista(payload) {
  ensureRequired(payload.nome, 'nome');
  validateNota(payload.nota);

  const { rows } = await pool.query(
    'INSERT INTO motoristas (nome, telefone, nota, status) VALUES ($1,$2,$3,$4) RETURNING *',
    [payload.nome, payload.telefone ?? null, payload.nota ?? 0, payload.status ?? 'ATIVO']
  );

  return rows[0];
}

export async function updateMotorista(id, payload) {
  validateNota(payload.nota);

  const query = buildUpdateQuery('motoristas', id, payload, ['nome', 'telefone', 'nota', 'status']);
  const { rows } = await pool.query(query);
  if (!rows[0]) throw new AppError('Motorista não encontrado.', 404);

  return rows[0];
}

export async function deleteMotorista(id) {
  const { rowCount } = await pool.query('DELETE FROM motoristas WHERE id = $1', [id]);
  if (rowCount === 0) throw new AppError('Motorista não encontrado.', 404);
}
