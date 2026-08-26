import { Router } from 'express';
import * as uploadsController from '../controllers/uploads.controller';

const router = Router();

router.post('/', uploadsController.upload);

export default router;
