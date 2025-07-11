import prisma from "@/app/lib/prisma"; // Import your Prisma client
import { DEFAULT_RUNTIME_WEBPACK } from 'next/dist/shared/lib/constants';
import { NextResponse } from 'next/server';
export async function POST(req) {
  const delayFn = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    // Get the URLs array from the request body
    const { urls, email, delay } = await req.json(); // Expects { "urls": ["url1", "url2", ...] }
    if (!urls) {
      return NextResponse.json({ error: 'Invalid URLs array' }, { status: 400 });
    }
    const googleUser = await prisma.googleUser.findFirst({
      where: { email },
    });
    const token = await prisma.token.findFirst({
      where: { token_id: googleUser.id },
    });
    console.log(typeof token, typeof delay)
    let successCount = 0
    const fetchPromises = urls.map(async (url, index) => {
      return await delayFn(delay * 1000 * index).then(() => {

        return fetch(url)
          .then(res => {
            if (!res.ok) {
              console.log("FAILED", url);
              return { url, success: false, status: res.status };
            }
            console.log("SUCCESS", url);
            successCount++
            return { url, success: true, status: res.status };
          })
          .catch(error => {
            return { url, success: false, error: error.message };
          });
      });
    })
    await Promise.all(fetchPromises).then(async ()=>{
      const newTokenCount = token.token_count - successCount
      const newToken = await prisma.token.update({
        where: { token_id: token.token_id },
        data: {
          token_count: newTokenCount,
          last_updated: new Date(),
        }
      })
    })
    

    // Wait for all requests to complete
    const results = await Promise.all(fetchPromises);
    console.log({ results })

    // Check if any of the requests failed
    const failedRequests = results.filter(res => {
      return !res.success
    });

    if (failedRequests.length > 0) {
      return NextResponse.json({ failedRequests }, { status: 400 });
    }

    // If all requests succeeded
    return NextResponse.json({ message: 'All requests succeeded',sentResponse:urls.length }, { status: 200 });
  } catch (error) {
    console.error('Error in fetchData API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
