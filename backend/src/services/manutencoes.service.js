import { pool } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { ensureNonNegative, ensureRequired } from '../utils/http.js';
import { buildUpdateQuery } from './sql.js';

function validate(payload) {
  ensureRequired(payload.veiculo_id, 'veiculo_id');
  ensureRequired(payload.data, 'data');
  ensureRequired(payload.tipo, 'tipo');
  ensureNonNegative(payload.valor, 'valor');
  ensureNonNegative(payload.km, 'km');
  ensureNonNegative(payload.proxima_revisao_km, 'proxima_revisao_km');
}

export async function listManutencoes(veiculoId) {
  const client = await pool.connect();

  try {
    if (veiculoId) {
      const { rows } = await client.query(
        'SELECT * FROM manutencoes WHERE veiculo_id = $1 ORDER BY data DESC, id DESC',
        [veiculoId]
      );
      return rows;
    }

    const { rows } = await client.query(
      'SELECT * FROM manutencoes ORDER BY data DESC, id DESC'
    );
    return rows;
  } finally {
    client.release();
  }
}

export async function getManutencaoById(id) {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      'SELECT * FROM manutencoes WHERE id = $1',
      [id]
    );
    if (!rows[0]) throw new AppError('Manutenção não encontrada.', 404);
    return rows[0];
  } finally {
    client.release();
  }
}

export async function createManutencao(payload) {
  validate(payload);

  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      `INSERT INTO manutencoes (veiculo_id, data, tipo, descricao, valor, km, proxima_revisao_data, proxima_revisao_km)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        payload.veiculo_id,
        payload.data,
        payload.tipo,
        payload.descricao ?? null,
        payload.valor ?? 0,
        payload.km ?? 0,
        payload.proxima_revisao_data ?? null,
        payload.proxima_revisao_km ?? null
      ]
    );

    return rows[0];
  } finally {
    client.release();
  }
}

export async function updateManutencao(id, payload) {
  ensureNonNegative(payload.valor, 'valor');
  ensureNonNegative(payload.km, 'km');
  ensureNonNegative(payload.proxima_revisao_km, 'proxima_revisao_km');

  const query = buildUpdateQuery('manutencoes', id, payload, [
    'veiculo_id',
    'data',
    'tipo',
    'descricao',
    'valor',
    'km',
    'proxima_revisao_data',
    'proxima_revisao_km'
  ]);

  const client = await pool.connect();

  try {
    const { rows } = await client.query(query);
    if (!rows[0]) throw new AppError('Manutenção não encontrada.', 404);
    return rows[0];
  } finally {
    client.release();
  }
}

export async function deleteManutencao(id) {
  const client = await pool.connect();

  try {
    const { rowCount } = await client.query(
      'DELETE FROM manutencoes WHERE id = $1',
      [id]
    );
    if (rowCount === 0) throw new AppError('Manutenção não encontrada.', 404);
  } finally {
    client.release();
  }
}