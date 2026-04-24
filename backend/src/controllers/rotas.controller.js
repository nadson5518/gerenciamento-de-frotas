import { parseId } from '../utils/http.js';
import * as service from '../services/rotas.service.js';

export async function list(req, res) {
  const data = await service.listRotas();
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const data = await service.getRotaById(parseId(req.params.id));
  return res.status(200).json(data);
}

export async function create(req, res) {
  const data = await service.createRota(req.body);
  return res.status(201).json(data);
}

export async function update(req, res) {
  const data = await service.updateRota(parseId(req.params.id), req.body);
  return res.status(200).json(data);
}

export async function remove(req, res) {
  await service.deleteRota(parseId(req.params.id));
  return res.status(204).send();
}
