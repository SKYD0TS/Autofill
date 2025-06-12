import { google } from 'googleapis';
import { parseCookies } from 'nookies';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const url = new URL(req.url);
  const googleFormId = url.searchParams.get('formurl').split('/').at(-2);

  try {
    const cookies = parseCookies({ req });
    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Access token and refresh token are required' }, { status: 400 });
    }

    // Initialize OAuth2 client with access and refresh tokens
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Automatically refresh the token if it's about to expire
    if (oauth2Client.isTokenExpiring()) {
      const { credentials } = await oauth2Client.refreshAccessToken(); // Refresh the token
      oauth2Client.setCredentials(credentials); // Update with the new access token
    }

    // Initialize Google Forms API client
    const forms = google.forms({ version: 'v1', auth: oauth2Client });
    const response = await forms.forms.get({ formId });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching Google Form:', error);
    return NextResponse.json({ error: 'Failed to fetch form data' }, { status: 500 });
  }
}
