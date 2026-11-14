import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
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
} from '../models/index.js';

const SEED_SCHOOLS = [
  {
    schoolId: 'inst-1',
    name: 'Achimota Senior High School',
    shortName: 'Achimota School',
    category: 'Senior High School',
    region: 'Greater Accra Region',
    city: 'Accra',
    address: 'Achimota Forest Area, off Achimota-Legon Road',
    contactEmail: 'admissions@achimota.edu.gh',
    contactPhone: '+233 30 240 0123',
    operatingHours: 'Monday – Friday: 8:00 AM – 3:30 PM',
    status: 'active',
  },
  {
    schoolId: 'inst-2',
    name: 'Prempeh College',
    shortName: 'Prempeh College',
    category: 'Senior High School',
    region: 'Ashanti Region',
    city: 'Kumasi',
    address: 'Sofoline, Kumasi West',
    contactEmail: 'registry@prempeh.edu.gh',
    contactPhone: '+233 32 202 4567',
    operatingHours: 'Monday – Friday: 8:00 AM – 4:00 PM',
    status: 'active',
  },
  {
    schoolId: 'inst-3',
    name: 'University of Ghana — Academic Affairs Directorate',
    shortName: 'Univ of Ghana (Legon)',
    category: 'Tertiary Institution',
    region: 'Greater Accra Region',
    city: 'Legon, Accra',
    address: 'Central Administration Block, University of Ghana, Legon Campus',
    contactEmail: 'admissions@ug.edu.gh',
    contactPhone: '+233 30 250 1234',
    operatingHours: 'Monday – Friday: 8:30 AM – 4:30 PM',
    status: 'active',
  },
  {
    schoolId: 'inst-4',
    name: 'Kwame Nkrumah University of Science & Technology (KNUST)',
    shortName: 'KNUST Academic Registry',
    category: 'Tertiary Institution',
    region: 'Ashanti Region',
    city: 'Kumasi',
    address: 'Commercial Area / Great Hall Complex, KNUST Campus',
    contactEmail: 'academic@knust.edu.gh',
    contactPhone: '+233 32 206 0001',
    operatingHours: 'Monday – Friday: 8:00 AM – 4:00 PM',
    status: 'active',
  },
  {
    schoolId: 'inst-5',
    name: 'Tamale Senior High School (Tamasco)',
    shortName: 'Tamasco',
    category: 'Senior High School',
    region: 'Northern Region',
    city: 'Tamale',
    address: 'Education Ridge, Tamale Central',
    contactEmail: 'info@tamasco.edu.gh',
    contactPhone: '+233 37 202 2345',
    operatingHours: 'Monday – Friday: 8:00 AM – 3:00 PM',
    status: 'active',
  },
];

const SEED_SERVICES = [
  {
    serviceId: 'srv-101',
    schoolId: 'inst-1',
    institutionId: 'inst-1',
    institutionName: 'Achimota Senior High School',
    name: 'Fresh SHS Students Admission Completion',
    category: 'Admissions & Enrollment',
    description: 'Official verification of CSSPS placement results slip, BECE raw scores, and collection of student prospectus and house allocation letter.',
    location: 'Administration Block, Assembly Hall Annex, Desk 3',
    durationMinutes: 20,
    isActive: true,
  },
  {
    serviceId: 'srv-102',
    schoolId: 'inst-1',
    institutionId: 'inst-1',
    institutionName: 'Achimota Senior High School',
    name: 'Student Biometric Identity Capture & Enrolment',
    category: 'Identity & Registration',
    description: 'Digital photograph and biometric enrolment for issuance of permanent institutional smart identity card.',
    location: 'ICT Center, Lab 2, Workstation B',
    durationMinutes: 15,
    isActive: true,
  },
  {
    serviceId: 'srv-103',
    schoolId: 'inst-1',
    institutionId: 'inst-1',
    institutionName: 'Achimota Senior High School',
    name: 'Academic Transcripts & Official Testimonials Processing',
    category: 'Academic Records',
    description: 'Official processing and certified dispatch of student academic transcripts and recommendation letters.',
    location: 'Registry Counter 4, Main Admin Block',
    durationMinutes: 25,
    isActive: true,
  },
  {
    serviceId: 'srv-104',
    schoolId: 'inst-2',
    institutionId: 'inst-2',
    institutionName: 'Prempeh College',
    name: 'CSSPS Placement Onboarding & House Placement',
    category: 'Admissions & Enrollment',
    description: 'Validation of placement forms and boarding house room allocation for incoming first-year students.',
    location: 'Osei Tutu II Assembly Hall',
    durationMinutes: 20,
    isActive: true,
  },
];

const SEED_PROSPECTUS = [
  {
    itemId: 'pr-101',
    schoolId: 'inst-1',
    name: 'Official School Uniform (Khaki Shorts & Crested Shirts)',
    category: 'Clothing and Uniforms',
    specification: 'Official school crested shirt with standard khaki shorts/trousers as approved by the school store.',
    quantity: '3 sets',
    requiresPhotoReview: true,
    isFreeGesItem: false,
    targetGender: 'all',
  },
  {
    itemId: 'pr-102',
    schoolId: 'inst-1',
    name: 'Bedding Set (Bed sheet, Pillow & Cases)',
    category: 'Bedding',
    specification: 'Official house colour bed sheet set with designated house stripes and cotton pillow.',
    quantity: '2 sets',
    requiresPhotoReview: true,
    isFreeGesItem: false,
    targetGender: 'all',
  },
  {
    itemId: 'pr-103',
    schoolId: 'inst-1',
    name: 'Government Free SHS Exercise Books & Core Textbooks',
    category: 'Academic Materials',
    specification: 'GES provided core textbooks (English, Mathematics, Integrated Science, Social Studies) and exercise books.',
    quantity: '1 complete pack',
    requiresPhotoReview: false,
    isFreeGesItem: true,
    providedBy: 'Free Senior High School Secretariat / Ministry of Education',
    targetGender: 'all',
  },
  {
    itemId: 'pr-104',
    schoolId: 'inst-1',
    name: 'Standard Metal Trunk & Chop Box',
    category: 'Storage Items',
    specification: 'Standard galvanized metal trunk (36 x 18 x 14 inches) with padlock and wooden chop box.',
    quantity: '1 each',
    requiresPhotoReview: true,
    isFreeGesItem: false,
    targetGender: 'all',
  },
  {
    itemId: 'pr-105',
    schoolId: 'inst-1',
    name: 'Sanitary & Toiletries Kit',
    category: 'Toiletries',
    specification: 'Bucket, scrubbing brush, bathing soap, washing soap, toothpaste, toothbrush, and towels.',
    quantity: '1 kit',
    requiresPhotoReview: false,
    isFreeGesItem: false,
    targetGender: 'all',
  },
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[SEED] Starting CitizenQueue database seeding...');

    // Clear existing collections
    await School.deleteMany({});
    await Service.deleteMany({});
    await AppointmentSlot.deleteMany({});
    await Prospectus.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Admission.deleteMany({});
    await Document.deleteMany({});
    await Appointment.deleteMany({});

    // 1. Seed Schools
    const createdSchools = await School.insertMany(SEED_SCHOOLS);
    console.log(`[SEED] Seeded ${createdSchools.length} educational institutions.`);

    // 2. Seed Services
    const createdServices = await Service.insertMany(SEED_SERVICES);
    console.log(`[SEED] Seeded ${createdServices.length} institutional services.`);

    // 3. Seed Prospectus
    const createdProspectus = await Prospectus.insertMany(SEED_PROSPECTUS);
    console.log(`[SEED] Seeded ${createdProspectus.length} digital prospectus requirements.`);

    // 4. Seed Slots for the next 14 days
    const slotTimes = ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '01:00 PM', '02:00 PM'];
    const slotsToInsert = [];

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      for (const svc of createdServices) {
        for (const t of slotTimes) {
          slotsToInsert.push({
            school: svc.school,
            schoolId: svc.schoolId,
            service: svc._id,
            serviceId: svc.serviceId,
            slotId: `slot-${svc.serviceId}-${dateStr}-${t.replace(/[^a-zA-Z0-9]/g, '')}`,
            date: dateStr,
            time: t,
            capacity: 25,
            bookedCount: 0,
            isActive: true,
          });
        }
      }
    }
    await AppointmentSlot.insertMany(slotsToInsert);
    console.log(`[SEED] Seeded ${slotsToInsert.length} appointment capacity slots.`);

    // 5. Seed Administrative Users
    const achimota = createdSchools.find((s) => s.schoolId === 'inst-1');
    const prempeh = createdSchools.find((s) => s.schoolId === 'inst-2');

    const adminUser = new User({
      name: 'Admissions Administrator',
      email: 'admin@achimota.edu.gh',
      phone: '+233 24 000 0001',
      password: 'Password123!',
      role: 'admin',
      school: achimota._id,
      schoolId: 'inst-1',
      staffId: 'ACH-ADM-01',
      designation: 'Head of Admissions',
      department: 'Admissions & Records',
      accountStatus: 'active',
      emailVerified: true,
    });
    await adminUser.save();

    const financeOfficer = new User({
      name: 'Kofi Owusu',
      email: 'finance@achimota.edu.gh',
      phone: '+233 24 000 0002',
      password: 'Password123!',
      role: 'finance_officer',
      school: achimota._id,
      schoolId: 'inst-1',
      staffId: 'ACH-FIN-01',
      designation: 'Finance Officer',
      department: 'Bursary & Accounts',
      accountStatus: 'active',
      emailVerified: true,
    });
    await financeOfficer.save();

    const academicOfficer = new User({
      name: 'Grace Darko',
      email: 'academic@achimota.edu.gh',
      phone: '+233 24 000 0003',
      password: 'Password123!',
      role: 'academic_officer',
      school: achimota._id,
      schoolId: 'inst-1',
      staffId: 'ACH-ACA-01',
      designation: 'Academic Affairs Officer',
      department: 'Academic Office',
      accountStatus: 'active',
      emailVerified: true,
    });
    await academicOfficer.save();

    const prempehAdmin = new User({
      name: 'Prempeh Administrator',
      email: 'admin@prempeh.edu.gh',
      phone: '+233 24 000 0004',
      password: 'Password123!',
      role: 'admin',
      school: prempeh._id,
      schoolId: 'inst-2',
      staffId: 'PRM-ADM-01',
      designation: 'Registry Head',
      department: 'Administration',
      accountStatus: 'active',
      emailVerified: true,
    });
    await prempehAdmin.save();

    console.log('[SEED] Seeded institutional administrators for Achimota and Prempeh.');

    // 6. Seed Student User (Emmanuel Mensah)
    const studentUser = new User({
      name: 'Emmanuel Mensah',
      email: 'kwame.mensah@example.com',
      phone: '+233 24 411 2233',
      password: 'Password123!',
      role: 'student',
      school: achimota._id,
      schoolId: 'inst-1',
      accountStatus: 'active',
      emailVerified: true,
    });
    await studentUser.save();

    const student = new Student({
      user: studentUser._id,
      school: achimota._id,
      schoolId: 'inst-1',
      assignedSchool: 'Achimota Senior High School',
      beceIndexNumber: '101245089',
      fullName: 'Emmanuel Mensah',
      gender: 'Male',
      dateOfBirth: '2010-04-15',
      programme: 'General Science',
      residentialStatus: 'Boarding',
      aggregateScore: '08',
      juniorHighSchool: "St. Theresa's Basic School, Kaneshie",
      homeTown: 'Kasoa, Central Region',
      placementBatch: 'CSSPS 2026 Batch A',
      guardianName: 'Kwame Mensah',
      guardianPhone: '+233 24 411 2233',
      guardianEmail: 'kwame.mensah@example.com',
      guardianRelation: 'Father',
      placementSlipUploaded: true,
      placementSlipFileName: 'cssps_placement_slip_101245089.pdf',
      notes: 'Placed in General Science with Boarding status at Achimota School.',
      isComplete: true,
    });
    await student.save();

    // 7. Seed Student Documents
    const seedDocs = [
      {
        student: student._id,
        school: achimota._id,
        schoolId: 'inst-1',
        documentRequirementId: 'doc-1',
        name: 'CSSPS Placement Slip',
        category: 'Placement & Enrollment',
        required: true,
        status: 'provisionally_accepted',
        fileName: 'cssps_placement_slip_101245089.pdf',
        fileSize: '1.2 MB',
        fileSizeBytes: 1258291,
        mimeType: 'application/pdf',
        storageKey: `students/${student._id}/placement_slip/cssps_placement_slip_101245089.pdf`,
        fileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60',
        uploadedAt: new Date(Date.now() - 3600000 * 24),
        reviewedAt: new Date(),
        reviewedBy: adminUser._id,
        adminFeedback: 'Placement confirmed for General Science (Boarding). Serial barcode is legible.',
      },
      {
        student: student._id,
        school: achimota._id,
        schoolId: 'inst-1',
        documentRequirementId: 'doc-2',
        name: 'BECE Official Results Slip',
        category: 'Academic Records',
        required: true,
        status: 'provisionally_accepted',
        fileName: 'bece_results_certified_101245089.pdf',
        fileSize: '1.8 MB',
        fileSizeBytes: 1887436,
        mimeType: 'application/pdf',
        storageKey: `students/${student._id}/bece_results/bece_results_certified_101245089.pdf`,
        fileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60',
        uploadedAt: new Date(Date.now() - 3600000 * 24),
        reviewedAt: new Date(),
        reviewedBy: adminUser._id,
        adminFeedback: 'Verified with WAEC certified grading. Raw score 488 confirmed.',
      },
      {
        student: student._id,
        school: achimota._id,
        schoolId: 'inst-1',
        documentRequirementId: 'doc-3',
        name: 'Student Medical Examination Report',
        category: 'Health & Welfare',
        required: true,
        status: 'under_review',
        fileName: 'korle_bu_medical_form_101245089.pdf',
        fileSize: '2.4 MB',
        fileSizeBytes: 2516582,
        mimeType: 'application/pdf',
        storageKey: `students/${student._id}/medical/korle_bu_medical_form_101245089.pdf`,
        fileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60',
        uploadedAt: new Date(Date.now() - 3600000 * 5),
        adminFeedback: 'Under review by School Resident Nurse. Lab test results being cross-checked.',
      },
      {
        student: student._id,
        school: achimota._id,
        schoolId: 'inst-1',
        documentRequirementId: 'doc-4',
        name: 'Birth Certificate or Ghana Card Copy',
        category: 'Identification',
        required: true,
        status: 'provisionally_accepted',
        fileName: 'birth_cert_republic_of_ghana.pdf',
        fileSize: '950 KB',
        fileSizeBytes: 972800,
        mimeType: 'application/pdf',
        storageKey: `students/${student._id}/identification/birth_cert_republic_of_ghana.pdf`,
        fileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60',
        uploadedAt: new Date(Date.now() - 3600000 * 20),
        reviewedAt: new Date(),
        reviewedBy: adminUser._id,
        adminFeedback: 'Birth Certificate Registry number matches biodata.',
      },
      {
        student: student._id,
        school: achimota._id,
        schoolId: 'inst-1',
        documentRequirementId: 'doc-5',
        name: 'Passport-Size Photographs (White Background)',
        category: 'Identity & Bio-data',
        required: true,
        status: 'not_submitted',
      },
    ];
    await Document.insertMany(seedDocs);

    // 8. Seed Admission
    const admission = new Admission({
      student: student._id,
      school: achimota._id,
      schoolId: 'inst-1',
      beceIndexNumber: '101245089',
      currentStage: 5,
      readinessScore: 68,
      registrationStatus: 'ready_for_reporting',
      stages: [
        { stage: 1, title: 'CSSPS Placement Accepted', isCompleted: true, completedAt: new Date(Date.now() - 3600000 * 48) },
        { stage: 2, title: 'Biodata & Guardian Verification', isCompleted: true, completedAt: new Date(Date.now() - 3600000 * 36) },
        { stage: 3, title: 'Mandatory Document Upload', isCompleted: true, completedAt: new Date(Date.now() - 3600000 * 24) },
        { stage: 4, title: 'Institutional Document Review', isCompleted: true, completedAt: new Date(Date.now() - 3600000 * 12) },
        { stage: 5, title: 'Digital Prospectus Item Acquisition', isCompleted: false, completedAt: null },
        { stage: 6, title: 'Items Visual Inspection & Clearance', isCompleted: false, completedAt: null },
        { stage: 7, title: 'Capacity & Arrival Appointment Scheduled', isCompleted: false, completedAt: null },
        { stage: 8, title: 'Physical Desk Clearance & Enrollment', isCompleted: false, completedAt: null },
        { stage: 9, title: 'Official SHS Enrolment Confirmed', isCompleted: false, completedAt: null },
      ],
      prospectusStatuses: [
        { itemId: 'pr-101', purchased: true, photoStatus: 'provisionally_accepted', photoName: 'uniform_verification.jpg' },
        { itemId: 'pr-102', purchased: true, photoStatus: 'awaiting_review', photoName: 'bedding_set.jpg' },
        { itemId: 'pr-103', purchased: true, photoStatus: 'provisionally_accepted' },
        { itemId: 'pr-104', purchased: false, photoStatus: 'not_submitted' },
        { itemId: 'pr-105', purchased: true, photoStatus: 'provisionally_accepted' },
      ],
    });
    await admission.save();

    console.log('[SEED] Seeded student Emmanuel Mensah with documents, prospectus status, and admission progression.');
    console.log('[SEED] Database seeding completed successfully!');
  } catch (err) {
    console.error('[SEED ERROR] Seeding failed:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

// Execute if run directly
if (process.argv[1]?.endsWith('seedDatabase.js')) {
  seedDatabase();
}
