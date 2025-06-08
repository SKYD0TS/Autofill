import { google } from "googleapis";
import { getServerSession } from "next-auth";

export async function GET(req) {
  const session = await getServerSession();

  if (!session) {
    return new Response("Not authenticated", { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    const spreadsheetId = "your-spreadsheet-id"; // Replace with your actual spreadsheet ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Form Responses 1", // Replace with your sheet name or range
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    return new Response("Failed to fetch data", { status: 500 });
  }
}
