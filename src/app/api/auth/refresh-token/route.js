import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const url = new URL(req.url);
  const refreshToken = url.searchParams.get('refreshToken'); // Get refresh token from query params

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken, // Use the stored refresh token
    });

    // Refresh the access token using the refresh token
    const { credentials } = await oauth2Client.refreshAccessToken();
    const newAccessToken = credentials.access_token; // Get the new access token

    // Return the new access token
    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 500 });
  }
}
