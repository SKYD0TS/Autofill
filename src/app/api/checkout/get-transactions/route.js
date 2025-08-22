import { db } from "@/app/lib/db-helpers";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST() {
    const session = await getServerSession(authOptions)
    const email = session.user.email
    const user = await db.findOne("google_user",{email})
    const transactions = await db.query(
        `SELECT * FROM token_purchase 
        WHERE google_user_id = ? 
        ORDER BY purchase_date DESC`,
        [user.id]
    );

    return NextResponse.json({ transactions: transactions })
}