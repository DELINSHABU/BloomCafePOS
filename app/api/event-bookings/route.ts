import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const bookingsFilePath = path.join(process.cwd(), 'data', 'event-bookings.json');

interface EventBooking {
  id: string;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface BookingsData {
  bookings: EventBooking[];
  stats: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
  };
  lastUpdated: string;
}

// Helper function to calculate stats
const calculateStats = (bookings: EventBooking[]) => {
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length
  };
  return stats;
};

// Helper function to validate date
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date instanceof Date && !isNaN(date.getTime()) && date >= today;
};

// Helper function to validate time
const isValidTime = (timeString: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// GET - Retrieve all bookings (for admin)
export async function GET() {
  try {
    if (!fs.existsSync(bookingsFilePath)) {
      return NextResponse.json({
        bookings: [],
        stats: {
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0
        }
      });
    }

    const fileContent = fs.readFileSync(bookingsFilePath, 'utf8');
    const bookingsData: BookingsData = JSON.parse(fileContent);

    // Sort bookings by creation date (newest first)
    const sortedBookings = bookingsData.bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      bookings: sortedBookings,
      stats: bookingsData.stats
    });
  } catch (error) {
    console.error('Error reading bookings:', error);
    return NextResponse.json(
      { error: 'Failed to read bookings' },
      { status: 500 }
    );
  }
}

// POST - Create new event booking
export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, eventType, eventDate, eventTime, guestCount, specialRequests } = await request.json();

    // Validation
    if (!name || !phone || !email || !eventType || !eventDate || !eventTime || !guestCount) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate phone
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate event date
    if (!isValidDate(eventDate)) {
      return NextResponse.json(
        { error: 'Please select a valid future date' },
        { status: 400 }
      );
    }

    // Validate event time
    if (!isValidTime(eventTime)) {
      return NextResponse.json(
        { error: 'Please enter a valid time in HH:MM format' },
        { status: 400 }
      );
    }

    // Validate guest count
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 200) {
      return NextResponse.json(
        { error: 'Guest count must be between 1 and 200' },
        { status: 400 }
      );
    }

    // Validate special requests length
    if (specialRequests && specialRequests.length > 1000) {
      return NextResponse.json(
        { error: 'Special requests must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Load existing bookings
    let bookingsData: BookingsData;
    if (fs.existsSync(bookingsFilePath)) {
      const fileContent = fs.readFileSync(bookingsFilePath, 'utf8');
      bookingsData = JSON.parse(fileContent);
    } else {
      bookingsData = {
        bookings: [],
        stats: {
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0
        },
        lastUpdated: new Date().toISOString()
      };
    }

    // Create new booking
    const timestamp = new Date().toISOString();
    const newBooking: EventBooking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      eventType: eventType.trim(),
      eventDate: eventDate,
      eventTime: eventTime,
      guestCount: parseInt(guestCount),
      specialRequests: specialRequests?.trim() || '',
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Check for duplicate bookings (same email, date, time)
    const duplicateBooking = bookingsData.bookings.find(booking =>
      booking.email === newBooking.email &&
      booking.eventDate === newBooking.eventDate &&
      booking.eventTime === newBooking.eventTime &&
      booking.status !== 'cancelled'
    );

    if (duplicateBooking) {
      return NextResponse.json(
        { error: 'A booking with the same email, date, and time already exists' },
        { status: 409 }
      );
    }

    // Add new booking
    bookingsData.bookings.push(newBooking);

    // Update stats
    bookingsData.stats = calculateStats(bookingsData.bookings);
    bookingsData.lastUpdated = timestamp;

    // Ensure data directory exists
    const dataDir = path.dirname(bookingsFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to file
    fs.writeFileSync(bookingsFilePath, JSON.stringify(bookingsData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Event booking submitted successfully! We will contact you soon.',
      booking: {
        id: newBooking.id,
        name: newBooking.name,
        eventDate: newBooking.eventDate,
        eventTime: newBooking.eventTime,
        guestCount: newBooking.guestCount,
        status: newBooking.status
      },
      stats: bookingsData.stats
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to submit booking. Please try again.' },
      { status: 500 }
    );
  }
}
