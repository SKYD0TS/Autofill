// app/api/fetchData/route.js

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Get the URLs array from the request body
    const { urls } = await req.json(); // Expects { "urls": ["url1", "url2", ...] }
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'Invalid URLs array' }, { status: 400 });
    }

    // Make GET requests to all URLs in parallel
    const fetchPromises = urls.map(url =>
      fetch(url)
        .then(res => {
          // Check if the response status is not in the 200-299 range
          if (!res.ok) {
            return { url, success: false, status: res.status };
          }
          return { url, success: true, status: res.status };
        })
        .catch(error => {
          // If an error occurs (e.g., network error), mark the URL as failed
          return { url, success: false, error: error.message };
        })
    );

    // Wait for all requests to complete
    const results = await Promise.all(fetchPromises);

    // Check if any of the requests failed
    const failedRequests = results.filter(result => !result.success);

    if (failedRequests.length > 0) {
      return NextResponse.json({ failedRequests }, { status: 400 });
    }

    // If all requests succeeded
    return NextResponse.json({ message: 'All requests succeeded' }, { status: 200 });
  } catch (error) {
    console.error('Error in fetchData API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
