import axios from 'axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse,
  Team,
  Review,
  Tournament,
  TournamentReview,
  CreateTeamRequest,
  CreateTournamentRequest,
  CreateReviewRequest,
  CreateTournamentReviewRequest,
  TeamQuery,
  ChatRoom,
  ChatMessage,
  CreateMessageRequest
} from '@travel-baseball/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 'https://api.travelbaseballreview.com/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/register', data);
    return response.data;
  },
  
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/login', data);
    return response.data;
  },
  
  getProfile: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<ApiResponse> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }
};

// Teams API
export const teamsAPI = {
  getTeams: async (query?: TeamQuery): Promise<ApiResponse> => {
    const response = await api.get('/teams', { params: query });
    return response.data;
  },
  
  getTeam: async (id: string): Promise<ApiResponse<Team>> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },
  
  createTeam: async (data: CreateTeamRequest): Promise<ApiResponse<Team>> => {
    const response = await api.post('/teams', data);
    return response.data;
  },
  
  updateTeam: async (id: string, data: Partial<CreateTeamRequest>): Promise<ApiResponse<Team>> => {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  },
  
  deleteTeam: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  }
};

// Reviews API
export const reviewsAPI = {
  getTeamReviews: async (teamId: string, page = 1, limit = 10): Promise<ApiResponse> => {
    const response = await api.get(`/reviews/teams/${teamId}`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  createReview: async (teamId: string, data: CreateReviewRequest): Promise<ApiResponse<Review>> => {
    const response = await api.post(`/reviews/teams/${teamId}`, data);
    return response.data;
  },
  
  updateReview: async (teamId: string, reviewId: string, data: CreateReviewRequest): Promise<ApiResponse<Review>> => {
    const response = await api.put(`/reviews/teams/${teamId}/${reviewId}`, data);
    return response.data;
  },
  
  deleteReview: async (reviewId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

// Tournaments API
export const tournamentsAPI = {
  getTournaments: async (query?: { search?: string; page?: number; limit?: number }): Promise<ApiResponse> => {
    const response = await api.get('/tournaments', { params: query });
    return response.data;
  },
  
  getTournament: async (id: string): Promise<ApiResponse<Tournament>> => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },
  
  createTournament: async (data: CreateTournamentRequest): Promise<ApiResponse<Tournament>> => {
    const response = await api.post('/tournaments', data);
    return response.data;
  }
};

// Tournament Reviews API
export const tournamentReviewsAPI = {
  getTournamentReviews: async (tournamentId: string, page = 1, limit = 10): Promise<ApiResponse> => {
    const response = await api.get(`/tournament-reviews/tournaments/${tournamentId}`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  createTournamentReview: async (tournamentId: string, data: CreateTournamentReviewRequest): Promise<ApiResponse<TournamentReview>> => {
    const response = await api.post(`/tournament-reviews/tournaments/${tournamentId}`, data);
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  getPendingTeams: async (page = 1, limit = 20): Promise<ApiResponse> => {
    const response = await api.get('/admin/pending-teams', {
      params: { page, limit }
    });
    return response.data;
  },
  
  approveTeam: async (teamId: string): Promise<ApiResponse> => {
    const response = await api.put(`/admin/teams/${teamId}/approve`);
    return response.data;
  },
  
  rejectTeam: async (teamId: string, reason?: string): Promise<ApiResponse> => {
    const response = await api.put(`/admin/teams/${teamId}/reject`, { reason });
    return response.data;
  },

  getUsers: async (page = 1, limit = 20): Promise<ApiResponse> => {
    const response = await api.get('/admin/users', { params: { page, limit } });
    return response.data;
  },

  getAllTeams: async (page = 1, limit = 20, status?: string): Promise<ApiResponse> => {
    const response = await api.get('/admin/teams', { params: { page, limit, status } });
    return response.data;
  },

  getAllTournaments: async (page = 1, limit = 20): Promise<ApiResponse> => {
    const response = await api.get('/admin/tournaments', { params: { page, limit } });
    return response.data;
  },

  updateTeam: async (teamId: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/admin/teams/${teamId}`, data);
    return response.data;
  },

  deleteTeam: async (teamId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/teams/${teamId}`);
    return response.data;
  },

  updateTournament: async (tournamentId: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/admin/tournaments/${tournamentId}`, data);
    return response.data;
  },

  deleteTournament: async (tournamentId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/tournaments/${tournamentId}`);
    return response.data;
  },

  getAllReviews: async (page = 1, limit = 20, type?: string): Promise<ApiResponse> => {
    const response = await api.get('/admin/reviews', { params: { page, limit, type } });
    return response.data;
  },

  deleteTeamReview: async (reviewId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/reviews/teams/${reviewId}`);
    return response.data;
  },

  deleteTournamentReview: async (reviewId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/reviews/tournaments/${reviewId}`);
    return response.data;
  }
};

// Chat API
export const chatAPI = {
  getRooms: async (): Promise<ApiResponse<ChatRoom[]>> => {
    const response = await api.get('/chat/rooms');
    return response.data;
  },
  
  getRoomMessages: async (roomId: string, page = 1, limit = 50): Promise<ApiResponse> => {
    const response = await api.get(`/chat/rooms/${roomId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  sendMessage: async (roomId: string, data: CreateMessageRequest): Promise<ApiResponse<ChatMessage>> => {
    const response = await api.post(`/chat/rooms/${roomId}/messages`, data);
    return response.data;
  }
};

export default api;