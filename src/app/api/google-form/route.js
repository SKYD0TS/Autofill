import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const url = new URL(req.url);
  const googleFormId = url.searchParams.get('formurl').split('/').at(-2);

  try {
    const accessToken = url.searchParams.get('accessToken'); // Get access token from query params

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // Initialize OAuth2 client with the provided access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    // Initialize the Google Forms API client
    const forms = google.forms({ version: 'v1', auth: oauth2Client });
    const formId = googleFormId;  // Replace with your form ID
    const response = await forms.forms.get({ formId });

    // Send form data as the response
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    // Check if the error has a response with status code from Google API
    if (error.response) {
      // Return the error status code and message from the Google API response
      console.error('Google API Error:', error.response.data);
      return NextResponse.json(
        { error: error.response.data.error.message || 'Google API error' },
        { status: error.response.status || 500 }
      );
    } else {
      // If the error is not related to the Google API, log the error and return a 500 error
      console.error('Unexpected error:', error);
      return NextResponse.json({ error: 'Failed to fetch form data' }, { status: 500 });
    }
  }
}
