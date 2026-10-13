import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { Assignment } from '../models/Assignment.js';
import { generatePickupCode, hashPickupCode } from '../utils/pickupCode.js';

async function seed() {
  await connectDatabase();
  if (await User.countDocuments()) {
    console.log('Seed skipped: participants already exist. The script never creates duplicates.');
    return;
  }
  const [donor, robinHood, iiitCell, feedingIndia, annamSeva] = await User.create([
    { name: 'Chef Ramanujan', role: 'donor', organization: 'IIIT Bakul Central Mess', location: 'IIIT Campus' },
    { name: 'Robin Hood Army — Gachibowli Chapter', role: 'ngo', organization: 'Robin Hood Army', location: 'Gachibowli & Financial District', recipientType: 'NGO', collectionCapacityKg: 65, distanceKm: 1.4, vehicleType: 'Van / Mini-Truck', activeStatus: 'Available', reliabilityScore: 98, contactPerson: 'Aditi Sharma', contactPhone: '+91 98490 23145' },
    { name: 'IIIT Hyderabad Student Food Rescue Cell', role: 'volunteer', organization: 'IIIT Hyderabad', location: 'Campus Perimeter & Old Gachibowli', recipientType: 'Student Volunteer', collectionCapacityKg: 25, distanceKm: 0.6, vehicleType: 'E-Bike / Cargo', activeStatus: 'Available', reliabilityScore: 94, contactPerson: 'Rahul Varma', contactPhone: '+91 97011 88320' },
    { name: 'Feeding India — Cyberabad Rapid Response', role: 'ngo', organization: 'Feeding India', location: 'HITEC City & Madhapur', recipientType: 'NGO', collectionCapacityKg: 85, distanceKm: 2.8, vehicleType: 'Auto-Rickshaw', activeStatus: 'Available', reliabilityScore: 96, contactPerson: 'Srinivas Rao', contactPhone: '+91 94402 77109' },
    { name: 'Annam Seva Trust Community Kitchen', role: 'ngo', organization: 'Annam Seva Trust', location: 'Lingampally / UoH Gate', recipientType: 'Feeding Center', collectionCapacityKg: 110, distanceKm: 4.1, vehicleType: 'Van / Mini-Truck', activeStatus: 'Available', reliabilityScore: 95, contactPerson: 'K. Venkateshwarlu', contactPhone: '+91 98855 33019' },
  ]);
  const now = Date.now();
  const date = (minutes: number) => new Date(now + minutes * 60_000);
  const base = { donor: donor._id, donorName: 'IIIT Bakul Central Mess', donorType: 'Campus Mess' as const, preparationTime: date(-90), foodNotes: 'Packed in clean food-grade containers.' };
  const currentCode = generatePickupCode();
  const claimedAt = date(-20);
  const donations = await Donation.create([
    { ...base, foodName: 'Nutritious Veg Pulao & Tadka Dal', category: 'Prepared Meals', quantityKg: 28, pickupLocation: 'Ground Floor Dispatch Dock, IIIT Campus', locationArea: 'IIIT Campus', pickupDeadline: date(45) },
    { ...base, foodName: 'Fresh Tawa Roti & Paneer Butter Masala', category: 'Prepared Meals', quantityKg: 19, pickupLocation: 'Rear Kitchen Counter, Palash Building', locationArea: 'IIIT Campus', pickupDeadline: date(95) },
    { ...base, foodName: 'Evening Artisan Bread, Buns & Croissants', category: 'Bakery & Bread', quantityKg: 16, pickupLocation: 'DLF CyberCity Branch, Street 1', locationArea: 'DLF Food Street', pickupDeadline: date(240) },
    { ...base, foodName: 'Hyderabadi Vegetable Dum Biryani', category: 'Prepared Meals', quantityKg: 34, pickupLocation: 'Kitchen Loading Bay, UoH Campus Gate 1', locationArea: 'Gachibowli', pickupDeadline: date(60), status: 'claimed', pickupCodeHash: hashPickupCode(currentCode), claimedBy: { collector: robinHood._id, name: robinHood.name, type: 'NGO', claimedAt } },
    { ...base, foodName: 'Conference Lunch Buffet Surplus', category: 'Prepared Meals', quantityKg: 42, pickupLocation: 'T-Hub 2.0 Banquets Floor', locationArea: 'HITEC City', pickupDeadline: date(-300), status: 'delivered', claimedBy: { collector: feedingIndia._id, name: feedingIndia.name, type: 'NGO', claimedAt: date(-480) }, collectedAt: date(-420), deliveredAt: date(-360) },
    { ...base, foodName: 'Morning Breakfast Idli & Wada', category: 'Prepared Meals', quantityKg: 24, pickupLocation: 'Bakul Nivas Mess Hall', locationArea: 'IIIT Campus', pickupDeadline: date(-480), status: 'delivered', claimedBy: { collector: annamSeva._id, name: annamSeva.name, type: 'Feeding Center', claimedAt: date(-660) }, collectedAt: date(-600), deliveredAt: date(-540) },
  ]);
  await Assignment.create({ donation: donations[3]._id, collector: robinHood._id, pickupCodeHash: hashPickupCode(currentCode), assignedAt: claimedAt, status: 'claimed' });
  console.log(`Seeded ${donations.length} donations and 5 demo participants.`);
}

seed().catch((error) => { console.error('Seed failed:', error); process.exitCode = 1; }).finally(() => setTimeout(() => process.exit(), 0));
