import { NextRequest, NextResponse } from 'next/server';

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GooglePlaceDetails {
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
}

interface GooglePlacesResponse {
  result: GooglePlaceDetails;
  status: string;
}

// Transform Google review to our review format
function transformGoogleReview(googleReview: GoogleReview, index: number) {
  return {
    id: `google-${googleReview.time}-${index}`,
    name: googleReview.author_name,
    rating: googleReview.rating,
    comment: googleReview.text || 'No comment provided',
    date: googleReview.relative_time_description,
    avatar: googleReview.profile_photo_url || '/blog/authors/default.jpg',
    timestamp: new Date(googleReview.time * 1000).toISOString(),
    approved: true,
    source: 'google'
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get API key from environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
      return NextResponse.json(
        { 
          error: 'Google Places API configuration missing',
          reviews: [],
          stats: {
            totalReviews: 0,
            averageRating: 0,
            ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
          }
        },
        { status: 200 }
      );
    }

    // Fetch place details from Google Places API
    const fields = 'name,rating,user_ratings_total,reviews';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}&reviews_sort=newest`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache headers
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data: GooglePlacesResponse = await response.json();
    
    if (data.status !== 'OK') {
      console.warn(`Google Places API status: ${data.status}`);
      return NextResponse.json({
        error: `Google Places API status: ${data.status}`,
        reviews: [],
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
        }
      });
    }

    // Transform Google reviews to our format
    const googleReviews = data.result.reviews || [];
    const transformedReviews = googleReviews.map(transformGoogleReview);

    // Calculate stats from Google reviews
    const totalReviews = data.result.user_ratings_total || googleReviews.length;
    const averageRating = data.result.rating || 0;
    
    // Calculate rating breakdown from available reviews
    const ratingBreakdown = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    googleReviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingBreakdown[rating.toString()]++;
      }
    });

    return NextResponse.json({
      reviews: transformedReviews,
      stats: {
        totalReviews,
        averageRating,
        ratingBreakdown
      },
      placeName: data.result.name,
      source: 'google'
    });

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    
    // Return empty but valid response on error
    return NextResponse.json({
      error: 'Failed to fetch Google reviews',
      reviews: [],
      stats: {
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
      }
    });
  }
}
