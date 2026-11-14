import mongoose from 'mongoose';

const ProspectusSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      default: null,
      index: true
    },
    schoolId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    itemId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    targetGender: {
      type: String,
      enum: ['all', 'boy', 'girl'],
      default: 'all',
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Clothing and Uniforms',
        'Bedding',
        'Toiletries',
        'Academic Materials',
        'Storage Items',
        'Other School Requirements',
        'Uniforms & School Wear',
        'Academic Textbooks & Books',
        'Boarding & Welfare Provisions'
      ],
      index: true
    },
    specification: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    quantity: {
      type: String,
      default: '1 piece'
    },
    requiresPhotoReview: {
      type: Boolean,
      default: false
    },
    referenceNotes: {
      type: String,
      default: ''
    },
    isFreeGesItem: {
      type: Boolean,
      default: false,
      index: true
    },
    providedBy: {
      type: String,
      default: null
    },
    distributionPoint: {
      type: String,
      default: null
    },
    publicationStatus: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published'
    }
  },
  {
    timestamps: true
  }
);

ProspectusSchema.index({ schoolId: 1, itemId: 1 }, { unique: true });
ProspectusSchema.index({ schoolId: 1, isFreeGesItem: 1, category: 1 });

export const Prospectus = mongoose.model('Prospectus', ProspectusSchema);
