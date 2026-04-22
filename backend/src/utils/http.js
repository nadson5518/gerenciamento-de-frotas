import { AppError } from '../errors/app-error.js';

export function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export function ensureNonNegative(value, fieldName) {
  if (value !== undefined && Number(value) < 0) {
    throw new AppError(`${fieldName} não pode ser negativo.`, 400);
  }
}

export function ensureRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new AppError(`${fieldName} é obrigatório.`, 400);
  }
}

export function parseId(id) {
  const parsed = Number(id);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('ID inválido.', 400);
  }

  return parsed;
}
