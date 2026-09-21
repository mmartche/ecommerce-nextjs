import Header from "../components/Header";
import { AuthProvider } from "../context/AuthContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ToastProvider } from "../context/ToastContext";
import { LanguageProvider } from "../context/LanguageContext";
import { cookies } from "next/headers";

export const metadata = {
  title: "My E-commerce",
  description: "Custom 3D printed products"
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();

  const initialLocale =
    cookieStore.get(
      "NEXT_LOCALE"
    )?.value || "en";

  return (
    <html lang={initialLocale}>
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#fff",
          color: "#111"
        }}
      >
        <LanguageProvider
          initialLocale={
            initialLocale
          }
        >
          <ToastProvider>
            <AuthProvider>
              <Header />

              {children}
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>

        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_ID}
        />
      </body>
    </html>
  );
}