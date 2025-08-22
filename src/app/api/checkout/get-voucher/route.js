import { db } from "@/app/lib/db-helpers";
import { NextResponse } from "next/server";
export async function POST(req) {
    const {voucher_code} = await req.json();

    let voucher
    try {
        voucher = await db.findOne('voucher', {voucher_code});
    } catch (error) {
        console.error("Error fetching token:", error);
        return NextResponse.json({ error: "Internal server error", status: 500 })
    }
    if(voucher == null || voucher == undefined){
        return NextResponse.json({status:"not found",discount:0})
    }

    // return NextResponse.json(voucher.discount_percentage)
    return NextResponse.json({status:"success",discount:voucher.discount_percentage})

}