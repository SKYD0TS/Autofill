import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { PurchaseStatus } from "@prisma/client";


const snap = new Midtrans.Snap({
  isProduction: process.env.MT_IS_PRODUCTION,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(req) {
  // Extracting necessary data from request body
  const { quantity, email, voucher_code } = await req.json();
  let price
  if (quantity < 100) {
      price = 500
  }
  if (quantity > 99 && quantity < 300) {
    price = 400
  }
  if (quantity > 299) {
    price = 350
  }
  let googleUser
  let voucher
  try {
    googleUser = await prisma.googleUser.findFirst({
      where: { email },
    });
    if(voucher_code != ""){
      voucher = await prisma.voucher.findFirst({
        where: { voucher_code },
      });
    }

  } catch (error) {
    console.error("Error fetching token:", error);
    return NextResponse.json({ error: "Internal server error", status: 500 })
  }
  const subtotal = price * quantity
  let total
  if(voucher != undefined){
    total = subtotal - (subtotal * (voucher.discount_percentage/100))
  }else{
    total = subtotal
  }
  
  let voucherUsage
  let tokenPurchase
  const google_user_id = googleUser.id
  const result = await prisma.$transaction(async (prisma) => {

    let tokenPurchaseData = {
      token_amount: quantity,
      purchase_amount: total,
      google_user_id: googleUser.id,
      purchase_status: "unpaid"
    }
    if(voucher){
      voucherUsage = await prisma.voucherUsage.create({
        data: {
          voucher_id: voucher.voucher_id,   // Example data
          google_user_id: google_user_id,
          used_at: new Date(),
        },
      });
      tokenPurchaseData.voucher_usage_id = voucherUsage.id
      price = price - (price * (voucher.discount_percentage/100))
    }
    tokenPurchase = await prisma.tokenPurchase.create({
      data: tokenPurchaseData,
    });
  })
  

  const transaction_details = {
    order_id: tokenPurchase.purchase_id,
    gross_amount: total,
  };

  const item_details = [
    {
      id: "1",
      price: price,
      quantity: quantity,
      name: "Token",
      brand: "Autofill",
      category: "token",
      merchant_name: "Autofill",
    },
  ];

  // Payment Gateway createTransaction params
  const parameter = {
    transaction_details,
    item_details,
  };

  try {
    const transaction = await snap.createTransaction(parameter); 
    const token = transaction.token; // This is the Snap token

    // Return the token for use in frontend Snap payment process
    return NextResponse.json({ success: "Transaction created successfully", token:token });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
