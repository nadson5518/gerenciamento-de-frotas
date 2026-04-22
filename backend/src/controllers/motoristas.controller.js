import { parseId } from '../utils/http.js';
import * as service from '../services/motoristas.service.js';

export async function list(req, res) {
  const data = await service.listMotoristas();
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const data = await service.getMotoristaById(parseId(req.params.id));
  return res.status(200).json(data);
}

export async function create(req, res) {
  const data = await service.createMotorista(req.body);
  return res.status(201).json(data);
}

export async function update(req, res) {
  const data = await service.updateMotorista(parseId(req.params.id), req.body);
  return res.status(200).json(data);
}

export async function remove(req, res) {
  await service.deleteMotorista(parseId(req.params.id));
  return res.status(204).send();
}
