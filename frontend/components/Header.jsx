"use client";

import { useTranslations } from "next-intl";
import { useLanguage } from "../context/LanguageContext";
import Link from "next/link";
import CartButton from "./CartButton";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, loading } = useAuth();
  const t = useTranslations("Header");
  const { locale, changeLanguage } = useLanguage();

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
          {t("home")}
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
            {t("products")}
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
              {t("helcome")}, {user.name}
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

          <select
            value={locale}
            onChange={(event) =>
              changeLanguage(
                event.target.value
              )
            }
          >
            <option value="en">
              English
            </option>

            <option value="pt">
              Português
            </option>
          </select>
        </nav>
      </div>
    </header>
  );
}