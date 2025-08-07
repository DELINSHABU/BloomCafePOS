# About Us Content Management System

## Overview

The About Us Content Management System allows superadmins to dynamically edit all content on the About Us page through a comprehensive web interface. All content is stored in a JSON file and can be modified in real-time without requiring code changes.

## System Components

### 1. JSON Data Structure (`data/about-us-content.json`)

The system uses a structured JSON file to store all About Us page content:

```json
{
  "header": {
    "logo": "/BloomCafelogo.png",
    "logoAlt": "Bloom Garden Cafe Logo", 
    "logoWidth": 650,
    "logoHeight": 650,
    "tagline": "Where Every Meal Blooms with Flavor",
    "backgroundVideo": "/backgroundOfAboutUs.mp4"
  },
  "sections": {
    "ourStory": { ... },
    "whatMakesUsSpecial": { ... },
    "visitUs": { ... },
    "ourMission": { ... }
  },
  "backToMenuButton": { ... },
  "lastUpdated": "2024-08-07T08:23:11Z",
  "updatedBy": "superadmin"
}
```

### 2. API Endpoint (`app/api/about-us-content/route.ts`)

**GET `/api/about-us-content`**
- Retrieves current About Us content from JSON file
- Returns complete content structure

**PUT `/api/about-us-content`**
- Updates About Us content with provided data
- Automatically adds lastUpdated timestamp
- Returns success/failure status

### 3. Content Manager Component (`components/about-us-content-manager.tsx`)

A comprehensive admin interface with tabbed sections:

**Header Tab:**
- Logo path, alt text, dimensions
- Tagline text
- Background video path

**Our Story Tab:**
- Section title and icon selection
- Story content text
- Icon color customization

**What Makes Us Special Tab:**
- Section title and icon
- Four customizable features with:
  - Individual titles
  - Icon selection
  - Icon colors
  - Feature descriptions

**Visit Us Tab:**
- Location information (3-line address)
- Contact details (phone and email)
- Operating hours (3 schedule entries)

**Our Mission Tab:**
- Mission statement title
- Mission content text
- Text color customization

### 4. Dynamic About Us Component (`components/about-us.tsx`)

The updated About Us page that:
- Fetches content from API on load
- Renders dynamic icons based on JSON data
- Displays loading and error states
- Uses dynamic content throughout all sections
- Maintains glass effect styling

### 5. Super Admin Integration

The About Us Content Manager is integrated into the Super Admin Dashboard:
- New "About Us" tab in navigation
- Overview card for quick access
- Full content management capabilities
- User tracking for content changes

## Content Structure Details

### Header Section
- **Logo**: Path to logo image file
- **Logo Alt**: Accessibility alt text
- **Logo Dimensions**: Width and height in pixels
- **Tagline**: Main subtitle text
- **Background Video**: Path to background video file

### Our Story Section
- **Title**: Section heading
- **Icon**: Lucide icon name (Heart, Star, etc.)
- **Icon Color**: Tailwind color class
- **Content**: Main story paragraph
- **Glass Effect**: Visual effect parameters

### What Makes Us Special Section
- **Title**: Section heading
- **Icon & Color**: Section icon and color
- **Features Array**: Four feature objects with:
  - Title, Icon, Icon Color, Description
- **Glass Effect**: Visual effect parameters

### Visit Us Section
- **Location**: 3-line address array
- **Phone**: Contact number
- **Email**: Contact email
- **Hours**: Array of schedule objects with days and times
- **Glass Effect**: Visual effect parameters

### Our Mission Section
- **Title**: Section heading
- **Content**: Mission statement text
- **Text Colors**: Title and content color classes
- **Glass Effect**: Visual effect parameters

## Usage Instructions

### For Superadmins:

1. **Access**: Login as superadmin and navigate to "About Us" tab
2. **Edit Content**: Use the tabbed interface to edit different sections
3. **Save Changes**: Click "Save Changes" to apply updates
4. **View Changes**: Changes are immediately visible on the About Us page

### Available Icons:
- Heart, Star, MapPin, Coffee, Users, Award, Phone, Mail, Clock

### Color Options:
- Red, Blue, Yellow, Emerald, Purple, Pink, Orange (400 shade)

### Content Guidelines:
- Keep text concise and engaging
- Ensure contact information is accurate
- Use consistent icon colors within sections
- Test video/image paths are valid

## Technical Features

### Real-time Updates
- Changes are immediately saved to JSON file
- About Us page fetches latest content on load
- No caching issues or page rebuilds required

### Error Handling
- API validates JSON structure
- Component shows loading states
- Graceful fallbacks for missing content
- User feedback for save operations

### Performance
- Lightweight JSON-based storage
- Efficient API calls
- Dynamic icon rendering
- Optimized component structure

### Security
- Superadmin-only access
- User tracking for changes
- Input validation and sanitization

## File Structure

```
├── data/
│   └── about-us-content.json          # Content data store
├── app/api/
│   └── about-us-content/
│       └── route.ts                   # API endpoint
├── components/
│   ├── about-us.tsx                   # Dynamic About Us page
│   ├── about-us-content-manager.tsx   # Admin interface
│   └── super-admin-dashboard.tsx      # Dashboard integration
└── ABOUT_US_CONTENT_MANAGEMENT.md     # This documentation
```

## Benefits

1. **No Code Changes**: Content updates without developer involvement
2. **Real-time Updates**: Immediate content changes
3. **User-Friendly**: Intuitive tabbed interface
4. **Comprehensive**: All content sections editable
5. **Tracking**: User and timestamp tracking
6. **Reliable**: Error handling and validation
7. **Performance**: Fast, lightweight system

## Maintenance

### Regular Tasks:
- Verify content accuracy periodically
- Check image/video path validity
- Monitor JSON file size and structure
- Backup content data regularly

### Troubleshooting:
- Check API endpoint functionality
- Verify file permissions on JSON file
- Ensure proper superadmin access rights
- Test content loading in About Us page

This system provides complete control over the About Us page content while maintaining the beautiful glass effect design and ensuring excellent user experience.
