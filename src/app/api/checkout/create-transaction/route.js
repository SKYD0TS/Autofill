import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { PurchaseStatus } from "@prisma/client";

// Initialize Midtrans Snap client
const snap = new Midtrans.Snap({
  isProduction: process.env.NEXT_PUBLIC_MT_IS_PRODUCTION === 'true', // Ensure boolean conversion
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY // Client key is also needed
});

export async function POST(req) {
  try {
    // 1. Extract and validate request body
    const { quantity, email, voucher_code } = await req.json();

    if (!quantity || !email || quantity <= 0) {
      return NextResponse.json({ error: "Invalid input: quantity and email are required." }, { status: 400 });
    }

    // 2. Determine base price based on quantity
    let basePrice;
    if (quantity < 100) {
      basePrice = 500;
    } else if (quantity >= 100 && quantity < 300) {
      basePrice = 400;
    } else { // quantity >= 300
      basePrice = 350;
    }

    // 3. Fetch user and voucher data from the database
    const googleUser = await prisma.googleUser.findFirst({
      where: { email },
    });

    if (!googleUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let voucher = null;
    if (voucher_code && voucher_code.trim() !== "") {
      voucher = await prisma.voucher.findFirst({
        where: { voucher_code },
      });
    }

    // 4. ** CORRECTED PRICE CALCULATION **
    // This new logic calculates the per-item price first, then the total, to avoid rounding errors.
    let finalPrice;
    let total;

    if (voucher && voucher.discount_percentage > 0) {
      const discountMultiplier = 1 - voucher.discount_percentage / 100;
      // Calculate the discounted price per item and floor it to ensure it's an integer for Midtrans.
      finalPrice = Math.floor(basePrice * discountMultiplier);
      // Calculate the total based on the final, consistent integer price.
      total = finalPrice * quantity;
    } else {
      // If no voucher, the final price is the base price.
      finalPrice = basePrice;
      total = finalPrice * quantity;
    }
    
    // Ensure total is not zero or negative, which can happen with a 100% discount
    if (total <= 0) {
        // If the total is free, we don't need to go to Midtrans.
        // You can handle the logic for a free "purchase" here.
        // For now, we'll just return an error for simplicity.
        return NextResponse.json({ error: "Total amount must be positive. A 100% discount cannot be processed via payment gateway." }, { status: 400 });
    }

    // 5. Create purchase records in a transaction
    let tokenPurchase;
    try {
      await prisma.$transaction(async (tx) => {
        let tokenPurchaseData = {
          token_amount: quantity,
          purchase_amount: total,
          google_user_id: googleUser.id,
          purchase_status: PurchaseStatus.unpaid, // Using enum for safety
        };

        if (voucher) {
          const voucherUsage = await tx.voucherUsage.create({
            data: {
              voucher_id: voucher.voucher_id,
              google_user_id: googleUser.id,
              used_at: new Date(),
            },
          });
          tokenPurchaseData.voucher_usage_id = voucherUsage.id;
        }

        tokenPurchase = await tx.tokenPurchase.create({
          data: tokenPurchaseData,
        });
      });
    } catch (error) {
      console.error("Error in database transaction:", error);
      return NextResponse.json({ error: "Failed to create purchase record" }, { status: 500 });
    }

    if (!tokenPurchase) {
        console.error("Token purchase record was not created.");
        return NextResponse.json({ error: "Failed to create purchase record" }, { status: 500 });
    }


    // 6. Prepare parameters for Midtrans
    const transaction_details = {
      order_id: tokenPurchase.purchase_id,
      gross_amount: total,
    };

    const item_details = [
      {
        id: 1,
        price: finalPrice, // Use the final, integer-based price
        quantity: quantity,
        name: "Token Top-up",
        brand: "Autofill",
        category: "Digital Goods",
        merchant_name: "Autofill",
      },
    ];

    const customer_details = {
        email: googleUser.email,
        first_name: googleUser.name || 'Customer',
    };

    const parameter = {
      transaction_details,
      item_details,
      customer_details,
    };

    // 7. Create Midtrans transaction and get token
    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    return NextResponse.json({ success: "Transaction created successfully", token: snapToken });

  } catch (error) {
    console.error("Error creating Midtrans transaction:", error);
    // Check if it's a Midtrans API error
    if (error.isMidtransError) {
        return NextResponse.json({ error: "Midtrans API Error", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}
