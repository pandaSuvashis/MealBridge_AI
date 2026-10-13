import { Router } from 'express';
import { listParticipants } from '../controllers/participant.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const participantRouter = Router();
participantRouter.get('/', asyncHandler(listParticipants));
