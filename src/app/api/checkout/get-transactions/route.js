import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req) {
    const request = await req.json()
    const user = await prisma.googleUser.findFirst({
        where: {email:request.email},
        include:{tokenPurchases:{orderBy:{purchase_date:"desc"}}}
    })

    return NextResponse.json({transactions:user.tokenPurchases})
}