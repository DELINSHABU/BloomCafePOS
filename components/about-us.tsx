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
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
};

export default function AboutUs({ onBack }: AboutUsProps) {
  const [content, setContent] = useState<AboutUsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
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
            <p className="text-xl text-white">
              {content.header.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center justify-center gap-2 drop-shadow-lg">
                {renderIcon(content.sections.ourStory.icon, `w-5 h-5 ${content.sections.ourStory.iconColor}`)}
                {content.sections.ourStory.title}
              </h3>
              <p className="text-white/90 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
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
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center gap-2 drop-shadow-lg">
                {renderIcon(content.sections.whatMakesUsSpecial.icon, `w-5 h-5 ${content.sections.whatMakesUsSpecial.iconColor}`)}
                {content.sections.whatMakesUsSpecial.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {content.sections.whatMakesUsSpecial.features.map((feature, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {renderIcon(feature.icon, `w-5 h-5 ${feature.iconColor}`)}
                      <h4 className="font-semibold text-white">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-white/80">
                      {feature.description}
                    </p>
                  </div>
                ))}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
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
