import { Prospectus, Admission, Student, School } from '../models/index.js';
import { AdmissionService } from '../services/admissionService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProspectusCatalog = asyncHandler(async (req, res) => {
  const schoolId = req.query.schoolId || req.user.schoolId;
  const gender = req.query.gender;

  const query = { schoolId, publicationStatus: 'published' };
  if (gender) {
    query.$or = [{ targetGender: 'all' }, { targetGender: gender.toLowerCase() }];
  }

  const items = await Prospectus.find(query).sort({ category: 1, name: 1 });
  return ApiResponse.success(res, items);
});

export const getStudentProspectus = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    throw ApiError.notFound('Student record not found');
  }

  const admission = await Admission.findOne({ student: student._id });
  const gender = student.gender === 'Female' ? 'girl' : 'boy';

  const catalog = await Prospectus.find({
    schoolId: student.schoolId,
    publicationStatus: 'published',
    $or: [{ targetGender: 'all' }, { targetGender: gender }],
  }).sort({ category: 1, name: 1 });

  const statusMap = new Map();
  (admission?.prospectusStatuses || []).forEach((st) => {
    statusMap.set(st.itemId, st);
  });

  const mergedItems = catalog.map((item) => {
    const userStatus = statusMap.get(item.itemId) || {
      purchased: false,
      photoStatus: 'not_submitted',
      photoUrl: null,
      adminFeedback: null,
    };
    return {
      ...item.toObject(),
      purchased: userStatus.purchased,
      photoStatus: userStatus.photoStatus,
      photoUrl: userStatus.photoUrl,
      adminFeedback: userStatus.adminFeedback,
    };
  });

  return ApiResponse.success(res, mergedItems);
});

export const toggleItemStatus = asyncHandler(async (req, res) => {
  const { itemId, acquired, notes } = req.body;
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    throw ApiError.notFound('Student record not found');
  }

  const admission = await Admission.findOne({ student: student._id });
  if (!admission) {
    throw ApiError.notFound('Admission record not found');
  }

  let itemStatus = admission.prospectusStatuses.find((s) => s.itemId === itemId);
  if (!itemStatus) {
    admission.prospectusStatuses.push({
      itemId,
      purchased: acquired,
      photoStatus: 'not_submitted',
    });
  } else {
    itemStatus.purchased = acquired;
  }

  await admission.save();
  await AdmissionService.getAdmissionProgress(student._id);

  return ApiResponse.success(res, { itemId, purchased: acquired });
});

export const uploadItemPhoto = asyncHandler(async (req, res) => {
  const { itemId, photoUrl, photoName, storageKey } = req.body;
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    throw ApiError.notFound('Student record not found');
  }

  const admission = await Admission.findOne({ student: student._id });
  if (!admission) {
    throw ApiError.notFound('Admission record not found');
  }

  let itemStatus = admission.prospectusStatuses.find((s) => s.itemId === itemId);
  if (!itemStatus) {
    admission.prospectusStatuses.push({
      itemId,
      purchased: true,
      photoStatus: 'awaiting_review',
      photoUrl,
      photoName: photoName || 'item_verification.jpg',
      storageKey: storageKey || null,
      submittedAt: new Date(),
    });
  } else {
    itemStatus.purchased = true;
    itemStatus.photoStatus = 'awaiting_review';
    itemStatus.photoUrl = photoUrl;
    itemStatus.photoName = photoName || 'item_verification.jpg';
    itemStatus.storageKey = storageKey || null;
    itemStatus.submittedAt = new Date();
  }

  await admission.save();
  await AdmissionService.getAdmissionProgress(student._id);

  return ApiResponse.success(res, { itemId, photoStatus: 'awaiting_review', photoUrl });
});

export const reviewItemPhoto = asyncHandler(async (req, res) => {
  const { admissionId } = req.params;
  const { itemId, status, reviewNotes } = req.body;

  const admission = await Admission.findById(admissionId);
  if (!admission) {
    throw ApiError.notFound('Admission record not found');
  }

  const itemStatus = admission.prospectusStatuses.find((s) => s.itemId === itemId);
  if (!itemStatus) {
    throw ApiError.notFound(`Status record for item ${itemId} not found in admission`);
  }

  itemStatus.photoStatus = status === 'approved' ? 'provisionally_accepted' : 'changes_required';
  itemStatus.reviewedAt = new Date();
  itemStatus.reviewedBy = req.user._id;
  itemStatus.adminFeedback = reviewNotes || null;

  await admission.save();
  await AdmissionService.getAdmissionProgress(admission.student);

  return ApiResponse.success(res, itemStatus);
});

export const createProspectusItem = asyncHandler(async (req, res) => {
  const { category, name, specification, quantity, description, requiresPhotoReview, isFreeGesItem, targetGender } = req.body;
  const schoolId = req.user.schoolId || 'inst-1';

  const itemId = `pr-${Date.now().toString().slice(-6)}`;
  const item = new Prospectus({
    schoolId,
    itemId,
    name,
    category,
    specification,
    quantity: String(quantity || '1 piece'),
    description: description || '',
    requiresPhotoReview: Boolean(requiresPhotoReview),
    isFreeGesItem: Boolean(isFreeGesItem),
    targetGender: targetGender || 'all',
  });

  await item.save();
  return ApiResponse.created(res, item);
});
