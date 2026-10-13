import { z } from 'zod';
import { foodCategories } from '../types/domain.js';

const isoDate = z.string().datetime({ offset: true }).refine((value) => !Number.isNaN(Date.parse(value)), 'Must be a valid ISO date.');
const donationFields = {
  foodName: z.string().trim().min(2).max(160),
  category: z.enum(foodCategories),
  quantityKg: z.coerce.number().positive().max(10000),
  donorName: z.string().trim().min(2).max(160),
  donorPhone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, 'Enter a valid phone number with country code, such as +919876543210.'),
  donorType: z.enum(['Campus Mess', 'Cafeteria', 'Bakery', 'Tech Park Dining', 'Event Hall']),
  pickupLocation: z.string().trim().min(3).max(300),
  locationArea: z.string().trim().min(2).max(120),
  preparationTime: isoDate,
  pickupDeadline: isoDate,
  foodNotes: z.string().trim().max(2000).default(''),
};

export const donationInputSchema = z.object(donationFields).strict().superRefine((data, ctx) => {
  if (Date.parse(data.pickupDeadline) <= Date.now()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pickupDeadline'], message: 'Pickup deadline must be in the future.' });
  }
  if (Date.parse(data.preparationTime) > Date.parse(data.pickupDeadline)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['preparationTime'], message: 'Preparation time must be before the pickup deadline.' });
  }
});

export const donationUpdateSchema = z.object({
  foodName: donationFields.foodName.optional(),
  category: donationFields.category.optional(),
  quantityKg: donationFields.quantityKg.optional(),
  donorName: donationFields.donorName.optional(),
  donorPhone: donationFields.donorPhone.optional(),
  donorType: donationFields.donorType.optional(),
  pickupLocation: donationFields.pickupLocation.optional(),
  locationArea: donationFields.locationArea.optional(),
  preparationTime: isoDate.optional(),
  pickupDeadline: isoDate.optional(),
  foodNotes: donationFields.foodNotes.optional(),
}).strict().superRefine((data, ctx) => {
  if (data.pickupDeadline && Date.parse(data.pickupDeadline) <= Date.now()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pickupDeadline'], message: 'Pickup deadline must be in the future.' });
  }
  if (data.preparationTime && data.pickupDeadline && Date.parse(data.preparationTime) > Date.parse(data.pickupDeadline)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['preparationTime'], message: 'Preparation time must be before the pickup deadline.' });
  }
});

export const claimSchema = z.object({
  collectorId: z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid MongoDB ID.').optional(),
  recipientId: z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid MongoDB ID.').optional(),
}).refine((data) => !(data.collectorId && data.recipientId && data.collectorId !== data.recipientId), {
  message: 'collectorId and recipientId must refer to the same participant when both are supplied.',
});

export const pickupVerificationSchema = z.object({
  pickupCode: z.string().trim().regex(/^MB-\d{4}$/i, 'Pickup code must be in MB-1234 format.'),
});
