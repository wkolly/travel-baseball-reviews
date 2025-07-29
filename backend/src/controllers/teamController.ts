import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { CreateTeamRequest, TeamQuery, ApiResponse, US_STATES, AGE_GROUPS } from '../types';

const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  state: z.enum(US_STATES, { errorMap: () => ({ message: 'Invalid state' }) }),
  ageGroups: z.array(z.enum(AGE_GROUPS)).min(1, 'At least one age group is required')
});

export const createTeam = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createTeamSchema.parse(req.body) as CreateTeamRequest;
  const userId = req.user!.id;

  const team = await prisma.team.create({
    data: {
      ...validatedData,
      ageGroups: JSON.stringify(validatedData.ageGroups), // Convert array to JSON string for SQLite
      createdBy: userId,
      suggestedBy: userId,
      status: 'pending' // All new teams start as pending
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      },
      _count: {
        select: { reviews: true }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: team,
    message: 'Team suggestion submitted successfully! It will appear on the site once approved.'
  };

  res.status(201).json(response);
});

export const getTeams = catchAsync(async (req: Request, res: Response) => {
  const {
    search,
    state,
    ageGroup,
    minRating,
    page = '1',
    limit = '10'
  } = req.query as any;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    status: 'approved' // ONLY SHOW APPROVED TEAMS
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (state) {
    where.state = state;
  }

  if (ageGroup) {
    // For SQLite, we need to search within the JSON string
    where.ageGroups = { contains: `"${ageGroup}"` };
  }

  const teams = await prisma.team.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      reviews: {
        select: {
          overall_rating: true
        }
      },
      _count: {
        select: { reviews: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limitNum
  });

  const total = await prisma.team.count({ where });

  // Calculate average ratings and filter by minRating if specified
  const teamsWithRatings = teams.map(team => {
    const avgRating = team.reviews.length > 0
      ? team.reviews.reduce((sum, review) => sum + review.overall_rating, 0) / team.reviews.length
      : 0;

    return {
      ...team,
      avgRating: Math.round(avgRating * 10) / 10,
      reviews: undefined // Remove reviews array from response
    };
  }).filter(team => !minRating || team.avgRating >= parseFloat(minRating as string));

  const response: ApiResponse = {
    success: true,
    data: {
      teams: teamsWithRatings,
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

export const getTeam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const team = await prisma.team.findUnique({
    where: { 
      id,
      status: 'approved' // ONLY SHOW APPROVED TEAMS
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { reviews: true }
      }
    }
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Calculate average ratings
  const avgRatings = team.reviews.reduce(
    (acc, review) => ({
      coaching: acc.coaching + review.coaching_rating,
      value: acc.value + review.value_rating,
      organization: acc.organization + review.organization_rating,
      playingTime: acc.playingTime + review.playing_time_rating,
      overall: acc.overall + review.overall_rating
    }),
    { coaching: 0, value: 0, organization: 0, playingTime: 0, overall: 0 }
  );

  const reviewCount = team.reviews.length;
  const ratings = reviewCount > 0 ? {
    coaching: Math.round((avgRatings.coaching / reviewCount) * 10) / 10,
    value: Math.round((avgRatings.value / reviewCount) * 10) / 10,
    organization: Math.round((avgRatings.organization / reviewCount) * 10) / 10,
    playingTime: Math.round((avgRatings.playingTime / reviewCount) * 10) / 10,
    overall: Math.round((avgRatings.overall / reviewCount) * 10) / 10
  } : null;

  const response: ApiResponse = {
    success: true,
    data: {
      ...team,
      ratings
    }
  };

  res.json(response);
});

export const updateTeam = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const validatedData = createTeamSchema.partial().parse(req.body);

  // Check if team exists and user has permission
  const existingTeam = await prisma.team.findUnique({
    where: { id }
  });

  if (!existingTeam) {
    throw new AppError('Team not found', 404);
  }

  if (existingTeam.createdBy !== userId && userRole !== 'ADMIN') {
    throw new AppError('You can only update your own teams', 403);
  }

  // Convert ageGroups array to JSON string if it exists
  const updateData: any = {
    ...validatedData,
  };
  
  if (validatedData.ageGroups) {
    updateData.ageGroups = JSON.stringify(validatedData.ageGroups);
  }

  const team = await prisma.team.update({
    where: { id },
    data: updateData,
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
    data: team,
    message: 'Team updated successfully'
  };

  res.json(response);
});

export const deleteTeam = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const existingTeam = await prisma.team.findUnique({
    where: { id }
  });

  if (!existingTeam) {
    throw new AppError('Team not found', 404);
  }

  if (existingTeam.createdBy !== userId && userRole !== 'ADMIN') {
    throw new AppError('You can only delete your own teams', 403);
  }

  await prisma.team.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Team deleted successfully'
  };

  res.json(response);
});