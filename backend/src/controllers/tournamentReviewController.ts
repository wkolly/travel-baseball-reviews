import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { CreateTournamentReviewRequest, ApiResponse } from '@travel-baseball/shared';

const createTournamentReviewSchema = z.object({
  overall_rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

export const createTournamentReview = catchAsync(async (req: Request, res: Response) => {
  const { tournamentId } = req.params;
  const validatedData = createTournamentReviewSchema.parse(req.body) as CreateTournamentReviewRequest;

  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });

  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  // Create anonymous review
  const review = await prisma.tournamentReview.create({
    data: {
      ...validatedData,
      tournamentId,
      userId: null // null for anonymous reviews
    },
    include: {
      tournament: {
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
    message: 'Tournament review created successfully'
  };

  res.status(201).json(response);
});

export const getTournamentReviews = catchAsync(async (req: Request, res: Response) => {
  const { tournamentId } = req.params;
  const { page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });

  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  const reviews = await prisma.tournamentReview.findMany({
    where: { tournamentId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limitNum
  });

  const total = await prisma.tournamentReview.count({
    where: { tournamentId }
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