import type { Metadata } from "next";
import "../globals.css";
import CartNavBar from "./NavBar";



export const metadata: Metadata = {
  title: "Prext | Ecommerce",
  description:
    "Shop quality products at unbeatable prices. Discover electronics, fashion, home essentials, and more with fast delivery, secure payments, and excellent customer support. Your one-stop online store for all your needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
<body>
<CartNavBar />
          {children}
</body>
    </html>
  );
}
