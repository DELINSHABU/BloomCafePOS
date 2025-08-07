"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Save, 
  RefreshCw, 
  Plus,
  Edit3, 
  Trash2,
  Eye,
  Calendar,
  User,
  Clock,
  Image as ImageIcon,
  Video,
  Tag,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  images: string[];
  videos: string[];
  author: string;
  authorImage: string;
  publishDate: string;
  category: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  views: number;
  readTime: string;
}

interface Category {
  name: string;
  slug: string;
  color: string;
}

interface BlogData {
  posts: BlogPost[];
  categories: Category[];
  settings: {
    postsPerPage: number;
    enableComments: boolean;
    showAuthor: boolean;
    showReadTime: boolean;
    showViews: boolean;
  };
}

interface BlogManagerProps {
  currentUser?: { username: string; role: string; name: string };
}

export default function BlogManager({ currentUser }: BlogManagerProps) {
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    images: [],
    videos: [],
    author: currentUser?.name || 'Admin',
    authorImage: '/blog/authors/default.jpg',
    category: '',
    tags: [],
    featured: false,
    published: false,
    readTime: '5 min read'
  });

  // Load blog data on mount
  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog-posts');
      if (response.ok) {
        const data = await response.json();
        setBlogData(data);
        setMessage({ type: 'info', text: `Loaded ${data.posts.length} blog posts` });
      } else {
        setMessage({ type: 'error', text: 'Failed to load blog data' });
      }
    } catch (error) {
      console.error('Error loading blog data:', error);
      setMessage({ type: 'error', text: 'Error loading blog data' });
    } finally {
      setLoading(false);
    }
  };

  const saveBlogData = async () => {
    if (!blogData) return;

    try {
      setSaving(true);
      const updatedData = {
        ...blogData,
        updatedBy: currentUser?.username || 'superadmin'
      };

      const response = await fetch('/api/blog-posts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Blog data saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save blog data' });
      }
    } catch (error) {
      console.error('Error saving blog data:', error);
      setMessage({ type: 'error', text: 'Error saving blog data' });
    } finally {
      setSaving(false);
    }
  };

  const createPost = async () => {
    try {
      setSaving(true);
      
      // Generate slug from title if not provided
      if (!newPost.slug && newPost.title) {
        newPost.slug = newPost.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: 'Blog post created successfully!' });
        setCreatingPost(false);
        setNewPost({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          featuredImage: '',
          images: [],
          videos: [],
          author: currentUser?.name || 'Admin',
          authorImage: '/blog/authors/default.jpg',
          category: '',
          tags: [],
          featured: false,
          published: false,
          readTime: '5 min read'
        });
        loadBlogData();
      } else {
        setMessage({ type: 'error', text: 'Failed to create blog post' });
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      setMessage({ type: 'error', text: 'Error creating blog post' });
    } finally {
      setSaving(false);
    }
  };

  const updatePost = async (postId: string, updatedPost: Partial<BlogPost>) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/blog-posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Blog post updated successfully!' });
        setEditingPost(null);
        loadBlogData();
      } else {
        setMessage({ type: 'error', text: 'Failed to update blog post' });
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
      setMessage({ type: 'error', text: 'Error updating blog post' });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/blog-posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Blog post deleted successfully!' });
        loadBlogData();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete blog post' });
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      setMessage({ type: 'error', text: 'Error deleting blog post' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const addImageUrl = (postData: Partial<BlogPost>, setPostData: (data: Partial<BlogPost>) => void, url: string) => {
    if (url.trim()) {
      setPostData({
        ...postData,
        images: [...(postData.images || []), url.trim()]
      });
    }
  };

  const removeImageUrl = (postData: Partial<BlogPost>, setPostData: (data: Partial<BlogPost>) => void, index: number) => {
    const newImages = [...(postData.images || [])];
    newImages.splice(index, 1);
    setPostData({
      ...postData,
      images: newImages
    });
  };

  const addVideoUrl = (postData: Partial<BlogPost>, setPostData: (data: Partial<BlogPost>) => void, url: string) => {
    if (url.trim()) {
      setPostData({
        ...postData,
        videos: [...(postData.videos || []), url.trim()]
      });
    }
  };

  const removeVideoUrl = (postData: Partial<BlogPost>, setPostData: (data: Partial<BlogPost>) => void, index: number) => {
    const newVideos = [...(postData.videos || [])];
    newVideos.splice(index, 1);
    setPostData({
      ...postData,
      videos: newVideos
    });
  };

  const addTag = (postData: Partial<BlogPost>, setPostData: (data: Partial<BlogPost>) => void, tag: string) => {
    if (tag.trim() && !(postData.tags || []).includes(tag.trim())) {
      setPostData({
        ...postData,
        tags: [...(postData.tags || []), tag.trim()]
      });
    }
  };

  const removeTag = (postData: Partial<BlogPost>, setPostData: (data: Partial<BlogPost>) => void, index: number) => {
    const newTags = [...(postData.tags || [])];
    newTags.splice(index, 1);
    setPostData({
      ...postData,
      tags: newTags
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading blog data...</span>
      </div>
    );
  }

  if (!blogData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load blog data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-6 h-6" />
              Blog Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create and manage blog posts for the About Us page
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadBlogData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={saveBlogData}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={message.type === 'error' ? 'border-red-500' : message.type === 'success' ? 'border-green-500' : 'border-blue-500'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Blog Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Blog Posts Tab */}
        <TabsContent value="posts" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Blog Posts ({blogData.posts.length})</h2>
            <Dialog open={creatingPost} onOpenChange={setCreatingPost}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Title and Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-title">Title *</Label>
                      <Input
                        id="new-title"
                        value={newPost.title || ''}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-slug">Slug</Label>
                      <Input
                        id="new-slug"
                        value={newPost.slug || ''}
                        onChange={(e) => setNewPost(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="auto-generated-from-title"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <Label htmlFor="new-excerpt">Excerpt *</Label>
                    <Textarea
                      id="new-excerpt"
                      rows={3}
                      value={newPost.excerpt || ''}
                      onChange={(e) => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <Label htmlFor="new-content">Content *</Label>
                    <Textarea
                      id="new-content"
                      rows={6}
                      value={newPost.content || ''}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <Label htmlFor="new-featured-image">Featured Image URL</Label>
                    <Input
                      id="new-featured-image"
                      value={newPost.featuredImage || ''}
                      onChange={(e) => setNewPost(prev => ({ ...prev, featuredImage: e.target.value }))}
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <Label>Additional Images</Label>
                    <div className="text-xs text-gray-600 mb-2">
                      Available images: /blog/welcome-post.jpg, /blog/cafe-interior.jpg, /blog/farm-suppliers.jpg, /blog/fresh-vegetables.jpg, /blog/autumn-menu.jpg, /blog/coffee-roasting.jpg, /blog/pumpkin-latte.jpg, /blog/harvest-bowl.jpg
                    </div>
                    <div className="space-y-2">
                      {(newPost.images || []).map((image, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={image} readOnly />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeImageUrl(newPost, setNewPost, index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Image URL (e.g., /blog/welcome-post.jpg)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addImageUrl(newPost, setNewPost, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = (e.currentTarget.parentNode as HTMLElement).querySelector('input');
                            if (input) {
                              addImageUrl(newPost, setNewPost, input.value);
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Videos */}
                  <div>
                    <Label>Videos</Label>
                    <div className="text-xs text-gray-600 mb-2">
                      Available videos: /blog/cafe-tour.mp4, /blog/menu-preparation.mp4, /blog/DDBloomCafelogoAnimation.webm
                    </div>
                    <div className="space-y-2">
                      {(newPost.videos || []).map((video, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={video} readOnly />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeVideoUrl(newPost, setNewPost, index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Video URL (e.g., /blog/cafe-tour.mp4)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addVideoUrl(newPost, setNewPost, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = (e.currentTarget.parentNode as HTMLElement).querySelector('input');
                            if (input) {
                              addVideoUrl(newPost, setNewPost, input.value);
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="new-author">Author</Label>
                      <Input
                        id="new-author"
                        value={newPost.author || ''}
                        onChange={(e) => setNewPost(prev => ({ ...prev, author: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-category">Category</Label>
                      <Select
                        value={newPost.category || ''}
                        onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {blogData.categories.map((category) => (
                            <SelectItem key={category.slug} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="new-read-time">Read Time</Label>
                      <Input
                        id="new-read-time"
                        value={newPost.readTime || ''}
                        onChange={(e) => setNewPost(prev => ({ ...prev, readTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(newPost.tags || []).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          #{tag}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0"
                            onClick={() => removeTag(newPost, setNewPost, index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add tags (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTag(newPost, setNewPost, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  {/* Switches */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="new-featured"
                        checked={newPost.featured || false}
                        onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, featured: checked }))}
                      />
                      <Label htmlFor="new-featured">Featured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="new-published"
                        checked={newPost.published || false}
                        onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, published: checked }))}
                      />
                      <Label htmlFor="new-published">Published</Label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={createPost} disabled={saving} className="flex-1">
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Create Post
                    </Button>
                    <Button variant="outline" onClick={() => setCreatingPost(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogData.posts.map((post) => (
              <Card key={post.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={blogData.categories.find(c => c.name === post.category)?.color || 'bg-gray-500'}>
                          {post.category}
                        </Badge>
                        {post.featured && (
                          <Badge className="bg-yellow-500 text-black">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant={post.published ? "default" : "destructive"}>
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{post.excerpt}</p>
                  
                  {/* Meta Info */}
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
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

                  {/* Media Indicators */}
                  <div className="flex items-center gap-2 mb-3">
                    {post.images.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {post.images.length} images
                      </Badge>
                    )}
                    {post.videos.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Video className="w-3 h-3 mr-1" />
                        {post.videos.length} videos
                      </Badge>
                    )}
                    {post.featuredImage && (
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        🖼️ Featured
                      </Badge>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPost(post)}
                      className="flex-1"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePost(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogData.categories.map((category, index) => (
                  <div key={category.slug} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${category.color}`}></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.slug}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="posts-per-page">Posts Per Page</Label>
                  <Input
                    id="posts-per-page"
                    type="number"
                    value={blogData.settings.postsPerPage}
                    onChange={(e) => setBlogData(prev => prev ? {
                      ...prev,
                      settings: { ...prev.settings, postsPerPage: parseInt(e.target.value) }
                    } : prev)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-author"
                    checked={blogData.settings.showAuthor}
                    onCheckedChange={(checked) => setBlogData(prev => prev ? {
                      ...prev,
                      settings: { ...prev.settings, showAuthor: checked }
                    } : prev)}
                  />
                  <Label htmlFor="show-author">Show Author Information</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-read-time"
                    checked={blogData.settings.showReadTime}
                    onCheckedChange={(checked) => setBlogData(prev => prev ? {
                      ...prev,
                      settings: { ...prev.settings, showReadTime: checked }
                    } : prev)}
                  />
                  <Label htmlFor="show-read-time">Show Read Time</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-views"
                    checked={blogData.settings.showViews}
                    onCheckedChange={(checked) => setBlogData(prev => prev ? {
                      ...prev,
                      settings: { ...prev.settings, showViews: checked }
                    } : prev)}
                  />
                  <Label htmlFor="show-views">Show View Count</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog Post: {editingPost.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingPost.title}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, title: e.target.value } : prev)}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                  />
                </div>
              </div>

              <div>
                <Label>Excerpt</Label>
                <Textarea
                  rows={3}
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost(prev => prev ? { ...prev, excerpt: e.target.value } : prev)}
                />
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  rows={6}
                  value={editingPost.content}
                  onChange={(e) => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : prev)}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingPost.featured}
                    onCheckedChange={(checked) => setEditingPost(prev => prev ? { ...prev, featured: checked } : prev)}
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingPost.published}
                    onCheckedChange={(checked) => setEditingPost(prev => prev ? { ...prev, published: checked } : prev)}
                  />
                  <Label>Published</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => updatePost(editingPost.id, editingPost)} 
                  disabled={saving} 
                  className="flex-1"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Update Post
                </Button>
                <Button variant="outline" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
