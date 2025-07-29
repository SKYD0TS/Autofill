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