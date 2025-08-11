'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Upload,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Edit,
  Star,
  StarOff,
  Eye,
  Filter,
  Search,
  Play,
  Pause,
  X,
  Loader2,
  FileImage,
  FileVideo,
  Calendar,
  User,
  Tag
} from 'lucide-react'
import Image from 'next/image'

interface GalleryItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  title: string
  description: string
  category: string
  uploadedAt: string
  uploadedBy: string
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

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Form states
  const [formData, setFormData] = useState({
    type: 'image' as 'image' | 'video',
    url: '',
    title: '',
    description: '',
    category: '',
    featured: false,
    tags: [] as string[],
    duration: undefined as number | undefined
  })

  const [newTagInput, setNewTagInput] = useState('')

  useEffect(() => {
    loadGalleryItems()
  }, [])

  const loadGalleryItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gallery')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          url: data.url,
          type: data.type
        }))
        setShowAddDialog(true)
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async () => {
    if (!formData.url || !formData.title || !formData.category) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const url = editingItem ? '/api/gallery' : '/api/gallery'
      const method = editingItem ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        ...(editingItem && { id: editingItem.id })
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setShowAddDialog(false)
        resetForm()
        loadGalleryItems()
      } else {
        const error = await response.json()
        alert(`Save failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving gallery item:', error)
      alert('Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        loadGalleryItems()
      } else {
        alert('Delete failed')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Delete failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (item: GalleryItem) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, featured: !item.featured })
      })

      if (response.ok) {
        loadGalleryItems()
      }
    } catch (error) {
      console.error('Error updating featured status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'image',
      url: '',
      title: '',
      description: '',
      category: '',
      featured: false,
      tags: [],
      duration: undefined
    })
    setNewTagInput('')
    setEditingItem(null)
  }

  const handleEditItem = (item: GalleryItem) => {
    setFormData({
      type: item.type,
      url: item.url,
      title: item.title,
      description: item.description,
      category: item.category,
      featured: item.featured,
      tags: item.tags || [],
      duration: item.duration
    })
    setEditingItem(item)
    setShowAddDialog(true)
  }

  const addTag = () => {
    if (newTagInput.trim() && !formData.tags.includes(newTagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTagInput.trim()]
      }))
      setNewTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesType = selectedType === 'all' || item.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gallery Manager</h2>
          <p className="text-gray-600">Upload and manage cafe images and videos</p>
        </div>
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search gallery items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="group hover:shadow-lg transition-shadow">
            <div className="relative">
              {/* Media Preview */}
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                {item.type === 'image' ? (
                  <Image
                    src={item.thumbnail || item.url}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      className="w-full h-full object-cover"
                      poster={item.thumbnail}
                    >
                      <source src={item.url} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Video className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0"
                  onClick={() => toggleFeatured(item)}
                >
                  {item.featured ? (
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="w-3 h-3" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0"
                  onClick={() => {
                    setSelectedItem(item)
                    setShowViewDialog(true)
                  }}
                >
                  <Eye className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0"
                  onClick={() => handleEditItem(item)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-8 h-8 p-0"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {/* Type Badge */}
              <Badge 
                className="absolute top-2 left-2"
                variant={item.type === 'image' ? 'default' : 'secondary'}
              >
                {item.type === 'image' ? (
                  <FileImage className="w-3 h-3 mr-1" />
                ) : (
                  <FileVideo className="w-3 h-3 mr-1" />
                )}
                {item.type}
              </Badge>

              {/* Featured Badge */}
              {item.featured && (
                <Badge className="absolute bottom-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>

            <CardContent className="p-3">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize">{item.category}</span>
                <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs py-0">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs py-0">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No gallery items found</h3>
          <p className="text-gray-500 mb-4">Upload your first image or video to get started</p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the gallery item details' : 'Add details for your uploaded file'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Media Preview */}
            {formData.url && (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {formData.type === 'image' ? (
                  <Image
                    src={formData.url}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <video
                    className="w-full h-full object-cover"
                    controls
                  >
                    <source src={formData.url} type="video/mp4" />
                  </video>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Mark as featured</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingItem ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingItem ? 'Update' : 'Add Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem?.type === 'image' ? (
                <FileImage className="w-5 h-5" />
              ) : (
                <FileVideo className="w-5 h-5" />
              )}
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Media */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedItem.type === 'image' ? (
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      poster={selectedItem.thumbnail}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={selectedItem.url} type="video/mp4" />
                    </video>
                    <Button
                      className="absolute bottom-4 left-4"
                      size="sm"
                      onClick={toggleVideo}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-gray-600">{selectedItem.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Category</h4>
                    <Badge>{categories.find(c => c.id === selectedItem.category)?.name || selectedItem.category}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Type</h4>
                    <Badge variant="outline">{selectedItem.type}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Uploaded
                    </h4>
                    <p className="text-gray-600">{new Date(selectedItem.uploadedAt).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Uploaded By
                    </h4>
                    <p className="text-gray-600">{selectedItem.uploadedBy}</p>
                  </div>
                </div>

                {selectedItem.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.featured && (
                  <div>
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured Item
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
