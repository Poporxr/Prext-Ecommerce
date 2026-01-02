import CartNavBar from "./NavBar";

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CartNavBar />
      {children}
    </>
  );
}
