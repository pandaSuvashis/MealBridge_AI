import { Schema, model } from 'mongoose';

const assignmentSchema = new Schema(
  {
    donation: { type: Schema.Types.ObjectId, ref: 'Donation', required: true, unique: true, index: true },
    collector: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pickupCodeHash: { type: String, required: true, select: false },
    assignedAt: { type: Date, required: true },
    verifiedAt: Date,
    completedAt: Date,
    status: { type: String, enum: ['claimed', 'collected', 'delivered'], required: true },
  },
  { timestamps: true },
);

assignmentSchema.index({ collector: 1, status: 1 });
export const Assignment = model('Assignment', assignmentSchema);
