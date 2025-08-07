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

// GET method - Retrieve single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!fs.existsSync(blogPostsFilePath)) {
      return NextResponse.json(
        { error: 'Blog posts file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(blogPostsFilePath, 'utf8');
    const blogData: BlogData = JSON.parse(fileContent);

    const post = blogData.posts.find(p => p.id === id || p.slug === id);

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    post.views += 1;
    blogData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(blogPostsFilePath, JSON.stringify(blogData, null, 2), 'utf8');

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error reading blog post:', error);
    return NextResponse.json(
      { error: 'Failed to read blog post' },
      { status: 500 }
    );
  }
}

// PUT method - Update single blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updatedPost: Partial<BlogPost> = await request.json();

    if (!fs.existsSync(blogPostsFilePath)) {
      return NextResponse.json(
        { error: 'Blog posts file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(blogPostsFilePath, 'utf8');
    const blogData: BlogData = JSON.parse(fileContent);

    const postIndex = blogData.posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Update the post (preserve existing data, override with new data)
    blogData.posts[postIndex] = {
      ...blogData.posts[postIndex],
      ...updatedPost,
      id: blogData.posts[postIndex].id, // Ensure ID doesn't change
    };

    // Update metadata
    blogData.lastUpdated = new Date().toISOString();

    // Write back to file
    fs.writeFileSync(blogPostsFilePath, JSON.stringify(blogData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      post: blogData.posts[postIndex]
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE method - Delete single blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!fs.existsSync(blogPostsFilePath)) {
      return NextResponse.json(
        { error: 'Blog posts file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(blogPostsFilePath, 'utf8');
    const blogData: BlogData = JSON.parse(fileContent);

    const postIndex = blogData.posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Remove the post
    const deletedPost = blogData.posts.splice(postIndex, 1)[0];

    // Update metadata
    blogData.lastUpdated = new Date().toISOString();

    // Write back to file
    fs.writeFileSync(blogPostsFilePath, JSON.stringify(blogData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
      deletedPost
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
