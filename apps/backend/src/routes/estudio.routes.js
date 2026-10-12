import { Router } from 'express';
import { getEstudios, createEstudio } from '../controllers/estudio.controller.js';
import express from 'express';
import { subirResultadoEstudio } from '../controllers/estudio.controller.js';
import upload from '../middlewares/uploadHandler.js';


const router = Router();

router.get('/', getEstudios);
router.post('/', createEstudio );
router.post('/:id/upload', upload.single('documento'), subirResultadoEstudio);

export default router;