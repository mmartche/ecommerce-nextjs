"use client";

import Link from "next/link";
import CartButton from "./CartButton";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header
      style={{
        borderBottom: "1px solid #e5e5e5",
        background: "#fff"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#111",
            fontSize: "22px",
            fontWeight: "700"
          }}
        >
          My E-commerce
        </Link>

        <nav
          style={{
            display: "flex",
            gap: "25px",
            alignItems: "center"
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#111"
            }}
          >
            Products
          </Link>

          <CartButton />

          {!loading && !user && (
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                color: "#111"
              }}
            >
              Login
            </Link>
          )}

          {!loading && user && (
            <Link
              href="/account"
              style={{
                textDecoration: "none",
                color: "#111",
                fontWeight: "600"
              }}
            >
              Hello, {user.name}
            </Link>
          )}

          {!loading &&
            user?.role === "ADMIN" && (
              <Link
                href="/admin"
                style={{
                  textDecoration: "none",
                  color: "#111",
                  fontWeight: "600"
                }}
              >
                Admin
              </Link>
            )}
          {!loading &&
            user?.role === "ADMIN" && (
              <Link
                href="/admin/products"
                style={{
                  textDecoration: "none",
                  color: "#111",
                  fontWeight: "600"
                }}>
                | Products |
              </Link>
            )}
        </nav>
      </div>
    </header>
  );
}