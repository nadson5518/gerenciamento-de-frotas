import { Router } from 'express';
import * as controller from '../controllers/motoristas.controller.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
