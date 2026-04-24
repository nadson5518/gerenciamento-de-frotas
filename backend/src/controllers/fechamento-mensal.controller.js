import { parseId } from '../utils/http.js';
import * as service from '../services/fechamento-mensal.service.js';

export async function list(req, res) {
  const data = await service.listFechamentos();
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const data = await service.getFechamentoById(parseId(req.params.id));
  return res.status(200).json(data);
}

export async function create(req, res) {
  const data = await service.createFechamento(req.body);
  return res.status(201).json(data);
}

export async function update(req, res) {
  const data = await service.updateFechamento(parseId(req.params.id), req.body);
  return res.status(200).json(data);
}

export async function remove(req, res) {
  await service.deleteFechamento(parseId(req.params.id));
  return res.status(204).send();
}
