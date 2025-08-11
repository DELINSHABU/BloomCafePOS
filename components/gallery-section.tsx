'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Image as ImageIcon,
  Video,
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  Tag,
  Grid3X3,
  Filter,
  Loader2,
  Camera,
  PlayCircle
} from 'lucide-react'
import Image from 'next/image'
import GlassSurface from './GlassSurface'

interface GalleryItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  title: string
  description: string
  category: string
  uploadedAt: string
  featured: boolean
  tags: string[]
  duration?: number
}

interface Category {
  id: string
  name: string
  description: string
  color: string
}

interface GallerySectionProps {
  limit?: number
  showFeatured?: boolean
  categories?: string[]
  className?: string
}

export default function GallerySection({ 
  limit, 
  showFeatured = false, 
  categories = [], 
  className = '' 
}: GallerySectionProps) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showLightbox, setShowLightbox] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    loadGalleryItems()
  }, [showFeatured, categories])

  const loadGalleryItems = async () => {
    try {
      setLoading(true)
      let url = '/api/gallery?'
      
      const params = new URLSearchParams()
      if (showFeatured) params.append('featured', 'true')
      if (limit) params.append('limit', limit.toString())
      if (categories.length > 0 && !categories.includes('all')) {
        params.append('category', categories[0])
      }

      const response = await fetch(`${url}${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setAllCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter items based on selected filters
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesCategory && matchesType
  })

  const openLightbox = (index: number) => {
    setCurrentItemIndex(index)
    setShowLightbox(true)
    setIsPlaying(false)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  const navigateToNext = () => {
    setCurrentItemIndex((prev) => 
      prev === filteredItems.length - 1 ? 0 : prev + 1
    )
    setIsPlaying(false)
  }

  const navigateToPrev = () => {
    setCurrentItemIndex((prev) => 
      prev === 0 ? filteredItems.length - 1 : prev - 1
    )
    setIsPlaying(false)
  }

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const currentItem = filteredItems[currentItemIndex]

  // Group items by category for better organization
  const itemsByCategory = allCategories.reduce((acc, category) => {
    const categoryItems = filteredItems.filter(item => item.category === category.id)
    if (categoryItems.length > 0) {
      acc[category.id] = {
        category,
        items: categoryItems
      }
    }
    return acc
  }, {} as Record<string, { category: Category; items: GalleryItem[] }>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No gallery items found</h3>
        <p className="text-gray-500">Check back later for amazing photos and videos!</p>
      </div>
    )
  }

  return (
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
      className={`p-6 ${className}`}
    >
      <div>
        <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-white mb-6 flex items-center justify-center gap-2 drop-shadow-lg">
          <Camera className="w-5 h-5 text-emerald-400" />
          Our Gallery
        </h3>

        {/* Filters - Only show if not limited */}
        {!limit && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-white/10 backdrop-blur-md">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                {allCategories.slice(0, 5).map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm">
                    {category.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 h-auto p-1 bg-white/10 backdrop-blur-md">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="image" className="text-xs sm:text-sm">Images</TabsTrigger>
                <TabsTrigger value="video" className="text-xs sm:text-sm">Videos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredItems.map((item, index) => (
            <Card 
              key={item.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white/10 backdrop-blur-md border-white/20"
              onClick={() => openLightbox(index)}
            >
              <div className="relative">
                {/* Media Preview */}
                <div className="aspect-video bg-gray-900/20 rounded-t-lg overflow-hidden">
                  {item.type === 'image' ? (
                    <Image
                      src={item.thumbnail || item.url}
                      alt={item.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        poster={item.thumbnail}
                      >
                        <source src={item.url} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <PlayCircle className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Type Badge */}
                <Badge 
                  className="absolute top-2 left-2 bg-black/50 text-white border-none"
                  variant="outline"
                >
                  {item.type === 'image' ? (
                    <ImageIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <Video className="w-3 h-3 mr-1" />
                  )}
                  {item.type}
                </Badge>

                {/* Featured Badge */}
                {item.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500/80 text-white border-none">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}

                {/* Category Color Strip */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ 
                    backgroundColor: allCategories.find(c => c.id === item.category)?.color || '#666'
                  }}
                />
              </div>

              <CardContent className="p-3 bg-white/5 backdrop-blur-md">
                <h4 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-white/70 text-xs mb-2 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="border-white/30 text-white/80">
                    {allCategories.find(c => c.id === item.category)?.name || item.category}
                  </Badge>
                  <span className="text-white/60">
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs py-0 border-white/20 text-white/70">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs py-0 border-white/20 text-white/70">
                        +{item.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Items Badge */}
        {showFeatured && (
          <div className="text-center mt-6">
            <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/50 backdrop-blur-md">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featuring our best moments
            </Badge>
          </div>
        )}

        {/* View More Link */}
        {limit && filteredItems.length >= limit && (
          <div className="text-center mt-6">
            <Button 
              variant="outline" 
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-md"
              onClick={() => {
                // You can navigate to a full gallery page here
                console.log('Navigate to full gallery')
              }}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              View All Gallery
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={showLightbox} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/90 border-none">
          <DialogHeader className="absolute top-4 left-4 right-4 z-10">
            <DialogTitle className="text-white flex items-center gap-2">
              {currentItem?.type === 'image' ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
              {currentItem?.title}
            </DialogTitle>
          </DialogHeader>

          {currentItem && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={navigateToPrev}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={navigateToNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Media Content */}
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center p-8">
                  {currentItem.type === 'image' ? (
                    <Image
                      src={currentItem.url}
                      alt={currentItem.title}
                      width={1200}
                      height={800}
                      className="max-w-full max-h-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <video
                        ref={videoRef}
                        className="max-w-full max-h-full object-contain"
                        poster={currentItem.thumbnail}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        controls
                      >
                        <source src={currentItem.url} type="video/mp4" />
                      </video>
                    </div>
                  )}
                </div>

                {/* Info Panel */}
                <div className="bg-black/80 backdrop-blur-sm text-white p-4">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{currentItem.title}</h3>
                        <p className="text-gray-300 text-sm mb-2">{currentItem.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(currentItem.uploadedAt).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {allCategories.find(c => c.id === currentItem.category)?.name || currentItem.category}
                          </Badge>
                        </div>

                        {/* Tags */}
                        {currentItem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentItem.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-sm text-gray-400">
                        {currentItemIndex + 1} of {filteredItems.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GlassSurface>
  )
}
