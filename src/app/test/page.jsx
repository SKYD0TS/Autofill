"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

export default function Home() {
    const { data: session, SessionStatus } = useSession()
    const [tokenAmount, setTokenAmount] = useState(0)
    const [voucherCode, setVoucherCode] = useState("")

    const onSubmit = async () => {
        try {
            const response = await fetch('/api/transaction/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voucherCode:voucherCode,tokenAmount:tokenAmount,email: session.user.email }), // Send the URLs in the request body
            });

            const data = await response.json();
            if (response.ok) {
                console.log(data.message); // Success message
            } else {
                console.log(data.failedRequests); // Display failed URLs
            }
        } catch (error) {
            console.log('Failed to fetch data', error);
        }
    }
    return (
        <div>
            <h2>Token</h2>
            <input type="number" min={1} value={tokenAmount} onChange={(e) => { e.target.value > 0 ? setTokenAmount(e.target.value) : null }} /> <label>token</label>
            <input type="text" value={voucherCode} onChange={(e) => { setVoucherCode(e.target.value) }} /> <label>Voucher</label>
            <button onClick={()=>{onSubmit()}}>Purchase</button>
        </div>
    )

}
