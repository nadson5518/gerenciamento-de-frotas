import { parseId } from '../utils/http.js';
import * as service from '../services/documentos.service.js';

export async function list(req, res) {
  const data = await service.listDocumentos();
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const data = await service.getDocumentoById(parseId(req.params.id));
  return res.status(200).json(data);
}

export async function create(req, res) {
  const data = await service.createDocumento(req.body);
  return res.status(201).json(data);
}

export async function update(req, res) {
  const data = await service.updateDocumento(parseId(req.params.id), req.body);
  return res.status(200).json(data);
}

export async function remove(req, res) {
  await service.deleteDocumento(parseId(req.params.id));
  return res.status(204).send();
}
