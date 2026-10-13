import { Router } from 'express';
import { getActivity, getImpact } from '../controllers/impact.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const impactRouter = Router();
impactRouter.get('/', asyncHandler(getImpact));
impactRouter.get('/activity', asyncHandler(getActivity));
