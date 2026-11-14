import { User } from '../models/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  return ApiResponse.success(res, user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();
  const updated = user.toObject();
  delete updated.password;
  delete updated.refreshTokens;

  return ApiResponse.success(res, updated);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password provided is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return ApiResponse.success(res, { message: 'Password changed successfully' });
});
