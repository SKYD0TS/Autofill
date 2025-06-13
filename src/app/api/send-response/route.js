// app/api/fetchData/route.js

import { DEFAULT_RUNTIME_WEBPACK } from 'next/dist/shared/lib/constants';
import { NextResponse } from 'next/server';
const DELAY_MS = 500
export async function POST(req) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    // Get the URLs array from the request body
    const { urls } = await req.json(); // Expects { "urls": ["url1", "url2", ...] }
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'Invalid URLs array' }, { status: 400 });
    }

    const fetchPromises = urls.map(async (url, index) => {
      return await delay(DELAY_MS*index).then(() => {

        return fetch(url)
          .then(res => {
            if (!res.ok) {
              console.log("FAILED", url);
              return { url, success: false, status: res.status };
            }
            console.log("SUCCESS", url);
            return { url, success: true, status: res.status };
          })
          .catch(error => {
            return { url, success: false, error: error.message };
          });
      });
    }) // Add delay based on index (e.g., 1 second per request)



    // Wait for all requests to complete
    const results = await Promise.all(fetchPromises);
    console.log({results})

    // Check if any of the requests failed
    const failedRequests = results.filter(res => {
      return !res.success
    });

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
