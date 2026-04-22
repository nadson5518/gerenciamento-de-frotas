import { Router } from 'express';
import contratosRouter from './contratos.routes.js';
import documentosRouter from './documentos.routes.js';
import fechamentoMensalRouter from './fechamento-mensal.routes.js';
import manutencoesRouter from './manutencoes.routes.js';
import motoristasRouter from './motoristas.routes.js';
import rotasModeloRouter from './rotas-modelo.routes.js';
import rotasRouter from './rotas.routes.js';
import veiculosRouter from './veiculos.routes.js';

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'fleet-management-api' });
});

apiRouter.use('/veiculos', veiculosRouter);
apiRouter.use('/motoristas', motoristasRouter);
apiRouter.use('/rotas-modelo', rotasModeloRouter);
apiRouter.use('/rotas', rotasRouter);
apiRouter.use('/contratos', contratosRouter);
apiRouter.use('/manutencoes', manutencoesRouter);
apiRouter.use('/documentos', documentosRouter);
apiRouter.use('/fechamento-mensal', fechamentoMensalRouter);

export default apiRouter;
