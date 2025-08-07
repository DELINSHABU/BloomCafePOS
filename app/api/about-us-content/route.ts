import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const aboutUsFilePath = path.join(process.cwd(), 'data', 'about-us-content.json');

// GET method - Retrieve About Us content
export async function GET() {
  try {
    if (!fs.existsSync(aboutUsFilePath)) {
      return NextResponse.json(
        { error: 'About Us content file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(aboutUsFilePath, 'utf8');
    const aboutUsContent = JSON.parse(fileContent);

    return NextResponse.json(aboutUsContent);
  } catch (error) {
    console.error('Error reading About Us content:', error);
    return NextResponse.json(
      { error: 'Failed to read About Us content' },
      { status: 500 }
    );
  }
}

// PUT method - Update About Us content
export async function PUT(request: NextRequest) {
  try {
    const updatedContent = await request.json();
    
    // Add metadata about the update
    updatedContent.lastUpdated = new Date().toISOString();
    
    // Ensure the data directory exists
    const dataDir = path.dirname(aboutUsFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the updated content
    fs.writeFileSync(aboutUsFilePath, JSON.stringify(updatedContent, null, 2), 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'About Us content updated successfully',
      lastUpdated: updatedContent.lastUpdated 
    });
  } catch (error) {
    console.error('Error updating About Us content:', error);
    return NextResponse.json(
      { error: 'Failed to update About Us content' },
      { status: 500 }
    );
  }
}
