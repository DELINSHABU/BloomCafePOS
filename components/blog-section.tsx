'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  User,
  Eye,
  Clock,
  ArrowRight,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import GlassSurface from './GlassSurface'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  images: string[]
  videos: string[]
  author: string
  authorImage: string
  publishDate: string
  category: string
  tags: string[]
  featured: boolean
  published: boolean
  views: number
  readTime: string
}

interface BlogSectionProps {
  limit?: number
  showFeatured?: boolean
}

export default function BlogSection({ limit = 3, showFeatured = false }: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('published', 'true')
      params.append('limit', limit.toString())
      if (showFeatured) {
        params.append('featured', 'true')
      }

      const response = await fetch(`/api/blog-posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        
        // Initialize image indices
        const indices: { [key: string]: number } = {}
        data.posts.forEach((post: BlogPost) => {
          indices[post.id] = 0
        })
        setCurrentImageIndex(indices)
      } else {
        console.error('Failed to load blog posts')
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextImage = (postId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: (prev[postId] + 1) % totalImages
    }))
  }

  const prevImage = (postId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: prev[postId] === 0 ? totalImages - 1 : prev[postId] - 1
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'News': 'bg-blue-500',
      'Menu': 'bg-green-500', 
      'Sustainability': 'bg-emerald-500',
      'Events': 'bg-purple-500',
      'Community': 'bg-orange-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={24}
        displace={3}
        distortionScale={-30}
        redOffset={2}
        greenOffset={8}
        blueOffset={12}
        brightness={8}
        opacity={0}
        mixBlendMode="overlay"
        className="p-6"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/90">Loading blog posts...</p>
        </div>
      </GlassSurface>
    )
  }

  if (posts.length === 0) {
    return (
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={24}
        displace={3}
        distortionScale={-30}
        redOffset={2}
        greenOffset={8}
        blueOffset={12}
        brightness={8}
        opacity={0}
        mixBlendMode="overlay"
        className="p-6"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center justify-center gap-2 drop-shadow-lg">
            📝 Latest Blog Posts
          </h3>
          <p className="text-white/90">No blog posts available at the moment.</p>
        </div>
      </GlassSurface>
    )
  }

  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={24}
      displace={3}
      distortionScale={-30}
      redOffset={2}
      greenOffset={8}
      blueOffset={12}
      brightness={8}
      opacity={0}
      mixBlendMode="overlay"
      className="p-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center gap-2 drop-shadow-lg">
          📝 Latest from Our Blog
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="relative">
                {/* Image/Video Carousel */}
                {post.images.length > 0 && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={post.images[currentImageIndex[post.id] || 0]}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      unoptimized
                      onError={(e) => {
                        console.error('Image failed to load:', post.images[currentImageIndex[post.id] || 0])
                        // Fallback to a placeholder or hide the image
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    
                    {/* Image Navigation */}
                    {post.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(post.id, post.images.length)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => nextImage(post.id, post.images.length)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {post.images.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === (currentImageIndex[post.id] || 0)
                                  ? 'bg-white'
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* Media Indicators */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {post.images.length > 1 && (
                        <Badge className="bg-black/70 text-white text-xs">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {post.images.length}
                        </Badge>
                      )}
                      {post.videos.length > 0 && (
                        <Badge className="bg-black/70 text-white text-xs">
                          <Play className="w-3 h-3 mr-1" />
                          {post.videos.length}
                        </Badge>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`${getCategoryColor(post.category)} text-white text-xs`}>
                        {post.category}
                      </Badge>
                    </div>

                    {/* Featured Badge */}
                    {post.featured && (
                      <div className="absolute top-8 left-2">
                        <Badge className="bg-yellow-500 text-black text-xs">
                          ⭐ Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-2 line-clamp-2 hover:text-white/90 transition-colors">
                  {post.title}
                </h4>
                
                <p className="text-sm text-white/80 mb-3 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Post Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-4 text-xs text-white/70">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views} views
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 text-white text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Read More Button */}
                <Button
                  size="sm"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all group"
                  variant="outline"
                >
                  Read More
                  <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Posts Button */}
        {posts.length >= limit && (
          <div className="text-center mt-6">
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3 text-sm font-semibold rounded-xl transition-all group"
              variant="outline"
            >
              View All Blog Posts
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </GlassSurface>
  )
}
