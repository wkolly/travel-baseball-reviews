import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { ApiResponse, CreateTournamentRequest } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export const getTournaments = catchAsync(async (req: Request, res: Response) => {
  const { page = '1', limit = '10', search } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause for search
  const where = search ? {
    OR: [
      { name: { contains: search as string, mode: 'insensitive' as const } },
      { location: { contains: search as string, mode: 'insensitive' as const } }
    ]
  } : {};

  const [tournaments, total] = await Promise.all([
    prisma.tournament.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    }),
    prisma.tournament.count({ where })
  ]);

  // Calculate average ratings for each tournament
  const tournamentsWithRatings = await Promise.all(
    tournaments.map(async (tournament) => {
      const avgRatingResult = await prisma.tournamentReview.aggregate({
        where: { tournamentId: tournament.id },
        _avg: { overall_rating: true }
      });

      return {
        ...tournament,
        avgRating: avgRatingResult._avg.overall_rating || 0
      };
    })
  );

  const response: ApiResponse = {
    success: true,
    data: {
      tournaments: tournamentsWithRatings,
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

export const getTournament = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      _count: {
        select: { reviews: true }
      }
    }
  });

  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  // Calculate average rating
  const avgRatingResult = await prisma.tournamentReview.aggregate({
    where: { tournamentId: id },
    _avg: { overall_rating: true }
  });

  const tournamentWithRating = {
    ...tournament,
    avgRating: avgRatingResult._avg.overall_rating || 0
  };

  const response: ApiResponse = {
    success: true,
    data: tournamentWithRating
  };

  res.json(response);
});

export const createTournament = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { name, location, description }: CreateTournamentRequest = req.body;
  const userId = req.user!.id;

  // Validate required fields
  if (!name || !location) {
    throw new AppError('Name and location are required', 400);
  }

  // Check if tournament with same name already exists
  const existingTournament = await prisma.tournament.findFirst({
    where: { name }
  });

  if (existingTournament) {
    throw new AppError('A tournament with this name already exists', 400);
  }

  const tournament = await prisma.tournament.create({
    data: {
      name,
      location,
      description,
      createdBy: userId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: { reviews: true }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: tournament,
    message: 'Tournament created successfully'
  };

  res.status(201).json(response);
});