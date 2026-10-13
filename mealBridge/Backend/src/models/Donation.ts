import { Schema, model, Types, type InferSchemaType } from 'mongoose';
import { donationStatuses, foodCategories, recipientTypes } from '../types/domain.js';

const claimedBySchema = new Schema(
  {
    collector: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: recipientTypes, required: true },
    claimedAt: { type: Date, required: true },
  },
  { _id: false },
);

const donationSchema = new Schema(
  {
    foodName: { type: String, required: true, trim: true },
    category: { type: String, enum: foodCategories, required: true },
    quantityKg: { type: Number, required: true, min: 0.01 },
    donor: { type: Schema.Types.ObjectId, ref: 'User' },
    donorName: { type: String, required: true, trim: true },
    donorPhone: { type: String, trim: true },
    donorType: { type: String, enum: ['Campus Mess', 'Cafeteria', 'Bakery', 'Tech Park Dining', 'Event Hall'], required: true },
    pickupLocation: { type: String, required: true, trim: true },
    locationArea: { type: String, required: true, trim: true },
    preparationTime: { type: Date, required: true },
    pickupDeadline: { type: Date, required: true, index: true },
    foodNotes: { type: String, default: '', trim: true },
    analyticsIncluded: { type: Boolean, default: false },
    status: { type: String, enum: donationStatuses, default: 'available', index: true },
    claimedBy: claimedBySchema,
    pickupCodeHash: { type: String, select: false },
    collectedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true },
);

donationSchema.index({ status: 1, pickupDeadline: 1 });
donationSchema.index({ foodName: 'text', donorName: 'text', locationArea: 'text', pickupLocation: 'text' });
export type DonationDocument = InferSchemaType<typeof donationSchema> & { _id: Types.ObjectId };
export const Donation = model('Donation', donationSchema);
