"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderSuccessPage() {
  const params =
    useParams();

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "60px auto",
        padding: "24px",
      }}
    >
      <h1>
        Order received
      </h1>

      <p>
        Thank you. Your order
        has been created
        successfully.
      </p>

      <p>
        Order:
        {" "}
        <strong>
          #{params.id}
        </strong>
      </p>

      <p>
        Payment is currently
        pending.
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "24px",
        }}
      >
        <Link
          href={`/orders/${params.id}`}
        >
          View order
        </Link>

        <Link href="/products">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}