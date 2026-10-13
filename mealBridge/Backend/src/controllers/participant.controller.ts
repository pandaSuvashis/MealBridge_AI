import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { serializeRecipient } from '../services/serializer.service.js';

export async function listParticipants(req: Request, res: Response) {
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  const filter: Record<string, unknown> = role ? { role } : { role: { $in: ['ngo', 'volunteer'] } };
  const participants = await User.find(filter).sort({ activeStatus: 1, reliabilityScore: -1, name: 1 });
  res.json({ success: true, data: participants.map(serializeRecipient) });
}
