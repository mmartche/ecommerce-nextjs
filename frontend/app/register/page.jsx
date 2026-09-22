"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useTranslations } from "next-intl";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("Register");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;


    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        t("passwordMismatch")
      );
      return;
    }

    if (
      form.password.length < 8
    ) {
      setError(
        t("passwordLength")
      );
      return;
    }

    try {
      setLoading(true);

      await apiPost(
        `${API_URL}/api/auth/register`,
        {
          name:
            form.name.trim(),

          email:
            form.email.trim(),

          password:
            form.password,
        }
      );

      router.push("/login");
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }


  }

  return (
    <main
      style={{
        maxWidth: "420px",
        margin: "60px auto",
        padding: "20px",
      }}
    > <h1>
        {t("title")} </h1>


      <form
        onSubmit={
          handleSubmit
        }
      >
        <input
          name="name"
          type="text"
          placeholder={
            t("name")
          }
          value={
            form.name
          }
          onChange={
            handleChange
          }
          required
          style={
            inputStyle
          }
        />

        <input
          name="email"
          type="email"
          placeholder={
            t("email")
          }
          value={
            form.email
          }
          onChange={
            handleChange
          }
          required
          style={
            inputStyle
          }
        />

        <input
          name="password"
          type="password"
          placeholder={
            t("password")
          }
          value={
            form.password
          }
          onChange={
            handleChange
          }
          required
          style={
            inputStyle
          }
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder={t("confirmPassword")}
          value={form.confirmPassword}
          onChange={
            handleChange
          }
          required
          style={
            inputStyle
          }
        />

        {error && (
          <p
            style={{
              color: "red",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={
            loading
          }
          style={{
            width: "100%",
            padding: "14px",
            cursor:
              loading
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading
            ? t("loading")
            : t("submit")}
        </button>
      </form>

      <p>
        {t("alreadyAccount")}{" "}
        <Link href="/login">
          {t("login")}
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