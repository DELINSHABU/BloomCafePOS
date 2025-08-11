import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const reviewsFilePath = path.join(process.cwd(), 'data', 'customer-reviews.json');

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  timestamp: string;
  approved: boolean;
  source: 'local' | 'google';
}

interface LocalReviewsData {
  reviews: Review[];
  stats: {
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: {
      [key: string]: number;
    };
  };
  lastUpdated: string;
}

// Helper function to calculate date string (e.g., "2 days ago")
const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const reviewDate = new Date(timestamp);
  const diffInMs = now.getTime() - reviewDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return '1 week ago';
  if (diffInDays < 21) return '2 weeks ago';
  if (diffInDays < 28) return '3 weeks ago';
  if (diffInDays < 60) return '1 month ago';
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} months ago`;
};

// Fetch Google reviews
async function fetchGoogleReviews(): Promise<{ reviews: Review[]; stats: any; error?: string }> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
      return { reviews: [], stats: null };
    }

    const fields = 'name,rating,user_ratings_total,reviews';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}&reviews_sort=newest`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      return { reviews: [], stats: null, error: `Google API status: ${data.status}` };
    }

    // Transform Google reviews
    const googleReviews = (data.result.reviews || []).map((review: any, index: number) => ({
      id: `google-${review.time}-${index}`,
      name: review.author_name,
      rating: review.rating,
      comment: review.text || 'No comment provided',
      date: review.relative_time_description,
      avatar: review.profile_photo_url || '/blog/authors/default.jpg',
      timestamp: new Date(review.time * 1000).toISOString(),
      approved: true,
      source: 'google' as const
    }));

    const stats = {
      totalReviews: data.result.user_ratings_total || googleReviews.length,
      averageRating: data.result.rating || 0,
      placeName: data.result.name
    };

    return { reviews: googleReviews, stats };
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return { reviews: [], stats: null, error: 'Failed to fetch Google reviews' };
  }
}

// Load local reviews
function loadLocalReviews(): { reviews: Review[]; stats: any } {
  try {
    if (!fs.existsSync(reviewsFilePath)) {
      return { reviews: [], stats: null };
    }

    const fileContent = fs.readFileSync(reviewsFilePath, 'utf8');
    const data: LocalReviewsData = JSON.parse(fileContent);

    // Update date strings and filter approved reviews
    const localReviews = data.reviews
      .filter(review => review.approved)
      .map(review => ({
        ...review,
        date: getTimeAgo(review.timestamp),
        source: 'local' as const
      }));

    return { reviews: localReviews, stats: data.stats };
  } catch (error) {
    console.error('Error loading local reviews:', error);
    return { reviews: [], stats: null };
  }
}

// Combine and calculate stats
function combineReviews(localReviews: Review[], googleReviews: Review[], localStats: any, googleStats: any) {
  // Combine all reviews
  const allReviews = [...localReviews, ...googleReviews]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Calculate combined stats
  let totalReviews = localReviews.length;
  let totalRating = localReviews.reduce((sum, review) => sum + review.rating, 0);

  // Add Google stats if available
  if (googleStats) {
    totalReviews += googleStats.totalReviews;
    totalRating += googleStats.averageRating * Math.min(googleReviews.length, 5); // Google only returns max 5 reviews
  }

  const averageRating = totalReviews > 0 ? parseFloat((totalRating / totalReviews).toFixed(2)) : 0;

  // Calculate rating breakdown from all available reviews
  const ratingBreakdown = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
  allReviews.forEach(review => {
    const rating = Math.floor(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingBreakdown[rating.toString()]++;
    }
  });

  return {
    reviews: allReviews,
    stats: {
      totalReviews,
      averageRating,
      ratingBreakdown,
      localCount: localReviews.length,
      googleCount: googleReviews.length
    }
  };
}

export async function GET() {
  try {
    // Load local reviews
    const { reviews: localReviews, stats: localStats } = loadLocalReviews();
    
    // Fetch Google reviews
    const { reviews: googleReviews, stats: googleStats, error: googleError } = await fetchGoogleReviews();

    // Combine reviews and stats
    const combined = combineReviews(localReviews, googleReviews, localStats, googleStats);

    return NextResponse.json({
      ...combined,
      sources: {
        local: localReviews.length,
        google: googleReviews.length
      },
      googleError: googleError || null
    });

  } catch (error) {
    console.error('Error in all-reviews API:', error);
    return NextResponse.json(
      { error: 'Failed to load reviews' },
      { status: 500 }
    );
  }
}
