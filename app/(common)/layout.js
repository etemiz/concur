import localFont from "next/font/local";
import "../globals.css";
import { Roboto } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import ThemeWrapper from "../components/ThemeWrapper";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
});

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Pick a Brain",
  description:
    "Making more helpful, human oriented, high privacy AI as part of symbiotic intelligence vision that will align AI with humans in a better way.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ThemeWrapper>
        <body
          className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900`}
        >
          {children}
          <Toaster />
          <Analytics />
        </body>
      </ThemeWrapper>
    </html>
  );
}
