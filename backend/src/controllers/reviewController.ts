import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { CreateReviewRequest, ApiResponse } from '../types';

const createReviewSchema = z.object({
  coaching_rating: z.number().int().min(1).max(5),
  value_rating: z.number().int().min(1).max(5),
  organization_rating: z.number().int().min(1).max(5),
  playing_time_rating: z.number().int().min(1).max(5),
  overall_rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const validatedData = createReviewSchema.parse(req.body) as CreateReviewRequest;

  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Create anonymous review (no userId required)
  const review = await prisma.review.create({
    data: {
      ...validatedData,
      teamId,
      userId: null // null for anonymous reviews
    },
    include: {
      team: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: review,
    message: 'Review created successfully'
  };

  res.status(201).json(response);
});

export const getTeamReviews = catchAsync(async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const reviews = await prisma.review.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limitNum
  });

  const total = await prisma.review.count({
    where: { teamId }
  });

  const response: ApiResponse = {
    success: true,
    data: {
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  };

  res.json(response);
});

export const updateReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { teamId, reviewId } = req.params;
  const userId = req.user!.id;
  const validatedData = createReviewSchema.parse(req.body);

  // Check if review exists and belongs to user
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!existingReview) {
    throw new AppError('Review not found', 404);
  }

  if (existingReview.userId !== userId) {
    throw new AppError('You can only update your own reviews', 403);
  }

  if (existingReview.teamId !== teamId) {
    throw new AppError('Review does not belong to this team', 400);
  }

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: validatedData,
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      team: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: review,
    message: 'Review updated successfully'
  };

  res.json(response);
});

export const deleteReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { reviewId } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!existingReview) {
    throw new AppError('Review not found', 404);
  }

  if (existingReview.userId !== userId && userRole !== 'ADMIN') {
    throw new AppError('You can only delete your own reviews', 403);
  }

  await prisma.review.delete({
    where: { id: reviewId }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Review deleted successfully'
  };

  res.json(response);
});