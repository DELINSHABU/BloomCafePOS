import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!users || !Array.isArray(users)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    const credentialsData = {
      users: users
    };

    const filePath = path.join(process.cwd(), 'staff-credentials.json');
    
    // Write the updated credentials to the file
    console.log('💾 JSON FILE ACCESS: staff-credentials.json updated from api/save-credentials/route.ts -> POST()');
    fs.writeFileSync(filePath, JSON.stringify(credentialsData, null, 4));

    return NextResponse.json(
      { message: 'Credentials saved successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error saving credentials:', error);
    return NextResponse.json(
      { error: 'Failed to save credentials' },
      { status: 500 }
    );
  }
}
