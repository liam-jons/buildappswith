import { metadata } from "./metadata";

export { metadata };

export default function NewLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}