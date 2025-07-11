"use client"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import '@/app/the/modal.css'
import { createPortal } from "react-dom"

export default function CheckoutModal({ open, onClose }) {
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
    if (quantity < 100) setPrice(500)
    else if (quantity < 300) setPrice(400)
    else setPrice(350)
  }, [quantity])

  async function handleSubmit() {
    const data = {
      quantity,
      price,
      voucher_code: voucher,
      email: session?.user.email,
    }

    const response = await fetch("/api/checkout/create-transaction", {
      method: "POST",
      body: JSON.stringify(data)
    })
    const tokenFetch = await response.json()
    console.log(tokenFetch)
    if (tokenFetch.success) {
      getTransactions()
      window.snap.pay(tokenFetch.token)
    } else {
      console.log(tokenFetch.error)
    }
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
    const snapTokenFetch = await fetch("/api/checkout/get-token", {
      method: "POST",
      body: JSON.stringify({ order_id })
    })
    const snapToken = await snapTokenFetch.json()
    window.snap.pay(snapToken.token)
  }

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY)
    script.async = true
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

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
                    <span className="transaction-date">{transaction.purchase_date}</span>
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