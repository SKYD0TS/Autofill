import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(req) {
  const { order_id } = await req.json();
  console.log(order_id,"RUNS")

  if (!order_id) {
    return NextResponse.json({ error: "order_id is required" }, { status: 400 });
  }

  try {
    // Retrieve the order details from the database based on the order_id
    const order = await prisma.tokenPurchase.findUnique({
      where: { purchase_id: order_id },
    });

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

      console.log(parameter,{ 
        "Content-type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${process.env.MIDTRANS_SERVER_KEY}`
      })
    const tokenFetch = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
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
    // console.error("Error generating Snap token:", error);
    return NextResponse.json({ error: "Failed to generate Snap token", errorMessage: error }, { status: 500 });
  }
}