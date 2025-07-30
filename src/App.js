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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [customerId, setCustomerId] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const signup = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/signup`,
        {
          name,
          email,
          phone,
          password,
        }
      );
      alert("Signup successful! Please log in.");
      setIsSignup(false); // switch to login view
    } catch (err) {
      alert("Signup failed");
      console.error(err);
    }
  };
  const login = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
        { email, password }
      );
      setToken(res.data.token);
      setCustomerId(res.data.user.stripeCustomerId);
      alert(" Login successful");
    } catch (err) {
      alert(" Login failed");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>{isSignup ? "Sign Up" : "Login"}</h2>

      {isSignup && (
        <>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", marginBottom: "0.5rem" }}
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ display: "block", marginBottom: "0.5rem" }}
          />
        </>
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem" }}
      />

      <button onClick={isSignup ? signup : login} style={{ marginRight: "1rem" }}>
        {isSignup ? "Sign Up" : "Login"}
      </button>

      <button onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? "Switch to Login" : "Switch to Signup"}
      </button>

      <h2 style={{ marginTop: "2rem" }}>Payment</h2>
      {token ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm token={token} amount={199} customerId={customerId} />
        </Elements>
      ) : (
        <p>Please log in to make a payment.</p>
      )}
    </div>
  );
}

export default App;
