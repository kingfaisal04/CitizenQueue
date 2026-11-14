import { z } from 'zod';

export const toggleItemStatusSchema = z.object({
  itemId: z.string().min(1, 'Prospectus item ID is required'),
  acquired: z.boolean(),
  notes: z.string().optional(),
});

export const uploadItemPhotoSchema = z.object({
  itemId: z.string().min(1, 'Prospectus item ID is required'),
  photoUrl: z.string().min(1, 'Item photograph URL is required'),
});

export const reviewProspectusItemSchema = z.object({
  itemId: z.string().min(1, 'Prospectus item ID is required'),
  status: z.enum(['approved', 'rejected', 'pending']),
  reviewNotes: z.string().optional(),
});

export const createProspectusItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  quantity: z.union([z.number(), z.string()]).default(1),
  specification: z.string().optional(),
  mandatory: z.boolean().default(true),
  academicYear: z.string().optional(),
  genderTarget: z.enum(['all', 'male', 'female']).default('all'),
  residentialTarget: z.enum(['all', 'boarding', 'day']).default('all'),
});
