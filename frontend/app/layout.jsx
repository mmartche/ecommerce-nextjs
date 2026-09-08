import Header from "../components/Header";
import { AuthProvider } from "../context/AuthContext";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata = {
  title: "My E-commerce",
  description: "Custom 3D printed products"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#fff",
          color: "#111"
        }}
      >
        <AuthProvider>
          <Header />

          {children}
        </AuthProvider>
      </body>
      <GoogleAnalytics
        gaId={process.env.NEXT_PUBLIC_GA_ID}
      />
    </html>
  );
}