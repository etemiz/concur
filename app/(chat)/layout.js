import localFont from "next/font/local";
import "../globals.css";
import { Roboto } from 'next/font/google';
import MyLayout from "./mylayout";

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['100', '300', '400', '500', '700', '900'],
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
  title: "Conscious Curations",
  description: "Conscious Curations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-[#F4F4F5] dark:bg-[#18181B] fixed top-0 right-0 bottom-0 left-0`}
      >
        <MyLayout>
          {children}
        </MyLayout>
      </body>
    </html>
  );
}
