import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: ["300"], // Light
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
});

export const metadata = {
  title: "QR GENERATOR",
  description: "Generated your QR Code for PromptPay",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${kanit.variable} font-sans`}>{children}</body>
    </html>
  );
}
