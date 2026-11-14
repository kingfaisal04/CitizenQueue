import { School, Service, Prospectus } from '../models/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSchools = asyncHandler(async (req, res) => {
  const { region, category, search } = req.query;
  const query = {};

  if (region) query.region = region;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { schoolId: { $regex: search, $options: 'i' } },
      { town: { $regex: search, $options: 'i' } },
    ];
  }

  const schools = await School.find(query).sort({ name: 1 });
  return ApiResponse.success(res, schools);
});

export const getSchoolDetails = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;
  const school = await School.findOne({
    $or: [{ schoolId }, { _id: schoolId.match(/^[0-9a-fA-F]{24}$/) ? schoolId : null }],
  });

  if (!school) {
    throw ApiError.notFound(`School with identifier ${schoolId} not found`);
  }

  return ApiResponse.success(res, school);
});

export const getSchoolServices = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;
  const services = await Service.find({
    $or: [{ schoolId }, { institutionId: schoolId }],
    isActive: true,
  }).sort({ displayOrder: 1 });

  return ApiResponse.success(res, services);
});

export const getSchoolProspectus = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;
  const { gender } = req.query;

  const query = {
    schoolId,
    publicationStatus: 'published',
  };

  if (gender) {
    query.$or = [{ targetGender: 'all' }, { targetGender: gender.toLowerCase() }];
  }

  const prospectus = await Prospectus.find(query).sort({ category: 1, name: 1 });
  return ApiResponse.success(res, prospectus);
});
