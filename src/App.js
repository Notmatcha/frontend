import React, { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(
  "pk_test_51RidTp09Hm6VCHXtcGjRbrAdCoCabLJssiPsixstWurIvIdOogNjsjAsPdkaxPVOjjcFHE4Gz6c4kIuGFuFZkBpJ00OwQhJRpA"
);

function App() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("johns@example.com");
  const [password, setPassword] = useState("password123");
  const [customerId, setCustomerId] = useState('');

  const login = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
        { email, password }
      );
      setToken(res.data.token);
      setCustomerId(res.data.user.stripeCustomerId);
      alert("✅ Login successful");
    } catch (err) {
      alert("❌ Login failed");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={login}>Login</button>

      <h2>Payment</h2>
      {token ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm token={token} amount={199} customerId={customerId} /> {/* $1.99 SGD */}
        </Elements>
      ) : (
        <p>Please log in to make a payment.</p>
      )}
    </div>
  );
}

export default App;
