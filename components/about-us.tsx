'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Coffee,
  Star,
  Heart,
  Award,
  ArrowLeft,
  Quote,
  Plus,
  Send,
  Loader2,
  ExternalLink,
  Map,
  PartyPopper,
  Calendar,
  Gift,
  Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import GlassSurface from './GlassSurface'
import BlogSection from './blog-section'

interface AboutUsProps {
  onBack: () => void;
}

interface AboutUsContent {
  header: {
    logo: string;
    logoAlt: string;
    logoWidth: number;
    logoHeight: number;
    tagline: string;
    backgroundVideo: string;
  };
  sections: {
    ourStory: {
      title: string;
      icon: string;
      iconColor: string;
      content: string;
      glassEffect: any;
    };
    whatMakesUsSpecial: {
      title: string;
      icon: string;
      iconColor: string;
      features: Array<{
        icon: string;
        iconColor: string;
        title: string;
        description: string;
      }>;
      glassEffect: any;
    };
    aboutUs: {
      title: string;
      icon: string;
      iconColor: string;
      sections: {
        applicantDetails: {
          title: string;
          details: {
            fullName: string;
            businessName: string;
            contact: {
              phone: string;
              email: string;
            };
            residentialAddress: string;
            businessAddress: string;
          };
        };
        businessOverview: {
          title: string;
          establishmentType: string;
          theme: string;
          targetAudience: string;
        };
        menuConcept: {
          title: string;
          description: string;
          signatureDishes: string[];
          options: string;
        };
        legalCompliance: {
          title: string;
          licenses: string[];
        };
        businessModel: {
          title: string;
          structure: string;
          partners: string[];
          stakeholders: string;
        };
        infrastructure: {
          title: string;
          seatingCapacity: string;
          facilities: string[];
        };
        staffing: {
          title: string;
          totalEmployees: string;
          roles: string[];
          operations: string;
        };
        marketingStrategy: {
          title: string;
          brandIdentity: string;
          socialMedia: string;
          promotions: string;
          partnerships: string;
        };
        safetyProtocols: {
          title: string;
          measures: string[];
        };
        financials: {
          title: string;
          capitalInvested: string;
          equipmentCost: string;
          monthlyOperating: string;
          expectedRevenue: string;
          breakEven: string;
        };
        supportingDocs: {
          title: string;
          documents: string[];
        };
      };
      closingStatement: string;
      glassEffect: any;
    };
    visitUs: {
      title: string;
      icon: string;
      iconColor: string;
      location: {
        icon: string;
        title: string;
        address: string[];
      };
      contact: {
        phone: {
          icon: string;
          title: string;
          number: string;
        };
        email: {
          icon: string;
          title: string;
          address: string;
        };
      };
      hours: {
        icon: string;
        title: string;
        schedule: Array<{
          days: string;
          time: string;
        }>;
      };
      glassEffect: any;
    };
    ourMission: {
      title: string;
      content: string;
      textColor: string;
      contentColor: string;
      glassEffect: any;
    };
  };
  backToMenuButton: {
    text: string;
    className: string;
  };
  lastUpdated: string;
  updatedBy: string;
}

// Icon mapping for dynamic icon rendering
const IconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Heart,
  Star,
  MapPin,
  Coffee,
  Users,
  Award,
  Phone,
  Mail,
  Clock,
  Quote,
  Map,
  PartyPopper,
  Calendar,
  Gift,
  Sparkles,
};

// Review interfaces
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

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    [key: string]: number;
  };
}

// Star rating component with flowing wave animations
const StarRating = ({ rating, size = "w-4 h-4", animate = true }: { rating: number; size?: string; animate?: boolean }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} transition-all duration-500 transform ${
            star <= rating
              ? animate 
                ? "text-yellow-400 fill-yellow-400 animate-bounce scale-110" 
                : "text-yellow-400 fill-yellow-400"
              : "text-gray-300 scale-90"
          }`}
          style={{
            animationDelay: animate ? `${star * 150}ms` : '0ms',
            animationDuration: "1s",
            animationIterationCount: "infinite",
            animationDirection: star % 2 === 0 ? "normal" : "reverse"
          }}
        />
      ))}
    </div>
  );
};

// Large star rating with wave effect
const LargeStarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-2 relative">
      <div className="absolute inset-0 animate-pulse bg-yellow-400/20 rounded-full blur-xl"></div>
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative">
          <Star
            className={`w-8 h-8 transition-all duration-700 transform ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400 animate-bounce"
                : "text-gray-400 scale-75"
            }`}
            style={{
              animationDelay: `${star * 200}ms`,
              animationDuration: "2s",
              filter: star <= rating ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none'
            }}
          />
          {star <= rating && (
            <div 
              className="absolute inset-0 animate-ping"
              style={{
                animationDelay: `${star * 200 + 1000}ms`,
                animationDuration: "3s"
              }}
            >
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 opacity-75" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function AboutUs({ onBack }: AboutUsProps) {
  const [content, setContent] = useState<AboutUsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Event booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: 'Birthday Party',
    eventDate: '',
    eventTime: '',
    guestCount: 10,
    specialRequests: ''
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    loadContent();
    loadReviews();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/about-us-content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        console.error('Failed to load About Us content');
      }
    } catch (error) {
      console.error('Error loading About Us content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      // Fetch combined local and Google reviews
      const response = await fetch('/api/all-reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setReviewStats(data.stats);
        
        // Log sources for debugging
        if (data.sources) {
          console.log(`Loaded ${data.sources.local} local reviews and ${data.sources.google} Google reviews`);
        }
        
        if (data.googleError) {
          console.warn('Google reviews error:', data.googleError);
        }
      } else {
        console.error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      setSubmitMessage('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/customer-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitMessage('Thank you for your review! ⭐');
        setReviewForm({ name: '', rating: 5, comment: '' });
        setShowReviewForm(false);
        
        // Reload reviews to show the new one
        await loadReviews();
      } else {
        const errorData = await response.json();
        setSubmitMessage(errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitMessage('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.name.trim() || !bookingForm.phone.trim() || !bookingForm.email.trim() || !bookingForm.eventDate || !bookingForm.eventTime) {
      setBookingMessage('Please fill in all required fields.');
      return;
    }

    setBookingSubmitting(true);
    setBookingMessage('');

    try {
      const response = await fetch('/api/event-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        const data = await response.json();
        setBookingMessage('🎉 Event booking submitted successfully! We will contact you soon.');
        setBookingForm({
          name: '',
          phone: '',
          email: '',
          eventType: 'Birthday Party',
          eventDate: '',
          eventTime: '',
          guestCount: 10,
          specialRequests: ''
        });
        setShowBookingForm(false);
      } else {
        const errorData = await response.json();
        setBookingMessage(errorData.error || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setBookingMessage('Failed to submit booking. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const renderIcon = (iconName: string, className: string = '') => {
    const IconComponent = IconMap[iconName];
    return IconComponent ? <IconComponent className={className} /> : <Heart className={className} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading About Us content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600">Failed to load About Us content. Please try again later.</p>
          <Button onClick={onBack} className="mt-4">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <video
        className="fixed inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={content.header.backgroundVideo} type="video/mp4" />
      </video>

      {/* Overlay to darken video slightly */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-10"></div>
      {/* Header */}
      <div className="relative z-20 bg-transparent px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-emerald-700 hover:bg-gray-50 flex items-center gap-2 absolute left-4 sm:left-6 lg:left-8"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <Image
                src={content.header.logo}
                alt={content.header.logoAlt}
                width={content.header.logoWidth}
                height={content.header.logoHeight}
                className="mx-auto"
                priority
              />
            </div>
            <p className="text-xl lg:text-2xl xl:text-3xl text-white">
              {content.header.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        <div className="space-y-8 text-center">
          {/* Our Story */}
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={content.sections.ourStory.glassEffect.borderRadius}
            displace={content.sections.ourStory.glassEffect.displace}
            distortionScale={content.sections.ourStory.glassEffect.distortionScale}
            redOffset={content.sections.ourStory.glassEffect.redOffset}
            greenOffset={content.sections.ourStory.glassEffect.greenOffset}
            blueOffset={content.sections.ourStory.glassEffect.blueOffset}
            brightness={content.sections.ourStory.glassEffect.brightness}
            opacity={content.sections.ourStory.glassEffect.opacity}
            mixBlendMode={content.sections.ourStory.glassEffect.mixBlendMode}
            className="p-6"
          >
            <div>
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-white mb-3 flex items-center justify-center gap-2 drop-shadow-lg">
                {renderIcon(content.sections.ourStory.icon, `w-5 h-5 ${content.sections.ourStory.iconColor}`)}
                {content.sections.ourStory.title}
              </h3>
              <p className="text-white/90 text-base lg:text-lg xl:text-xl leading-relaxed max-w-5xl mx-auto drop-shadow-md">
                {content.sections.ourStory.content}
              </p>
            </div>
          </GlassSurface>

          {/* Blog Section */}
          <BlogSection limit={3} showFeatured={false} />

          {/* What Makes Us Special */}
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={content.sections.whatMakesUsSpecial.glassEffect.borderRadius}
            displace={content.sections.whatMakesUsSpecial.glassEffect.displace}
            distortionScale={content.sections.whatMakesUsSpecial.glassEffect.distortionScale}
            redOffset={content.sections.whatMakesUsSpecial.glassEffect.redOffset}
            greenOffset={content.sections.whatMakesUsSpecial.glassEffect.greenOffset}
            blueOffset={content.sections.whatMakesUsSpecial.glassEffect.blueOffset}
            brightness={content.sections.whatMakesUsSpecial.glassEffect.brightness}
            opacity={content.sections.whatMakesUsSpecial.glassEffect.opacity}
            mixBlendMode={content.sections.whatMakesUsSpecial.glassEffect.mixBlendMode}
            className="p-6"
          >
            <div>
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-white mb-6 flex items-center justify-center gap-2 drop-shadow-lg">
                {renderIcon(content.sections.whatMakesUsSpecial.icon, `w-5 h-5 ${content.sections.whatMakesUsSpecial.iconColor}`)}
                {content.sections.whatMakesUsSpecial.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
                {content.sections.whatMakesUsSpecial.features.map((feature, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 lg:p-6">
                    <div className="flex items-center gap-3 mb-2">
                      {renderIcon(feature.icon, `w-5 h-5 ${feature.iconColor}`)}
                      <h4 className="font-semibold text-white lg:text-lg">{feature.title}</h4>
                    </div>
                    <p className="text-sm lg:text-base text-white/80">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </GlassSurface>

          {/* Customer Reviews */}
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={24}
            displace={5}
            distortionScale={-50}
            redOffset={5}
            greenOffset={15}
            blueOffset={25}
            brightness={10}
            opacity={0}
            mixBlendMode="multiply"
            className="p-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center gap-2 drop-shadow-lg">
                <Star className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                What Our Customers Say
                <Star className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s", animationDirection: "reverse" }} />
              </h3>
              
              {/* Overall Rating */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <LargeStarRating rating={Math.ceil(reviewStats?.averageRating || 4.9)} />
                  <span className="text-3xl font-bold text-white ml-2 animate-pulse">
                    {reviewStats?.averageRating || 4.9}
                  </span>
                </div>
                <p className="text-white/90 text-sm animate-fade-in">
                  Based on {reviewStats?.totalReviews || 0} reviews
                </p>
                {reviewStats?.localCount !== undefined && reviewStats?.googleCount !== undefined && (
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      {reviewStats.localCount} Local
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      {reviewStats.googleCount} Google
                    </span>
                  </div>
                )}
              </div>

              {/* Add Review Button */}
              <div className="text-center mb-6">
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-yellow-400/20 hover:bg-yellow-400/30 text-white border border-yellow-400/50 backdrop-blur-md transition-all duration-300 hover:scale-105"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2 animate-pulse" />
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </Button>
                {submitMessage && (
                  <p className={`mt-2 text-sm ${
                    submitMessage.includes('Thank you') 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {submitMessage}
                  </p>
                )}
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <div className="mb-8 max-w-md mx-auto">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4 text-center">Share Your Experience</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Your Name"
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md"
                          maxLength={50}
                          required
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-6 h-6 cursor-pointer transition-all duration-200 ${
                                star <= reviewForm.rating
                                  ? 'text-yellow-400 fill-yellow-400 hover:scale-110'
                                  : 'text-gray-400 hover:text-yellow-400 hover:scale-110'
                              }`}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            />
                          ))}
                        </div>
                        <p className="text-center text-white/70 text-sm">Click to rate</p>
                      </div>
                      
                      <div>
                        <Textarea
                          placeholder="Tell us about your experience..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md min-h-[100px] resize-none"
                          maxLength={500}
                          required
                        />
                        <p className="text-right text-white/50 text-xs mt-1">
                          {reviewForm.comment.length}/500
                        </p>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-yellow-400/20 hover:bg-yellow-400/30 text-white border border-yellow-400/50 backdrop-blur-md"
                        variant="outline"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {reviews.map((review, index) => (
                  <div 
                    key={review.id} 
                    className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/20 animate-slide-up relative ${
                      review.source === 'google' ? 'border-green-400/30' : 'border-blue-400/30'
                    }`}
                    style={{
                      animationDelay: `${index * 300}ms`,
                      animationDuration: "800ms",
                      animationFillMode: "both"
                    }}
                  >
                    {/* Source indicator */}
                    <div className="absolute top-2 right-2">
                      {review.source === 'google' ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          Google
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          Local
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover border-2 border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300"
                          unoptimized
                        />
                        <div className="absolute -top-1 -right-1">
                          <div className="relative">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                            <div className="absolute inset-0 animate-ping">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 opacity-50" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm pr-16">{review.name}</h4>
                          <span className="text-white/60 text-xs">{review.date}</span>
                        </div>
                        <div className="relative">
                          <StarRating rating={review.rating} animate={true} />
                          {/* Flowing star trail effect */}
                          <div className="absolute -inset-2 pointer-events-none">
                            <div 
                              className="absolute h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent animate-pulse"
                              style={{
                                width: `${review.rating * 20}%`,
                                top: "50%",
                                animationDuration: "2s",
                                animationDelay: `${index * 500}ms`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-1 w-4 h-4 text-white/30 animate-pulse" />
                      <p className="text-sm text-white/90 leading-relaxed pl-3">
                        {review.comment}
                      </p>
                    </div>
                    
                    {/* Constellation effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                      <div 
                        className="absolute w-full h-full opacity-30"
                        style={{
                          background: `radial-gradient(circle at ${20 + index * 15}% ${30 + index * 10}%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)`
                        }}
                      />
                      {/* Animated star constellation */}
                      {[...Array(2)].map((_, i) => (
                        <Star
                          key={i}
                          className="absolute w-1 h-1 text-yellow-400 fill-yellow-400 animate-twinkle"
                          style={{
                            top: `${10 + i * 40}%`,
                            right: `${5 + i * 20}%`,
                            animationDelay: `${i * 1000 + index * 300}ms`,
                            animationDuration: "3s"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center mt-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3">
                  <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                  <span className="text-white font-medium">
                    Join {reviewStats?.totalReviews || 500}+ Happy Customers!
                  </span>
                  <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
                
                {/* Google Reviews Link */}
                <div className="mt-4">
                  <a
                    href="https://maps.app.goo.gl/ZBUTd6Hv9DqKaKTJ9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 border border-green-400/50 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Leave a Google Review
                  </a>
                </div>
              </div>
            </div>
          </GlassSurface>

          {/* About Us - Cafe Application Details */}
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={content.sections.aboutUs.glassEffect.borderRadius}
            displace={content.sections.aboutUs.glassEffect.displace}
            distortionScale={content.sections.aboutUs.glassEffect.distortionScale}
            redOffset={content.sections.aboutUs.glassEffect.redOffset}
            greenOffset={content.sections.aboutUs.glassEffect.greenOffset}
            blueOffset={content.sections.aboutUs.glassEffect.blueOffset}
            brightness={content.sections.aboutUs.glassEffect.brightness}
            opacity={content.sections.aboutUs.glassEffect.opacity}
            mixBlendMode={content.sections.aboutUs.glassEffect.mixBlendMode}
            className="p-6"
          >
            <div>
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-white mb-6 flex items-center justify-center gap-2 drop-shadow-lg">
                {renderIcon(content.sections.aboutUs.icon, `w-5 h-5 ${content.sections.aboutUs.iconColor}`)}
                {content.sections.aboutUs.title}
              </h3>
              
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Simplified grid layout with only 1-2 key cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
                  {/* Business Overview - Key Card 1 */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-center">
                    <h4 className="font-semibold text-white mb-4 text-base lg:text-lg">{content.sections.aboutUs.sections.businessOverview.title}</h4>
                    <div className="space-y-3 text-sm lg:text-base text-white/90">
                      <p><strong>Type:</strong> {content.sections.aboutUs.sections.businessOverview.establishmentType}</p>
                      <p><strong>Theme:</strong> {content.sections.aboutUs.sections.businessOverview.theme}</p>
                      <p><strong>Audience:</strong> {content.sections.aboutUs.sections.businessOverview.targetAudience}</p>
                    </div>
                  </div>

                  {/* Menu Concept - Key Card 2 */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-center">
                    <h4 className="font-semibold text-white mb-4 text-base lg:text-lg">{content.sections.aboutUs.sections.menuConcept.title}</h4>
                    <div className="space-y-3 text-sm lg:text-base text-white/90">
                      <p>{content.sections.aboutUs.sections.menuConcept.description}</p>
                      <p><strong>Signature Dishes:</strong></p>
                      <ul className="list-none space-y-1">
                        {content.sections.aboutUs.sections.menuConcept.signatureDishes.map((dish, idx) => (
                          <li key={idx}>• {dish}</li>
                        ))}
                      </ul>
                      <p>{content.sections.aboutUs.sections.menuConcept.options}</p>
                    </div>
                  </div>
                </div>

                {/* Closing Statement */}
                <div className="bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-md border border-white/30 text-center">
                  <Quote className="w-8 h-8 text-white/60 mx-auto mb-3" />
                  <p className="text-white/90 text-sm lg:text-base italic leading-relaxed max-w-4xl mx-auto">
                    "{content.sections.aboutUs.closingStatement}"
                  </p>
                </div>
              </div>
            </div>
          </GlassSurface>

          {/* Event Hosting Invitation */}
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={24}
            displace={5}
            distortionScale={-50}
            redOffset={5}
            greenOffset={15}
            blueOffset={25}
            brightness={10}
            opacity={0}
            mixBlendMode="color-burn"
            className="p-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2 drop-shadow-lg">
                <PartyPopper className="w-6 h-6 text-purple-400 animate-bounce" />
                Host Your Special Event
                <PartyPopper className="w-6 h-6 text-purple-400 animate-bounce" style={{ animationDelay: "0.5s" }} />
              </h3>
              
              <p className="text-white/90 text-lg mb-6 max-w-3xl mx-auto drop-shadow-md">
                Make your celebrations unforgettable at Bloom Garden Cafe! 
                From intimate gatherings to grand celebrations, we provide the perfect ambiance for your special moments.
              </p>

              {/* Event Types */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md border border-purple-400/30 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-3">
                    <Gift className="w-8 h-8 text-pink-400 animate-pulse" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Birthday Parties</h4>
                  <p className="text-white/80 text-sm">Celebrate another year with delicious food and beautiful ambiance</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md border border-purple-400/30 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-3">
                    <Heart className="w-8 h-8 text-red-400 animate-pulse" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Anniversary Dinners</h4>
                  <p className="text-white/80 text-sm">Romantic settings perfect for celebrating love and milestones</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md border border-purple-400/30 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-3">
                    <Users className="w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Corporate Events</h4>
                  <p className="text-white/80 text-sm">Professional atmosphere for meetings, celebrations, and networking</p>
                </div>
              </div>

              {/* Floating decorative elements */}
              <div className="relative mb-8">
                <div className="absolute -top-4 left-1/4 animate-float">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-twinkle" />
                </div>
                <div className="absolute -top-2 right-1/3 animate-float" style={{ animationDelay: "1s" }}>
                  <Sparkles className="w-3 h-3 text-pink-400 animate-twinkle" />
                </div>
                <div className="absolute -bottom-2 left-1/3 animate-float" style={{ animationDelay: "2s" }}>
                  <Sparkles className="w-5 h-5 text-purple-400 animate-twinkle" />
                </div>

                <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 rounded-2xl p-6 backdrop-blur-md border border-white/30">
                  <h4 className="text-xl font-semibold text-white mb-3 flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    Book Your Event Today!
                  </h4>
                  <p className="text-white/90 mb-4">
                    Fill out the form below to reserve your special celebration with us!
                  </p>
                  
                  {/* Event Booking Form Toggle */}
                  <div className="text-center mb-4">
                    <Button
                      onClick={() => setShowBookingForm(!showBookingForm)}
                      className="bg-purple-600/80 hover:bg-purple-600/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-md border border-purple-500/50"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {showBookingForm ? 'Close Form' : 'Book Event Form'}
                    </Button>
                    {bookingMessage && (
                      <p className={`mt-2 text-sm ${
                        bookingMessage.includes('successfully') 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {bookingMessage}
                      </p>
                    )}
                  </div>

                  {/* Event Booking Form */}
                  {showBookingForm && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-4">
                      <h5 className="text-white font-semibold mb-4 text-center">Event Details</h5>
                      <form onSubmit={handleSubmitBooking} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              placeholder="Your Name*"
                              value={bookingForm.name}
                              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                              className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md"
                              required
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Phone Number*"
                              type="tel"
                              value={bookingForm.phone}
                              onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                              className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Input
                            placeholder="Email Address*"
                            type="email"
                            value={bookingForm.email}
                            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                            className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <select
                              value={bookingForm.eventType}
                              onChange={(e) => setBookingForm({ ...bookingForm, eventType: e.target.value })}
                              className="w-full px-3 py-2 bg-white/10 border border-white/30 text-white placeholder-white/70 backdrop-blur-md rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                              required
                            >
                              <option value="Birthday Party" className="bg-gray-800 text-white">Birthday Party</option>
                              <option value="Anniversary Dinner" className="bg-gray-800 text-white">Anniversary Dinner</option>
                              <option value="Corporate Event" className="bg-gray-800 text-white">Corporate Event</option>
                              <option value="Wedding Reception" className="bg-gray-800 text-white">Wedding Reception</option>
                              <option value="Family Gathering" className="bg-gray-800 text-white">Family Gathering</option>
                              <option value="Other" className="bg-gray-800 text-white">Other</option>
                            </select>
                          </div>
                          <div>
                            <Input
                              placeholder="Number of Guests*"
                              type="number"
                              min="1"
                              max="200"
                              value={bookingForm.guestCount}
                              onChange={(e) => setBookingForm({ ...bookingForm, guestCount: parseInt(e.target.value) })}
                              className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              placeholder="Event Date*"
                              type="date"
                              value={bookingForm.eventDate}
                              onChange={(e) => setBookingForm({ ...bookingForm, eventDate: e.target.value })}
                              className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md"
                              min={new Date().toISOString().split('T')[0]}
                              required
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Event Time*"
                              type="time"
                              value={bookingForm.eventTime}
                              onChange={(e) => setBookingForm({ ...bookingForm, eventTime: e.target.value })}
                              className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Textarea
                            placeholder="Special Requests (decorations, menu preferences, etc.)"
                            value={bookingForm.specialRequests}
                            onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                            className="bg-white/10 border-white/30 text-white placeholder-white/70 backdrop-blur-md min-h-[80px] resize-none"
                            maxLength={1000}
                          />
                          <p className="text-right text-white/50 text-xs mt-1">
                            {bookingForm.specialRequests.length}/1000
                          </p>
                        </div>
                        
                        <Button
                          type="submit"
                          disabled={bookingSubmitting}
                          className="w-full bg-purple-600/80 hover:bg-purple-600/90 text-white font-semibold rounded-xl backdrop-blur-md border border-purple-500/50"
                        >
                          {bookingSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Booking Request
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* WhatsApp Contact Button - Alternative */}
                  <div className="text-center">
                    <p className="text-white/80 text-sm mb-3">Or contact us directly:</p>
                    <a
                      href="https://wa.me/917025420663?text=Hi%2C%20I%20would%20like%20to%20host%20an%20event%20at%20Bloom%20Garden%20Cafe.%20Could%20you%20please%20share%20the%20details%20about%20event%20packages%20and%20availability%3F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600/80 hover:bg-green-600/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-md border border-green-500/50 text-sm"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.690z"/>
                      </svg>
                      WhatsApp: +91 70254 20663
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  
                  <div className="mt-4 text-white/70 text-sm">
                    <p className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      Available 7 days a week for event bookings
                    </p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Customizable menu options</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Flexible seating arrangements</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Garden ambiance setting</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Professional event coordination</span>
                </div>
              </div>
            </div>
          </GlassSurface>

          {/* Location & Hours */}
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={content.sections.visitUs.glassEffect.borderRadius}
            displace={content.sections.visitUs.glassEffect.displace}
            distortionScale={content.sections.visitUs.glassEffect.distortionScale}
            redOffset={content.sections.visitUs.glassEffect.redOffset}
            greenOffset={content.sections.visitUs.glassEffect.greenOffset}
            blueOffset={content.sections.visitUs.glassEffect.blueOffset}
            brightness={content.sections.visitUs.glassEffect.brightness}
            opacity={content.sections.visitUs.glassEffect.opacity}
            mixBlendMode={content.sections.visitUs.glassEffect.mixBlendMode}
            className="p-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center gap-2 drop-shadow-lg">
                {renderIcon(content.sections.visitUs.icon, `w-5 h-5 ${content.sections.visitUs.iconColor}`)}
                {content.sections.visitUs.title}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {renderIcon(content.sections.visitUs.location.icon, 'w-5 h-5 text-gray-300 mt-0.5')}
                    <div>
                      <h4 className="font-semibold text-white drop-shadow-md">{content.sections.visitUs.location.title}</h4>
                      <p className="text-white/90 text-sm drop-shadow-md">
                        {content.sections.visitUs.location.address.map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < content.sections.visitUs.location.address.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                      {/* Get Directions Button */}
                      <a
                        href="https://maps.app.goo.gl/ZBUTd6Hv9DqKaKTJ9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 border border-blue-400/50 rounded-lg text-xs transition-all duration-200 hover:scale-105"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Get Directions
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {renderIcon(content.sections.visitUs.contact.phone.icon, 'w-5 h-5 text-gray-300 mt-0.5')}
                    <div>
                      <h4 className="font-semibold text-white drop-shadow-md">{content.sections.visitUs.contact.phone.title}</h4>
                      <p className="text-white/90 text-sm drop-shadow-md">{content.sections.visitUs.contact.phone.number}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {renderIcon(content.sections.visitUs.contact.email.icon, 'w-5 h-5 text-gray-300 mt-0.5')}
                    <div>
                      <h4 className="font-semibold text-white drop-shadow-md">{content.sections.visitUs.contact.email.title}</h4>
                      <p className="text-white/90 text-sm drop-shadow-md">{content.sections.visitUs.contact.email.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    {renderIcon(content.sections.visitUs.hours.icon, 'w-5 h-5 text-gray-300 mt-0.5')}
                    <div>
                      <h4 className="font-semibold text-white mb-2 drop-shadow-md">{content.sections.visitUs.hours.title}</h4>
                      <div className="space-y-1 text-sm text-white/90 drop-shadow-md">
                        {content.sections.visitUs.hours.schedule.map((schedule, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{schedule.days}</span>
                            <span>{schedule.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Google Maps */}
                <div className="lg:col-span-1">
                  <div className="flex items-start gap-3 mb-3">
                    <Map className="w-5 h-5 text-gray-300 mt-0.5" />
                    <h4 className="font-semibold text-white drop-shadow-md">Find Us</h4>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.5597!2d-74.0059!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjEiTiA3NMKwMDAnMjEuMiJX!5e0!3m2!1sen!2sus!4v1641234567890!5m2!1sen!2sus"
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="transition-all duration-300 group-hover:brightness-110"
                      title="Bloom Garden Cafe Location"
                    ></iframe>
                    
                    {/* Overlay with link to full map */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-3">
                      <a
                        href="https://maps.app.goo.gl/ZBUTd6Hv9DqKaKTJ9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-lg text-xs backdrop-blur-md transition-all duration-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Larger Map
                      </a>
                    </div>
                  </div>
                  
                  {/* Additional map info */}
                  <div className="mt-2 text-center">
                    <p className="text-white/70 text-xs">
                      📍 Click map to open in Google Maps
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassSurface>

          {/* Mission Statement */}
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={content.sections.ourMission.glassEffect.borderRadius}
            displace={content.sections.ourMission.glassEffect.displace}
            distortionScale={content.sections.ourMission.glassEffect.distortionScale}
            redOffset={content.sections.ourMission.glassEffect.redOffset}
            greenOffset={content.sections.ourMission.glassEffect.greenOffset}
            blueOffset={content.sections.ourMission.glassEffect.blueOffset}
            brightness={content.sections.ourMission.glassEffect.brightness}
            opacity={content.sections.ourMission.glassEffect.opacity}
            mixBlendMode={content.sections.ourMission.glassEffect.mixBlendMode}
            className="p-6"
          >
            <div>
              <h3 className={`text-xl font-semibold ${content.sections.ourMission.textColor} mb-4 text-center drop-shadow-lg`}>{content.sections.ourMission.title}</h3>
              <p className={`${content.sections.ourMission.contentColor} italic text-center text-lg leading-relaxed max-w-3xl mx-auto drop-shadow-md`}>
                "{content.sections.ourMission.content}"
              </p>
            </div>
          </GlassSurface>

          {/* Back to Menu Button */}
          <section className="text-center pt-4">
            <Button
              className={content.backToMenuButton.className}
              onClick={onBack}
            >
              {content.backToMenuButton.text}
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}
