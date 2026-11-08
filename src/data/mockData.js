/**
 * CitizenQueue - Demonstration Mock Data
 * 
 * IMPORTANT: This dataset contains fictional demonstration data representing
 * educational institutions and services in Ghana (e.g. Senior High School and
 * University admissions). No real appointments or actual queue slots are booked.
 */

export const INITIAL_INSTITUTIONS = [
  {
    id: "inst-1",
    name: "Achimota Senior High School",
    shortName: "Achimota School",
    category: "Senior High School",
    region: "Greater Accra Region",
    city: "Accra",
    address: "Achimota Forest Area, off Achimota-Legon Road",
    contactEmail: "admissions-demo@achimota.edu.gh",
    contactPhone: "+233 30 240 0123",
    operatingHours: "Monday – Friday: 8:00 AM – 3:30 PM",
    badge: "Public Secondary",
    verified: true,
    description: "Co-educational boarding and day senior high school facilitating CSSPS admissions verification and new student registration."
  },
  {
    id: "inst-2",
    name: "Prempeh College",
    shortName: "Prempeh College",
    category: "Senior High School",
    region: "Ashanti Region",
    city: "Kumasi",
    address: "Sofoline, Kumasi West",
    contactEmail: "registry-demo@prempeh.edu.gh",
    contactPhone: "+233 32 202 4567",
    operatingHours: "Monday – Friday: 8:00 AM – 4:00 PM",
    badge: "Public Secondary",
    verified: true,
    description: "Public senior high school providing structured document validation and boarding house placement clearance."
  },
  {
    id: "inst-3",
    name: "University of Ghana — Academic Affairs Directorate",
    shortName: "Univ of Ghana (Legon)",
    category: "Tertiary Institution",
    region: "Greater Accra Region",
    city: "Legon, Accra",
    address: "Central Administration Block, University of Ghana, Legon Campus",
    contactEmail: "admissions-demo@ug.edu.gh",
    contactPhone: "+233 30 250 1234",
    operatingHours: "Monday – Friday: 8:30 AM – 4:30 PM",
    badge: "Public University",
    verified: true,
    description: "Undergraduate and postgraduate admission verification, student identification issuance, and transcript processing."
  },
  {
    id: "inst-4",
    name: "Kwame Nkrumah University of Science & Technology (KNUST)",
    shortName: "KNUST Academic Registry",
    category: "Tertiary Institution",
    region: "Ashanti Region",
    city: "Kumasi",
    address: "Commercial Area / Great Hall Complex, KNUST Campus",
    contactEmail: "academic-demo@knust.edu.gh",
    contactPhone: "+233 32 206 0001",
    operatingHours: "Monday – Friday: 8:00 AM – 4:00 PM",
    badge: "Public University",
    verified: true,
    description: "Fresh student bio-data capture, hall of residence registration, and academic clearance services."
  },
  {
    id: "inst-5",
    name: "Tamale Senior High School (Tamasco)",
    shortName: "Tamasco",
    category: "Senior High School",
    region: "Northern Region",
    city: "Tamale",
    address: "Education Ridge, Tamale Central",
    contactEmail: "info-demo@tamasco.edu.gh",
    contactPhone: "+233 37 202 2345",
    operatingHours: "Monday – Friday: 8:00 AM – 3:00 PM",
    badge: "Public Secondary",
    verified: true,
    description: "Secondary education institution coordinating Northern sector CSSPS placement onboarding and verification."
  }
];

export const INITIAL_SERVICES = [
  {
    id: "srv-101",
    institutionId: "inst-1",
    institutionName: "Achimota Senior High School",
    name: "Fresh SHS Students Admission Completion",
    category: "Admissions & Enrollment",
    description: "Official verification of Computerized School Selection & Placement System (CSSPS) placement results slip, verification of BECE raw scores, and collection of student prospectus and house allocation letter.",
    location: "Administration Block, Assembly Hall Annex, Desk 3",
    durationMinutes: 20,
    isActive: true,
    hasAvailability: true,
    delayNotice: "High morning traffic expected between 9:00 AM and 10:30 AM due to network validation checks. Please arrive 15 minutes before your time slot.",
    requirements: [
      "Original & 2 photocopies of CSSPS Placement Slip",
      "Original BECE Results Slip (Certified)",
      "Student Birth Certificate or Valid Ghana Card copy",
      "Completed National Health Insurance (NHIS) card photocopy",
      "4 recent passport-size photographs (White background)",
      "Parent/Guardian valid Photo ID (Ghana Card preferred)"
    ],
    instructions: "Please ensure all photocopies are neatly arranged in a brown envelope before arriving at the check-in desk. Both student and guardian should be present.",
    cancellationPolicy: "Appointments may be rescheduled or cancelled up to 2 hours before the scheduled time slot without penalty."
  },
  {
    id: "srv-102",
    institutionId: "inst-1",
    institutionName: "Achimota Senior High School",
    name: "School Certificate & Official Transcript Request",
    category: "Records & Certification",
    description: "Collection of official WASSCE certificates, certified letter of completion, and academic transcripts for alumni.",
    location: "Records Office, Main Administration Room 12",
    durationMinutes: 15,
    isActive: true,
    hasAvailability: true,
    delayNotice: null,
    requirements: [
      "Valid National Photo ID (Ghana Card, Passport, or Voter ID)",
      "Original WASSCE index number and completion year details",
      "Proof of payment of transcript processing fee from school accounts",
      "Signed authorization letter if collecting on behalf of alumnus"
    ],
    instructions: "Present your digital confirmation reference at the security gate to obtain visitor tags.",
    cancellationPolicy: "Can be cancelled or rescheduled up to 4 hours in advance."
  },
  {
    id: "srv-103",
    institutionId: "inst-2",
    institutionName: "Prempeh College",
    name: "CSSPS Placement Verification & Boarding House Allocation",
    category: "Admissions & Enrollment",
    description: "Document validation for newly placed Day and Boarding students, measurement for official school uniform, and residential house documentation.",
    location: "Osae Assembly Hall, Desk B",
    durationMinutes: 25,
    isActive: true,
    hasAvailability: true,
    delayNotice: null,
    requirements: [
      "Official CSSPS Placement Form with authentication barcode",
      "Original BECE Certificate / Result Slip",
      "Medical fitness report signed by a registered medical practitioner",
      "Two copies of parent or guardian Ghana Card",
      "4 recent passport photographs with student name written on the reverse"
    ],
    instructions: "Students must wear their junior high school uniform during this verification exercise.",
    cancellationPolicy: "Rescheduling allowed up to 3 hours prior to selected slot."
  },
  {
    id: "srv-104",
    institutionId: "inst-3",
    institutionName: "University of Ghana — Academic Affairs Directorate",
    name: "Fresh Undergraduate Biometric Student ID & Document Verification",
    category: "Identity & Registration",
    description: "In-person biometric capture, verification of admission letter and fee payment receipts, and immediate student ID card printing for level 100 students.",
    location: "Balme Library Annex, Digital Registration Center",
    durationMinutes: 15,
    isActive: true,
    hasAvailability: true,
    delayNotice: "Biometric servers undergoing routine synchronization at 12:00 PM; expect slight queuing during lunch hours.",
    requirements: [
      "Printed University of Ghana Provisional Admission Letter",
      "Bank deposit slip or online provisional fee receipt",
      "Ghana Card (National Identification Card) - Original",
      "WASSCE Certificate or Certified Statement of Result",
      "Proof of residential room allocation (if resident student)"
    ],
    instructions: "Arrive at the digital center entrance 10 minutes before your slot. Please dress neatly as a live photo will be captured for your permanent ID.",
    cancellationPolicy: "Can be rescheduled up to 1 hour before scheduled time."
  },
  {
    id: "srv-105",
    institutionId: "inst-4",
    institutionName: "Kwame Nkrumah University of Science & Technology (KNUST)",
    name: "Fresh Student Academic Clearance & Medical Examination",
    category: "Health & Clearance",
    description: "Compulsory entry health screening, chest X-ray validation, and final academic dossier validation for admitted undergraduate students.",
    location: "University Health Services Directorate (Hospital Road)",
    durationMinutes: 30,
    isActive: true,
    hasAvailability: true,
    delayNotice: null,
    requirements: [
      "KNUST Admission Offer Letter",
      "Completed Health Questionnaire Form (Form UHS-1)",
      "Standard Laboratory Test Results from an accredited facility",
      "Valid Student ID or National Photo Identification",
      "Two passport-sized photos"
    ],
    instructions: "Fast for 2 hours prior if your medical checklist includes fasting glucose checks.",
    cancellationPolicy: "24-hour notice requested for cancellations to permit slot reallocation."
  },
  {
    id: "srv-106",
    institutionId: "inst-5",
    institutionName: "Tamale Senior High School (Tamasco)",
    name: "Northern Sector SHS Admission Verification",
    category: "Admissions & Enrollment",
    description: "Verification of CSSPS self-placement and automatic placement records for Northern, Savannah, and North East regions candidates.",
    location: "Main Staff Common Room Block",
    durationMinutes: 20,
    isActive: true,
    hasAvailability: false, // Honest availability testing: currently no open slots
    delayNotice: "Admissions portal currently undergoing seat quota re-alignment. New appointment windows will open on next Monday.",
    requirements: [
      "CSSPS Placement Sheet with verified serial number",
      "BECE certified result slip",
      "Junior High School Headteacher's attestation testimonial",
      "Parent or legal guardian consent form"
    ],
    instructions: "Demonstration alert: This service is currently at maximum capacity. Check back for newly released time slots.",
    cancellationPolicy: "Cancellation is currently not applicable."
  }
];

export const INITIAL_AVAILABILITY = {
  "srv-101": [
    {
      date: "2026-10-27",
      slots: [
        { id: "slot-101-1", time: "08:30 AM", capacity: 8, bookedCount: 5 },
        { id: "slot-101-2", time: "09:30 AM", capacity: 8, bookedCount: 8 }, // Full slot
        { id: "slot-101-3", time: "10:30 AM", capacity: 8, bookedCount: 3 },
        { id: "slot-101-4", time: "11:30 AM", capacity: 8, bookedCount: 6 },
        { id: "slot-101-5", time: "01:30 PM", capacity: 8, bookedCount: 2 },
        { id: "slot-101-6", time: "02:30 PM", capacity: 6, bookedCount: 1 }
      ]
    },
    {
      date: "2026-10-28",
      slots: [
        { id: "slot-101-7", time: "08:30 AM", capacity: 8, bookedCount: 2 },
        { id: "slot-101-8", time: "09:30 AM", capacity: 8, bookedCount: 4 },
        { id: "slot-101-9", time: "10:30 AM", capacity: 8, bookedCount: 1 },
        { id: "slot-101-10", time: "11:30 AM", capacity: 8, bookedCount: 0 },
        { id: "slot-101-11", time: "01:30 PM", capacity: 8, bookedCount: 3 },
        { id: "slot-101-12", time: "02:30 PM", capacity: 6, bookedCount: 0 }
      ]
    },
    {
      date: "2026-10-29",
      slots: [
        { id: "slot-101-13", time: "08:30 AM", capacity: 8, bookedCount: 1 },
        { id: "slot-101-14", time: "09:30 AM", capacity: 8, bookedCount: 2 },
        { id: "slot-101-15", time: "10:30 AM", capacity: 8, bookedCount: 0 },
        { id: "slot-101-16", time: "11:30 AM", capacity: 8, bookedCount: 0 }
      ]
    }
  ],
  "srv-102": [
    {
      date: "2026-10-27",
      slots: [
        { id: "slot-102-1", time: "09:00 AM", capacity: 5, bookedCount: 2 },
        { id: "slot-102-2", time: "10:00 AM", capacity: 5, bookedCount: 5 }, // Full
        { id: "slot-102-3", time: "11:00 AM", capacity: 5, bookedCount: 1 },
        { id: "slot-102-4", time: "02:00 PM", capacity: 5, bookedCount: 0 }
      ]
    },
    {
      date: "2026-10-28",
      slots: [
        { id: "slot-102-5", time: "09:00 AM", capacity: 5, bookedCount: 0 },
        { id: "slot-102-6", time: "10:00 AM", capacity: 5, bookedCount: 1 },
        { id: "slot-102-7", time: "11:00 AM", capacity: 5, bookedCount: 0 }
      ]
    }
  ],
  "srv-103": [
    {
      date: "2026-10-27",
      slots: [
        { id: "slot-103-1", time: "08:30 AM", capacity: 10, bookedCount: 6 },
        { id: "slot-103-2", time: "10:00 AM", capacity: 10, bookedCount: 7 },
        { id: "slot-103-3", time: "11:30 AM", capacity: 10, bookedCount: 4 },
        { id: "slot-103-4", time: "01:30 PM", capacity: 10, bookedCount: 10 } // Full
      ]
    },
    {
      date: "2026-10-28",
      slots: [
        { id: "slot-103-5", time: "08:30 AM", capacity: 10, bookedCount: 3 },
        { id: "slot-103-6", time: "10:00 AM", capacity: 10, bookedCount: 2 },
        { id: "slot-103-7", time: "11:30 AM", capacity: 10, bookedCount: 1 }
      ]
    }
  ],
  "srv-104": [
    {
      date: "2026-10-27",
      slots: [
        { id: "slot-104-1", time: "09:00 AM", capacity: 12, bookedCount: 11 },
        { id: "slot-104-2", time: "10:00 AM", capacity: 12, bookedCount: 9 },
        { id: "slot-104-3", time: "11:00 AM", capacity: 12, bookedCount: 12 }, // Full
        { id: "slot-104-4", time: "01:00 PM", capacity: 12, bookedCount: 5 },
        { id: "slot-104-5", time: "02:00 PM", capacity: 12, bookedCount: 4 }
      ]
    },
    {
      date: "2026-10-28",
      slots: [
        { id: "slot-104-6", time: "09:00 AM", capacity: 12, bookedCount: 4 },
        { id: "slot-104-7", time: "10:00 AM", capacity: 12, bookedCount: 2 },
        { id: "slot-104-8", time: "11:00 AM", capacity: 12, bookedCount: 1 },
        { id: "slot-104-9", time: "01:00 PM", capacity: 12, bookedCount: 0 }
      ]
    }
  ],
  "srv-105": [
    {
      date: "2026-10-28",
      slots: [
        { id: "slot-105-1", time: "08:30 AM", capacity: 6, bookedCount: 4 },
        { id: "slot-105-2", time: "10:00 AM", capacity: 6, bookedCount: 2 },
        { id: "slot-105-3", time: "11:30 AM", capacity: 6, bookedCount: 1 }
      ]
    }
  ],
  "srv-106": [] // Empty availability to showcase graceful empty states
};

export const INITIAL_APPOINTMENTS = [
  {
    id: "apt-cq-882101",
    referenceNumber: "CQ-2026-882101",
    serviceId: "srv-101",
    serviceName: "SHS Fresh Student Placement Verification & Prospectus Collection",
    institutionId: "inst-1",
    institutionName: "Achimota Senior High School",
    location: "Administration Block, Assembly Hall Annex, Desk 3",
    appointmentDate: "2026-10-27",
    appointmentTime: "08:30 AM",
    slotId: "slot-101-1",
    status: "booked", // booked | checked_in | in_progress | completed | cancelled | no_show
    delayNotice: "High morning traffic expected. Please arrive 15 minutes before your time slot.",
    visitor: {
      parentName: "Kwame Mensah",
      contactPhone: "+233 24 411 2233",
      contactEmail: "kwame.mensah@example.com",
      studentName: "Emmanuel Mensah",
      studentIndex: "101245089",
      notes: "First time visitor. Travelling from Kasoa."
    },
    checklist: [
      { id: "c1", label: "Original & 2 photocopies of CSSPS Placement Slip", verified: false },
      { id: "c2", label: "Original BECE Results Slip (Certified)", verified: false },
      { id: "c3", label: "Student Birth Certificate copy", verified: false },
      { id: "c4", label: "4 Passport-size photographs", verified: false },
      { id: "c5", label: "Parent/Guardian Ghana Card", verified: false }
    ],
    createdAt: "2026-10-24T10:15:00Z",
    history: [
      { timestamp: "2026-10-24T10:15:00Z", action: "Appointment booked online via CitizenQueue" }
    ]
  },
  {
    id: "apt-cq-882102",
    referenceNumber: "CQ-2026-882102",
    serviceId: "srv-101",
    serviceName: "SHS Fresh Student Placement Verification & Prospectus Collection",
    institutionId: "inst-1",
    institutionName: "Achimota Senior High School",
    location: "Administration Block, Assembly Hall Annex, Desk 3",
    appointmentDate: "2026-10-27",
    appointmentTime: "09:30 AM",
    slotId: "slot-101-2",
    status: "checked_in",
    delayNotice: null,
    visitor: {
      parentName: "Abena Osei Boateng",
      contactPhone: "+233 20 899 4455",
      contactEmail: "abena.boateng@example.com",
      studentName: "Adwoa Osei",
      studentIndex: "101245112",
      notes: "Arrived at 09:18 AM at Gate 2."
    },
    checklist: [
      { id: "c1", label: "CSSPS Placement Slip", verified: true },
      { id: "c2", label: "BECE Results Slip", verified: true },
      { id: "c3", label: "Student Birth Certificate copy", verified: true },
      { id: "c4", label: "4 Passport-size photographs", verified: true },
      { id: "c5", label: "Parent/Guardian Ghana Card", verified: true }
    ],
    createdAt: "2026-10-24T09:00:00Z",
    history: [
      { timestamp: "2026-10-24T09:00:00Z", action: "Appointment booked online via CitizenQueue" },
      { timestamp: "2026-10-27T09:18:00Z", action: "Visitor checked in at verification desk" }
    ]
  },
  {
    id: "apt-cq-882103",
    referenceNumber: "CQ-2026-882103",
    serviceId: "srv-104",
    serviceName: "Fresh Undergraduate Biometric Student ID & Document Verification",
    institutionId: "inst-3",
    institutionName: "University of Ghana — Academic Affairs Directorate",
    location: "Balme Library Annex, Digital Registration Center",
    appointmentDate: "2026-10-27",
    appointmentTime: "10:00 AM",
    slotId: "slot-104-2",
    status: "in_progress",
    delayNotice: "Biometric servers undergoing routine synchronization.",
    visitor: {
      parentName: "David Selorm",
      contactPhone: "+233 55 332 9900",
      contactEmail: "d.selorm@example.com",
      studentName: "Kofi Selorm",
      studentIndex: "10982233",
      notes: "Computer Science Dept candidate."
    },
    checklist: [
      { id: "c1", label: "UG Provisional Admission Letter", verified: true },
      { id: "c2", label: "Provisional Fee Receipt", verified: true },
      { id: "c3", label: "Original Ghana Card", verified: true },
      { id: "c4", label: "WASSCE Statement of Result", verified: true }
    ],
    createdAt: "2026-10-23T14:30:00Z",
    history: [
      { timestamp: "2026-10-23T14:30:00Z", action: "Appointment booked online" },
      { timestamp: "2026-10-27T09:55:00Z", action: "Visitor checked in" },
      { timestamp: "2026-10-27T10:04:00Z", action: "Document verification started by desk officer" }
    ]
  },
  {
    id: "apt-cq-882104",
    referenceNumber: "CQ-2026-882104",
    serviceId: "srv-103",
    serviceName: "CSSPS Placement Verification & Boarding House Allocation",
    institutionId: "inst-2",
    institutionName: "Prempeh College",
    location: "Osae Assembly Hall, Desk B",
    appointmentDate: "2026-10-23", // Past completed appointment
    appointmentTime: "11:30 AM",
    slotId: "slot-103-3",
    status: "completed",
    delayNotice: null,
    visitor: {
      parentName: "Akosua Frimpong",
      contactPhone: "+233 26 778 1122",
      contactEmail: "a.frimpong@example.com",
      studentName: "Yaw Frimpong",
      studentIndex: "202245011",
      notes: "Successfully assigned to Ramseyer House."
    },
    checklist: [
      { id: "c1", label: "Placement Form", verified: true },
      { id: "c2", label: "Medical fitness report", verified: true },
      { id: "c3", label: "Passport photos", verified: true }
    ],
    createdAt: "2026-10-20T11:00:00Z",
    history: [
      { timestamp: "2026-10-20T11:00:00Z", action: "Booked" },
      { timestamp: "2026-10-23T11:25:00Z", action: "Checked in" },
      { timestamp: "2026-10-23T11:45:00Z", action: "Completed successfully" }
    ]
  },
  {
    id: "apt-cq-882105",
    referenceNumber: "CQ-2026-882105",
    serviceId: "srv-102",
    serviceName: "School Certificate & Official Transcript Request",
    institutionId: "inst-1",
    institutionName: "Achimota Senior High School",
    location: "Records Office, Main Administration Room 12",
    appointmentDate: "2026-10-22",
    appointmentTime: "02:00 PM",
    slotId: "slot-102-4",
    status: "cancelled",
    delayNotice: null,
    visitor: {
      parentName: "Samuel Quaye",
      contactPhone: "+233 24 554 3321",
      contactEmail: "squaye@example.com",
      studentName: "Samuel Quaye",
      studentIndex: "001020304",
      notes: "Citizen rescheduled for next month."
    },
    checklist: [],
    createdAt: "2026-10-18T16:00:00Z",
    history: [
      { timestamp: "2026-10-18T16:00:00Z", action: "Booked" },
      { timestamp: "2026-10-21T09:12:00Z", action: "Cancelled by citizen due to schedule clash" }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Appointment Reminder: Tomorrow at 8:30 AM",
    message: "Your SHS Placement Verification visit at Achimota School is scheduled for tomorrow. Remember to bring your original BECE slip.",
    date: "2026-10-26T08:00:00Z",
    isRead: false,
    type: "reminder"
  },
  {
    id: "notif-2",
    title: "Checklist Reminder",
    message: "Four recent passport photos with white background are required for new student ID verification.",
    date: "2026-10-25T11:30:00Z",
    isRead: true,
    type: "info"
  }
];

export const SERVICE_CATEGORIES = [
  "All Categories",
  "Admissions & Enrollment",
  "Records & Certification",
  "Identity & Registration",
  "Health & Clearance"
];

// ============================================================================
// SENIOR HIGH SCHOOL (SHS) ADMISSION & ORCHESTRATION DATASETS
// ============================================================================

/**
 * 9 Standard Stages in the Ghanaian SHS Admission Orchestration Journey
 */
export const ADMISSION_STAGES = [
  {
    stage: 1,
    id: "placement_received",
    title: "Placement Received",
    description: "Official CSSPS placement details confirmed for Senior High School.",
    shortDesc: "CSSPS Placement Confirmed"
  },
  {
    stage: 2,
    id: "profile_completed",
    title: "Admission Profile Completed",
    description: "Student bio-data, guardian contacts, and residential details submitted.",
    shortDesc: "Bio-data & Guardian Info"
  },
  {
    stage: 3,
    id: "prospectus_reviewed",
    title: "Prospectus Requirements Reviewed",
    description: "Digital prospectus items checked, marked, and item photos uploaded for preliminary review.",
    shortDesc: "Prospectus Readiness"
  },
  {
    stage: 4,
    id: "documents_submitted",
    title: "Documents Submitted",
    description: "Mandatory admission documents uploaded to the digital Document Centre.",
    shortDesc: "Document Submissions"
  },
  {
    stage: 5,
    id: "preliminary_review_completed",
    title: "Preliminary Review Completed",
    description: "Institutional staff have provisionally reviewed uploaded items and documents.",
    shortDesc: "School Desk Review"
  },
  {
    stage: 6,
    id: "ready_for_reporting",
    title: "Ready for Physical Reporting",
    description: "All digital prerequisites completed. Eligible to schedule physical reporting.",
    shortDesc: "Pre-Arrival Verified"
  },
  {
    stage: 7,
    id: "appointment_scheduled",
    title: "Reporting Appointment Scheduled",
    description: "Physical verification & kit issuance date and time slot reserved.",
    shortDesc: "Arrival Slot Reserved"
  },
  {
    stage: 8,
    id: "checked_in",
    title: "Checked In on Campus",
    description: "Student & guardian arrived at the school verification desk with original records.",
    shortDesc: "Campus Arrival Check-in"
  },
  {
    stage: 9,
    id: "registration_completed",
    title: "Registration Completed",
    description: "Physical inspection, house allocation, and student index confirmation completed.",
    shortDesc: "Fully Admitted & Enrolled"
  }
];

/**
 * Default Active Student Admission Profile (Kwame Mensah's son Emmanuel Mensah)
 */
export const INITIAL_STUDENT_PROFILE = {
  id: "std-101245089",
  fullName: "Emmanuel Mensah",
  beceIndexNumber: "101245089",
  dateOfBirth: "2010-04-15",
  gender: "Male",
  assignedSchoolId: "inst-1",
  assignedSchool: "Achimota Senior High School",
  programme: "General Science",
  residentialStatus: "Boarding", // "Boarding" | "Day"
  guardianName: "Kwame Mensah",
  guardianPhone: "+233 24 411 2233",
  guardianEmail: "kwame.mensah@example.com",
  guardianRelation: "Father",
  homeTown: "Kasoa, Central Region",
  placementBatch: "CSSPS 2026 Batch A",
  aggregateScore: "08",
  juniorHighSchool: "St. Theresa's Basic School, Kaneshie",
  placementSlipUploaded: true,
  placementSlipFileName: "cssps_placement_slip_101245089.pdf",
  notes: "Placed in General Science with Boarding status at Achimota School.",
  isComplete: true
};

/**
 * Categories of Digital Prospectus Requirements
 */
export const PROSPECTUS_CATEGORIES = [
  "All Categories",
  "Clothing and Uniforms",
  "Bedding",
  "Toiletries",
  "Academic Materials",
  "Storage Items",
  "Other School Requirements"
];

/**
 * Master Prospectus Requirements for Achimota Senior High School
 */
export const INITIAL_PROSPECTUS = [
  {
    id: "pr-101",
    schoolId: "inst-1",
    name: "Khaki Trousers (Official Uniform)",
    targetGender: "boy",
    category: "Clothing and Uniforms",
    specification: "Standard school khaki brown, straight cut, no bell bottoms, 2 pairs.",
    description: "Required for regular daily academic sessions. Must conform to school tailoring specifications.",
    quantity: "2 pairs",
    requiresPhotoReview: false,
    referenceNotes: "Tailored to sit comfortably on waistline. Turn-ups not permitted."
  },
  {
    id: "pr-102",
    schoolId: "inst-1",
    name: "White Short-Sleeved Shirts",
    targetGender: "boy",
    category: "Clothing and Uniforms",
    specification: "Plain white poplin or tetron material, school crest embroidered on left pocket.",
    description: "Standard classroom shirts. No logos other than official school crest.",
    quantity: "3 pairs",
    requiresPhotoReview: false,
    referenceNotes: "Available also through authorized on-campus PTA stores."
  },
  {
    id: "pr-103",
    schoolId: "inst-1",
    name: "Official House Jersey & Shorts",
    targetGender: "all",
    category: "Clothing and Uniforms",
    specification: "Designated house colour jersey (Livingstone / Cadbury / Gyamfi) with sports shorts.",
    description: "For inter-house sports, morning physical training and Saturday compound inspection.",
    quantity: "1 set",
    requiresPhotoReview: false,
    referenceNotes: "House assigned upon arrival verification."
  },
  {
    id: "pr-104",
    schoolId: "inst-1",
    name: "Black Low-Heeled Leather Shoes",
    targetGender: "boy",
    category: "Clothing and Uniforms",
    specification: "Polished plain black leather, lace-up or monk strap, low heels, no buckles or decorative studs.",
    description: "Required for classes and formal gatherings. No suede or sneaker styles.",
    quantity: "1 pair",
    requiresPhotoReview: false,
    referenceNotes: "Ensure comfortable fit for walking between classroom blocks."
  },
  {
    id: "pr-105",
    schoolId: "inst-1",
    name: "White Bed Sheets & Pillowcases",
    targetGender: "all",
    category: "Bedding",
    specification: "Plain white cotton sheets (Single bed standard 3ft x 6ft) with two matching pillowcases.",
    description: "Compulsory for all boarding students for dormitory uniformity and inspection.",
    quantity: "2 sets",
    requiresPhotoReview: false,
    referenceNotes: "Plain white only; patterned or tinted bedsheets are confiscated."
  },
  {
    id: "pr-106",
    schoolId: "inst-1",
    name: "Treated Mosquito Net",
    targetGender: "all",
    category: "Bedding",
    specification: "Rectangular or bell-shaped Long-Lasting Insecticidal Net (LLIN), white or light blue.",
    description: "Mandatory health requirement for boarding houses.",
    quantity: "1 piece",
    requiresPhotoReview: false,
    referenceNotes: "Must have eyelets or hooks for secure hanging."
  },
  {
    id: "pr-107",
    schoolId: "inst-1",
    name: "Mackintosh Mattress Protector",
    targetGender: "all",
    category: "Bedding",
    specification: "Heavy-duty waterproof rubberized sheet fitting standard 3x6 single bunk.",
    description: "Protects dormitory mattresses from water damage and dampness.",
    quantity: "1 piece",
    requiresPhotoReview: false,
    referenceNotes: "Placed under bedsheet."
  },
  {
    id: "pr-108",
    schoolId: "inst-1",
    name: "Approved Metal Trunk",
    targetGender: "all",
    category: "Storage Items",
    specification: "Galvanized sheet metal trunk, maximum dimensions 90cm (L) x 50cm (W) x 40cm (H).",
    description: "Standard secure storage for clothing and personal belongings in dormitory cubicles.",
    quantity: "1 piece",
    requiresPhotoReview: false,
    referenceNotes: "Oversized trunks cannot fit under bunk beds and will be rejected at physical reporting."
  },
  {
    id: "pr-109",
    schoolId: "inst-1",
    name: "Wooden Chop Box with Padlock",
    targetGender: "all",
    category: "Storage Items",
    specification: "Sturdy marine plywood, approved dimensions 75cm x 45cm x 40cm, equipped with durable hasp and staple.",
    description: "For food provisions, dry rations and cutlery in boarding dining facilities.",
    quantity: "1 piece",
    requiresPhotoReview: false,
    referenceNotes: "Must be clearly labeled with student full name using indelible marker."
  },
  {
    id: "pr-110",
    schoolId: "inst-1",
    name: "Plastic Bucket with Cover & Washing Basin",
    targetGender: "all",
    category: "Toiletries",
    specification: "Medium capacity (15-20 Litre) plastic bucket with lid and durable matching wash basin.",
    description: "For morning bath and Saturday laundry. Uniform blue or green color preferred.",
    quantity: "1 bucket + 1 basin",
    requiresPhotoReview: false,
    referenceNotes: "Must have student name engraved or clearly marked."
  },
  {
    id: "pr-111",
    schoolId: "inst-1",
    name: "Personal Toiletries Pack",
    targetGender: "all",
    category: "Toiletries",
    specification: "Bath towels (2), Dettol or antiseptic liquid, bathing soap, washing detergent, toothbrush, toothpaste, toilet rolls.",
    description: "Term-supply hygiene and sanitation materials.",
    quantity: "1 term supply",
    requiresPhotoReview: false,
    referenceNotes: "Inspect pack before term commences."
  },
  {
    id: "pr-112",
    schoolId: "inst-1",
    name: "Oxford Mathematical Instrument Set",
    targetGender: "all",
    category: "Academic Materials",
    specification: "Original Helix Oxford or Staedtler metal tin set containing compass, protractor, dividers, and rules.",
    description: "Essential for Core & Elective Mathematics and Science laboratory diagrams.",
    quantity: "1 set",
    requiresPhotoReview: false,
    referenceNotes: "Avoid fragile plastic compass sets."
  },
  {
    id: "pr-113",
    schoolId: "inst-1",
    name: "Scientific Calculator (Non-Programmable)",
    targetGender: "all",
    category: "Academic Materials",
    specification: "Casio fx-991EX ClassWiz or fx-991ES Plus (WAEC approved, non-programmable).",
    description: "Compulsory for science and business examinations.",
    quantity: "1 unit",
    requiresPhotoReview: false,
    referenceNotes: "Must be standard WAEC approved model."
  },
  {
    id: "pr-114",
    schoolId: "inst-1",
    name: "Cutlass & Hoe for Compound Maintenance",
    targetGender: "all",
    category: "Other School Requirements",
    specification: "Standard Crocodile brand cutlass with wooden handle, and standard garden hoe with wooden shaft.",
    description: "Required for communal house labour, compound cleanliness and campus sanitation duties.",
    quantity: "1 cutlass + 1 hoe",
    requiresPhotoReview: false,
    referenceNotes: "Stored safely in house equipment stores upon physical reporting."
  },
  {
    id: "pr-115",
    schoolId: "inst-1",
    name: "Brown School Leather Sandals",
    targetGender: "all",
    category: "Clothing and Uniforms",
    specification: "Flat brown leather sandals with back strap, buckle closure. No slippers or slide-ons permitted.",
    description: "Permitted for dining hall, prep hours, and weekend campus wear.",
    quantity: "1 pair",
    requiresPhotoReview: false,
    referenceNotes: "Heels must be flat and non-slip."
  },
  {
    id: "pr-116",
    schoolId: "inst-1",
    name: "School Uniform Dresses / Pinafores",
    targetGender: "girl",
    category: "Clothing and Uniforms",
    specification: "Official school check fabric, knee-length, straight cut, 2 pairs.",
    description: "Required for regular classroom lessons. Tailored strictly to knee length.",
    quantity: "2 pairs",
    requiresPhotoReview: false,
    referenceNotes: "Slits above knee are strictly prohibited."
  },
  {
    id: "pr-117",
    schoolId: "inst-1",
    name: "White Short-Sleeved Blouses",
    targetGender: "girl",
    category: "Clothing and Uniforms",
    specification: "Plain white poplin or tetron material with school crest on left collar.",
    description: "Standard classroom blouses.",
    quantity: "3 pieces",
    requiresPhotoReview: false,
    referenceNotes: "Available also through authorized PTA store."
  },
  {
    id: "pr-118",
    schoolId: "inst-1",
    name: "Black Flat Leather Shoes (Girls)",
    targetGender: "girl",
    category: "Clothing and Uniforms",
    specification: "Polished plain black leather flat court shoes or low block heel (max 1 inch).",
    description: "Required for formal assemblies and church services.",
    quantity: "1 pair",
    requiresPhotoReview: false,
    referenceNotes: "No high heels or fancy buckles."
  },
  {
    id: "pr-119",
    schoolId: "inst-1",
    name: "Sanitary Supplies & Hygiene Pack",
    targetGender: "girl",
    category: "Toiletries",
    specification: "Full term supply of sanitary pads, personal hygiene washes, and disposal bags.",
    description: "Mandatory personal care provision for boarding girls.",
    quantity: "1 term pack",
    requiresPhotoReview: false,
    referenceNotes: "Store in hygienic pouch within chop box."
  },
  {
    id: "pr-120",
    schoolId: "inst-1",
    name: "Plain Black Hair Bands & Ribbons",
    targetGender: "girl",
    category: "Clothing and Uniforms",
    specification: "Simple black ribbons, hair bands or hair clips. No coloured or decorative beads.",
    description: "For keeping hair neat in compliance with GES school grooming policy.",
    quantity: "1 pack",
    requiresPhotoReview: false,
    referenceNotes: "Conforms to Achimota grooming policy."
  }
];

/**
 * Initial Student Status for Prospectus Items
 * Demonstrates purchased state, sample photo uploads, and administrator reviews
 */
export const INITIAL_STUDENT_PROSPECTUS_STATUS = {
  "pr-101": {
    purchased: true,
    photoStatus: "provisionally_accepted", // "not_submitted" | "awaiting_review" | "provisionally_accepted" | "changes_required"
    photoName: "khaki_trousers_tailored.jpg",
    photoUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-10-25T11:20:00Z",
    adminFeedback: "Provisionally approved: Colour shade and cut conform to Achimota School uniform guidelines."
  },
  "pr-102": {
    purchased: true,
    photoStatus: "not_submitted",
    photoName: null,
    photoUrl: null,
    submittedAt: null,
    adminFeedback: null
  },
  "pr-103": {
    purchased: true,
    photoStatus: "not_submitted",
    photoName: null,
    photoUrl: null,
    submittedAt: null,
    adminFeedback: null
  },
  "pr-104": {
    purchased: true,
    photoStatus: "provisionally_accepted",
    photoName: "leather_shoes_black.jpg",
    photoUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-10-25T12:00:00Z",
    adminFeedback: "Low-heel plain black leather shoe accepted."
  },
  "pr-105": {
    purchased: true,
    photoStatus: "awaiting_review",
    photoName: "white_bedsheets_pack.jpg",
    photoUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-10-26T09:15:00Z",
    adminFeedback: "Under review by boarding house master."
  },
  "pr-106": {
    purchased: true,
    photoStatus: "not_submitted",
    photoName: null,
    photoUrl: null,
    submittedAt: null,
    adminFeedback: null
  },
  "pr-107": {
    purchased: true,
    photoStatus: "not_submitted",
    photoName: null,
    photoUrl: null,
    submittedAt: null,
    adminFeedback: null
  },
  "pr-108": {
    purchased: true,
    photoStatus: "changes_required",
    photoName: "trunk_metal_heavy.jpg",
    photoUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-10-24T16:00:00Z",
    adminFeedback: "Dimensions exceed standard bunk bed height (trunk is 55cm high; maximum allowed is 40cm). Please adjust before physical reporting."
  },
  "pr-109": {
    purchased: true,
    photoStatus: "provisionally_accepted",
    photoName: "wooden_chopbox.jpg",
    photoUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-10-25T14:10:00Z",
    adminFeedback: "Approved hasp and staple padlock mounting."
  },
  "pr-110": {
    purchased: true,
    photoStatus: "not_submitted",
    photoName: null,
    photoUrl: null,
    submittedAt: null,
    adminFeedback: null
  },
  "pr-111": {
    purchased: true,
    photoStatus: "not_submitted",
    photoName: null,
    photoUrl: null,
    submittedAt: null,
    adminFeedback: null
  },
  "pr-112": {
    purchased: true,
    photoStatus: "provisionally_accepted",
    photoName: "oxford_maths_set.jpg",
    photoUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-10-25T14:40:00Z",
    adminFeedback: "Original Oxford tin set verified."
  },
  "pr-113": {
    purchased: true,
    photoStatus: "awaiting_review",
    photoName: "casio_fx991ex.jpg",
    photoUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-10-26T10:00:00Z",
    adminFeedback: "Awaiting mathematics department approval."
  },
  "pr-114": {
    purchased: false,
    photoStatus: "not_submitted",
    photoName: null,
    photoUrl: null,
    submittedAt: null,
    adminFeedback: null
  },
  "pr-115": {
    purchased: false,
    photoStatus: "not_submitted",
    photoName: null,
    photoUrl: null,
    submittedAt: null,
    adminFeedback: null
  }
};

/**
 * Mandatory Admission Documents for Achimota School
 */
export const INITIAL_STUDENT_DOCUMENTS = [
  {
    id: "doc-1",
    name: "CSSPS Placement Slip",
    category: "Placement & Enrollment",
    required: true,
    description: "Official Computerized School Selection and Placement System (CSSPS) document showing student details and allocated school.",
    status: "provisionally_accepted", // "not_submitted" | "submitted" | "under_review" | "changes_required" | "provisionally_accepted"
    fileName: "cssps_placement_slip_101245089.pdf",
    fileSize: "1.2 MB",
    uploadedAt: "2026-10-24T09:15:00Z",
    reviewedAt: "2026-10-24T14:20:00Z",
    adminFeedback: "Placement confirmed for General Science (Boarding). Serial barcode is legible.",
    fileUrl: "https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "doc-2",
    name: "BECE Official Results Slip",
    category: "Academic Records",
    required: true,
    description: "Certified Basic Education Certificate Examination results slip showing subject grades and raw score.",
    status: "provisionally_accepted",
    fileName: "bece_results_certified_101245089.pdf",
    fileSize: "1.8 MB",
    uploadedAt: "2026-10-24T09:20:00Z",
    reviewedAt: "2026-10-24T14:22:00Z",
    adminFeedback: "Verified raw aggregate score 08. Grade entries match school registry records.",
    fileUrl: "https://images.unsplash.com/photo-1584697964190-7bb88f828731?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "doc-3",
    name: "Student Birth Certificate",
    category: "Identity & Bio-data",
    required: true,
    description: "Official certificate issued by the Births and Deaths Registry of Ghana.",
    status: "provisionally_accepted",
    fileName: "birth_certificate_emmanuel_mensah.pdf",
    fileSize: "2.4 MB",
    uploadedAt: "2026-10-24T09:30:00Z",
    reviewedAt: "2026-10-24T14:25:00Z",
    adminFeedback: "Registry entry number confirmed. Date of birth matches BECE profile.",
    fileUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "doc-4",
    name: "Recent Passport Photographs (White Background)",
    category: "Identification",
    required: true,
    description: "Four identical, clear portrait photographs on plain white background for permanent records and ID card.",
    status: "under_review",
    fileName: "passport_photo_emmanuel_mensah.jpg",
    fileSize: "850 KB",
    uploadedAt: "2026-10-26T08:15:00Z",
    reviewedAt: null,
    adminFeedback: "Queued for photo studio quality check.",
    fileUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "doc-5",
    name: "NHIS Card / Health Insurance Copy",
    category: "Health & Welfare",
    required: true,
    description: "Valid National Health Insurance Scheme card copy for school infirmary registration.",
    status: "submitted",
    fileName: "nhis_card_copy_101245089.jpg",
    fileSize: "620 KB",
    uploadedAt: "2026-10-26T11:45:00Z",
    reviewedAt: null,
    adminFeedback: null,
    fileUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "doc-6",
    name: "Parent / Guardian National ID (Ghana Card copy)",
    category: "Guardian Records",
    required: true,
    description: "Clear copy of Parent or Guardian's National ID for emergency and consent verification.",
    status: "changes_required",
    fileName: "guardian_id_card_scan.jpg",
    fileSize: "940 KB",
    uploadedAt: "2026-10-24T10:00:00Z",
    reviewedAt: "2026-10-25T15:10:00Z",
    adminFeedback: "The back of the card is missing or poorly scanned. Please upload a clear photo showing both front and back.",
    fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=60"
  }
];

/**
 * Admitted Student Cohort for Achimota School (Institution Portal Data)
 * Represents realistic diversity of admission readiness across candidates.
 */
export const INITIAL_ADMITTED_STUDENTS = [
  {
    id: "std-101245089",
    name: "Emmanuel Mensah",
    indexNumber: "101245089",
    gender: "Male",
    programme: "General Science",
    residentialStatus: "Boarding",
    guardianName: "Kwame Mensah",
    guardianPhone: "+233 24 411 2233",
    guardianEmail: "kwame.mensah@example.com",
    aggregate: "08",
    readinessScore: 82,
    admissionStage: 5,
    profileComplete: true,
    documentsCount: { total: 6, accepted: 3, pending: 2, changes: 1 },
    prospectusCount: { total: 15, purchased: 13, photosPending: 2, photosAccepted: 4, photosChanges: 1 },
    appointment: {
      id: "apt-cq-882101",
      date: "2026-10-27",
      time: "08:30 AM",
      status: "booked",
      referenceNumber: "CQ-2026-882101"
    },
    registrationStatus: "pre_arrival_review", // "profile_pending" | "documents_pending" | "items_pending" | "ready_for_reporting" | "appointment_booked" | "checked_in" | "completed"
    lastActive: "15 mins ago"
  },
  {
    id: "std-101245112",
    name: "Adwoa Osei",
    indexNumber: "101245112",
    gender: "Female",
    programme: "General Arts",
    residentialStatus: "Day",
    guardianName: "Abena Osei Boateng",
    guardianPhone: "+233 20 899 4455",
    guardianEmail: "abena.boateng@example.com",
    aggregate: "09",
    readinessScore: 98,
    admissionStage: 8,
    profileComplete: true,
    documentsCount: { total: 6, accepted: 6, pending: 0, changes: 0 },
    prospectusCount: { total: 15, purchased: 15, photosPending: 0, photosAccepted: 6, photosChanges: 0 },
    appointment: {
      id: "apt-cq-882102",
      date: "2026-10-27",
      time: "09:30 AM",
      status: "checked_in",
      referenceNumber: "CQ-2026-882102"
    },
    registrationStatus: "checked_in",
    lastActive: "1 hour ago"
  },
  {
    id: "std-101245203",
    name: "Kofi Selorm",
    indexNumber: "101245203",
    gender: "Male",
    programme: "Visual Arts",
    residentialStatus: "Boarding",
    guardianName: "David Selorm",
    guardianPhone: "+233 55 332 9900",
    guardianEmail: "d.selorm@example.com",
    aggregate: "14",
    readinessScore: 48,
    admissionStage: 4,
    profileComplete: true,
    documentsCount: { total: 6, accepted: 2, pending: 3, changes: 1 },
    prospectusCount: { total: 15, purchased: 7, photosPending: 1, photosAccepted: 1, photosChanges: 0 },
    appointment: null,
    registrationStatus: "documents_pending",
    lastActive: "3 hours ago"
  },
  {
    id: "std-101245345",
    name: "Nana Ama Darko",
    indexNumber: "101245345",
    gender: "Female",
    programme: "Home Economics",
    residentialStatus: "Boarding",
    guardianName: "Ebenezer Darko",
    guardianPhone: "+233 24 991 7722",
    guardianEmail: "e.darko@example.com",
    aggregate: "12",
    readinessScore: 74,
    admissionStage: 5,
    profileComplete: true,
    documentsCount: { total: 6, accepted: 5, pending: 1, changes: 0 },
    prospectusCount: { total: 15, purchased: 12, photosPending: 2, photosAccepted: 3, photosChanges: 1 },
    appointment: null,
    registrationStatus: "items_pending",
    lastActive: "5 hours ago"
  },
  {
    id: "std-101245419",
    name: "Ibrahim Yakubu",
    indexNumber: "101245419",
    gender: "Male",
    programme: "Business",
    residentialStatus: "Day",
    guardianName: "Alhaji Yakubu Musah",
    guardianPhone: "+233 27 555 4321",
    guardianEmail: "yakubu.al@example.com",
    aggregate: "10",
    readinessScore: 92,
    admissionStage: 6,
    profileComplete: true,
    documentsCount: { total: 6, accepted: 6, pending: 0, changes: 0 },
    prospectusCount: { total: 15, purchased: 14, photosPending: 0, photosAccepted: 5, photosChanges: 0 },
    appointment: null,
    registrationStatus: "ready_for_reporting",
    lastActive: "Yesterday"
  },
  {
    id: "std-101245582",
    name: "Jessica Appiah",
    indexNumber: "101245582",
    gender: "Female",
    programme: "General Science",
    residentialStatus: "Boarding",
    guardianName: "Cecilia Appiah",
    guardianPhone: "+233 24 888 2211",
    guardianEmail: "c.appiah@example.com",
    aggregate: "07",
    readinessScore: 22,
    admissionStage: 2,
    profileComplete: false,
    documentsCount: { total: 6, accepted: 1, pending: 0, changes: 0 },
    prospectusCount: { total: 15, purchased: 3, photosPending: 0, photosAccepted: 0, photosChanges: 0 },
    appointment: null,
    registrationStatus: "profile_pending",
    lastActive: "2 days ago"
  },
  {
    id: "std-101245631",
    name: "Yaw Frimpong",
    indexNumber: "101245631",
    gender: "Male",
    programme: "Agricultural Science",
    residentialStatus: "Boarding",
    guardianName: "Akosua Frimpong",
    guardianPhone: "+233 26 778 1122",
    guardianEmail: "a.frimpong@example.com",
    aggregate: "11",
    readinessScore: 100,
    admissionStage: 9,
    profileComplete: true,
    documentsCount: { total: 6, accepted: 6, pending: 0, changes: 0 },
    prospectusCount: { total: 15, purchased: 15, photosPending: 0, photosAccepted: 6, photosChanges: 0 },
    appointment: {
      id: "apt-cq-882104",
      date: "2026-10-23",
      time: "11:30 AM",
      status: "completed",
      referenceNumber: "CQ-2026-882104"
    },
    registrationStatus: "completed",
    lastActive: "3 days ago"
  },
  {
    id: "std-101245790",
    name: "Grace Antwi",
    indexNumber: "101245790",
    gender: "Female",
    programme: "General Arts",
    residentialStatus: "Boarding",
    guardianName: "Patrick Antwi",
    guardianPhone: "+233 20 112 3344",
    guardianEmail: "p.antwi@example.com",
    aggregate: "13",
    readinessScore: 65,
    admissionStage: 4,
    profileComplete: true,
    documentsCount: { total: 6, accepted: 3, pending: 3, changes: 0 },
    prospectusCount: { total: 15, purchased: 10, photosPending: 1, photosAccepted: 2, photosChanges: 0 },
    appointment: null,
    registrationStatus: "documents_pending",
    lastActive: "1 day ago"
  }
];

