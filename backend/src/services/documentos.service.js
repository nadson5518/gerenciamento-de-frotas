import { pool } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { ensureRequired } from '../utils/http.js';
import { buildUpdateQuery } from './sql.js';

export async function listDocumentos() {
  const { rows } = await pool.query('SELECT * FROM documentos ORDER BY validade ASC, id DESC');
  return rows;
}

export async function getDocumentoById(id) {
  const { rows } = await pool.query('SELECT * FROM documentos WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError('Documento não encontrado.', 404);
  return rows[0];
}

export async function createDocumento(payload) {
  ensureRequired(payload.veiculo_id, 'veiculo_id');
  ensureRequired(payload.tipo, 'tipo');
  ensureRequired(payload.validade, 'validade');

  const { rows } = await pool.query(
    `INSERT INTO documentos (veiculo_id, tipo, validade, arquivo_url)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [payload.veiculo_id, payload.tipo, payload.validade, payload.arquivo_url ?? null]
  );

  return rows[0];
}

export async function updateDocumento(id, payload) {
  const query = buildUpdateQuery('documentos', id, payload, [
    'veiculo_id',
    'tipo',
    'validade',
    'arquivo_url'
  ]);

  const { rows } = await pool.query(query);
  if (!rows[0]) throw new AppError('Documento não encontrado.', 404);
  return rows[0];
}

export async function deleteDocumento(id) {
  const { rowCount } = await pool.query('DELETE FROM documentos WHERE id = $1', [id]);
  if (rowCount === 0) throw new AppError('Documento não encontrado.', 404);
}
