import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req) {
    const {voucher_code} = await req.json();

    let voucher
    try {
        voucher = await prisma.voucher.findFirst({
            where: { voucher_code },
        });

    } catch (error) {
        console.error("Error fetching token:", error);
        return NextResponse.json({ error: "Internal server error", status: 500 })
    }
    if(voucher == null){
        return NextResponse.json({status:"not found",discount:0})
    }

    // return NextResponse.json(voucher.discount_percentage)
    return NextResponse.json({status:"success",discount:voucher.discount_percentage})

}