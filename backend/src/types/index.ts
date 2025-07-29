export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  location: string;
  state: string;
  ageGroups: string;
  description?: string;
  contact?: string;
  status: string;
  suggestedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  suggester?: User;
  approver?: User;
  reviews?: Review[];
  _count?: {
    reviews: number;
  };
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  reviews?: TournamentReview[];
  _count?: {
    reviews: number;
  };
}

export interface Review {
  id: string;
  teamId: string;
  userId: string | null;
  coaching_rating: number;
  value_rating: number;
  organization_rating: number;
  playing_time_rating: number;
  overall_rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  team?: Team;
}

export interface TournamentReview {
  id: string;
  tournamentId: string;
  userId: string | null;
  overall_rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  tournament?: Tournament;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  message: string;
  createdAt: Date;
  user?: User;
  room?: ChatRoom;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TeamQuery {
  search?: string;
  state?: string;
  ageGroup?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface CreateReviewRequest {
  coaching_rating: number;
  value_rating: number;
  organization_rating: number;
  playing_time_rating: number;
  overall_rating: number;
  comment?: string;
}

export interface CreateTournamentReviewRequest {
  overall_rating: number;
  comment?: string;
}

export interface CreateTeamRequest {
  name: string;
  location: string;
  state: string;
  ageGroups: string[];
}

export interface CreateTournamentRequest {
  name: string;
  location: string;
  description?: string;
}

export interface CreateMessageRequest {
  message: string;
}

export interface SocketEvents {
  'join-room': (roomId: string) => void;
  'leave-room': (roomId: string) => void;
  'send-message': (data: { roomId: string; message: string }) => void;
  'new-message': (message: ChatMessage) => void;
  'user-joined': (data: { userId: string; roomId: string }) => void;
  'user-left': (data: { userId: string; roomId: string }) => void;
}

export type UserRole = 'USER' | 'ADMIN';
export type ChatRoomType = 'GLOBAL' | 'STATE';

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

export const AGE_GROUPS = [
  '8U', '9U', '10U', '11U', '12U', '13U', '14U', '15U', '16U', '17U', '18U'
] as const;

export type USState = typeof US_STATES[number];
export type AgeGroup = typeof AGE_GROUPS[number];