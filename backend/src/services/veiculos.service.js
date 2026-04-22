import { pool } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { ensureNonNegative, ensureRequired } from '../utils/http.js';
import { buildUpdateQuery } from './sql.js';

function validateVeiculoPayload(payload) {
  ensureRequired(payload.placa, 'placa');
  ensureRequired(payload.modelo, 'modelo');
  ensureRequired(payload.marca, 'marca');
  ensureRequired(payload.ano, 'ano');
  ensureRequired(payload.chassi, 'chassi');
  ensureRequired(payload.renavam, 'renavam');
  ensureRequired(payload.tipo, 'tipo');
  ensureRequired(payload.status, 'status');
  ensureNonNegative(payload.km_atual, 'km_atual');
}

export async function listVeiculos() {
  const { rows } = await pool.query('SELECT * FROM veiculos ORDER BY id DESC');
  return rows;
}

export async function getVeiculoById(id) {
  const { rows } = await pool.query('SELECT * FROM veiculos WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError('Veículo não encontrado.', 404);
  return rows[0];
}

export async function createVeiculo(payload) {
  validateVeiculoPayload(payload);

  const query = `
    INSERT INTO veiculos (placa, modelo, marca, ano, chassi, renavam, tipo, status, km_atual, data_ultima_atualizacao_km, foto_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
  `;

  try {
    const { rows } = await pool.query(query, [
      payload.placa,
      payload.modelo,
      payload.marca,
      payload.ano,
      payload.chassi,
      payload.renavam,
      payload.tipo,
      payload.status,
      payload.km_atual ?? 0,
      payload.data_ultima_atualizacao_km ?? null,
      payload.foto_url ?? null
    ]);

    return rows[0];
  } catch (error) {
    if (error.code === '23505') throw new AppError('Placa, chassi ou renavam já cadastrado.', 409);
    throw error;
  }
}

export async function updateVeiculo(id, payload) {
  ensureNonNegative(payload.km_atual, 'km_atual');

  const query = buildUpdateQuery('veiculos', id, payload, [
    'placa',
    'modelo',
    'marca',
    'ano',
    'chassi',
    'renavam',
    'tipo',
    'status',
    'km_atual',
    'data_ultima_atualizacao_km',
    'foto_url'
  ]);

  try {
    const { rows } = await pool.query(query);
    if (!rows[0]) throw new AppError('Veículo não encontrado.', 404);
    return rows[0];
  } catch (error) {
    if (error.code === '23505') throw new AppError('Placa, chassi ou renavam já cadastrado.', 409);
    throw error;
  }
}

export async function deleteVeiculo(id) {
  const { rowCount } = await pool.query('DELETE FROM veiculos WHERE id = $1', [id]);
  if (rowCount === 0) throw new AppError('Veículo não encontrado.', 404);
}
