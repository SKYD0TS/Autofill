"use client"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import '@/components/modal.css'
import { createPortal } from "react-dom"

export default function CheckoutModal({ open, onClose, qty = 1 }) {
  const [quantity, setQuantity] = useState(1)
  const [voucher, setVoucher] = useState("")
  const [discount, setDiscount] = useState(0)
  const [price, setPrice] = useState(500)
  const [transactions, setTransactions] = useState([])

  const { data: session, status: sessionStatus } = useSession()

  async function getTransactions() {
    const getTransactions = await fetch("/api/checkout/get-transactions", {
      method: "POST",
      body: JSON.stringify({ email: session?.user?.email })
    })
    const transactionsFetch = await getTransactions.json()
    setTransactions(transactionsFetch.transactions)
  }

  useEffect(() => {
    if (session?.error) signOut({ callbackUrl: "/" })
    if (session?.user?.email) getTransactions()
  }, [session])
  useEffect(() => {
    if (open) {
      setQuantity(qty);
    }
  }, [qty, open]);

  useEffect(() => {
    if (quantity < 100) setPrice(500)
    else if (quantity < 300) setPrice(400)
    else setPrice(350)
  }, [quantity])

  async function handleSubmit() {
    if (!window.snap) {
      console.error("Midtrans Snap is not loaded yet");
      alert("Payment system is not ready. Please try again later.");
      return;
    }

    const data = {
      quantity,
      price,
      voucher_code: voucher,
      email: session?.user.email,
    };

    const response = await fetch("/api/checkout/create-transaction", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const tokenFetch = await response.json();
    if (tokenFetch.success) {
      getTransactions();
      window.snap.pay(tokenFetch.token);
    } else {
      console.log(tokenFetch.error);
    }
  }

  async function handleGetTransactionToken(order_id) {
    if (quantity < 1) {
      alert(`Tidak bisa membeli token dengan jumlah ${quantity}`);
      return;
    }
    if (!window.snap) {
      console.error("Midtrans Snap is not loaded yet");
      alert("Payment system is not ready. Please try again later.");
      return;
    }

    const snapTokenFetch = await fetch("/api/checkout/get-token", {
      method: "POST",
      body: JSON.stringify({ order_id }),
    });
    const snapToken = await snapTokenFetch.json();
    console.log(snapToken);
    window.snap.pay(snapToken.token);
  }

  async function handleVoucher() {
    if (!voucher) return
    const response = await fetch("/api/checkout/get-voucher", {
      method: "POST",
      body: JSON.stringify({ voucher_code: voucher })
    })
    const { discount, status } = await response.json()
    if (status === "not found") return alert("voucher not found")
    setDiscount(discount)
  }

  async function handleGetTransactionToken(order_id) {
    if (quantity < 1) {
      alert(`tidak bisa membeli token dengan jumlah ${quantity}`)
      return
    }
    const snapTokenFetch = await fetch("/api/checkout/get-token", {
      method: "POST",
      body: JSON.stringify({ order_id })
    })
    const snapToken = await snapTokenFetch.json()
    window.snap.pay(snapToken.token)
  }

  useEffect(() => {
    if (!window.snap) {
      const script = document.createElement("script");
      script.src = process.env.NEXT_PUBLIC_MT_SCRIPT_SRC;
      script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
      script.async = true;
      script.onload = () => {
        console.log("Midtrans Snap script loaded successfully");
      };
      script.onerror = () => {
        console.error("Failed to load Midtrans Snap script");
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  if (!open) return null

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h1>Checkout</h1>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="modal-body">
          <div className="form-section">
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Voucher:</label>
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
              />
              <button onClick={handleVoucher} className="voucher-btn">Use Voucher</button>
            </div>
            <div className="summary">
              <p>Price per token: Rp.{price}</p>
              <p>Subtotal: Rp.{price * quantity}</p>
              {discount > 0 && <p className="discount">Discount: {discount}%</p>}
              <p>Total: Rp.{(price * quantity) - ((price * quantity) * (discount / 100))}</p>
            </div>
            <button onClick={handleSubmit} className="buy-btn">BUY</button>
          </div>
          <div className="transactions-section">
            <h2>Your Transactions</h2>
            <ul className="transactions">
              {transactions.map((transaction) => (
                <li key={transaction.purchase_id}
                  className={`transaction-item ${transaction.purchase_status === "unpaid" ? "unpaid" : "paid"}`}
                >
                  <div className="transaction-details">
                    <span>Token: {transaction.token_amount} - Rp.{transaction.purchase_amount}</span>
                    <span className="transaction-date">{new Date(transaction.purchase_date).toLocaleString("local", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: "UTC",
                      timeZoneName: "short"
                    })
                    }</span>
                  </div>
                  {transaction.purchase_status === "unpaid" && (
                    <button className="open-btn"
                      onClick={() => handleGetTransactionToken(transaction.purchase_id)}
                    >
                      Pay
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )

  function handleQuantityChange(value) {
    value = parseInt(value)
    if (isNaN(value) || value < 1) setQuantity(1)
    else if (value > 1000) setQuantity(1000)
    else setQuantity(value)
  }
}