import { pool } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { ensureNonNegative, ensureRequired } from '../utils/http.js';
import { buildUpdateQuery } from './sql.js';

function withLucro(row) {
  return {
    ...row,
    lucro: Number(row.valor_recebido) - Number(row.valor_pago)
  };
}

async function ensureSingleActiveContract(veiculoId, currentId = null) {
  const values = [veiculoId];
  let query = 'SELECT id FROM contratos WHERE veiculo_id = $1 AND status = $2';
  values.push('ATIVO');

  if (currentId) {
    values.push(currentId);
    query += ` AND id <> $${values.length}`;
  }

  const { rows } = await pool.query(query, values);

  if (rows.length > 0) {
    throw new AppError('Já existe contrato ativo para este veículo.', 409);
  }
}

function validate(payload) {
  ensureRequired(payload.veiculo_id, 'veiculo_id');
  ensureRequired(payload.empresa, 'empresa');
  ensureRequired(payload.data_inicio, 'data_inicio');
  ensureNonNegative(payload.valor_recebido, 'valor_recebido');
  ensureNonNegative(payload.valor_pago, 'valor_pago');
}

export async function listContratos() {
  const { rows } = await pool.query('SELECT * FROM contratos ORDER BY id DESC');
  return rows.map(withLucro);
}

export async function getContratoById(id) {
  const { rows } = await pool.query('SELECT * FROM contratos WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError('Contrato não encontrado.', 404);
  return withLucro(rows[0]);
}

export async function createContrato(payload) {
  validate(payload);

  if ((payload.status ?? 'ATIVO') === 'ATIVO') {
    await ensureSingleActiveContract(payload.veiculo_id);
  }

  const { rows } = await pool.query(
    `INSERT INTO contratos (veiculo_id, empresa, data_inicio, data_fim, valor_recebido, valor_pago, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      payload.veiculo_id,
      payload.empresa,
      payload.data_inicio,
      payload.data_fim ?? null,
      payload.valor_recebido ?? 0,
      payload.valor_pago ?? 0,
      payload.status ?? 'ATIVO'
    ]
  );

  return withLucro(rows[0]);
}

export async function updateContrato(id, payload) {
  ensureNonNegative(payload.valor_recebido, 'valor_recebido');
  ensureNonNegative(payload.valor_pago, 'valor_pago');

  const current = await getContratoById(id);
  const nextVeiculoId = payload.veiculo_id ?? current.veiculo_id;
  const nextStatus = payload.status ?? current.status;

  if (nextStatus === 'ATIVO') {
    await ensureSingleActiveContract(nextVeiculoId, id);
  }

  const query = buildUpdateQuery('contratos', id, payload, [
    'veiculo_id',
    'empresa',
    'data_inicio',
    'data_fim',
    'valor_recebido',
    'valor_pago',
    'status'
  ]);

  const { rows } = await pool.query(query);
  if (!rows[0]) throw new AppError('Contrato não encontrado.', 404);
  return withLucro(rows[0]);
}

export async function deleteContrato(id) {
  const { rowCount } = await pool.query('DELETE FROM contratos WHERE id = $1', [id]);
  if (rowCount === 0) throw new AppError('Contrato não encontrado.', 404);
}
