"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useRouter,
  useSearchParams
} from "next/navigation";

import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(email, password);

      const redirect =
        searchParams.get("redirect") ||
        "/account";

      router.push(redirect);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "420px",
        margin: "60px auto",
        padding: "20px"
      }}
    >
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: 0,
            borderRadius: "8px",
            background: "#111",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          {loading
            ? "Signing in..."
            : "Login"}
        </button>
      </form>

      <p>
        Don't have an account?{" "}
        <Link href="/register">
          Create account
        </Link>
      </p>
    </main>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  marginBottom: "15px"
};