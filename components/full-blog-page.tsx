'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  User,
  Eye,
  Clock,
  ArrowRight,
  ArrowLeft,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Volume2,
  VolumeX,
  ExternalLink
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

interface FullBlogPageProps {
  onBack?: () => void
  showBackButton?: boolean
  backgroundVideo?: string
  maxPosts?: number
}

export default function FullBlogPage({ 
  onBack, 
  showBackButton = true, 
  backgroundVideo,
  maxPosts 
}: FullBlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
  const [currentVideoIndex, setCurrentVideoIndex] = useState<{ [key: string]: number }>({})
  const [videoMuted, setVideoMuted] = useState<{ [key: string]: boolean }>({})

  const categories = [
    { name: 'All', value: 'all' },
    { name: 'News', value: 'News' },
    { name: 'Menu', value: 'Menu' },
    { name: 'Sustainability', value: 'Sustainability' },
    { name: 'Events', value: 'Events' },
    { name: 'Community', value: 'Community' }
  ]

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, selectedCategory])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('published', 'true')
      if (maxPosts) {
        params.append('limit', maxPosts.toString())
      }

      const response = await fetch(`/api/blog-posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        
        // Initialize indices
        const imageIndices: { [key: string]: number } = {}
        const videoIndices: { [key: string]: number } = {}
        const mutedStates: { [key: string]: boolean } = {}
        
        data.posts.forEach((post: BlogPost) => {
          imageIndices[post.id] = 0
          videoIndices[post.id] = 0
          mutedStates[post.id] = true
        })
        
        setCurrentImageIndex(imageIndices)
        setCurrentVideoIndex(videoIndices)
        setVideoMuted(mutedStates)
      } else {
        console.error('Failed to load blog posts')
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query)) ||
        post.author.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    setFilteredPosts(filtered)
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

  const nextVideo = (postId: string, totalVideos: number) => {
    setCurrentVideoIndex(prev => ({
      ...prev,
      [postId]: (prev[postId] + 1) % totalVideos
    }))
  }

  const prevVideo = (postId: string, totalVideos: number) => {
    setCurrentVideoIndex(prev => ({
      ...prev,
      [postId]: prev[postId] === 0 ? totalVideos - 1 : prev[postId] - 1
    }))
  }

  const toggleVideoMute = (postId: string) => {
    setVideoMuted(prev => ({
      ...prev,
      [postId]: !prev[postId]
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

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        {backgroundVideo && (
          <video
            className="fixed inset-0 w-full h-full object-cover z-0"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}
        <div className="fixed inset-0 bg-black bg-opacity-20 z-10"></div>
        <div className="relative z-20 flex items-center justify-center min-h-screen">
          <GlassSurface
            width="300px"
            height="200px"
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
        </div>
      </div>
    )
  }

  const backgroundClass = backgroundVideo 
    ? "min-h-screen relative overflow-hidden"
    : "min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50"

  if (selectedPost) {
    return (
      <div className={backgroundClass}>
        {backgroundVideo && (
          <video
            className="fixed inset-0 w-full h-full object-cover z-0"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-20 z-10"></div>
        
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <Button
            onClick={() => setSelectedPost(null)}
            variant="outline"
            className="mb-6 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          {/* Post content */}
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
            className="p-8"
          >
            <article>
              {/* Post header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={`${getCategoryColor(selectedPost.category)} text-white`}>
                    {selectedPost.category}
                  </Badge>
                  {selectedPost.featured && (
                    <Badge className="bg-yellow-500 text-black">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
                  {selectedPost.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-white/80 mb-6">
                  <div className="flex items-center gap-2">
                    <Image
                      src={selectedPost.authorImage}
                      alt={selectedPost.author}
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                    <span className="font-medium">{selectedPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedPost.publishDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedPost.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{selectedPost.views} views</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedPost.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-white/20 text-white text-sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Featured image */}
              {selectedPost.featuredImage && (
                <div className="mb-10 rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={selectedPost.featuredImage}
                    alt={selectedPost.title}
                    width={1200}
                    height={600}
                    className="w-full h-64 md:h-[500px] object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Post content */}
              <div className="prose prose-lg prose-invert max-w-none mb-10">
                <div className="text-white/90 text-lg leading-relaxed whitespace-pre-line">
                  {selectedPost.content}
                </div>
              </div>

              {/* Image gallery */}
              {selectedPost.images.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                    <ImageIcon className="w-6 h-6" />
                    Image Gallery ({selectedPost.images.length} photos)
                  </h3>
                  <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black/20">
                    <Image
                      src={selectedPost.images[currentImageIndex[selectedPost.id] || 0]}
                      alt={`${selectedPost.title} - Image ${(currentImageIndex[selectedPost.id] || 0) + 1}`}
                      width={1200}
                      height={600}
                      className="w-full h-64 md:h-[500px] object-cover"
                      unoptimized
                    />
                    
                    {selectedPost.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(selectedPost.id, selectedPost.images.length)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => nextImage(selectedPost.id, selectedPost.images.length)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                          {selectedPost.images.map((_, index) => (
                            <div
                              key={index}
                              className={`w-4 h-4 rounded-full transition-all cursor-pointer shadow-lg ${
                                index === (currentImageIndex[selectedPost.id] || 0)
                                  ? 'bg-white'
                                  : 'bg-white/50 hover:bg-white/70'
                              }`}
                              onClick={() => setCurrentImageIndex(prev => ({ ...prev, [selectedPost.id]: index }))}
                            />
                          ))}
                        </div>

                        <div className="absolute top-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          {(currentImageIndex[selectedPost.id] || 0) + 1} / {selectedPost.images.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Video gallery */}
              {selectedPost.videos.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                    <Play className="w-6 h-6" />
                    Video Gallery ({selectedPost.videos.length} videos)
                  </h3>
                  <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl">
                    <video
                      className="w-full h-64 md:h-[500px] object-cover"
                      controls
                      muted={videoMuted[selectedPost.id]}
                      poster={selectedPost.featuredImage}
                      preload="metadata"
                    >
                      <source 
                        src={selectedPost.videos[currentVideoIndex[selectedPost.id] || 0]} 
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                    
                    {selectedPost.videos.length > 1 && (
                      <>
                        <button
                          onClick={() => prevVideo(selectedPost.id, selectedPost.videos.length)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => nextVideo(selectedPost.id, selectedPost.videos.length)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                          {selectedPost.videos.map((_, index) => (
                            <div
                              key={index}
                              className={`w-4 h-4 rounded-full transition-all cursor-pointer shadow-lg ${
                                index === (currentVideoIndex[selectedPost.id] || 0)
                                  ? 'bg-white'
                                  : 'bg-white/50 hover:bg-white/70'
                              }`}
                              onClick={() => setCurrentVideoIndex(prev => ({ ...prev, [selectedPost.id]: index }))}
                            />
                          ))}
                        </div>

                        <div className="absolute top-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          Video {(currentVideoIndex[selectedPost.id] || 0) + 1} / {selectedPost.videos.length}
                        </div>
                      </>
                    )}

                    <button
                      onClick={() => toggleVideoMute(selectedPost.id)}
                      className="absolute bottom-6 right-6 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all shadow-lg"
                    >
                      {videoMuted[selectedPost.id] ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </article>
          </GlassSurface>
        </div>
      </div>
    )
  }

  return (
    <div className={backgroundClass}>
      {backgroundVideo && (
        <video
          className="fixed inset-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-10"></div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {showBackButton && onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="mb-6 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to About Us
            </Button>
          )}
          
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
            className="p-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                📝 Our Blog
              </h1>
              <p className="text-white/90 text-xl max-w-3xl mx-auto leading-relaxed">
                Discover stories, insights, and updates from Bloom Garden Cafe. 
                From farm-to-table sustainability to seasonal menu highlights, 
                explore our journey of creating exceptional dining experiences.
              </p>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search stories, recipes, sustainability tips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-md rounded-xl text-lg"
                />
              </div>
              
              <div className="flex gap-3 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    className={
                      selectedCategory === category.value
                        ? "bg-white text-black hover:bg-white/90 px-6 py-3 font-medium"
                        : "bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md px-6 py-3"
                    }
                  >
                    {category.name}
                  </Button>
                ))}
                
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30 backdrop-blur-md px-4"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/80 text-lg">
                Showing <span className="font-semibold">{filteredPosts.length}</span> of{' '}
                <span className="font-semibold">{posts.length}</span> posts
              </p>
              
              {maxPosts && posts.length > maxPosts && (
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View full blog for more posts
                </Badge>
              )}
            </div>
          </GlassSurface>
        </div>

        {/* Posts grid */}
        {filteredPosts.length === 0 ? (
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
            className="p-12"
          >
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white mb-4">No posts found</h3>
              <p className="text-white/90 mb-6 text-lg">
                Try adjusting your search or filter criteria to discover more content.
              </p>
              <Button
                onClick={clearFilters}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3"
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          </GlassSurface>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer h-full group shadow-xl hover:shadow-2xl"
                onClick={() => setSelectedPost(post)}
              >
                <div className="relative">
                  {/* Image/Video Carousel */}
                  {post.images.length > 0 && (
                    <div className="relative h-56 overflow-hidden rounded-t-lg">
                      <Image
                        src={post.images[currentImageIndex[post.id] || 0]}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                      
                      {/* Image Navigation */}
                      {post.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              prevImage(post.id, post.images.length)
                            }}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              nextImage(post.id, post.images.length)
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          
                          {/* Image Indicators */}
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
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
                      <div className="absolute top-3 right-3 flex space-x-2">
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
                      <div className="absolute top-3 left-3">
                        <Badge className={`${getCategoryColor(post.category)} text-white text-xs font-medium`}>
                          {post.category}
                        </Badge>
                      </div>

                      {/* Featured Badge */}
                      {post.featured && (
                        <div className="absolute top-10 left-3">
                          <Badge className="bg-yellow-500 text-black text-xs font-medium">
                            ⭐ Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <CardContent className="p-6 flex-1 flex flex-col">
                  <h4 className="font-bold text-white mb-3 line-clamp-2 hover:text-white/90 transition-colors text-lg leading-tight">
                    {post.title}
                  </h4>
                  
                  <p className="text-sm text-white/80 mb-4 line-clamp-3 flex-1 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Post Meta */}
                  <div className="space-y-3 mb-4">
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
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-white/20 text-white text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                          +{post.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Read More Button */}
                  <Button
                    size="sm"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all group mt-auto py-3"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPost(post)
                    }}
                  >
                    Read Full Story
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
