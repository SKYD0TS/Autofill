import { db } from "@/app/lib/db-helpers";
import { NextResponse } from "next/server";

export async function POST(req) {
    let notif = await req.json();
    // notif.order_id = 84 // !ALERT dev test
    if (notif.transaction_status === "settlement") {
        const tokenTransaction = await db.transaction(async (tx) => {
            // 1. find order
            const order = await tx.findOne("token_purchase", {
                purchase_id: parseInt(notif.order_id),
            });
            if (!order) throw new Error("Order not found");

            // 2. update order -> paid
            await tx.updateOne(
                "token_purchase",
                { purchase_id: order.purchase_id },
                { purchase_status: "paid" }
            );

            // 3. get user (joined info: google_user + token)
            const user = await tx.findOne("google_user", {
                id: order.google_user_id,
            });
            if (!user) throw new Error("User not found");

            const token = await tx.findOne("token", {
                token_id: user.id,
            });
            if (!token){
                throw new Error("Token not found")
                // return NextResponse.json({ message: "success" });
            };

            // 4. update token balance
            await tx.updateOne(
                "token",
                { token_id: token.token_id },
                {
                    token_count: parseInt(token.token_count) + order.token_amount,
                }
            );

            return { order, user, token };
        });
    }

    return NextResponse.json({ message: "success" });
}
