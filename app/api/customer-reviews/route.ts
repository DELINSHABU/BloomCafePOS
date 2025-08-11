import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const reviewsFilePath = path.join(process.cwd(), 'data', 'customer-reviews.json');

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  timestamp: string;
  approved: boolean;
}

interface ReviewsData {
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

// Helper function to update stats
const calculateStats = (reviews: Review[]): ReviewsData['stats'] => {
  const approvedReviews = reviews.filter(review => review.approved);
  const totalReviews = approvedReviews.length;
  
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
    };
  }

  const ratingBreakdown = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
  let totalRating = 0;

  approvedReviews.forEach(review => {
    totalRating += review.rating;
    ratingBreakdown[review.rating.toString()]++;
  });

  const averageRating = parseFloat((totalRating / totalReviews).toFixed(2));

  return {
    totalReviews,
    averageRating,
    ratingBreakdown
  };
};

// GET - Retrieve approved reviews
export async function GET() {
  try {
    if (!fs.existsSync(reviewsFilePath)) {
      return NextResponse.json(
        { error: 'Reviews file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(reviewsFilePath, 'utf8');
    const reviewsData: ReviewsData = JSON.parse(fileContent);

    // Update date strings and filter approved reviews
    const approvedReviews = reviewsData.reviews
      .filter(review => review.approved)
      .map(review => ({
        ...review,
        date: getTimeAgo(review.timestamp)
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      reviews: approvedReviews,
      stats: reviewsData.stats
    });
  } catch (error) {
    console.error('Error reading reviews:', error);
    return NextResponse.json(
      { error: 'Failed to read reviews' },
      { status: 500 }
    );
  }
}

// POST - Add new review
export async function POST(request: NextRequest) {
  try {
    const { name, rating, comment } = await request.json();

    // Validation
    if (!name || !rating || !comment) {
      return NextResponse.json(
        { error: 'Name, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10 || comment.trim().length > 500) {
      return NextResponse.json(
        { error: 'Comment must be between 10 and 500 characters' },
        { status: 400 }
      );
    }

    // Load existing data
    let reviewsData: ReviewsData;
    if (fs.existsSync(reviewsFilePath)) {
      const fileContent = fs.readFileSync(reviewsFilePath, 'utf8');
      reviewsData = JSON.parse(fileContent);
    } else {
      // Create initial structure if file doesn't exist
      reviewsData = {
        reviews: [],
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
        },
        lastUpdated: new Date().toISOString()
      };
    }

    // Create new review
    const timestamp = new Date().toISOString();
    const newReview: Review = {
      id: Math.max(...reviewsData.reviews.map(r => r.id), 0) + 1,
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: 'Just now',
      avatar: '/blog/authors/default.jpg',
      timestamp,
      approved: true // Auto-approve for now, you can change this to false for moderation
    };

    // Add new review
    reviewsData.reviews.push(newReview);

    // Update stats
    reviewsData.stats = calculateStats(reviewsData.reviews);
    reviewsData.lastUpdated = timestamp;

    // Ensure data directory exists
    const dataDir = path.dirname(reviewsFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to file
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviewsData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Review added successfully!',
      review: {
        ...newReview,
        date: 'Just now'
      },
      stats: reviewsData.stats
    });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}
