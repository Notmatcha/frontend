import React, { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51RidTp09Hm6VCHXtcGjRbrAdCoCabLJssiPsixstWurIvIdOogNjsjAsPdkaxPVOjjcFHE4Gz6c4kIuGFuFZkBpJ00OwQhJRpA");

function CheckoutForm({ amount, token, customerId }) {
  const formRef = useRef(null);
  const messageRef = useRef(null);
  const cardElementRef = useRef(null);

  const [clientSecret, setClientSecret] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cardElement = null;
    
    const initStripe = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);

      try {
        const response = await fetch("http://localhost:5000/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount, currency: "sgd", customerId }),
        });

        const data = await response.json();
        setClientSecret(data.clientSecret);

        const elements = stripeInstance.elements();
        const cardElement = elements.create("card");
        cardElement.mount(cardElementRef.current);
        setCard(cardElement);
      } catch (error) {
        messageRef.current.textContent = "Failed to initialize payment.";
        console.error(error);
      }
    };

    initStripe();
    return () => {
      if (cardElement) {
        cardElement.destroy(); // ✅ unmount on cleanup
      }
    };
  }, [amount, token, customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !card || !clientSecret) return;

    setLoading(true);
    messageRef.current.textContent = "";

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      messageRef.current.textContent = `❌ ${error.message}`;
    } else if (paymentIntent.status === "succeeded") {
      messageRef.current.textContent = "✅ Payment successful!";
      card.clear();
    } else {
      messageRef.current.textContent = "⚠️ Payment failed or pending.";
    }

    setLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} ref={formRef}>
      <div id="card-element" ref={cardElementRef} style={{ marginBottom: "1rem" }} />
      <button type="submit" disabled={loading || !stripe || !card}>
        {loading ? "Processing..." : `Pay $${(amount).toFixed(2)}`}
      </button>
      <p id="payment-message" ref={messageRef} style={{ marginTop: "1rem" }} />
    </form>
  );
}

export default CheckoutForm;
