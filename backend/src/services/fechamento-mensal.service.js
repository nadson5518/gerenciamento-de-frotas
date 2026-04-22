import { pool } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { ensureRequired } from '../utils/http.js';
import { buildUpdateQuery } from './sql.js';

async function computeMonthlyTotals(mes, ano) {
  const [rotasResult, contratosResult, manutencoesResult] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(valor_cobrado), 0) AS recebido, COALESCE(SUM(valor_pago), 0) AS pago
       FROM rotas
       WHERE EXTRACT(MONTH FROM data) = $1 AND EXTRACT(YEAR FROM data) = $2`,
      [mes, ano]
    ),
    pool.query(
      `SELECT COALESCE(SUM(valor_recebido), 0) AS recebido, COALESCE(SUM(valor_pago), 0) AS pago
       FROM contratos
       WHERE EXTRACT(MONTH FROM data_inicio) = $1 AND EXTRACT(YEAR FROM data_inicio) = $2`,
      [mes, ano]
    ),
    pool.query(
      `SELECT COALESCE(SUM(valor), 0) AS total
       FROM manutencoes
       WHERE EXTRACT(MONTH FROM data) = $1 AND EXTRACT(YEAR FROM data) = $2`,
      [mes, ano]
    )
  ]);

  const totalRecebido = Number(rotasResult.rows[0].recebido) + Number(contratosResult.rows[0].recebido);
  const totalPago = Number(rotasResult.rows[0].pago) + Number(contratosResult.rows[0].pago);
  const totalManutencao = Number(manutencoesResult.rows[0].total);
  const lucro = totalRecebido - totalPago - totalManutencao;

  return { totalRecebido, totalPago, totalManutencao, lucro };
}

export async function listFechamentos() {
  const { rows } = await pool.query('SELECT * FROM fechamento_mensal ORDER BY ano DESC, mes DESC');
  return rows;
}

export async function getFechamentoById(id) {
  const { rows } = await pool.query('SELECT * FROM fechamento_mensal WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError('Fechamento mensal não encontrado.', 404);
  return rows[0];
}

export async function createFechamento(payload) {
  ensureRequired(payload.mes, 'mes');
  ensureRequired(payload.ano, 'ano');

  const totals = await computeMonthlyTotals(payload.mes, payload.ano);

  try {
    const { rows } = await pool.query(
      `INSERT INTO fechamento_mensal (mes, ano, total_recebido, total_pago, total_manutencao, lucro, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        payload.mes,
        payload.ano,
        totals.totalRecebido,
        totals.totalPago,
        totals.totalManutencao,
        totals.lucro,
        payload.status ?? 'ABERTO'
      ]
    );

    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Já existe fechamento para este mês/ano.', 409);
    }

    throw error;
  }
}

export async function updateFechamento(id, payload) {
  const current = await getFechamentoById(id);
  const mes = payload.mes ?? current.mes;
  const ano = payload.ano ?? current.ano;

  const totals = await computeMonthlyTotals(mes, ano);

  const query = buildUpdateQuery('fechamento_mensal', id, {
    ...payload,
    mes,
    ano,
    total_recebido: totals.totalRecebido,
    total_pago: totals.totalPago,
    total_manutencao: totals.totalManutencao,
    lucro: totals.lucro
  }, ['mes', 'ano', 'total_recebido', 'total_pago', 'total_manutencao', 'lucro', 'status']);

  try {
    const { rows } = await pool.query(query);
    if (!rows[0]) throw new AppError('Fechamento mensal não encontrado.', 404);
    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Já existe fechamento para este mês/ano.', 409);
    }

    throw error;
  }
}

export async function deleteFechamento(id) {
  const { rowCount } = await pool.query('DELETE FROM fechamento_mensal WHERE id = $1', [id]);
  if (rowCount === 0) throw new AppError('Fechamento mensal não encontrado.', 404);
}
