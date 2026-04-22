import { parseId } from '../utils/http.js';
import * as service from '../services/contratos.service.js';

export async function list(req, res) {
  const data = await service.listContratos();
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const data = await service.getContratoById(parseId(req.params.id));
  return res.status(200).json(data);
}

export async function create(req, res) {
  const data = await service.createContrato(req.body);
  return res.status(201).json(data);
}

export async function update(req, res) {
  const data = await service.updateContrato(parseId(req.params.id), req.body);
  return res.status(200).json(data);
}

export async function remove(req, res) {
  await service.deleteContrato(parseId(req.params.id));
  return res.status(204).send();
}
