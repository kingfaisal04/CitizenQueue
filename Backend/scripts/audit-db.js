import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import mongoose from 'mongoose';
import {
  User,
  School,
  Student,
  Admission,
  Prospectus,
  Document,
  Service,
  AppointmentSlot,
  Appointment,
  AuditLog,
} from '../models/index.js';

async function audit() {
  console.log('--- CITIZENQUEUE DATABASE AUDIT ---');
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Successfully connected to MongoDB Atlas.\n');

  const counts = {
    users: await User.countDocuments(),
    schools: await School.countDocuments(),
    students: await Student.countDocuments(),
    admissions: await Admission.countDocuments(),
    prospectuses: await Prospectus.countDocuments(),
    documents: await Document.countDocuments(),
    services: await Service.countDocuments(),
    appointmentSlots: await AppointmentSlot.countDocuments(),
    appointments: await Appointment.countDocuments(),
    auditLogs: await AuditLog.countDocuments(),
  };

  console.log('Document counts in MongoDB Atlas:');
  console.table(counts);

  // Check demo user
  const demoStudent = await User.findOne({ email: 'kwame.mensah@example.com' }).select('+password');
  console.log('\nDemo Student User:', demoStudent ? {
    id: demoStudent._id,
    name: demoStudent.name,
    email: demoStudent.email,
    role: demoStudent.role,
    hasPassword: Boolean(demoStudent.password)
  } : 'NOT FOUND');

  const demoAdmin = await User.findOne({ email: 'admin@achimota.edu.gh' }).select('+password');
  console.log('Demo Admin User:', demoAdmin ? {
    id: demoAdmin._id,
    name: demoAdmin.name,
    email: demoAdmin.email,
    role: demoAdmin.role,
    schoolId: demoAdmin.schoolId,
    hasPassword: Boolean(demoAdmin.password)
  } : 'NOT FOUND');

  // Check slots
  const sampleSlot = await AppointmentSlot.findOne({ schoolId: 'inst-1' });
  console.log('\nSample Capacity Slot:', sampleSlot ? {
    slotId: sampleSlot.slotId,
    serviceId: sampleSlot.serviceId,
    date: sampleSlot.date,
    time: sampleSlot.time,
    capacity: sampleSlot.capacity,
    bookedCount: sampleSlot.bookedCount
  } : 'NO SLOTS FOUND');

  await mongoose.disconnect();
  console.log('\nAudit complete. Disconnected.');
}

audit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
