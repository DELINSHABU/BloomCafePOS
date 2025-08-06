'use client'

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

interface AboutUsProps {
  onBack: () => void;
}

export default function AboutUs({ onBack }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-emerald-700 px-4 sm:px-6 lg:px-8 py-6">
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
                src="/BloomCafelogo.png"
                alt="Bloom Garden Cafe Logo"
                width={200}
                height={200}
                className="mx-auto"
                priority
              />
            </div>
            <p className="text-xl text-white">
              Where Every Meal Blooms with Flavor
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8 text-center">
          {/* Our Story */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Our Story
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Established in 2020, Bloom Garden Cafe has been serving the community with 
              fresh, locally-sourced ingredients and authentic flavors. Our passion for 
              culinary excellence and warm hospitality has made us a beloved destination 
              for food lovers seeking both comfort and innovation.
            </p>
          </section>

          {/* What Makes Us Special */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              What Makes Us Special
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Coffee className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold">Fresh Ingredients</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    We source our ingredients daily from local farms and suppliers
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold">Expert Chefs</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Our experienced culinary team crafts each dish with care
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold">Award Winning</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Recognized for excellence in service and cuisine quality
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold">Family Friendly</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    A welcoming atmosphere perfect for families and friends
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Location & Hours */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Visit Us
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Location</h4>
                    <p className="text-gray-600 text-sm">
                      123 Garden Street<br />
                      Downtown District<br />
                      Bloom City, BC 12345
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Phone</h4>
                    <p className="text-gray-600 text-sm">+1 (555) 123-CAFE</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600 text-sm">info@bloomgardencafe.com</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Opening Hours</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span>7:00 AM - 9:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span>8:00 AM - 10:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span>9:00 AM - 8:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Statement */}
          <section className="bg-emerald-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-emerald-800 mb-4 text-center">Our Mission</h3>
            <p className="text-emerald-700 italic text-center text-lg leading-relaxed max-w-3xl mx-auto">
              "To create memorable dining experiences that bring people together, 
              celebrating the joy of good food, warm hospitality, and community connection. 
              Every dish we serve is crafted with love and dedication to quality."
            </p>
          </section>

          {/* Back to Menu Button */}
          <section className="text-center pt-4">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={onBack}
            >
              Back to Menu
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}
