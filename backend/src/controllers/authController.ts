import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@travel-baseball/shared';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  currentPassword: z.string().min(1, 'Current password is required').optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional()
}).refine((data) => {
  // If newPassword is provided, currentPassword must also be provided
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required when updating password",
  path: ["currentPassword"]
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body) as RegisterRequest;
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email.toLowerCase() }
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      name: validatedData.name
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  // Generate token
  const token = generateToken(user);

  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: {
      user,
      token
    },
    message: 'User registered successfully'
  };

  res.status(201).json(response);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body) as LoginRequest;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email.toLowerCase() }
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await comparePassword(validatedData.password, user.password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;

  // Generate token
  const token = generateToken(userWithoutPassword);

  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: {
      user: userWithoutPassword,
      token
    },
    message: 'Login successful'
  };

  res.json(response);
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'Profile retrieved successfully'
  };

  res.json(response);
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const validatedData = updateProfileSchema.parse(req.body);

  // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!currentUser) {
    throw new AppError('User not found', 404);
  }

  const updateData: any = {};

  // Update name if provided
  if (validatedData.name) {
    updateData.name = validatedData.name;
  }

  // Update password if provided
  if (validatedData.newPassword && validatedData.currentPassword) {
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      validatedData.currentPassword, 
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    updateData.password = await hashPassword(validatedData.newPassword);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const response: ApiResponse = {
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully'
  };

  res.json(response);
});