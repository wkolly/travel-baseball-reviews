import { createTeamReview, getReviewsByTeamId, getAllReviews, createTournamentReview, getReviewsByTournamentId, getAllTournamentReviews, initializeDatabase } from './postgres-db';

export default async function handler(req: any, res: any) {
  // Set CORS headers - allow multiple origins
  const allowedOrigins = [
    'https://travelbaseballreview.com',
    'https://www.travelbaseballreview.com',  
    'https://travel-baseball-reviews-frontend.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  console.log('Reviews request received:', { method: req.method, url });

  // Handle team reviews
  if (url?.includes('/team-reviews') || url?.includes('/reviews/teams')) {
    try {
      // Initialize database
      await initializeDatabase();
      
      if (req.method === 'GET') {
        const teamIdMatch = url?.match(/\/team-reviews\/([^\/\?]+)/) || url?.match(/team-reviews\?.*teamId=([^&]+)/) || url?.match(/\/reviews\/teams\/([^\/\?]+)/);
        const teamId = teamIdMatch?.[1] || '1';
        
        console.log('Team reviews for team ID:', teamId);
        
        const reviews = await getReviewsByTeamId(teamId);
        
        return res.status(200).json({
          success: true,
          data: {
            reviews: reviews
          },
          message: 'Team reviews retrieved successfully'
        });
      }
    } catch (error) {
      console.error('Error handling team reviews GET:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving team reviews',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    if (req.method === 'POST') {
      try {
        // Initialize database
        await initializeDatabase();
        
        const teamIdMatch = url?.match(/\/team-reviews\/([^\/\?]+)/) || url?.match(/team-reviews\?.*teamId=([^&]+)/) || url?.match(/\/reviews\/teams\/([^\/\?]+)/);
        const teamId = teamIdMatch?.[1];
        
        if (!teamId) {
          return res.status(400).json({
            success: false,
            message: 'Team ID is required'
          });
        }
        
        const reviewData = {
          teamId: teamId,
          userId: req.body?.userId || null, // Can be null for anonymous reviews
          coaching_rating: req.body?.coaching_rating,
          value_rating: req.body?.value_rating,
          organization_rating: req.body?.organization_rating,
          playing_time_rating: req.body?.playing_time_rating,
          overall_rating: req.body?.overall_rating,
          comment: req.body?.comment
        };
        
        console.log('Creating team review:', reviewData);
        
        const newReview = await createTeamReview(reviewData);
        
        return res.status(201).json({
          success: true,
          data: newReview,
          message: 'Team review created successfully'
        });
      } catch (error) {
        console.error('Error creating team review:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating team review',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  // Handle tournament reviews
  if (url?.includes('/tournament-reviews')) {
    try {
      // Initialize database
      await initializeDatabase();
      
      if (req.method === 'GET') {
        const tournamentIdMatch = url?.match(/\/tournament-reviews\/(?:tournaments\/)?([^\/\?]+)/) || url?.match(/tournament-reviews\?.*tournamentId=([^&]+)/);
        const tournamentId = tournamentIdMatch?.[1] || '1';
        
        console.log('Tournament reviews for tournament ID:', tournamentId);
        
        const reviews = await getReviewsByTournamentId(tournamentId);
        
        return res.status(200).json({
          success: true,
          data: {
            reviews: reviews
          },
          message: 'Tournament reviews retrieved successfully'
        });
      }

      if (req.method === 'POST') {
        const tournamentIdMatch = url?.match(/\/tournament-reviews\/(?:tournaments\/)?([^\/\?]+)/) || url?.match(/tournament-reviews\?.*tournamentId=([^&]+)/);
        const tournamentId = tournamentIdMatch?.[1];
        
        if (!tournamentId) {
          return res.status(400).json({
            success: false,
            message: 'Tournament ID is required'
          });
        }
        
        const reviewData = {
          tournamentId: tournamentId,
          userId: req.body?.userId || null, // Can be null for anonymous reviews
          overall_rating: req.body?.overall_rating,
          comment: req.body?.comment
        };
        
        console.log('Creating tournament review:', reviewData);
        
        const newReview = await createTournamentReview(reviewData);
        
        return res.status(201).json({
          success: true,
          data: newReview,
          message: 'Tournament review created successfully'
        });
      }
    } catch (error) {
      console.error('Error handling tournament reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Error handling tournament reviews',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Handle general reviews
  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      data: {
        id: 'new-review-id',
        overall_rating: req.body?.overall_rating || 5,
        comment: req.body?.comment || '',
        createdAt: new Date().toISOString()
      },
      message: 'Review submitted successfully'
    });
  }

  // Handle GET for fetching reviews
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        reviews: [
          {
            id: '1',
            overall_rating: 4,
            coaching_rating: 5,
            value_rating: 4,
            organization_rating: 4,
            playing_time_rating: 3,
            comment: 'Great coaching staff and well organized team.',
            createdAt: new Date().toISOString()
          }
        ]
      },
      message: 'Reviews retrieved successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}