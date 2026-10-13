import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { claimDonation, completeDonation, createDonation, getDonation, getMatches, listDonations, updateDonation, verifyPickup } from '../controllers/donation.controller.js';
import { claimSchema, donationInputSchema, donationUpdateSchema, pickupVerificationSchema } from '../validators/donation.js';
import { validateBody } from '../validators/request.js';

export const donationRouter = Router();
donationRouter.get('/', asyncHandler(listDonations));
donationRouter.post('/', validateBody(donationInputSchema), asyncHandler(createDonation));
donationRouter.get('/:id', asyncHandler(getDonation));
donationRouter.patch('/:id', validateBody(donationUpdateSchema), asyncHandler(updateDonation));
donationRouter.get('/:id/matches', asyncHandler(getMatches));
donationRouter.post('/:id/claim', validateBody(claimSchema), asyncHandler(claimDonation));
donationRouter.post('/:id/verify-pickup', validateBody(pickupVerificationSchema), asyncHandler(verifyPickup));
donationRouter.post('/:id/complete', asyncHandler(completeDonation));
