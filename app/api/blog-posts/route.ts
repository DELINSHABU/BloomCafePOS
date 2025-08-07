import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const blogPostsFilePath = path.join(process.cwd(), 'data', 'blog-posts.json');

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

interface BlogData {
  posts: BlogPost[];
  categories: Array<{
    name: string;
    slug: string;
    color: string;
  }>;
  settings: {
    postsPerPage: number;
    enableComments: boolean;
    showAuthor: boolean;
    showReadTime: boolean;
    showViews: boolean;
  };
  lastUpdated: string;
  updatedBy: string;
}

// GET method - Retrieve blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const published = searchParams.get('published');
    const limit = searchParams.get('limit');

    if (!fs.existsSync(blogPostsFilePath)) {
      return NextResponse.json(
        { error: 'Blog posts file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(blogPostsFilePath, 'utf8');
    const blogData: BlogData = JSON.parse(fileContent);

    let posts = blogData.posts;

    // Apply filters
    if (category) {
      posts = posts.filter(post => post.category.toLowerCase() === category.toLowerCase());
    }

    if (featured === 'true') {
      posts = posts.filter(post => post.featured);
    }

    if (published !== null) {
      const isPublished = published !== 'false';
      posts = posts.filter(post => post.published === isPublished);
    }

    // Sort by publish date (newest first)
    posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum)) {
        posts = posts.slice(0, limitNum);
      }
    }

    return NextResponse.json({
      posts,
      categories: blogData.categories,
      settings: blogData.settings,
      total: posts.length
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to read blog posts' },
      { status: 500 }
    );
  }
}

// POST method - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const newPost: Omit<BlogPost, 'id'> = await request.json();

    if (!fs.existsSync(blogPostsFilePath)) {
      return NextResponse.json(
        { error: 'Blog posts file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(blogPostsFilePath, 'utf8');
    const blogData: BlogData = JSON.parse(fileContent);

    // Generate new ID
    const newId = (Math.max(...blogData.posts.map(p => parseInt(p.id))) + 1).toString();

    // Create the new post
    const postToAdd: BlogPost = {
      ...newPost,
      id: newId,
      publishDate: new Date().toISOString(),
      views: 0,
    };

    // Add to posts array
    blogData.posts.unshift(postToAdd);

    // Update metadata
    blogData.lastUpdated = new Date().toISOString();

    // Write back to file
    fs.writeFileSync(blogPostsFilePath, JSON.stringify(blogData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      post: postToAdd
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

// PUT method - Update blog data (posts, categories, settings)
export async function PUT(request: NextRequest) {
  try {
    const updatedData: BlogData = await request.json();

    // Add metadata about the update
    updatedData.lastUpdated = new Date().toISOString();

    // Ensure the data directory exists
    const dataDir = path.dirname(blogPostsFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the updated data
    fs.writeFileSync(blogPostsFilePath, JSON.stringify(updatedData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Blog data updated successfully',
      lastUpdated: updatedData.lastUpdated
    });
  } catch (error) {
    console.error('Error updating blog data:', error);
    return NextResponse.json(
      { error: 'Failed to update blog data' },
      { status: 500 }
    );
  }
}
