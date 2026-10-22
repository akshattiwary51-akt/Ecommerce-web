import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import axios from 'axios'
import toast from 'react-hot-toast'
import { clearCartItems } from '../../store/slices/cartSlice'

const API = import.meta.env.VITE_API_URL // or process.env.REACT_APP_BACKEND_URL

// ---------- Inner form ----------
function StripeForm({ orderId }) {
  const stripe = useStripe()
  const elements = useElements()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setErrorMsg('')

    // 1. Confirm payment with Stripe (no redirect — handle inline)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}`,
      },
    })

    if (error) {
      setErrorMsg(error.message || 'Payment failed')
      setSubmitting(false)
      return
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // 2. Tell backend to mark order paid (server re-verifies via Stripe API)
      try {
        await axios.post(
          `${API}/payment/stripe/confirm`,
          { orderId, paymentIntentId: paymentIntent.id },
          { withCredentials: true }
        )
        await dispatch(clearCartItems())
        toast.success('Payment successful!')
        navigate(`/orders/${orderId}`)
      } catch (err) {
        toast.error('Payment captured but confirmation failed. Contact support.')
        navigate(`/orders/${orderId}`)
      }
    } else {
      setErrorMsg(`Payment status: ${paymentIntent?.status || 'unknown'}`)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="stripe-payment-form">
      <PaymentElement />
      {errorMsg && (
        <p
          style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}
          data-testid="stripe-error-message"
        >
          {errorMsg}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary btn-full"
        style={{ marginTop: 20 }}
        disabled={!stripe || submitting}
        data-testid="stripe-pay-button"
      >
        {submitting ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  )
}

// ---------- Page wrapper ----------
export default function StripeCheckout() {
  const { orderId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  // Either reuse what was passed via navigate(state), or re-create the intent
  const [clientSecret, setClientSecret] = useState(location.state?.clientSecret || '')
  const [publishableKey, setPublishableKey] = useState(location.state?.publishableKey || '')
  const [loading, setLoading] = useState(!location.state?.clientSecret)

  useEffect(() => {
    if (clientSecret && publishableKey) return
    // Direct visit / refresh — re-create the intent
    ;(async () => {
      try {
        const { data } = await axios.post(
          `${API}/payment/stripe/create-intent`,
          { orderId },
          { withCredentials: true }
        )
        setClientSecret(data.clientSecret)
        setPublishableKey(data.publishableKey)
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Could not initialise payment')
        navigate(`/orders/${orderId}`)
      } finally {
        setLoading(false)
      }
    })()
     }, [orderId, clientSecret, publishableKey, navigate])

  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  )

  if (loading || !clientSecret || !stripePromise) {
    return (
      <div className="container" style={{ maxWidth: 520, padding: '3rem 1rem' }}>
        <p data-testid="stripe-loading">Initialising secure payment…</p>
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: { theme: 'stripe', variables: { colorPrimary: '#2563eb' } },
  }

  return (
    <div className="container" style={{ maxWidth: 520, padding: '2rem 1rem' }}>
      <h1 className="page-title" style={{ marginBottom: 24 }}>
        Secure Payment
      </h1>
       <div className="card" style={{ padding: '1.5rem' }}>
        <Elements stripe={stripePromise} options={options}>
          <StripeForm orderId={orderId} />
        </Elements>
      </div>
      <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 16 }}>
        Powered by Stripe · 256-bit SSL encrypted
      </p>
    </div>
  )
}