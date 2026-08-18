export const metadata = {
  title: "My E-commerce",
  description: "Next.js e-commerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
