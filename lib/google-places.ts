// Google Places API service for fetching reviews
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

export class GooglePlacesService {
  private apiKey: string;
  private placeId: string;

  constructor(apiKey: string, placeId: string) {
    this.apiKey = apiKey;
    this.placeId = placeId;
  }

  async fetchPlaceDetails(): Promise<GooglePlaceDetails | null> {
    try {
      const fields = 'name,rating,user_ratings_total,reviews';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=${fields}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data: GooglePlacesResponse = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API status: ${data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error fetching Google Places data:', error);
      return null;
    }
  }

  async fetchReviews(): Promise<GoogleReview[]> {
    const placeDetails = await this.fetchPlaceDetails();
    return placeDetails?.reviews || [];
  }

  // Transform Google review to our review format
  static transformGoogleReview(googleReview: GoogleReview, index: number): any {
    return {
      id: `google-${Date.now()}-${index}`,
      name: googleReview.author_name,
      rating: googleReview.rating,
      comment: googleReview.text,
      date: googleReview.relative_time_description,
      avatar: googleReview.profile_photo_url || '/blog/authors/default.jpg',
      timestamp: new Date(googleReview.time * 1000).toISOString(),
      approved: true,
      source: 'google'
    };
  }
}

// Alternative: Server-side proxy to avoid CORS issues
export async function fetchGoogleReviewsServerSide(placeId: string, apiKey: string): Promise<GoogleReview[]> {
  try {
    const fields = 'name,rating,user_ratings_total,reviews';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    
    // Note: This needs to be called from a server environment (API route)
    const response = await fetch(url);
    const data: GooglePlacesResponse = await response.json();
    
    if (data.status === 'OK') {
      return data.result.reviews || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return [];
  }
}
