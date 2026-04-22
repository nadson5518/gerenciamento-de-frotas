import { AppError } from '../errors/app-error.js';

export function buildUpdateQuery(table, id, payload, allowedFields) {
  const entries = Object.entries(payload).filter(
    ([key, value]) => allowedFields.includes(key) && value !== undefined
  );

  if (entries.length === 0) {
    throw new AppError('Nenhum campo válido enviado para atualização.', 400);
  }

  const setClause = entries.map(([key], index) => `${key} = $${index + 1}`);
  const values = entries.map(([, value]) => value);

  setClause.push('updated_at = NOW()');
  values.push(id);

  return {
    text: `UPDATE ${table} SET ${setClause.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  };
}
