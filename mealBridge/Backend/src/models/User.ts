import { Schema, model, type InferSchemaType } from 'mongoose';
import { recipientTypes } from '../types/domain.js';

const coordinatesSchema = new Schema({ latitude: Number, longitude: Number }, { _id: false });

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['donor', 'ngo', 'volunteer'], required: true, index: true },
    supabaseUserId: { type: String, unique: true, sparse: true, select: false },
    organization: { type: String, trim: true },
    location: { type: String, trim: true },
    coordinates: coordinatesSchema,
    collectionCapacityKg: { type: Number, min: 0 },
    recipientType: { type: String, enum: recipientTypes },
    distanceKm: { type: Number, min: 0 },
    vehicleType: String,
    operatingHours: String,
    contactPerson: String,
    contactPhone: String,
    activeStatus: { type: String, enum: ['Available', 'On Route', 'Off Duty'], default: 'Available' },
    reliabilityScore: { type: Number, min: 1, max: 100, default: 80 },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, activeStatus: 1 });
export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
