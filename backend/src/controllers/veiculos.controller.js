import { parseId } from '../utils/http.js';
import * as service from '../services/veiculos.service.js';

export async function list(req, res) {
  const data = await service.listVeiculos();
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const data = await service.getVeiculoById(parseId(req.params.id));
  return res.status(200).json(data);
}

export async function create(req, res) {
  const data = await service.createVeiculo(req.body);
  return res.status(201).json(data);
}

export async function update(req, res) {
  const data = await service.updateVeiculo(parseId(req.params.id), req.body);
  return res.status(200).json(data);
}

export async function remove(req, res) {
  await service.deleteVeiculo(parseId(req.params.id));
  return res.status(204).send();
}
