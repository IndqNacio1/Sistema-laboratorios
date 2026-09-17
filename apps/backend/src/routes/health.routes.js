import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'sistema-laboratorios-api',
  });
});

export default router;

