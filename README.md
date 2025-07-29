# Travel Baseball Reviews Platform

A full-stack application for reviewing and discovering travel baseball teams - like Yelp for travel baseball.

## 🚀 Features

- **Team Discovery**: Search and browse travel baseball teams by location, age group, and ratings
- **Reviews & Ratings**: Read and write detailed reviews with multiple rating categories
- **Real-time Chat**: Connect with other families through community chat rooms
- **User Authentication**: Secure JWT-based authentication system
- **Team Management**: Coaches can create and manage team profiles
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Tech Stack

### Backend
- **Node.js** with **Express.js** and **TypeScript**
- **PostgreSQL** database with **Prisma ORM**
- **JWT** authentication
- **Socket.io** for real-time chat
- **Zod** for data validation

### Frontend
- **React 18** with **TypeScript**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Socket.io Client** for real-time features
- **React Hook Form** for form handling

### Shared
- **TypeScript types** shared between frontend and backend
- Consistent data models and API interfaces

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd TravelBall
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   **Backend (.env)**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your database credentials and JWT secret:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/travel_baseball"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

   **Frontend (.env)**
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
   Edit `frontend/.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_SOCKET_URL=http://localhost:3001
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:generate
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

## 🚀 Development

### Start all services
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:3001
- Frontend development server on http://localhost:3000

### Individual services

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

**Build shared types:**
```bash
cd shared && npm run build
```

## 📊 Database Management

### Useful Prisma commands:
```bash
cd backend

# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Push schema changes without migration (development)
npm run db:push

# View data in Prisma Studio
npm run db:studio

# Reset database (careful!)
npx prisma migrate reset
```

## 🏗️ Project Structure

```
TravelBall/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── prisma/              # Database schema and migrations
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   └── services/        # API service functions
├── shared/                  # Shared TypeScript types
│   └── src/
│       └── types.ts         # Common type definitions
└── package.json             # Root workspace configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Teams
- `GET /api/teams` - List teams (with search/filter)
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create team (authenticated)
- `PUT /api/teams/:id` - Update team (authenticated)
- `DELETE /api/teams/:id` - Delete team (authenticated)

### Reviews
- `GET /api/reviews/teams/:teamId` - Get team reviews
- `POST /api/reviews/teams/:teamId` - Create review (authenticated)
- `PUT /api/reviews/teams/:teamId/:reviewId` - Update review (authenticated)
- `DELETE /api/reviews/:reviewId` - Delete review (authenticated)

### Chat
- `GET /api/chat/rooms` - List chat rooms
- `GET /api/chat/rooms/:roomId/messages` - Get room messages
- `POST /api/chat/rooms/:roomId/messages` - Send message (authenticated)

## 🎯 Development Workflow

1. **Make changes** to shared types in `/shared`
2. **Build shared package**: `cd shared && npm run build`
3. **Backend changes**: The server will restart automatically with nodemon
4. **Frontend changes**: Hot reload is enabled with Vite
5. **Database changes**: Create migrations with `npm run db:migrate`

## 🚀 Production Deployment

### Build the application
```bash
npm run build
```

### Environment Setup
Make sure to set production environment variables:
- Use a secure JWT secret
- Set up production PostgreSQL database
- Configure CORS for your domain
- Set NODE_ENV=production

### Database Migration
```bash
cd backend
npx prisma migrate deploy
```

## 🧪 Testing

Testing setup is not included in this initial version but can be added with:
- **Backend**: Jest + Supertest
- **Frontend**: Jest + React Testing Library
- **E2E**: Playwright or Cypress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the development server to test
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check that all dependencies are installed

## 🔄 Future Enhancements

- Advanced team search and filtering
- Image uploads for teams
- Email notifications
- Mobile app (React Native)
- Tournament integration
- Payment processing for team fees
- Advanced analytics and reporting