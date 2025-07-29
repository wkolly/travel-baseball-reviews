import { Response } from 'express';
import { prisma } from '../utils/database';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

export const getPendingTeams = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        suggester: {
          select: { id: true, name: true, email: true }
        }
      }
    }),
    prisma.team.count({ where: { status: 'pending' } })
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      teams,
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

export const approveTeam = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminUser = req.user!;

  const team = await prisma.team.findUnique({
    where: { id }
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  if (team.status !== 'pending') {
    throw new AppError('Team is not pending approval', 400);
  }

  const updatedTeam = await prisma.team.update({
    where: { id },
    data: {
      status: 'approved',
      approvedBy: adminUser.id,
      approvedAt: new Date()
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      approver: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: updatedTeam,
    message: 'Team approved successfully'
  };

  res.json(response);
});

export const rejectTeam = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminUser = req.user!;

  const team = await prisma.team.findUnique({
    where: { id }
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  if (team.status !== 'pending') {
    throw new AppError('Team is not pending approval', 400);
  }

  const updatedTeam = await prisma.team.update({
    where: { id },
    data: {
      status: 'rejected',
      approvedBy: adminUser.id,
      approvedAt: new Date(),
      // Store rejection reason in description if provided
      ...(reason && { description: `${team.description || ''}\n\nRejection reason: ${reason}`.trim() })
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      approver: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: updatedTeam,
    message: 'Team rejected successfully'
  };

  res.json(response);
});

export const getAdminStats = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const [pendingCount, approvedCount, rejectedCount, totalReviews] = await Promise.all([
    prisma.team.count({ where: { status: 'pending' } }),
    prisma.team.count({ where: { status: 'approved' } }),
    prisma.team.count({ where: { status: 'rejected' } }),
    prisma.review.count()
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      teams: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount
      },
      reviews: {
        total: totalReviews
      }
    }
  };

  res.json(response);
});

// Get all users for admin
export const getUsers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            teams: true,
            tournaments: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    }),
    prisma.user.count()
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      users,
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

// Get all teams for admin (including pending/rejected)
export const getAllTeams = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '20', status } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where = status ? { status: status as string } : {};

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        suggester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    }),
    prisma.team.count({ where })
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      teams,
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

// Get all tournaments for admin
export const getAllTournaments = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [tournaments, total] = await Promise.all([
    prisma.tournament.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    }),
    prisma.tournament.count()
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      tournaments,
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

// Update team (admin only)
export const updateTeam = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, location, state, ageGroups, description, contact } = req.body;

  const team = await prisma.team.findUnique({
    where: { id }
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const updatedTeam = await prisma.team.update({
    where: { id },
    data: {
      name,
      location,
      state,
      ageGroups: JSON.stringify(ageGroups),
      description,
      contact
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      suggester: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      approver: {
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
    data: updatedTeam,
    message: 'Team updated successfully'
  };

  res.json(response);
});

// Delete team (admin only)
export const deleteTeam = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const team = await prisma.team.findUnique({
    where: { id }
  });

  if (!team) {
    throw new AppError('Team not found', 404);
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

// Update tournament (admin only)
export const updateTournament = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, location, description } = req.body;

  const tournament = await prisma.tournament.findUnique({
    where: { id }
  });

  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  const updatedTournament = await prisma.tournament.update({
    where: { id },
    data: {
      name,
      location,
      description
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
    data: updatedTournament,
    message: 'Tournament updated successfully'
  };

  res.json(response);
});

// Delete tournament (admin only)
export const deleteTournament = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const tournament = await prisma.tournament.findUnique({
    where: { id }
  });

  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  await prisma.tournament.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Tournament deleted successfully'
  };

  res.json(response);
});

// Get all reviews for admin
export const getAllReviews = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '20', type } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get team reviews
  const [teamReviews, teamReviewsTotal] = await Promise.all([
    prisma.review.findMany({
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: type === 'tournament' ? 0 : skip,
      take: type === 'tournament' ? undefined : limitNum
    }),
    prisma.review.count()
  ]);

  // Get tournament reviews
  const [tournamentReviews, tournamentReviewsTotal] = await Promise.all([
    prisma.tournamentReview.findMany({
      include: {
        tournament: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: type === 'team' ? 0 : skip,
      take: type === 'team' ? undefined : limitNum
    }),
    prisma.tournamentReview.count()
  ]);

  // Combine and format reviews
  const allReviews = [
    ...teamReviews.map(review => ({
      ...review,
      type: 'team' as const,
      entityName: review.team.name,
      entityId: review.team.id
    })),
    ...tournamentReviews.map(review => ({
      ...review,
      type: 'tournament' as const,
      entityName: review.tournament.name,
      entityId: review.tournament.id
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Apply pagination to combined results if no type filter
  const paginatedReviews = type ? allReviews : allReviews.slice(skip, skip + limitNum);
  const total = teamReviewsTotal + tournamentReviewsTotal;

  const response: ApiResponse = {
    success: true,
    data: {
      reviews: paginatedReviews,
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

// Delete team review (admin only)
export const deleteTeamReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const review = await prisma.review.findUnique({
    where: { id }
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  await prisma.review.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Team review deleted successfully'
  };

  res.json(response);
});

// Delete tournament review (admin only)
export const deleteTournamentReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const review = await prisma.tournamentReview.findUnique({
    where: { id }
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  await prisma.tournamentReview.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Tournament review deleted successfully'
  };

  res.json(response);
});