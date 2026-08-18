import Link from "next/link";
import CartButton from "./CartButton";

export default function Header() {
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
        </nav>
      </div>
    </header>
  );
}