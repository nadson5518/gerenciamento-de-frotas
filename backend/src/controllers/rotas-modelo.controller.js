import { parseId } from '../utils/http.js';
import * as service from '../services/rotas-modelo.service.js';

export async function list(req, res) {
  const data = await service.listRotasModelo();
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const data = await service.getRotaModeloById(parseId(req.params.id));
  return res.status(200).json(data);
}

export async function create(req, res) {
  const data = await service.createRotaModelo(req.body);
  return res.status(201).json(data);
}

export async function update(req, res) {
  const data = await service.updateRotaModelo(parseId(req.params.id), req.body);
  return res.status(200).json(data);
}

export async function remove(req, res) {
  await service.deleteRotaModelo(parseId(req.params.id));
  return res.status(204).send();
}
