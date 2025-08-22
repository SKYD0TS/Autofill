import { db } from "@/app/lib/db-helpers";
import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { order_id } = await req.json();

  if (!order_id) {
    return NextResponse.json({ error: "order_id is required" }, { status: 400 });
  }

  try {
    // Retrieve the order details from the database based on the order_id
    const order = await db.findOne('token_purchase', { purchase_id: order_id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.purchase_status == "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 404 });
    }

    // Prepare transaction details for Midtrans API call
    const parameter = {
      transaction_details: {
        order_id: order.purchase_id.toString(),
        gross_amount: parseInt(order.purchase_amount)
      }
    }

    const tokenFetch = await fetch(process.env.NEXT_PUBLIC_MT_TRANSACTIONS_API, {
      headers: {
        "Content-type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`
      },
      method: "post",
      body: JSON.stringify(parameter)
    })
    const token = await tokenFetch.json()
    // Generate the Snap token dynamically
    return NextResponse.json(token);
    // Send the token back to the frontend
  } catch (error) {
    console.log(error)
    // console.error("Error generating Snap token:", error);
    return NextResponse.json({ error: "Failed to generate Snap token", errorMessage: error }, { status: 500 });
  }
}