import { parseId } from '../utils/http.js';
import * as service from '../services/manutencoes.service.js';

export async function list(req, res) {
  const veiculoId = req.query.veiculo_id ? Number(req.query.veiculo_id) : undefined;
  const data = await service.listManutencoes(veiculoId);
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const data = await service.getManutencaoById(parseId(req.params.id));
  return res.status(200).json(data);
}

export async function create(req, res) {
  const data = await service.createManutencao(req.body);
  return res.status(201).json(data);
}

export async function update(req, res) {
  const data = await service.updateManutencao(parseId(req.params.id), req.body);
  return res.status(200).json(data);
}

export async function remove(req, res) {
  await service.deleteManutencao(parseId(req.params.id));
  return res.status(204).send();
}