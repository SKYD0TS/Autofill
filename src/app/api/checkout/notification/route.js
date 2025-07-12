import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req) {
    const notif = await req.json();

    if (notif.transaction_status === "settlement") {
        const order = await prisma.tokenPurchase.findUnique({
            where: { purchase_id: notif.order_id },
        });
        const newOrder = await prisma.tokenPurchase.update({
            where: { purchase_id: order.purchase_id },
            data: {
                purchase_status: "paid"
            }
        })
        const user = await prisma.googleUser.findUnique({
            where: { id: newOrder.google_user_id },
            include: { tokens: true }
        })
        const newToken = await prisma.token.update({
            where:{token_id:user.tokens.token_id},
            data:{token_count: parseInt(user.tokens.token_count + newOrder.token_amount)}
        })
    }
    return NextResponse.json({message:"success"})
}


// {
//   transaction_time: '2023-11-15 18:45:13',
//   transaction_status: 'settlement',
//   transaction_id: '513f1f01-c9da-474c-9fc9-d5c64364b709',
//   status_message: 'midtrans payment notification',
//   status_code: '200',
//   signature_key: '9718c8f4ed8ca92e30dd69297da0f2925dc2b940001107606d8d81a0d29c237834ea0d4a746a2b0add70e08277dad75639d6891933ca29349899e3851dbb6617',
//   settlement_time: '2023-11-15 22:45:13',
//   payment_type: 'gopay',
//   order_id: 'payment_notif_test_G706699487_f1fb9398-0f36-4cd4-ba95-71625d31a193',
//   merchant_id: 'G706699487',
//   gross_amount: '105000.00',
//   fraud_status: 'accept',
//   currency: 'IDR'
// }