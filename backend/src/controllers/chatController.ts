import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { CreateMessageRequest, ApiResponse, US_STATES } from '@travel-baseball/shared';

const createMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long')
});

export const getChatRooms = catchAsync(async (req: Request, res: Response) => {
  const rooms = await prisma.chatRoom.findMany({
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  });

  const response: ApiResponse = {
    success: true,
    data: rooms
  };

  res.json(response);
});

export const getRoomMessages = catchAsync(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Check if room exists
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId }
  });

  if (!room) {
    throw new AppError('Chat room not found', 404);
  }

  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limitNum
  });

  const total = await prisma.chatMessage.count({
    where: { roomId }
  });

  const response: ApiResponse = {
    success: true,
    data: {
      room,
      messages: messages.reverse(), // Reverse to show oldest first
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

export const createMessage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.user!.id;
  const validatedData = createMessageSchema.parse(req.body) as CreateMessageRequest;

  // Check if room exists
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId }
  });

  if (!room) {
    throw new AppError('Chat room not found', 404);
  }

  const message = await prisma.chatMessage.create({
    data: {
      message: validatedData.message,
      roomId,
      userId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      room: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: message,
    message: 'Message sent successfully'
  };

  res.status(201).json(response);
});